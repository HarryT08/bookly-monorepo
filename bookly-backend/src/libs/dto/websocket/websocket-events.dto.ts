/**
 * WebSocket Events DTOs for Bookly Event-Driven Architecture
 * Shared types between frontend and backend for real-time communication
 */

// Base event interface
export interface BaseEventDto {
  eventId: string;
  timestamp: string;
  userId?: string;
  source: string;
}

// Reservation Events
export interface ReservationEventDto extends BaseEventDto {
  reservationId: string;
  resourceId: string;
  resourceName: string;
  startTime: string;
  endTime: string;
}

export interface ReservationCreatedEventDto extends ReservationEventDto {
  type: 'reservation.created';
  purpose: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
}

export interface ReservationUpdatedEventDto extends ReservationEventDto {
  type: 'reservation.updated';
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
}

export interface ReservationCancelledEventDto extends ReservationEventDto {
  type: 'reservation.cancelled';
  reason?: string;
  cancelledBy: string;
}

export interface ReservationApprovedEventDto extends ReservationEventDto {
  type: 'reservation.approved';
  approvedBy: string;
  approvalLevel: string;
}

export interface ReservationRejectedEventDto extends ReservationEventDto {
  type: 'reservation.rejected';
  rejectedBy: string;
  reason: string;
}

export interface ReservationReassignedEventDto extends ReservationEventDto {
  type: 'reservation.reassigned';
  newResourceId: string;
  newResourceName: string;
  newStartTime: string;
  newEndTime: string;
  reason: string;
  reassignedBy: string;
}

// Resource Events
export interface ResourceEventDto extends BaseEventDto {
  resourceId: string;
  resourceName: string;
}

export interface ResourceCreatedEventDto extends ResourceEventDto {
  type: 'resource.created';
  categoryId: string;
  capacity: number;
}

export interface ResourceUpdatedEventDto extends ResourceEventDto {
  type: 'resource.updated';
  changes: Record<string, unknown>;
}

export interface ResourceDeletedEventDto extends ResourceEventDto {
  type: 'resource.deleted';
  deletedBy: string;
}

export interface ResourceMaintenanceEventDto extends ResourceEventDto {
  type: 'resource.maintenance';
  maintenanceType: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
  startTime?: string;
  endTime?: string;
  description: string;
}

// Notification Events
export interface NotificationEventDto extends BaseEventDto {
  notificationId: string;
  recipientId: string;
  title: string;
  message: string;
  notificationType: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationSentEventDto extends BaseEventDto {
  type: 'notification.sent';
  notificationId: string;
  recipientId: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'PUSH' | 'SMS';
  status: 'sent' | 'delivered' | 'failed';
  message?: string;
}

export interface NotificationReadEventDto extends BaseEventDto {
  type: 'notification.read';
  notificationId: string;
  recipientId: string;
  readAt: string;
}

// System Events
export interface SystemEventDto extends BaseEventDto {
  systemComponent: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
}

export interface SystemHealthEventDto extends SystemEventDto {
  type: 'system.health';
  metrics: {
    cpu: number;
    memory: number;
    connections: number;
  };
  status: 'healthy' | 'degraded' | 'unhealthy';
}

export interface SystemErrorEventDto extends SystemEventDto {
  type: 'system.error';
  errorCode: string;
  stackTrace?: string;
}

// Approval Events
export interface ApprovalRequestedEventDto extends BaseEventDto {
  type: 'approval.requested';
  reservationId: string;
  requesterId: string;
  resourceId?: string;
  approvalLevel?: string;
}

// Union types for all events
export type BooklyEventDto = 
  | ReservationCreatedEventDto
  | ReservationUpdatedEventDto
  | ReservationCancelledEventDto
  | ReservationApprovedEventDto
  | ReservationRejectedEventDto
  | ReservationReassignedEventDto
  | ResourceCreatedEventDto
  | ResourceUpdatedEventDto
  | ResourceDeletedEventDto
  | ResourceMaintenanceEventDto
  | NotificationSentEventDto
  | NotificationReadEventDto
  | ApprovalRequestedEventDto
  | SystemHealthEventDto
  | SystemErrorEventDto;

// WebSocket connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// WebSocket authentication payload
export interface AuthPayloadDto {
  token: string;
  userId?: string;
  roles?: string[];
}

// Room subscription payload
export interface RoomSubscriptionDto {
  roomType: 'user' | 'resource' | 'global' | 'admin';
  roomId: string;
  events?: string[];
  timestamp?: string;
}

// WebSocket error types
export interface WebSocketErrorDto {
  code: string;
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Event subscription options
export interface EventSubscriptionOptionsDto {
  once?: boolean;
  priority?: number;
  filter?: (event: BooklyEventDto) => boolean;
}

// Real-time metrics
export interface RealtimeMetricsDto {
  connectionsCount: number;
  eventsPerSecond: number;
  averageLatency: number;
  lastUpdated: string;
  messagesCount?: number;
  errorsCount?: number;
}

// WebSocket client configuration
export interface WebSocketConfigDto {
  url: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
  forceNew?: boolean;
}
