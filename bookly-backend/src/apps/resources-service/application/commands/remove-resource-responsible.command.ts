import { ICommand } from '@nestjs/cqrs';

/**
 * Remove Resource Responsible Command
 * Implements RF-06 (resource responsibility management)
 */
export class RemoveResourceResponsibleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly removedBy: string
  ) {}
}
