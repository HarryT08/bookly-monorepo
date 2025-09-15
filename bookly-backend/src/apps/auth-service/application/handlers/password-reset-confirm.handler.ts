import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordResetConfirmCommand } from '../commands/password-reset-confirm.command';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '@libs/logging/logging.service';
import { ResponseUtil } from '@libs/common/utils/response.util';

/**
 * Password Reset Confirm Handler
 * Handles password reset confirmation using token
 */
@Injectable()
@CommandHandler(PasswordResetConfirmCommand)
export class PasswordResetConfirmHandler implements ICommandHandler<PasswordResetConfirmCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: PasswordResetConfirmCommand): Promise<any> {
    const { passwordResetConfirmDto } = command;
    
    this.loggingService.log(
      'Password reset confirmation initiated',
      { token: passwordResetConfirmDto.token.substring(0, 8) + '...' },
      'PasswordResetConfirmHandler'
    );

    try {
      const result = await this.authService.confirmPasswordReset(passwordResetConfirmDto);
      
      this.loggingService.log(
        'Password reset confirmation completed successfully',
        { token: passwordResetConfirmDto.token.substring(0, 8) + '...' },
        'PasswordResetConfirmHandler'
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to confirm password reset',
        error,
        'PasswordResetConfirmHandler'
      );
      throw error;
    }
  }
}
