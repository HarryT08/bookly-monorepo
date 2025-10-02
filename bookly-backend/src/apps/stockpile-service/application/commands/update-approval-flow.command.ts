/**
 * Update Approval Flow Command
 */

import { ICommand } from '@nestjs/cqrs';

export class UpdateApprovalFlowCommand implements ICommand {
  constructor(
    public readonly flowId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly steps?: Array<{
      level: number;
      roleRequired: string;
      autoApprove?: boolean;
      conditions?: string[];
    }>,
    public readonly resourceTypes?: string[],
    public readonly isDefault?: boolean,
    public readonly isActive?: boolean,
  ) {}
}
