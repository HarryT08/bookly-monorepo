import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ResourceCategoryRepository } from '@apps/resources-service/domain/repositories/resource-category.repository';
import { ResourceCategoryEntity } from '@apps/resources-service/domain/entities/resource-category.entity';
import { 
  ResourceCategoryResponseDto 
} from '../dtos/resource-category.dto';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * HITO 6 - RF-02: ResourceCategory Application Service
 * Handles business logic for resource-category associations
 */
@Injectable()
export class ResourceCategoryService {
  constructor(
    @Inject('ResourceCategoryRepository')
    private readonly resourceCategoryRepository: ResourceCategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assigns a single category to a resource
   */
  async assignCategoryToResource(
    resourceId: string,
    categoryId: string,
    assignedBy: string
  ): Promise<ResourceCategoryResponseDto> {
    this.loggingService.log('Assigning category to resource', { 
      resourceId,
      categoryId,
      assignedBy 
    });

    // Check if association already exists
    const existingAssociation = await this.resourceCategoryRepository.findByResourceAndCategory(
      resourceId,
      categoryId
    );

    if (existingAssociation) {
      throw new ConflictException(
        `Resource '${resourceId}' is already assigned to category '${categoryId}'`
      );
    }

    const categoryEntity = ResourceCategoryEntity.create(resourceId, categoryId, assignedBy);
    const createdAssociation = await this.resourceCategoryRepository.create(categoryEntity);

    this.loggingService.log('Category assigned to resource successfully', {
      resourceId,
      categoryId,
      associationId: createdAssociation.id
    });

    return this.toResponseDto(createdAssociation);
  }

  /**
   * Assigns multiple categories to a resource
   */
  async assignCategoriesToResource(
    resourceId: string,
    categoryIds: string[],
    assignedBy: string
  ): Promise<ResourceCategoryResponseDto[]> {
    this.loggingService.log('Assigning multiple categories to resource', { 
      resourceId,
      categoryCount: categoryIds.length,
      assignedBy 
    });

    if (categoryIds.length === 0) {
      throw new ConflictException('At least one category must be provided');
    }

    // Remove duplicates
    const uniqueCategoryIds = [...new Set(categoryIds)];

    const associations = await this.resourceCategoryRepository.assignCategoriesToResource(
      resourceId,
      uniqueCategoryIds,
      assignedBy
    );

    this.loggingService.log('Categories assigned to resource successfully', {
      resourceId,
      assignedCount: associations.length
    });

    return associations.map(this.toResponseDto);
  }

  /**
   * Replaces all categories for a resource
   */
  async replaceResourceCategories(
    resourceId: string,
    categoryIds: string[],
    assignedBy: string
  ): Promise<ResourceCategoryResponseDto[]> {
    this.loggingService.log('Replacing resource categories', { 
      resourceId,
      newCategoryCount: categoryIds.length,
      assignedBy 
    });

    if (categoryIds.length === 0) {
      throw new ConflictException('At least one category must be provided');
    }

    // Remove duplicates
    const uniqueCategoryIds = [...new Set(categoryIds)];

    const associations = await this.resourceCategoryRepository.replaceResourceCategories(
      resourceId,
      uniqueCategoryIds,
      assignedBy
    );

    this.loggingService.log('Resource categories replaced successfully', {
      resourceId,
      newAssignmentCount: associations.length
    });

    return associations.map(this.toResponseDto);
  }

  /**
   * Removes a category from a resource
   */
  async removeCategoryFromResource(
    resourceId: string,
    categoryId: string
  ): Promise<void> {
    this.loggingService.log('Removing category from resource', { 
      resourceId,
      categoryId 
    });

    // Check if association exists
    const existingAssociation = await this.resourceCategoryRepository.findByResourceAndCategory(
      resourceId,
      categoryId
    );

    if (!existingAssociation) {
      throw new NotFoundException(
        `Resource '${resourceId}' is not assigned to category '${categoryId}'`
      );
    }

    await this.resourceCategoryRepository.remove(resourceId, categoryId);

    this.loggingService.log('Category removed from resource successfully', {
      resourceId,
      categoryId
    });
  }

  /**
   * Gets all categories assigned to a resource
   */
  async getResourceCategories(resourceId: string): Promise<ResourceCategoryResponseDto[]> {
    const associations = await this.resourceCategoryRepository.findByResourceId(resourceId);
    return associations.map(this.toResponseDto);
  }

  /**
   * Gets all resources assigned to a category with pagination
   */
  async getResourcesByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ 
    associations: ResourceCategoryResponseDto[]; 
    total: number; 
    page: number; 
    limit: number; 
  }> {
    const { associations, total } = await this.resourceCategoryRepository.findResourcesByCategory(
      categoryId,
      page,
      limit
    );

    return {
      associations: associations.map(this.toResponseDto),
      total,
      page,
      limit,
    };
  }

  /**
   * Checks if a resource is assigned to a specific category
   */
  async isResourceAssignedToCategory(
    resourceId: string,
    categoryId: string
  ): Promise<boolean> {
    return await this.resourceCategoryRepository.exists(resourceId, categoryId);
  }

  /**
   * Removes all categories from a resource
   */
  async removeAllCategoriesFromResource(resourceId: string): Promise<void> {
    this.loggingService.log('Removing all categories from resource', { resourceId });

    await this.resourceCategoryRepository.removeAllByResource(resourceId);

    this.loggingService.log('All categories removed from resource successfully', {
      resourceId
    });
  }

  /**
   * Removes a category from all resources (when category is deleted)
   */
  async removeCategoryFromAllResources(categoryId: string): Promise<void> {
    this.loggingService.log('Removing category from all resources', { categoryId });

    await this.resourceCategoryRepository.removeAllByCategory(categoryId);

    this.loggingService.log('Category removed from all resources successfully', {
      categoryId
    });
  }

  /**
   * Validates resource-category assignment
   */
  async validateResourceCategoryAssignment(
    resourceId: string,
    categoryIds: string[]
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!resourceId || resourceId.trim() === '') {
      errors.push('Resource ID is required');
    }

    if (!categoryIds || categoryIds.length === 0) {
      errors.push('At least one category ID is required');
    }

    // Check for duplicate category IDs
    const uniqueIds = new Set(categoryIds);
    if (uniqueIds.size !== categoryIds.length) {
      errors.push('Duplicate category IDs are not allowed');
    }

    // Check for empty category IDs
    const emptyIds = categoryIds.filter(id => !id || id.trim() === '');
    if (emptyIds.length > 0) {
      errors.push('Category IDs cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Bulk operations for multiple resources
   */
  async bulkAssignCategoryToResources(
    resourceIds: string[],
    categoryId: string,
    assignedBy: string
  ): Promise<ResourceCategoryResponseDto[]> {
    this.loggingService.log('Bulk assigning category to resources', { 
      resourceCount: resourceIds.length,
      categoryId,
      assignedBy 
    });

    const associations: ResourceCategoryResponseDto[] = [];

    for (const resourceId of resourceIds) {
      try {
        // Skip if already assigned
        const exists = await this.resourceCategoryRepository.exists(resourceId, categoryId);
        if (!exists) {
          const association = await this.assignCategoryToResource(resourceId, categoryId, assignedBy);
          associations.push(association);
        }
      } catch (error) {
        this.loggingService.warn('Failed to assign category to resource', {
          resourceId,
          categoryId,
          error: error.message
        });
      }
    }

    this.loggingService.log('Bulk category assignment completed', {
      successfulAssignments: associations.length,
      totalResources: resourceIds.length
    });

    return associations;
  }

  /**
   * Converts domain entity to response DTO
   */
  private toResponseDto(association: ResourceCategoryEntity): ResourceCategoryResponseDto {
    return {
      id: association.id!,
      resourceId: association.resourceId!,
      categoryId: association.categoryId!,
      assignedAt: association.assignedAt!,
      assignedBy: association.assignedBy!,
      categoryName: '',
    };
  }
}
