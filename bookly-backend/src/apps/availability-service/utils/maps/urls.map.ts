/**
 * Availability Service - URL Map
 * Centralized mapping for all URLs and endpoints used in the availability service
 */

export const AVAILABILITY_URLS = {
  // Base paths
  BASE: '/availability',
  API_VERSION: '/api/v1',
  
  // Basic Availability endpoints
  AVAILABILITY_BASIC: '/basic',
  AVAILABILITY_GET: '/basic',
  AVAILABILITY_CHECK: '/check',
  AVAILABILITY_CALENDAR: '/calendar/:resourceId',
  AVAILABILITY_WITH_CONFLICTS: '/availability-with-conflicts',
  CALENDAR_VIEW: '/calendar-view',
  
  // History endpoints
  HISTORY: '/history',
  RESERVATION_HISTORY: '/reservation-history',
  RESERVATION_HISTORY_DETAILED: '/reservation-history/detailed',
  RESERVATION_HISTORY_EXPORT: '/reservation-history/export',

  // Advanced Search endpoints
  ADVANCED_SEARCH_TAG: 'Advanced Search',
  ADVANCED_SEARCH: '/availability/search',
  ADVANCED_SEARCH_CREATE: '/advanced',
  ADVANCED_SEARCH_CHECK: '/availability',
  ADVANCED_SEARCH_QUICK: '/quick',
  ADVANCED_SEARCH_POPULAR: '/popular',
  ADVANCED_SEARCH_HISTORY: '/history',
  
  
  // Reservation endpoints
  RESERVATIONS: '/reservations',
  RESERVATION_CREATE: '/',
  RESERVATION_UPDATE: '/:id',
  RESERVATION_CANCEL: '/:id/cancel',
  RESERVATION_CONFIRM: '/:id/confirm',
  RESERVATION_COMPLETE: '/:id/complete',
  RESERVATION_CHECK_AVAILABILITY: '/check-availability',
  RESERVATION_CONFLICTS: '/conflicts',
  
  // Recurring Reservation endpoints
  RECURRING_RESERVATIONS_TAG: 'Recurring Reservations',
  RECURRING_RESERVATIONS: '/recurring-reservations',
  RECURRING_RESERVATIONS_FIND_ALL: '/recurring-reservations/all',
  RECURRING_RESERVATION_BY_ID: '/recurring-reservations/:id',
  RECURRING_RESERVATION_CREATE: '/recurring-reservations/create',
  RECURRING_RESERVATION_UPDATE: '/recurring-reservations/:id',
  RECURRING_RESERVATION_CANCEL: '/recurring-reservations/:id/cancel',
  RECURRING_INSTANCES: '/recurring-reservations/:id/instances',
  RECURRING_INSTANCE_SKIP: '/recurring-reservations/:id/instances/:instanceId/skip',
  RECURRING_INSTANCE_GENERATE: '/recurring-reservations/:id/generate-instances',
  RECURRING_INSTANCE_MODIFY: '/recurring-reservations/:id/instances/:instanceId/modify',
  RECURRING_RESERVATION_STATS: '/recurring-reservations/:id/stats',
  RECURRING_RESERVATION_VALIDATE: '/recurring-reservations/validate',
  RECURRING_RESERVATIONS_USER: '/recurring-reservations/user/:userId',
  RECURRING_RESERVATIONS_RESOURCE: '/recurring-reservations/resource/:resourceId',
  RECURRING_RESERVATIONS_BULK_CANCEL: '/recurring-reservations/bulk-cancel',
  
  // Waiting List endpoints
  WAITING_LIST_TAG: 'Waiting List',
  WAITING_LIST: '/waiting-list',
  WAITING_LIST_JOIN: '/waiting-list/join',
  WAITING_LIST_LEAVE: '/waiting-list/:id/leave',
  WAITING_LIST_POSITION: '/waiting-list/:id/position',
  WAITING_LIST_NOTIFICATIONS: '/waiting-list/:id/notifications',
  MY_WAITING_LIST: '/waiting-list/my-entries',
  // Extended waiting list endpoints (align with current controllers)
  WAITING_LIST_ENTRY_BY_ID: '/waiting-list/entries/:id',
  WAITING_LIST_ENTRY_CONFIRM: '/waiting-list/entries/:id/confirm',
  WAITING_LIST_ENTRY_ESCALATE: '/waiting-list/entries/:id/escalate',
  WAITING_LIST_ENTRY_POSITION: '/waiting-list/entries/:id/position',
  WAITING_LIST_LEAVE_ENTRY: '/waiting-list/entries/:id',
  WAITING_LIST_FOR_RESOURCE: '/waiting-list/resource/:resourceId',
  WAITING_LIST_PROCESS_AVAILABLE_SLOTS: '/waiting-list/process-available-slots',
  WAITING_LIST_STATS_RESOURCE: '/waiting-list/stats/resource/:resourceId',
  WAITING_LIST_VALIDATE_JOIN: '/waiting-list/validate-join',
  WAITING_LIST_BULK_NOTIFY: '/waiting-list/bulk-notify',
  WAITING_LIST_PROCESS_EXPIRED: '/waiting-list/process-expired',
  WAITING_LIST_ANALYTICS_PERFORMANCE: '/waiting-list/analytics/performance',
  
  // Reassignment endpoints
  REASSIGNMENTS_TAG: 'Reassignment',
  REASSIGNMENTS: '/reassignments',
  REASSIGNMENT_REQUEST_CREATE: '/reassignments/request',
  REASSIGNMENT_REQUEST: '/reassignments/request',
  REASSIGNMENT_REQUEST_FIND_BY_ID: '/reassignments/request/:id',
  REASSIGNMENT_REQUEST_RESPOND: '/reassignments/request/:id/respond',
  REASSIGNMENT_EQUIVALENT_RESOURCES: '/reassignments/equivalent-resources/:resourceId',
  REASSIGNMENT_REQUEST_VALIDATE: '/reassignments/validate-request',
  REASSIGNMENT_REQUEST_CANCEL: '/reassignments/request/:id/cancel',
  REASSIGNMENT_REQUEST_AUTO_PROCESS: '/reassignments/request/:id/auto-process',
  REASSIGNMENT_ANALYTICS: '/reassignments/analytics',
  REASSIGNMENT_BULK_PROCESS: '/reassignments/bulk-process',
  REASSIGNMENT_SUCCESS_PREDICTION: '/reassignments/requests/:id/success-prediction',
  REASSIGNMENT_USER_HISTORY: '/reassignments/user/:userId/history',
  REASSIGNMENT_CONFIGURATION_OPTIMIZE: '/reassignments/configuration/optimize',
  MY_REASSIGNMENTS: '/reassignments/my-requests',
  
  // Schedule endpoints
  SCHEDULES: '/schedules',
  SCHEDULE_CREATE: '/schedules/create',
  SCHEDULE_UPDATE: '/schedules/:id',
  SCHEDULE_DELETE: '/schedules/:id',
  SCHEDULE_EXCEPTIONS: '/schedules/:id/exceptions',
  SCHEDULE_MAINTENANCE: '/schedules/:id/maintenance',
  RESOURCE_SCHEDULES: '/resources/:resourceId/schedules',
  
  // Calendar Integration endpoints
  CALENDAR_INTEGRATIONS: '/calendar-integrations',
  CALENDAR_INTEGRATION_CREATE: '/calendar-integrations/create',
  CALENDAR_INTEGRATION_UPDATE: '/calendar-integrations/:id',
  CALENDAR_INTEGRATION_DELETE: '/calendar-integrations/:id',
  CALENDAR_SYNC: '/calendar-integrations/:integrationId/sync',
  CALENDAR_EVENTS: '/calendar-integrations/:integrationId/events',
  
  // Penalty endpoints
  PENALTIES_TAG: 'Penalties',
  PENALTIES: '/penalties',
  PENALTY_APPLY: '/apply',
  PENALTY_REMOVE: '/:id/remove',
  PENALTY_EVENTS: '/events',
  PENALTY_EVENTS_UPDATE: '/events/:id',
  PENALTY_EVENTS_DELETE: '/events/:id',
  PENALTY_CONFIGURATIONS: '/configurations',
  PENALTY_MY_PENALTIES: '/my-penalties',
  PENALTY_USER_DELETE: '/my-penalties/:id/delete',
  PENALTY_VALIDATION_AND_CHECKING: '/validate-action',
  PENALTY_USER_PENALTIES: '/user/:userId',
  PENALTY_USER_SCORE: '/user/:userId/score',
  PENALTY_ANALYTICS: '/analytics',
  PENALTY_PROCESS_EXPIRED: '/process-expired',
  PENALTY_BULK_APPLY: '/bulk-apply',
  PENALTY_RISK_PREDICTION: '/user/:userId/risk-prediction',
  PENALTY_APPEAL: '/user-penalties/:id/appeal',
  PENALTY_CONFIGURATION_OPTIMIZE: '/configuration/optimize',
  
  // Resource Equivalence endpoints
  RESOURCE_EQUIVALENCES: '/resource-equivalences',
  RESOURCE_EQUIVALENCE_CREATE: '/resource-equivalences/create',
  RESOURCE_EQUIVALENCE_UPDATE: '/resource-equivalences/:id',
  RESOURCE_EQUIVALENCE_DELETE: '/resource-equivalences/:id',
  ALTERNATIVE_RESOURCES: '/resources/:resourceId/alternatives',
  
  // Limit endpoints
  RESERVATION_LIMITS: '/reservation-limits',
  RESERVATION_LIMIT_CREATE: '/reservation-limits/create',
  RESERVATION_LIMIT_UPDATE: '/reservation-limits/:id',
  RESERVATION_LIMIT_DELETE: '/reservation-limits/:id',
  USER_LIMITS: '/users/:userId/limits',
  RESOURCE_LIMITS: '/resources/:resourceId/limits',
  
  // Notification endpoints
  NOTIFICATION_TAG: 'Notifications',
  NOTIFICATION: '/notifications',
  NOTIFICATION_TEMPLATES: '/templates',
  NOTIFICATION_TEMPLATES_CREATE: '/templates',
  NOTIFICATION_TEMPLATES_UPDATE: '/templates/:id',
  NOTIFICATION_TEMPLATES_DELETE: '/templates/:id',
  NOTIFICATION_TEMPLATES_TEST: '/templates/:templateId/test',
  NOTIFICATION_TEMPLATES_BY_EVENT_TYPE: '/templates/:eventType/:channel/:language',
  NOTIFICATION_STATS: '/stats',
  NOTIFICATION_SEND: '/send',
  NOTIFICATION_PREFERENCES: '/preferences/:userId',
  NOTIFICATION_PREFERENCES_UPDATE: '/preferences/:userId',
  
  // Audit endpoints
  AUDIT_TAG: 'Audit',
  AUDIT: '/audit',
  AUDIT_ENTRIES: '/entries',
  AUDIT_ENTRIES_FIND_BY_ID: '/entries/:id',
  AUDIT_STATISTICS: '/statistics',
  AUDIT_EXPORT: '/export',
  AUDIT_EVENT_TYPES: '/event-types',
  AUDIT_CATEGORIES: '/categories',
  AUDIT_CLEANUP: '/cleanup',
  AUDIT_TEST_ENTRY: '/test-entry',

  AUDIT_LOGS: '/audit-logs',
  AUDIT_SEARCH: '/audit-logs/search',
  USER_AUDIT: '/users/:userId/audit-logs',
  RESOURCE_AUDIT: '/resources/:resourceId/audit-logs',
  
  // Analytics and Reports
  ANALYTICS: '/analytics',
  USAGE_STATS: '/analytics/usage-stats',
  AVAILABILITY_STATS: '/analytics/availability-stats',
  CONFLICT_REPORTS: '/analytics/conflict-reports',
  UTILIZATION_REPORTS: '/analytics/utilization-reports',
  
  // Health and monitoring
  HEALTH: '/health',
  METRICS: '/metrics'
} as const;

export const getAvailabilityUrl = (endpoint: keyof typeof AVAILABILITY_URLS, params?: Record<string, string>): string => {
  let url = AVAILABILITY_URLS.BASE + AVAILABILITY_URLS.API_VERSION + AVAILABILITY_URLS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

export type AvailabilityUrlType = typeof AVAILABILITY_URLS[keyof typeof AVAILABILITY_URLS];
