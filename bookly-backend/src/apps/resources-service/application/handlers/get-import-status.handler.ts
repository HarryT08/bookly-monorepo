import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GetImportStatusQuery,
  GetImportByIdQuery,
  GetImportsByUserQuery,
  GetImportsQuery,
  GetImportStatisticsQuery,
  GetImportHistoryQuery,
  GetImportTemplateQuery
} from '@apps/resources-service/application/queries/get-import-status.query';
import { ResourceImportService } from '@apps/resources-service/application/services/resource-import.service';
import { ResourceImportResponseDto } from '@apps/resources-service/application/dtos/resource-import.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@QueryHandler(GetImportStatusQuery)
export class GetImportStatusHandler implements IQueryHandler<GetImportStatusQuery> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetImportStatusQuery): Promise<any> {
    try {
      this.logger.log(
        'Executing get import status query',
        `GetImportStatusHandler - importId: ${query.importId}`,
        'GetImportStatusHandler'
      );

      return await this.resourceImportService.getImportById(query.importId);
    } catch (error) {
      this.logger.error(
        `Failed to get import status: ${error.message}`,
        error.stack,
        'GetImportStatusHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetImportHistoryQuery)
export class GetImportHistoryHandler implements IQueryHandler<GetImportHistoryQuery> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetImportHistoryQuery): Promise<any> {
    try {
      this.logger.log(
        'Executing get import history query',
        `GetImportHistoryHandler - page: ${query.page}, limit: ${query.limit}`,
        'GetImportHistoryHandler'
      );

      return await this.resourceImportService.getImports(query.page, query.limit, { userId: query.userId });
    } catch (error) {
      this.logger.error(
        `Failed to get import history: ${error.message}`,
        error.stack,
        'GetImportHistoryHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetImportTemplateQuery)
export class GetImportTemplateHandler implements IQueryHandler<GetImportTemplateQuery> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetImportTemplateQuery): Promise<any> {
    try {
      this.logger.log(
        'Executing get import template query',
        'GetImportTemplateHandler',
        'GetImportTemplateHandler'
      );

      return await this.resourceImportService.getImportTemplate();
    } catch (error) {
      this.logger.error(
        `Failed to get import template: ${error.message}`,
        error.stack,
        'GetImportTemplateHandler'
      );
      throw error;
    }
  }
}
