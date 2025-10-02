/**
 * Get Feedback Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetFeedbackQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
