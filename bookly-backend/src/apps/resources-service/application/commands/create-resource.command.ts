import { ICommand } from '@nestjs/cqrs';
import { AvailableSchedule, ResourceAttributes } from '../../domain/entities/resource.entity';

/**
 * Create Resource Command Data Interface
 * Encapsulates all required and optional parameters with proper typing
 */
export interface CreateResourceCommandData {
  readonly name: string;
  readonly type: string;
  readonly capacity: number | null;
  readonly location: string | null;
  readonly programId: string;
  readonly description?: string;
  readonly attributes?: ResourceAttributes;
  readonly availableSchedules?: AvailableSchedule;
  readonly categoryId?: string;
}

/**
 * Create Resource Command
 * Implements RF-01 (create resource)
 */
export class CreateResourceCommand implements ICommand {
  constructor(
    public readonly data: CreateResourceCommandData
  ) {}

  // Getters for backward compatibility and easy access
  get name(): string { return this.data.name; }
  get type(): string { return this.data.type; }
  get capacity(): number | null { return this.data.capacity; }
  get location(): string | null { return this.data.location; }
  get programId(): string { return this.data.programId; }
  get description(): string | undefined { return this.data.description; }
  get attributes(): ResourceAttributes | undefined { return this.data.attributes; }
  get availableSchedules(): AvailableSchedule | undefined { return this.data.availableSchedules; }
  get categoryId(): string | undefined { return this.data.categoryId; }
}
