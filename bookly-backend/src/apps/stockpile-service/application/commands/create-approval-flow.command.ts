/**
 * Create Approval Flow Command
 */

import { ICommand } from '@nestjs/cqrs';

export class CreateApprovalFlowCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly steps: Array<{
      level: number;
      roleRequired: string;
      autoApprove?: boolean;
      conditions?: string[];
    }>,
    public readonly resourceTypes?: string[],
    public readonly isDefault?: boolean,
  ) {}
}
