/**
 * Availability Service - Event Map
 * Centralized mapping for all events used in the availability service
 */

export const AVAILABILITY_EVENTS = {
  // Reservation Events
  RESERVATION_CREATED: 'availability.reservation.created',
  RESERVATION_UPDATED: 'availability.reservation.updated',
  RESERVATION_CANCELLED: 'availability.reservation.cancelled',
  RESERVATION_CONFIRMED: 'availability.reservation.confirmed',
  RESERVATION_COMPLETED: 'availability.reservation.completed',
  RESERVATION_NO_SHOW: 'availability.reservation.no_show',
  RESERVATION_CONFLICT_DETECTED: 'availability.reservation.conflict.detected',
  RESERVATION_CONFLICT_RESOLVED: 'availability.reservation.conflict.resolved',
  
  // Recurring Reservation Events
  RECURRING_RESERVATION_CREATED: 'availability.recurring.reservation.created',
  RECURRING_RESERVATION_UPDATED: 'availability.recurring.reservation.updated',
  RECURRING_RESERVATION_CANCELLED: 'availability.recurring.reservation.cancelled',
  RECURRING_INSTANCE_GENERATED: 'availability.recurring.instance.generated',
  RECURRING_INSTANCE_SKIPPED: 'availability.recurring.instance.skipped',
  RECURRING_INSTANCE_MODIFIED: 'availability.recurring.instance.modified',
  
  // Waiting List Events
  WAITING_LIST_JOINED: 'availability.waiting_list.joined',
  WAITING_LIST_LEFT: 'availability.waiting_list.left',
  WAITING_LIST_PROMOTED: 'availability.waiting_list.promoted',
  WAITING_LIST_EXPIRED: 'availability.waiting_list.expired',
  WAITING_LIST_NOTIFICATION_SENT: 'availability.waiting_list.notification.sent',
  
  // Reassignment Events
  REASSIGNMENT_REQUESTED: 'availability.reassignment.requested',
  REASSIGNMENT_ACCEPTED: 'availability.reassignment.accepted',
  REASSIGNMENT_REJECTED: 'availability.reassignment.rejected',
  REASSIGNMENT_EXPIRED: 'availability.reassignment.expired',
  REASSIGNMENT_CANCELLED: 'availability.reassignment.cancelled',
  
  // Schedule Events
  SCHEDULE_CREATED: 'availability.schedule.created',
  SCHEDULE_UPDATED: 'availability.schedule.updated',
  SCHEDULE_DELETED: 'availability.schedule.deleted',
  SCHEDULE_EXCEPTION_ADDED: 'availability.schedule.exception.added',
  SCHEDULE_MAINTENANCE_SCHEDULED: 'availability.schedule.maintenance.scheduled',
  
  // Calendar Integration Events
  CALENDAR_INTEGRATION_CREATED: 'availability.calendar.integration.created',
  CALENDAR_INTEGRATION_UPDATED: 'availability.calendar.integration.updated',
  CALENDAR_INTEGRATION_DELETED: 'availability.calendar.integration.deleted',
  CALENDAR_SYNC_STARTED: 'availability.calendar.sync.started',
  CALENDAR_SYNC_COMPLETED: 'availability.calendar.sync.completed',
  CALENDAR_SYNC_FAILED: 'availability.calendar.sync.failed',
  CALENDAR_EVENT_IMPORTED: 'availability.calendar.event.imported',
  CALENDAR_EVENT_UPDATED: 'availability.calendar.event.updated',
  
  // Penalty Events
  PENALTY_APPLIED: 'availability.penalty.applied',
  PENALTY_REMOVED: 'availability.penalty.removed',
  PENALTY_ESCALATED: 'availability.penalty.escalated',
  PENALTY_EVENT_RECORDED: 'availability.penalty.event.recorded',
  USER_SUSPENDED: 'availability.user.suspended',
  USER_RESTRICTION_APPLIED: 'availability.user.restriction.applied',
  
  // Resource Equivalence Events
  RESOURCE_EQUIVALENCE_CREATED: 'availability.resource.equivalence.created',
  RESOURCE_EQUIVALENCE_UPDATED: 'availability.resource.equivalence.updated',
  RESOURCE_EQUIVALENCE_DELETED: 'availability.resource.equivalence.deleted',
  ALTERNATIVE_RESOURCE_SUGGESTED: 'availability.resource.alternative.suggested',
  
  // Limit Events
  RESERVATION_LIMIT_CREATED: 'availability.limit.created',
  RESERVATION_LIMIT_UPDATED: 'availability.limit.updated',
  RESERVATION_LIMIT_DELETED: 'availability.limit.deleted',
  RESERVATION_LIMIT_EXCEEDED: 'availability.limit.exceeded',
  RESERVATION_LIMIT_WARNING: 'availability.limit.warning',
  
  // Notification Events
  NOTIFICATION_SENT: 'availability.notification.sent',
  NOTIFICATION_FAILED: 'availability.notification.failed',
  REMINDER_SENT: 'availability.reminder.sent',
  CONFIRMATION_REQUESTED: 'availability.confirmation.requested',
  
  // Audit Events
  AVAILABILITY_CHECKED: 'availability.checked',
  AUDIT_LOG_CREATED: 'availability.audit.log.created',
  SECURITY_VIOLATION_DETECTED: 'availability.security.violation.detected',
  
  // System Events
  SYSTEM_MAINTENANCE_STARTED: 'availability.system.maintenance.started',
  SYSTEM_MAINTENANCE_COMPLETED: 'availability.system.maintenance.completed',
  DATA_BACKUP_CREATED: 'availability.data.backup.created',
  DATA_RESTORED: 'availability.data.restored'
} as const;

export type AvailabilityEventType = typeof AVAILABILITY_EVENTS[keyof typeof AVAILABILITY_EVENTS];
