import { Injectable, Logger } from '@nestjs/common';
import { IncidentReportCategoryRepository } from '@libs/common/repositories/incident-report-category.repository';
import { AssignCategoriesDto, RemoveCategoriesDto, EntityCategoryAssociationDto } from '@libs/dto/categories';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
export class ResourcesIncidentReportCategoryService {
  private readonly logger = new Logger(ResourcesIncidentReportCategoryService.name);

  constructor(
    private readonly incidentReportCategoryRepository: IncidentReportCategoryRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Assign multiple categories to an incident report
   */
  async assignCategoriesToIncidentReport(
    incidentReportId: string,
    dto: AssignCategoriesDto,
    assignedBy: string,
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Assigning categories to incident report ${incidentReportId}`);

    this.loggingService.log(
      'Assigning categories to incident report',
      ResourcesIncidentReportCategoryService.name
    );

    try {
      const incidentReportCategories = await this.incidentReportCategoryRepository.assignCategoriesToIncidentReport(
        incidentReportId,
        dto,
        assignedBy,
      );

      // Transform to response DTOs
      const response = incidentReportCategories.map(irc => ({
        id: irc.id,
        entityId: irc.incidentReportId,
        entityType: 'incident-report' as const,
        categoryId: irc.categoryId,
        category: {
          id: irc.category.id,
          type: irc.category.type,
          subtype: irc.category.subtype,
          name: irc.category.name,
          code: irc.category.code,
          description: irc.category.description,
          color: irc.category.color,
          isActive: irc.category.isActive,
          isDefault: irc.category.isDefault,
          sortOrder: irc.category.sortOrder,
          service: irc.category.service,
          createdAt: irc.category.createdAt,
          updatedAt: irc.category.updatedAt,
        },
        assignedBy: irc.assignedBy,
        assignedByUser: irc.user ? {
          id: irc.user.id,
          name: `${irc.user.firstName} ${irc.user.lastName}`,
          email: irc.user.email,
        } : null,
        assignedAt: irc.assignedAt,
      }));

      this.loggingService.log(
        'Categories assigned to incident report successfully',
        ResourcesIncidentReportCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to incident report',
        error,
        ResourcesIncidentReportCategoryService.name
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
    this.logger.log(`Removing categories from incident report ${incidentReportId}`);

    this.loggingService.log(
      'Removing categories from incident report',
      ResourcesIncidentReportCategoryService.name
    );

    try {
      await this.incidentReportCategoryRepository.removeCategoriesFromIncidentReport(
        incidentReportId,
        dto,
        removedBy,
      );

      this.loggingService.log(
        'Categories removed from incident report successfully',
        ResourcesIncidentReportCategoryService.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from incident report',
        error,
        ResourcesIncidentReportCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all categories assigned to an incident report
   */
  async getIncidentReportCategories(incidentReportId: string): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Getting categories for incident report ${incidentReportId}`);

    this.loggingService.log(
      'Getting categories for incident report',
      ResourcesIncidentReportCategoryService.name
    );

    try {
      const incidentReportCategories = await this.incidentReportCategoryRepository.getIncidentReportCategories(incidentReportId);

      // Transform to response DTOs
      const response = incidentReportCategories.map(irc => ({
        id: irc.id,
        entityId: irc.incidentReportId,
        entityType: 'incident-report' as const,
        categoryId: irc.categoryId,
        category: {
          id: irc.category.id,
          type: irc.category.type,
          subtype: irc.category.subtype,
          name: irc.category.name,
          code: irc.category.code,
          description: irc.category.description,
          color: irc.category.color,
          isActive: irc.category.isActive,
          isDefault: irc.category.isDefault,
          sortOrder: irc.category.sortOrder,
          service: irc.category.service,
          createdAt: irc.category.createdAt,
          updatedAt: irc.category.updatedAt,
        },
        assignedBy: irc.assignedBy,
        assignedByUser: irc.user ? {
          id: irc.user.id,
          name: `${irc.user.firstName} ${irc.user.lastName}`,
          email: irc.user.email,
        } : null,
        assignedAt: irc.assignedAt,
      }));

      this.loggingService.log(
        'Incident report categories retrieved successfully',
        ResourcesIncidentReportCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to get incident report categories',
        error,
        ResourcesIncidentReportCategoryService.name
      );
      throw error;
    }
  }

  /**
   * Get all incident reports that have a specific category
   */
  async getIncidentReportsByCategory(categoryId: string): Promise<any[]> {
    this.logger.log(`Getting incident reports with category ${categoryId}`);

    this.loggingService.log(
      'Getting incident reports by category',
      ResourcesIncidentReportCategoryService.name
    );

    try {
      const result = await this.incidentReportCategoryRepository.getIncidentReportsByCategory(categoryId);

      this.loggingService.log(
        'Incident reports by category retrieved successfully',
        ResourcesIncidentReportCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get incident reports by category',
        error,
        ResourcesIncidentReportCategoryService.name
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
      const result = await this.incidentReportCategoryRepository.incidentReportHasCategories(incidentReportId, categoryIds);

      this.loggingService.log(
        'Incident report categories check completed',
        ResourcesIncidentReportCategoryService.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to check incident report categories',
        error,
        ResourcesIncidentReportCategoryService.name
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
  ): Promise<EntityCategoryAssociationDto[]> {
    this.logger.log(`Replacing all categories for incident report ${incidentReportId}`);

    this.loggingService.log(
      'Replacing incident report categories',
      ResourcesIncidentReportCategoryService.name
    );

    try {
      const incidentReportCategories = await this.incidentReportCategoryRepository.replaceIncidentReportCategories(
        incidentReportId,
        categoryIds,
        updatedBy,
      );

      // Transform to response DTOs
      const response = incidentReportCategories.map(irc => ({
        id: irc.id,
        entityId: irc.incidentReportId,
        entityType: 'incident-report' as const,
        categoryId: irc.categoryId,
        category: {
          id: irc.category.id,
          type: irc.category.type,
          subtype: irc.category.subtype,
          name: irc.category.name,
          code: irc.category.code,
          description: irc.category.description,
          color: irc.category.color,
          isActive: irc.category.isActive,
          isDefault: irc.category.isDefault,
          sortOrder: irc.category.sortOrder,
          service: irc.category.service,
          createdAt: irc.category.createdAt,
          updatedAt: irc.category.updatedAt,
        },
        assignedBy: irc.assignedBy,
        assignedByUser: irc.user ? {
          id: irc.user.id,
          name: `${irc.user.firstName} ${irc.user.lastName}`,
          email: irc.user.email,
        } : null,
        assignedAt: irc.assignedAt,
      }));

      this.loggingService.log(
        'Incident report categories replaced successfully',
        ResourcesIncidentReportCategoryService.name
      );

      return response;
    } catch (error) {
      this.loggingService.error(
        'Failed to replace incident report categories',
        error,
        ResourcesIncidentReportCategoryService.name
      );
      throw error;
    }
  }
}
