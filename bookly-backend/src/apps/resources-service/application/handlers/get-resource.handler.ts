import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetResourceQuery, GetResourceByCodeQuery } from '@apps/resources-service/application/queries/get-resource.query';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * Get Resource Query Handler
 * Retrieves a single resource by ID
 */
@Injectable()
@QueryHandler(GetResourceQuery)
export class GetResourceHandler implements IQueryHandler<GetResourceQuery> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourceQuery): Promise<ResourceEntity> {
    try {
      this.logger.log(
        'Executing get resource query',
        `GetResourceHandler - id: ${query.id}`,
        'GetResourceHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const resource = await this.resourcesService.findById(query.id);
      
      if (!resource) {
        throw new Error(`Resource with ID ${query.id} not found`);
      }
      
      return resource;
    } catch (error) {
      this.logger.error(
        `Failed to get resource: ${error.message}`,
        error.stack,
        'GetResourceHandler'
      );
      throw error;
    }
  }
}

/**
 * Get Resource by Code Query Handler
 * Retrieves a single resource by unique code
 */
@Injectable()
@QueryHandler(GetResourceByCodeQuery)
export class GetResourceByCodeHandler implements IQueryHandler<GetResourceByCodeQuery> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourceByCodeQuery): Promise<ResourceEntity> {
    try {
      this.logger.log(
        'Executing get resource by code query',
        `GetResourceByCodeHandler - code: ${query.code}`,
        'GetResourceByCodeHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const resource = await this.resourcesService.findByCode(query.code);
      
      if (!resource) {
        throw new Error(`Resource with code ${query.code} not found`);
      }
      
      return resource;
    } catch (error) {
      this.logger.error(
        `Failed to get resource by code: ${error.message}`,
        error.stack,
        'GetResourceByCodeHandler'
      );
      throw error;
    }
  }
}
