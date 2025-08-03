import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { 
  GetResourcesQuery, 
  GetResourcesWithPaginationQuery, 
  SearchResourcesQuery,
  CheckResourceAvailabilityQuery 
} from '../queries/get-resources.query';
import { ResourceEntity } from '../../domain/entities/resource.entity';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Get Resources Query Handler
 * Retrieves multiple resources with optional filters
 */
@QueryHandler(GetResourcesQuery)
export class GetResourcesHandler implements IQueryHandler<GetResourcesQuery> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourcesQuery): Promise<ResourceEntity[]> {
    this.logger.log('Getting resources with filters', { 
      filters: query.filters
    }, 'GetResourcesHandler');

    try {
      const resources = await this.resourceRepository.findAll(query.filters);

      this.logger.log('Resources retrieved successfully', { 
        count: resources.length,
        filters: query.filters
      }, 'GetResourcesHandler');

      return resources;

    } catch (error) {
      this.logger.error('Failed to get resources', error, 'GetResourcesHandler');
      throw error;
    }
  }
}

/**
 * Get Resources with Pagination Query Handler
 * Retrieves resources with pagination support
 */
@QueryHandler(GetResourcesWithPaginationQuery)
export class GetResourcesWithPaginationHandler implements IQueryHandler<GetResourcesWithPaginationQuery> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: GetResourcesWithPaginationQuery): Promise<{
    resources: ResourceEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log('Getting resources with pagination', { 
      page: query.page,
      limit: query.limit,
      filters: query.filters
    }, 'GetResourcesWithPaginationHandler');

    try {
      const result = await this.resourceRepository.findWithPagination(
        query.page,
        query.limit,
        query.filters
      );

      this.logger.log('Paginated resources retrieved successfully', { 
        count: result.resources.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      }, 'GetResourcesWithPaginationHandler');

      return result;

    } catch (error) {
      this.logger.error('Failed to get paginated resources', error, 'GetResourcesWithPaginationHandler');
      throw error;
    }
  }
}

/**
 * Search Resources Query Handler
 * Search resources by name or description
 */
@QueryHandler(SearchResourcesQuery)
export class SearchResourcesHandler implements IQueryHandler<SearchResourcesQuery> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: SearchResourcesQuery): Promise<ResourceEntity[]> {
    this.logger.log('Searching resources', { 
      searchQuery: query.query
    }, 'SearchResourcesHandler');

    try {
      const resources = await this.resourceRepository.search(query.query);

      this.logger.log('Resource search completed successfully', { 
        count: resources.length,
        searchQuery: query.query
      }, 'SearchResourcesHandler');

      return resources;

    } catch (error) {
      this.logger.error('Failed to search resources', error, 'SearchResourcesHandler');
      throw error;
    }
  }
}

/**
 * Check Resource Availability Query Handler
 * Implements RF-05 (availability rules)
 */
@QueryHandler(CheckResourceAvailabilityQuery)
export class CheckResourceAvailabilityHandler implements IQueryHandler<CheckResourceAvailabilityQuery> {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    private readonly logger: LoggingService,
  ) {}

  async execute(query: CheckResourceAvailabilityQuery): Promise<{
    available: boolean;
    reason?: string;
    priority: number;
  }> {
    this.logger.log('Checking resource availability', { 
      resourceId: query.resourceId,
      requestedDate: query.requestedDate,
      userType: query.userType,
      reservationDuration: query.reservationDuration
    }, 'CheckResourceAvailabilityHandler');

    try {
      const resource = await this.resourceRepository.findById(query.resourceId);
      
      if (!resource) {
        return {
          available: false,
          reason: 'Resource not found',
          priority: 0,
        };
      }

      const availabilityCheck = resource.isAvailableForReservation(
        query.requestedDate,
        query.userType,
        query.reservationDuration
      );

      const priority = resource.getUserPriority(query.userType);

      this.logger.log('Resource availability checked', { 
        resourceId: query.resourceId,
        available: availabilityCheck.available,
        priority
      }, 'CheckResourceAvailabilityHandler');

      return {
        available: availabilityCheck.available,
        reason: availabilityCheck.reason,
        priority,
      };

    } catch (error) {
      this.logger.error('Failed to check resource availability', error, 'CheckResourceAvailabilityHandler');
      throw error;
    }
  }
}
