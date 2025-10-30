import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { AssignCategoriesDto, RemoveCategoriesDto } from '@libs/dto/categories';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class ResourceCategoryRepository {
  private readonly logger = new Logger(ResourceCategoryRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to a resource
   */
  async assignCategoriesToResource(
    resourceId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<any[]> {
    this.logger.log(`Assigning categories to resource ${resourceId}`);

    try {
      // Validate resource exists
      const resourceExists = await this.prisma.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resourceExists) {
        throw new Error(`Resource with ID ${resourceId} not found`);
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
      const existingAssignments = await this.prisma.resourceCategory.findMany({
        where: {
          resourceId,
          categoryId: { in: dto.categoryIds },
        },
      });

      const existingCategoryIds = existingAssignments.map(rc => rc.categoryId);
      const newCategoryIds = dto.categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (newCategoryIds.length === 0) {
        this.logger.warn(`All categories already assigned to resource ${resourceId}`);
        return existingAssignments;
      }

      // Create new assignments
      const resourceCategories = await Promise.all(
        newCategoryIds.map(categoryId =>
          this.prisma.resourceCategory.create({
            data: {
              resourceId,
              categoryId,
              assignedBy,
              assignedAt: new Date(),
            },
            include: {
              category: true,
              resource: true,
              user: {
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
        'Categories assigned to resource successfully',
        ResourceCategoryRepository.name
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `resource-categories-assigned-${resourceId}-${Date.now()}`,
        eventType: 'resource.categories.assigned',
        aggregateId: resourceId,
        aggregateType: 'Resource',
        eventData: {
          resourceId,
          categoryIds: newCategoryIds,
          assignedBy,
          count: resourceCategories.length,
        },
        timestamp: new Date(),
        version: 1,
      });

      return resourceCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to resource',
        error,
        ResourceCategoryRepository.name
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

    try {
      // Validate resource exists
      const resourceExists = await this.prisma.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resourceExists) {
        throw new Error(`Resource with ID ${resourceId} not found`);
      }

      // Validate assignments exist
      const existingAssignments = await this.prisma.resourceCategory.findMany({
        where: {
          resourceId,
          categoryId: { in: dto.categoryIds },
        },
      });

      if (existingAssignments.length === 0) {
        this.logger.warn(`No categories found to remove from resource ${resourceId}`);
        return;
      }

      // Remove assignments
      await this.prisma.resourceCategory.deleteMany({
        where: {
          resourceId,
          categoryId: { in: dto.categoryIds },
        },
      });

      this.loggingService.log(
        'Categories removed from resource successfully',
        ResourceCategoryRepository.name
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `resource-categories-removed-${resourceId}-${Date.now()}`,
        eventType: 'resource.categories.removed',
        aggregateId: resourceId,
        aggregateType: 'Resource',
        eventData: {
          resourceId,
          categoryIds: dto.categoryIds,
          removedBy,
          count: existingAssignments.length,
        },
        timestamp: new Date(),
        version: 1,
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from resource',
        error,
        ResourceCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to a resource
   */
  async getResourceCategories(resourceId: string): Promise<any[]> {
    this.logger.log(`Getting categories for resource ${resourceId}`);

    try {
      const resourceCategories = await this.prisma.resourceCategory.findMany({
        where: { resourceId },
        include: {
          category: true,
          resource: true,
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

      return resourceCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get resource categories',
        error,
        ResourceCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all resources that have a specific category
   */
  async getResourcesByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting resources with category ${categoryId}`);

    try {
      const resourceCategories = await this.prisma.resourceCategory.findMany({
        where: { categoryId },
        include: {
          resource: true,
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

      return resourceCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get resources by category',
        error,
        ResourceCategoryRepository.name
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
      const assignments = await this.prisma.resourceCategory.findMany({
        where: {
          resourceId,
          categoryId: { in: categoryIds },
        },
      });

      const result = assignments.length === categoryIds.length;

      this.loggingService.log(
        'Resource categories check completed',
        ResourceCategoryRepository.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to check resource categories',
        error,
        ResourceCategoryRepository.name
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
  ): Promise<any[]> {
    this.logger.log(`Replacing all categories for resource ${resourceId}`);

    try {
      // Validate resource exists
      const resourceExists = await this.prisma.resource.findUnique({
        where: { id: resourceId },
      });

      if (!resourceExists) {
        throw new Error(`Resource with ID ${resourceId} not found`);
      }

      // Perform replace operation in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Remove all existing assignments
        await tx.resourceCategory.deleteMany({
          where: { resourceId },
        });

        // Create new assignments
        return Promise.all(
          categoryIds.map(categoryId =>
            tx.resourceCategory.create({
              data: {
                resourceId,
                categoryId,
                assignedBy: updatedBy,
                assignedAt: new Date(),
              },
              include: {
                category: true,
                resource: true,
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
      });

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `resource-categories-replaced-${resourceId}-${Date.now()}`,
        eventType: 'resource.categories.replaced',
        aggregateId: resourceId,
        aggregateType: 'Resource',
        eventData: {
          resourceId,
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
        'Failed to replace resource categories',
        error,
        ResourceCategoryRepository.name
      );
      throw error;
    }
  }
}
