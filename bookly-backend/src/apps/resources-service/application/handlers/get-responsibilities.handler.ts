import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetResponsibilitiesQuery } from '@apps/resources-service/application/queries/get-responsibilities.query';
import { ResourceResponsibleService } from '@apps/resources-service/application/services/resource-responsible.service';
import { ResourceResponsibleResponseDto } from '@libs/dto/resources/resource-responsible.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@QueryHandler(GetResponsibilitiesQuery)
export class GetResponsibilitiesHandler implements IQueryHandler<GetResponsibilitiesQuery> {
  constructor(
    private readonly resourceResponsibleService: ResourceResponsibleService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResponsibilitiesQuery): Promise<{ 
    responsibles: ResourceResponsibleResponseDto[]; 
    total: number; 
    page: number; 
    limit: number; 
  }> {
    try {
      this.logger.log(
        'Executing get responsibilities query',
        `GetResponsibilitiesHandler - page: ${query.page}, limit: ${query.limit}`,
        'GetResponsibilitiesHandler'
      );

      return await this.resourceResponsibleService.getResponsibilities({
        page: query.page,
        limit: query.limit,
        resourceId: query.resourceId,
        userId: query.userId,
        isActive: query.isActive
      });
    } catch (error) {
      this.logger.error(
        `Failed to get responsibilities: ${error.message}`,
        error.stack,
        'GetResponsibilitiesHandler'
      );
      throw error;
    }
  }
}
