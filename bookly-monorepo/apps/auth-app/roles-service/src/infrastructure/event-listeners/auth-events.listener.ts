import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventSubscriber } from '@bookly-monorepo/event-bus';

// Importar los handlers de eventos
import { AuthRoleRequiredHandler } from '../event-handlers/auth-role-required.handler';
import { RoleCommandHandler } from '../event-handlers/role-command.handler';

/**
 * Registrador de handlers para eventos relacionados con roles y autenticaciu00f3n
 */
@Injectable()
export class AuthEventsListener implements OnModuleInit {
  private readonly logger = new Logger(AuthEventsListener.name);

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    private readonly authRoleRequiredHandler: AuthRoleRequiredHandler,
    private readonly roleCommandHandler: RoleCommandHandler
  ) {}

  onModuleInit() {
    this.logger.log('Registrando manejadores de eventos para auth-events');
    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    // Registrar los manejadores de eventos
    // Esto reemplaza el uso de subscribe() que no existe en la implementaciu00f3n actual
    try {
      this.eventSubscriber.registerHandler(AuthRoleRequiredHandler);
      this.eventSubscriber.registerHandler(RoleCommandHandler);
      this.logger.log('Manejadores de eventos registrados correctamente');
    } catch (error) {
      this.logger.error(`Error registrando manejadores de eventos: ${error.message}`, error.stack);
    }
  }
}
