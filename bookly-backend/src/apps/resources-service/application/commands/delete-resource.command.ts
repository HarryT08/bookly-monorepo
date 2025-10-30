import { ICommand } from '@nestjs/cqrs';

/**
 * Delete Resource Command Data Interface
 */
export interface DeleteResourceCommandData {
  readonly id: string;
  readonly deletedBy: string;
  readonly force?: boolean;
}

/**
 * Delete Resource Command
 * Implements RF-01 (delete resource)
 * Uses standardized DTO for type safety and validation
 */
export class DeleteResourceCommand implements ICommand {
  constructor(
    public readonly data: DeleteResourceCommandData
  ) {}
}
