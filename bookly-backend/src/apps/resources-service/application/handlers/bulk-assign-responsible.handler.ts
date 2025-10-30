import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  BulkAssignResponsibleCommand,
  TransferResponsibilitiesCommand 
} from '@apps/resources-service/application/commands/bulk-assign-responsible.command';
import { ValidateResponsibilityAssignmentQuery } from '@apps/resources-service/application/queries/validate-responsibility-assignment.query';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { ResourceResponsibleResponseDto } from '@libs/dto/resources/resource-responsible.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(BulkAssignResponsibleCommand)
export class BulkAssignResponsibleHandler implements ICommandHandler<BulkAssignResponsibleCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: BulkAssignResponsibleCommand): Promise<any> {
    try {
      this.logger.log(
        'Executing bulk assign responsible command',
        `BulkAssignResponsibleHandler - userId: ${command.data.userId}`,
        'BulkAssignResponsibleHandler'
      );

      return await this.resourceResponsibleService.bulkAssignResponsibleToResources(command.data);
    } catch (error) {
      this.logger.error(
        `Failed to bulk assign responsible: ${error.message}`,
        error.stack,
        'BulkAssignResponsibleHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(TransferResponsibilitiesCommand)
export class TransferResponsibilitiesHandler implements ICommandHandler<TransferResponsibilitiesCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: TransferResponsibilitiesCommand): Promise<any> {
    try {
      this.logger.log(
        'Executing transfer responsibilities command',
        `TransferResponsibilitiesHandler - from: ${command.data.fromUserId} to: ${command.data.toUserId}`,
        'TransferResponsibilitiesHandler'
      );

      return await this.resourceResponsibleService.transferResponsibilities(command.data);
    } catch (error) {
      this.logger.error(
        `Failed to transfer responsibilities: ${error.message}`,
        error.stack,
        'TransferResponsibilitiesHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(ValidateResponsibilityAssignmentQuery)
export class ValidateResponsibilityAssignmentHandler implements IQueryHandler<ValidateResponsibilityAssignmentQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: ValidateResponsibilityAssignmentQuery): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      this.logger.log(
        'Executing validate responsibility assignment query',
        `ValidateResponsibilityAssignmentHandler - resourceId: ${query.resourceId}`,
        'ValidateResponsibilityAssignmentHandler'
      );

      return await this.resourceResponsibleService.validateResponsibilityAssignment(
        query.resourceId,
        query.userIds
      );
    } catch (error) {
      this.logger.error(
        `Failed to validate responsibility assignment: ${error.message}`,
        error.stack,
        'ValidateResponsibilityAssignmentHandler'
      );
      throw error;
    }
  }
}
