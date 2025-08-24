import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateResourceCommand } from '../commands/update-resource.command';
import { ResourceEntity } from '../../domain/entities/resource.entity';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Update Resource Command Handler
 * Implements RF-01 (edit resource)
 */
@CommandHandler(UpdateResourceCommand)
export class UpdateResourceHandler implements ICommandHandler<UpdateResourceCommand> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: UpdateResourceCommand): Promise<ResourceEntity> {
    this.logger.log('Updating resource', { 
      resourceId: command.id
    }, 'UpdateResourceHandler');

    try {
      // Find existing resource
      const existingResource = await this.resourceRepository.findById(command.id);
      if (!existingResource) {
        throw new NotFoundException(`Resource with ID ${command.id} not found`);
      }

      // Update resource entity
      let updatedResource = existingResource.update(
        command.name,
        command.type,
        command.capacity,
        command.location,
        command.description,
        command.attributes,
        command.availableSchedules,
        command.categoryId,
      );

      // Update status if provided
      if (command.status && command.status !== existingResource.status) {
        updatedResource = updatedResource.changeStatus(command.status);
      }

      // Validate updated resource
      const validation = await updatedResource.validate();
      if (!validation.valid) {
        throw new BadRequestException(`Resource validation failed: ${validation.errors.join(', ')}`);
      }

      // Save updated resource
      const savedResource = await this.resourceRepository.update(command.id, updatedResource);

      // Publish domain event
      this.eventBus.publish({
        type: 'ResourceUpdated',
        resourceId: savedResource.id,
        resourceCode: savedResource.code,
        resourceName: savedResource.name,
        changes: {
          name: command.name !== undefined ? { from: existingResource.name, to: command.name } : undefined,
          type: command.type !== undefined ? { from: existingResource.type, to: command.type } : undefined,
          status: command.status !== undefined ? { from: existingResource.status, to: command.status } : undefined,
          capacity: command.capacity !== undefined ? { from: existingResource.capacity, to: command.capacity } : undefined,
          location: command.location !== undefined ? { from: existingResource.location, to: command.location } : undefined,
        },
        timestamp: new Date(),
      });

      this.logger.log('Resource updated successfully', { 
        resourceId: savedResource.id,
        resourceCode: savedResource.code
      }, 'UpdateResourceHandler');

      return savedResource;

    } catch (error) {
      this.logger.error('Failed to update resource', error, 'UpdateResourceHandler');
      throw error;
    }
  }
}
