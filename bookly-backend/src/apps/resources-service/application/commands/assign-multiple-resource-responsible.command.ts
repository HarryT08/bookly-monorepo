import { ICommand } from '@nestjs/cqrs';

/**
 * Assign Multiple Resource Responsible Command
 */
export class AssignMultipleResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userIds: string[],
    public readonly assignedBy: string
  ) {}
}

/**
 * Replace Resource Responsibles Command
 */
export class ReplaceResourceResponsiblesCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userIds: string[],
    public readonly assignedBy: string
  ) {}
}
