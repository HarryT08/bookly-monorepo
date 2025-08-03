import { IQuery } from '@nestjs/cqrs';

/**
 * Get Resources Query
 * Retrieves multiple resources with optional filters
 */
export class GetResourcesQuery implements IQuery {
  constructor(
    public readonly filters?: {
      type?: string;
      status?: string;
      categoryId?: string;
      isActive?: boolean;
      location?: string;
    }
  ) {}
}

/**
 * Get Resources with Pagination Query
 * Retrieves resources with pagination support
 */
export class GetResourcesWithPaginationQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly filters?: {
      type?: string;
      status?: string;
      categoryId?: string;
      isActive?: boolean;
      location?: string;
    }
  ) {}
}

/**
 * Search Resources Query
 * Search resources by name or description
 */
export class SearchResourcesQuery implements IQuery {
  constructor(public readonly query: string) {}
}

/**
 * Check Resource Availability Query
 * Implements RF-05 (availability rules)
 */
export class CheckResourceAvailabilityQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly requestedDate: Date,
    public readonly userType: string,
    public readonly reservationDuration: number, // in minutes
  ) {}
}
