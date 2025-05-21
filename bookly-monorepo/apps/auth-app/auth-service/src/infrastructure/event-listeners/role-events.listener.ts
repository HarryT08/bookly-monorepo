import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventSubscriber } from '@bookly-monorepo/event-bus';
import { 
  RoleCreatedEvent, 
  RoleUpdatedEvent, 
  RoleDeletedEvent, 
  PermissionAddedEvent, 
  PermissionRemovedEvent 
} from '../../domain/events/role-events';
import {
  ROLE_CREATED_EVENT,
  ROLE_UPDATED_EVENT,
  ROLE_DELETED_EVENT,
  PERMISSION_ADDED_EVENT,
  PERMISSION_REMOVED_EVENT
} from '../../domain/constants/event-patterns';

/**
 * Listener para eventos relacionados con roles provenientes de roles-service
 */
@Injectable()
export class RoleEventsListener implements OnModuleInit {
  private readonly logger = new Logger(RoleEventsListener.name);

  constructor(
    private readonly eventSubscriber: EventSubscriber
  ) {}

  onModuleInit() {
    // Suscribirse a eventos relacionados con roles
    this.subscribeToRoleEvents();
  }

  private subscribeToRoleEvents() {
    // Escuchar evento de rol creado
    this.eventSubscriber.registerHandler({
      event: ROLE_CREATED_EVENT,
      handler: async (event) => {
        const payload = event.payload as RoleCreatedEvent;
        this.logger.log(`Recibido evento role.created: ${JSON.stringify(payload)}`);
        // Aquí se puede implementar cualquier lógica necesaria cuando un rol es creado
        // Por ejemplo, actualizar cache local de roles, etc.
        this.logger.debug(`Rol creado: ${payload.name} (${payload.roleId})`);
      }
    });

    // Escuchar evento de rol actualizado
    this.eventSubscriber.registerHandler({
      event: ROLE_UPDATED_EVENT,
      handler: async (event) => {
        const payload = event.payload as RoleUpdatedEvent;
        this.logger.log(`Recibido evento role.updated: ${JSON.stringify(payload)}`);
        // Actualizar información local si es necesario
        this.logger.debug(`Rol actualizado: ${payload.roleId}`);
        if (payload.name) {
          this.logger.debug(`Nuevo nombre del rol: ${payload.name}`);
        }
      }
    });

    // Escuchar evento de rol eliminado
    this.eventSubscriber.registerHandler({
      event: ROLE_DELETED_EVENT,
      handler: async (event) => {
        const payload = event.payload as RoleDeletedEvent;
        this.logger.log(`Recibido evento role.deleted: ${JSON.stringify(payload)}`);
        // Actualizar información local si es necesario
        this.logger.debug(`Rol eliminado: ${payload.roleId}`);
      }
    });

    // Escuchar evento de permiso añadido a un rol
    this.eventSubscriber.registerHandler({
      event: PERMISSION_ADDED_EVENT,
      handler: async (event) => {
        const payload = event.payload as PermissionAddedEvent;
        this.logger.log(`Recibido evento role.permission.added: ${JSON.stringify(payload)}`);
        // Manejar la actualización de permisos según sea necesario
        this.logger.debug(`Permiso '${payload.permission}' añadido al rol ${payload.roleId}`);
      }
    });
    
    // Escuchar evento de permiso eliminado de un rol
    this.eventSubscriber.registerHandler({
      event: PERMISSION_REMOVED_EVENT,
      handler: async (event) => {
        const payload = event.payload as PermissionRemovedEvent;
        this.logger.log(`Recibido evento role.permission.removed: ${JSON.stringify(payload)}`);
        // Manejar la actualización de permisos según sea necesario
        this.logger.debug(`Permiso '${payload.permission}' eliminado del rol ${payload.roleId}`);
      }
    });
    
  }
}
