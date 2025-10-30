import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateResourceCommand } from '@apps/resources-service/application/commands/create-resource.command';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';

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
    try {
      this.logger.log(
        'Executing create resource command',
        `CreateResourceHandler - name: ${command.data.name}`,
        'CreateResourceHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const resource = await this.resourcesService.createResource(command.data, command.createdBy);
      
      return resource;
    } catch (error) {
      this.logger.error(
        `Failed to create resource: ${error.message}`,
        error.stack,
        'CreateResourceHandler'
      );
      throw error;
    }
  }
}
