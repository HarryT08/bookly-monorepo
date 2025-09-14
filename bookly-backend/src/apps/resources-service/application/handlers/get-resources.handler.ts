import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { 
  GetResourcesQuery, 
  GetResourcesWithPaginationQuery, 
  SearchResourcesQuery,
  CheckResourceAvailabilityQuery 
} from '@apps/resources-service/application/queries/get-resources.query';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { LoggingService } from '@libs/logging/logging.service';

/**
 * Get Resources Query Handler
 * Retrieves multiple resources with optional filters
 */
@Injectable()
@QueryHandler(GetResourcesQuery)
export class GetResourcesHandler implements IQueryHandler<GetResourcesQuery> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourcesQuery): Promise<ResourceEntity[]> {
    try {
      this.logger.log(
        'Executing get resources query',
        'GetResourcesHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const resources = await this.resourcesService.findAll();
      
      return resources;
    } catch (error) {
      this.logger.error(
        `Failed to get resources: ${error.message}`,
        error.stack,
        'GetResourcesHandler'
      );
      throw error;
    }
  }
}

/**
 * Get Resources with Pagination Query Handler
 * Retrieves resources with pagination support
 */
@Injectable()
@QueryHandler(GetResourcesWithPaginationQuery)
export class GetResourcesWithPaginationHandler implements IQueryHandler<GetResourcesWithPaginationQuery> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourcesWithPaginationQuery): Promise<{
    resources: ResourceEntity[];
    total: number;
  }> {
    try {
      this.logger.log(
        'Executing get resources with pagination query',
        `GetResourcesWithPaginationHandler - page: ${query.page}, limit: ${query.limit}`,
        'GetResourcesWithPaginationHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const result = await this.resourcesService.findWithPagination(query.page, query.limit, query.filters || {});
      
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get paginated resources: ${error.message}`,
        error.stack,
        'GetResourcesWithPaginationHandler'
      );
      throw error;
    }
  }
}

/**
 * Search Resources Query Handler
 * Search resources by name or description
 */
@Injectable()
@QueryHandler(SearchResourcesQuery)
export class SearchResourcesHandler implements IQueryHandler<SearchResourcesQuery> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: SearchResourcesQuery): Promise<ResourceEntity[]> {
    try {
      this.logger.log(
        'Executing search resources query',
        `SearchResourcesHandler - query: ${query.query}`,
        'SearchResourcesHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const resources = await this.resourcesService.search(query.query);
      
      return resources;
    } catch (error) {
      this.logger.error(
        `Failed to search resources: ${error.message}`,
        error.stack,
        'SearchResourcesHandler'
      );
      throw error;
    }
  }
}

/**
 * Check Resource Availability Query Handler
 * Implements RF-05 (availability rules)
 */
@Injectable()
@QueryHandler(CheckResourceAvailabilityQuery)
export class CheckResourceAvailabilityHandler implements IQueryHandler<CheckResourceAvailabilityQuery> {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: CheckResourceAvailabilityQuery): Promise<{
    available: boolean;
    reason?: string;
    priority: number;
  }> {
    try {
      this.logger.log(
        'Executing check resource availability query',
        `CheckResourceAvailabilityHandler - resourceId: ${query.resourceId}`,
        'CheckResourceAvailabilityHandler'
      );

      // Delegate to service (Clean Architecture pattern)
      const availabilityResult = await this.resourcesService.checkAvailability(
        query.resourceId,
        query.requestedDate,
        query.userType,
        query.reservationDuration
      );
      
      return {
        available: availabilityResult.available,
        reason: availabilityResult.reason,
        priority: availabilityResult.priority === 'high' ? 3 : availabilityResult.priority === 'medium' ? 2 : 1,
      };
    } catch (error) {
      this.logger.error(
        `Failed to check resource availability: ${error.message}`,
        error.stack,
        'CheckResourceAvailabilityHandler'
      );
      throw error;
    }
  }
}
