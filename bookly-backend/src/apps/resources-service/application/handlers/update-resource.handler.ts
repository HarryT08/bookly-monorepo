import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateResourceCommand } from '@apps/resources-service/application/commands/update-resource.command';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * Update Resource Command Handler
 * Implements RF-01 (edit resource)
 */
@Injectable()
@CommandHandler(UpdateResourceCommand)
export class UpdateResourceHandler implements ICommandHandler<UpdateResourceCommand> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: UpdateResourceCommand): Promise<ResourceEntity> {
    try {
      this.logger.log(
        'Executing update resource command',
        `UpdateResourceHandler - id: ${command.data.id}`,
        'UpdateResourceHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const resource = await this.resourcesService.updateResource(command.data.id, command.data);
      
      return resource;
    } catch (error) {
      this.logger.error(
        `Failed to update resource: ${error.message}`,
        error.stack,
        'UpdateResourceHandler'
      );
      throw error;
    }
  }
}
