/**
 * Resources Service - URL Map
 * Centralized mapping for all URLs and endpoints used in the resources service
 */

export const RESOURCES_URLS = {
  // Base paths
  BASE: "/resources",
  API_VERSION: "/api/v1",

  // Resource endpoints
  RESOURCES_TAG: "Resources",
  RESOURCES: "/resources",
  RESOURCE_CREATE: "/create",
  RESOURCE_UPDATE: "/:id",
  RESOURCE_DELETE: "/:id",
  RESOURCE_ENABLE: "/:id/enable",
  RESOURCE_DISABLE: "/:id/disable",
  RESOURCE_ARCHIVE: "/:id/archive",
  RESOURCE_DETAILS: "/:id/details",

  // Resource Category Association endpoints
  RESOURCE_CATEGORY_TAG: "Resource Category Association",
  RESOURCE_CATEGORY: "/resource-categories",
  RESOURCE_CATEGORY_ASSIGN: "/:resourceId/categories/:categoryId",
  RESOURCE_CATEGORY_ASSIGN_MULTIPLE: "/:resourceId/categories",
  RESOURCE_CATEGORY_REPLACE: "/:resourceId/categories",
  RESOURCE_CATEGORY_GET: "/:resourceId/categories",
  CATEGORY_RESOURCES_GET: "/categories/:categoryId/resources",
  RESOURCE_CATEGORY_EXISTS: "/:resourceId/categories/:categoryId/exists",
  RESOURCE_CATEGORY_REMOVE: "/:resourceId/categories/:categoryId",
  RESOURCE_CATEGORY_REMOVE_ALL: "/:resourceId/categories",
  CATEGORY_BULK_ASSIGN: "/categories/:categoryId/resources",
  RESOURCE_CATEGORY_VALIDATE: "/validate",

  // Resource Categories
  RESOURCE_CATEGORIES_TAG: "Resource Categories",
  RESOURCE_CATEGORIES: "/categories/resources",
  RESOURCE_CATEGORIES_FIND_ALL: "/",
  RESOURCE_CATEGORY_CREATE: "/",
  RESOURCE_CATEGORY_UPDATE: "/:id",
  RESOURCE_CATEGORY_DELETE: "/:id",
  RESOURCE_CATEGORIES_DEFAULTS: "/defaults",
  RESOURCE_CATEGORIES_ACTIVE: "/active",
  RESOURCE_CATEGORIES_FIND_BY_ID: "/:id",
  RESOURCE_CATEGORY_REACTIVATE: "/:id/reactivate",

  // Program Association
  PROGRAMS_TAG: "Programs",
  PROGRAMS: "/programs",
  PROGRAMS_CREATE: "/create",
  PROGRAMS_UPDATE: "/:id",
  PROGRAMS_DELETE: "/:id",
  PROGRAMS_FIND: "/",
  PROGRAMS_FIND_BY_ID: "/:id",
  PROGRAMS_FIND_BY_CODE: "/code/:code",
  PROGRAMS_ACTIVE: "/active",
  PROGRAMS_REACTIVATE: "/:id/reactivate",

  // Resource Attributes
  RESOURCE_ATTRIBUTES: "/resources/:id/attributes",
  UPDATE_ATTRIBUTES: "/resources/:id/attributes/update",
  RESOURCE_CAPACITY: "/resources/:id/capacity",
  RESOURCE_LOCATION: "/resources/:id/location",
  RESOURCE_EQUIPMENT: "/resources/:id/equipment",

  // Import endpoints
  IMPORT_TAG: "Import",
  IMPORT: "/import",
  IMPORT_PREVIEW: "/preview",
  IMPORT_START: "/start",
  IMPORT_FIND_BY_ID: "/:id",
  IMPORT_HISTORY: "/history",
  IMPORT_PAGINATED: "/paginated",
  IMPORT_STATISTICS_OVERVIEW: "/statistics/overview",
  IMPORT_STATISTICS_MY_STATS: "/statistics/my-stats",
  IMPORT_TEMPLATE: "/template",
  BULK_CREATE: "/resources/bulk-create",

  // Maintenance endpoints
  MAINTENANCE_TAG: "Maintenance",
  MAINTENANCE: "/maintenance",
  MAINTENANCE_SCHEDULE: "/maintenance/schedule",
  MAINTENANCE_UPDATE: "/maintenance/:id",
  MAINTENANCE_CANCEL: "/maintenance/:id/cancel",
  MAINTENANCE_COMPLETE: "/maintenance/:id/complete",
  RESOURCE_MAINTENANCE: "/resources/:id/maintenance",
  MAINTENANCE_HISTORY: "/resources/:id/maintenance/history",

  // Maintenance Types
  MAINTENANCE_TYPES_TAG: "Maintenance Types",
  MAINTENANCE_TYPES: "/maintenance-types",
  MAINTENANCE_TYPES_CREATE: "/create",
  MAINTENANCE_TYPES_ALL: "/all",
  MAINTENANCE_TYPES_ACTIVE: "/active",
  MAINTENANCE_TYPES_DEFAULTS: "/defaults",
  MAINTENANCE_TYPES_CUSTOM: "/custom",
  MAINTENANCE_TYPES_ID: "/:id",
  MAINTENANCE_TYPES_NAME: "/name/:name",
  MAINTENANCE_TYPES_REACTIVATE: "/reactivate",
  MAINTENANCE_TYPES_VALIDATE: "/validate",

  // Damage and Repair
  DAMAGE_REPORT: "/resources/:id/damage/report",
  REPAIR_REQUEST: "/resources/:id/repair/request",
  REPAIR_COMPLETE: "/resources/:id/repair/complete",
  DAMAGE_HISTORY: "/resources/:id/damage/history",

  // Availability Rules
  AVAILABILITY_RULES: "/availability-rules",
  AVAILABILITY_RULE_CREATE: "/availability-rules/create",
  AVAILABILITY_RULE_UPDATE: "/availability-rules/:id",
  AVAILABILITY_RULE_DELETE: "/availability-rules/:id",
  RESOURCE_AVAILABILITY: "/resources/:id/availability",

  // Access Control
  RESOURCE_PERMISSIONS: "/resources/:id/permissions",
  GRANT_ACCESS: "/resources/:id/access/grant",
  REVOKE_ACCESS: "/resources/:id/access/revoke",
  ACCESS_HISTORY: "/resources/:id/access/history",

  // Search and Filtering
  SEARCH: "/resources/search",
  FILTER: "/resources/filter",
  ADVANCED_SEARCH: "/resources/search/advanced",
  SEARCH_BY_CATEGORY: "/resources/search/category/:categoryId",
  SEARCH_BY_PROGRAM: "/resources/search/program/:programId",

  // Analytics and Reports
  ANALYTICS: "/analytics",
  UTILIZATION_REPORT: "/analytics/utilization",
  MAINTENANCE_REPORT: "/analytics/maintenance",
  CAPACITY_REPORT: "/analytics/capacity",
  RESOURCE_STATS: "/resources/:id/stats",

  // Monitoring
  RESOURCE_STATUS: "/resources/:id/status",
  HEALTH_CHECK: "/resources/:id/health",
  PERFORMANCE_METRICS: "/resources/:id/metrics",
  ALERTS: "/resources/:id/alerts",

  // Audit
  AUDIT_LOGS: "/audit-logs",
  RESOURCE_AUDIT: "/resources/:id/audit-logs",
  ACCESS_LOGS: "/access-logs",
  MODIFICATION_LOGS: "/modification-logs",

  // Integration
  EXPORT: "/export",
  EXPORT_CSV: "/export/csv",
  EXPORT_JSON: "/export/json",
  SYNC_EXTERNAL: "/sync/external-system",
  WEBHOOK_ENDPOINTS: "/webhooks",

  // Health and monitoring
  HEALTH: "/health",
  METRICS: "/metrics",
} as const;

export const getResourcesUrl = (
  endpoint: keyof typeof RESOURCES_URLS,
  params?: Record<string, string>
): string => {
  let url =
    RESOURCES_URLS.BASE + RESOURCES_URLS.API_VERSION + RESOURCES_URLS[endpoint];

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }

  return url;
};

export type ResourcesUrlType =
  (typeof RESOURCES_URLS)[keyof typeof RESOURCES_URLS];
