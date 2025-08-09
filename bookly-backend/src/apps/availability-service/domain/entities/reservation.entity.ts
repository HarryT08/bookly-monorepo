/**
 * Reservation Entity - Domain Model
 * Represents a reservation with business logic validation
 */
export class ReservationEntity {
  get startTime() {
    return this.startDate.getTime();
  }
  get endTime() {
    return this.endDate.getTime();
  }
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: ReservationStatus,
    public readonly isRecurring: boolean,
    public readonly recurrence: any | null,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateDateOrder();
    this.validateDuration();
  }

  private validateDateOrder(): void {
    if (this.startDate >= this.endDate) {
      throw new Error('startDate must be before endDate');
    }
  }

  private validateDuration(): void {
    const durationMs = this.endDate.getTime() - this.startDate.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    
    if (durationMinutes < 15) {
      throw new Error('Reservation must be at least 15 minutes long');
    }
    
    if (durationMinutes > 24 * 60) {
      throw new Error('Reservation cannot exceed 24 hours');
    }
  }

  /**
   * Check if this reservation conflicts with another reservation
   */
  conflictsWith(other: ReservationEntity): boolean {
    if (this.resourceId !== other.resourceId) return false;
    if (this.status === ReservationStatus.CANCELLED || other.status === ReservationStatus.CANCELLED) return false;
    
    return this.startDate < other.endDate && other.startDate < this.endDate;
  }

  /**
   * Check if reservation is in the past
   */
  isPast(): boolean {
    return this.endDate < new Date();
  }

  /**
   * Check if reservation is currently active
   */
  isActive(): boolean {
    const now = new Date();
    return this.startDate <= now && now <= this.endDate && 
           this.status === ReservationStatus.APPROVED;
  }

  /**
   * Check if reservation can be cancelled
   */
  canBeCancelled(): boolean {
    return !this.isPast() && 
           [ReservationStatus.PENDING, ReservationStatus.APPROVED].includes(this.status);
  }

  /**
   * Check if reservation can be modified
   */
  canBeModified(): boolean {
    return !this.isPast() && 
           [ReservationStatus.PENDING, ReservationStatus.APPROVED].includes(this.status);
  }

  /**
   * Get duration in minutes
   */
  getDurationInMinutes(): number {
    return (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60);
  }

  /**
   * Check if advance notice requirement is met
   */
  meetsAdvanceNotice(minimumHours: number): boolean {
    const now = new Date();
    const hoursUntilStart = (this.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilStart >= minimumHours;
  }
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}
