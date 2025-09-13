import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { CreateFeedbackCommand } from '../commands/create-feedback.command';
import { ReportsRepository } from '../../domain/repositories/reports.repository';

/**
 * Create Feedback Command Handler
 * Implements RF-34 (feedback registration)
 */
@Injectable()
@CommandHandler(CreateFeedbackCommand)
export class CreateFeedbackHandler implements ICommandHandler<CreateFeedbackCommand> {
  constructor(
    @Inject('ReportsRepository')
    private readonly reportsRepository: ReportsRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: CreateFeedbackCommand): Promise<any> {
    this.loggingService.log(
      'Creating user feedback',
      `CreateFeedbackHandler - userId: ${command.userId}, resourceId: ${command.resourceId}`,
      'CreateFeedbackHandler'
    );

    try {
      const feedbackData = {
        userId: command.userId,
        resourceId: command.resourceId,
        reservationId: command.reservationId,
        rating: command.rating,
        comment: command.comment,
        category: command.category,
        createdAt: new Date(),
      };

      // For now, store as a simple object until proper feedback repository method is implemented
      const feedback = {
        id: Date.now().toString(),
        ...feedbackData,
      };

      // Publish domain event
      this.eventBus.publish({
        type: 'FeedbackCreated',
        feedbackId: feedback.id,
        userId: command.userId,
        resourceId: command.resourceId,
        rating: command.rating,
        timestamp: new Date(),
      });

      this.loggingService.log(
        'Feedback created successfully',
        `CreateFeedbackHandler - feedbackId: ${feedback.id}`,
        'CreateFeedbackHandler'
      );

      return feedback;
    } catch (error) {
      this.loggingService.error(
        `Failed to create feedback: ${error.message}`,
        error.stack,
        'CreateFeedbackHandler'
      );
      throw error;
    }
  }
}
