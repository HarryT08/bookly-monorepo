/**
 * Standardized Domain Event Structure for Bookly
 * Ensures consistency across all microservices and event types
 */

export interface StandardizedDomainEvent {
  // Event Identification
  eventId: string;
  eventType: string;
  eventVersion: string; // Semantic versioning for event schema evolution
  
  // Aggregate Information
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  
  // Temporal Information
  timestamp: Date;
  occurredAt: Date; // When the business action actually occurred
  
  // Context Information
  correlationId?: string; // For tracking across services
  causationId?: string; // The command/event that caused this event
  userId?: string;
  tenantId?: string;
  
  // Business Data
  eventData: {
    // Core business data
    [key: string]: any;
    
    // Standard fields for all events
    action: EventAction;
    entityId: string;
    entityType: string;
    previousState?: any;
    newState?: any;
    changes?: Record<string, { from: any; to: any }>;
  };
  
  // Metadata
  metadata: {
    source: EventSource;
    service: string;
    environment: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    sessionId?: string;
  };
  
  // Technical Information
  schemaVersion: string;
  publishedAt?: Date; // When event was published to event bus
}

export enum EventAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ACTIVATED = 'ACTIVATED',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
  RESTORED = 'RESTORED'
}

export enum EventSource {
  USER_ACTION = 'USER_ACTION',
  SYSTEM_ACTION = 'SYSTEM_ACTION',
  SCHEDULED_ACTION = 'SCHEDULED_ACTION',
  INTEGRATION_ACTION = 'INTEGRATION_ACTION',
  MIGRATION_ACTION = 'MIGRATION_ACTION'
}

// Service-specific event types
export const RESOURCE_EVENTS = {
  CREATED: 'resource.created',
  UPDATED: 'resource.updated', 
  DELETED: 'resource.deleted',
  STATUS_CHANGED: 'resource.status_changed',
  MAINTENANCE_STARTED: 'resource.maintenance_started',
  MAINTENANCE_ENDED: 'resource.maintenance_ended'
} as const;

export const AVAILABILITY_EVENTS = {
  CREATED: 'availability.created',
  UPDATED: 'availability.updated',
  DELETED: 'availability.deleted'
} as const;

export const RESERVATION_EVENTS = {
  CREATED: 'reservation.created',
  UPDATED: 'reservation.updated',
  CANCELLED: 'reservation.cancelled',
  APPROVED: 'reservation.approved',
  REJECTED: 'reservation.rejected',
  CHECKED_IN: 'reservation.checked_in',
  CHECKED_OUT: 'reservation.checked_out',
  NO_SHOW: 'reservation.no_show'
} as const;

export const AUTH_EVENTS = {
  USER_REGISTERED: 'auth.user_registered',
  USER_LOGIN: 'auth.user_login',
  USER_LOGOUT: 'auth.user_logout',
  PASSWORD_CHANGED: 'auth.password_changed',
  ROLE_ASSIGNED: 'auth.role_assigned',
  ROLE_REVOKED: 'auth.role_revoked'
} as const;

// Helper function to create standardized events
export function createStandardizedEvent(
  eventType: string,
  aggregateId: string,
  aggregateType: string,
  action: EventAction,
  entityData: any,
  context: {
    userId?: string;
    service: string;
    correlationId?: string;
    previousState?: any;
    changes?: Record<string, { from: any; to: any }>;
  }
): StandardizedDomainEvent {
  const now = new Date();
  
  return {
    eventId: generateEventId(),
    eventType,
    eventVersion: '1.0.0',
    aggregateId,
    aggregateType,
    aggregateVersion: 1,
    timestamp: now,
    occurredAt: now,
    correlationId: context.correlationId || generateCorrelationId(),
    userId: context.userId,
    eventData: {
      action,
      entityId: aggregateId,
      entityType: aggregateType,
      previousState: context.previousState,
      newState: entityData,
      changes: context.changes,
      ...entityData
    },
    metadata: {
      source: context.userId ? EventSource.USER_ACTION : EventSource.SYSTEM_ACTION,
      service: context.service,
      environment: process.env.NODE_ENV || 'development',
      requestId: generateRequestId()
    },
    schemaVersion: '1.0.0',
    publishedAt: now
  };
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateCorrelationId(): string {
  return `cor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
