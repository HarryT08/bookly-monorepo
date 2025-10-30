import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { AssignCategoriesDto, RemoveCategoriesDto } from '@libs/dto/categories';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class UserCategoryRepository {
  private readonly logger = new Logger(UserCategoryRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to a user
   */
  async assignCategoriesToUser(
    userId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<any[]> {
    this.logger.log(`Assigning categories to user ${userId}`);

    try {
      // Validate user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Validate categories exist
      const categories = await this.prisma.category.findMany({
        where: { id: { in: dto.categoryIds } },
      });

      if (categories.length !== dto.categoryIds.length) {
        const foundIds = categories.map(c => c.id);
        const missingIds = dto.categoryIds.filter(id => !foundIds.includes(id));
        throw new Error(`Categories not found: ${missingIds.join(', ')}`);
      }

      // Get existing assignments to avoid duplicates
      const existingAssignments = await this.prisma.userCategory.findMany({
        where: {
          userId,
          categoryId: { in: dto.categoryIds },
        },
      });

      const existingCategoryIds = existingAssignments.map(uc => uc.categoryId);
      const newCategoryIds = dto.categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (newCategoryIds.length === 0) {
        this.logger.warn(`All categories already assigned to user ${userId}`);
        return existingAssignments;
      }

      // Create new assignments
      const userCategories = await Promise.all(
        newCategoryIds.map(categoryId =>
          this.prisma.userCategory.create({
            data: {
              userId,
              categoryId,
              assignedBy,
              assignedAt: new Date(),
            },
            include: {
              category: true,
              user: true,
              assignedByUser: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          })
        )
      );

      this.loggingService.log(
        'Categories assigned to user successfully',
        UserCategoryRepository.name
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `user-categories-assigned-${userId}-${Date.now()}`,
        eventType: 'user.categories.assigned',
        aggregateId: userId,
        aggregateType: 'User',
        eventData: {
          userId,
          categoryIds: newCategoryIds,
          assignedBy,
          count: userCategories.length,
        },
        timestamp: new Date(),
        version: 1,
      });

      return userCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to user',
        error,
        UserCategoryRepository.name
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

    try {
      // Validate user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Validate assignments exist
      const existingAssignments = await this.prisma.userCategory.findMany({
        where: {
          userId,
          categoryId: { in: dto.categoryIds },
        },
      });

      if (existingAssignments.length === 0) {
        this.logger.warn(`No categories found to remove from user ${userId}`);
        return;
      }

      // Remove assignments
      await this.prisma.userCategory.deleteMany({
        where: {
          userId,
          categoryId: { in: dto.categoryIds },
        },
      });

      this.loggingService.log(
        'Categories removed from user successfully',
        UserCategoryRepository.name
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `user-categories-removed-${userId}-${Date.now()}`,
        eventType: 'user.categories.removed',
        aggregateId: userId,
        aggregateType: 'User',
        eventData: {
          userId,
          categoryIds: dto.categoryIds,
          removedBy,
          count: existingAssignments.length,
        },
        timestamp: new Date(),
        version: 1,
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from user',
        error,
        UserCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a user
   */
  async getUserCategories(userId: string): Promise<any[]> {
    this.logger.log(`Getting categories for user ${userId}`);

    try {
      const userCategories = await this.prisma.userCategory.findMany({
        where: { userId },
        include: {
          category: true,
          user: true,
          assignedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: [
          { category: { sortOrder: 'asc' } },
          { assignedAt: 'desc' },
        ],
      });

      return userCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get user categories',
        error,
        UserCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all users that have a specific category
   */
  async getUsersByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting users with category ${categoryId}`);

    try {
      const userCategories = await this.prisma.userCategory.findMany({
        where: { categoryId },
        include: {
          user: true,
          assignedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
      });

      return userCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get users by category',
        error,
        UserCategoryRepository.name
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
      const assignments = await this.prisma.userCategory.findMany({
        where: {
          userId,
          categoryId: { in: categoryIds },
        },
      });

      const result = assignments.length === categoryIds.length;

      this.loggingService.log(
        'User categories check completed',
        UserCategoryRepository.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to check user categories',
        error,
        UserCategoryRepository.name
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
  ): Promise<any[]> {
    this.logger.log(`Replacing all categories for user ${userId}`);

    try {
      // Validate user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Perform replace operation in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Remove all existing assignments
        await tx.userCategory.deleteMany({
          where: { userId },
        });

        // Create new assignments
        return Promise.all(
          categoryIds.map(categoryId =>
            tx.userCategory.create({
              data: {
                userId,
                categoryId,
                assignedBy: updatedBy,
                assignedAt: new Date(),
              },
              include: {
                category: true,
                user: true,
                assignedByUser: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            }),
          ),
        );
      });

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `user-categories-replaced-${userId}-${Date.now()}`,
        eventType: 'user.categories.replaced',
        aggregateId: userId,
        aggregateType: 'User',
        eventData: {
          userId,
          categoryIds,
          updatedBy,
          count: result.length,
        },
        timestamp: new Date(),
        version: 1,
      });

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to replace user categories',
        error,
        UserCategoryRepository.name
      );
      throw error;
    }
  }
}
