import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleCommand } from '../commands/assign-role.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: AssignRoleCommand): Promise<void> {
    const { userId, roleId } = command;

    this.loggingService.log(
      'Assigning role to user',
      `AssignRoleHandler - userId: ${userId}, roleId: ${roleId}`,
      'AssignRoleHandler'
    );

    try {
      await this.userService.assignRole(userId, roleId);
      
      this.loggingService.log(
        'Role assigned successfully',
        `AssignRoleHandler - userId: ${userId}, roleId: ${roleId}`,
        'AssignRoleHandler'
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to assign role: ${error.message}`,
        error.stack,
        'AssignRoleHandler'
      );
      throw error;
    }
  }
}
