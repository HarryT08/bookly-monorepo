import { ICommand } from '@nestjs/cqrs';

/**
 * Bulk Assign Responsible Command
 * Assigns a user as responsible for multiple resources
 */
export class BulkAssignResponsibleCommand implements ICommand {
  constructor(
    public readonly data: {
      resourceIds: string[];
      userId: string;
      assignedBy: string;
    }
  ) {}
}

/**
 * Transfer Responsibilities Command
 * Transfers responsibilities from one user to another
 */
export class TransferResponsibilitiesCommand implements ICommand {
  constructor(
    public readonly data: {
      fromUserId: string;
      toUserId: string;
      assignedBy: string;
      resourceIds?: string[];
    }
  ) {}
}
