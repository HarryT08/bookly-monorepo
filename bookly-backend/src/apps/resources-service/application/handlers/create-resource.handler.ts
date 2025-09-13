import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateResourceCommand } from '../commands/create-resource.command';
import { ResourceEntity } from '../../domain/entities/resource.entity';
import { LoggingService } from '../../../../libs/logging/logging.service';
import { ResourcesService } from '../services/resources.service';

/**
 * Create Resource Command Handler
 * Implements RF-01 (create resource)
 */
@Injectable()
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: CreateResourceCommand): Promise<ResourceEntity> {
    this.logger.log(
      'Orchestrating resource creation',
      {
        name: command.name,
        type: command.type,
        capacity: command.capacity,
        location: command.location
      },
      'CreateResourceHandler'
    );

    // Delegate to service (Clean Architecture pattern)
    return await this.resourcesService.createResource({
      name: command.name,
      type: command.type,
      capacity: command.capacity,
      location: command.location,
      programId: command.programId,
      description: command.description,
      attributes: command.attributes,
      availableSchedules: command.availableSchedules,
      categoryId: command.categoryId
    });
  }
}
