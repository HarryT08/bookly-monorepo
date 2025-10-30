import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GetMaintenanceTypeQuery,
  GetMaintenanceTypeByCodeQuery,
  GetMaintenanceTypesQuery,
  GetActiveMaintenanceTypesQuery
} from '@apps/resources-service/application/queries/get-maintenance-type.query';
import { MaintenanceTypeService } from '@apps/resources-service/application/services/maintenance-type.service';
import { MaintenanceTypeResponseDto } from '@apps/resources-service/application/dtos/maintenance-type.dto';
import { LoggingService } from '@libs/logging/logging.service';

@Injectable()
@QueryHandler(GetMaintenanceTypeQuery)
export class GetMaintenanceTypeHandler implements IQueryHandler<GetMaintenanceTypeQuery> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetMaintenanceTypeQuery): Promise<MaintenanceTypeResponseDto> {
    try {
      this.logger.log(
        'Executing get maintenance type query',
        `GetMaintenanceTypeHandler - id: ${query.id}`,
        'GetMaintenanceTypeHandler'
      );

      return await this.maintenanceTypeService.getMaintenanceTypeById(query.id);
    } catch (error) {
      this.logger.error(
        `Failed to get maintenance type: ${error.message}`,
        error.stack,
        'GetMaintenanceTypeHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetMaintenanceTypeByCodeQuery)
export class GetMaintenanceTypeByCodeHandler implements IQueryHandler<GetMaintenanceTypeByCodeQuery> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetMaintenanceTypeByCodeQuery): Promise<MaintenanceTypeResponseDto> {
    try {
      this.logger.log(
        'Executing get maintenance type by code query',
        `GetMaintenanceTypeByCodeHandler - code: ${query.code}`,
        'GetMaintenanceTypeByCodeHandler'
      );

      const result = await this.maintenanceTypeService.getMaintenanceTypeByName(query.code);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get maintenance type by code: ${error.message}`,
        error.stack,
        'GetMaintenanceTypeByCodeHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetMaintenanceTypesQuery)
export class GetMaintenanceTypesHandler implements IQueryHandler<GetMaintenanceTypesQuery> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetMaintenanceTypesQuery): Promise<{ maintenanceTypes: MaintenanceTypeResponseDto[]; total: number }> {
    try {
      this.logger.log(
        'Executing get maintenance types query',
        `GetMaintenanceTypesHandler - page: ${query.page}, limit: ${query.limit}`,
        'GetMaintenanceTypesHandler'
      );

      const types = query.isActive 
      ? await this.maintenanceTypeService.getActiveMaintenanceTypes()
      : await this.maintenanceTypeService.getAllMaintenanceTypes();
      const result = {
        maintenanceTypes: types,
        total: types.length
      };
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get maintenance types: ${error.message}`,
        error.stack,
        'GetMaintenanceTypesHandler'
      );
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetActiveMaintenanceTypesQuery)
export class GetActiveMaintenanceTypesHandler implements IQueryHandler<GetActiveMaintenanceTypesQuery> {
  constructor(
    private readonly maintenanceTypeService: MaintenanceTypeService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetActiveMaintenanceTypesQuery): Promise<MaintenanceTypeResponseDto[]> {
    try {
      this.logger.log(
        'Executing get active maintenance types query',
        'GetActiveMaintenanceTypesHandler',
        'GetActiveMaintenanceTypesHandler'
      );

      const types = await this.maintenanceTypeService.getActiveMaintenanceTypes();
      const result = {
        maintenanceTypes: types,
        total: types.length
      };
      return result.maintenanceTypes;
    } catch (error) {
      this.logger.error(
        `Failed to get active maintenance types: ${error.message}`,
        error.stack,
        'GetActiveMaintenanceTypesHandler'
      );
      throw error;
    }
  }
}
