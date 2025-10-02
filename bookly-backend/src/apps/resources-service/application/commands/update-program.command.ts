import { ICommand } from '@nestjs/cqrs';
import { UpdateProgramDto } from '@apps/resources-service/application/dtos/program.dto';

/**
 * Update Program Command Data Interface
 */
export interface UpdateProgramCommandData extends UpdateProgramDto {
  readonly id: string;
  readonly updatedBy: string;
}

/**
 * Update Program Command
 * Implements RF-02 (program management)
 */
export class UpdateProgramCommand implements ICommand {
  constructor(
    public readonly data: UpdateProgramCommandData
  ) {}
}
