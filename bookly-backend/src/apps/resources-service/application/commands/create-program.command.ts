import { ICommand } from '@nestjs/cqrs';
import { CreateProgramDto } from '@apps/resources-service/application/dtos/program.dto';

/**
 * Create Program Command Data Interface
 */
export interface CreateProgramCommandData extends CreateProgramDto {
  readonly createdBy: string;
}

/**
 * Create Program Command
 * Implements RF-02 (program management)
 */
export class CreateProgramCommand implements ICommand {
  constructor(
    public readonly data: CreateProgramCommandData
  ) {}
}
