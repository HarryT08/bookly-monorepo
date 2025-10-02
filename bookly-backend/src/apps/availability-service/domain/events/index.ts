/**
 * Domain Events Index
 * Centralized export for all domain events in availability-service
 * Event-Driven Architecture for Hito 7 Phase 2 (RF-12, RF-14, RF-15)
 */

import { RecurringReservationEvents, type RecurringReservationEventType } from './recurring-reservation.events';
import { WaitingListEvents, type WaitingListEventType } from './waiting-list.events';
import { ReassignmentEvents, type ReassignmentEventType } from './reassignment.events';

// Recurring Reservation Events (RF-12)
export {
  RecurringReservationEvents,
  type RecurringReservationEventType
};

// Waiting List Events (RF-14)
export {
  WaitingListEvents,
  type WaitingListEventType
};

// Reassignment Events (RF-15)
export {
  ReassignmentEvents,
  type ReassignmentEventType
};

// Union type for all availability service events
export type AvailabilityServiceEventType = 
  | RecurringReservationEventType
  | WaitingListEventType
  | ReassignmentEventType;

// All events collection
export const AvailabilityServiceEvents = {
  ...RecurringReservationEvents,
  ...WaitingListEvents,
  ...ReassignmentEvents
} as const;

// Event categories for filtering and routing
export const EventCategories = {
  RECURRING_RESERVATION: [
    'RecurringReservationCreated',
    'RecurringReservationUpdated',
    'RecurringReservationCancelled',
    'RecurringReservationInstancesGenerated',
    'RecurringReservationInstanceConfirmed',
    'RecurringReservationInstanceCancelled',
    'RecurringReservationConflictDetected',
    'RecurringReservationCompleted',
    'RecurringReservationValidationFailed'
  ] as const,
  
  WAITING_LIST: [
    'UserJoinedWaitingList',
    'UserLeftWaitingList',
    'WaitingListSlotAvailable',
    'UserConfirmedWaitingListSlot',
    'WaitingListSlotExpired',
    'WaitingListPositionsReordered',
    'WaitingListPriorityEscalated',
    'WaitingListOptimized',
    'WaitingListBulkNotificationSent',
    'WaitingListPreferencesUpdated'
  ] as const,
  
  REASSIGNMENT: [
    'ReassignmentRequestCreated',
    'ReassignmentRequestResponded',
    'EquivalentResourcesFound',
    'ReassignmentRequestProcessed',
    'ReassignmentApplied',
    'ReassignmentRequestCancelled',
    'ReassignmentRequestEscalated',
    'ReassignmentSuggestionRejected',
    'ReassignmentQueueOptimized',
    'BulkReassignmentRequestsProcessed',
    'ReassignmentRequestExpired'
  ] as const
} as const;

// Event priority levels for notification routing
export const EventPriorities = {
  HIGH: [
    'RecurringReservationConflictDetected',
    'WaitingListSlotAvailable',
    'ReassignmentRequestCreated',
    'ReassignmentRequestEscalated',
    'WaitingListSlotExpired',
    'ReassignmentRequestExpired'
  ],
  MEDIUM: [
    'RecurringReservationCreated',
    'UserJoinedWaitingList',
    'ReassignmentApplied',
    'RecurringReservationInstancesGenerated',
    'WaitingListPriorityEscalated'
  ],
  LOW: [
    'RecurringReservationUpdated',
    'WaitingListPreferencesUpdated',
    'RecurringReservationCompleted',
    'WaitingListOptimized',
    'ReassignmentQueueOptimized'
  ]
} as const;

// Event notification channels mapping
export const EventNotificationChannels = {
  EMAIL: [
    'RecurringReservationCreated',
    'WaitingListSlotAvailable',
    'ReassignmentRequestCreated',
    'ReassignmentApplied',
    'RecurringReservationConflictDetected'
  ],
  SMS: [
    'WaitingListSlotAvailable',
    'ReassignmentRequestEscalated',
    'WaitingListSlotExpired',
    'ReassignmentRequestExpired'
  ],
  PUSH: [
    'WaitingListSlotAvailable',
    'ReassignmentRequestCreated',
    'RecurringReservationInstanceConfirmed',
    'UserConfirmedWaitingListSlot'
  ],
  IN_APP: [
    'RecurringReservationUpdated',
    'WaitingListPositionsReordered',
    'EquivalentResourcesFound',
    'ReassignmentSuggestionRejected'
  ]
} as const;

// Helper functions for event handling
export const EventHelpers = {
  /**
   * Check if an event requires immediate notification
   */
  isHighPriorityEvent(eventType: AvailabilityServiceEventType): boolean {
    return EventPriorities.HIGH.includes(eventType as any);
  },

  /**
   * Get notification channels for an event type
   */
  getNotificationChannels(eventType: AvailabilityServiceEventType): string[] {
    const channels: string[] = [];
    
    if (EventNotificationChannels.EMAIL.includes(eventType as any)) {
      channels.push('EMAIL');
    }
    if (EventNotificationChannels.SMS.includes(eventType as any)) {
      channels.push('SMS');
    }
    if (EventNotificationChannels.PUSH.includes(eventType as any)) {
      channels.push('PUSH');
    }
    if (EventNotificationChannels.IN_APP.includes(eventType as any)) {
      channels.push('IN_APP');
    }
    
    return channels;
  },

  /**
   * Get event category for an event type
   */
  getEventCategory(eventType: AvailabilityServiceEventType): string {
    if (EventCategories.RECURRING_RESERVATION.includes(eventType as any)) {
      return 'RECURRING_RESERVATION';
    }
    if (EventCategories.WAITING_LIST.includes(eventType as any)) {
      return 'WAITING_LIST';
    }
    if (EventCategories.REASSIGNMENT.includes(eventType as any)) {
      return 'REASSIGNMENT';
    }
    return 'UNKNOWN';
  },

  /**
   * Check if event requires user confirmation
   */
  requiresUserConfirmation(eventType: AvailabilityServiceEventType): boolean {
    const confirmationRequiredEvents = [
      'WaitingListSlotAvailable',
      'ReassignmentRequestCreated',
      'RecurringReservationConflictDetected'
    ];
    return confirmationRequiredEvents.includes(eventType);
  },

  /**
   * Check if event should trigger audit log
   */
  requiresAuditLog(eventType: AvailabilityServiceEventType): boolean {
    const auditRequiredEvents = [
      'RecurringReservationCreated',
      'RecurringReservationCancelled',
      'WaitingListPriorityEscalated',
      'ReassignmentRequestEscalated',
      'ReassignmentApplied'
    ];
    return auditRequiredEvents.includes(eventType);
  }
};
