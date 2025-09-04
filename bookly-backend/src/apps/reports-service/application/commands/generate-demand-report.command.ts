/**
 * Generate Demand Report Command
 */

import { ICommand } from '@nestjs/cqrs';

export class GenerateDemandReportCommand implements ICommand {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly resourceTypes?: string[],
    public readonly programIds?: string[],
  ) {}
}
