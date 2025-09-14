import { ICommand } from '@nestjs/cqrs';
import { RegisterDto } from '@libs/dto';

export class RegisterCommand implements ICommand {
  constructor(
    public readonly registerDto: RegisterDto,
  ) {}

  get email(): string {
    return this.registerDto.email;
  }

  get username(): string {
    return this.registerDto.username;
  }

  get password(): string {
    return this.registerDto.password;
  }

  get firstName(): string {
    return this.registerDto.firstName;
  }

  get lastName(): string {
    return this.registerDto.lastName;
  }
}
