import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/update-user.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';
import { AuthHandlerUtil } from '../utils/auth-handler.util';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<any> {
    const { id, data, updatedBy } = command;

    return AuthHandlerUtil.executeWithLogging(
      () => this.userService.update(id, data, updatedBy),
      {
        operationName: 'Update user',
        handlerName: 'UpdateUserHandler',
        loggingService: this.loggingService,
        monitoringService: this.monitoringService,
        entityId: id,
        metadata: { command: 'UpdateUserCommand', userId: id, updatedBy }
      }
    );
  }
}
