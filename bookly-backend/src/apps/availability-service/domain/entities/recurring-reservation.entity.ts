/**
 * RF-12: Recurring Reservation Entity
 * Represents a periodic reservation configuration that generates multiple reservation instances
 */

import { RecurrenceFrequency, RecurringReservationStatus } from "../../utils";

export interface RecurringReservationProps {
  id: string;
  excludeId?: string;
  title: string;
  description?: string;
  programId?: string;
  resourceId: string;
  userId: string;
  
  // Date range for recurrence
  startDate: Date;
  endDate: Date;
  
  // Time for each instance
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  
  // Recurrence configuration
  frequency: RecurrenceFrequency;
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // For weekly: [1,2,3,4,5] = Mon-Fri
  dayOfMonth?: number;   // For monthly: day of month (1-31)
  
  // Status and lifecycle
  status: RecurringReservationStatus;
  totalInstances: number;
  confirmedInstances: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export class RecurringReservationEntity {
  private constructor(private readonly props: RecurringReservationProps) {}

  static create(props: Omit<RecurringReservationProps, 'id' | 'createdAt' | 'updatedAt'>): RecurringReservationEntity {
    const now = new Date();
    return new RecurringReservationEntity({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      status: props.status || RecurringReservationStatus.ACTIVE,
      totalInstances: props.totalInstances || 0,
      confirmedInstances: props.confirmedInstances || 0,
      interval: props.interval || 1
    });
  }

  static fromPersistence(props: RecurringReservationProps): RecurringReservationEntity {
    return new RecurringReservationEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get title(): string { return this.props.title; }
  get description(): string | undefined { return this.props.description; }
  get resourceId(): string { return this.props.resourceId; }
  get userId(): string { return this.props.userId; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date { return this.props.endDate; }
  get startTime(): string { return this.props.startTime; }
  get endTime(): string { return this.props.endTime; }
  get frequency(): RecurrenceFrequency { return this.props.frequency; }
  get interval(): number { return this.props.interval; }
  get daysOfWeek(): number[] | undefined { return this.props.daysOfWeek; }
  get dayOfMonth(): number | undefined { return this.props.dayOfMonth; }
  get status(): RecurringReservationStatus { return this.props.status; }
  get totalInstances(): number { return this.props.totalInstances; }
  get confirmedInstances(): number { return this.props.confirmedInstances; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Business logic methods
  
  /**
   * Validates if the recurring reservation configuration is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.title?.trim()) {
      errors.push('Title is required');
    }

    if (!this.props.resourceId) {
      errors.push('Resource ID is required');
    }

    if (!this.props.userId) {
      errors.push('User ID is required');
    }

    if (this.props.startDate >= this.props.endDate) {
      errors.push('Start date must be before end date');
    }

    if (!this.isValidTimeFormat(this.props.startTime)) {
      errors.push('Invalid start time format (expected HH:mm)');
    }

    if (!this.isValidTimeFormat(this.props.endTime)) {
      errors.push('Invalid end time format (expected HH:mm)');
    }

    if (this.props.startTime >= this.props.endTime) {
      errors.push('Start time must be before end time');
    }

    if (this.props.frequency === RecurrenceFrequency.WEEKLY && (!this.props.daysOfWeek || this.props.daysOfWeek.length === 0)) {
      errors.push('Days of week are required for weekly frequency');
    }

    if (this.props.frequency === RecurrenceFrequency.MONTHLY && !this.props.dayOfMonth) {
      errors.push('Day of month is required for monthly frequency');
    }

    if (this.props.interval < 1) {
      errors.push('Interval must be at least 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generates the next occurrence dates based on the recurrence configuration
   */
  generateOccurrences(): Date[] {
    const occurrences: Date[] = [];
    let currentDate = new Date(this.props.startDate);
    
    while (currentDate <= this.props.endDate) {
      if (this.shouldIncludeDate(currentDate)) {
        occurrences.push(new Date(currentDate));
      }
      
      currentDate = this.getNextDate(currentDate);
      
      // Safety check to prevent infinite loops
      if (occurrences.length > 1000) {
        break;
      }
    }
    
    return occurrences;
  }

  /**
   * Cancels the recurring reservation
   */
  cancel(): void {
    this.props.status = RecurringReservationStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  /**
   * Marks the recurring reservation as completed
   */
  complete(): void {
    this.props.status = RecurringReservationStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  /**
   * Updates the instance counts
   */
  updateInstanceCounts(totalInstances: number, confirmedInstances: number): void {
    this.props.totalInstances = totalInstances;
    this.props.confirmedInstances = confirmedInstances;
    this.props.updatedAt = new Date();
  }

  /**
   * Checks if the recurring reservation is active
   */
  isActive(): boolean {
    return this.props.status === RecurringReservationStatus.ACTIVE;
  }

  /**
   * Gets the duration in minutes for each instance
   */
  getDurationMinutes(): number {
    const [startHour, startMinute] = this.props.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.props.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes - startMinutes;
  }

  // Private helper methods

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private shouldIncludeDate(date: Date): boolean {
    switch (this.props.frequency) {
      case RecurrenceFrequency.DAILY:
        return true;
      
      case RecurrenceFrequency.WEEKLY:
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        return this.props.daysOfWeek?.includes(dayOfWeek) || false;
      
      case RecurrenceFrequency.MONTHLY:
        return date.getDate() === this.props.dayOfMonth;
      
      default:
        return false;
    }
  }

  private getNextDate(currentDate: Date): Date {
    const nextDate = new Date(currentDate);
    
    switch (this.props.frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + this.props.interval);
        break;
      
      case RecurrenceFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + (7 * this.props.interval));
        break;
      
      case RecurrenceFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + this.props.interval);
        break;
    }
    
    return nextDate;
  }

  // Conversion methods
  toPersistence(): RecurringReservationProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      resourceId: this.props.resourceId,
      userId: this.props.userId,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      frequency: this.props.frequency,
      interval: this.props.interval,
      daysOfWeek: this.props.daysOfWeek,
      dayOfMonth: this.props.dayOfMonth,
      status: this.props.status,
      totalInstances: this.props.totalInstances,
      confirmedInstances: this.props.confirmedInstances,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }
}
