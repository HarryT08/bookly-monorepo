import { ICommand } from '@nestjs/cqrs';

/**
 * Delete Resource Command
 * Implements RF-01 (delete resource)
 * Supports both soft delete (when has relations) and hard delete (when no relations)
 */
export class DeleteResourceCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly forceHardDelete: boolean = false,
  ) {}
}
