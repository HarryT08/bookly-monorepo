/**
 * Service configuration for Bookly microservices
 * Based on backend endpoint mapping documentation
 */

// API Gateway configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  TIMEOUT: 30000,
} as const;

// Service endpoints - mapped to microservices via API Gateway
export const SERVICES = {
  // Auth Service (port 3001) via API Gateway
  AUTH: 'auth',
  
  // Resources Service (port 3003) via API Gateway  
  RESOURCES: 'resources',
  
  // Availability Service (port 3002) via API Gateway
  AVAILABILITY: 'availability',
  
  // Stockpile Service (port 3004) via API Gateway
  STOCKPILE: 'stockpile',
  
  // Reports Service (port 3005) via API Gateway
  REPORTS: 'reports',
} as const;

// Auth endpoints mapping
export const AUTH_ENDPOINTS = {
  LOGIN: 'login',
  REGISTER: 'register', 
  LOGOUT: 'logout',
  PROFILE: 'profile',
  REFRESH: 'refresh',
  PASSWORD_RESET: 'password-reset',
  
  // OAuth endpoints
  OAUTH_GOOGLE: 'oauth/google',
  OAUTH_CALLBACK: 'oauth/google/callback',
  
  // Roles management
  ROLES: 'roles',
  ROLES_ACTIVE: 'roles/active',
  
  // Permissions management
  PERMISSIONS: 'permissions',
  PERMISSIONS_ACTIVE: 'permissions/active',
  PERMISSIONS_BY_RESOURCE: 'permissions/resource',
  
  // Users management
  USERS: 'users',
  USERS_BLOCKED: 'users/blocked',
  
  // Categories for auth (roles)
  CATEGORIES: 'categories',
  CATEGORIES_DEFAULTS: 'categories/defaults',
} as const;

// Resources endpoints mapping
export const RESOURCES_ENDPOINTS = {
  // Main resource operations
  PAGINATED: 'paginated',
  SEARCH: 'search',
  STATISTICS: 'statistics',
  BULK_UPDATE: 'bulk-update',
  BULK_DELETE: 'bulk',
  
  // Categories & Programs
  CATEGORIES: 'resource-categories',
  PROGRAMS: 'programs', 
  PROGRAMS_ACTIVE: 'programs/active',
  
  // Import/Export
  IMPORT_CSV: 'import/csv',
  EXPORT: 'export',
  EXPORT_TEMPLATE: 'export/template',
  
  // Maintenance operations
  MAINTENANCE: 'maintenance',
  MAINTENANCE_PENDING: 'maintenance/pending',
  
  // Availability operations
  AVAILABILITY_CHECK: 'availability/check',
} as const;

// Availability endpoints mapping
export const AVAILABILITY_ENDPOINTS = {
  // Basic availability
  BASIC: 'basic',
  SCHEDULE: 'schedule',
  CHECK: 'check',
  
  // Reservations
  RESERVATIONS: 'reservations',
  
  // Search functionality
  SEARCH_RESOURCES: 'search/resources',
  SEARCH_AVAILABILITY: 'search/availability', 
  SEARCH_ADVANCED: 'search/advanced',
  
  // Waiting list
  WAITING_LIST: 'waiting-list',
  
  // Recurring reservations
  RECURRING: 'recurring-reservations',
  
  // Calendar integration
  CALENDAR: 'calendar',
} as const;

// Stockpile endpoints mapping  
export const STOCKPILE_ENDPOINTS = {
  // Approval flows
  APPROVAL_FLOWS: 'approval-flows',
  APPROVAL_FLOWS_PENDING: 'approval-flows/pending',
  APPROVAL_FLOWS_APPROVE: 'approval-flows/{id}/approve',
  APPROVAL_FLOWS_REJECT: 'approval-flows/{id}/reject',
  
  // Document templates
  DOCUMENT_TEMPLATES: 'document-templates',
  DOCUMENT_TEMPLATES_PREVIEW: 'document-templates/{id}/preview',
  DOCUMENTS_GENERATE: 'documents/generate',
  
  // Notifications
  NOTIFICATIONS: 'notifications',
  NOTIFICATIONS_SEND: 'notifications/send',
  NOTIFICATIONS_TEMPLATES: 'notifications/templates',
} as const;

// Reports endpoints mapping
export const REPORTS_ENDPOINTS = {
  // Main reports
  USAGE: 'usage',
  USER: 'user',
  DEMAND: 'demand',
  FEEDBACK: 'feedback',
  DASHBOARD: 'dashboard',
  
  // Export functionality
  EXPORT_CSV: 'export/csv',
  
  // Advanced features (may be stubs)
  SCHEDULED: 'scheduled-reports',
  CUSTOM: 'custom-reports', 
  TEMPLATES: 'report-templates',
  ALERTS: 'alerts',
  PERFORMANCE: 'performance',
  DATA_PROCESSING: 'data-processing',
} as const;

// HTTP status codes for error handling
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error types from backend
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  SERVER_ERROR: 'server_error',
} as const;

export type ServiceName = keyof typeof SERVICES;
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];
export type ResourcesEndpoint = typeof RESOURCES_ENDPOINTS[keyof typeof RESOURCES_ENDPOINTS];
export type AvailabilityEndpoint = typeof AVAILABILITY_ENDPOINTS[keyof typeof AVAILABILITY_ENDPOINTS];
export type StockpileEndpoint = typeof STOCKPILE_ENDPOINTS[keyof typeof STOCKPILE_ENDPOINTS];
export type ReportsEndpoint = typeof REPORTS_ENDPOINTS[keyof typeof REPORTS_ENDPOINTS];
