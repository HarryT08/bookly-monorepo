/**
 * Generate User Report Command
 */

import { ICommand } from '@nestjs/cqrs';

export class GenerateUserReportCommand implements ICommand {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly filters?: Record<string, unknown>,
  ) {}
}
