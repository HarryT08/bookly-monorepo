import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordResetRequestCommand } from '../commands/password-reset-request.command';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '@libs/logging/logging.service';
import { ResponseUtil } from '@libs/common/utils/response.util';

/**
 * Password Reset Request Handler
 * Handles password reset request command by initiating reset process
 */
@Injectable()
@CommandHandler(PasswordResetRequestCommand)
export class PasswordResetRequestHandler implements ICommandHandler<PasswordResetRequestCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: PasswordResetRequestCommand): Promise<any> {
    const { passwordResetRequestDto } = command;
    
    this.loggingService.log(
      'Password reset request initiated',
      { email: passwordResetRequestDto.email },
      'PasswordResetRequestHandler'
    );

    try {
      const result = await this.authService.requestPasswordReset(passwordResetRequestDto);

      this.loggingService.log(
        'Password reset request completed successfully',
        { email: passwordResetRequestDto.email },
        'PasswordResetRequestHandler'
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to process password reset request',
        error,
        'PasswordResetRequestHandler'
      );
      throw error;
    }
  }
}
