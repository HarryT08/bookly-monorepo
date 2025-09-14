import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AssignMultipleResourceResponsibleCommand, ReplaceResourceResponsiblesCommand } from '@apps/resources-service/application/commands/assign-multiple-resource-responsible.command';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { ResourceResponsibleResponseDto } from '@libs/dto/resources/resource-responsible.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(AssignMultipleResourceResponsibleCommand)
export class AssignMultipleResourceResponsibleHandler implements ICommandHandler<AssignMultipleResourceResponsibleCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: AssignMultipleResourceResponsibleCommand): Promise<ResourceResponsibleResponseDto[]> {
    try {
      this.logger.log(
        'Executing assign multiple resource responsible command',
        `AssignMultipleResourceResponsibleHandler - resourceId: ${command.resourceId}`,
        'AssignMultipleResourceResponsibleHandler'
      );

      return await this.resourceResponsibleService.assignMultipleResponsibles({
        resourceId: command.resourceId,
        userIds: command.userIds,
        assignedBy: command.assignedBy
      });
    } catch (error) {
      this.logger.error(
        `Failed to assign multiple resource responsibles: ${error.message}`,
        error.stack,
        'AssignMultipleResourceResponsibleHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ReplaceResourceResponsiblesCommand)
export class ReplaceResourceResponsiblesHandler implements ICommandHandler<ReplaceResourceResponsiblesCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: ReplaceResourceResponsiblesCommand): Promise<ResourceResponsibleResponseDto[]> {
    try {
      this.logger.log(
        'Executing replace resource responsibles command',
        `ReplaceResourceResponsiblesHandler - resourceId: ${command.resourceId}`,
        'ReplaceResourceResponsiblesHandler'
      );

      return await this.resourceResponsibleService.replaceResourceResponsibles({
        resourceId: command.resourceId,
        userIds: command.userIds,
        assignedBy: command.assignedBy
      });
    } catch (error) {
      this.logger.error(
        `Failed to replace resource responsibles: ${error.message}`,
        error.stack,
        'ReplaceResourceResponsiblesHandler'
      );
      throw error;
    }
  }
}
