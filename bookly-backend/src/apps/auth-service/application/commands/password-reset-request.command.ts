import { ICommand } from '@nestjs/cqrs';
import { PasswordResetRequestDto } from '@libs/dto/auth/auth-requests.dto';

/**
 * Password Reset Request Command
 * Initiates password reset process by sending reset token to user's email
 */
export class PasswordResetRequestCommand implements ICommand {
  constructor(
    public readonly passwordResetRequestDto: PasswordResetRequestDto,
  ) {}
}
