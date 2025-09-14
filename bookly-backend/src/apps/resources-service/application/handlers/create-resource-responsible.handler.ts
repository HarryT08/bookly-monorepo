import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { 
  AssignResourceResponsibleCommand,
  CreateResourceResponsibleCommand,
  UpdateResourceResponsibleCommand,
  DeleteResourceResponsibleCommand,
  RemoveResourceResponsibleCommand,
  AssignMultipleResourceResponsibleCommand,
  ReplaceResourceResponsiblesCommand,
  DeactivateAllResourceResponsiblesCommand
} from '@apps/resources-service/application/commands/create-resource-responsible.command';
import { 
  GetResourceResponsiblesQuery,
  GetUserResponsibilitiesQuery,
  GetResponsibilitiesQuery,
  CheckResourceResponsibleQuery 
} from '@apps/resources-service/application/queries/get-resource-responsible.query';

/**
 * Handler for Assign Resource Responsible Command
 */
@CommandHandler(AssignResourceResponsibleCommand)
export class AssignResourceResponsibleHandler implements ICommandHandler<AssignResourceResponsibleCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: AssignResourceResponsibleCommand): Promise<any> {
    try {
      this.loggingService.debug('Executing AssignResourceResponsibleCommand', {
        resourceId: command.resourceId,
        userId: command.userId
      });

      return await this.resourceResponsibleService.assignResponsible({
        resourceId: command.resourceId,
        userId: command.userId,
        assignedBy: command.assignedBy
      });
    } catch (error) {
      this.loggingService.error('Error executing AssignResourceResponsibleCommand', error);
      throw error;
    }
  }
}

/**
 * Handler for Remove Resource Responsible Command
 */
@CommandHandler(RemoveResourceResponsibleCommand)
export class RemoveResourceResponsibleHandler implements ICommandHandler<RemoveResourceResponsibleCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: RemoveResourceResponsibleCommand): Promise<any> {
    try {
      this.loggingService.debug('Executing RemoveResourceResponsibleCommand', {
        resourceId: command.resourceId,
        userId: command.userId
      });

      return await this.resourceResponsibleService.deactivateResponsible({
        resourceId: command.resourceId,
        userId: command.userId
      });
    } catch (error) {
      this.loggingService.error('Error executing RemoveResourceResponsibleCommand', error);
      throw error;
    }
  }
}

/**
 * Handler for Assign Multiple Resource Responsible Command
 */
@CommandHandler(AssignMultipleResourceResponsibleCommand)
export class AssignMultipleResourceResponsibleHandler implements ICommandHandler<AssignMultipleResourceResponsibleCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: AssignMultipleResourceResponsibleCommand): Promise<any> {
    try {
      this.loggingService.debug('Executing AssignMultipleResourceResponsibleCommand', {
        resourceId: command.resourceId,
        userIds: command.userIds
      });

      return await this.resourceResponsibleService.assignMultipleResponsibles({
        resourceId: command.resourceId,
        userIds: command.userIds,
        assignedBy: command.assignedBy
      });
    } catch (error) {
      this.loggingService.error('Error executing AssignMultipleResourceResponsibleCommand', error);
      throw error;
    }
  }
}

/**
 * Handler for Replace Resource Responsibles Command
 */
@CommandHandler(ReplaceResourceResponsiblesCommand)
export class ReplaceResourceResponsiblesHandler implements ICommandHandler<ReplaceResourceResponsiblesCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: ReplaceResourceResponsiblesCommand): Promise<any> {
    try {
      this.loggingService.debug('Executing ReplaceResourceResponsiblesCommand', {
        resourceId: command.resourceId,
        userIds: command.userIds
      });

      return await this.resourceResponsibleService.replaceResourceResponsibles({
        resourceId: command.resourceId,
        userIds: command.userIds,
        assignedBy: command.replacedBy
      });
    } catch (error) {
      this.loggingService.error('Error executing ReplaceResourceResponsiblesCommand', error);
      throw error;
    }
  }
}

/**
 * Handler for Deactivate All Resource Responsibles Command
 */
@CommandHandler(DeactivateAllResourceResponsiblesCommand)
export class DeactivateAllResourceResponsiblesHandler implements ICommandHandler<DeactivateAllResourceResponsiblesCommand> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: DeactivateAllResourceResponsiblesCommand): Promise<void> {
    try {
      this.loggingService.debug('Executing DeactivateAllResourceResponsiblesCommand', {
        resourceId: command.resourceId
      });

      await this.resourceResponsibleService.deactivateAllResourceResponsibles(
        command.resourceId
      );
    } catch (error) {
      this.loggingService.error('Error executing DeactivateAllResourceResponsiblesCommand', error);
      throw error;
    }
  }
}

/**
 * Handler for Get Resource Responsibles Query
 */
@QueryHandler(GetResourceResponsiblesQuery)
export class GetResourceResponsiblesHandler implements IQueryHandler<GetResourceResponsiblesQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetResourceResponsiblesQuery): Promise<any> {
    try {
      this.loggingService.debug('Executing GetResourceResponsiblesQuery', {
        resourceId: query.resourceId,
        page: query.page,
        limit: query.limit
      });

      return await this.resourceResponsibleService.getResourceResponsibles({
        resourceId: query.resourceId,
        activeOnly: true
      });
    } catch (error) {
      this.loggingService.error('Error executing GetResourceResponsiblesQuery', error);
      throw error;
    }
  }
}

/**
 * Handler for Get User Responsibilities Query
 */
@QueryHandler(GetUserResponsibilitiesQuery)
export class GetUserResponsibilitiesHandler implements IQueryHandler<GetUserResponsibilitiesQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetUserResponsibilitiesQuery): Promise<any> {
    try {
      this.loggingService.debug('Executing GetUserResponsibilitiesQuery', {
        userId: query.userId,
        page: query.page,
        limit: query.limit
      });

      return await this.resourceResponsibleService.getUserResponsibilities({
        userId: query.userId,
        activeOnly: true
      });
    } catch (error) {
      this.loggingService.error('Error executing GetUserResponsibilitiesQuery', error);
      throw error;
    }
  }
}

/**
 * Handler for Get Responsibilities Query
 */
@QueryHandler(GetResponsibilitiesQuery)
export class GetResponsibilitiesHandler implements IQueryHandler<GetResponsibilitiesQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetResponsibilitiesQuery): Promise<any> {
    try {
      this.loggingService.debug('Executing GetResponsibilitiesQuery', {
        page: query.page,
        limit: query.limit,
        resourceId: query.resourceId,
        userId: query.userId
      });

      return await this.resourceResponsibleService.getResponsibilities({
        page: query.page,
        limit: query.limit,
        resourceId: query.resourceId,
        userId: query.userId,
        isActive: query.isActive
      });
    } catch (error) {
      this.loggingService.error('Error executing GetResponsibilitiesQuery', error);
      throw error;
    }
  }
}

/**
 * Handler for Check Resource Responsible Query
 */
@QueryHandler(CheckResourceResponsibleQuery)
export class CheckResourceResponsibleHandler implements IQueryHandler<CheckResourceResponsibleQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: CheckResourceResponsibleQuery): Promise<any> {
    try {
      this.loggingService.debug('Executing CheckResourceResponsibleQuery', {
        resourceId: query.resourceId,
        userId: query.userId
      });

      return await this.resourceResponsibleService.isUserResponsibleForResource({
        resourceId: query.resourceId,
        userId: query.userId
      });
    } catch (error) {
      this.loggingService.error('Error executing CheckResourceResponsibleQuery', error);
      throw error;
    }
  }
}
