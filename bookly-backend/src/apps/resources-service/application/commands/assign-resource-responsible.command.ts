import { ICommand } from '@nestjs/cqrs';

/**
 * Assign Resource Responsible Command
 * Implements RF-06 (resource responsibility management)
 */
export class AssignResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly assignedBy: string
  ) {}
}
