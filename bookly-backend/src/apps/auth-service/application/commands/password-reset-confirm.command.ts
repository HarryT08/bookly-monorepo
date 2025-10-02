import { ICommand } from '@nestjs/cqrs';
import { PasswordResetConfirmDto } from '@libs/dto/auth/auth-requests.dto';

/**
 * Password Reset Confirm Command
 * Confirms password reset using token and sets new password
 */
export class PasswordResetConfirmCommand implements ICommand {
  constructor(
    public readonly passwordResetConfirmDto: PasswordResetConfirmDto,
  ) {}
}
