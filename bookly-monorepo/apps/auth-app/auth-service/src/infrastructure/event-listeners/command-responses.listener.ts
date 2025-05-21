import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventSubscriber } from '@bookly-monorepo/event-bus';
import { UserServiceProxy } from '../proxies/user-service.proxy';
import { RoleServiceProxy } from '../proxies/role-service.proxy';

/**
 * Listener para respuestas a comandos enviados a otros servicios
 */
@Injectable()
export class CommandResponsesListener implements OnModuleInit {
  private readonly logger = new Logger(CommandResponsesListener.name);

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    private readonly userServiceProxy: UserServiceProxy,
    private readonly roleServiceProxy: RoleServiceProxy
  ) {}

  onModuleInit() {
    // Suscribirse a eventos de respuesta de comandos
    this.subscribeToCommandResponses();
  }

  private subscribeToCommandResponses() {
    // Suscribirse a todas las respuestas de comandos de usuarios
    this.eventSubscriber.registerHandler({
      event: 'users.*.response.*',
      handler: (event) => {
        const { data, pattern } = event;
        this.logger.debug(`Recibida respuesta de comando de usuario: ${pattern}`);
        // Procesar la respuesta utilizando el proxy de usuario
        this.userServiceProxy.handleCommandResponse(pattern, data);
      }
    });

    // Suscribirse a todas las respuestas de comandos de roles
    this.eventSubscriber.registerHandler({
      event: 'roles.*.response.*',
      handler: (event) => {
        const { data, pattern } = event;
        this.logger.debug(`Recibida respuesta de comando de rol: ${pattern}`);
        // Procesar la respuesta utilizando el proxy de rol
        this.roleServiceProxy.handleCommandResponse(pattern, data);
      }
    });
  }
}
