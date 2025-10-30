import { ICommand } from '@nestjs/cqrs';

export class RemoveRoleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly removedBy?: string,
  ) {}
}
