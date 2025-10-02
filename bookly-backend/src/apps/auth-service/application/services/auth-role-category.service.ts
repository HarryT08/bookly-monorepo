import { Injectable, Logger } from '@nestjs/common';
import { RoleCategoryRepository } from '@libs/common/repositories/role-category.repository';
import { AssignCategoriesDto, RemoveCategoriesDto, EntityCategoryAssociationDto } from '@libs/dto/categories';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class AuthRoleCategoryService {
  private readonly logger = new Logger(AuthRoleCategoryService.name);

  constructor(
    private readonly roleCategoryRepository: RoleCategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to a role
   */
  async assignCategoriesToRole(
    roleId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Assigning categories to role ${roleId}`);

    this.loggingService.log(
      'Assigning categories to role',
      AuthRoleCategoryService.name
    );

    try {
      const roleCategories = await this.roleCategoryRepository.assignCategoriesToRole(
        roleId,
        dto,
        assignedBy,
      );

      // Transform to response DTOs
      const response = roleCategories.map(rc => ({
        id: rc.id,
        entityId: rc.roleId,
        entityType: 'role' as const,
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
        'Categories assigned to role successfully',
        AuthRoleCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to role',
        error,
        AuthRoleCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Remove multiple categories from a role
   */
  async removeCategoriesFromRole(
    roleId: string,
    dto: RemoveCategoriesDto,
    removedBy: string,
  ): Promise<void> {
    this.logger.log(`Removing categories from role ${roleId}`);

    this.loggingService.log(
      'Removing categories from role',
      AuthRoleCategoryService.name
    );

    try {
      await this.roleCategoryRepository.removeCategoriesFromRole(
        roleId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removed from role successfully',
        AuthRoleCategoryService.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from role',
        error,
        AuthRoleCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a role
   */
  async getRoleCategories(roleId: string): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Getting categories for role ${roleId}`);

    this.loggingService.log(
      'Getting categories for role',
      AuthRoleCategoryService.name
    );

    try {
      const roleCategories = await this.roleCategoryRepository.getRoleCategories(roleId);

      // Transform to response DTOs
      const response = roleCategories.map(rc => ({
        id: rc.id,
        entityId: rc.roleId,
        entityType: 'role' as const,
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
        'Role categories retrieved successfully',
        AuthRoleCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to get role categories',
        error,
        AuthRoleCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all roles that have a specific category
   */
  async getRolesByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting roles with category ${categoryId}`);

    this.loggingService.log(
      'Getting roles by category',
      AuthRoleCategoryService.name
    );

    try {
      const result = await this.roleCategoryRepository.getRolesByCategory(categoryId);

      this.loggingService.log(
        'Roles by category retrieved successfully',
        AuthRoleCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get roles by category',
        error,
        AuthRoleCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Check if a role has specific categories
   */
  async roleHasCategories(roleId: string, categoryIds: string[]): Promise<boolean> {
    this.logger.log(`Checking if role ${roleId} has categories`);

    try {
      const result = await this.roleCategoryRepository.roleHasCategories(roleId, categoryIds);

      this.loggingService.log(
        'Role categories check completed',
        AuthRoleCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to check role categories',
        error,
        AuthRoleCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Replace all categories for a role
   */
  async replaceRoleCategories(
    roleId: string,
    categoryIds: string[],
    updatedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Replacing all categories for role ${roleId}`);

    this.loggingService.log(
      'Replacing role categories',
      AuthRoleCategoryService.name
    );

    try {
      const roleCategories = await this.roleCategoryRepository.replaceRoleCategories(
        roleId,
        categoryIds,
        updatedBy,
      );

      // Transform to response DTOs
      const response = roleCategories.map(rc => ({
        id: rc.id,
        entityId: rc.roleId,
        entityType: 'role' as const,
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
        'Role categories replaced successfully',
        AuthRoleCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to replace role categories',
        error,
        AuthRoleCategoryService.name
      );
      throw error;
    }
  }
}
