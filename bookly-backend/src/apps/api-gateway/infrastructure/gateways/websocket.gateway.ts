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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';
import { LoggingService } from '@libs/logging/logging.service';
import {
  BooklyEventDto,
  RoomSubscriptionDto,
  ConnectionState,
  ReservationEventDto,
  ReservationCreatedEventDto,
  ResourceEventDto,
  NotificationSentEventDto,
  SystemEventDto,
  WebSocketErrorDto,
  RealtimeMetricsDto,
} from '@libs/dto/websocket/websocket-events.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
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
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.setupEventHandlers();
    this.startMetricsCollection();
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

  // ========================================
  // CQRS WebSocket Message Handlers
  // ========================================

  /**
   * Handle real-time resource availability check via WebSocket
   */
  @SubscribeMessage('check-availability')
  async handleCheckAvailability(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      resourceId: string;
      startDate: string;
      endDate: string;
    }
  ) {
    try {
      this.metrics.messagesCount++;
      
      // Use CQRS to query availability service
      const result = await this.queryBus.execute({
        type: 'CheckAvailabilityQuery',
        service: 'availability-service',
        data: {
          resourceId: data.resourceId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        }
      });

      client.emit('availability-result', {
        requestId: `check-${Date.now()}`,
        result,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Availability check failed for client ${client.id}:`, error);
      this.sendError(client, 'AVAILABILITY_CHECK_FAILED', 'Failed to check availability');
    }
  }

  /**
   * Handle real-time reservation creation via WebSocket
   */
  @SubscribeMessage('create-reservation')
  async handleCreateReservation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      resourceId: string;
      startDate: string;
      endDate: string;
      title: string;
      description?: string;
    }
  ) {
    try {
      this.metrics.messagesCount++;

      if (!client.userId) {
        this.sendError(client, 'AUTH_REQUIRED', 'User authentication required');
        return;
      }

      // Use CQRS to create reservation via availability service
      const result = await this.commandBus.execute({
        type: 'CreateReservationCommand',
        service: 'availability-service',
        data: {
          ...data,
          userId: client.userId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        }
      });

      client.emit('reservation-created', {
        requestId: `create-${Date.now()}`,
        result,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to resource room
      const reservationCreatedEvent: ReservationCreatedEventDto = {
        type: 'reservation.created',
        reservationId: result.id || `temp-${Date.now()}`,
        resourceId: data.resourceId,
        resourceName: result.resourceName || 'Unknown Resource',
        userId: client.userId,
        purpose: data.title,
        status: 'PENDING',
        startTime: new Date(data.startDate).toISOString(),
        endTime: new Date(data.endDate).toISOString(),
        timestamp: new Date().toISOString(),
        eventId: `ws-${Date.now()}`,
        source: 'websocket'
      };
      this.broadcastToRoom(`resource:${data.resourceId}`, reservationCreatedEvent);

    } catch (error) {
      this.logger.error(`Reservation creation failed for client ${client.id}:`, error);
      this.sendError(client, 'RESERVATION_CREATION_FAILED', 'Failed to create reservation');
    }
  }

  /**
   * Handle real-time resource search via WebSocket
   */
  @SubscribeMessage('search-resources')
  async handleSearchResources(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      query?: string;
      type?: string;
      location?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      this.metrics.messagesCount++;

      // Use CQRS to search resources via resources service
      const result = await this.queryBus.execute({
        type: 'SearchResourcesQuery',
        service: 'resources-service',
        data: {
          query: data.query,
          filters: {
            type: data.type,
            location: data.location,
            isActive: data.isActive,
          },
          pagination: {
            page: data.page || 1,
            limit: data.limit || 10,
          }
        }
      });

      client.emit('search-results', {
        requestId: `search-${Date.now()}`,
        result,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Resource search failed for client ${client.id}:`, error);
      this.sendError(client, 'SEARCH_FAILED', 'Failed to search resources');
    }
  }

  /**
   * Handle real-time approval request via WebSocket
   */
  @SubscribeMessage('request-approval')
  async handleRequestApproval(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      reservationId: string;
      requestType: string;
      comments?: string;
    }
  ) {
    try {
      this.metrics.messagesCount++;

      if (!client.userId) {
        this.sendError(client, 'AUTH_REQUIRED', 'User authentication required');
        return;
      }

      // Use CQRS to request approval via stockpile service
      const result = await this.commandBus.execute({
        type: 'RequestApprovalCommand',
        service: 'stockpile-service',
        data: {
          ...data,
          requesterId: client.userId,
        }
      });

      client.emit('approval-requested', {
        requestId: `approval-${Date.now()}`,
        result,
        timestamp: new Date().toISOString(),
      });

      // Notify admin rooms
      this.broadcastToRoom('admin', {
        type: 'approval.requested',
        requesterId: client.userId,
        reservationId: data.reservationId,
        timestamp: new Date().toISOString(),
        eventId: `ws-${Date.now()}`,
        source: 'websocket'
      });

    } catch (error) {
      this.logger.error(`Approval request failed for client ${client.id}:`, error);
      this.sendError(client, 'APPROVAL_REQUEST_FAILED', 'Failed to request approval');
    }
  }

  /**
   * Handle real-time metrics query via WebSocket
   */
  @SubscribeMessage('get-metrics')
  async handleGetMetrics(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      type: 'dashboard' | 'usage' | 'performance';
      timeRange?: string;
      filters?: any;
    }
  ) {
    try {
      this.metrics.messagesCount++;

      // Check if user has admin permissions
      const hasAdminRole = client.roles?.some(role => 
        ['ADMIN_GENERAL', 'ADMIN_PROGRAMA'].includes(role)
      );

      if (!hasAdminRole) {
        this.sendError(client, 'INSUFFICIENT_PERMISSIONS', 'Admin permissions required');
        return;
      }

      // Use CQRS to get metrics via reports service
      const result = await this.queryBus.execute({
        type: 'GetMetricsQuery',
        service: 'reports-service',
        data: {
          type: data.type,
          timeRange: data.timeRange || '24h',
          filters: data.filters,
        }
      });

      client.emit('metrics-result', {
        requestId: `metrics-${Date.now()}`,
        result,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Metrics query failed for client ${client.id}:`, error);
      this.sendError(client, 'METRICS_QUERY_FAILED', 'Failed to get metrics');
    }
  }

  /**
   * Handle real-time notification sending via WebSocket
   */
  @SubscribeMessage('send-notification')
  async handleSendNotification(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      userId: string;
      message: string;
      channels?: string[];
      priority?: string;
    }
  ) {
    try {
      this.metrics.messagesCount++;

      // Check if user has permission to send notifications
      const hasPermission = client.roles?.some(role => 
        ['ADMIN_GENERAL', 'ADMIN_PROGRAMA', 'VIGILANTE'].includes(role)
      );

      if (!hasPermission) {
        this.sendError(client, 'INSUFFICIENT_PERMISSIONS', 'Permission to send notifications required');
        return;
      }

      // Use CQRS to send notification via stockpile service
      const result = await this.commandBus.execute({
        type: 'SendNotificationCommand',
        service: 'stockpile-service',
        data: {
          ...data,
          senderId: client.userId,
        }
      });

      client.emit('notification-sent', {
        requestId: `notification-${Date.now()}`,
        result,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to target user
      this.broadcastToUser(data.userId, {
        type: 'notification.sent',
        notificationId: `notif-${Date.now()}`,
        recipientId: data.userId,
        channel: 'PUSH',
        status: 'sent',
        message: data.message,
        timestamp: new Date().toISOString(),
        eventId: `ws-${Date.now()}`,
        source: 'websocket'
      });

    } catch (error) {
      this.logger.error(`Notification sending failed for client ${client.id}:`, error);
      this.sendError(client, 'NOTIFICATION_SEND_FAILED', 'Failed to send notification');
    }
  }

  /**
   * Handle WebSocket ping for connection health check
   */
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
      connectionId: client.id,
      userId: client.userId,
    });
  }

  /**
   * Handle WebSocket metrics request
   */
  @SubscribeMessage('get-connection-metrics')
  async handleGetConnectionMetrics(@ConnectedSocket() client: AuthenticatedSocket) {
    const hasAdminRole = client.roles?.some(role => 
      ['ADMIN_GENERAL'].includes(role)
    );

    if (!hasAdminRole) {
      this.sendError(client, 'INSUFFICIENT_PERMISSIONS', 'Admin permissions required');
      return;
    }

    const metricsData: RealtimeMetricsDto = {
      connectionsCount: this.metrics.connectionsCount,
      messagesCount: this.metrics.messagesCount,
      errorsCount: this.metrics.errorsCount,
      eventsPerSecond: this.metrics.eventsPerSecond,
      averageLatency: 0, // Default value for now
      lastUpdated: this.metrics.lastUpdated,
    };

    client.emit('connection-metrics', metricsData);
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
