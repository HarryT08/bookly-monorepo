import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { ReportsService } from '@apps/reports-service/application/services/reports.service';
import { CreateFeedbackCommand } from '@apps/reports-service/application/commands/create-feedback.command';
import { CreateFeedbackDto } from '@libs/dto';
import { DomainEvent } from '@libs/event-bus/services/event-bus.service';

/**
 * Create Feedback Command Handler
 * Implements RF-34 (feedback registration)
 */
@Injectable()
@CommandHandler(CreateFeedbackCommand)
export class CreateFeedbackHandler implements ICommandHandler<CreateFeedbackCommand> {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly eventBus: EventBusService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: CreateFeedbackCommand): Promise<any> {
    this.loggingService.log(
      'Executing create feedback command',
      `CreateFeedbackHandler - userId: ${command.createFeedbackDto.userId}`,
      'CreateFeedbackHandler'
    );

    try {
      // Delegate to service
      const feedback = await this.reportsService.createFeedback(command.createFeedbackDto, command.createdBy);

      // Publish domain event
      const event: DomainEvent = {
        eventId: `feedback-created-${Date.now()}`,
        eventType: 'FeedbackCreated',
        aggregateId: feedback.id,
        aggregateType: 'Feedback',
        eventData: {
          feedbackId: feedback.id,
          userId: command.createFeedbackDto.userId,
          resourceId: command.createFeedbackDto.resourceId,
          rating: command.createFeedbackDto.rating,
        },
        timestamp: new Date(),
        version: 1,
        userId: command.createFeedbackDto.userId,
      };

      await this.eventBus.publishEvent(event);

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
