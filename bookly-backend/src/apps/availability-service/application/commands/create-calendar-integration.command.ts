import { ICommand } from '@nestjs/cqrs';
import { CalendarProvider } from '../../domain/entities/calendar-integration.entity';

/**
 * Create Calendar Integration Command (RF-08)
 * Command to create external calendar integration
 */
export class CreateCalendarIntegrationCommand implements ICommand {
  constructor(
    public readonly resourceId: string | null,
    public readonly provider: CalendarProvider,
    public readonly name: string,
    public readonly credentials: any,
    public readonly calendarId: string | null,
    public readonly syncInterval: number = 30,
    public readonly isActive: boolean = true,
    public readonly createdBy?: string
  ) {}
}
