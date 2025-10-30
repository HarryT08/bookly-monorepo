import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ResourceResponsibleRepository } from '@apps/resources-service/domain/repositories/resource-responsible.repository';
import { ResourceResponsibleEntity } from '@apps/resources-service/domain/entities/resource-responsible.entity';
import { 
  ResourceResponsibleResponseDto,
  AssignResponsibleDto,
  AssignMultipleResponsiblesDto,
  ReplaceResourceResponsiblesDto,
  DeactivateResponsibleDto,
  GetResourceResponsiblesDto,
  GetUserResponsibilitiesDto,
  GetResourcesByUserDto,
  IsUserResponsibleDto,
  GetResponsibilitiesDto,
  BulkAssignResponsibleDto,
  TransferResponsibilitiesDto
} from '@libs/dto/resources/resource-responsible.dto';
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
  async assignResponsible(data: AssignResponsibleDto): Promise<ResourceResponsibleResponseDto> {
    this.loggingService.log('Assigning user as responsible for resource', { 
      resourceId: data.resourceId,
      userId: data.userId,
      assignedBy: data.assignedBy 
    });

    // Check if user is already responsible for this resource
    const existingAssignment = await this.resourceResponsibleRepository.findByResourceAndUser(
      data.resourceId,
      data.userId
    );

    if (existingAssignment && existingAssignment.isActive) {
      throw new ConflictException(
        `User '${data.userId}' is already responsible for resource '${data.resourceId}'`
      );
    }

    const responsibleEntity = ResourceResponsibleEntity.create(data.resourceId, data.userId, data.assignedBy);
    const createdAssignment = await this.resourceResponsibleRepository.create(responsibleEntity);

    this.loggingService.log('User assigned as responsible successfully', {
      resourceId: data.resourceId,
      userId: data.userId,
      assignmentId: createdAssignment.id
    });

    return this.toResponseDto(createdAssignment);
  }

  /**
   * Assigns multiple users as responsible for a resource
   */
  async assignMultipleResponsibles(data: AssignMultipleResponsiblesDto): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Assigning multiple users as responsible for resource', { 
      resourceId: data.resourceId,
      userCount: data.userIds.length,
      assignedBy: data.assignedBy 
    });

    if (data.userIds.length === 0) {
      throw new ConflictException('At least one user must be provided');
    }

    // Remove duplicates
    const uniqueUserIds = [...new Set(data.userIds)];

    const assignments = await this.resourceResponsibleRepository.assignResponsibleToResource(
      data.resourceId,
      uniqueUserIds,
      data.assignedBy
    );

    this.loggingService.log('Multiple users assigned as responsible successfully', {
      resourceId: data.resourceId,
      assignedCount: assignments.length
    });

    return assignments.map(this.toResponseDto);
  }

  /**
   * Replaces all responsible users for a resource
   */
  async replaceResourceResponsibles(data: ReplaceResourceResponsiblesDto): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Replacing resource responsible users', { 
      resourceId: data.resourceId,
      newUserCount: data.userIds.length,
      assignedBy: data.assignedBy 
    });

    if (data.userIds.length === 0) {
      throw new ConflictException('At least one user must be provided');
    }

    // Remove duplicates
    const uniqueUserIds = [...new Set(data.userIds)];

    const assignments = await this.resourceResponsibleRepository.replaceResourceResponsibles(
      data.resourceId,
      uniqueUserIds,
      data.assignedBy
    );

    this.loggingService.log('Resource responsible users replaced successfully', {
      resourceId: data.resourceId,
      newAssignmentCount: assignments.length
    });

    return assignments.map(this.toResponseDto);
  }

  /**
   * Deactivates a user's responsibility for a resource
   */
  async deactivateResponsible(data: DeactivateResponsibleDto): Promise<void> {
    this.loggingService.log('Deactivating user responsibility for resource', { 
      resourceId: data.resourceId,
      userId: data.userId 
    });

    // Check if assignment exists and is active
    const existingAssignment = await this.resourceResponsibleRepository.findByResourceAndUser(
      data.resourceId,
      data.userId
    );

    if (!existingAssignment) {
      throw new NotFoundException(
        `User '${data.userId}' is not assigned as responsible for resource '${data.resourceId}'`
      );
    }

    if (!existingAssignment.isActive) {
      throw new ConflictException(
        `User '${data.userId}' is already inactive for resource '${data.resourceId}'`
      );
    }

    await this.resourceResponsibleRepository.deactivate(existingAssignment.id);

    this.loggingService.log('User responsibility deactivated successfully', {
      resourceId: data.resourceId,
      userId: data.userId
    });
  }

  /**
   * Gets all users responsible for a resource
   */
  async getResourceResponsibles(data: GetResourceResponsiblesDto): Promise<ResourceResponsibleResponseDto[]> {
    const assignments = data.activeOnly
      ? await this.resourceResponsibleRepository.findActiveByResourceId(data.resourceId)
      : await this.resourceResponsibleRepository.findByResourceId(data.resourceId);

    return assignments.map(this.toResponseDto);
  }

  /**
   * Gets all resources a user is responsible for
   */
  async getUserResponsibilities(data: GetUserResponsibilitiesDto): Promise<ResourceResponsibleResponseDto[]> {
    const assignments = data.activeOnly
      ? await this.resourceResponsibleRepository.findActiveByUserId(data.userId)
      : await this.resourceResponsibleRepository.findByUserId(data.userId);

    return assignments.map(this.toResponseDto);
  }

  /**
   * Gets resources managed by a user with pagination
   */
  async getResourcesByUser(data: GetResourcesByUserDto): Promise<{ 
    assignments: ResourceResponsibleResponseDto[]; 
    total: number; 
    page: number; 
    limit: number; 
  }> {
    const { assignments, total } = await this.resourceResponsibleRepository.findResourcesByUser(
      data.userId,
      data.page || 1,
      data.limit || 10
    );

    return {
      assignments: assignments.map(this.toResponseDto),
      total,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  /**
   * Checks if a user is responsible for a specific resource
   */
  async isUserResponsibleForResource(data: IsUserResponsibleDto): Promise<boolean> {
    return await this.resourceResponsibleRepository.isUserResponsible(data.resourceId, data.userId);
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
  async getResponsibilities(data: GetResponsibilitiesDto): Promise<{ 
    responsibles: ResourceResponsibleResponseDto[]; 
    total: number; 
    page: number; 
    limit: number; 
  }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const filters = {
      resourceId: data.resourceId,
      userId: data.userId,
      isActive: data.isActive
    };

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
  async bulkAssignResponsibleToResources(data: BulkAssignResponsibleDto): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Bulk assigning user as responsible for resources', { 
      resourceCount: data.resourceIds.length,
      userId: data.userId,
      assignedBy: data.assignedBy 
    });

    const assignments: ResourceResponsibleResponseDto[] = [];

    for (const resourceId of data.resourceIds) {
      try {
        // Skip if already assigned and active
        const isAlreadyResponsible = await this.isUserResponsibleForResource({ resourceId, userId: data.userId });
        if (!isAlreadyResponsible) {
          const assignment = await this.assignResponsible({ resourceId, userId: data.userId, assignedBy: data.assignedBy });
          assignments.push(assignment);
        }
      } catch (error) {
        this.loggingService.warn('Failed to assign user as responsible for resource', {
          resourceId,
          userId: data.userId,
          error: error.message
        });
      }
    }

    this.loggingService.log('Bulk responsibility assignment completed', {
      successfulAssignments: assignments.length,
      totalResources: data.resourceIds.length
    });

    return assignments;
  }

  /**
   * Transfer responsibilities from one user to another
   */
  async transferResponsibilities(data: TransferResponsibilitiesDto): Promise<ResourceResponsibleResponseDto[]> {
    this.loggingService.log('Transferring responsibilities between users', { 
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      transferredBy: data.assignedBy 
    });

    // Get all active responsibilities of the source user
    const currentResponsibilities = await this.getUserResponsibilities({ 
      userId: data.fromUserId, 
      activeOnly: true 
    });
    
    const transferredAssignments: ResourceResponsibleResponseDto[] = [];

    for (const responsibility of currentResponsibilities) {
      try {
        // Deactivate current assignment
        await this.deactivateResponsible({ 
          resourceId: responsibility.resourceId, 
          userId: data.fromUserId
        });
        
        // Create new assignment for target user
        const newAssignment = await this.assignResponsible({
          resourceId: responsibility.resourceId,
          userId: data.toUserId,
          assignedBy: data.assignedBy
        });
        
        transferredAssignments.push(newAssignment);
      } catch (error) {
        this.loggingService.warn('Failed to transfer responsibility', {
          resourceId: responsibility.resourceId,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          error: error.message
        });
      }
    }

    this.loggingService.log('Responsibility transfer completed', {
      transferredCount: transferredAssignments.length,
      totalOriginal: currentResponsibilities.length
    });

    return transferredAssignments;
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
