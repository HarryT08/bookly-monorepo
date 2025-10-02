import { ICommand } from '@nestjs/cqrs';

/**
 * Create Availability Command (RF-07)
 * Command to create basic availability hours for a resource
 */
export class CreateAvailabilityCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly dayOfWeek: number,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly isActive: boolean = true,
    public readonly createdBy: string
  ) {}
}
