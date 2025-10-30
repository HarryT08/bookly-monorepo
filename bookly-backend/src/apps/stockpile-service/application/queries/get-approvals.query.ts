/**
 * Get Approvals Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetApprovalsQuery implements IQuery {
  constructor(
    public readonly status?: string,
    public readonly approverId?: string,
    public readonly requesterId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
