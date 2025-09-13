import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { GenerateUsageReportCommand } from '../commands/generate-usage-report.command';
import { GeneratedReportsRepository } from '../../domain/repositories/generated-reports.repository';

/**
 * Generate Usage Report Command Handler
 * Implements RF-31 (usage reports by resource/program/period)
 */
@Injectable()
@CommandHandler(GenerateUsageReportCommand)
export class GenerateUsageReportHandler implements ICommandHandler<GenerateUsageReportCommand> {
  constructor(
    @Inject('GeneratedReportsRepository')
    private readonly generatedReportsRepository: GeneratedReportsRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: GenerateUsageReportCommand): Promise<any> {
    this.loggingService.log(
      'Generating usage report',
      `GenerateUsageReportHandler - period: ${command.startDate} to ${command.endDate}`,
      'GenerateUsageReportHandler'
    );

    try {
      const reportData = {
        type: 'USAGE_REPORT',
        filters: {
          startDate: command.startDate,
          endDate: command.endDate,
          resourceIds: command.resourceIds,
          programIds: command.programIds,
          includeDetails: command.includeDetails,
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
        type: 'UsageReportRequested',
        reportId: report.id,
        filters: reportData.filters,
        timestamp: new Date(),
      });

      this.loggingService.log(
        'Usage report generation initiated',
        `GenerateUsageReportHandler - reportId: ${report.id}`,
        'GenerateUsageReportHandler'
      );

      return report;
    } catch (error) {
      this.loggingService.error(
        `Failed to generate usage report: ${error.message}`,
        error.stack,
        'GenerateUsageReportHandler'
      );
      throw error;
    }
  }
}
