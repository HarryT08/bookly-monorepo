/**
 * Get Approval By ID Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetApprovalByIdQuery implements IQuery {
  constructor(
    public readonly approvalId: string,
    public readonly includeHistory?: boolean,
  ) {}
}
