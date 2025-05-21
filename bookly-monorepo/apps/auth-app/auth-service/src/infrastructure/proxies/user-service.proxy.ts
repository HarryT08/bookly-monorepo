import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher, EventSubscriber } from '@bookly-monorepo/event-bus';
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

      // Suscribirse al evento de respuesta
      const subscription = this.eventSubscriber.subscribe(responseEvent, async (response: CommandResponse) => {
        // Limpieza: cancelar la suscripción una vez recibida la respuesta
        subscription.unsubscribe();

        if (response.error) {
          return reject(new Error(response.error));
        }
        return resolve(response.data as T);
      });

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
