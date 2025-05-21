import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventSubscriber } from '@bookly-monorepo/event-bus';
import { UserServiceProxy } from '../services/user-service-proxy';
import { RoleServiceProxy } from '../services/role-service-proxy';

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
    this.eventSubscriber.subscribe('users.*.response.*', (data: any, eventName: string) => {
      this.logger.debug(`Recibida respuesta de comando: ${eventName}`);
      this.userServiceProxy.handleCommandResponse(eventName, data);
    });

    // Suscribirse a todas las respuestas de comandos de roles
    this.eventSubscriber.subscribe('roles.*.response.*', (data: any, eventName: string) => {
      this.logger.debug(`Recibida respuesta de comando: ${eventName}`);
      this.roleServiceProxy.handleCommandResponse(eventName, data);
    });
  }
}
