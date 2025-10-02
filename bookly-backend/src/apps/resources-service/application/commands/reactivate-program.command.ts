import { ICommand } from '@nestjs/cqrs';

/**
 * Reactivate Program Command
 * Implements RF-02 (program management)
 */
export class ReactivateProgramCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly reactivatedBy: string
  ) {}
}
