import { ICommand } from '@bookly-monorepo/common';
import { LoginDto } from '@bookly-monorepo/dto';

/**
 * Comando para iniciar sesión de un usuario
 */
export class LoginUserCommand implements ICommand {
  readonly type = 'auth.loginUser';
  
  constructor(
    public readonly credentials: LoginDto,
  ) {}
}
