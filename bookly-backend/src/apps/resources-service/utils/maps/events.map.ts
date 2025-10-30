/**
 * Resources Service - Event Map
 * Centralized mapping for all events used in the resources service
 */

export const RESOURCES_EVENTS = {
  // Resource Management Events
  RESOURCE_CREATED: 'resources.resource.created',
  RESOURCE_UPDATED: 'resources.resource.updated',
  RESOURCE_DELETED: 'resources.resource.deleted',
  RESOURCE_DISABLED: 'resources.resource.disabled',
  RESOURCE_ENABLED: 'resources.resource.enabled',
  RESOURCE_ARCHIVED: 'resources.resource.archived',
  
  // Resource Category Events
  CATEGORY_CREATED: 'resources.category.created',
  CATEGORY_UPDATED: 'resources.category.updated',
  CATEGORY_DELETED: 'resources.category.deleted',
  RESOURCE_CATEGORY_ASSIGNED: 'resources.resource.category.assigned',
  RESOURCE_CATEGORY_REMOVED: 'resources.resource.category.removed',
  
  // Program Association Events
  RESOURCE_PROGRAM_ASSIGNED: 'resources.resource.program.assigned',
  RESOURCE_PROGRAM_REMOVED: 'resources.resource.program.removed',
  PROGRAM_RESOURCES_UPDATED: 'resources.program.resources.updated',
  
  // Resource Attributes Events
  RESOURCE_ATTRIBUTES_UPDATED: 'resources.resource.attributes.updated',
  RESOURCE_CAPACITY_CHANGED: 'resources.resource.capacity.changed',
  RESOURCE_LOCATION_CHANGED: 'resources.resource.location.changed',
  RESOURCE_EQUIPMENT_UPDATED: 'resources.resource.equipment.updated',
  
  // Import Events
  IMPORT_STARTED: 'resources.import.started',
  IMPORT_COMPLETED: 'resources.import.completed',
  IMPORT_FAILED: 'resources.import.failed',
  IMPORT_VALIDATED: 'resources.import.validated',
  IMPORT_PROCESSING: 'resources.import.processing',
  BULK_RESOURCES_CREATED: 'resources.bulk.created',
  
  // Maintenance Events
  MAINTENANCE_SCHEDULED: 'resources.maintenance.scheduled',
  MAINTENANCE_STARTED: 'resources.maintenance.started',
  MAINTENANCE_COMPLETED: 'resources.maintenance.completed',
  MAINTENANCE_CANCELLED: 'resources.maintenance.cancelled',
  MAINTENANCE_OVERDUE: 'resources.maintenance.overdue',
  DAMAGE_REPORTED: 'resources.damage.reported',
  REPAIR_REQUESTED: 'resources.repair.requested',
  REPAIR_COMPLETED: 'resources.repair.completed',
  
  // Availability Rules Events
  AVAILABILITY_RULE_CREATED: 'resources.availability.rule.created',
  AVAILABILITY_RULE_UPDATED: 'resources.availability.rule.updated',
  AVAILABILITY_RULE_DELETED: 'resources.availability.rule.deleted',
  RESOURCE_AVAILABILITY_CHANGED: 'resources.resource.availability.changed',
  
  // Access Control Events
  RESOURCE_ACCESS_GRANTED: 'resources.resource.access.granted',
  RESOURCE_ACCESS_REVOKED: 'resources.resource.access.revoked',
  RESOURCE_PERMISSIONS_UPDATED: 'resources.resource.permissions.updated',
  RESTRICTED_ACCESS_ATTEMPTED: 'resources.resource.restricted.access.attempted',
  
  // Monitoring Events
  RESOURCE_UTILIZATION_CALCULATED: 'resources.resource.utilization.calculated',
  RESOURCE_PERFORMANCE_MEASURED: 'resources.resource.performance.measured',
  RESOURCE_THRESHOLD_EXCEEDED: 'resources.resource.threshold.exceeded',
  RESOURCE_ALERT_TRIGGERED: 'resources.resource.alert.triggered',
  
  // Audit Events
  RESOURCE_ACCESSED: 'resources.resource.accessed',
  RESOURCE_MODIFICATION_ATTEMPTED: 'resources.resource.modification.attempted',
  UNAUTHORIZED_RESOURCE_ACCESS: 'resources.resource.unauthorized.access',
  RESOURCE_AUDIT_LOG_CREATED: 'resources.resource.audit.log.created',
  
  // Integration Events
  EXTERNAL_SYSTEM_SYNC: 'resources.external.system.sync',
  RESOURCE_DATA_EXPORTED: 'resources.resource.data.exported',
  RESOURCE_DATA_IMPORTED: 'resources.resource.data.imported',
  
  // System Events
  RESOURCES_SERVICE_STARTED: 'resources.service.started',
  RESOURCES_SERVICE_STOPPED: 'resources.service.stopped',
  DATABASE_BACKUP_CREATED: 'resources.database.backup.created',
  CONFIGURATION_UPDATED: 'resources.configuration.updated'
} as const;

export type ResourcesEventType = typeof RESOURCES_EVENTS[keyof typeof RESOURCES_EVENTS];
