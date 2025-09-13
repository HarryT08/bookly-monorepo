import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { ResourceEntity } from '../../domain/entities/resource.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResourcesService {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
  ) {}

  async findAll(): Promise<any[]> {
    this.loggingService.log('Finding all resources', 'ResourcesService');
    return [];
  }

  async findById(id: string): Promise<any> {
    this.loggingService.log(`Finding resource by id: ${id}`, 'ResourcesService');
    return null;
  }

  /**
   * Creates a new resource with full business logic validation
   * Implements RF-01 - Follows Clean Architecture patterns
   */
  async createResource(data: {
    name: string;
    type: string;
    capacity: number;
    location: string;
    programId: string;
    description?: string;
    attributes?: any;
    availableSchedules?: any;
    categoryId: string;
  }): Promise<ResourceEntity> {
    this.loggingService.log(
      'Creating resource with business validation',
      {
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        location: data.location
      },
      'ResourcesService'
    );

    try {
      // Business Logic 1: Create resource entity with validation
      const resource = ResourceEntity.create(
        data.name,
        data.type,
        data.capacity,
        data.location,
        data.programId,
        data.description,
        data.attributes,
        data.availableSchedules,
        data.categoryId,
      );

      // Business Logic 2: Validate resource
      const validation = await resource.validate();
      if (!validation.valid) {
        throw new BadRequestException(`Resource validation failed: ${validation.errors.join(', ')}`);
      }

      // Business Logic 3: Check if code is unique
      const existingResource = await this.resourceRepository.findByCode(resource.code);
      if (existingResource) {
        // Regenerate code if collision occurs (very unlikely)
        const newResource = ResourceEntity.create(
          data.name,
          data.type,
          data.capacity,
          data.location,
          data.programId,
          data.description,
          data.attributes,
          data.availableSchedules,
          data.categoryId,
        );
        
        // Business Logic 4: Persist resource
        const savedResource = await this.resourceRepository.create(newResource);
        
        // Business Logic 5: Publish domain event
        const domainEvent: DomainEvent = {
          eventId: uuidv4(),
          eventType: 'resource.created',
          aggregateId: savedResource.id,
          aggregateType: 'Resource',
          eventData: {
            resourceId: savedResource.id,
            resourceCode: savedResource.code,
            resourceName: savedResource.name,
            resourceType: savedResource.type,
            capacity: savedResource.capacity,
            location: savedResource.location
          },
          timestamp: new Date(),
          version: 1
        };

        await this.eventBusService.publishEvent(domainEvent);

        this.loggingService.log(
          'Resource created successfully (after code regeneration)',
          {
            resourceId: savedResource.id,
            resourceCode: savedResource.code
          },
          'ResourcesService'
        );

        return savedResource;
      }

      // Business Logic 4: Save resource
      const savedResource = await this.resourceRepository.create(resource);

      // Business Logic 5: Publish domain event
      const domainEvent: DomainEvent = {
        eventId: uuidv4(),
        eventType: 'resource.created',
        aggregateId: savedResource.id,
        aggregateType: 'Resource',
        eventData: {
          resourceId: savedResource.id,
          resourceCode: savedResource.code,
          resourceName: savedResource.name,
          resourceType: savedResource.type,
          capacity: savedResource.capacity,
          location: savedResource.location
        },
        timestamp: new Date(),
        version: 1
      };

      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log(
        'Resource created successfully',
        {
          resourceId: savedResource.id,
          resourceCode: savedResource.code
        },
        'ResourcesService'
      );

      return savedResource;

    } catch (error) {
      this.loggingService.error(
        'Failed to create resource',
        error,
        'ResourcesService'
      );
      throw error;
    }
  }

  async update(id: string, data: any): Promise<any> {
    this.loggingService.log(`Updating resource: ${id}`, 'ResourcesService');
    
    const updatedResource = {
      id,
      ...data,
      updatedAt: new Date(),
    };

    // Emit domain event for real-time updates
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'resource.updated',
      aggregateId: id,
      aggregateType: 'Resource',
      eventData: {
        resourceId: id,
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        location: data.location,
        isActive: data.isActive,
        updatedBy: data.updatedBy,
        changes: data,
      },
      timestamp: new Date(),
      version: 2,
      userId: data.updatedBy,
    };

    await this.eventBusService.publishEvent(domainEvent);
    
    return updatedResource;
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    this.loggingService.log(`Deleting resource: ${id}`, 'ResourcesService');
    
    // Emit domain event for real-time updates
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'resource.deleted',
      aggregateId: id,
      aggregateType: 'Resource',
      eventData: {
        resourceId: id,
        deletedBy: deletedBy || 'system',
        deletedAt: new Date().toISOString(),
      },
      timestamp: new Date(),
      version: 3,
      userId: deletedBy,
    };

    await this.eventBusService.publishEvent(domainEvent);
  }

  async setMaintenanceStatus(id: string, inMaintenance: boolean, userId?: string): Promise<void> {
    this.loggingService.log(`Setting maintenance status for resource: ${id} to ${inMaintenance}`, 'ResourcesService');
    
    // Emit domain event for real-time updates
    const domainEvent: DomainEvent = {
      eventId: uuidv4(),
      eventType: 'resource.maintenance',
      aggregateId: id,
      aggregateType: 'Resource',
      eventData: {
        resourceId: id,
        inMaintenance,
        maintenanceStarted: inMaintenance ? new Date().toISOString() : null,
        maintenanceEnded: !inMaintenance ? new Date().toISOString() : null,
        updatedBy: userId || 'system',
      },
      timestamp: new Date(),
      version: 4,
      userId,
    };

    await this.eventBusService.publishEvent(domainEvent);
  }
}
