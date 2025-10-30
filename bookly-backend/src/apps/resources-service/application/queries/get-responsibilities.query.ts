import { IQuery } from '@nestjs/cqrs';

/**
 * Get All Responsibilities Query
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
