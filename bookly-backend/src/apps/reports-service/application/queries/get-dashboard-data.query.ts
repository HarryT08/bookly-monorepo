/**
 * Get Dashboard Data Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetDashboardDataQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly timeRange?: string,
    public readonly filters?: Record<string, unknown>,
  ) {}
}
