import { Injectable, Logger } from '@nestjs/common';
import { IEvent, EventHandler, IEventHandler } from '@bookly-monorepo/event-bus';
import { CommandResponse } from '../../../domain/interfaces/command-response.interface';

/**
 * Manejador base para respuestas de comandos de usuarios
 */
@Injectable()
@EventHandler('users.*.response.*')
export class UserCommandResponseHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(UserCommandResponseHandler.name);
  
  async handle(event: IEvent): Promise<void> {
    this.logger.debug(`Procesando respuesta de comando de usuario: ${event.pattern}`);
    const payload = event.payload as CommandResponse;
    
    try {
      // Procesar respuesta del comando segu00fan el patru00f3n del evento
      const commandPattern = event.pattern.split('.');
      const responseType = commandPattern[commandPattern.length - 1];
      
      if (payload.success) {
        this.logger.debug(`Comando ${responseType} ejecutado con u00e9xito: ${JSON.stringify(payload.data)}`);
        // Aquu00ed se puede implementar la lu00f3gica para manejar la respuesta exitosa
      } else {
        this.logger.warn(`Error en comando ${responseType}: ${payload.error}`);
        // Aquu00ed se puede implementar la lu00f3gica para manejar errores
      }
    } catch (error) {
      this.logger.error(`Error procesando respuesta de comando: ${error.message}`, error.stack);
    }
  }
}

/**
 * Manejador base para respuestas de comandos de roles
 */
@Injectable()
@EventHandler('roles.*.response.*')
export class RoleCommandResponseHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(RoleCommandResponseHandler.name);
  
  async handle(event: IEvent): Promise<void> {
    this.logger.debug(`Procesando respuesta de comando de rol: ${event.pattern}`);
    const payload = event.payload as CommandResponse;
    
    try {
      // Procesar respuesta del comando segu00fan el patru00f3n del evento
      const commandPattern = event.pattern.split('.');
      const responseType = commandPattern[commandPattern.length - 1];
      
      if (payload.success) {
        this.logger.debug(`Comando ${responseType} ejecutado con u00e9xito: ${JSON.stringify(payload.data)}`);
        // Aquu00ed se puede implementar la lu00f3gica para manejar la respuesta exitosa
      } else {
        this.logger.warn(`Error en comando ${responseType}: ${payload.error}`);
        // Aquu00ed se puede implementar la lu00f3gica para manejar errores
      }
    } catch (error) {
      this.logger.error(`Error procesando respuesta de comando: ${error.message}`, error.stack);
    }
  }
}
