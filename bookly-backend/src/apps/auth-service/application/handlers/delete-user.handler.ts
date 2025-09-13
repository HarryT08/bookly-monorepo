import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { id } = command;

    this.loggingService.log(
      'Deleting user',
      `DeleteUserHandler - userId: ${id}`,
      'DeleteUserHandler'
    );

    try {
      await this.userService.delete(id);
      
      this.loggingService.log(
        'User deleted successfully',
        `DeleteUserHandler - userId: ${id}`,
        'DeleteUserHandler'
      );
    } catch (error) {
      this.loggingService.error(
        `Failed to delete user: ${error.message}`,
        error.stack,
        'DeleteUserHandler'
      );
      throw error;
    }
  }
}
