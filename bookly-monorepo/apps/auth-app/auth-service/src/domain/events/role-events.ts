/**
 * Eventos relacionados con roles que serán emitidos o consumidos por auth-service
 */

// Eventos que auth-service escuchará
export interface RoleCreatedEvent {
  roleId: string;
  name: string;
  description?: string;
  permissions: string[];
  timestamp: Date;
}

export interface RoleUpdatedEvent {
  roleId: string;
  name?: string;
  description?: string;
  permissions?: string[];
  timestamp: Date;
}

export interface RoleDeletedEvent {
  roleId: string;
  timestamp: Date;
}

export interface PermissionAddedEvent {
  roleId: string;
  roleName: string;
  permission: string;
  timestamp: Date;
}

export interface PermissionRemovedEvent {
  roleId: string;
  roleName: string;
  permission: string;
  timestamp: Date;
}
