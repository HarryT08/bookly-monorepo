import { ICommand } from '@nestjs/cqrs';
import { UpdateResourceDto } from '@libs/dto/resources/update-resource.dto';

/**
 * Update Resource Command Data Interface
 */
export interface UpdateResourceCommandData extends UpdateResourceDto {
  readonly id: string;
  readonly updatedBy: string;
}

/**
 * Update Resource Command
 * Implements RF-01 (edit resource)
 * Uses standardized DTO for type safety and validation
 */
export class UpdateResourceCommand implements ICommand {
  constructor(
    public readonly data: UpdateResourceCommandData
  ) {}
}
