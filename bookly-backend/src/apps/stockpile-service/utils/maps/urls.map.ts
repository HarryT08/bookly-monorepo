/**
 * Stockpile Service - URL Map
 * Centralized mapping for all URLs and endpoints used in the stockpile service
 */

export const STOCKPILE_URLS = {
  // Base paths
  BASE: '/stockpile',
  API_VERSION: '/api/v1',
  
  // Approval Flow endpoints
  APPROVAL_FLOWS: '/approval-flows',
  APPROVAL_FLOW_CREATE: '/approval-flows/create',
  APPROVAL_FLOW_UPDATE: '/approval-flows/:id',
  APPROVAL_FLOW_DELETE: '/approval-flows/:id',
  APPROVAL_FLOW_ACTIVATE: '/approval-flows/:id/activate',
  APPROVAL_FLOW_DEACTIVATE: '/approval-flows/:id/deactivate',
  APPROVAL_FLOW_DEFAULT_SEARCH: '/approval-flows/default/search',
  APPROVAL_FLOW_LEVELS: '/approval-flows/:id/levels',
  APPROVAL_FLOW_SUBMIT: '/reservations/:reservationId/submit',
  APPROVAL_FLOW_REQUESTS_PENDING: '/approval-flow/requests/pending',
  APPROVAL_FLOW_REQUESTS_PROCESS: '/approval-flow/requests/:requestId/process',
  APPROVAL_FLOW_REQUESTS_BY_RESERVATION: '/approval-flow/reservations/:reservationId/requests',
  APPROVAL_FLOW_REQUESTS_STATUS: '/approval-flow/reservations/:reservationId/status',
  APPROVAL_FLOW_REQUESTS_CANCEL: '/approval-flow/reservations/:reservationId/cancel',
  
  // Approval Request endpoints
  APPROVAL_REQUESTS: '/approval-requests',
  APPROVAL_REQUEST_SUBMIT: '/approval-requests/submit',
  APPROVAL_REQUEST_APPROVE: '/approval-requests/:id/approve',
  APPROVAL_REQUEST_REJECT: '/approval-requests/:id/reject',
  APPROVAL_REQUEST_DOCUMENT: '/approval-requests/:id/document',
  APPROVAL_REQUEST_CANCEL: '/approval-requests/:id/cancel',
  APPROVAL_REQUEST_DELEGATE: '/approval-requests/:id/delegate',
  APPROVAL_REQUEST_STATUS: '/approval-requests/:id/status',
  
  // Approval Action endpoints
  APPROVAL_ACTIONS: '/approval-actions',
  APPROVAL_ACTION_CREATE: '/approval-actions/create',
  APPROVAL_COMMENT_ADD: '/approval-requests/:id/comments',
  APPROVAL_ESCALATE: '/approval-requests/:id/escalate',
  
  // Document Template endpoints
  DOCUMENT_TEMPLATES: '/document-templates',
  DOCUMENT_TEMPLATE_CREATE: '/document-templates/create',
  DOCUMENT_TEMPLATE_UPDATE: '/document-templates/:id',
  DOCUMENT_TEMPLATE_DELETE: '/document-templates/:id',
  DOCUMENT_TEMPLATE_ACTIVATE: '/document-templates/:id/activate',
  DOCUMENT_TEMPLATE_DEACTIVATE: '/document-templates/:id/deactivate',
  DOCUMENT_TEMPLATE_PREVIEW: '/document-templates/:id/preview',
  DOCUMENT_TEMPLATE_DEFAULT_SEARCH: '/document-templates/default/search',
  DOCUMENT_TEMPLATE_UPLOAD: '/document-templates/:id/upload',
  DOCUMENT_TEMPLATE_VARIABLES: '/document-templates/:id/variables',
  DOCUMENT_TEMPLATE_AVAILABLE_VARIABLES: '/document-templates/variables/available',
  
  // Document Generation endpoints
  DOCUMENTS: '/documents',
  DOCUMENT_GENERATE: '/documents/generate',
  DOCUMENT_GENERATED_BY_RESERVATION: '/documents/generated/reservation/:reservationId',
  DOCUMENT_GENERATED_BY_ID: '/documents/generated/:id',
  DOCUMENT_DOWNLOAD: '/documents/:id/download',
  DOCUMENT_SIGN: '/documents/:id/sign',
  DOCUMENT_DELIVER: '/documents/:id/deliver',
  DOCUMENT_STATUS: '/documents/:id/status',
  
  // Notification Template endpoints
  NOTIFICATION_TEMPLATES: '/notification-templates',
  NOTIFICATION_TEMPLATE_BY_ID: '/notification-templates/:id',
  NOTIFICATION_TEMPLATE_DEFAULT_SEARCH: '/notification-templates/default/search',
  NOTIFICATION_TEMPLATE_VARIABLES: '/notification-templates/:id/variables',
  NOTIFICATION_TEMPLATE_AVAILABLE_VARIABLES: '/notification-templates/variables/available',
  NOTIFICATION_TEMPLATE_CREATE: '/notification-templates/create',
  NOTIFICATION_TEMPLATE_UPDATE: '/notification-templates/:id',
  NOTIFICATION_TEMPLATE_DELETE: '/notification-templates/:id',
  NOTIFICATION_TEMPLATE_PENDING: '/notification-templates/pending',
  NOTIFICATION_TEMPLATE_ACTIVATE: '/notification-templates/:id/activate',
  NOTIFICATION_TEMPLATE_DEACTIVATE: '/notification-templates/:id/deactivate',
  NOTIFICATION_TEMPLATE_TEST: '/notification-templates/:id/test',
  NOTIFICATION_TEMPLATE_SEND: '/notification-templates/:id/send',
  NOTIFICATION_TEMPLATE_SEND_BATCH: '/notification-templates/:id/send-batch',
  NOTIFICATION_TEMPLATE_SENT_BY_RESERVATION: '/notification-templates/:id/sent/reservation/:reservationId',
  NOTIFICATION_TEMPLATE_SENT_BY_RECIPIENT: '/notification-templates/:id/sent/recipient/:recipientId',
  NOTIFICATION_CONFIGS: '/notification-templates/configs',
  NOTIFICATION_CONFIGS_BY_ID: '/notification-templates/configs/:id',
  NOTIFICATION_TEMPLATE_BATCH: '/notification-templates/batch/:channelId',
  NOTIFICATION_TEMPLATE_MARK_READ: '/sent/:id/mark-read',
  
  // Notification endpoints
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_SEND: '/notifications/send',
  NOTIFICATION_STATUS: '/notifications/:id/status',
  NOTIFICATION_HISTORY: '/notifications/history',
  NOTIFICATION_PREFERENCES: '/users/:userId/notification-preferences',
  
  // Notification Channel endpoints
  NOTIFICATION_CHANNELS: '/notification-templates/channels',
  NOTIFICATION_CHANNEL_BY_ID: '/notification-templates/channels/:id',
  NOTIFICATION_CHANNEL_CREATE: '/notification-templates/channels/create',
  NOTIFICATION_CHANNEL_UPDATE: '/notification-templates/channels/:id',
  NOTIFICATION_CHANNEL_DELETE: '/notification-templates/channels/:id',
  NOTIFICATION_CHANNEL_TEST: '/notification-templates/channels/:id/test',
  
  // Check-in/Check-out endpoints
  CHECKIN: '/checkin',
  CHECKIN_STATUS: '/check-in-status/:reservationId',
  CHECKOUT: '/checkout',
  CHECKIN_RESERVATION: '/reservations/:reservationId/checkin',
  CHECKOUT_RESERVATION: '/reservations/:reservationId/checkout',
  DIGITAL_SIGNATURE: '/reservations/:reservationId/signature',
  
  // Validation endpoints
  VALIDATE_RESERVATION: '/validate/reservation/:id',
  VALIDATE_DOCUMENT: '/validate/document/:id',
  VALIDATE_USER_PERMISSIONS: '/validate/user/:userId/permissions',
  
  // Integration endpoints
  WHATSAPP: '/integrations/whatsapp',
  WHATSAPP_SEND: '/integrations/whatsapp/send',
  EMAIL_SEND: '/integrations/email/send',
  SMS_SEND: '/integrations/sms/send',
  WEBHOOK_TRIGGER: '/integrations/webhook/trigger',
  
  // Security endpoints
  SECURITY_LOGS: '/security/logs',
  ACCESS_CONTROL: '/security/access-control',
  PERMISSIONS_CHECK: '/security/permissions/check',
  
  // Audit endpoints
  AUDIT_LOGS: '/audit-logs',
  APPROVAL_AUDIT: '/audit-logs/approvals',
  DOCUMENT_AUDIT: '/audit-logs/documents',
  NOTIFICATION_AUDIT: '/audit-logs/notifications',
  
  // Batch Processing endpoints
  BATCH_PROCESS: '/batch/process',
  BATCH_STATUS: '/batch/:id/status',
  BATCH_HISTORY: '/batch/history',
  
  // Analytics and Reports
  ANALYTICS: '/analytics',
  APPROVAL_STATS: '/analytics/approval-stats',
  DOCUMENT_STATS: '/analytics/document-stats',
  NOTIFICATION_STATS: '/analytics/notification-stats',
  PERFORMANCE_METRICS: '/analytics/performance',
  
  // Configuration endpoints
  CONFIGURATION: '/configuration',
  WORKFLOW_CONFIG: '/configuration/workflows',
  NOTIFICATION_CONFIG: '/configuration/notifications',
  INTEGRATION_CONFIG: '/configuration/integrations',
  
  // Health and monitoring
  HEALTH: '/health',
  METRICS: '/metrics'
} as const;

export const getStockpileUrl = (endpoint: keyof typeof STOCKPILE_URLS, params?: Record<string, string>): string => {
  let url = STOCKPILE_URLS.BASE + STOCKPILE_URLS.API_VERSION + STOCKPILE_URLS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

export type StockpileUrlType = typeof STOCKPILE_URLS[keyof typeof STOCKPILE_URLS];
