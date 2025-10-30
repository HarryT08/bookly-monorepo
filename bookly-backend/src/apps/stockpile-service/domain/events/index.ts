/**
 * Domain Events Index
 * Centralized export for all domain events in stockpile-service
 * Event-Driven Architecture for Approval Flows and Validation
 */

import { ApprovalEvents } from './approval.events';

// Approval Events
export {
  ApprovalEvents
};

// Individual event exports
export {
  ApprovalFlowCreatedEvent,
  RequestSubmittedEvent,
  RequestApprovedEvent,
  RequestRejectedEvent,
  RequestEscalatedEvent,
  RequestTimeoutEvent,
  DocumentGeneratedEvent,
  NotificationSentEvent,
  CheckInEvent,
  CheckOutEvent,
  ValidationFailedEvent,
  type ApprovalFlowCreatedEventData,
  type RequestSubmittedEventData,
  type RequestApprovedEventData,
  type RequestRejectedEventData,
  type RequestEscalatedEventData,
  type RequestTimeoutEventData,
  type DocumentGeneratedEventData,
  type NotificationSentEventData,
  type CheckInEventData,
  type CheckOutEventData,
  type ValidationFailedEventData,
} from './approval.events';

// Union type for all stockpile service events
export type StockpileServiceEventType = 
  | 'ApprovalFlowCreated'
  | 'RequestSubmitted'
  | 'RequestApproved'
  | 'RequestRejected'
  | 'RequestEscalated'
  | 'RequestTimeout'
  | 'DocumentGenerated'
  | 'NotificationSent'
  | 'CheckIn'
  | 'CheckOut'
  | 'ValidationFailed';

// All events collection
export const StockpileServiceEvents = {
  ...ApprovalEvents
} as const;

// Event categories for filtering and routing
export const EventCategories = {
  APPROVAL_FLOW: [
    'ApprovalFlowCreated',
    'RequestSubmitted',
    'RequestApproved',
    'RequestRejected',
    'RequestEscalated',
    'RequestTimeout'
  ] as const,
  
  DOCUMENT_MANAGEMENT: [
    'DocumentGenerated'
  ] as const,
  
  NOTIFICATION: [
    'NotificationSent'
  ] as const,

  CHECK_IN_OUT: [
    'CheckIn',
    'CheckOut'
  ] as const,

  VALIDATION: [
    'ValidationFailed'
  ] as const
} as const;

// Event priority levels for notification routing
export const EventPriorities = {
  HIGH: [
    'RequestRejected',
    'RequestEscalated',
    'RequestTimeout',
    'ValidationFailed'
  ],
  MEDIUM: [
    'RequestSubmitted',
    'RequestApproved',
    'DocumentGenerated',
    'CheckIn',
    'CheckOut'
  ],
  LOW: [
    'ApprovalFlowCreated',
    'NotificationSent'
  ]
} as const;

// Event notification channels mapping
export const EventNotificationChannels = {
  EMAIL: [
    'RequestSubmitted',
    'RequestApproved',
    'RequestRejected',
    'RequestEscalated',
    'DocumentGenerated'
  ],
  SMS: [
    'RequestApproved',
    'RequestRejected',
    'RequestEscalated',
    'RequestTimeout'
  ],
  PUSH: [
    'RequestSubmitted',
    'RequestApproved',
    'CheckIn',
    'CheckOut'
  ],
  IN_APP: [
    'ApprovalFlowCreated',
    'RequestSubmitted',
    'RequestApproved',
    'RequestRejected',
    'ValidationFailed',
    'NotificationSent'
  ]
} as const;

// Helper functions for event handling
export const EventHelpers = {
  /**
   * Check if an event requires immediate notification
   */
  isHighPriorityEvent(eventType: StockpileServiceEventType): boolean {
    return EventPriorities.HIGH.includes(eventType as any);
  },

  /**
   * Get notification channels for an event type
   */
  getNotificationChannels(eventType: StockpileServiceEventType): string[] {
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
  getEventCategory(eventType: StockpileServiceEventType): string {
    if (EventCategories.APPROVAL_FLOW.includes(eventType as any)) {
      return 'APPROVAL_FLOW';
    }
    if (EventCategories.DOCUMENT_MANAGEMENT.includes(eventType as any)) {
      return 'DOCUMENT_MANAGEMENT';
    }
    if (EventCategories.NOTIFICATION.includes(eventType as any)) {
      return 'NOTIFICATION';
    }
    if (EventCategories.CHECK_IN_OUT.includes(eventType as any)) {
      return 'CHECK_IN_OUT';
    }
    if (EventCategories.VALIDATION.includes(eventType as any)) {
      return 'VALIDATION';
    }
    return 'UNKNOWN';
  },

  /**
   * Check if event requires user confirmation
   */
  requiresUserConfirmation(eventType: StockpileServiceEventType): boolean {
    const confirmationRequiredEvents = [
      'RequestApproved',
      'RequestRejected',
      'CheckIn',
      'CheckOut'
    ];
    return confirmationRequiredEvents.includes(eventType);
  },

  /**
   * Check if event should trigger audit log
   */
  requiresAuditLog(eventType: StockpileServiceEventType): boolean {
    const auditRequiredEvents = [
      'ApprovalFlowCreated',
      'RequestSubmitted',
      'RequestApproved',
      'RequestRejected',
      'RequestEscalated',
      'CheckIn',
      'CheckOut'
    ];
    return auditRequiredEvents.includes(eventType);
  },

  /**
   * Check if event affects approval workflow
   */
  affectsApprovalWorkflow(eventType: StockpileServiceEventType): boolean {
    const workflowEvents = [
      'RequestSubmitted',
      'RequestApproved',
      'RequestRejected',
      'RequestEscalated',
      'RequestTimeout'
    ];
    return workflowEvents.includes(eventType);
  },

  /**
   * Check if event requires security monitoring
   */
  requiresSecurityMonitoring(eventType: StockpileServiceEventType): boolean {
    const securityEvents = [
      'RequestEscalated',
      'ValidationFailed',
      'CheckIn',
      'CheckOut'
    ];
    return securityEvents.includes(eventType);
  }
};
