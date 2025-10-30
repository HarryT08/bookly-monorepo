import { ICommand } from '@nestjs/cqrs';
import { ScheduleType } from '../../domain/entities/schedule.entity';

/**
 * Create Schedule Command (RF-07)
 * Command to create complex scheduling rules with institutional restrictions
 */
export class CreateScheduleCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly name: string,
    public readonly type: ScheduleType,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly recurrenceRule: any | null,
    public readonly restrictions: any | null,
    public readonly isActive: boolean = true,
    public readonly createdBy: string
  ) {}
}
