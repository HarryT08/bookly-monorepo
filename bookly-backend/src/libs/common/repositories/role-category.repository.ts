import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { LoggingService } from '@libs/logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { AssignCategoriesDto, RemoveCategoriesDto } from '@libs/dto/categories';

@Injectable()
export class RoleCategoryRepository {
  private readonly logger = new Logger(RoleCategoryRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
    private readonly eventBus: EventBusService,
  ) {}

  /**
   * Assign multiple categories to a role
   */
  async assignCategoriesToRole(
    roleId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<any[]> {
    this.logger.log(`Assigning categories to role ${roleId}`);

    try {
      // Check if role exists
      const roleExists = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!roleExists) {
        throw new Error(`Role with ID ${roleId} not found`);
      }

      // Check if categories exist
      const categoriesExist = await this.prisma.category.findMany({
        where: { id: { in: dto.categoryIds } },
      });

      if (categoriesExist.length !== dto.categoryIds.length) {
        const foundIds = categoriesExist.map(c => c.id);
        const missingIds = dto.categoryIds.filter(id => !foundIds.includes(id));
        throw new Error(`Categories not found: ${missingIds.join(', ')}`);
      }

      // Create role-category associations
      const roleCategories = await Promise.all(
        dto.categoryIds.map(async (categoryId) => {
          // Check if association already exists
          const existing = await this.prisma.roleCategory.findFirst({
            where: {
              roleId,
              categoryId,
            },
          });

          if (existing) {
            this.logger.warn(`Role ${roleId} already has category ${categoryId}`);
            return existing;
          }

          return this.prisma.roleCategory.create({
            data: {
              roleId,
              categoryId,
              assignedBy,
              assignedAt: new Date(),
            },
            include: {
              category: true,
              role: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          });
        }),
      );

      this.loggingService.log(
        'Categories assigned to role successfully',
        'RoleCategoryRepository'
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `role-categories-assigned-${roleId}-${Date.now()}`,
        eventType: 'role.categories.assigned',
        aggregateId: roleId,
        aggregateType: 'Role',
        eventData: {
          roleId,
          categoryIds: dto.categoryIds,
          assignedBy,
          count: roleCategories.length,
        },
        timestamp: new Date(),
        version: 1,
      });

      return roleCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to role',
        error,
        'RoleCategoryRepository'
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

    try {
      // Check if role exists
      const roleExists = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!roleExists) {
        throw new Error(`Role with ID ${roleId} not found`);
      }

      // Remove role-category associations
      const deletedCount = await this.prisma.roleCategory.deleteMany({
        where: {
          roleId,
          categoryId: { in: dto.categoryIds },
        },
      });

      this.loggingService.log(
        'Categories removed from role successfully',
        'RoleCategoryRepository'
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `role-categories-removed-${roleId}-${Date.now()}`,
        eventType: 'role.categories.removed',
        aggregateId: roleId,
        aggregateType: 'Role',
        eventData: {
          roleId,
          categoryIds: dto.categoryIds,
          removedBy,
          deletedCount: deletedCount.count,
        },
        timestamp: new Date(),
        version: 1,
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from role',
        error,
        'RoleCategoryRepository'
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a role
   */
  async getRoleCategories(roleId: string): Promise<any[]> {
    this.logger.log(`Getting categories for role ${roleId}`);

    try {
      const roleCategories = await this.prisma.roleCategory.findMany({
        where: { roleId },
        include: {
          category: true,
          role: true,
          user: {
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

      return roleCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get role categories',
        error,
        'RoleCategoryRepository'
      );
      throw error;
    }
  }

  /**
   * Get all roles that have a specific category
   */
  async getRolesByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting roles with category ${categoryId}`);

    try {
      const roleCategories = await this.prisma.roleCategory.findMany({
        where: { categoryId },
        include: {
          role: true,
          user: {
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

      return roleCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get roles by category',
        error,
        'RoleCategoryRepository'
      );
      throw error;
    }
  }

  /**
   * Check if a role has specific categories
   */
  async roleHasCategories(roleId: string, categoryIds: string[]): Promise<boolean> {
    try {
      const count = await this.prisma.roleCategory.count({
        where: {
          roleId,
          categoryId: { in: categoryIds },
        },
      });

      return count === categoryIds.length;
    } catch (error) {
      this.loggingService.error(
        'Failed to check role categories',
        error,
        'RoleCategoryRepository'
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
  ): Promise<any[]> {
    this.logger.log(`Replacing all categories for role ${roleId}`);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Remove all existing categories
        await tx.roleCategory.deleteMany({
          where: { roleId },
        });

        // Add new categories
        const newRoleCategories = await Promise.all(
          categoryIds.map((categoryId) =>
            tx.roleCategory.create({
              data: {
                roleId,
                categoryId,
                assignedBy: updatedBy,
                assignedAt: new Date(),
              },
              include: {
                category: true,
                role: true,
                user: {
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

        // Publish event
        await this.eventBus.publishEvent({
          eventId: `role-categories-replaced-${roleId}-${Date.now()}`,
          eventType: 'role.categories.replaced',
          aggregateId: roleId,
          aggregateType: 'Role',
          eventData: {
            roleId,
            categoryIds,
            updatedBy,
            count: newRoleCategories.length,
          },
          timestamp: new Date(),
          version: 1,
        });

        return newRoleCategories;
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to replace role categories',
        error,
        'RoleCategoryRepository'
      );
      throw error;
    }
  }
}
