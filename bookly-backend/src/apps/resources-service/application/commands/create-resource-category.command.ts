import { ICommand } from '@nestjs/cqrs';

/**
 * Assign Category to Resource Command
 * Implements RF-02 (resource category assignment)
 */
export class AssignCategoryToResourceCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly categoryId: string,
    public readonly assignedBy: string
  ) {}
}

/**
 * Assign Categories to Resource Command
 */
export class AssignCategoriesToResourceCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly categoryIds: string[],
    public readonly assignedBy: string
  ) {}
}
