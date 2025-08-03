import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateResourceCommand } from '../commands/create-resource.command';
import { ResourceEntity } from '../../domain/entities/resource.entity';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Create Resource Command Handler
 * Implements RF-01 (create resource)
 */
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly eventBus: EventBus,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: CreateResourceCommand): Promise<ResourceEntity> {
    this.logger.log('Creating new resource', { 
      name: command.name, 
      type: command.type
    }, 'CreateResourceHandler');

    try {
      // Create resource entity
      const resource = ResourceEntity.create(
        command.name,
        command.type,
        command.capacity,
        command.location,
        command.description,
        command.attributes,
        command.availableSchedules,
        command.categoryId,
      );

      // Validate resource
      const validation = resource.validate();
      if (!validation.valid) {
        throw new BadRequestException(`Resource validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if code is unique (should be unique by generation, but double-check)
      const existingResource = await this.resourceRepository.findByCode(resource.code);
      if (existingResource) {
        // Regenerate code if collision occurs (very unlikely)
        const newResource = ResourceEntity.create(
          command.name,
          command.type,
          command.capacity,
          command.location,
          command.description,
          command.attributes,
          command.availableSchedules,
          command.categoryId,
        );
        
        const savedResource = await this.resourceRepository.create(newResource);
        
        // Publish domain event
        this.eventBus.publish({
          type: 'ResourceCreated',
          resourceId: savedResource.id,
          resourceCode: savedResource.code,
          resourceName: savedResource.name,
          resourceType: savedResource.type,
          timestamp: new Date(),
        });

        this.logger.log('Resource created successfully', { 
          resourceId: savedResource.id,
          resourceCode: savedResource.code
        }, 'CreateResourceHandler');

        return savedResource;
      }

      // Save resource
      const savedResource = await this.resourceRepository.create(resource);

      // Publish domain event
      this.eventBus.publish({
        type: 'ResourceCreated',
        resourceId: savedResource.id,
        resourceCode: savedResource.code,
        resourceName: savedResource.name,
        resourceType: savedResource.type,
        timestamp: new Date(),
      });

      this.logger.log('Resource created successfully', { 
        resourceId: savedResource.id,
        resourceCode: savedResource.code
      }, 'CreateResourceHandler');

      return savedResource;

    } catch (error) {
      this.logger.error('Failed to create resource', error, 'CreateResourceHandler');
      throw error;
    }
  }
}
