/**
 * Get Approval Flows Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetApprovalFlowsQuery implements IQuery {
  constructor(
    public readonly isActive?: boolean,
    public readonly resourceType?: string,
    public readonly isDefault?: boolean,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}
