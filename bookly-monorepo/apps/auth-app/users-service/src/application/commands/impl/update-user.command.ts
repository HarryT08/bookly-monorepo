import { UpdateUserDto } from '@bookly-monorepo/dto';

export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly userData: UpdateUserDto,
  ) {}
}
