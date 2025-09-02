/**
 * WebSocket Types for Bookly Event-Driven Architecture
 */

// Base event interface
export interface BaseEvent {
	eventId: string;
	timestamp: string;
	userId?: string;
	source: string;
}

// Reservation Events
export interface ReservationEvent extends BaseEvent {
	reservationId: string;
	resourceId: string;
	resourceName: string;
	startTime: string;
	endTime: string;
}

export interface ReservationCreatedEvent extends ReservationEvent {
	type: 'reservation.created';
	purpose: string;
	status: 'pending' | 'approved' | 'rejected';
}

export interface ReservationUpdatedEvent extends ReservationEvent {
	type: 'reservation.updated';
	changes: Record<string, unknown>;
	previousValues: Record<string, unknown>;
}

export interface ReservationCancelledEvent extends ReservationEvent {
	type: 'reservation.cancelled';
	reason?: string;
	cancelledBy: string;
}

export interface ReservationApprovedEvent extends ReservationEvent {
	type: 'reservation.approved';
	approvedBy: string;
	approvalLevel: string;
}

export interface ReservationRejectedEvent extends ReservationEvent {
	type: 'reservation.rejected';
	rejectedBy: string;
	reason: string;
}

// Resource Events
export interface ResourceEvent extends BaseEvent {
	resourceId: string;
	resourceName: string;
}

export interface ResourceCreatedEvent extends ResourceEvent {
	type: 'resource.created';
	categoryId: string;
	capacity: number;
}

export interface ResourceUpdatedEvent extends ResourceEvent {
	type: 'resource.updated';
	changes: Record<string, unknown>;
}

export interface ResourceDeletedEvent extends ResourceEvent {
	type: 'resource.deleted';
	deletedBy: string;
}

export interface ResourceMaintenanceEvent extends ResourceEvent {
	type: 'resource.maintenance';
	maintenanceType: 'scheduled' | 'emergency' | 'completed';
	startTime?: string;
	endTime?: string;
	description: string;
}

// Notification Events
export interface NotificationEvent extends BaseEvent {
	notificationId: string;
	recipientId: string;
	title: string;
	message: string;
	notificationType: 'info' | 'warning' | 'error' | 'success';
	priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationSentEvent extends BaseEvent {
	type: 'notification.sent';
	notificationId: string;
	recipientId: string;
	channel: 'email' | 'whatsapp' | 'push' | 'sms';
	status: 'sent' | 'delivered' | 'failed';
}

export interface NotificationReadEvent extends BaseEvent {
	type: 'notification.read';
	notificationId: string;
	recipientId: string;
	readAt: string;
}

// System Events
export interface SystemEvent extends BaseEvent {
	systemComponent: string;
	level: 'info' | 'warning' | 'error' | 'critical';
	message: string;
}

export interface SystemHealthEvent extends SystemEvent {
	type: 'system.health';
	metrics: {
		cpu: number;
		memory: number;
		connections: number;
	};
	status: 'healthy' | 'degraded' | 'unhealthy';
}

export interface SystemErrorEvent extends SystemEvent {
	type: 'system.error';
	errorCode: string;
	stackTrace?: string;
}

// Union types for all events
export type BooklyEvent = 
	| ReservationCreatedEvent
	| ReservationUpdatedEvent
	| ReservationCancelledEvent
	| ReservationApprovedEvent
	| ReservationRejectedEvent
	| ResourceCreatedEvent
	| ResourceUpdatedEvent
	| ResourceDeletedEvent
	| ResourceMaintenanceEvent
	| NotificationSentEvent
	| NotificationReadEvent
	| SystemHealthEvent
	| SystemErrorEvent;

// Event handler type
export type EventHandler<T = BooklyEvent> = (event: T) => void;

// WebSocket connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// WebSocket authentication payload
export interface AuthPayload {
	token: string;
	userId?: string;
	roles?: string[];
}

// Room subscription payload
export interface RoomSubscription {
	roomType: 'user' | 'resource' | 'global' | 'admin';
	roomId: string;
	events?: string[];
}

// WebSocket client configuration
export interface WebSocketConfig {
	url: string;
	autoConnect?: boolean;
	reconnectAttempts?: number;
	reconnectDelay?: number;
	timeout?: number;
	forceNew?: boolean;
}

// WebSocket error types
export interface WebSocketError {
	code: string;
	message: string;
	timestamp: string;
	details?: Record<string, unknown>;
}

// Event subscription options
export interface EventSubscriptionOptions {
	once?: boolean;
	priority?: number;
	filter?: (event: BooklyEvent) => boolean;
}

// Real-time metrics
export interface RealtimeMetrics {
	connectionsCount: number;
	eventsPerSecond: number;
	averageLatency: number;
	lastUpdated: string;
}
