import { ICommand } from '@nestjs/cqrs';
import { AvailableSchedule, ResourceAttributes } from '../../domain/entities/resource.entity';

/**
 * Update Resource Command
 * Implements RF-01 (edit resource)
 */
export class UpdateResourceCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly type?: string,
    public readonly capacity?: number | null,
    public readonly location?: string | null,
    public readonly status?: string,
    public readonly description?: string | null,
    public readonly attributes?: ResourceAttributes | null,
    public readonly availableSchedules?: AvailableSchedule | null,
    public readonly categoryId?: string | null,
  ) {}
}
