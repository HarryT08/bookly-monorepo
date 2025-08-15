/**
 * Domain Events Index
 * Centralized export for all domain events in reports-service
 * Event-Driven Architecture for Report Generation and Analytics
 */

import { ReportEvents } from './report.events';

// Report Events
export {
  ReportEvents
};

// Individual event exports
export {
  ReportGeneratedEvent,
  ReportScheduledEvent,
  ReportFailedEvent,
  DashboardUpdatedEvent,
  DashboardViewedEvent,
  AnalyticsCalculatedEvent,
  AlertTriggeredEvent,
  ReportExportedEvent,
  DataRefreshedEvent,
  type ReportGeneratedEventData,
  type ReportScheduledEventData,
  type ReportFailedEventData,
  type DashboardUpdatedEventData,
  type DashboardViewedEventData,
  type AnalyticsCalculatedEventData,
  type AlertTriggeredEventData,
  type ReportExportedEventData,
  type DataRefreshedEventData,
} from './report.events';

// Union type for all reports service events
export type ReportsServiceEventType = 
  | 'ReportGenerated'
  | 'ReportScheduled'
  | 'ReportFailed'
  | 'DashboardUpdated'
  | 'DashboardViewed'
  | 'AnalyticsCalculated'
  | 'AlertTriggered'
  | 'ReportExported'
  | 'DataRefreshed';

// All events collection
export const ReportsServiceEvents = {
  ...ReportEvents
} as const;

// Event categories for filtering and routing
export const EventCategories = {
  REPORT_GENERATION: [
    'ReportGenerated',
    'ReportScheduled',
    'ReportFailed',
    'ReportExported'
  ] as const,
  
  DASHBOARD: [
    'DashboardUpdated',
    'DashboardViewed'
  ] as const,
  
  ANALYTICS: [
    'AnalyticsCalculated',
    'AlertTriggered'
  ] as const,

  DATA_MANAGEMENT: [
    'DataRefreshed'
  ] as const
} as const;

// Event priority levels for notification routing
export const EventPriorities = {
  HIGH: [
    'ReportFailed',
    'AlertTriggered'
  ],
  MEDIUM: [
    'ReportGenerated',
    'DashboardUpdated',
    'AnalyticsCalculated',
    'ReportExported'
  ],
  LOW: [
    'ReportScheduled',
    'DashboardViewed',
    'DataRefreshed'
  ]
} as const;

// Event notification channels mapping
export const EventNotificationChannels = {
  EMAIL: [
    'ReportGenerated',
    'ReportFailed',
    'AlertTriggered',
    'ReportExported'
  ],
  SMS: [
    'AlertTriggered',
    'ReportFailed'
  ],
  PUSH: [
    'ReportGenerated',
    'AlertTriggered',
    'DashboardUpdated'
  ],
  IN_APP: [
    'ReportScheduled',
    'DashboardUpdated',
    'DashboardViewed',
    'AnalyticsCalculated',
    'DataRefreshed'
  ]
} as const;

// Helper functions for event handling
export const EventHelpers = {
  /**
   * Check if an event requires immediate notification
   */
  isHighPriorityEvent(eventType: ReportsServiceEventType): boolean {
    return EventPriorities.HIGH.includes(eventType as any);
  },

  /**
   * Get notification channels for an event type
   */
  getNotificationChannels(eventType: ReportsServiceEventType): string[] {
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
  getEventCategory(eventType: ReportsServiceEventType): string {
    if (EventCategories.REPORT_GENERATION.includes(eventType as any)) {
      return 'REPORT_GENERATION';
    }
    if (EventCategories.DASHBOARD.includes(eventType as any)) {
      return 'DASHBOARD';
    }
    if (EventCategories.ANALYTICS.includes(eventType as any)) {
      return 'ANALYTICS';
    }
    if (EventCategories.DATA_MANAGEMENT.includes(eventType as any)) {
      return 'DATA_MANAGEMENT';
    }
    return 'UNKNOWN';
  },

  /**
   * Check if event requires user confirmation
   */
  requiresUserConfirmation(eventType: ReportsServiceEventType): boolean {
    const confirmationRequiredEvents = [
      'AlertTriggered'
    ];
    return confirmationRequiredEvents.includes(eventType);
  },

  /**
   * Check if event should trigger audit log
   */
  requiresAuditLog(eventType: ReportsServiceEventType): boolean {
    const auditRequiredEvents = [
      'ReportGenerated',
      'ReportExported',
      'DashboardUpdated',
      'AlertTriggered'
    ];
    return auditRequiredEvents.includes(eventType);
  },

  /**
   * Check if event affects performance metrics
   */
  affectsPerformanceMetrics(eventType: ReportsServiceEventType): boolean {
    const performanceEvents = [
      'ReportGenerated',
      'ReportFailed',
      'AnalyticsCalculated',
      'DataRefreshed'
    ];
    return performanceEvents.includes(eventType);
  },

  /**
   * Check if event requires real-time processing
   */
  requiresRealTimeProcessing(eventType: ReportsServiceEventType): boolean {
    const realTimeEvents = [
      'AlertTriggered',
      'DashboardViewed'
    ];
    return realTimeEvents.includes(eventType);
  }
};
