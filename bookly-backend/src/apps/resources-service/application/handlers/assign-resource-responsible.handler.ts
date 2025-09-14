import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { AssignResourceResponsibleCommand } from '@apps/resources-service/application/commands/assign-resource-responsible.command';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { ResourceResponsibleResponseDto } from '@libs/dto/resources/resource-responsible.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(AssignResourceResponsibleCommand)
export class AssignResourceResponsibleHandler implements ICommandHandler<AssignResourceResponsibleCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: AssignResourceResponsibleCommand): Promise<ResourceResponsibleResponseDto> {
    try {
      this.logger.log(
        'Executing assign resource responsible command',
        `AssignResourceResponsibleHandler - resourceId: ${command.resourceId}, userId: ${command.userId}`,
        'AssignResourceResponsibleHandler'
      );

      return await this.resourceResponsibleService.assignResponsible({
        resourceId: command.resourceId,
        userId: command.userId,
        assignedBy: command.assignedBy
      });
    } catch (error) {
      this.logger.error(
        `Failed to assign resource responsible: ${error.message}`,
        error.stack,
        'AssignResourceResponsibleHandler'
      );
      throw error;
    }
  }
}
