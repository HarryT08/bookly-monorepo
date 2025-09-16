import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AssignCategoriesToIncidentReportCommand } from '@apps/resources-service/application/commands/incident-report-category/assign-categories-to-incident-report.command';
import { EntityCategoryAssociationDto } from '@libs/dto/categories';
import { ResourcesIncidentReportCategoryService } from '@apps/resources-service/application/services/resources-incident-report-category.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(AssignCategoriesToIncidentReportCommand)
export class AssignCategoriesToIncidentReportHandler implements ICommandHandler<AssignCategoriesToIncidentReportCommand> {
  private readonly logger = new Logger(AssignCategoriesToIncidentReportHandler.name);

  constructor(
    private readonly incidentReportCategoryService: ResourcesIncidentReportCategoryService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: AssignCategoriesToIncidentReportCommand) {
    const { incidentReportId, dto, assignedBy } = command;

    this.logger.log(`Executing AssignCategoriesToIncidentReportCommand for incident report: ${incidentReportId}`);
    
    this.loggingService.log(
      'Starting categories assignment to incident report',
      AssignCategoriesToIncidentReportHandler.name
    );

    try {
      const result = await this.incidentReportCategoryService.assignCategoriesToIncidentReport(incidentReportId, dto, assignedBy);

      this.loggingService.log(
        'Categories assigned to incident report successfully',
        AssignCategoriesToIncidentReportHandler.name
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to assign categories to incident report',
        error,
        AssignCategoriesToIncidentReportHandler.name
      );
      throw error;
    }
  }
}
