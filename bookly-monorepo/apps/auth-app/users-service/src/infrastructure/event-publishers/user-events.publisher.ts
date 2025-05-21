import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher } from '@bookly-monorepo/event-bus';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../../domain/events/user-events';
import { User } from '../../domain/entities/user.entity';

/**
 * Publicador de eventos relacionados con usuarios
 */
@Injectable()
export class UserEventsPublisher {
  private readonly logger = new Logger(UserEventsPublisher.name);

  constructor(private readonly eventPublisher: EventPublisher) {}

  /**
   * Publica un evento de usuario creado
   */
  async publishUserCreated(user: User): Promise<void> {
    this.logger.log(`Publicando evento user.created para el usuario ${user.id}`);
    
    const event: UserCreatedEvent = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish('user.created', event);
  }

  /**
   * Publica un evento de usuario actualizado
   */
  async publishUserUpdated(user: User, updatedFields: any): Promise<void> {
    this.logger.log(`Publicando evento user.updated para el usuario ${user.id}`);
    
    const event: UserUpdatedEvent = {
      userId: user.id,
      timestamp: new Date(),
      ...updatedFields
    };
    
    await this.eventPublisher.publish('user.updated', event);
  }

  /**
   * Publica un evento de usuario eliminado
   */
  async publishUserDeleted(userId: string): Promise<void> {
    this.logger.log(`Publicando evento user.deleted para el usuario ${userId}`);
    
    const event: UserDeletedEvent = {
      userId,
      timestamp: new Date()
    };
    
    await this.eventPublisher.publish('user.deleted', event);
  }
}
