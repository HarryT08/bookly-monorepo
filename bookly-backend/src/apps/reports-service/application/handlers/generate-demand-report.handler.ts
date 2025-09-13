import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { GenerateDemandReportCommand } from '../commands/generate-demand-report.command';
import { GeneratedReportsRepository } from '../../domain/repositories/generated-reports.repository';

/**
 * Generate Demand Report Command Handler
 * Implements RF-37 (demand insatisfecha reports)
 */
@Injectable()
@CommandHandler(GenerateDemandReportCommand)
export class GenerateDemandReportHandler implements ICommandHandler<GenerateDemandReportCommand> {
  constructor(
    @Inject('GeneratedReportsRepository')
    private readonly generatedReportsRepository: GeneratedReportsRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: GenerateDemandReportCommand): Promise<any> {
    this.loggingService.log(
      'Generating demand report',
      `GenerateDemandReportHandler - period: ${command.startDate} to ${command.endDate}`,
      'GenerateDemandReportHandler'
    );

    try {
      const reportData = {
        type: 'DEMAND_REPORT',
        filters: {
          startDate: command.startDate,
          endDate: command.endDate,
          resourceTypes: command.resourceTypes,
          programIds: command.programIds,
        },
        status: 'GENERATING',
        createdAt: new Date(),
      };

      // For now, create a simple report object until proper repository method is implemented
      const report = {
        id: Date.now().toString(),
        ...reportData,
      };

      // Publish domain event to trigger async report generation
      this.eventBus.publish({
        type: 'DemandReportRequested',
        reportId: report.id,
        filters: reportData.filters,
        timestamp: new Date(),
      });

      this.loggingService.log(
        'Demand report generation initiated',
        `GenerateDemandReportHandler - reportId: ${report.id}`,
        'GenerateDemandReportHandler'
      );

      return report;
    } catch (error) {
      this.loggingService.error(
        `Failed to generate demand report: ${error.message}`,
        error.stack,
        'GenerateDemandReportHandler'
      );
      throw error;
    }
  }
}
