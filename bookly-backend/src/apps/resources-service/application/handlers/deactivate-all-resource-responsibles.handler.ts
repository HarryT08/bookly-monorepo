import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeactivateAllResourceResponsiblesCommand } from '@apps/resources-service/application/commands/deactivate-all-resource-responsibles.command';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(DeactivateAllResourceResponsiblesCommand)
export class DeactivateAllResourceResponsiblesHandler implements ICommandHandler<DeactivateAllResourceResponsiblesCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: DeactivateAllResourceResponsiblesCommand): Promise<void> {
    try {
      this.logger.log(
        'Executing deactivate all resource responsibles command',
        `DeactivateAllResourceResponsiblesHandler - resourceId: ${command.resourceId}`,
        'DeactivateAllResourceResponsiblesHandler'
      );

      await this.resourceResponsibleService.deactivateAllResourceResponsibles(command.resourceId);
    } catch (error) {
      this.logger.error(
        `Failed to deactivate all resource responsibles: ${error.message}`,
        error.stack,
        'DeactivateAllResourceResponsiblesHandler'
      );
      throw error;
    }
  }
}
