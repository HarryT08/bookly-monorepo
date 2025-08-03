import { IQuery } from '@nestjs/cqrs';
import { CalendarViewType, EventType } from '../../../../libs/dto/availability/calendar-view.dto';

/**
 * Query for getting calendar view data (RF-10)
 */
export class GetCalendarViewQuery implements IQuery {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly resourceId?: string,
    public readonly viewType: CalendarViewType = CalendarViewType.MONTH,
    public readonly eventTypes?: EventType[],
    public readonly includeAvailability: boolean = true,
    public readonly includeExternalEvents: boolean = true,
    public readonly userId?: string
  ) {}
}
