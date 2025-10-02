/**
 * Domain Events for Recurring Reservations (RF-12)
 * Event-Driven Architecture for recurring reservation lifecycle
 */

import { DomainEvent } from '@/libs/event-bus/services/event-bus.service';

// Base interface for recurring reservation events
export interface RecurringReservationEventPayload {
  recurringReservationId: string;
  userId: string;
  resourceId: string;
  programId?: string;
  title: string;
  frequency: string;
  interval: number;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  status: string;
  totalInstances?: number;
  confirmedInstances?: number;
  metadata?: any;
}

// Event when a recurring reservation is created
export class RecurringReservationCreatedEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationCreated';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: RecurringReservationEventPayload;
  readonly version = 1;

  constructor(payload: RecurringReservationEventPayload, userId: string) {
    this.eventId = `recurring-reservation-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.recurringReservationId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a recurring reservation is updated
export class RecurringReservationUpdatedEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationUpdated';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: RecurringReservationEventPayload & {
    updatedFields: string[];
    previousValues: any;
    updateScope: 'CURRENT_AND_FUTURE' | 'FUTURE_ONLY' | 'ALL';
    affectedInstancesCount: number;
  };
  readonly version = 1;

  constructor(payload: RecurringReservationEventPayload & {
    updatedFields: string[];
    previousValues: any;
    updateScope: 'CURRENT_AND_FUTURE' | 'FUTURE_ONLY' | 'ALL';
    affectedInstancesCount: number;
  }, userId: string) {
    this.eventId = `recurring-reservation-updated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.recurringReservationId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a recurring reservation is cancelled
export class RecurringReservationCancelledEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationCancelled';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: RecurringReservationEventPayload & {
    cancellationReason: string;
    cancelScope: 'CURRENT_AND_FUTURE' | 'FUTURE_ONLY' | 'ALL';
    cancelledInstancesCount: number;
    refundAmount?: number;
    penaltyApplied?: boolean;
  };
  readonly version = 1;

  constructor(payload: RecurringReservationEventPayload & {
    cancellationReason: string;
    cancelScope: 'CURRENT_AND_FUTURE' | 'FUTURE_ONLY' | 'ALL';
    cancelledInstancesCount: number;
    refundAmount?: number;
    penaltyApplied?: boolean;
  }, userId: string) {
    this.eventId = `recurring-reservation-cancelled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.recurringReservationId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when recurring reservation instances are generated
export class RecurringReservationInstancesGeneratedEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationInstancesGenerated';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: RecurringReservationEventPayload & {
    generatedInstances: Array<{
      instanceId: string;
      instanceDate: Date;
      startTime: string;
      endTime: string;
      status: string;
      conflictDetected: boolean;
    }>;
    generationPeriod: {
      fromDate: Date;
      toDate: Date;
    };
    conflictsFound: number;
    successfullyGenerated: number;
  };
  readonly version = 1;

  constructor(payload: RecurringReservationEventPayload & {
    generatedInstances: Array<{
      instanceId: string;
      instanceDate: Date;
      startTime: string;
      endTime: string;
      status: string;
      conflictDetected: boolean;
    }>;
    generationPeriod: {
      fromDate: Date;
      toDate: Date;
    };
    conflictsFound: number;
    successfullyGenerated: number;
  }, userId: string) {
    this.eventId = `recurring-reservation-instances-generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.recurringReservationId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a recurring reservation instance is confirmed
export class RecurringReservationInstanceConfirmedEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationInstanceConfirmed';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservationInstance';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: {
    instanceId: string;
    recurringReservationId: string;
    userId: string;
    resourceId: string;
    instanceDate: Date;
    startTime: string;
    endTime: string;
    confirmedAt: Date;
    confirmationMethod: 'AUTOMATIC' | 'MANUAL' | 'EMAIL' | 'SMS';
    previousStatus: string;
    currentStatus: string;
  };
  readonly version = 1;

  constructor(payload: {
    instanceId: string;
    recurringReservationId: string;
    userId: string;
    resourceId: string;
    instanceDate: Date;
    startTime: string;
    endTime: string;
    confirmedAt: Date;
    confirmationMethod: 'AUTOMATIC' | 'MANUAL' | 'EMAIL' | 'SMS';
    previousStatus: string;
    currentStatus: string;
  }, userId: string) {
    this.eventId = `recurring-reservation-instance-confirmed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.instanceId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a recurring reservation instance is cancelled
export class RecurringReservationInstanceCancelledEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationInstanceCancelled';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservationInstance';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: {
    instanceId: string;
    recurringReservationId: string;
    userId: string;
    resourceId: string;
    instanceDate: Date;
    startTime: string;
    endTime: string;
    cancellationReason: string;
    cancelledAt: Date;
    refundAmount?: number;
    penaltyApplied?: boolean;
    previousStatus: string;
    currentStatus: string;
  };
  readonly version = 1;

  constructor(payload: {
    instanceId: string;
    recurringReservationId: string;
    userId: string;
    resourceId: string;
    instanceDate: Date;
    startTime: string;
    endTime: string;
    cancellationReason: string;
    cancelledAt: Date;
    refundAmount?: number;
    penaltyApplied?: boolean;
    previousStatus: string;
    currentStatus: string;
  }, userId: string) {
    this.eventId = `recurring-reservation-instance-cancelled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.instanceId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a recurring reservation conflicts are detected
export class RecurringReservationConflictDetectedEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationConflictDetected';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: RecurringReservationEventPayload & {
    conflictingInstances: Array<{
      instanceId: string;
      instanceDate: Date;
      conflictType: 'RESOURCE_UNAVAILABLE' | 'OVERLAPPING_RESERVATION' | 'MAINTENANCE_SCHEDULED' | 'HOLIDAY';
      conflictingReservationId?: string;
      conflictDetails: string;
    }>;
    totalConflicts: number;
    resolutionRequired: boolean;
    suggestedActions: string[];
  };
  readonly version = 1;

  constructor(payload: RecurringReservationEventPayload & {
    conflictingInstances: Array<{
      instanceId: string;
      instanceDate: Date;
      conflictType: 'RESOURCE_UNAVAILABLE' | 'OVERLAPPING_RESERVATION' | 'MAINTENANCE_SCHEDULED' | 'HOLIDAY';
      conflictingReservationId?: string;
      conflictDetails: string;
    }>;
    totalConflicts: number;
    resolutionRequired: boolean;
    suggestedActions: string[];
  }, userId: string) {
    this.eventId = `recurring-reservation-conflict-detected-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.recurringReservationId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a recurring reservation is completed (all instances finished)
export class RecurringReservationCompletedEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationCompleted';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: RecurringReservationEventPayload & {
    completedAt: Date;
    totalInstancesGenerated: number;
    totalInstancesConfirmed: number;
    totalInstancesCancelled: number;
    totalInstancesCompleted: number;
    completionRate: number;
    feedbackRequested: boolean;
    statisticsSummary: any;
  };
  readonly version = 1;

  constructor(payload: RecurringReservationEventPayload & {
    completedAt: Date;
    totalInstancesGenerated: number;
    totalInstancesConfirmed: number;
    totalInstancesCancelled: number;
    totalInstancesCompleted: number;
    completionRate: number;
    feedbackRequested: boolean;
    statisticsSummary: any;
  }, userId: string) {
    this.eventId = `recurring-reservation-completed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.recurringReservationId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when recurring reservation validation fails
export class RecurringReservationValidationFailedEvent implements DomainEvent {
  readonly eventType = 'RecurringReservationValidationFailed';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'RecurringReservation';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: {
    recurringReservationId: string;
    userId: string;
    resourceId: string;
    validationErrors: Array<{
      field: string;
      error: string;
      severity: 'ERROR' | 'WARNING';
    }>;
    validationContext: string;
    attemptedAction: string;
    requiresManualReview: boolean;
  };
  readonly version = 1;

  constructor(payload: {
    recurringReservationId: string;
    userId: string;
    resourceId: string;
    validationErrors: Array<{
      field: string;
      error: string;
      severity: 'ERROR' | 'WARNING';
    }>;
    validationContext: string;
    attemptedAction: string;
    requiresManualReview: boolean;
  }, userId: string) {
    this.eventId = `recurring-reservation-validation-failed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.recurringReservationId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Export all events for easy importing
export const RecurringReservationEvents = {
  RecurringReservationCreatedEvent,
  RecurringReservationUpdatedEvent,
  RecurringReservationCancelledEvent,
  RecurringReservationInstancesGeneratedEvent,
  RecurringReservationInstanceConfirmedEvent,
  RecurringReservationInstanceCancelledEvent,
  RecurringReservationConflictDetectedEvent,
  RecurringReservationCompletedEvent,
  RecurringReservationValidationFailedEvent
} as const;

// Type for all recurring reservation event types
export type RecurringReservationEventType = 
  | 'RecurringReservationCreated'
  | 'RecurringReservationUpdated'
  | 'RecurringReservationCancelled'
  | 'RecurringReservationInstancesGenerated'
  | 'RecurringReservationInstanceConfirmed'
  | 'RecurringReservationInstanceCancelled'
  | 'RecurringReservationConflictDetected'
  | 'RecurringReservationCompleted'
  | 'RecurringReservationValidationFailed';
