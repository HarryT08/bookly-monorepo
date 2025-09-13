import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/update-user.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<any> {
    const { id, data } = command;

    this.loggingService.log(
      'Updating user',
      `UpdateUserHandler - userId: ${id}`,
      'UpdateUserHandler'
    );

    try {
      const user = await this.userService.update(id, data);
      
      this.loggingService.log(
        'User updated successfully',
        `UpdateUserHandler - userId: ${id}`,
        'UpdateUserHandler'
      );

      return user;
    } catch (error) {
      this.loggingService.error(
        `Failed to update user: ${error.message}`,
        error.stack,
        'UpdateUserHandler'
      );
      throw error;
    }
  }
}
