import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GetResourceResponsiblesQuery, 
  GetUserResponsibilitiesQuery,
  CheckResourceResponsibleQuery 
} from '@apps/resources-service/application/queries/get-resource-responsible.query';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { ResourceResponsibleResponseDto } from '@libs/dto/resources/resource-responsible.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@QueryHandler(GetResourceResponsiblesQuery)
export class GetResourceResponsiblesHandler implements IQueryHandler<GetResourceResponsiblesQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourceResponsiblesQuery): Promise<{ responsibles: ResourceResponsibleResponseDto[]; total: number; page: number; limit: number }> {
    try {
      this.logger.log(
        'Executing get resource responsibles query',
        `GetResourceResponsiblesHandler - resourceId: ${query.resourceId}`,
        'GetResourceResponsiblesHandler'
      );

      const result = await this.resourceResponsibleService.getResourceResponsibles({
        resourceId: query.resourceId,
        activeOnly: true
      });
      return {
        responsibles: result,
        total: result.length,
        page: query.page,
        limit: query.limit
      };
    } catch (error) {
      this.logger.error(
        `Failed to get resource responsibles: ${error.message}`,
        error.stack,
        'GetResourceResponsiblesHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserResponsibilitiesQuery)
export class GetUserResponsibilitiesHandler implements IQueryHandler<GetUserResponsibilitiesQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetUserResponsibilitiesQuery): Promise<{ responsibilities: ResourceResponsibleResponseDto[]; total: number; page: number; limit: number }> {
    try {
      this.logger.log(
        'Executing get user responsibilities query',
        `GetUserResponsibilitiesHandler - userId: ${query.userId}`,
        'GetUserResponsibilitiesHandler'
      );

      const result = await this.resourceResponsibleService.getUserResponsibilities({
        userId: query.userId,
        activeOnly: true
      });
      return {
        responsibilities: result,
        total: result.length,
        page: query.page,
        limit: query.limit
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user responsibilities: ${error.message}`,
        error.stack,
        'GetUserResponsibilitiesHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(CheckResourceResponsibleQuery)
export class CheckResourceResponsibleHandler implements IQueryHandler<CheckResourceResponsibleQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: CheckResourceResponsibleQuery): Promise<{ exists: boolean }> {
    try {
      this.logger.log(
        'Executing check resource responsible query',
        `CheckResourceResponsibleHandler - resourceId: ${query.resourceId}, userId: ${query.userId}`,
        'CheckResourceResponsibleHandler'
      );

      const exists = await this.resourceResponsibleService.isUserResponsibleForResource({
        resourceId: query.resourceId,
        userId: query.userId
      });
      return { exists };
    } catch (error) {
      this.logger.error(
        `Failed to check resource responsible: ${error.message}`,
        error.stack,
        'CheckResourceResponsibleHandler'
      );
      throw error;
    }
  }
}
