import { ICommand } from '@nestjs/cqrs';
import { AvailableSchedule, ResourceAttributes } from '../../domain/entities/resource.entity';

/**
 * Create Resource Command
 * Implements RF-01 (create resource)
 */
export class CreateResourceCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly capacity: number | null,
    public readonly location: string | null,
    public readonly description?: string,
    public readonly attributes?: ResourceAttributes,
    public readonly availableSchedules?: AvailableSchedule,
    public readonly categoryId?: string,
  ) {}
}
