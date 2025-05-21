import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { EventSubscriber } from '@bookly-monorepo/event-bus';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../../domain/events/user-events';
import { AuthService } from '../../domain/services/auth.service';
import {
  USER_CREATED_EVENT,
  USER_UPDATED_EVENT,
  USER_DELETED_EVENT
} from '../../domain/constants/event-patterns';

/**
 * Listener para eventos relacionados con usuarios provenientes de users-service
 */
@Injectable()
export class UserEventsListener implements OnModuleInit {
  private readonly logger = new Logger(UserEventsListener.name);

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    @Inject('AuthService') private readonly authService: AuthService
  ) {}

  onModuleInit() {
    // Suscribirse a eventos relacionados con usuarios
    this.subscribeToUserEvents();
  }

  private subscribeToUserEvents() {
    // Escuchar evento de usuario creado
    this.eventSubscriber.registerHandler({
      event: USER_CREATED_EVENT,
      handler: async (event) => {
        const payload = event.payload as UserCreatedEvent;
        this.logger.log(`Recibido evento user.created: ${JSON.stringify(payload)}`);
        // Aquí se puede implementar cualquier lógica necesaria cuando un usuario es creado
        // Por ejemplo, actualizar cache local, realizar validaciones, etc.
      }
    });

    // Escuchar evento de usuario actualizado
    this.eventSubscriber.registerHandler({
      event: USER_UPDATED_EVENT,
      handler: async (event) => {
        const payload = event.payload as UserUpdatedEvent;
        this.logger.log(`Recibido evento user.updated: ${JSON.stringify(payload)}`);
        // Actualizar información local si es necesario
        // Invalidar tokens si el usuario fue desactivado
        if (payload.isActive === false) {
          this.logger.debug(`Usuario ${payload.userId} desactivado - invalidando sesiones`);
          try {
            await this.authService.invalidateUserSessions(payload.userId);
          } catch (error) {
            this.logger.error(`Error al invalidar sesiones: ${error.message}`, error.stack);
          }
        }
      }
    });

    // Escuchar evento de usuario eliminado
    this.eventSubscriber.registerHandler({
      event: USER_DELETED_EVENT,
      handler: async (event) => {
        const payload = event.payload as UserDeletedEvent;
        this.logger.log(`Recibido evento user.deleted: ${JSON.stringify(payload)}`);
        // Invalidar todas las sesiones del usuario
        this.logger.debug(`Usuario ${payload.userId} eliminado - invalidando todas sus sesiones`);
        try {
          await this.authService.invalidateUserSessions(payload.userId);
          this.logger.debug(`Sesiones del usuario ${payload.userId} invalidadas correctamente`);
        } catch (error) {
          this.logger.error(`Error al invalidar sesiones del usuario eliminado: ${error.message}`, error.stack);
        }
      }
    });

  }
}
