import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { GenerateUserReportCommand } from '../commands/generate-user-report.command';
import { GeneratedReportsRepository } from '../../domain/repositories/generated-reports.repository';

/**
 * Generate User Report Command Handler
 * Implements RF-32 (reports by user/professor)
 */
@Injectable()
@CommandHandler(GenerateUserReportCommand)
export class GenerateUserReportHandler implements ICommandHandler<GenerateUserReportCommand> {
  constructor(
    @Inject('GeneratedReportsRepository')
    private readonly generatedReportsRepository: GeneratedReportsRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: GenerateUserReportCommand): Promise<any> {
    this.loggingService.log(
      'Generating user report',
      `GenerateUserReportHandler - targetUserId: ${command.userId}`,
      'GenerateUserReportHandler'
    );

    try {
      const reportData = {
        type: 'USER_REPORT',
        filters: {
          userId: command.userId,
          startDate: command.startDate,
          endDate: command.endDate,
          ...command.filters,
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
        type: 'UserReportRequested',
        reportId: report.id,
        targetUserId: command.userId,
        filters: reportData.filters,
        timestamp: new Date(),
      });

      this.loggingService.log(
        'User report generation initiated',
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
