/**
 * Reject Request Command
 */

import { ICommand } from '@nestjs/cqrs';

export class RejectRequestCommand implements ICommand {
  constructor(
    public readonly requestId: string,
    public readonly approverId: string,
    public readonly reason: string,
    public readonly comments?: string,
  ) {}
}
