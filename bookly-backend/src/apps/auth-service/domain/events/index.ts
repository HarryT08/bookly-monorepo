/**
 * Domain Events Index
 * Centralized export for all domain events in auth-service
 * Event-Driven Architecture for Authentication and Authorization
 */

import { AuthEvents } from './auth.events';

// Auth Events
export {
  AuthEvents
};

// Individual event exports
export {
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserLoggedOutEvent,
  UserAccountLockedEvent,
  UserEmailVerifiedEvent,
  PasswordResetRequestedEvent,
  PasswordResetCompletedEvent,
  RoleAssignedEvent,
  RoleRevokedEvent,
  PermissionGrantedEvent,
  PermissionRevokedEvent,
  type UserRegisteredEventData,
  type UserLoggedInEventData,
  type UserLoggedOutEventData,
  type UserAccountLockedEventData,
  type UserEmailVerifiedEventData,
  type PasswordResetRequestedEventData,
  type PasswordResetCompletedEventData,
  type RoleAssignedEventData,
  type RoleRevokedEventData,
  type PermissionGrantedEventData,
  type PermissionRevokedEventData,
} from './auth.events';

// Union type for all auth service events
export type AuthServiceEventType = 
  | 'UserRegistered'
  | 'UserLoggedIn'
  | 'UserLoggedOut'
  | 'UserAccountLocked'
  | 'UserEmailVerified'
  | 'PasswordResetRequested'
  | 'PasswordResetCompleted'
  | 'RoleAssigned'
  | 'RoleRevoked'
  | 'PermissionGranted'
  | 'PermissionRevoked';

// All events collection
export const AuthServiceEvents = {
  ...AuthEvents
} as const;

// Event categories for filtering and routing
export const EventCategories = {
  AUTHENTICATION: [
    'UserLoggedIn',
    'UserLoggedOut',
    'UserAccountLocked',
    'PasswordResetRequested',
    'PasswordResetCompleted'
  ] as const,
  
  REGISTRATION: [
    'UserRegistered',
    'UserEmailVerified'
  ] as const,
  
  AUTHORIZATION: [
    'RoleAssigned',
    'RoleRevoked',
    'PermissionGranted',
    'PermissionRevoked'
  ] as const
} as const;

// Event priority levels for notification routing
export const EventPriorities = {
  HIGH: [
    'UserAccountLocked',
    'PasswordResetRequested',
    'RoleAssigned',
    'RoleRevoked',
    'PermissionGranted',
    'PermissionRevoked'
  ],
  MEDIUM: [
    'UserRegistered',
    'UserLoggedIn',
    'UserEmailVerified'
  ],
  LOW: [
    'UserLoggedOut',
    'PasswordResetCompleted'
  ]
} as const;

// Event notification channels mapping
export const EventNotificationChannels = {
  EMAIL: [
    'UserRegistered',
    'UserEmailVerified',
    'PasswordResetRequested',
    'UserAccountLocked',
    'RoleAssigned',
    'RoleRevoked'
  ],
  SMS: [
    'UserAccountLocked',
    'PasswordResetRequested',
    'RoleAssigned'
  ],
  PUSH: [
    'UserLoggedIn',
    'RoleAssigned',
    'PermissionGranted'
  ],
  IN_APP: [
    'UserLoggedIn',
    'UserLoggedOut',
    'RoleAssigned',
    'RoleRevoked',
    'PermissionGranted',
    'PermissionRevoked'
  ]
} as const;

// Helper functions for event handling
export const EventHelpers = {
  /**
   * Check if an event requires immediate notification
   */
  isHighPriorityEvent(eventType: AuthServiceEventType): boolean {
    return EventPriorities.HIGH.includes(eventType as any);
  },

  /**
   * Get notification channels for an event type
   */
  getNotificationChannels(eventType: AuthServiceEventType): string[] {
    const channels: string[] = [];
    
    if (EventNotificationChannels.EMAIL.includes(eventType as any)) {
      channels.push('EMAIL');
    }
    if (EventNotificationChannels.SMS.includes(eventType as any)) {
      channels.push('SMS');
    }
    if (EventNotificationChannels.PUSH.includes(eventType as any)) {
      channels.push('PUSH');
    }
    if (EventNotificationChannels.IN_APP.includes(eventType as any)) {
      channels.push('IN_APP');
    }
    
    return channels;
  },

  /**
   * Get event category for an event type
   */
  getEventCategory(eventType: AuthServiceEventType): string {
    if (EventCategories.AUTHENTICATION.includes(eventType as any)) {
      return 'AUTHENTICATION';
    }
    if (EventCategories.REGISTRATION.includes(eventType as any)) {
      return 'REGISTRATION';
    }
    if (EventCategories.AUTHORIZATION.includes(eventType as any)) {
      return 'AUTHORIZATION';
    }
    return 'UNKNOWN';
  },

  /**
   * Check if event requires user confirmation
   */
  requiresUserConfirmation(eventType: AuthServiceEventType): boolean {
    const confirmationRequiredEvents = [
      'PasswordResetRequested',
      'UserEmailVerified',
      'RoleAssigned'
    ];
    return confirmationRequiredEvents.includes(eventType);
  },

  /**
   * Check if event should trigger audit log
   */
  requiresAuditLog(eventType: AuthServiceEventType): boolean {
    const auditRequiredEvents = [
      'UserRegistered',
      'UserLoggedIn',
      'UserAccountLocked',
      'RoleAssigned',
      'RoleRevoked',
      'PermissionGranted',
      'PermissionRevoked'
    ];
    return auditRequiredEvents.includes(eventType);
  },

  /**
   * Check if event requires security monitoring
   */
  requiresSecurityMonitoring(eventType: AuthServiceEventType): boolean {
    const securityEvents = [
      'UserAccountLocked',
      'PasswordResetRequested',
      'RoleAssigned',
      'RoleRevoked',
      'PermissionGranted',
      'PermissionRevoked'
    ];
    return securityEvents.includes(eventType);
  }
};
