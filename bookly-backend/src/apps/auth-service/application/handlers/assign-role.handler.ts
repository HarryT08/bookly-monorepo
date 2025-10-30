import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleCommand } from '../commands/assign-role.command';
import { UserService } from '../services/user.service';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { RoleAssignedEvent } from '@apps/auth-service/domain/events';
import { AssignRoleToUserDto } from '@libs/dto';

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(command: AssignRoleCommand): Promise<{ success: boolean; message: string }> {
    const { userId, roleId, assignedBy } = command;
    const actualAssignedBy = assignedBy; // Use provided assignedBy or default to 'system' for seeds

    try {
      this.loggingService.log(`Assigning role to user: ${userId}`, 'AssignRoleHandler');

      // Delegate business logic to service
      await this.userService.assignRole(userId, roleId, actualAssignedBy);
      
      // Publish RoleAssignedEvent
      const roleAssignedEvent = new RoleAssignedEvent(
        `${userId}-${roleId}`,
        {
          userId,
          roleId,
          roleName: 'Role', // TODO: Get actual role name from service
          assignedBy: actualAssignedBy,
          timestamp: new Date(),
        },
        actualAssignedBy
      );
      
      await this.eventBusService.publishEvent(roleAssignedEvent);
      
      this.loggingService.log(`Role assigned successfully: ${userId} -> ${roleId}`, 'AssignRoleHandler');
      this.monitoringService.captureMessage(`Role assigned to user ${userId}`, 'info');
      
      return {
        success: true,
        message: 'Role assigned successfully'
      };
    } catch (error) {
      this.loggingService.error(`Failed to assign role: ${error.message}`, error, 'AssignRoleHandler');
      this.monitoringService.captureException(error, { userId, roleId, command: 'AssignRoleCommand' });
      throw error;
    }
  }
}
