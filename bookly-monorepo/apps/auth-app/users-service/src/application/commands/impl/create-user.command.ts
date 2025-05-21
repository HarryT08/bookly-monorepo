import { CreateUserDto } from '@bookly-monorepo/dto';

export class CreateUserCommand {
  constructor(public readonly userData: CreateUserDto) {}
}
