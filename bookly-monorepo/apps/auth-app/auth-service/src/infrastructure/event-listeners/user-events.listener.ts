import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { EventSubscriber } from '@bookly-monorepo/event-bus';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../../domain/events/user-events';
import { AuthService } from '../../domain/services/auth.service';

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
    this.eventSubscriber.subscribe('user.created', async (event: UserCreatedEvent) => {
      this.logger.log(`Recibido evento user.created: ${JSON.stringify(event)}`);
      // Aquí se puede implementar cualquier lógica necesaria cuando un usuario es creado
      // Por ejemplo, actualizar cache local, realizar validaciones, etc.
    });

    // Escuchar evento de usuario actualizado
    this.eventSubscriber.subscribe('user.updated', async (event: UserUpdatedEvent) => {
      this.logger.log(`Recibido evento user.updated: ${JSON.stringify(event)}`);
      // Actualizar información local si es necesario
      // Por ejemplo, invalidar tokens si el usuario fue desactivado
      if (event.isActive === false) {
        // Implementar lógica para invalidar sesiones
        // await this.authService.invalidateUserSessions(event.userId);
      }
    });

    // Escuchar evento de usuario eliminado
    this.eventSubscriber.subscribe('user.deleted', async (event: UserDeletedEvent) => {
      this.logger.log(`Recibido evento user.deleted: ${JSON.stringify(event)}`);
      // Invalidar todas las sesiones del usuario
      // await this.authService.invalidateUserSessions(event.userId);
    });
  }
}
