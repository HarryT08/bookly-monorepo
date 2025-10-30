import { ICommand } from '@nestjs/cqrs';

/**
 * Replace Resource Categories Command
 * Replaces all categories for a resource
 */
export class ReplaceResourceCategoriesCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly categoryIds: string[],
    public readonly assignedBy: string
  ) {}
}

/**
 * Remove Category from Resource Command
 */
export class RemoveCategoryFromResourceCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly categoryId: string
  ) {}
}
