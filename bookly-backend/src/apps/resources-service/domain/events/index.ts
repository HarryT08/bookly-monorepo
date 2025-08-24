/**
 * Domain Events Index
 * Centralized export for all domain events in resources-service
 * Event-Driven Architecture for Resource Management
 */

import { ResourceEvents } from './resource.events';

// Resource Events
export {
  ResourceEvents
};

// Individual event exports
export {
  ResourceCreatedEvent,
  ResourceUpdatedEvent,
  ResourceDeletedEvent,
  ResourceActivatedEvent,
  ResourceDeactivatedEvent,
  MaintenanceScheduledEvent,
  MaintenanceStartedEvent,
  MaintenanceCompletedEvent,
  CategoryCreatedEvent,
  ResourceImportStartedEvent,
  ResourceImportCompletedEvent,
  type ResourceCreatedEventData,
  type ResourceUpdatedEventData,
  type ResourceDeletedEventData,
  type ResourceActivatedEventData,
  type ResourceDeactivatedEventData,
  type MaintenanceScheduledEventData,
  type MaintenanceStartedEventData,
  type MaintenanceCompletedEventData,
  type CategoryCreatedEventData,
  type ResourceImportStartedEventData,
  type ResourceImportCompletedEventData,
} from './resource.events';

// Union type for all resource service events
export type ResourceServiceEventType = 
  | 'ResourceCreated'
  | 'ResourceUpdated'
  | 'ResourceDeleted'
  | 'ResourceActivated'
  | 'ResourceDeactivated'
  | 'MaintenanceScheduled'
  | 'MaintenanceStarted'
  | 'MaintenanceCompleted'
  | 'CategoryCreated'
  | 'ResourceImportStarted'
  | 'ResourceImportCompleted';

// All events collection
export const ResourceServiceEvents = {
  ...ResourceEvents
} as const;

// Event categories for filtering and routing
export const EventCategories = {
  RESOURCE_MANAGEMENT: [
    'ResourceCreated',
    'ResourceUpdated',
    'ResourceDeleted',
    'ResourceActivated',
    'ResourceDeactivated'
  ] as const,
  
  MAINTENANCE: [
    'MaintenanceScheduled',
    'MaintenanceStarted',
    'MaintenanceCompleted'
  ] as const,
  
  CATEGORY_MANAGEMENT: [
    'CategoryCreated'
  ] as const,

  IMPORT_EXPORT: [
    'ResourceImportStarted',
    'ResourceImportCompleted'
  ] as const
} as const;

// Event priority levels for notification routing
export const EventPriorities = {
  HIGH: [
    'ResourceDeleted',
    'MaintenanceScheduled',
    'MaintenanceStarted',
    'ResourceDeactivated'
  ],
  MEDIUM: [
    'ResourceCreated',
    'ResourceUpdated',
    'MaintenanceCompleted',
    'CategoryCreated'
  ],
  LOW: [
    'ResourceActivated',
    'ResourceImportStarted',
    'ResourceImportCompleted'
  ]
} as const;

// Event notification channels mapping
export const EventNotificationChannels = {
  EMAIL: [
    'ResourceCreated',
    'ResourceDeleted',
    'MaintenanceScheduled',
    'MaintenanceCompleted',
    'ResourceImportCompleted'
  ],
  SMS: [
    'MaintenanceScheduled',
    'ResourceDeleted'
  ],
  PUSH: [
    'MaintenanceStarted',
    'MaintenanceCompleted',
    'ResourceCreated'
  ],
  IN_APP: [
    'ResourceUpdated',
    'ResourceActivated',
    'ResourceDeactivated',
    'CategoryCreated',
    'ResourceImportStarted',
    'ResourceImportCompleted'
  ]
} as const;

// Helper functions for event handling
export const EventHelpers = {
  /**
   * Check if an event requires immediate notification
   */
  isHighPriorityEvent(eventType: ResourceServiceEventType): boolean {
    return EventPriorities.HIGH.includes(eventType as any);
  },

  /**
   * Get notification channels for an event type
   */
  getNotificationChannels(eventType: ResourceServiceEventType): string[] {
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
  getEventCategory(eventType: ResourceServiceEventType): string {
    if (EventCategories.RESOURCE_MANAGEMENT.includes(eventType as any)) {
      return 'RESOURCE_MANAGEMENT';
    }
    if (EventCategories.MAINTENANCE.includes(eventType as any)) {
      return 'MAINTENANCE';
    }
    if (EventCategories.CATEGORY_MANAGEMENT.includes(eventType as any)) {
      return 'CATEGORY_MANAGEMENT';
    }
    if (EventCategories.IMPORT_EXPORT.includes(eventType as any)) {
      return 'IMPORT_EXPORT';
    }
    return 'UNKNOWN';
  },

  /**
   * Check if event requires user confirmation
   */
  requiresUserConfirmation(eventType: ResourceServiceEventType): boolean {
    const confirmationRequiredEvents = [
      'ResourceDeleted',
      'MaintenanceScheduled'
    ];
    return confirmationRequiredEvents.includes(eventType);
  },

  /**
   * Check if event should trigger audit log
   */
  requiresAuditLog(eventType: ResourceServiceEventType): boolean {
    const auditRequiredEvents = [
      'ResourceCreated',
      'ResourceUpdated',
      'ResourceDeleted',
      'MaintenanceScheduled',
      'MaintenanceCompleted',
      'CategoryCreated'
    ];
    return auditRequiredEvents.includes(eventType);
  },

  /**
   * Check if event affects resource availability
   */
  affectsResourceAvailability(eventType: ResourceServiceEventType): boolean {
    const availabilityEvents = [
      'ResourceDeleted',
      'ResourceActivated',
      'ResourceDeactivated',
      'MaintenanceScheduled',
      'MaintenanceStarted',
      'MaintenanceCompleted'
    ];
    return availabilityEvents.includes(eventType);
  }
};
