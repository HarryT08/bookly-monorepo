import { IQuery } from '@nestjs/cqrs';

/**
 * Get Resource Responsibles Query
 */
export class GetResourceResponsiblesQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

/**
 * Get User Responsibilities Query
 */
export class GetUserResponsibilitiesQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

/**
 * Get Responsibilities Query - with filters
 */
export class GetResponsibilitiesQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly resourceId?: string,
    public readonly userId?: string,
    public readonly isActive?: boolean
  ) {}
}

/**
 * Check Resource Responsible Query
 */
export class CheckResourceResponsibleQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string
  ) {}
}
