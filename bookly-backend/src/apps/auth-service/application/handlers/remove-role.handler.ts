import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveRoleCommand } from '../commands/remove-role.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<RemoveRoleCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: RemoveRoleCommand): Promise<{ success: boolean; message: string }> {
    const { userId, roleId, removedBy } = command;

    try {
      this.loggingService.log(`Removing role from user: ${userId} by ${removedBy || 'system'}`, 'RemoveRoleHandler');
      
      await this.userService.removeRole(userId, roleId, removedBy);
      
      this.loggingService.log(`Role removed successfully: ${userId} -> ${roleId} by ${removedBy}`, 'RemoveRoleHandler');
      this.monitoringService.captureMessage(`Role removed from user ${userId}`, 'info');
      
      return {
        success: true,
        message: 'Role removed successfully'
      };
    } catch (error) {
      this.loggingService.error(`Failed to remove role: ${error.message}`, error, 'RemoveRoleHandler');
      this.monitoringService.captureException(error, { userId, roleId, removedBy, command: 'RemoveRoleCommand' });
      throw error;
    }
  }
}
