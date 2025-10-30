/**
 * Auth Service Domain Events
 * Event-Driven Architecture for Authentication and Authorization
 */

import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

// Base interface for auth events
export interface AuthEventData {
  userId: string;
  email: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// User Registration Events
export interface UserRegisteredEventData extends AuthEventData {
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
  ssoProvider?: string;
}

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'UserRegistered';
  public readonly aggregateType = 'User';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: UserRegisteredEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `user-registered-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// User Login Events
export interface UserLoggedInEventData extends AuthEventData {
  username: string;
  roles: string[];
  permissions: string[];
  loginMethod: 'traditional' | 'sso';
  ssoProvider?: string;
  sessionId?: string;
}

export class UserLoggedInEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'UserLoggedIn';
  public readonly aggregateType = 'User';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: UserLoggedInEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `user-logged-in-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// User Logout Events
export interface UserLoggedOutEventData extends AuthEventData {
  sessionId?: string;
  reason: 'manual' | 'timeout' | 'forced';
}

export class UserLoggedOutEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'UserLoggedOut';
  public readonly aggregateType = 'User';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: UserLoggedOutEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `user-logged-out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// User Account Locked Events
export interface UserAccountLockedEventData extends AuthEventData {
  reason: 'failed_attempts' | 'admin_action' | 'security_violation';
  lockDuration: number; // in minutes
  attemptCount?: number;
}

export class UserAccountLockedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'UserAccountLocked';
  public readonly aggregateType = 'User';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: UserAccountLockedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `user-account-locked-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// User Email Verified Events
export interface UserEmailVerifiedEventData extends AuthEventData {
  verificationToken: string;
}

export class UserEmailVerifiedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'UserEmailVerified';
  public readonly aggregateType = 'User';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: UserEmailVerifiedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `user-email-verified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Password Reset Events
export interface PasswordResetRequestedEventData extends AuthEventData {
  resetToken: string;
  expiresAt: Date;
}

export class PasswordResetRequestedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'PasswordResetRequested';
  public readonly aggregateType = 'User';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: PasswordResetRequestedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `password-reset-requested-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface PasswordResetCompletedEventData extends AuthEventData {
  resetToken: string;
}

export class PasswordResetCompletedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'PasswordResetCompleted';
  public readonly aggregateType = 'User';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: PasswordResetCompletedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `password-reset-completed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Role Assignment Events
export interface RoleAssignedEventData {
  userId: string;
  roleId: string;
  roleName: string;
  programId?: string;
  assignedBy: string;
  timestamp: Date;
}

export class RoleAssignedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'RoleAssigned';
  public readonly aggregateType = 'UserRole';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: RoleAssignedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `role-assigned-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface RoleRevokedEventData {
  userId: string;
  roleId: string;
  roleName: string;
  programId?: string;
  revokedBy: string;
  timestamp: Date;
}

export class RoleRevokedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'RoleRevoked';
  public readonly aggregateType = 'UserRole';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: RoleRevokedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `role-revoked-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Permission Events
export interface PermissionGrantedEventData {
  roleId: string;
  permissionId: string;
  permissionName: string;
  resource: string;
  action: string;
  scope: string;
  grantedBy: string;
  timestamp: Date;
}

export class PermissionGrantedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'PermissionGranted';
  public readonly aggregateType = 'RolePermission';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: PermissionGrantedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `permission-granted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

export interface PermissionRevokedEventData {
  roleId: string;
  permissionId: string;
  permissionName: string;
  resource: string;
  action: string;
  scope: string;
  revokedBy: string;
  timestamp: Date;
}

export class PermissionRevokedEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly eventType = 'PermissionRevoked';
  public readonly aggregateType = 'RolePermission';
  public readonly timestamp: Date;
  public readonly version = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly eventData: PermissionRevokedEventData,
    public readonly userId?: string,
  ) {
    this.eventId = `permission-revoked-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
  }
}

// Export all events
export const AuthEvents = {
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
} as const;

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
