/**
 * Generate Usage Report Command
 */

import { ICommand } from '@nestjs/cqrs';

export class GenerateUsageReportCommand implements ICommand {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly resourceIds?: string[],
    public readonly programIds?: string[],
    public readonly includeDetails?: boolean,
  ) {}
}
