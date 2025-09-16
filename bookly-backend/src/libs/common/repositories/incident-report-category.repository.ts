import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { LoggingService } from '@libs/logging/logging.service';
import { AssignCategoriesDto, RemoveCategoriesDto } from '@libs/dto/categories';

@Injectable()
export class IncidentReportCategoryRepository {
  private readonly logger = new Logger(IncidentReportCategoryRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to an incident report
   */
  async assignCategoriesToIncidentReport(
    incidentReportId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<any[]> {
    this.logger.log(`Assigning ${dto.categoryIds.length} categories to incident report ${incidentReportId}`);

    this.loggingService.log(
      'Starting categories assignment to incident report',
      IncidentReportCategoryRepository.name
    );

    try {
      // Verify incident report exists
      const incidentReport = await this.prisma.incidentReport.findUnique({
        where: { id: incidentReportId }
      });

      if (!incidentReport) {
        throw new NotFoundException(`Incident report with ID ${incidentReportId} not found`);
      }

      // Verify categories exist
      const categories = await this.prisma.category.findMany({
        where: { id: { in: dto.categoryIds } }
      });

      if (categories.length !== dto.categoryIds.length) {
        const foundIds = categories.map(c => c.id);
        const missing = dto.categoryIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Categories not found: ${missing.join(', ')}`);
      }

      // Check for existing associations to avoid duplicates
      const existingAssociations = await this.prisma.incidentReportCategory.findMany({
        where: {
          incidentReportId,
          categoryId: { in: dto.categoryIds }
        }
      });

      const existingCategoryIds = existingAssociations.map(irc => irc.categoryId);
      const newCategoryIds = dto.categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (newCategoryIds.length === 0) {
        throw new ConflictException('All categories are already assigned to this incident report');
      }

      // Create new associations
      const incidentReportCategoriesData = newCategoryIds.map(categoryId => ({
        incidentReportId,
        categoryId,
        assignedBy,
        assignedAt: new Date(),
      }));

      await this.prisma.incidentReportCategory.createMany({
        data: incidentReportCategoriesData
      });

      // Fetch created associations with relations
      const incidentReportCategories = await this.prisma.incidentReportCategory.findMany({
        where: {
          incidentReportId,
          categoryId: { in: newCategoryIds }
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      this.loggingService.log(
        'Categories assigned to incident report successfully',
        IncidentReportCategoryRepository.name
      );

      // Publish domain event
      await this.eventBus.publishEvent({
        eventId: `incident-report-categories-assigned-${incidentReportId}-${Date.now()}`,
        eventType: 'incident-report.categories.assigned',
        aggregateId: incidentReportId,
        aggregateType: 'IncidentReport',
        eventData: {
          incidentReportId,
          categoryIds: newCategoryIds,
          assignedBy,
          count: incidentReportCategories.length,
        },
        timestamp: new Date(),
        version: 1,
      });

      return incidentReportCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to incident report',
        error,
        IncidentReportCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Remove multiple categories from an incident report
   */
  async removeCategoriesFromIncidentReport(
    incidentReportId: string,
    dto: RemoveCategoriesDto,
    removedBy: string,
  ): Promise<void> {
    this.logger.log(`Removing ${dto.categoryIds.length} categories from incident report ${incidentReportId}`);

    this.loggingService.log(
      'Starting categories removal from incident report',
      IncidentReportCategoryRepository.name
    );

    try {
      // Verify associations exist
      const existingAssociations = await this.prisma.incidentReportCategory.findMany({
        where: {
          incidentReportId,
          categoryId: { in: dto.categoryIds }
        }
      });

      if (existingAssociations.length === 0) {
        throw new NotFoundException('No matching incident-report-category associations found');
      }

      const existingCategoryIds = existingAssociations.map(irc => irc.categoryId);
      const notFoundIds = dto.categoryIds.filter(id => !existingCategoryIds.includes(id));

      if (notFoundIds.length > 0) {
        this.logger.warn(`Categories not assigned to incident report: ${notFoundIds.join(', ')}`);
      }

      // Remove associations
      await this.prisma.incidentReportCategory.deleteMany({
        where: {
          incidentReportId,
          categoryId: { in: existingCategoryIds }
        }
      });

      this.loggingService.log(
        'Categories removed from incident report successfully',
        IncidentReportCategoryRepository.name
      );

      // Publish domain event
      await this.eventBus.publishEvent({
        eventId: `incident-report-categories-removed-${incidentReportId}-${Date.now()}`,
        eventType: 'incident-report.categories.removed',
        aggregateId: incidentReportId,
        aggregateType: 'IncidentReport',
        eventData: {
          incidentReportId,
          categoryIds: existingCategoryIds,
          removedBy,
          count: existingCategoryIds.length,
        },
        timestamp: new Date(),
        version: 1,
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from incident report',
        error,
        IncidentReportCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to an incident report
   */
  async getIncidentReportCategories(incidentReportId: string): Promise<any[]> {
    this.logger.log(`Getting categories for incident report ${incidentReportId}`);

    try {
      const incidentReportCategories = await this.prisma.incidentReportCategory.findMany({
        where: { incidentReportId },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: [
          { category: { sortOrder: 'asc' } },
          { assignedAt: 'desc' }
        ]
      });

      this.loggingService.log(
        'Incident report categories retrieved successfully',
        IncidentReportCategoryRepository.name
      );

      return incidentReportCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get incident report categories',
        error,
        IncidentReportCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Get all incident reports that have a specific category
   */
  async getIncidentReportsByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting incident reports with category ${categoryId}`);

    try {
      const incidentReportCategories = await this.prisma.incidentReportCategory.findMany({
        where: { categoryId },
        include: {
          incidentReport: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      this.loggingService.log(
        'Incident reports by category retrieved successfully',
        IncidentReportCategoryRepository.name
      );

      return incidentReportCategories;
    } catch (error) {
      this.loggingService.error(
        'Failed to get incident reports by category',
        error,
        IncidentReportCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Check if an incident report has specific categories
   */
  async incidentReportHasCategories(incidentReportId: string, categoryIds: string[]): Promise<boolean> {
    this.logger.log(`Checking if incident report ${incidentReportId} has categories`);

    try {
      const count = await this.prisma.incidentReportCategory.count({
        where: {
          incidentReportId,
          categoryId: { in: categoryIds }
        }
      });

      return count === categoryIds.length;
    } catch (error) {
      this.loggingService.error(
        'Failed to check incident report categories',
        error,
        IncidentReportCategoryRepository.name
      );
      throw error;
    }
  }

  /**
   * Replace all categories for an incident report
   */
  async replaceIncidentReportCategories(
    incidentReportId: string,
    categoryIds: string[],
    updatedBy: string,
  ): Promise<any[]> {
    this.logger.log(`Replacing all categories for incident report ${incidentReportId}`);

    this.loggingService.log(
      'Starting incident report categories replacement',
      IncidentReportCategoryRepository.name
    );

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Remove all existing associations
        await prisma.incidentReportCategory.deleteMany({
          where: { incidentReportId }
        });

        // Verify new categories exist
        const categories = await prisma.category.findMany({
          where: { id: { in: categoryIds } }
        });

        if (categories.length !== categoryIds.length) {
          const foundIds = categories.map(c => c.id);
          const missing = categoryIds.filter(id => !foundIds.includes(id));
          throw new NotFoundException(`Categories not found: ${missing.join(', ')}`);
        }

        // Create new associations
        const incidentReportCategoriesData = categoryIds.map(categoryId => ({
          incidentReportId,
          categoryId,
          assignedBy: updatedBy,
          assignedAt: new Date(),
        }));

        await prisma.incidentReportCategory.createMany({
          data: incidentReportCategoriesData
        });

        // Fetch created associations with relations
        const incidentReportCategories = await prisma.incidentReportCategory.findMany({
          where: { incidentReportId },
          include: {
            category: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        });

        this.loggingService.log(
          'Incident report categories replaced successfully',
          IncidentReportCategoryRepository.name
        );

        // Publish domain event
        await this.eventBus.publishEvent({
          eventId: `incident-report-categories-replaced-${incidentReportId}-${Date.now()}`,
          eventType: 'incident-report.categories.replaced',
          aggregateId: incidentReportId,
          aggregateType: 'IncidentReport',
          eventData: {
            incidentReportId,
            categoryIds,
            updatedBy,
            count: incidentReportCategories.length,
          },
          timestamp: new Date(),
          version: 1,
        });

        return incidentReportCategories;
      });
    } catch (error) {
      this.loggingService.error(
        'Failed to replace incident report categories',
        error,
        IncidentReportCategoryRepository.name
      );
      throw error;
    }
  }
}
