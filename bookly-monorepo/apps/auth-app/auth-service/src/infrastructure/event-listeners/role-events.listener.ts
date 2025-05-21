import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventSubscriber } from '@bookly-monorepo/event-bus';
import { 
  RoleCreatedEvent, 
  RoleUpdatedEvent, 
  RoleDeletedEvent, 
  PermissionAddedEvent, 
  PermissionRemovedEvent 
} from '../../domain/events/role-events';

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
    this.eventSubscriber.subscribe('role.created', async (event: RoleCreatedEvent) => {
      this.logger.log(`Recibido evento role.created: ${JSON.stringify(event)}`);
      // Aquí se puede implementar cualquier lógica necesaria cuando un rol es creado
      // Por ejemplo, actualizar cache local de roles, etc.
    });

    // Escuchar evento de rol actualizado
    this.eventSubscriber.subscribe('role.updated', async (event: RoleUpdatedEvent) => {
      this.logger.log(`Recibido evento role.updated: ${JSON.stringify(event)}`);
      // Actualizar información local si es necesario
    });

    // Escuchar evento de rol eliminado
    this.eventSubscriber.subscribe('role.deleted', async (event: RoleDeletedEvent) => {
      this.logger.log(`Recibido evento role.deleted: ${JSON.stringify(event)}`);
      // Actualizar información local si es necesario
    });

    // Escuchar evento de permiso añadido a un rol
    this.eventSubscriber.subscribe('role.permission.added', async (event: PermissionAddedEvent) => {
      this.logger.log(`Recibido evento role.permission.added: ${JSON.stringify(event)}`);
      // Manejar la actualización de permisos según sea necesario
    });

    // Escuchar evento de permiso eliminado de un rol
    this.eventSubscriber.subscribe('role.permission.removed', async (event: PermissionRemovedEvent) => {
      this.logger.log(`Recibido evento role.permission.removed: ${JSON.stringify(event)}`);
      // Manejar la actualización de permisos según sea necesario
    });
    
  }
}
