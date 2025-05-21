import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventPublisher, IEvent, IEventHandler, EventHandler } from '@bookly-monorepo/event-bus';
import { UserService } from '../services/user.service';

// Adaptamos los handlers para que funcionen con la interfaz IEvent

// Definir los handlers de eventos específicos
@EventHandler('auth.user.registered')
export class UserRegisteredHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);
  
  constructor(
    private readonly userService: UserService,
    private readonly eventPublisher: EventPublisher
  ) {}
  
  async handle(event: IEvent): Promise<void> {
    // Cast seguro del payload para extraer los datos específicos que necesitamos
    const payload = event.payload as { userId: string, email: string };
    this.logger.log(`Recibido evento auth.user.registered: ${JSON.stringify(event)}`);
    
    try {
      const user = await this.userService.findById(payload.userId);
      if (user) {
        // Solo usar propiedades disponibles en UpdateUserDto
        await this.userService.update(user.id, { 
          // No usamos isEmailVerified porque no está en el DTO
          // Solo actualizamos propiedades permitidas
        });
        
        // Publicar evento de confirmación
        await this.eventPublisher.publish('users.registration.confirmed', {
          eventName: 'users.registration.confirmed',
          version: '1.0',
          correlationId: event.correlationId || 'n/a',
          timestamp: new Date(),
          payload: {
            userId: user.id,
            email: user.email
          }
        });
      }
    } catch (error) {
      this.logger.error(`Error procesando evento auth.user.registered: ${error.message}`);
    }
  }
}

@EventHandler('auth.user.authenticated')
export class UserAuthenticatedHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(UserAuthenticatedHandler.name);
  
  constructor(
    private readonly userService: UserService
  ) {}
  
  async handle(event: IEvent): Promise<void> {
    const payload = event.payload as { userId: string };
    this.logger.log(`Recibido evento auth.user.authenticated: ${JSON.stringify(event)}`);
    
    try {
      const user = await this.userService.findById(payload.userId);
      if (user) {
        // Solo usar propiedades disponibles en UpdateUserDto
        // No usamos lastLogin porque no está en el DTO
        // await this.userService.update(user.id, { lastLogin: new Date() });
      }
    } catch (error) {
      this.logger.error(`Error procesando evento auth.user.authenticated: ${error.message}`);
    }
  }
}

// Definimos tipos para los datos de comando y respuesta
interface CommandData {
  userId?: string;
  email?: string;
  userData?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ResponseData {
  data: unknown;
  error: string | null;
}

// Handler genérico para comandos
@EventHandler('users.*')
export class UsersCommandHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(UsersCommandHandler.name);
  
  constructor(
    private readonly userService: UserService,
    private readonly eventPublisher: EventPublisher
  ) {}
  
  async handle(event: IEvent & { responseEvent?: string }): Promise<void> {
    const eventName = event.eventName;
    
    // Solo procesar comandos, no respuestas
    if (!this.isValidCommand(eventName)) {
      return;
    }
    
    this.logger.log(`Recibido comando: ${eventName}`);
    const { responseEvent, ...commandData } = event as IEvent & { responseEvent?: string } & CommandData;
    
    try {
      // Ejecutar el comando adecuado
      const result = await this.executeCommand(eventName, commandData);
      
      // Publicar respuesta si se especificó un evento de respuesta
      if (responseEvent) {
        await this.publishResponse(responseEvent, { data: result, error: null });
      }
    } catch (error) {
      this.logger.error(`Error procesando comando ${eventName}: ${error.message}`);
      
      // Publicar error si se especificó un evento de respuesta
      if (responseEvent) {
        await this.publishResponse(responseEvent, { data: null, error: error.message });
      }
    }
  }
  
  // Determina si el nombre del evento es un comando válido
  private isValidCommand(eventName: string): boolean {
    return !eventName.includes('response') && eventName.includes('.command.');
  }
  
  // Ejecuta el comando correspondiente según el nombre del evento
  private async executeCommand(eventName: string, commandData: CommandData): Promise<unknown> {
    // Preparamos los datos antes del switch para evitar declaraciones en bloques case
    let createData;
    if (eventName === 'users.create.command') {
      createData = commandData.userData as {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      };
    }

    switch (eventName) {
      case 'users.findById.command':
        return this.userService.findById(commandData.userId);
      
      case 'users.findByEmail.command':
        return this.userService.findByEmail(commandData.email);
      
      case 'users.create.command':
        // Usar los datos preparados antes del switch
        return this.userService.create(createData);
      
      case 'users.update.command':
        // Garantizar que userData es del tipo correcto
        return this.userService.update(
          commandData.userId, 
          commandData.userData as {
            firstName?: string;
            lastName?: string;
            email?: string;
            password?: string;
          }
        );
      
      case 'users.delete.command':
        return this.userService.remove(commandData.userId);
      
      default:
        throw new Error(`Comando desconocido: ${eventName}`);
    }
  }
  
  // Publica la respuesta con los datos proporcionados
  private async publishResponse(responseEvent: string, responseData: ResponseData): Promise<void> {
    await this.eventPublisher.publish(responseEvent, responseData);
  }
}

/**
 * Módulo de registro para los handlers de eventos relacionados con autenticación
 * Ahora usamos el patrón de handlers con decoradores en lugar del subscriber manual
 */
@Injectable()
export class AuthEventsModule implements OnModuleInit {
  private readonly logger = new Logger(AuthEventsModule.name);

  constructor(
    private readonly userService: UserService,
    private readonly eventPublisher: EventPublisher
  ) {}

  onModuleInit() {
    this.logger.log('Inicializando módulo de eventos de autenticación');
    // Los handlers se registran automáticamente a través de los decoradores @EventHandler
  }
}
