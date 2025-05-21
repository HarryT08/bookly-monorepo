import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher } from '@bookly-monorepo/event-bus';
import { RoleCreatedEvent, RoleUpdatedEvent, RoleDeletedEvent, PermissionAddedEvent, PermissionRemovedEvent } from '../../domain/events/role-events';
import { Role } from '../../domain/entities/role.entity';

/**
 * Publicador de eventos relacionados con roles
 */
@Injectable()
export class RoleEventsPublisher {
  private readonly logger = new Logger(RoleEventsPublisher.name);

  constructor(private readonly eventPublisher: EventPublisher) {}

  /**
   * Publica un evento de rol creado
   */
  async publishRoleCreated(role: Role): Promise<void> {
    this.logger.log(`Publicando evento role.created para el rol ${role.id}`);
    
    const event: RoleCreatedEvent = {
      roleId: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish('role.created', event);
  }

  /**
   * Publica un evento de rol actualizado
   */
  async publishRoleUpdated(role: Role, updatedFields: Partial<Role>): Promise<void> {
    this.logger.log(`Publicando evento role.updated para el rol ${role.id}`);
    
    const event: RoleUpdatedEvent = {
      roleId: role.id,
      name: updatedFields.name,
      description: updatedFields.description,
      permissions: updatedFields.permissions,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish('role.updated', event);
  }

  /**
   * Publica un evento de rol eliminado
   */
  async publishRoleDeleted(roleId: string): Promise<void> {
    this.logger.log(`Publicando evento role.deleted para el rol ${roleId}`);
    
    const event: RoleDeletedEvent = {
      roleId,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish('role.deleted', event);
  }

  /**
   * Publica un evento de permiso añadido a un rol
   */
  async publishPermissionAdded(role: Role, permission: string): Promise<void> {
    this.logger.log(`Publicando evento role.permission.added para el rol ${role.id}`);
    
    const event: PermissionAddedEvent = {
      roleId: role.id,
      roleName: role.name,
      permission: permission,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish('role.permission.added', event);
  }

  /**
   * Publica un evento de permiso eliminado de un rol
   */
  async publishPermissionRemoved(role: Role, permission: string): Promise<void> {
    this.logger.log(`Publicando evento role.permission.removed para el rol ${role.id}`);
    
    const event: PermissionRemovedEvent = {
      roleId: role.id,
      roleName: role.name,
      permission: permission,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish('role.permission.removed', event);
  }
}
