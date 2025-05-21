import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventSubscriber, EventPublisher } from '@bookly-monorepo/event-bus';
import { RolesService } from '../services/roles.service';

interface RoleRequiredEvent {
  roleName: string;
}

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
 * Listener para eventos relacionados con autenticaciu00f3n provenientes de auth-service
 */
@Injectable()
export class AuthEventsListener implements OnModuleInit {
  private readonly logger = new Logger(AuthEventsListener.name);

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    private readonly eventPublisher: EventPublisher,
    private readonly roleService: RolesService
  ) {}

  onModuleInit() {
    // Suscribirse a eventos relacionados con autenticaciu00f3n
    this.subscribeToAuthEvents();
  }

  private subscribeToAuthEvents() {
    // Escuchar eventos relacionados con roles desde auth-service
    this.eventSubscriber.subscribe('auth.role.*', async (event: RoleRequiredEvent, eventName: string) => {
      this.logger.log(`Recibido evento ${eventName}: ${JSON.stringify(event)}`);
      
      // Manejar eventos especu00edficos segu00fan sea necesario
      if (eventName === 'auth.role.required') {
        try {
          const { roleName } = event;
          // Verificar si el rol ya existe
          const existingRole = await this.roleService.findByName(roleName);
          
          if (!existingRole) {
            // Crear el rol si no existe
            const newRole = await this.roleService.create({
              name: roleName,
              description: `Rol creado automu00e1ticamente por solicitud de auth-service`,
              permissions: []
            });
            
            // Notificar a auth-service que el rol fue creado
            await this.eventPublisher.publish('roles.role.created.response', {
              roleId: newRole.id,
              name: newRole.name,
              timestamp: new Date()
            });
          } else {
            // Notificar a auth-service que el rol ya existe
            await this.eventPublisher.publish('roles.role.exists.response', {
              roleId: existingRole.id,
              name: existingRole.name,
              timestamp: new Date()
            });
          }
        } catch (error) {
          this.logger.error(`Error procesando evento ${eventName}: ${error.message}`);
        }
      }
    });
    
    // Escuchar evento de comandos de roles-service
    this.eventSubscriber.subscribe('roles.*', async (payload: CommandPayload, eventName: string) => {
      if (!eventName.includes('response') && eventName.includes('.command.')) {
        this.logger.log(`Recibido comando: ${eventName}`);
        const { responseEvent, ...commandData } = payload;
        
        await this.handleRoleCommand(eventName, commandData, responseEvent);
      }
    });
  }
  
  /**
   * Maneja comandos de roles para reducir la complejidad de la función principal
   */
  private async handleRoleCommand(eventName: string, commandData: CommandPayload, responseEvent?: string): Promise<void> {
    try {
      // Determinar qué comando es y ejecutarlo
      const result = await this.executeRoleCommand(eventName, commandData);
      
      // Publicar respuesta
      if (responseEvent) {
        await this.eventPublisher.publish(responseEvent, {
          data: result,
          error: null,
        } as CommandResult);
      }
    } catch (error) {
      this.logger.error(`Error procesando comando ${eventName}: ${error.message}`);
      
      // Publicar error
      if (responseEvent) {
        await this.eventPublisher.publish(responseEvent, {
          data: null,
          error: error.message,
        } as CommandResult);
      }
    }
  }
  
  /**
   * Ejecuta un comando específico de roles
   */
  private async executeRoleCommand(eventName: string, commandData: CommandPayload): Promise<unknown> {
    switch (eventName) {
      case 'roles.findById.command':
        return await this.roleService.findById(commandData.roleId);
      case 'roles.findByName.command':
        return await this.roleService.findByName(commandData.name);
      case 'roles.findAll.command':
        return await this.roleService.findAll();
      case 'roles.create.command':
        return await this.roleService.create(commandData.roleData);
      case 'roles.update.command':
        return await this.roleService.update(commandData.roleId, commandData.roleData);
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
