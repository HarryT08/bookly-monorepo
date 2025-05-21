import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher, EventSubscriber, IEvent, IEventHandler } from '@bookly-monorepo/event-bus';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../../domain/interfaces/user.interface';

/**
 * Interfaces para los tipos de retorno
 */
interface User extends IUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  roles: string[];
}

interface CommandResponse {
  data: unknown;
  error: string | null;
}

/**
 * Proxy para comunicarse con users-service mediante eventos
 */
@Injectable()
export class UserServiceProxy {
  private readonly logger = new Logger(UserServiceProxy.name);

  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly eventSubscriber: EventSubscriber,
  ) {}

  /**
   * Encuentra un usuario por su ID
   */
  async findUserById(userId: string): Promise<User> {
    this.logger.log(`Buscando usuario con ID: ${userId}`);
    return this.sendCommand<User>('users.findById.command', { userId });
  }

  /**
   * Encuentra un usuario por su email
   */
  async findUserByEmail(email: string): Promise<User> {
    this.logger.log(`Buscando usuario con email: ${email}`);
    return this.sendCommand<User>('users.findByEmail.command', { email });
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    this.logger.log(`Creando usuario: ${userData.email}`);
    return this.sendCommand<User>('users.create.command', { userData });
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    this.logger.log(`Actualizando usuario con ID: ${userId}`);
    return this.sendCommand<User>('users.update.command', { userId, userData });
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(userId: string): Promise<{id: string; message: string}> {
    this.logger.log(`Eliminando usuario con ID: ${userId}`);
    return this.sendCommand<{id: string; message: string}>('users.delete.command', { userId });
  }

  /**
   * Actualiza el refresh token de un usuario
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<User> {
    this.logger.log(`Actualizando refresh token para usuario: ${userId}`);
    return this.sendCommand<User>('users.updateRefreshToken.command', { userId, refreshToken });
  }

  /**
   * Busca un usuario por refresh token
   */
  async findUserByRefreshToken(refreshToken: string): Promise<User> {
    this.logger.log(`Buscando usuario por refresh token`);
    return this.sendCommand<User>('users.findByRefreshToken.command', { refreshToken });
  }

  /**
   * Envía un comando mediante eventos y espera la respuesta
   * @private
   */
  private async sendCommand<T>(commandName: string, payload: Record<string, unknown>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Generar un ID único para la correlación
      const correlationId = uuidv4();
      // Crear el nombre del evento de respuesta
      const responseEvent = `users.response.${correlationId}`;

      // Crear un handler temporal para este evento específico
      class TemporaryHandler implements IEventHandler<IEvent> {
        constructor(private readonly resolver: (data: T) => void, private readonly rejecter: (error: Error) => void) {}

        async handle(event: IEvent): Promise<void> {
          const response = event.payload as CommandResponse;
          if (response.error) {
            return this.rejecter(new Error(response.error));
          }
          return this.resolver(response.data as T);
        }
      }

      // Registrar el handler temporalmente
      const handlerInstance = new TemporaryHandler(resolve, reject);
      this.eventSubscriber.registerHandler(responseEvent, handlerInstance);

      // Publicar el comando con el evento de respuesta incluido
      this.eventPublisher.publish(commandName, {
        ...payload,
        responseEvent,
      });

      // Establecer un timeout por si no hay respuesta
      setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error(`Timeout esperando respuesta del comando ${commandName}`));
      }, 5000); // 5 segundos de timeout
    });
  }
}
