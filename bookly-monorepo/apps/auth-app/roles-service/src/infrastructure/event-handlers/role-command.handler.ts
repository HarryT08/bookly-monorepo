import { Injectable, Logger } from '@nestjs/common';
import { IEvent, EventHandler, IEventHandler, EventPublisher } from '@bookly-monorepo/event-bus';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto } from '@bookly-monorepo/dto';

interface CommandPayload {
  responseEvent?: string;
  roleId?: string;
  name?: string;
  roleData?: Record<string, unknown>;
  permission?: string;
}

interface CommandResult {
  data: unknown;
  error: string | null;
}

/**
 * Manejador de eventos para comandos de roles
 */
@Injectable()
@EventHandler('roles.*.command')
export class RoleCommandHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(RoleCommandHandler.name);
  
  constructor(
    private readonly roleService: RolesService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async handle(event: IEvent): Promise<void> {
    // Ignorar eventos de respuesta y manejar solo comandos
    if (event.eventName.includes('response') || !event.eventName.includes('.command')) {
      return;
    }
    
    this.logger.log(`Procesando comando: ${event.eventName}`);
    const payload = event.payload as CommandPayload;
    const { responseEvent, ...commandData } = payload;
    
    try {
      // Ejecutar el comando
      const result = await this.executeRoleCommand(event.eventName, commandData);
      
      // Publicar respuesta si se solicita
      if (responseEvent) {
        await this.eventPublisher.publish(responseEvent, {
          data: result,
          error: null,
        } as CommandResult, event.correlationId);
      }
    } catch (error) {
      this.logger.error(`Error procesando comando ${event.eventName}: ${error.message}`, error.stack);
      
      // Publicar error
      if (responseEvent) {
        await this.eventPublisher.publish(responseEvent, {
          data: null,
          error: error.message,
        } as CommandResult, event.correlationId);
      }
    }
  }
  
  /**
   * Ejecuta un comando especu00edfico de roles
   */
  /**
   * Extrae y convierte correctamente el valor de descripción de los datos del comando
   * @param roleData Los datos del rol recibidos en el comando
   * @returns El valor de descripción convertido o undefined si no existe
   */
  /**
   * Convierte un valor desconocido a una cadena de texto segura
   * @param value El valor a convertir
   * @returns El valor convertido a string de forma segura
   */
  /**
   * Convierte un valor desconocido a una cadena de forma segura, evitando el formato predeterminado '[object Object]'
   * @param value El valor a convertir a string
   * @returns Una representaciu00f3n de cadena segura del valor
   */
  private safeToString(value: unknown): string {
    // Si ya es una cadena, la devolvemos directamente
    if (typeof value === 'string') {
      return value;
    }
    
    // Para objetos (incluidos arrays), usamos JSON.stringify para una representaciu00f3n mu00e1s útil
    if (value !== null && typeof value === 'object') {
      // Intentamos serializar el objeto de forma segura
      try {
        return JSON.stringify(value);
      } catch (error) {
        // Manejamos explícitamente el error de serialización
        const objectType = Object.prototype.toString.call(value).slice(8, -1);
        this.logger.warn(`Error al serializar valor de tipo ${objectType}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        return `[${objectType}]`;
      }
    }
    
    // Para otros tipos primitivos (number, boolean, undefined, etc.) usamos su representaciu00f3n como string
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    // Cualquier otro tipo primitivo (number, boolean, etc.)
    return String(value);
  }

  /**
   * Extrae y convierte correctamente el valor de nombre de los datos del comando
   * @param roleData Los datos del rol recibidos en el comando
   * @returns El valor de nombre convertido
   */
  private getNameValue(roleData: Record<string, unknown>): string {
    if (!('name' in roleData) || roleData.name === null || roleData.name === undefined) {
      throw new Error('El campo name es requerido para crear un rol');
    }
    
    return this.safeToString(roleData.name);
  }

  /**
   * Extrae y convierte correctamente el valor de descripciu00f3n de los datos del comando
   * @param roleData Los datos del rol recibidos en el comando
   * @returns El valor de descripciu00f3n convertido o undefined si no existe
   */
  private getDescriptionValue(roleData: Record<string, unknown>): string | undefined {
    if (!('description' in roleData) || roleData.description === null || roleData.description === undefined) {
      return undefined;
    }
    
    return this.safeToString(roleData.description);
  }

  /**
   * Extrae y convierte correctamente el array de permisos de los datos del comando
   * @param roleData Los datos del rol recibidos en el comando
   * @returns Array de permisos convertidos a string de forma segura
   */
  private getPermissionsValue(roleData: Record<string, unknown>): string[] {
    if (!('permissions' in roleData) || !roleData.permissions) {
      return [];
    }
    
    // Verificar que sea un array
    if (!Array.isArray(roleData.permissions)) {
      // Si no es un array pero tiene algún valor, intentamos convertirlo a array con un solo elemento
      return [this.safeToString(roleData.permissions)];
    }
    
    // Es un array, convertimos cada elemento a string de forma segura
    return roleData.permissions.map(permission => this.safeToString(permission));
  }

  private async executeRoleCommand(eventName: string, commandData: CommandPayload): Promise<unknown> {
    switch (eventName) {
      case 'roles.findById.command':
        return await this.roleService.findById(commandData.roleId);
      case 'roles.findByName.command':
        return await this.roleService.findByName(commandData.name);
      case 'roles.findAll.command':
        return await this.roleService.findAll();
      case 'roles.create.command': {
        // Validamos los datos y creamos un objeto CreateRoleDto con validación y transformación segura
        if (!commandData.roleData || typeof commandData.roleData !== 'object') {
          throw new Error('Se requieren datos válidos para crear un rol');
        }
        
        // Creamos un objeto que cumpla con la estructura de CreateRoleDto utilizando nuestras funciones auxiliares
        const createRoleDto: CreateRoleDto = {
          name: this.getNameValue(commandData.roleData),
          description: this.getDescriptionValue(commandData.roleData),
          permissions: this.getPermissionsValue(commandData.roleData)
        };
        
        return await this.roleService.create(createRoleDto);
      }
      case 'roles.update.command':
        return await this.roleService.update(commandData.roleId, commandData.roleData as UpdateRoleDto);
      case 'roles.delete.command':
        return await this.roleService.remove(commandData.roleId);
      case 'roles.addPermission.command':
        return await this.roleService.addPermission(commandData.roleId, commandData.permission);
      case 'roles.removePermission.command':
        return await this.roleService.removePermission(commandData.roleId, commandData.permission);
      default:
        throw new Error(`Comando desconocido: ${eventName}`);
    }
  }
}
