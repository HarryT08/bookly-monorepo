/**
 * Stockpile Service - Event Map
 * Centralized mapping for all events used in the stockpile service
 */

export const STOCKPILE_EVENTS = {
  // Approval Flow Events
  APPROVAL_FLOW_CREATED: 'stockpile.approval.flow.created',
  APPROVAL_FLOW_UPDATED: 'stockpile.approval.flow.updated',
  APPROVAL_FLOW_DELETED: 'stockpile.approval.flow.deleted',
  APPROVAL_FLOW_ACTIVATED: 'stockpile.approval.flow.activated',
  APPROVAL_FLOW_DEACTIVATED: 'stockpile.approval.flow.deactivated',
  
  // Approval Request Events
  APPROVAL_REQUEST_SUBMITTED: 'stockpile.approval.request.submitted',
  APPROVAL_REQUEST_APPROVED: 'stockpile.approval.request.approved',
  APPROVAL_REQUEST_REJECTED: 'stockpile.approval.request.rejected',
  APPROVAL_REQUEST_TIMEOUT: 'stockpile.approval.request.timeout',
  APPROVAL_REQUEST_CANCELLED: 'stockpile.approval.request.cancelled',
  APPROVAL_REQUEST_DELEGATED: 'stockpile.approval.request.delegated',
  
  // Approval Action Events
  APPROVAL_ACTION_TAKEN: 'stockpile.approval.action.taken',
  APPROVAL_COMMENT_ADDED: 'stockpile.approval.comment.added',
  APPROVAL_ESCALATED: 'stockpile.approval.escalated',
  APPROVAL_REMINDER_SENT: 'stockpile.approval.reminder.sent',
  
  // Document Template Events
  DOCUMENT_TEMPLATE_CREATED: 'stockpile.document.template.created',
  DOCUMENT_TEMPLATE_UPDATED: 'stockpile.document.template.updated',
  DOCUMENT_TEMPLATE_DELETED: 'stockpile.document.template.deleted',
  DOCUMENT_TEMPLATE_ACTIVATED: 'stockpile.document.template.activated',
  DOCUMENT_TEMPLATE_DEACTIVATED: 'stockpile.document.template.deactivated',
  
  // Document Generation Events
  DOCUMENT_GENERATED: 'stockpile.document.generated',
  DOCUMENT_GENERATION_FAILED: 'stockpile.document.generation.failed',
  DOCUMENT_SIGNED: 'stockpile.document.signed',
  DOCUMENT_DELIVERED: 'stockpile.document.delivered',
  DOCUMENT_DELIVERY_FAILED: 'stockpile.document.delivery.failed',
  
  // Notification Template Events
  NOTIFICATION_TEMPLATE_CREATED: 'stockpile.notification.template.created',
  NOTIFICATION_TEMPLATE_UPDATED: 'stockpile.notification.template.updated',
  NOTIFICATION_TEMPLATE_DELETED: 'stockpile.notification.template.deleted',
  NOTIFICATION_TEMPLATE_ACTIVATED: 'stockpile.notification.template.activated',
  NOTIFICATION_TEMPLATE_DEACTIVATED: 'stockpile.notification.template.deactivated',
  
  // Notification Events
  NOTIFICATION_SENT: 'stockpile.notification.sent',
  NOTIFICATION_DELIVERY_FAILED: 'stockpile.notification.delivery.failed',
  NOTIFICATION_DELIVERED: 'stockpile.notification.delivered',
  NOTIFICATION_OPENED: 'stockpile.notification.opened',
  NOTIFICATION_CLICKED: 'stockpile.notification.clicked',
  
  // Channel Events
  NOTIFICATION_CHANNEL_CREATED: 'stockpile.notification.channel.created',
  NOTIFICATION_CHANNEL_UPDATED: 'stockpile.notification.channel.updated',
  NOTIFICATION_CHANNEL_DELETED: 'stockpile.notification.channel.deleted',
  NOTIFICATION_CHANNEL_TESTED: 'stockpile.notification.channel.tested',
  
  // Check-in/Check-out Events
  CHECK_IN_COMPLETED: 'stockpile.checkin.completed',
  CHECK_OUT_COMPLETED: 'stockpile.checkout.completed',
  CHECK_IN_FAILED: 'stockpile.checkin.failed',
  CHECK_OUT_FAILED: 'stockpile.checkout.failed',
  DIGITAL_SIGNATURE_CAPTURED: 'stockpile.digital.signature.captured',
  
  // Validation Events
  RESERVATION_VALIDATED: 'stockpile.reservation.validated',
  RESERVATION_VALIDATION_FAILED: 'stockpile.reservation.validation.failed',
  DOCUMENT_VALIDATED: 'stockpile.document.validated',
  DOCUMENT_VALIDATION_FAILED: 'stockpile.document.validation.failed',
  
  // Integration Events
  WHATSAPP_MESSAGE_SENT: 'stockpile.whatsapp.message.sent',
  EMAIL_SENT: 'stockpile.email.sent',
  SMS_SENT: 'stockpile.sms.sent',
  WEBHOOK_TRIGGERED: 'stockpile.webhook.triggered',
  EXTERNAL_SYSTEM_NOTIFIED: 'stockpile.external.system.notified',
  
  // Security Events
  UNAUTHORIZED_APPROVAL_ATTEMPT: 'stockpile.security.unauthorized.approval.attempt',
  DOCUMENT_ACCESS_DENIED: 'stockpile.security.document.access.denied',
  SUSPICIOUS_ACTIVITY_DETECTED: 'stockpile.security.suspicious.activity.detected',
  
  // Audit Events
  APPROVAL_AUDIT_LOG_CREATED: 'stockpile.approval.audit.log.created',
  DOCUMENT_AUDIT_LOG_CREATED: 'stockpile.document.audit.log.created',
  NOTIFICATION_AUDIT_LOG_CREATED: 'stockpile.notification.audit.log.created',
  
  // System Events
  STOCKPILE_SERVICE_STARTED: 'stockpile.service.started',
  STOCKPILE_SERVICE_STOPPED: 'stockpile.service.stopped',
  BATCH_PROCESSING_STARTED: 'stockpile.batch.processing.started',
  BATCH_PROCESSING_COMPLETED: 'stockpile.batch.processing.completed',
  CONFIGURATION_UPDATED: 'stockpile.configuration.updated'
} as const;

export type StockpileEventType = typeof STOCKPILE_EVENTS[keyof typeof STOCKPILE_EVENTS];
