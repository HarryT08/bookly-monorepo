/**
 * RF-12: Recurring Reservation Instance Entity
 * Represents an individual instance generated from a recurring reservation
 */

import { InstanceStatus } from "../../utils";

export interface RecurringReservationInstanceProps {
  id: string;
  recurringReservationId: string;
  reservationId?: string; // When confirmed, links to actual Reservation
  
  // Scheduled details
  scheduledDate: Date;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  
  // Status tracking
  status: InstanceStatus;
  
  // Timestamps
  generatedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
}

export class RecurringReservationInstanceEntity {
  private constructor(private readonly props: RecurringReservationInstanceProps) {}

  static create(props: Omit<RecurringReservationInstanceProps, 'id' | 'generatedAt'>): RecurringReservationInstanceEntity {
    return new RecurringReservationInstanceEntity({
      ...props,
      id: '', // Will be set by repository
      generatedAt: new Date(),
      status: props.status || InstanceStatus.PENDING
    });
  }

  static fromPersistence(props: RecurringReservationInstanceProps): RecurringReservationInstanceEntity {
    return new RecurringReservationInstanceEntity(props);
  }

  // Getters
  get id(): string { return this.props.id; }
  get recurringReservationId(): string { return this.props.recurringReservationId; }
  get reservationId(): string | undefined { return this.props.reservationId; }
  get scheduledDate(): Date { return this.props.scheduledDate; }
  get startTime(): string { return this.props.startTime; }
  get endTime(): string { return this.props.endTime; }
  get status(): InstanceStatus { return this.props.status; }
  get generatedAt(): Date { return this.props.generatedAt; }
  get confirmedAt(): Date | undefined { return this.props.confirmedAt; }
  get cancelledAt(): Date | undefined { return this.props.cancelledAt; }

  // Business logic methods

  /**
   * Validates if the instance configuration is valid
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.props.recurringReservationId) {
      errors.push('Recurring reservation ID is required');
    }

    if (!this.props.scheduledDate) {
      errors.push('Scheduled date is required');
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Confirms the instance and links it to an actual reservation
   */
  confirm(reservationId: string): void {
    if (this.props.status !== InstanceStatus.PENDING) {
      throw new Error('Only pending instances can be confirmed');
    }

    this.props.status = InstanceStatus.CONFIRMED;
    this.props.reservationId = reservationId;
    this.props.confirmedAt = new Date();
  }

  /**
   * Cancels the instance
   */
  cancel(): void {
    if (this.props.status === InstanceStatus.CANCELLED) {
      throw new Error('Instance is already cancelled');
    }

    this.props.status = InstanceStatus.CANCELLED;
    this.props.cancelledAt = new Date();
  }

  /**
   * Skips the instance (for cases where the instance should not be created)
   */
  skip(): void {
    if (this.props.status !== InstanceStatus.PENDING) {
      throw new Error('Only pending instances can be skipped');
    }

    this.props.status = InstanceStatus.SKIPPED;
  }

  /**
   * Checks if the instance is pending
   */
  isPending(): boolean {
    return this.props.status === InstanceStatus.PENDING;
  }

  /**
   * Checks if the instance is confirmed
   */
  isConfirmed(): boolean {
    return this.props.status === InstanceStatus.CONFIRMED;
  }

  /**
   * Checks if the instance is cancelled
   */
  isCancelled(): boolean {
    return this.props.status === InstanceStatus.CANCELLED;
  }

  /**
   * Checks if the instance is skipped
   */
  isSkipped(): boolean {
    return this.props.status === InstanceStatus.SKIPPED;
  }

  /**
   * Gets the full date and time for the start of the instance
   */
  getStartDateTime(): Date {
    const [hours, minutes] = this.props.startTime.split(':').map(Number);
    const dateTime = new Date(this.props.scheduledDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  /**
   * Gets the full date and time for the end of the instance
   */
  getEndDateTime(): Date {
    const [hours, minutes] = this.props.endTime.split(':').map(Number);
    const dateTime = new Date(this.props.scheduledDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  /**
   * Gets the duration in minutes for the instance
   */
  getDurationMinutes(): number {
    const [startHour, startMinute] = this.props.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.props.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes - startMinutes;
  }

  /**
   * Checks if the instance is in the past
   */
  isPast(): boolean {
    const now = new Date();
    const instanceDateTime = this.getStartDateTime();
    return instanceDateTime < now;
  }

  /**
   * Checks if the instance is in the future
   */
  isFuture(): boolean {
    const now = new Date();
    const instanceDateTime = this.getStartDateTime();
    return instanceDateTime > now;
  }

  /**
   * Checks if the instance is happening today
   */
  isToday(): boolean {
    const now = new Date();
    const instanceDate = this.props.scheduledDate;
    
    return now.getFullYear() === instanceDate.getFullYear() &&
           now.getMonth() === instanceDate.getMonth() &&
           now.getDate() === instanceDate.getDate();
  }

  // Private helper methods

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  // Conversion methods
  toPersistence(): RecurringReservationInstanceProps {
    return { ...this.props };
  }

  toJSON() {
    return {
      id: this.props.id,
      recurringReservationId: this.props.recurringReservationId,
      reservationId: this.props.reservationId,
      scheduledDate: this.props.scheduledDate,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      status: this.props.status,
      generatedAt: this.props.generatedAt,
      confirmedAt: this.props.confirmedAt,
      cancelledAt: this.props.cancelledAt
    };
  }
}
