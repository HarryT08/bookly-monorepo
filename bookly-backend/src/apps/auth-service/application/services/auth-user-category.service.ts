import { Injectable, Logger } from '@nestjs/common';
import { UserCategoryRepository } from '@libs/common/repositories/user-category.repository';
import { AssignCategoriesDto, RemoveCategoriesDto, EntityCategoryAssociationDto } from '@libs/dto/categories';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class AuthUserCategoryService {
  private readonly logger = new Logger(AuthUserCategoryService.name);

  constructor(
    private readonly userCategoryRepository: UserCategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to a user
   */
  async assignCategoriesToUser(
    userId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Assigning categories to user ${userId}`);

    this.loggingService.log(
      'Assigning categories to user',
      AuthUserCategoryService.name
    );

    try {
      const userCategories = await this.userCategoryRepository.assignCategoriesToUser(
        userId,
        dto,
        assignedBy,
      );

      // Transform to response DTOs
      const response = userCategories.map(uc => ({
        id: uc.id,
        entityId: uc.userId,
        entityType: 'user' as const,
        categoryId: uc.categoryId,
        category: {
          id: uc.category.id,
          type: uc.category.type,
          subtype: uc.category.subtype,
          name: uc.category.name,
          code: uc.category.code,
          description: uc.category.description,
          color: uc.category.color,
          isActive: uc.category.isActive,
          isDefault: uc.category.isDefault,
          sortOrder: uc.category.sortOrder,
          service: uc.category.service,
          createdAt: uc.category.createdAt,
          updatedAt: uc.category.updatedAt,
        },
        assignedBy: uc.assignedBy,
        assignedByUser: uc.assignedByUser ? {
          id: uc.assignedByUser.id,
          name: `${uc.assignedByUser.firstName} ${uc.assignedByUser.lastName}`,
          email: uc.assignedByUser.email,
        } : null,
        assignedAt: uc.assignedAt,
      }));

      this.loggingService.log(
        'Categories assigned to user successfully',
        AuthUserCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to user',
        error,
        AuthUserCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Remove multiple categories from a user
   */
  async removeCategoriesFromUser(
    userId: string,
    dto: RemoveCategoriesDto,
    removedBy: string,
  ): Promise<void> {
    this.logger.log(`Removing categories from user ${userId}`);

    this.loggingService.log(
      'Removing categories from user',
      AuthUserCategoryService.name
    );

    try {
      await this.userCategoryRepository.removeCategoriesFromUser(
        userId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removed from user successfully',
        AuthUserCategoryService.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from user',
        error,
        AuthUserCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a user
   */
  async getUserCategories(userId: string): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Getting categories for user ${userId}`);

    this.loggingService.log(
      'Getting categories for user',
      AuthUserCategoryService.name
    );

    try {
      const userCategories = await this.userCategoryRepository.getUserCategories(userId);

      // Transform to response DTOs
      const response = userCategories.map(uc => ({
        id: uc.id,
        entityId: uc.userId,
        entityType: 'user' as const,
        categoryId: uc.categoryId,
        category: {
          id: uc.category.id,
          type: uc.category.type,
          subtype: uc.category.subtype,
          name: uc.category.name,
          code: uc.category.code,
          description: uc.category.description,
          color: uc.category.color,
          isActive: uc.category.isActive,
          isDefault: uc.category.isDefault,
          sortOrder: uc.category.sortOrder,
          service: uc.category.service,
          createdAt: uc.category.createdAt,
          updatedAt: uc.category.updatedAt,
        },
        assignedBy: uc.assignedBy,
        assignedByUser: uc.assignedByUser ? {
          id: uc.assignedByUser.id,
          name: `${uc.assignedByUser.firstName} ${uc.assignedByUser.lastName}`,
          email: uc.assignedByUser.email,
        } : null,
        assignedAt: uc.assignedAt,
      }));

      this.loggingService.log(
        'User categories retrieved successfully',
        AuthUserCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to get user categories',
        error,
        AuthUserCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all users that have a specific category
   */
  async getUsersByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting users with category ${categoryId}`);

    this.loggingService.log(
      'Getting users by category',
      AuthUserCategoryService.name
    );

    try {
      const result = await this.userCategoryRepository.getUsersByCategory(categoryId);

      this.loggingService.log(
        'Users by category retrieved successfully',
        AuthUserCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get users by category',
        error,
        AuthUserCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Check if a user has specific categories
   */
  async userHasCategories(userId: string, categoryIds: string[]): Promise<boolean> {
    this.logger.log(`Checking if user ${userId} has categories`);

    try {
      const result = await this.userCategoryRepository.userHasCategories(userId, categoryIds);

      this.loggingService.log(
        'User categories check completed',
        AuthUserCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to check user categories',
        error,
        AuthUserCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Replace all categories for a user
   */
  async replaceUserCategories(
    userId: string,
    categoryIds: string[],
    updatedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Replacing all categories for user ${userId}`);

    this.loggingService.log(
      'Replacing user categories',
      AuthUserCategoryService.name
    );

    try {
      const userCategories = await this.userCategoryRepository.replaceUserCategories(
        userId,
        categoryIds,
        updatedBy,
      );

      // Transform to response DTOs
      const response = userCategories.map(uc => ({
        id: uc.id,
        entityId: uc.userId,
        entityType: 'user' as const,
        categoryId: uc.categoryId,
        category: {
          id: uc.category.id,
          type: uc.category.type,
          subtype: uc.category.subtype,
          name: uc.category.name,
          code: uc.category.code,
          description: uc.category.description,
          color: uc.category.color,
          isActive: uc.category.isActive,
          isDefault: uc.category.isDefault,
          sortOrder: uc.category.sortOrder,
          service: uc.category.service,
          createdAt: uc.category.createdAt,
          updatedAt: uc.category.updatedAt,
        },
        assignedBy: uc.assignedBy,
        assignedByUser: uc.assignedByUser ? {
          id: uc.assignedByUser.id,
          name: `${uc.assignedByUser.firstName} ${uc.assignedByUser.lastName}`,
          email: uc.assignedByUser.email,
        } : null,
        assignedAt: uc.assignedAt,
      }));

      this.loggingService.log(
        'User categories replaced successfully',
        AuthUserCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to replace user categories',
        error,
        AuthUserCategoryService.name
      );
      throw error;
    }
  }
}
