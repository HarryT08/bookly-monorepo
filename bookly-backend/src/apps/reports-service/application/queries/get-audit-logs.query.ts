/**
 * Get Audit Logs Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetAuditLogsQuery implements IQuery {
  constructor(
    public readonly entityId?: string,
    public readonly entityType?: string,
    public readonly userId?: string,
    public readonly action?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
