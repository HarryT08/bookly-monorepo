/**
 * Generate Usage Report Command
 */

import { ICommand } from '@nestjs/cqrs';
import { GenerateUsageReportDto } from '@libs/dto';

export class GenerateUsageReportCommand implements ICommand {
  constructor(
    public readonly generateUsageReportDto: GenerateUsageReportDto,
  ) {}
}
