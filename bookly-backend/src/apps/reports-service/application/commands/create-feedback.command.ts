/**
 * Create Feedback Command
 */

import { ICommand } from '@nestjs/cqrs';
import { CreateFeedbackDto } from '@libs/dto';

export class CreateFeedbackCommand implements ICommand {
  constructor(
    public readonly createFeedbackDto: CreateFeedbackDto,
    public readonly createdBy: string,
  ) {}
}
