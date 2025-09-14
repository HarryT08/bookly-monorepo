import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { ReportsService } from '@apps/reports-service/application/services/reports.service';
import { GenerateDemandReportCommand } from '@apps/reports-service/application/commands/generate-demand-report.command';
import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

/**
 * Generate Demand Report Command Handler
 * Implements RF-37 (demand insatisfecha reports)
 */
@Injectable()
@CommandHandler(GenerateDemandReportCommand)
export class GenerateDemandReportHandler implements ICommandHandler<GenerateDemandReportCommand> {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: GenerateDemandReportCommand): Promise<any> {
    this.loggingService.log(
      'Executing generate demand report command',
      `GenerateDemandReportHandler - period: ${command.generateDemandReportDto.startDate} to ${command.generateDemandReportDto.endDate}`,
      'GenerateDemandReportHandler'
    );

    try {
      // Delegate to service
      const report = await this.reportsService.generateDemandReport(command.generateDemandReportDto);

      // Publish domain event
      const event: DomainEvent = {
        eventId: `demand-report-generated-${Date.now()}`,
        eventType: 'DemandReportGenerated',
        aggregateId: report.id,
        aggregateType: 'DemandReport',
        eventData: {
          reportId: report.id,
          filters: command.generateDemandReportDto,
          generatedAt: new Date(),
        },
        timestamp: new Date(),
        version: 1,
      };

      await this.eventBus.publishEvent(event);

      this.loggingService.log(
        'Demand report generated successfully',
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
