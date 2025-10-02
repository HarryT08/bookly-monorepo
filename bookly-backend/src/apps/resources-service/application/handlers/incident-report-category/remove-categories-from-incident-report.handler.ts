import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { RemoveCategoriesFromIncidentReportCommand } from '@apps/resources-service/application/commands/incident-report-category/remove-categories-from-incident-report.command';
import { ResourcesIncidentReportCategoryService } from '@apps/resources-service/application/services/resources-incident-report-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(RemoveCategoriesFromIncidentReportCommand)
export class RemoveCategoriesFromIncidentReportHandler implements ICommandHandler<RemoveCategoriesFromIncidentReportCommand> {
  private readonly logger = new Logger(RemoveCategoriesFromIncidentReportHandler.name);

  constructor(
    private readonly incidentReportCategoryService: ResourcesIncidentReportCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: RemoveCategoriesFromIncidentReportCommand): Promise<void> {
    const { incidentReportId, dto, removedBy } = command;

    this.logger.log(`Executing RemoveCategoriesFromIncidentReportCommand for incident report: ${incidentReportId}`);
    
    this.loggingService.log(
      'Starting categories removal from incident report',
      RemoveCategoriesFromIncidentReportHandler.name
    );

    try {
      await this.incidentReportCategoryService.removeCategoriesFromIncidentReport(incidentReportId, dto, removedBy);

      this.loggingService.log(
        'Categories removed from incident report successfully',
        RemoveCategoriesFromIncidentReportHandler.name
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to remove categories from incident report',
        error,
        RemoveCategoriesFromIncidentReportHandler.name
      );
      throw error;
    }
  }
}
