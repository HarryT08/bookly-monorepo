/**
 * Check In Command
 */

import { ICommand } from '@nestjs/cqrs';

export class CheckInCommand implements ICommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly checkInTime?: Date,
    public readonly notes?: string,
  ) {}
}
