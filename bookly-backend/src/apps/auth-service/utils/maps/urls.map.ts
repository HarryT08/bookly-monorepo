/**
 * Auth Service - URL Map
 * Centralized mapping for all URLs and endpoints used in the auth service
 */

export const AUTH_URLS = {
  // Base paths
  BASE: '/auth',
  API_VERSION: '/api/v1',
  
  // Authentication endpoints
  AUTH_LOGIN: '/login',
  AUTH_LOGOUT: '/logout',
  AUTH_REGISTER: '/register',
  AUTH_USER_PROFILE: '/profile',
  
  // Password management
  PASSWORD_RESET_REQUEST: '/password/reset/request',
  PASSWORD_RESET_CONFIRM: '/password/reset/confirm',
  PASSWORD_CHANGE: '/password/change',
  
  // Email verification
  EMAIL_VERIFY: '/email/verify',
  EMAIL_RESEND_VERIFICATION: '/email/resend-verification',
  
  // SSO endpoints
  SSO_GOOGLE: '/oauth/google',
  SSO_GOOGLE_CALLBACK: '/oauth/google/callback',
  SSO_MICROSOFT: '/oauth/microsoft',
  SSO_MICROSOFT_CALLBACK: '/oauth/microsoft/callback',
  
  // User management
  USER_TAG: 'Users',
  USER: '/users',
  USER_FIND: '/',
  USER_FIND_BY_ID: '/:id',
  USER_CREATE: '/',
  USER_UPDATE: '/:id',
  USER_DELETE: '/delete',
  USER_ASSIGN_ROLE: '/:id/roles/assign/:roleId',
  USER_REMOVE_ROLE: '/:id/roles/remove/:roleId',
  
  // Role and permission management
  ROLE: '/roles',
  ROLE_FIND: '/',
  ROLE_FIND_BY_ACTIVE: '/active',
  ROLE_FIND_BY_ID: '/:id',
  ROLE_CREATE: '/',
  ROLE_UPDATE: '/:id',
  ROLE_DELETE: '/:id',

  // Category management
  CATEGORY: '/role/categories',
  CATEGORY_DEFAULTS: '/defaults',
  CATEGORY_FIND: '/',
  CATEGORY_FIND_BY_ACTIVE: '/active',
  CATEGORY_FIND_BY_ID: '/:id',
  CATEGORY_CREATE: '/',
  CATEGORY_UPDATE: '/:id',
  CATEGORY_DELETE: '/:id',
  
  // Permissions
  PERMISSION: '/permissions',
  PERMISSION_FIND_BY_ACTIVE: '/active',
  PERMISSION_FIND_BY_RESOURCE: '/resource/:resource',
  PERMISSION_FIND_BY_ID: '/:id',
  PERMISSION_UPDATE: '/:id',
  PERMISSION_DELETE: '/:id',
  PERMISSION_ACTIVATE: '/activate',
  PERMISSION_DEACTIVATE: '/deactivate',
  PERMISSION_SEED_DEFAULTS: '/seed-defaults',
  
  // Session management
  SESSIONS: '/sessions',
  SESSION_INVALIDATE: '/sessions/:id/invalidate',
  SESSION_INVALIDATE_ALL: '/sessions/invalidate-all',
  
  // Security endpoints
  SECURITY_LOGS: '/security/logs',
  BLOCKED_IPS: '/security/blocked-ips',
  SUSPICIOUS_ACTIVITIES: '/security/suspicious-activities',
  
  // Health and monitoring
  HEALTH: '/health',
  METRICS: '/metrics',

  // OAuth endpoints
  OAUTH: '/auth/oauth',
  OAUTH_GOOGLE: '/google',
  OAUTH_GOOGLE_CALLBACK: '/google/callback',
  OAUTH_GOOGLE_LOGOUT: '/google/logout',
  OAUTH_MICROSOFT: '/microsoft',
  OAUTH_MICROSOFT_CALLBACK: '/microsoft/callback',
} as const;

export const getAuthUrl = (endpoint: keyof typeof AUTH_URLS, params?: Record<string, string>): string => {
  let url = AUTH_URLS.BASE + AUTH_URLS.API_VERSION + AUTH_URLS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

export type AuthUrlType = typeof AUTH_URLS[keyof typeof AUTH_URLS];
