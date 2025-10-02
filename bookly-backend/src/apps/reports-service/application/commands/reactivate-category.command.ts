export class ReactivateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly reactivatedBy?: string,
  ) {}
}
