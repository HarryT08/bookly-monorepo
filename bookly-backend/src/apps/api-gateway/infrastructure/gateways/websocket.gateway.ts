/**
 * WebSocket Gateway for Bookly Event-Driven Architecture
 * Handles real-time communication between frontend and backend
 */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';
import { LoggingService } from '@libs/logging/logging.service';
import {
  BooklyEventDto,
  RoomSubscriptionDto,
  ConnectionState,
  ReservationEventDto,
  ResourceEventDto,
  NotificationSentEventDto,
  SystemEventDto,
  WebSocketErrorDto,
  RealtimeMetricsDto,
} from '@libs/dto/websocket/websocket-events.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  roles?: string[];
  customRooms?: Set<string>;
}

interface WebSocketMetrics {
  connectionsCount: number;
  messagesCount: number;
  errorsCount: number;
  eventsPerSecond: number;
  lastUpdated: string;
}

@WebSocketGateway({
  port: parseInt(process.env.WEBSOCKET_PORT || '3000'),
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/',
})
@Injectable()
export class BooklyWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BooklyWebSocketGateway.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();
  private readonly userRooms = new Map<string, Set<string>>();
  private readonly metrics: WebSocketMetrics = {
    connectionsCount: 0,
    messagesCount: 0,
    errorsCount: 0,
    eventsPerSecond: 0,
    lastUpdated: new Date().toISOString(),
  };

  constructor(
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {
    this.setupEventHandlers();
  }

  /**
   * Handle new client connections
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.sendError(client, 'AUTH_REQUIRED', 'Authentication token required');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub || payload.userId;
      client.roles = payload.roles || [];
      client.customRooms = new Set();

      // Store authenticated client
      this.connectedClients.set(client.id, client);
      this.metrics.connectionsCount = this.connectedClients.size;

      // Join user-specific room
      if (client.userId) {
        const userRoom = `user:${client.userId}`;
        client.join(userRoom);
        client.customRooms?.add(userRoom);
        
        // Track user rooms
        if (!this.userRooms.has(client.userId)) {
          this.userRooms.set(client.userId, new Set());
        }
        this.userRooms.get(client.userId)!.add(client.id);
      }

      this.logger.log(`Client connected: ${client.id} (User: ${client.userId})`);
      
      // Send connection confirmation
      client.emit('connection-confirmed', {
        status: 'connected' as ConnectionState,
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Connection failed for client ${client.id}:`, error);
      this.sendError(client, 'AUTH_FAILED', 'Authentication failed');
      client.disconnect();
    }
  }

  /**
   * Handle client disconnections
   */
  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id} (User: ${client.userId})`);
    
    // Remove from tracking
    this.connectedClients.delete(client.id);
    this.metrics.connectionsCount = this.connectedClients.size;

    // Remove from user rooms
    if (client.userId && this.userRooms.has(client.userId)) {
      this.userRooms.get(client.userId)!.delete(client.id);
      if (this.userRooms.get(client.userId)!.size === 0) {
        this.userRooms.delete(client.userId);
      }
    }
  }

  /**
   * Handle room subscription requests
   */
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() subscription: RoomSubscriptionDto,
  ) {
    try {
      if (!await this.validateRoomAccess(client, subscription)) {
        this.sendError(client, 'ACCESS_DENIED', `Access denied to room: ${subscription.roomType}:${subscription.roomId}`);
        return;
      }

      const roomName = `${subscription.roomType}:${subscription.roomId}`;
      client.join(roomName);
      client.customRooms?.add(roomName);

      client.emit('room-joined', {
        roomType: subscription.roomType,
        roomId: subscription.roomId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Client ${client.id} joined room: ${roomName}`);
    } catch (error) {
      this.logger.error(`Failed to join room for client ${client.id}:`, error);
      this.sendError(client, 'ROOM_JOIN_FAILED', 'Failed to join room');
    }
  }

  /**
   * Handle room unsubscription requests
   */
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() subscription: RoomSubscriptionDto,
  ) {
    const roomName = `${subscription.roomType}:${subscription.roomId}`;
    client.leave(roomName);
    client.customRooms?.delete(roomName);

    client.emit('room-left', {
      roomType: subscription.roomType,
      roomId: subscription.roomId,  
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Client ${client.id} left room: ${roomName}`);
  }

  /**
   * Send error message to client
   */
  private sendError(client: AuthenticatedSocket, code: string, message: string) {
    const error: WebSocketErrorDto = {
      code,
      message,
      timestamp: new Date().toISOString(),
    };

    client.emit('error', error);
    this.metrics.errorsCount++;
  }

  /**
   * Broadcast event to specific room
   */
  private async broadcastToRoom(roomName: string, event: BooklyEventDto) {
    this.server.to(roomName).emit('event', event);
    this.logger.debug(`Broadcasted event ${event.type} to room: ${roomName}`);
  }

  /**
   * Broadcast event to specific user
   */
  private async broadcastToUser(userId: string, event: BooklyEventDto) {
    const userRoom = `user:${userId}`;
    this.server.to(userRoom).emit('event', event);
    this.logger.debug(`Broadcasted event ${event.type} to user: ${userId}`);
  }

  /**
   * Setup event handlers for domain events
   */
  private setupEventHandlers() {
    // Register handlers for different event types
    this.eventBus.registerHandler('reservation.created', this.handleReservationEvents.bind(this));
    this.eventBus.registerHandler('reservation.updated', this.handleReservationEvents.bind(this));
    this.eventBus.registerHandler('reservation.cancelled', this.handleReservationEvents.bind(this));
    this.eventBus.registerHandler('reservation.approved', this.handleReservationEvents.bind(this));

    this.eventBus.registerHandler('resource.created', this.handleResourceEvents.bind(this));
    this.eventBus.registerHandler('resource.updated', this.handleResourceEvents.bind(this));
    this.eventBus.registerHandler('resource.deleted', this.handleResourceEvents.bind(this));

    this.eventBus.registerHandler('notification.sent', this.handleNotificationEvents.bind(this));
    this.eventBus.registerHandler('notification.system', this.handleNotificationEvents.bind(this));

    this.eventBus.registerHandler('system.maintenance', this.handleSystemEvents.bind(this));
    this.eventBus.registerHandler('system.error', this.handleSystemEvents.bind(this));
  }

  // Convert DomainEvent to WebSocket event format
  private convertDomainEventToWebSocketEvent(domainEvent: DomainEvent): BooklyEventDto | null {
    try {
      // Map domain event types to WebSocket event types
      const eventTypeMap: Record<string, string> = {
        'reservation.created': 'reservation.created',
        'reservation.updated': 'reservation.updated', 
        'reservation.cancelled': 'reservation.cancelled',
        'resource.created': 'resource.created',
        'resource.updated': 'resource.updated',
        'resource.deleted': 'resource.deleted',
        'notification.sent': 'notification.sent',
        'system.maintenance': 'system.maintenance',
      };

      const wsEventType = eventTypeMap[domainEvent.eventType];
      if (!wsEventType) {
        return null; // Skip unmapped events
      }

      // Create base WebSocket event
      const wsEvent: BooklyEventDto = {
        type: wsEventType as any,
        timestamp: domainEvent.timestamp.toISOString(),
        eventId: domainEvent.eventId,
        ...domainEvent.eventData, // Spread the actual event data
      };

      return wsEvent;
    } catch (error) {
      this.logger.error('Failed to convert domain event to WebSocket event', error);
      return null;
    }
  }

  private async handleReservationEvents(domainEvent: DomainEvent): Promise<void> {
    const event = this.convertDomainEventToWebSocketEvent(domainEvent);
    if (!event || !event.type.startsWith('reservation.')) return;

    const reservationEvent = event as ReservationEventDto;
    
    // Broadcast to resource room
    if (reservationEvent.resourceId) {
      this.server.to(`resource:${reservationEvent.resourceId}`).emit('reservation-update', event);
    }
    
    // Broadcast to user room
    if (reservationEvent.userId) {
      this.server.to(`user:${reservationEvent.userId}`).emit('reservation-update', event);
    }
    
    // Broadcast to admin rooms
    this.server.to('admin').emit('reservation-update', event);
  }

  private async handleResourceEvents(domainEvent: DomainEvent): Promise<void> {
    const event = this.convertDomainEventToWebSocketEvent(domainEvent);
    if (!event || !event.type.startsWith('resource.')) return;

    const resourceEvent = event as ResourceEventDto;
    
    // Broadcast to resource room
    if (resourceEvent.resourceId) {
      this.server.to(`resource:${resourceEvent.resourceId}`).emit('resource-update', event);
    }
    
    // Broadcast to global room
    this.server.to('global').emit('resource-update', event);
    
    // Broadcast to admin rooms
    this.server.to('admin').emit('resource-update', event);
  }

  private async handleNotificationEvents(domainEvent: DomainEvent): Promise<void> {
    const event = this.convertDomainEventToWebSocketEvent(domainEvent);
    if (!event || !event.type.startsWith('notification.')) return;

    const notificationEvent = event as NotificationSentEventDto;
    
    // Send to specific user
    if (notificationEvent.userId) {
      this.server.to(`user:${notificationEvent.userId}`).emit('notification', event);
    }
    
    // Note: NotificationSentEventDto only has type 'notification.sent'
    // System notifications would be handled separately as SystemEventDto
  }

  private async handleSystemEvents(domainEvent: DomainEvent): Promise<void> {
    const event = this.convertDomainEventToWebSocketEvent(domainEvent);
    if (!event || !event.type.startsWith('system.')) return;

    // Broadcast system events to all connected clients
    this.server.emit('system-update', event);
    
    // Also send to admin rooms
    this.server.to('admin').emit('system-update', event);
  }

  /**
   * Validate room access permissions
   */
  private async validateRoomAccess(
    client: AuthenticatedSocket,
    subscription: RoomSubscriptionDto,
  ): Promise<boolean> {
    const { roomType, roomId } = subscription;

    switch (roomType) {
      case 'user':
        // Users can only join their own user room
        return client.userId === roomId;

      case 'resource':
        // All authenticated users can join resource rooms
        return true;

      case 'admin':
        // Only admin roles can join admin rooms
        return client.roles?.some(role => 
          ['ADMIN_GENERAL', 'ADMIN_PROGRAMA'].includes(role)
        ) || false;

      case 'global':
        // All authenticated users can join global rooms
        return true;

      default:
        return false;
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection() {
    setInterval(() => {
      this.metrics.lastUpdated = new Date().toISOString();
      this.metrics.connectionsCount = this.connectedClients.size;
      
      // Reset events per second counter (could be improved with sliding window)
      this.metrics.eventsPerSecond = 0;
    }, 60000); // Update every minute
  }
}
