/**
 * Definiciones de eventos relacionados con roles
 * Estos eventos son publicados por roles-service y consumidos por otros servicios
 */

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
