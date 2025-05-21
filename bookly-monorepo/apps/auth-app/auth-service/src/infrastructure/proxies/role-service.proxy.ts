import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher, EventSubscriber, IEvent, IEventHandler } from '@bookly-monorepo/event-bus';
import { v4 as uuidv4 } from 'uuid';

// Interfaces para los tipos de retorno
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

interface CommandResponse {
  data: unknown;
  error: string | null;
}

/**
 * Proxy para comunicarse con roles-service mediante eventos
 */
@Injectable()
export class RoleServiceProxy {
  private readonly logger = new Logger(RoleServiceProxy.name);

  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly eventSubscriber: EventSubscriber,
  ) {}

  /**
   * Encuentra un rol por su ID
   */
  async findRoleById(roleId: string): Promise<Role> {
    this.logger.log(`Buscando rol con ID: ${roleId}`);
    return this.sendCommand<Role>('roles.findById.command', { roleId });
  }

  /**
   * Encuentra un rol por su nombre
   */
  async findRoleByName(name: string): Promise<Role> {
    this.logger.log(`Buscando rol con nombre: ${name}`);
    return this.sendCommand<Role>('roles.findByName.command', { name });
  }

  /**
   * Obtiene todos los roles
   */
  async getAllRoles(): Promise<Role[]> {
    this.logger.log('Obteniendo todos los roles');
    return this.sendCommand<Role[]>('roles.findAll.command', {});
  }

  /**
   * Verifica si un rol existe, y si no existe lo crea
   */
  async ensureRoleExists(roleName: string, roleDescription?: string): Promise<Role> {
    this.logger.log(`Verificando existencia del rol: ${roleName}`);

    try {
      // Primero intentamos encontrar el rol
      const existingRole = await this.findRoleByName(roleName);
      return existingRole;
    } catch (error: unknown) {
      // Verificar que la excepción es porque no se encontró el rol
      if (error instanceof Error && error.message.includes('NOT_FOUND')) {
        // Si no existe, lo creamos
        this.logger.log(`Rol ${roleName} no encontrado, creándolo...`);
        return this.createRole({
          name: roleName,
          description: roleDescription || `Rol ${roleName} creado automáticamente`,
          permissions: [],
        });
      } else {
        // Si es otro tipo de error, lo propagamos
        throw error;
      }
    }
  }

  /**
   * Crea un nuevo rol
   */
  async createRole(roleData: { name: string; description?: string; permissions?: string[] }): Promise<Role> {
    this.logger.log(`Creando rol: ${roleData.name}`);
    return this.sendCommand<Role>('roles.create.command', { roleData });
  }

  /**
   * Actualiza un rol existente
   */
  async updateRole(roleId: string, roleData: Partial<{ name: string; description?: string; permissions?: string[] }>): Promise<Role> {
    this.logger.log(`Actualizando rol con ID: ${roleId}`);
    return this.sendCommand<Role>('roles.update.command', { roleId, roleData });
  }

  /**
   * Elimina un rol
   */
  async deleteRole(roleId: string): Promise<{id: string; message: string}> {
    this.logger.log(`Eliminando rol con ID: ${roleId}`);
    return this.sendCommand<{id: string; message: string}>('roles.delete.command', { roleId });
  }

  /**
   * Añade un permiso a un rol
   */
  async addPermissionToRole(roleId: string, permission: string): Promise<Role> {
    this.logger.log(`Añadiendo permiso ${permission} al rol ${roleId}`);
    return this.sendCommand<Role>('roles.addPermission.command', { roleId, permission });
  }

  /**
   * Elimina un permiso de un rol
   */
  async removePermissionFromRole(roleId: string, permission: string): Promise<Role> {
    this.logger.log(`Eliminando permiso ${permission} del rol ${roleId}`);
    return this.sendCommand<Role>('roles.removePermission.command', { roleId, permission });
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
      const responseEvent = `roles.response.${correlationId}`;

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
