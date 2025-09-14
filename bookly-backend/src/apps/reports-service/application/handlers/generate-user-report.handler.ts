import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { ReportsService } from '@apps/reports-service/application/services/reports.service';
import { GenerateUserReportCommand } from '@apps/reports-service/application/commands/generate-user-report.command';
import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

/**
 * Generate User Report Command Handler
 * Implements RF-32 (reports by user/professor)
 */
@Injectable()
@CommandHandler(GenerateUserReportCommand)
export class GenerateUserReportHandler implements ICommandHandler<GenerateUserReportCommand> {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: GenerateUserReportCommand): Promise<any> {
    this.loggingService.log(
      'Executing generate user report command',
      `GenerateUserReportHandler - targetUserId: ${command.generateUserReportDto.userId}`,
      'GenerateUserReportHandler'
    );

    try {
      // Delegate to service
      const report = await this.reportsService.generateUserReport(command.generateUserReportDto);

      // Publish domain event
      const event: DomainEvent = {
        eventId: `user-report-generated-${Date.now()}`,
        eventType: 'UserReportGenerated',
        aggregateId: report.id,
        aggregateType: 'UserReport',
        eventData: {
          reportId: report.id,
          targetUserId: command.generateUserReportDto.userId,
          filters: command.generateUserReportDto,
          generatedAt: new Date(),
        },
        timestamp: new Date(),
        version: 1,
      };

      await this.eventBus.publishEvent(event);

      this.loggingService.log(
        'User report generated successfully',
        `GenerateUserReportHandler - reportId: ${report.id}`,
        'GenerateUserReportHandler'
      );

      return report;
    } catch (error) {
      this.loggingService.error(
        `Failed to generate user report: ${error.message}`,
        error.stack,
        'GenerateUserReportHandler'
      );
      throw error;
    }
  }
}
