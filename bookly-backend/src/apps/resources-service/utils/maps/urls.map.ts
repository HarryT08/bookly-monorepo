/**
 * Resources Service - URL Map
 * Centralized mapping for all URLs and endpoints used in the resources service
 */

export const RESOURCES_URLS = {
  // Base paths
  BASE: '/resources',
  API_VERSION: '/api/v1',
  
  // Resource endpoints
  RESOURCES: '/resources',
  RESOURCE_CREATE: '/resources/create',
  RESOURCE_UPDATE: '/resources/:id',
  RESOURCE_DELETE: '/resources/:id',
  RESOURCE_ENABLE: '/resources/:id/enable',
  RESOURCE_DISABLE: '/resources/:id/disable',
  RESOURCE_ARCHIVE: '/resources/:id/archive',
  RESOURCE_DETAILS: '/resources/:id/details',
  
  // Resource Categories
  CATEGORIES: '/categories',
  CATEGORY_CREATE: '/categories/create',
  CATEGORY_UPDATE: '/categories/:id',
  CATEGORY_DELETE: '/categories/:id',
  RESOURCE_CATEGORIES: '/resources/:id/categories',
  CATEGORY_RESOURCES: '/categories/:id/resources',
  
  // Program Association
  PROGRAMS: '/programs',
  RESOURCE_PROGRAMS: '/resources/:id/programs',
  PROGRAM_RESOURCES: '/programs/:id/resources',
  ASSIGN_PROGRAM: '/resources/:id/programs/assign',
  REMOVE_PROGRAM: '/resources/:id/programs/remove',
  
  // Resource Attributes
  RESOURCE_ATTRIBUTES: '/resources/:id/attributes',
  UPDATE_ATTRIBUTES: '/resources/:id/attributes/update',
  RESOURCE_CAPACITY: '/resources/:id/capacity',
  RESOURCE_LOCATION: '/resources/:id/location',
  RESOURCE_EQUIPMENT: '/resources/:id/equipment',
  
  // Import endpoints
  IMPORT: '/import',
  IMPORT_VALIDATE: '/import/validate',
  IMPORT_PROCESS: '/import/process',
  IMPORT_STATUS: '/import/:id/status',
  IMPORT_HISTORY: '/import/history',
  IMPORT_TEMPLATE: '/import/template',
  BULK_CREATE: '/resources/bulk-create',
  
  // Maintenance endpoints
  MAINTENANCE: '/maintenance',
  MAINTENANCE_SCHEDULE: '/maintenance/schedule',
  MAINTENANCE_UPDATE: '/maintenance/:id',
  MAINTENANCE_CANCEL: '/maintenance/:id/cancel',
  MAINTENANCE_COMPLETE: '/maintenance/:id/complete',
  RESOURCE_MAINTENANCE: '/resources/:id/maintenance',
  MAINTENANCE_HISTORY: '/resources/:id/maintenance/history',
  
  // Damage and Repair
  DAMAGE_REPORT: '/resources/:id/damage/report',
  REPAIR_REQUEST: '/resources/:id/repair/request',
  REPAIR_COMPLETE: '/resources/:id/repair/complete',
  DAMAGE_HISTORY: '/resources/:id/damage/history',
  
  // Availability Rules
  AVAILABILITY_RULES: '/availability-rules',
  AVAILABILITY_RULE_CREATE: '/availability-rules/create',
  AVAILABILITY_RULE_UPDATE: '/availability-rules/:id',
  AVAILABILITY_RULE_DELETE: '/availability-rules/:id',
  RESOURCE_AVAILABILITY: '/resources/:id/availability',
  
  // Access Control
  RESOURCE_PERMISSIONS: '/resources/:id/permissions',
  GRANT_ACCESS: '/resources/:id/access/grant',
  REVOKE_ACCESS: '/resources/:id/access/revoke',
  ACCESS_HISTORY: '/resources/:id/access/history',
  
  // Search and Filtering
  SEARCH: '/resources/search',
  FILTER: '/resources/filter',
  ADVANCED_SEARCH: '/resources/search/advanced',
  SEARCH_BY_CATEGORY: '/resources/search/category/:categoryId',
  SEARCH_BY_PROGRAM: '/resources/search/program/:programId',
  
  // Analytics and Reports
  ANALYTICS: '/analytics',
  UTILIZATION_REPORT: '/analytics/utilization',
  MAINTENANCE_REPORT: '/analytics/maintenance',
  CAPACITY_REPORT: '/analytics/capacity',
  RESOURCE_STATS: '/resources/:id/stats',
  
  // Monitoring
  RESOURCE_STATUS: '/resources/:id/status',
  HEALTH_CHECK: '/resources/:id/health',
  PERFORMANCE_METRICS: '/resources/:id/metrics',
  ALERTS: '/resources/:id/alerts',
  
  // Audit
  AUDIT_LOGS: '/audit-logs',
  RESOURCE_AUDIT: '/resources/:id/audit-logs',
  ACCESS_LOGS: '/access-logs',
  MODIFICATION_LOGS: '/modification-logs',
  
  // Integration
  EXPORT: '/export',
  EXPORT_CSV: '/export/csv',
  EXPORT_JSON: '/export/json',
  SYNC_EXTERNAL: '/sync/external-system',
  WEBHOOK_ENDPOINTS: '/webhooks',
  
  // Health and monitoring
  HEALTH: '/health',
  METRICS: '/metrics'
} as const;

export const getResourcesUrl = (endpoint: keyof typeof RESOURCES_URLS, params?: Record<string, string>): string => {
  let url = RESOURCES_URLS.BASE + RESOURCES_URLS.API_VERSION + RESOURCES_URLS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

export type ResourcesUrlType = typeof RESOURCES_URLS[keyof typeof RESOURCES_URLS];
