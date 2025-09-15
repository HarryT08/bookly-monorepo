import { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly data: {
      email?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    },
    public readonly updatedBy?: string
  ) {}
}
