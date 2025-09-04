/**
 * Check Out Command
 */

import { ICommand } from '@nestjs/cqrs';

export class CheckOutCommand implements ICommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly checkOutTime?: Date,
    public readonly notes?: string,
    public readonly resourceCondition?: string,
  ) {}
}
