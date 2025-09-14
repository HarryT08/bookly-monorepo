import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { ReportsService } from '@apps/reports-service/application/services/reports.service';
import { GenerateUsageReportCommand } from '@apps/reports-service/application/commands/generate-usage-report.command';
import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

/**
 * Generate Usage Report Command Handler
 * Implements RF-31 (usage reports by resource/program/period)
 */
@Injectable()
@CommandHandler(GenerateUsageReportCommand)
export class GenerateUsageReportHandler implements ICommandHandler<GenerateUsageReportCommand> {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: GenerateUsageReportCommand): Promise<any> {
    this.loggingService.log(
      'Executing generate usage report command',
      `GenerateUsageReportHandler - period: ${command.generateUsageReportDto.startDate} to ${command.generateUsageReportDto.endDate}`,
      'GenerateUsageReportHandler'
    );

    try {
      // Delegate to service
      const report = await this.reportsService.generateUsageReport(command.generateUsageReportDto);

      // Publish domain event
      const event: DomainEvent = {
        eventId: `usage-report-generated-${Date.now()}`,
        eventType: 'UsageReportGenerated',
        aggregateId: report.id,
        aggregateType: 'UsageReport',
        eventData: {
          reportId: report.id,
          filters: command.generateUsageReportDto,
          generatedAt: new Date(),
        },
        timestamp: new Date(),
        version: 1,
      };

      await this.eventBus.publishEvent(event);

      this.loggingService.log(
        'Usage report generated successfully',
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
