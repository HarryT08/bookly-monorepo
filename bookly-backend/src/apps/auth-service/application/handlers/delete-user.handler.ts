import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';
import { AuthHandlerUtil } from '../utils/auth-handler.util';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const { id, deletedBy } = command;

    return AuthHandlerUtil.executeWithLogging(
      () => this.userService.delete(id, deletedBy),
      {
        operationName: 'Delete user',
        handlerName: 'DeleteUserHandler',
        loggingService: this.loggingService,
        monitoringService: this.monitoringService,
        entityId: id,
        metadata: { command: 'DeleteUserCommand', userId: id, deletedBy }
      }
    );
  }
}
