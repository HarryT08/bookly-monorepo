import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventSubscriber, EventPublisher } from '@bookly-monorepo/event-bus';
import { UserRegisteredEvent, UserAuthenticatedEvent } from '../../domain/events/user-events';
import { UserService } from '../services/user.service';

/**
 * Listener para eventos relacionados con autenticación y registro provenientes de auth-service
 */
@Injectable()
export class AuthEventsListener implements OnModuleInit {
  private readonly logger = new Logger(AuthEventsListener.name);

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    private readonly eventPublisher: EventPublisher,
    private readonly userService: UserService
  ) {}

  onModuleInit() {
    // Suscribirse a eventos relacionados con autenticación
    this.subscribeToAuthEvents();
  }

  private subscribeToAuthEvents() {
    // Escuchar evento de usuario registrado
    this.eventSubscriber.subscribe('auth.user.registered', async (event: UserRegisteredEvent) => {
      this.logger.log(`Recibido evento auth.user.registered: ${JSON.stringify(event)}`);
      
      // Actualizamos el estado del usuario o realizamos acciones adicionales necesarias
      try {
        const user = await this.userService.findById(event.userId);
        if (user) {
          // Por ejemplo, podríamos marcar que el usuario ha sido validado por auth-service
          await this.userService.update(user.id, { isEmailVerified: true });
          
          // Publicar evento de confirmación
          await this.eventPublisher.publish('users.registration.confirmed', {
            userId: user.id,
            email: user.email,
            timestamp: new Date()
          });
        }
      } catch (error) {
        this.logger.error(`Error procesando evento auth.user.registered: ${error.message}`);
      }
    });

    // Escuchar evento de usuario autenticado
    this.eventSubscriber.subscribe('auth.user.authenticated', async (event: UserAuthenticatedEvent) => {
      this.logger.log(`Recibido evento auth.user.authenticated: ${JSON.stringify(event)}`);
      
      try {
        const user = await this.userService.findById(event.userId);
        if (user) {
          // Actualizar la última vez que el usuario inició sesión
          await this.userService.update(user.id, { lastLogin: new Date() });
        }
      } catch (error) {
        this.logger.error(`Error procesando evento auth.user.authenticated: ${error.message}`);
      }
    });

    // Escuchar evento de comandos de users-service
    this.eventSubscriber.subscribe('users.*', async (payload: any, eventName: string) => {
      if (!eventName.includes('response') && eventName.includes('.command.')) {
        this.logger.log(`Recibido comando: ${eventName}`);
        const { responseEvent, ...commandData } = payload;
        
        try {
          // Determinar qué comando es y ejecutarlo
          let result: any;
          let error: string = null;
          
          if (eventName === 'users.findById.command') {
            result = await this.userService.findById(commandData.userId);
          } else if (eventName === 'users.findByEmail.command') {
            result = await this.userService.findByEmail(commandData.email);
          } else if (eventName === 'users.create.command') {
            result = await this.userService.create(commandData.userData);
          } else if (eventName === 'users.update.command') {
            result = await this.userService.update(commandData.userId, commandData.userData);
          } else if (eventName === 'users.delete.command') {
            result = await this.userService.remove(commandData.userId);
          } else {
            error = `Comando desconocido: ${eventName}`;
          }
          
          // Publicar respuesta
          if (responseEvent) {
            await this.eventPublisher.publish(responseEvent, {
              data: result,
              error,
            });
          }
        } catch (error) {
          this.logger.error(`Error procesando comando ${eventName}: ${error.message}`);
          
          // Publicar error
          if (responseEvent) {
            await this.eventPublisher.publish(responseEvent, {
              data: null,
              error: error.message,
            });
          }
        }
      }
    });
  }
}
