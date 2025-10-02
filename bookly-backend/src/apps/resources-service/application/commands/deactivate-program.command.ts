import { ICommand } from '@nestjs/cqrs';

/**
 * Deactivate Program Command
 * Implements RF-02 (program management)
 */
export class DeactivateProgramCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly deactivatedBy: string
  ) {}
}
