/**
 * Auth Service - Event Map
 * Centralized mapping for all events used in the auth service
 */

export const AUTH_EVENTS = {
  // User Authentication Events
  USER_LOGIN_SUCCESS: 'auth.user.login.success',
  USER_LOGIN_FAILED: 'auth.user.login.failed',
  USER_LOGOUT: 'auth.user.logout',
  USER_REGISTERED: 'auth.user.registered',
  USER_REGISTRATION_FAILED: 'auth.user.registration.failed',
  
  // Password Events
  PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',
  PASSWORD_RESET_SUCCESS: 'auth.password.reset.success',
  PASSWORD_RESET_FAILED: 'auth.password.reset.failed',
  PASSWORD_CHANGED: 'auth.password.changed',
  
  // Account Security Events
  ACCOUNT_LOCKED: 'auth.account.locked',
  ACCOUNT_UNLOCKED: 'auth.account.unlocked',
  ACCOUNT_SUSPENDED: 'auth.account.suspended',
  ACCOUNT_ACTIVATED: 'auth.account.activated',
  
  // Email Verification Events
  EMAIL_VERIFICATION_SENT: 'auth.email.verification.sent',
  EMAIL_VERIFIED: 'auth.email.verified',
  EMAIL_VERIFICATION_FAILED: 'auth.email.verification.failed',
  
  // SSO Events
  SSO_LOGIN_SUCCESS: 'auth.sso.login.success',
  SSO_LOGIN_FAILED: 'auth.sso.login.failed',
  SSO_USER_CREATED: 'auth.sso.user.created',
  
  // Role and Permission Events
  ROLE_ASSIGNED: 'auth.role.assigned',
  ROLE_REMOVED: 'auth.role.removed',
  PERMISSION_GRANTED: 'auth.permission.granted',
  PERMISSION_REVOKED: 'auth.permission.revoked',
  
  // Session Events
  SESSION_CREATED: 'auth.session.created',
  SESSION_EXPIRED: 'auth.session.expired',
  SESSION_INVALIDATED: 'auth.session.invalidated',
  TOKEN_REFRESHED: 'auth.token.refreshed',
  
  // Security Events
  SUSPICIOUS_ACTIVITY_DETECTED: 'auth.security.suspicious.activity',
  BRUTE_FORCE_ATTEMPT: 'auth.security.brute.force',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'auth.security.unauthorized.access'
} as const;

export type AuthEventType = typeof AUTH_EVENTS[keyof typeof AUTH_EVENTS];
