import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveRoleCommand } from '../commands/remove-role.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<RemoveRoleCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: RemoveRoleCommand): Promise<void> {
    const { userId, roleId } = command;

    this.loggingService.log(
      'Removing role from user',
      `RemoveRoleHandler - userId: ${userId}, roleId: ${roleId}`,
      'RemoveRoleHandler'
    );

    try {
      await this.userService.removeRole(userId, roleId);
      
      this.loggingService.log(
        'Role removed successfully',
        `RemoveRoleHandler - userId: ${userId}, roleId: ${roleId}`,
        'RemoveRoleHandler'
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to remove role: ${error.message}`,
        error.stack,
        'RemoveRoleHandler'
      );
      throw error;
    }
  }
}
