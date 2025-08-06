import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ResourceResponsibleRepository } from '../../domain/repositories/resource-responsible.repository';
import { ResourceResponsibleEntity } from '../../domain/entities/resource-responsible.entity';
import { 
  ResourceResponsibleResponseDto 
} from '../dtos/resource-responsible.dto';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * HITO 6 - RF-06: ResourceResponsible Application Service
 * Handles business logic for resource responsibility assignments
 */
@Injectable()
export class ResourceResponsibleService {
  constructor(
    @Inject('ResourceResponsibleRepository')
    private readonly resourceResponsibleRepository: ResourceResponsibleRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assigns a user as responsible for a resource
   */
  async assignResponsible(
    resourceId: string,
    userId: string,
    assignedBy: string
  ): Promise<ResourceResponsibleResponseDto> {
    this.loggingService.log('Assigning user as responsible for resource', { 
      resourceId,
      userId,
      assignedBy 
    });

    // Check if user is already responsible for this resource
    const existingAssignment = await this.resourceResponsibleRepository.findByResourceAndUser(
      resourceId,
      userId
    );

    if (existingAssignment && existingAssignment.isActive) {
      throw new ConflictException(
        `User '${userId}' is already responsible for resource '${resourceId}'`
      );
    }

    const responsibleEntity = ResourceResponsibleEntity.create(resourceId, userId, assignedBy);
    const createdAssignment = await this.resourceResponsibleRepository.create(responsibleEntity);

    this.loggingService.log('User assigned as responsible successfully', {
      resourceId,
      userId,
      assignmentId: createdAssignment.id
    });

    return this.toResponseDto(createdAssignment);
  }

  /**
   * Assigns multiple users as responsible for a resource
   */
  async assignMultipleResponsibles(
    resourceId: string,
    userIds: string[],
    assignedBy: string
  ): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Assigning multiple users as responsible for resource', { 
      resourceId,
      userCount: userIds.length,
      assignedBy 
    });

    if (userIds.length === 0) {
      throw new ConflictException('At least one user must be provided');
    }

    // Remove duplicates
    const uniqueUserIds = [...new Set(userIds)];

    const assignments = await this.resourceResponsibleRepository.assignResponsibleToResource(
      resourceId,
      uniqueUserIds,
      assignedBy
    );

    this.loggingService.log('Multiple users assigned as responsible successfully', {
      resourceId,
      assignedCount: assignments.length
    });

    return assignments.map(this.toResponseDto);
  }

  /**
   * Replaces all responsible users for a resource
   */
  async replaceResourceResponsibles(
    resourceId: string,
    userIds: string[],
    assignedBy: string
  ): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Replacing resource responsible users', { 
      resourceId,
      newUserCount: userIds.length,
      assignedBy 
    });

    if (userIds.length === 0) {
      throw new ConflictException('At least one user must be provided');
    }

    // Remove duplicates
    const uniqueUserIds = [...new Set(userIds)];

    const assignments = await this.resourceResponsibleRepository.replaceResourceResponsibles(
      resourceId,
      uniqueUserIds,
      assignedBy
    );

    this.loggingService.log('Resource responsible users replaced successfully', {
      resourceId,
      newAssignmentCount: assignments.length
    });

    return assignments.map(this.toResponseDto);
  }

  /**
   * Deactivates a user's responsibility for a resource
   */
  async deactivateResponsible(
    resourceId: string,
    userId: string
  ): Promise<void> {
    this.loggingService.log('Deactivating user responsibility for resource', { 
      resourceId,
      userId 
    });

    // Check if assignment exists and is active
    const existingAssignment = await this.resourceResponsibleRepository.findByResourceAndUser(
      resourceId,
      userId
    );

    if (!existingAssignment) {
      throw new NotFoundException(
        `User '${userId}' is not assigned as responsible for resource '${resourceId}'`
      );
    }

    if (!existingAssignment.isActive) {
      throw new ConflictException(
        `User '${userId}' is already inactive for resource '${resourceId}'`
      );
    }

    await this.resourceResponsibleRepository.deactivate(existingAssignment.id);

    this.loggingService.log('User responsibility deactivated successfully', {
      resourceId,
      userId
    });
  }

  /**
   * Gets all users responsible for a resource
   */
  async getResourceResponsibles(
    resourceId: string,
    activeOnly: boolean = true
  ): Promise<ResourceResponsibleResponseDto[]> {
    const assignments = activeOnly
      ? await this.resourceResponsibleRepository.findActiveByResourceId(resourceId)
      : await this.resourceResponsibleRepository.findByResourceId(resourceId);

    return assignments.map(this.toResponseDto);
  }

  /**
   * Gets all resources a user is responsible for
   */
  async getUserResponsibilities(
    userId: string,
    activeOnly: boolean = true
  ): Promise<ResourceResponsibleResponseDto[]> {
    const assignments = activeOnly
      ? await this.resourceResponsibleRepository.findActiveByUserId(userId)
      : await this.resourceResponsibleRepository.findByUserId(userId);

    return assignments.map(this.toResponseDto);
  }

  /**
   * Gets resources managed by a user with pagination
   */
  async getResourcesByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ 
    assignments: ResourceResponsibleResponseDto[]; 
    total: number; 
    page: number; 
    limit: number; 
  }> {
    const { assignments, total } = await this.resourceResponsibleRepository.findResourcesByUser(
      userId,
      page,
      limit
    );

    return {
      assignments: assignments.map(this.toResponseDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Checks if a user is responsible for a specific resource
   */
  async isUserResponsibleForResource(
    resourceId: string,
    userId: string
  ): Promise<boolean> {
    return await this.resourceResponsibleRepository.isUserResponsible(resourceId, userId);
  }

  /**
   * Deactivates all responsibilities for a resource
   */
  async deactivateAllResourceResponsibles(resourceId: string): Promise<void> {
    this.loggingService.log('Deactivating all responsibilities for resource', { resourceId });

    await this.resourceResponsibleRepository.deactivateAllByResource(resourceId);

    this.loggingService.log('All responsibilities deactivated for resource', {
      resourceId
    });
  }

  /**
   * Deactivates all responsibilities for a user
   */
  async deactivateAllUserResponsibilities(userId: string): Promise<void> {
    this.loggingService.log('Deactivating all responsibilities for user', { userId });

    await this.resourceResponsibleRepository.deactivateAllByUser(userId);

    this.loggingService.log('All responsibilities deactivated for user', {
      userId
    });
  }

  /**
   * Gets responsibility assignments with pagination and filters
   */
  async getResponsibilities(
    page: number = 1,
    limit: number = 10,
    filters?: {
      resourceId?: string;
      userId?: string;
      isActive?: boolean;
    }
  ): Promise<{ 
    responsibles: ResourceResponsibleResponseDto[]; 
    total: number; 
    page: number; 
    limit: number; 
  }> {
    const { responsibles, total } = await this.resourceResponsibleRepository.findWithPagination(
      page,
      limit,
      filters
    );

    return {
      responsibles: responsibles.map(this.toResponseDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Validates responsibility assignment
   */
  async validateResponsibilityAssignment(
    resourceId: string,
    userIds: string[]
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!resourceId || resourceId.trim() === '') {
      errors.push('Resource ID is required');
    }

    if (!userIds || userIds.length === 0) {
      errors.push('At least one user ID is required');
    }

    // Check for duplicate user IDs
    const uniqueIds = new Set(userIds);
    if (uniqueIds.size !== userIds.length) {
      errors.push('Duplicate user IDs are not allowed');
    }

    // Check for empty user IDs
    const emptyIds = userIds.filter(id => !id || id.trim() === '');
    if (emptyIds.length > 0) {
      errors.push('User IDs cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Bulk operations for multiple resources
   */
  async bulkAssignResponsibleToResources(
    resourceIds: string[],
    userId: string,
    assignedBy: string
  ): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Bulk assigning user as responsible for resources', { 
      resourceCount: resourceIds.length,
      userId,
      assignedBy 
    });

    const assignments: ResourceResponsibleResponseDto[] = [];

    for (const resourceId of resourceIds) {
      try {
        // Skip if already assigned and active
        const isAlreadyResponsible = await this.isUserResponsibleForResource(resourceId, userId);
        if (!isAlreadyResponsible) {
          const assignment = await this.assignResponsible(resourceId, userId, assignedBy);
          assignments.push(assignment);
        }
      } catch (error) {
        this.loggingService.warn('Failed to assign user as responsible for resource', {
          resourceId,
          userId,
          error: error.message
        });
      }
    }

    this.loggingService.log('Bulk responsibility assignment completed', {
      successfulAssignments: assignments.length,
      totalResources: resourceIds.length
    });

    return assignments;
  }

  /**
   * Transfer responsibilities from one user to another
   */
  async transferResponsibilities(
    fromUserId: string,
    toUserId: string,
    assignedBy: string,
    resourceIds?: string[]
  ): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Transferring responsibilities between users', { 
      fromUserId,
      toUserId,
      assignedBy,
      specificResources: resourceIds?.length || 'all'
    });

    // Get current responsibilities
    const currentResponsibilities = await this.resourceResponsibleRepository.findActiveByUserId(fromUserId);
    
    // Filter by specific resources if provided
    const responsibilitiesToTransfer = resourceIds
      ? currentResponsibilities.filter(r => resourceIds.includes(r.resourceId!))
      : currentResponsibilities;

    const newAssignments: ResourceResponsibleResponseDto[] = [];

    for (const responsibility of responsibilitiesToTransfer) {
      try {
        // Deactivate old assignment
        await this.resourceResponsibleRepository.deactivate(responsibility.id);
        
        // Create new assignment
        const newAssignment = await this.assignResponsible(
          responsibility.resourceId!,
          toUserId,
          assignedBy
        );
        
        newAssignments.push(newAssignment);
      } catch (error) {
        this.loggingService.warn('Failed to transfer responsibility', {
          resourceId: responsibility.resourceId,
          fromUserId,
          toUserId,
          error: error.message
        });
      }
    }

    this.loggingService.log('Responsibility transfer completed', {
      transferredCount: newAssignments.length,
      totalRequested: responsibilitiesToTransfer.length
    });

    return newAssignments;
  }

  /**
   * Converts domain entity to response DTO
   */
  private toResponseDto(assignment: ResourceResponsibleEntity): ResourceResponsibleResponseDto {
    return {
        id: assignment.id!,
        resourceId: assignment.resourceId!,
        userId: assignment.userId!,
        assignedBy: assignment.assignedBy!,
        assignedAt: assignment.assignedAt!,
        isActive: assignment.isActive!,
        userFullName: '',
        userEmail: '',
        assignedByFullName: '',
    };
  }
}
