import { Injectable, Logger, Inject } from '@nestjs/common';
import { IEvent, EventHandler, IEventHandler, EventPublisher } from '@bookly-monorepo/event-bus';
import { SESSION_INVALIDATE_EVENT } from '../../../domain/constants/event-patterns';
import { AuthService } from '../../domain/services/auth.service';

// Interfaces para los tipos de eventos
interface UserCreatedEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  timestamp: Date;
}

interface UserUpdatedEvent {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  timestamp: Date;
}

interface UserDeletedEvent {
  userId: string;
  timestamp: Date;
}

/**
 * Manejador de eventos para user.created
 */
@Injectable()
@EventHandler('user.created')
export class UserCreatedHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);
  
  constructor(
    @Inject('AuthService') private readonly authService: AuthService
  ) {}
  
  async handle(event: IEvent): Promise<void> {
    this.logger.log(`Procesando evento user.created: ${JSON.stringify(event.payload)}`);
    const payload = event.payload as UserCreatedEvent;
    
    try {
      // Implementar lu00f3gica para procesar la creaciu00f3n de usuarios
      this.logger.debug(`Usuario creado: ${payload.email} (${payload.userId})`);
      this.logger.debug(`Rol asignado: ${payload.role}`);
    } catch (error) {
      this.logger.error(`Error procesando evento user.created: ${error.message}`, error.stack);
    }
  }
}

/**
 * Manejador de eventos para user.updated
 */
@Injectable()
@EventHandler('user.updated')
export class UserUpdatedHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(UserUpdatedHandler.name);
  
  constructor(
    @Inject('AuthService') private readonly authService: AuthService
  ) {}
  
  async handle(event: IEvent): Promise<void> {
    this.logger.log(`Procesando evento user.updated: ${JSON.stringify(event.payload)}`);
    const payload = event.payload as UserUpdatedEvent;
    
    try {
      // Implementar lu00f3gica para procesar la actualizaciu00f3n de usuarios
      this.logger.debug(`Usuario actualizado: ${payload.userId}`);
      
      // Verificar cambios recu00edbidos en el payload
      if (payload.email) {
        this.logger.debug(`Email actualizado: ${payload.email}`);
      }
      
      if (payload.role) {
        this.logger.debug(`Rol actualizado: ${payload.role}`);
      }
      
      // Invalidar tokens si el usuario fue desactivado
      if (payload.isActive === false) {
        this.logger.debug(`Usuario desactivado, invalidando sesiones para: ${payload.userId}`);
        // Se implementaru00eda la lu00f3gica para invalidar sesiones
      }
    } catch (error) {
      this.logger.error(`Error procesando evento user.updated: ${error.message}`, error.stack);
    }
  }
}

/**
 * Manejador de eventos para user.deleted
 */
@Injectable()
@EventHandler('user.deleted')
export class UserDeletedHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(UserDeletedHandler.name);
  
  constructor(
    @Inject('AuthService') private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisher
  ) {}
  
  async handle(event: IEvent): Promise<void> {
    this.logger.log(`Procesando evento user.deleted: ${JSON.stringify(event.payload)}`);
    const payload = event.payload as UserDeletedEvent;
    
    try {
      // Implementar lu00f3gica para procesar la eliminaciu00f3n de usuarios
      this.logger.debug(`Usuario eliminado: ${payload.userId}`);
      
      // Invalidar todas las sesiones del usuario
      this.logger.debug(`Invalidando sesiones para el usuario: ${payload.userId}`);
      
      try {
        // Implementación de la invalidación de sesiones siguiendo los principios de Event-Driven Architecture
        // Este código publica un evento para que el servicio encargado de las sesiones las invalide
        // Utilizamos la constante SESSION_INVALIDATE_EVENT para mantener consistencia
        await this.eventPublisher.publish({
          pattern: SESSION_INVALIDATE_EVENT,
          data: { userId: payload.userId, reason: 'USER_DELETED' }
        });
      } catch (sessionError) {
        this.logger.error(`Error al invalidar sesiones: ${sessionError.message}`, sessionError.stack);
      }
    } catch (error) {
      this.logger.error(`Error procesando evento user.deleted: ${error.message}`, error.stack);
    }
  }
}
