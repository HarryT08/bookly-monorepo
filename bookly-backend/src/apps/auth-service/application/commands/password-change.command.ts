import { ICommand } from '@nestjs/cqrs';
import { PasswordChangeDto } from '@libs/dto/auth/auth-requests.dto';

/**
 * Password Change Command
 * Allows authenticated user to change their password
 */
export class PasswordChangeCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly passwordChangeDto: PasswordChangeDto,
  ) {}
}
