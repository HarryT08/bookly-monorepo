import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { RemoveResourceResponsibleCommand } from '@apps/resources-service/application/commands/remove-resource-responsible.command';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(RemoveResourceResponsibleCommand)
export class RemoveResourceResponsibleHandler implements ICommandHandler<RemoveResourceResponsibleCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: RemoveResourceResponsibleCommand): Promise<void> {
    try {
      this.logger.log(
        'Executing remove resource responsible command',
        `RemoveResourceResponsibleHandler - resourceId: ${command.resourceId}, userId: ${command.userId}`,
        'RemoveResourceResponsibleHandler'
      );

      await this.resourceResponsibleService.deactivateResponsible({
        resourceId: command.resourceId,
        userId: command.userId
      });
    } catch (error) {
      this.logger.error(
        `Failed to remove resource responsible: ${error.message}`,
        error.stack,
        'RemoveResourceResponsibleHandler'
      );
      throw error;
    }
  }
}
