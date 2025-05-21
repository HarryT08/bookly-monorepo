import { ICommand } from '@bookly-monorepo/common';
import { CreateUserDto } from '@bookly-monorepo/dto';

/**
 * Comando para registrar un nuevo usuario
 */
export class RegisterUserCommand implements ICommand {
  readonly type = 'auth.registerUser';
  
  constructor(
    public readonly userData: CreateUserDto,
  ) {}
}
