import { QueryHandler, IQueryHandler, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GetImportByIdQuery,
  GetImportsByUserQuery,
  GetImportsQuery,
  GetImportStatisticsQuery
} from '@apps/resources-service/application/queries/get-import-status.query';
import { 
  PreviewImportCommand,
  StartImportCommand
} from '@apps/resources-service/application/commands/import-resources.command';
import { ResourceImportService } from '@apps/resources-service/application/services/resource-import.service';
import { ResourceImportResponseDto, ImportPreviewDto } from '@apps/resources-service/application/dtos/resource-import.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@CommandHandler(PreviewImportCommand)
export class PreviewImportHandler implements ICommandHandler<PreviewImportCommand> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: PreviewImportCommand): Promise<ImportPreviewDto> {
    try {
      this.logger.log(
        'Executing preview import command',
        `PreviewImportHandler - userId: ${command.userId}`,
        'PreviewImportHandler'
      );

      return await this.resourceImportService.previewImport(command.file, command.userId);
    } catch (error) {
      this.logger.error(
        `Failed to preview import: ${error.message}`,
        error.stack,
        'PreviewImportHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(StartImportCommand)
export class StartImportHandler implements ICommandHandler<StartImportCommand> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(command: StartImportCommand): Promise<ResourceImportResponseDto> {
    try {
      this.logger.log(
        'Executing start import command',
        `StartImportHandler - userId: ${command.userId}`,
        'StartImportHandler'
      );

      return await this.resourceImportService.startImport(command.file, command.userId);
    } catch (error) {
      this.logger.error(
        `Failed to start import: ${error.message}`,
        error.stack,
        'StartImportHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetImportByIdQuery)
export class GetImportByIdHandler implements IQueryHandler<GetImportByIdQuery> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetImportByIdQuery): Promise<ResourceImportResponseDto> {
    try {
      this.logger.log(
        'Executing get import by ID query',
        `GetImportByIdHandler - importId: ${query.importId}`,
        'GetImportByIdHandler'
      );

      return await this.resourceImportService.getImportById(query.importId);
    } catch (error) {
      this.logger.error(
        `Failed to get import by ID: ${error.message}`,
        error.stack,
        'GetImportByIdHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetImportsByUserQuery)
export class GetImportsByUserHandler implements IQueryHandler<GetImportsByUserQuery> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetImportsByUserQuery): Promise<ResourceImportResponseDto[]> {
    try {
      this.logger.log(
        'Executing get imports by user query',
        `GetImportsByUserHandler - userId: ${query.userId}`,
        'GetImportsByUserHandler'
      );

      return await this.resourceImportService.getImportsByUser(query.userId);
    } catch (error) {
      this.logger.error(
        `Failed to get imports by user: ${error.message}`,
        error.stack,
        'GetImportsByUserHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetImportsQuery)
export class GetImportsHandler implements IQueryHandler<GetImportsQuery> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetImportsQuery): Promise<{
    imports: ResourceImportResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      this.logger.log(
        'Executing get imports query',
        `GetImportsHandler - page: ${query.page}, limit: ${query.limit}`,
        'GetImportsHandler'
      );

      return await this.resourceImportService.getImports(query.page, query.limit, query.filters);
    } catch (error) {
      this.logger.error(
        `Failed to get imports: ${error.message}`,
        error.stack,
        'GetImportsHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetImportStatisticsQuery)
export class GetImportStatisticsHandler implements IQueryHandler<GetImportStatisticsQuery> {
  constructor(
    private readonly resourceImportService: ResourceImportService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetImportStatisticsQuery): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalResourcesImported: number;
    averageSuccessRate: number;
  }> {
    try {
      this.logger.log(
        'Executing get import statistics query',
        `GetImportStatisticsHandler - userId: ${query.userId}`,
        'GetImportStatisticsHandler'
      );

      return await this.resourceImportService.getImportStatistics(query.userId);
    } catch (error) {
      this.logger.error(
        `Failed to get import statistics: ${error.message}`,
        error.stack,
        'GetImportStatisticsHandler'
      );
      throw error;
    }
  }
}
