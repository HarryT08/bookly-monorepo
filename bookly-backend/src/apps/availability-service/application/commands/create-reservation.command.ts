import { ICommand } from '@nestjs/cqrs';

/**
 * Create Reservation Command
 * Command to create a new reservation with validation
 */
export class CreateReservationCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly description: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly createdBy: string,
    public readonly isRecurring: boolean = false,
    public readonly recurrence: any | null = null
  ) {}
}
