import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { GetIncidentReportCategoriesQuery } from '@apps/resources-service/application/queries/incident-report-category/get-incident-report-categories.query';
import { ResourcesIncidentReportCategoryService } from '@apps/resources-service/application/services/resources-incident-report-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@QueryHandler(GetIncidentReportCategoriesQuery)
export class GetIncidentReportCategoriesHandler implements IQueryHandler<GetIncidentReportCategoriesQuery> {
  private readonly logger = new Logger(GetIncidentReportCategoriesHandler.name);

  constructor(
    private readonly incidentReportCategoryService: ResourcesIncidentReportCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: GetIncidentReportCategoriesQuery) {
    const { incidentReportId } = query;

    this.logger.log(`Executing GetIncidentReportCategoriesQuery for incident report: ${incidentReportId}`);
    
    this.loggingService.log(
      'Getting categories for incident report',
      GetIncidentReportCategoriesHandler.name
    );

    try {
      const result = await this.incidentReportCategoryService.getIncidentReportCategories(incidentReportId);

      this.loggingService.log(
        'Incident report categories retrieved successfully',
        GetIncidentReportCategoriesHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to get incident report categories',
        error,
        GetIncidentReportCategoriesHandler.name
      );
      throw error;
    }
  }
}
