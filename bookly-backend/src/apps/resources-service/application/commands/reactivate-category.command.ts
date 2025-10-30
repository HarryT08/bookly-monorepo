/**
 * Reactivate Category Command
 * 
 * Command for reactivating a deactivated category in the resources service.
 */
export class ReactivateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
