import { CalendarEventEntity } from '../entities/calendar-event.entity';

/**
 * Calendar Event Repository Interface (RF-08)
 * Defines contract for calendar event data persistence
 */
export interface CalendarEventRepository {
  /**
   * Create a new calendar event
   */
  create(eventData: {
    externalEventId: string;
    integrationId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    status: string;
    attendees?: string[];
    metadata?: any;
  }): Promise<CalendarEventEntity>;

  /**
   * Find event by ID
   */
  findById(id: string): Promise<CalendarEventEntity | null>;

  /**
   * Find event by external ID and integration
   */
  findByExternalId(externalEventId: string, integrationId: string): Promise<CalendarEventEntity | null>;

  /**
   * Find events by integration ID
   */
  findByIntegrationId(integrationId: string): Promise<CalendarEventEntity[]>;

  /**
   * Find events by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<CalendarEventEntity[]>;

  /**
   * Find events by integration and date range
   */
  findByIntegrationAndDateRange(
    integrationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEventEntity[]>;

  /**
   * Update event
   */
  update(id: string, updates: Partial<CalendarEventEntity>): Promise<CalendarEventEntity>;

  /**
   * Delete event
   */
  delete(id: string): Promise<void>;

  /**
   * Delete events by external ID
   */
  deleteByExternalId(externalEventId: string, integrationId: string): Promise<void>;

  /**
   * Bulk create or update events
   */
  bulkUpsert(events: Partial<CalendarEventEntity>[]): Promise<CalendarEventEntity[]>;

  /**
   * Find conflicting events
   */
  findConflictingEvents(
    startDate: Date,
    endDate: Date,
    excludeEventId?: string
  ): Promise<CalendarEventEntity[]>;
}
