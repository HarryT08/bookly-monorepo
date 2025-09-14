import { Injectable, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { EventBusService, DomainEvent } from '@libs/event-bus/services/event-bus.service';
import { ResourceRepository } from '@apps/resources-service/domain/repositories/resource.repository';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { 
  StandardizedDomainEvent, 
  createStandardizedEvent, 
  EventAction, 
  RESOURCE_EVENTS 
} from '@libs/event-bus/interfaces/standardized-domain-event.interface';
import { CreateResourceDto, AvailableScheduleDto } from '@libs/dto/resources/create-resource.dto';
import { UpdateResourceDto } from '@libs/dto/resources/update-resource.dto';
import { DeleteResourceDto } from '@libs/dto/resources/delete-resource.dto';
import { SetMaintenanceStatusDto } from '@libs/dto/resources/set-maintenance-status.dto';
import { AvailableSchedule } from '@apps/resources-service/domain/entities/resource.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResourcesService {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly loggingService: LoggingService,
    private readonly eventBusService: EventBusService,
  ) {}

  /**
   * Maps DTO to domain entity AvailableSchedule format
   * Private helper method for type conversion
   */
  private mapDtoToAvailableSchedule(dto: AvailableScheduleDto): AvailableSchedule {
    return {
      weeklySchedule: {
        MONDAY: { enabled: false, startTime: '08:00', endTime: '17:00' },
        TUESDAY: { enabled: false, startTime: '08:00', endTime: '17:00' },
        WEDNESDAY: { enabled: false, startTime: '08:00', endTime: '17:00' },
        THURSDAY: { enabled: false, startTime: '08:00', endTime: '17:00' },
        FRIDAY: { enabled: false, startTime: '08:00', endTime: '17:00' },
        SATURDAY: { enabled: false, startTime: '08:00', endTime: '17:00' },
        SUNDAY: { enabled: false, startTime: '08:00', endTime: '17:00' },
      },
      exceptions: [],
      maintenanceSchedules: [],
      restrictions: {
        maxReservationDays: dto.restrictions?.maxAdvanceReservation || 30,
        minReservationHours: dto.restrictions?.minAdvanceReservation || 2,
        minReservationDuration: dto.restrictions?.minReservationDuration || 30,
        maxReservationDuration: dto.restrictions?.maxReservationDuration || 480,
        minAdvanceReservation: dto.restrictions?.minAdvanceReservation || 2,
        maxAdvanceReservation: dto.restrictions?.maxAdvanceReservation || 30,
        userTypePriority: dto.priorities?.reduce((acc, p) => ({ ...acc, [p.userType]: p.priority }), {}) || {},
        userTypes: dto.restrictions?.userTypes || ['STUDENT', 'TEACHER', 'ADMIN'],
        advanceBookingDays: dto.restrictions?.maxAdvanceReservation || 30,
      },
      operatingHours: {
        MONDAY: { start: '08:00', end: '17:00' },
        TUESDAY: { start: '08:00', end: '17:00' },
        WEDNESDAY: { start: '08:00', end: '17:00' },
        THURSDAY: { start: '08:00', end: '17:00' },
        FRIDAY: { start: '08:00', end: '17:00' },
        SATURDAY: { start: '08:00', end: '12:00' },
        SUNDAY: { start: '08:00', end: '12:00' },
      },
    };
  }

  async findAll(): Promise<ResourceEntity[]> {
    this.loggingService.log('Finding all resources', 'ResourcesService');
    
    try {
      const resources = await this.resourceRepository.findAll();
      
      this.loggingService.log(
        `Found ${resources.length} resources`,
        { count: resources.length },
        'ResourcesService'
      );
      
      return resources;
    } catch (error) {
      this.loggingService.error('Failed to find all resources', error, 'ResourcesService');
      throw error;
    }
  }

  async findById(id: string): Promise<ResourceEntity | null> {
    this.loggingService.log(`Finding resource by id: ${id}`, 'ResourcesService');
    
    try {
      const resource = await this.resourceRepository.findById(id);
      
      if (resource) {
        this.loggingService.log(
          'Resource found',
          { resourceId: id, resourceName: resource.name },
          'ResourcesService'
        );
      } else {
        this.loggingService.log(
          'Resource not found',
          { resourceId: id },
          'ResourcesService'
        );
      }
      
      return resource;
    } catch (error) {
      this.loggingService.error(`Failed to find resource by id: ${id}`, error, 'ResourcesService');
      throw error;
    }
  }

  async findByCode(code: string): Promise<ResourceEntity | null> {
    this.loggingService.log(`Finding resource by code: ${code}`, 'ResourcesService');
    
    try {
      const resource = await this.resourceRepository.findByCode(code);
      
      if (resource) {
        this.loggingService.log(
          'Resource found by code',
          { resourceCode: code, resourceId: resource.id },
          'ResourcesService'
        );
      }
      
      return resource;
    } catch (error) {
      this.loggingService.error(`Failed to find resource by code: ${code}`, error, 'ResourcesService');
      throw error;
    }
  }

  async findWithPagination(page: number, limit: number, filters?: any): Promise<{ resources: ResourceEntity[], total: number }> {
    this.loggingService.log(
      'Finding resources with pagination',
      { page, limit, filters },
      'ResourcesService'
    );
    
    try {
      const result = await this.resourceRepository.findWithPagination(page, limit, filters);
      
      this.loggingService.log(
        'Resources found with pagination',
        { 
          page, 
          limit, 
          count: result.resources.length, 
          total: result.total 
        },
        'ResourcesService'
      );
      
      return result;
    } catch (error) {
      this.loggingService.error('Failed to find resources with pagination', error, 'ResourcesService');
      throw error;
    }
  }

  /**
   * Creates a new resource with full business logic validation
   * Implements RF-01 - Follows Clean Architecture patterns
   */
  async createResource(data: CreateResourceDto): Promise<ResourceEntity> {
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
      // Map DTO to domain entity format
      const availableSchedules = data.availableSchedules ? this.mapDtoToAvailableSchedule(data.availableSchedules) : undefined;
      
      // Business Logic 1: Create resource entity with validation
      const resource = ResourceEntity.create(
        data.name,
        data.type,
        data.capacity || null,
        data.location || null,
        data.programId,
        data.description,
        data.attributes,
        availableSchedules,
        data.categoryId || '',
      );

      // Business Logic 2: Validate resource
      const validation = await resource.validate();
      if (!validation.valid) {
        throw new BadRequestException(`Resource validation failed: ${validation.errors.join(', ')}`);
      }

      // Business Logic 3: Check if code is unique
      const existingResource = await this.resourceRepository.findByCode(resource.code);
      if (existingResource) {
        // Map DTO to domain entity format
        const availableSchedules = data.availableSchedules ? this.mapDtoToAvailableSchedule(data.availableSchedules) : undefined;
        
        // Generate code if collision occurs (very unlikely)
        const newResource = ResourceEntity.create(
          data.name,
          data.type,
          data.capacity || null,
          data.location || null,
          data.programId,
          data.description,
          data.attributes,
          availableSchedules,
          data.categoryId || '',
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

      // Business Logic 5: Publish standardized domain event
      const domainEvent = createStandardizedEvent(
        RESOURCE_EVENTS.CREATED,
        savedResource.id,
        'Resource',
        EventAction.CREATED,
        {
          resourceId: savedResource.id,
          resourceCode: savedResource.code,
          resourceName: savedResource.name,
          resourceType: savedResource.type,
          capacity: savedResource.capacity,
          location: savedResource.location,
          programId: savedResource.programId,
          categoryId: savedResource.categoryId
        },
        {
          service: 'resources-service',
          correlationId: uuidv4()
        }
      );

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

  /**
   * Updates an existing resource with full business logic validation
   * Implements RF-02 - Follows Clean Architecture patterns
   */
  async updateResource(id: string, data: UpdateResourceDto): Promise<ResourceEntity> {
    this.loggingService.log(
      'Updating resource with business validation',
      { resourceId: id, updatedBy: data.updatedBy },
      'ResourcesService'
    );

    try {
      // Business Logic 1: Verify resource exists
      const existingResource = await this.resourceRepository.findById(id);
      if (!existingResource) {
        throw new BadRequestException(`Resource with id ${id} not found`);
      }

      // Business Logic 2: Map DTO to domain entity format if provided
      const mappedAvailableSchedules = data.availableSchedules 
        ? this.mapDtoToAvailableSchedule(data.availableSchedules) 
        : undefined;

      // Business Logic 3: Update resource entity using domain method
      const updatedResource = existingResource.update(
        data.name,
        data.type,
        data.capacity,
        data.location,
        data.description,
        data.attributes,
        mappedAvailableSchedules,
        data.categoryId
      );

      // Business Logic 3: Handle status change separately if provided
      let finalResource = updatedResource;
      if (data.isActive !== undefined && data.isActive !== existingResource.isActive) {
        finalResource = data.isActive ? updatedResource : updatedResource.softDelete();
      }

      // Business Logic 4: Validate updated resource
      const validationResult = await finalResource.validate();
      if (!validationResult.valid) {
        throw new BadRequestException(`Resource validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Business Logic 5: Persist changes
      const savedResource = await this.resourceRepository.update(id, finalResource);

      // Business Logic 5: Publish domain event
      const domainEvent: DomainEvent = {
        eventId: uuidv4(),
        eventType: 'resource.updated',
        aggregateId: id,
        aggregateType: 'Resource',
        eventData: {
          resourceId: id,
          resourceCode: updatedResource.code,
          resourceName: updatedResource.name,
          resourceType: updatedResource.type,
          changes: data,
          updatedBy: data.updatedBy,
          previousValues: {
            name: existingResource.name,
            type: existingResource.type,
            capacity: existingResource.capacity,
            location: existingResource.location
          }
        },
        timestamp: new Date(),
        version: 1,
        userId: data.updatedBy
      };

      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log(
        'Resource updated successfully',
        { resourceId: id, updatedBy: data.updatedBy },
        'ResourcesService'
      );

      return updatedResource;

    } catch (error) {
      this.loggingService.error(`Failed to update resource: ${id}`, error, 'ResourcesService');
      throw error;
    }
  }

  /**
   * Deletes a resource (soft delete for safety)
   * Implements RF-01 - Follows Clean Architecture patterns
   */
  async deleteResource(id: string, data: DeleteResourceDto): Promise<void> {
    this.loggingService.log(
      'Deleting resource with business validation',
      { resourceId: id, deletedBy: data.deletedBy, force: data.force },
      'ResourcesService'
    );

    try {
      // Business Logic 1: Verify resource exists
      const existingResource = await this.resourceRepository.findById(id);
      if (!existingResource) {
        throw new BadRequestException(`Resource with id ${id} not found`);
      }

      // Business Logic 2: Check if resource has active reservations (if implementing soft delete)
      if (!data.force) {
        // In a real implementation, check for active reservations
        const activeReservations = await this.checkActiveReservations(id);
        if (activeReservations.length > 0) {  
          throw new ConflictException('Cannot delete resource with active reservations');
        }
      }

      // Business Logic 3: Perform deletion (soft delete by default)
      if (data.force) {
        // Hard delete - removes from database
        await this.resourceRepository.delete(id);
      } else {
        // Soft delete - marks as inactive
        const deletedResource = existingResource.softDelete();
        await this.resourceRepository.update(id, deletedResource);
      }

      // Business Logic 4: Publish standardized domain event
      const domainEvent = createStandardizedEvent(
        'resource.queried',
        id,
        'Resource',
        EventAction.UPDATED,
        {
          resourceId: id,
          found: !!existingResource,
          resourceCode: existingResource?.code,
          resourceName: existingResource?.name
        },
        {
          service: 'resources-service',
          correlationId: uuidv4()
        }
      );

      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log(
        'Resource deleted successfully',
        { resourceId: id, deletedBy: data.deletedBy, deletionType: data.force ? 'HARD' : 'SOFT' },
        'ResourcesService'
      );

    } catch (error) {
      this.loggingService.error(`Failed to delete resource: ${id}`, error, 'ResourcesService');
      throw error;
    }
  }

  /**
   * Sets maintenance status for a resource
   * Implements RF-06 - Maintenance of resources
   */
  async setMaintenanceStatus(id: string, data: SetMaintenanceStatusDto): Promise<ResourceEntity> {
    this.loggingService.log(
      'Setting maintenance status for resource',
      { resourceId: id, inMaintenance: data.inMaintenance, userId: data.userId },
      'ResourcesService'
    );

    try {
      // Business Logic 1: Verify resource exists
      const existingResource = await this.resourceRepository.findById(id);
      if (!existingResource) {
        throw new BadRequestException(`Resource with id ${id} not found`);
      }

      // Business Logic 2: Update resource status
      const newStatus = data.inMaintenance ? 'MAINTENANCE' : 'AVAILABLE';
      const updatedResource = existingResource.changeStatus(newStatus);

      // Business Logic 3: Persist changes
      const savedResource = await this.resourceRepository.update(id, updatedResource);

      // Business Logic 4: Publish standardized domain event
      const domainEvent = createStandardizedEvent(
        data.inMaintenance ? 'resource.maintenance_started' : 'resource.maintenance_ended',
        id,
        'Resource',
        EventAction.STATUS_CHANGED,
        {
          resourceId: id,
          resourceCode: savedResource.code,
          resourceName: savedResource.name,
          inMaintenance: data.inMaintenance,
          maintenanceStarted: data.inMaintenance ? new Date().toISOString() : null,
          maintenanceEnded: !data.inMaintenance ? new Date().toISOString() : null,
          updatedBy: data.userId
        },
        {
          userId: data.userId,
          service: 'resources-service',
          correlationId: uuidv4(),
          previousState: existingResource,
          changes: {
            status: { from: existingResource.status, to: savedResource.status }
          }
        }
      );

      await this.eventBusService.publishEvent(domainEvent);

      this.loggingService.log(
        'Resource maintenance status updated successfully',
        { resourceId: id, newStatus, userId: data.userId },
        'ResourcesService'
      );

      return savedResource;

    } catch (error) {
      this.loggingService.error(`Failed to set maintenance status for resource: ${id}`, error, 'ResourcesService');
      throw error;
    }
  }
}
