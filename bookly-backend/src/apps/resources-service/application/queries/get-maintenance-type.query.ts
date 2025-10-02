import { IQuery } from '@nestjs/cqrs';

/**
 * Get Maintenance Type Query
 */
export class GetMaintenanceTypeQuery implements IQuery {
  constructor(public readonly id: string) {}
}

/**
 * Get Maintenance Type By Code Query
 */
export class GetMaintenanceTypeByCodeQuery implements IQuery {
  constructor(public readonly code: string) {}
}

/**
 * Get Maintenance Types Query
 */
export class GetMaintenanceTypesQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly isActive?: boolean
  ) {}
}

/**
 * Get Active Maintenance Types Query
 */
export class GetActiveMaintenanceTypesQuery implements IQuery {
  constructor() {}
}
