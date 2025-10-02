/**
 * Delete Category Command
 * 
 * Command for deactivating a category in the resources service.
 */
export class DeleteCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
