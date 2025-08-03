import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DeleteResourceCommand } from '../commands/delete-resource.command';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Delete Resource Command Handler
 * Implements RF-01 (delete resource)
 * Supports both soft delete (when has relations) and hard delete (when no relations)
 */
@CommandHandler(DeleteResourceCommand)
export class DeleteResourceHandler implements ICommandHandler<DeleteResourceCommand> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: DeleteResourceCommand): Promise<void> {
    this.logger.log('Deleting resource', { 
      resourceId: command.id,
      forceHardDelete: command.forceHardDelete
    }, 'DeleteResourceHandler');

    try {
      // Find existing resource
      const existingResource = await this.resourceRepository.findById(command.id);
      if (!existingResource) {
        throw new NotFoundException(`Resource with ID ${command.id} not found`);
      }

      // Check if resource has active relations
      const hasActiveRelations = await this.resourceRepository.hasActiveRelations(command.id);

      if (hasActiveRelations && !command.forceHardDelete) {
        // Perform soft delete
        const softDeletedResource = existingResource.softDelete();
        await this.resourceRepository.update(command.id, softDeletedResource);

        // Publish domain event
        this.eventBus.publish({
          type: 'ResourceSoftDeleted',
          resourceId: existingResource.id,
          resourceCode: existingResource.code,
          resourceName: existingResource.name,
          timestamp: new Date(),
        });

        this.logger.log('Resource soft deleted successfully', { 
          resourceId: existingResource.id,
          resourceCode: existingResource.code
        }, 'DeleteResourceHandler');

      } else if (!hasActiveRelations || command.forceHardDelete) {
        // Perform hard delete
        if (hasActiveRelations && command.forceHardDelete) {
          this.logger.warn('Force hard deleting resource with active relations', {
            resourceId: command.id
          }, 'DeleteResourceHandler');
        }

        await this.resourceRepository.delete(command.id);

        // Publish domain event
        this.eventBus.publish({
          type: 'ResourceHardDeleted',
          resourceId: existingResource.id,
          resourceCode: existingResource.code,
          resourceName: existingResource.name,
          forceDelete: command.forceHardDelete,
          timestamp: new Date(),
        });

        this.logger.log('Resource hard deleted successfully', { 
          resourceId: existingResource.id,
          resourceCode: existingResource.code,
          forceDelete: command.forceHardDelete
        }, 'DeleteResourceHandler');

      } else {
        throw new BadRequestException(
          'Cannot hard delete resource with active relations. Use soft delete or force hard delete.'
        );
      }

    } catch (error) {
      this.logger.error('Failed to delete resource', error, 'DeleteResourceHandler');
      throw error;
    }
  }
}
