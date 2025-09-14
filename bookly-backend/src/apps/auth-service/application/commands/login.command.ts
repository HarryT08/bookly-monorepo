import { ICommand } from '@nestjs/cqrs';
import { LoginDto } from '@libs/dto';

export class LoginCommand implements ICommand {
  constructor(
    public readonly loginDto: LoginDto,
  ) {}

  get email(): string {
    return this.loginDto.email;
  }

  get password(): string {
    return this.loginDto.password;
  }
}
