/**
 * Create Feedback Command
 */

import { ICommand } from '@nestjs/cqrs';

export class CreateFeedbackCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly reservationId: string,
    public readonly rating: number,
    public readonly comment?: string,
    public readonly category?: string,
  ) {}
}
