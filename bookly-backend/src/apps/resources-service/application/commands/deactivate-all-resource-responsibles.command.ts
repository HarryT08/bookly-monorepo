import { ICommand } from '@nestjs/cqrs';

/**
 * Deactivate All Resource Responsibles Command
 */
export class DeactivateAllResourceResponsiblesCommand implements ICommand {
  constructor(
    public readonly resourceId: string
  ) {}
}
