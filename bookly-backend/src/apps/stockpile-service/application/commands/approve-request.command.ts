/**
 * Approve Request Command
 */

import { ICommand } from '@nestjs/cqrs';

export class ApproveRequestCommand implements ICommand {
  constructor(
    public readonly requestId: string,
    public readonly approverId: string,
    public readonly approvedBy: string,
    public readonly comments?: string,
    public readonly conditions?: string[],
  ) {}
}
