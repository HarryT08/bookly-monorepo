/**
 * Domain Events for Waiting List (RF-14)
 * Event-Driven Architecture for waiting list lifecycle
 */

import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

// Base interface for waiting list events
export interface WaitingListEventPayload {
  waitingListId: string;
  resourceId: string;
  programId?: string;
  requestedStartTime: Date;
  requestedEndTime: Date;
  totalEntries: number;
  activeEntries: number;
  metadata?: any;
}

export interface WaitingListEntryEventPayload {
  entryId: string;
  waitingListId: string;
  userId: string;
  resourceId: string;
  position: number;
  priority: string;
  requestedStartTime: Date;
  requestedEndTime: Date;
  confirmationTimeLimit: number;
  status: string;
  requestedAt: Date;
  metadata?: any;
}

// Event when a user joins a waiting list
export class UserJoinedWaitingListEvent implements DomainEvent {
  readonly eventType = 'UserJoinedWaitingList';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingListEntry';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEntryEventPayload & {
    joinReason?: string;
    estimatedWaitTime?: number;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    autoConfirm: boolean;
    maxWaitHours?: number;
  };
  readonly version = 1;

  constructor(payload: WaitingListEntryEventPayload & {
    joinReason?: string;
    estimatedWaitTime?: number;
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    autoConfirm: boolean;
    maxWaitHours?: number;
  }, userId: string) {
    this.eventId = `user-joined-waiting-list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.entryId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a user leaves a waiting list
export class UserLeftWaitingListEvent implements DomainEvent {
  readonly eventType = 'UserLeftWaitingList';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingListEntry';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEntryEventPayload & {
    leaveReason: 'USER_REQUEST' | 'TIMEOUT' | 'FOUND_ALTERNATIVE' | 'CANCELLED_NEED' | 'SYSTEM_REMOVAL';
    timeInWaitingList: number; // minutes
    positionWhenLeft: number;
    refundAmount?: number;
  };
  readonly version = 1;

  constructor(payload: WaitingListEntryEventPayload & {
    leaveReason: 'USER_REQUEST' | 'TIMEOUT' | 'FOUND_ALTERNATIVE' | 'CANCELLED_NEED' | 'SYSTEM_REMOVAL';
    timeInWaitingList: number;
    positionWhenLeft: number;
    refundAmount?: number;
  }, userId: string) {
    this.eventId = `user-left-waiting-list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.entryId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a slot becomes available in waiting list
export class WaitingListSlotAvailableEvent implements DomainEvent {
  readonly eventType = 'WaitingListSlotAvailable';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingList';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEventPayload & {
    availableSlot: {
      startTime: Date;
      endTime: Date;
      resourceId: string;
      reason: 'CANCELLATION' | 'NO_SHOW' | 'EARLY_RELEASE' | 'SYSTEM_OPTIMIZATION';
      originalReservationId?: string;
    };
    nextInLine: {
      entryId: string;
      userId: string;
      position: number;
      priority: string;
      waitTime: number; // minutes
    };
    notificationSent: boolean;
    autoAssignmentEnabled: boolean;
  };
  readonly version = 1;

  constructor(payload: WaitingListEventPayload & {
    availableSlot: {
      startTime: Date;
      endTime: Date;
      resourceId: string;
      reason: 'CANCELLATION' | 'NO_SHOW' | 'EARLY_RELEASE' | 'SYSTEM_OPTIMIZATION';
      originalReservationId?: string;
    };
    nextInLine: {
      entryId: string;
      userId: string;
      position: number;
      priority: string;
      waitTime: number;
    };
    notificationSent: boolean;
    autoAssignmentEnabled: boolean;
  }, userId: string) {
    this.eventId = `waiting-list-slot-available-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.waitingListId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a user confirms their waiting list slot
export class UserConfirmedWaitingListSlotEvent implements DomainEvent {
  readonly eventType = 'UserConfirmedWaitingListSlot';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingListEntry';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEntryEventPayload & {
    confirmedAt: Date;
    confirmationMethod: 'EMAIL' | 'SMS' | 'PUSH' | 'WEB' | 'PHONE';
    responseTime: number; // minutes from notification to confirmation
    newReservationId: string;
    slotDetails: {
      startTime: Date;
      endTime: Date;
      resourceId: string;
    };
  };
  readonly version = 1;

  constructor(payload: WaitingListEntryEventPayload & {
    confirmedAt: Date;
    confirmationMethod: 'EMAIL' | 'SMS' | 'PUSH' | 'WEB' | 'PHONE';
    responseTime: number;
    newReservationId: string;
    slotDetails: {
      startTime: Date;
      endTime: Date;
      resourceId: string;
    };
  }, userId: string) {
    this.eventId = `user-confirmed-waiting-list-slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.entryId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when a waiting list slot expires (user didn't confirm in time)
export class WaitingListSlotExpiredEvent implements DomainEvent {
  readonly eventType = 'WaitingListSlotExpired';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingListEntry';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEntryEventPayload & {
    expiredAt: Date;
    notificationsSent: number;
    lastNotificationAt: Date;
    timeoutMinutes: number;
    nextInLineNotified: boolean;
    nextInLine?: {
      entryId: string;
      userId: string;
      position: number;
    };
    penaltyApplied?: {
      type: string;
      duration: number;
      reason: string;
    };
  };
  readonly version = 1;

  constructor(payload: WaitingListEntryEventPayload & {
    expiredAt: Date;
    notificationsSent: number;
    lastNotificationAt: Date;
    timeoutMinutes: number;
    nextInLineNotified: boolean;
    nextInLine?: {
      entryId: string;
      userId: string;
      position: number;
    };
    penaltyApplied?: {
      type: string;
      duration: number;
      reason: string;
    };
  }, userId: string) {
    this.eventId = `waiting-list-slot-expired-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.entryId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when waiting list positions are reordered
export class WaitingListPositionsReorderedEvent implements DomainEvent {
  readonly eventType = 'WaitingListPositionsReordered';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingList';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEventPayload & {
    reorderReason: 'PRIORITY_ESCALATION' | 'ADMIN_ADJUSTMENT' | 'SYSTEM_OPTIMIZATION' | 'PENALTY_APPLIED';
    reorderedBy: string;
    positionChanges: Array<{
      entryId: string;
      userId: string;
      oldPosition: number;
      newPosition: number;
      priorityChanged: boolean;
    }>;
    affectedUsers: number;
    notificationsRequired: boolean;
  };
  readonly version = 1;

  constructor(payload: WaitingListEventPayload & {
    reorderReason: 'PRIORITY_ESCALATION' | 'ADMIN_ADJUSTMENT' | 'SYSTEM_OPTIMIZATION' | 'PENALTY_APPLIED';
    reorderedBy: string;
    positionChanges: Array<{
      entryId: string;
      userId: string;
      oldPosition: number;
      newPosition: number;
      priorityChanged: boolean;
    }>;
    affectedUsers: number;
    notificationsRequired: boolean;
  }, userId: string) {
    this.eventId = `waiting-list-positions-reordered-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.waitingListId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when user priority is escalated in waiting list
export class WaitingListPriorityEscalatedEvent implements DomainEvent {
  readonly eventType = 'WaitingListPriorityEscalated';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingListEntry';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEntryEventPayload & {
    escalatedBy: string;
    escalationReason: string;
    previousPriority: string;
    newPriority: string;
    previousPosition: number;
    newPosition: number;
    escalationApproval?: {
      approvedBy: string;
      approvalDate: Date;
      approvalNotes?: string;
    };
    auditRequired: boolean;
  };
  readonly version = 1;

  constructor(payload: WaitingListEntryEventPayload & {
    escalatedBy: string;
    escalationReason: string;
    previousPriority: string;
    newPriority: string;
    previousPosition: number;
    newPosition: number;
    escalationApproval?: {
      approvedBy: string;
      approvalDate: Date;
      approvalNotes?: string;
    };
    auditRequired: boolean;
  }, userId: string) {
    this.eventId = `waiting-list-priority-escalated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.entryId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when waiting list is optimized
export class WaitingListOptimizedEvent implements DomainEvent {
  readonly eventType = 'WaitingListOptimized';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingList';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEventPayload & {
    optimizedBy: string;
    optimizationCriteria: 'WAIT_TIME' | 'PRIORITY' | 'RESOURCE_UTILIZATION' | 'USER_SATISFACTION';
    optimizationResults: {
      entriesProcessed: number;
      positionsChanged: number;
      averageWaitTimeReduction: number;
      satisfactionScoreImprovement: number;
    };
    affectedEntries: Array<{
      entryId: string;
      userId: string;
      oldPosition: number;
      newPosition: number;
      estimatedWaitTimeChange: number;
    }>;
    notificationsScheduled: number;
  };
  readonly version = 1;

  constructor(payload: WaitingListEventPayload & {
    optimizedBy: string;
    optimizationCriteria: 'WAIT_TIME' | 'PRIORITY' | 'RESOURCE_UTILIZATION' | 'USER_SATISFACTION';
    optimizationResults: {
      entriesProcessed: number;
      positionsChanged: number;
      averageWaitTimeReduction: number;
      satisfactionScoreImprovement: number;
    };
    affectedEntries: Array<{
      entryId: string;
      userId: string;
      oldPosition: number;
      newPosition: number;
      estimatedWaitTimeChange: number;
    }>;
    notificationsScheduled: number;
  }, userId: string) {
    this.eventId = `waiting-list-optimized-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.waitingListId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when bulk notifications are sent to waiting list users
export class WaitingListBulkNotificationSentEvent implements DomainEvent {
  readonly eventType = 'WaitingListBulkNotificationSent';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingList';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEventPayload & {
    notificationType: 'POSITION_UPDATE' | 'SLOT_AVAILABLE' | 'REMINDER' | 'SYSTEM_UPDATE' | 'CANCELLATION';
    sentBy: string;
    recipientCount: number;
    recipients: Array<{
      entryId: string;
      userId: string;
      position: number;
      notificationMethods: string[];
      deliveryStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
    }>;
    messageTemplate: string;
    scheduledAt?: Date;
    deliveryStats: {
      sent: number;
      delivered: number;
      failed: number;
      pending: number;
    };
  };
  readonly version = 1;

  constructor(payload: WaitingListEventPayload & {
    notificationType: 'POSITION_UPDATE' | 'SLOT_AVAILABLE' | 'REMINDER' | 'SYSTEM_UPDATE' | 'CANCELLATION';
    sentBy: string;
    recipientCount: number;
    recipients: Array<{
      entryId: string;
      userId: string;
      position: number;
      notificationMethods: string[];
      deliveryStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
    }>;
    messageTemplate: string;
    scheduledAt?: Date;
    deliveryStats: {
      sent: number;
      delivered: number;
      failed: number;
      pending: number;
    };
  }, userId: string) {
    this.eventId = `waiting-list-bulk-notification-sent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.waitingListId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Event when waiting list preferences are updated
export class WaitingListPreferencesUpdatedEvent implements DomainEvent {
  readonly eventType = 'WaitingListPreferencesUpdated';
  readonly eventId: string;
  readonly aggregateId: string;
  readonly aggregateType = 'WaitingListEntry';
  readonly timestamp: Date;
  readonly userId: string;
  readonly eventData: WaitingListEntryEventPayload & {
    updatedPreferences: {
      notificationMethods: string[];
      autoConfirm: boolean;
      maxWaitHours?: number;
      alternativeResourcesAccepted: boolean;
      timeFlexibility: number; // minutes
    };
    previousPreferences: any;
    updatedBy: string;
    effectiveImmediately: boolean;
  };
  readonly version = 1;

  constructor(payload: WaitingListEntryEventPayload & {
    updatedPreferences: {
      notificationMethods: string[];
      autoConfirm: boolean;
      maxWaitHours?: number;
      alternativeResourcesAccepted: boolean;
      timeFlexibility: number;
    };
    previousPreferences: any;
    updatedBy: string;
    effectiveImmediately: boolean;
  }, userId: string) {
    this.eventId = `waiting-list-preferences-updated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = payload.entryId;
    this.timestamp = new Date();
    this.userId = userId;
    this.eventData = payload;
  }
}

// Export all events for easy importing
export const WaitingListEvents = {
  UserJoinedWaitingListEvent,
  UserLeftWaitingListEvent,
  WaitingListSlotAvailableEvent,
  UserConfirmedWaitingListSlotEvent,
  WaitingListSlotExpiredEvent,
  WaitingListPositionsReorderedEvent,
  WaitingListPriorityEscalatedEvent,
  WaitingListOptimizedEvent,
  WaitingListBulkNotificationSentEvent,
  WaitingListPreferencesUpdatedEvent
} as const;

// Type for all waiting list event types
export type WaitingListEventType = 
  | 'UserJoinedWaitingList'
  | 'UserLeftWaitingList'
  | 'WaitingListSlotAvailable'
  | 'UserConfirmedWaitingListSlot'
  | 'WaitingListSlotExpired'
  | 'WaitingListPositionsReordered'
  | 'WaitingListPriorityEscalated'
  | 'WaitingListOptimized'
  | 'WaitingListBulkNotificationSent'
  | 'WaitingListPreferencesUpdated';
