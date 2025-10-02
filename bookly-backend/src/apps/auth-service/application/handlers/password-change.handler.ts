import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordChangeCommand } from '../commands/password-change.command';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '@libs/logging/logging.service';
import { ResponseUtil } from '@libs/common/utils/response.util';

/**
 * Password Change Handler
 * Handles password change for authenticated users
 */
@Injectable()
@CommandHandler(PasswordChangeCommand)
export class PasswordChangeHandler implements ICommandHandler<PasswordChangeCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: PasswordChangeCommand): Promise<any> {
    const { userId, passwordChangeDto } = command;
    
    this.loggingService.log(
      'Password change initiated',
      { userId: userId },
      'PasswordChangeHandler'
    );

    try {
      const result = await this.authService.changePassword(userId, passwordChangeDto);
      
      this.loggingService.log(
        'Password change completed successfully',
        { userId },
        'PasswordChangeHandler'
      );

      return result;
    } catch (error) {
      this.loggingService.error(
        'Failed to change password',
        error,
        'PasswordChangeHandler'
      );
      throw error;
    }
  }
}
