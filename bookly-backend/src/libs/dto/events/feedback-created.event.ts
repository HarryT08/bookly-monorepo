import { IEvent } from '@nestjs/cqrs';

/**
 * Feedback Created Domain Event
 * Published when user feedback is successfully created (RF-34)
 */
export class FeedbackCreatedEvent implements IEvent {
  constructor(
    public readonly feedbackId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly rating: number,
    public readonly timestamp: Date,
  ) {}
}
