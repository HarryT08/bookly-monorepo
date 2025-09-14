/**
 * Generate User Report Command
 */

import { ICommand } from '@nestjs/cqrs';
import { GenerateUserReportDto } from '@libs/dto';

export class GenerateUserReportCommand implements ICommand {
  constructor(
    public readonly generateUserReportDto: GenerateUserReportDto,
  ) {}
}
