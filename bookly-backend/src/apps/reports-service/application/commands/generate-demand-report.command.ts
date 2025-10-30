/**
 * Generate Demand Report Command
 */

import { ICommand } from '@nestjs/cqrs';
import { GenerateDemandReportDto } from '@libs/dto';

export class GenerateDemandReportCommand implements ICommand {
  constructor(
    public readonly generateDemandReportDto: GenerateDemandReportDto,
  ) {}
}
