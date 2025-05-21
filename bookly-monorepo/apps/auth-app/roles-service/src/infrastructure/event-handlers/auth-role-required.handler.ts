import { Injectable, Logger } from '@nestjs/common';
import { IEvent, EventHandler, IEventHandler, EventPublisher } from '@bookly-monorepo/event-bus';
import { RolesService } from '../services/roles.service';

interface RoleRequiredEvent {
  roleName: string;
}

/**
 * Manejador de eventos para el evento auth.role.required
 */
@Injectable()
@EventHandler('auth.role.required')
export class AuthRoleRequiredHandler implements IEventHandler<IEvent> {
  private readonly logger = new Logger(AuthRoleRequiredHandler.name);
  
  constructor(
    private readonly roleService: RolesService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async handle(event: IEvent): Promise<void> {
    this.logger.log(`Procesando evento auth.role.required: ${JSON.stringify(event.payload)}`);
    const { roleName } = event.payload as RoleRequiredEvent;
    
    try {
      // Verificar si el rol ya existe
      let role;
      try {
        role = await this.roleService.findByName(roleName);
        
        // Notificar a auth-service que el rol ya existe
        await this.eventPublisher.publish('roles.role.exists.response', {
          roleId: role.id,
          name: role.name,
          timestamp: new Date()
        }, event.correlationId);
      } catch (error) {
        // Si el rol no existe, lo creamos
        if (error.name === 'NotFoundException') {
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
          }, event.correlationId);
        } else {
          throw error; // Re-lanzar si es otro tipo de error
        }
      }
    } catch (error) {
      this.logger.error(`Error procesando evento auth.role.required: ${error.message}`, error.stack);
    }
  }
}
