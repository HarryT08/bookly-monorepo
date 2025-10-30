import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeleteResourceCommand } from '@apps/resources-service/application/commands/delete-resource.command';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * Delete Resource Command Handler
 * Implements RF-01 (delete resource)
 * Supports both soft delete (when has relations) and hard delete (when no relations)
 */
@Injectable()
@CommandHandler(DeleteResourceCommand)
export class DeleteResourceHandler implements ICommandHandler<DeleteResourceCommand> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: DeleteResourceCommand): Promise<void> {
    try {
      this.logger.log(
        'Executing delete resource command',
        `DeleteResourceHandler - id: ${command.data.id}`,
        'DeleteResourceHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      await this.resourcesService.deleteResource(command.data);
      
    } catch (error) {
      this.logger.error(
        `Failed to delete resource: ${error.message}`,
        error.stack,
        'DeleteResourceHandler'
      );
      throw error;
    }
  }
}
