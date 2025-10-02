import { Injectable, Logger } from '@nestjs/common';
import { ResourceCategoryRepository } from '@libs/common/repositories/resource-category.repository';
import { AssignCategoriesDto, RemoveCategoriesDto, EntityCategoryAssociationDto } from '@libs/dto/categories';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class ResourcesResourceCategoryService {
  private readonly logger = new Logger(ResourcesResourceCategoryService.name);

  constructor(
    private readonly resourceCategoryRepository: ResourceCategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to a resource
   */
  async assignCategoriesToResource(
    resourceId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Assigning categories to resource ${resourceId}`);

    this.loggingService.log(
      'Assigning categories to resource',
      ResourcesResourceCategoryService.name
    );

    try {
      const resourceCategories = await this.resourceCategoryRepository.assignCategoriesToResource(
        resourceId,
        dto,
        assignedBy,
      );

      // Transform to response DTOs
      const response = resourceCategories.map(rc => ({
        id: rc.id,
        entityId: rc.resourceId,
        entityType: 'resource' as const,
        categoryId: rc.categoryId,
        category: {
          id: rc.category.id,
          type: rc.category.type,
          subtype: rc.category.subtype,
          name: rc.category.name,
          code: rc.category.code,
          description: rc.category.description,
          color: rc.category.color,
          isActive: rc.category.isActive,
          isDefault: rc.category.isDefault,
          sortOrder: rc.category.sortOrder,
          service: rc.category.service,
          createdAt: rc.category.createdAt,
          updatedAt: rc.category.updatedAt,
        },
        assignedBy: rc.assignedBy,
        assignedByUser: rc.user ? {
          id: rc.user.id,
          name: `${rc.user.firstName} ${rc.user.lastName}`,
          email: rc.user.email,
        } : null,
        assignedAt: rc.assignedAt,
      }));

      this.loggingService.log(
        'Categories assigned to resource successfully',
        ResourcesResourceCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to resource',
        error,
        ResourcesResourceCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Remove multiple categories from a resource
   */
  async removeCategoriesFromResource(
    resourceId: string,
    dto: RemoveCategoriesDto,
    removedBy: string,
  ): Promise<void> {
    this.logger.log(`Removing categories from resource ${resourceId}`);

    this.loggingService.log(
      'Removing categories from resource',
      ResourcesResourceCategoryService.name
    );

    try {
      await this.resourceCategoryRepository.removeCategoriesFromResource(
        resourceId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removed from resource successfully',
        ResourcesResourceCategoryService.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from resource',
        error,
        ResourcesResourceCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a resource
   */
  async getResourceCategories(resourceId: string): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Getting categories for resource ${resourceId}`);

    this.loggingService.log(
      'Getting categories for resource',
      ResourcesResourceCategoryService.name
    );

    try {
      const resourceCategories = await this.resourceCategoryRepository.getResourceCategories(resourceId);

      // Transform to response DTOs
      const response = resourceCategories.map(rc => ({
        id: rc.id,
        entityId: rc.resourceId,
        entityType: 'resource' as const,
        categoryId: rc.categoryId,
        category: {
          id: rc.category.id,
          type: rc.category.type,
          subtype: rc.category.subtype,
          name: rc.category.name,
          code: rc.category.code,
          description: rc.category.description,
          color: rc.category.color,
          isActive: rc.category.isActive,
          isDefault: rc.category.isDefault,
          sortOrder: rc.category.sortOrder,
          service: rc.category.service,
          createdAt: rc.category.createdAt,
          updatedAt: rc.category.updatedAt,
        },
        assignedBy: rc.assignedBy,
        assignedByUser: rc.user ? {
          id: rc.user.id,
          name: `${rc.user.firstName} ${rc.user.lastName}`,
          email: rc.user.email,
        } : null,
        assignedAt: rc.assignedAt,
      }));

      this.loggingService.log(
        'Resource categories retrieved successfully',
        ResourcesResourceCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to get resource categories',
        error,
        ResourcesResourceCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all resources that have a specific category
   */
  async getResourcesByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting resources with category ${categoryId}`);

    this.loggingService.log(
      'Getting resources by category',
      ResourcesResourceCategoryService.name
    );

    try {
      const result = await this.resourceCategoryRepository.getResourcesByCategory(categoryId);

      this.loggingService.log(
        'Resources by category retrieved successfully',
        ResourcesResourceCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get resources by category',
        error,
        ResourcesResourceCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Check if a resource has specific categories
   */
  async resourceHasCategories(resourceId: string, categoryIds: string[]): Promise<boolean> {
    this.logger.log(`Checking if resource ${resourceId} has categories`);

    try {
      const result = await this.resourceCategoryRepository.resourceHasCategories(resourceId, categoryIds);

      this.loggingService.log(
        'Resource categories check completed',
        ResourcesResourceCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to check resource categories',
        error,
        ResourcesResourceCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Replace all categories for a resource
   */
  async replaceResourceCategories(
    resourceId: string,
    categoryIds: string[],
    updatedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Replacing all categories for resource ${resourceId}`);

    this.loggingService.log(
      'Replacing resource categories',
      ResourcesResourceCategoryService.name
    );

    try {
      const resourceCategories = await this.resourceCategoryRepository.replaceResourceCategories(
        resourceId,
        categoryIds,
        updatedBy,
      );

      // Transform to response DTOs
      const response = resourceCategories.map(rc => ({
        id: rc.id,
        entityId: rc.resourceId,
        entityType: 'resource' as const,
        categoryId: rc.categoryId,
        category: {
          id: rc.category.id,
          type: rc.category.type,
          subtype: rc.category.subtype,
          name: rc.category.name,
          code: rc.category.code,
          description: rc.category.description,
          color: rc.category.color,
          isActive: rc.category.isActive,
          isDefault: rc.category.isDefault,
          sortOrder: rc.category.sortOrder,
          service: rc.category.service,
          createdAt: rc.category.createdAt,
          updatedAt: rc.category.updatedAt,
        },
        assignedBy: rc.assignedBy,
        assignedByUser: rc.user ? {
          id: rc.user.id,
          name: `${rc.user.firstName} ${rc.user.lastName}`,
          email: rc.user.email,
        } : null,
        assignedAt: rc.assignedAt,
      }));

      this.loggingService.log(
        'Resource categories replaced successfully',
        ResourcesResourceCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to replace resource categories',
        error,
        ResourcesResourceCategoryService.name
      );
      throw error;
    }
  }
}
