/**
 * Calendar Event Entity (RF-08)
 * Represents an event from external calendar integrations
 */
export class CalendarEventEntity {
  constructor(
    public readonly id: string,
    public readonly externalEventId: string,
    public readonly integrationId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly isAllDay: boolean,
    public readonly status: CalendarEventStatus,
    public readonly attendees: string[],
    public readonly metadata: any,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lastSync: Date
  ) {}

  /**
   * Check if event overlaps with given date range
   */
  overlaps(startDate: Date, endDate: Date): boolean {
    return this.startDate < endDate && this.endDate > startDate;
  }

  /**
   * Check if event is active (not cancelled or deleted)
   */
  isActive(): boolean {
    return this.status !== CalendarEventStatus.CANCELLED && 
           this.status !== CalendarEventStatus.DELETED;
  }

  /**
   * Get event duration in minutes
   */
  getDurationMinutes(): number {
    return Math.floor((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60));
  }

  /**
   * Check if event is recurring
   */
  isRecurring(): boolean {
    return this.metadata?.recurrenceRule !== undefined;
  }

  /**
   * Convert to plain object for serialization
   */
  toPlainObject(): any {
    return {
      id: this.id,
      externalEventId: this.externalEventId,
      integrationId: this.integrationId,
      title: this.title,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      isAllDay: this.isAllDay,
      status: this.status,
      attendees: this.attendees,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastSync: this.lastSync
    };
  }
}

/**
 * Calendar Event Status Enum
 */
export enum CalendarEventStatus {
  CONFIRMED = 'CONFIRMED',
  TENTATIVE = 'TENTATIVE',
  CANCELLED = 'CANCELLED',
  DELETED = 'DELETED'
}
