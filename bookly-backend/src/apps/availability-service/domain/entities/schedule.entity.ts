/**
 * Schedule Entity - Domain Model (RF-07)
 * Represents complex scheduling rules with institutional restrictions
 */
export class ScheduleEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly name: string,
    public readonly type: ScheduleType,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly recurrenceRule: any | null,
    public readonly restrictions: ScheduleRestrictions | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string,
  ) {
    this.validateDateOrder();
  }

  private validateDateOrder(): void {
    if (this.endDate && this.startDate >= this.endDate) {
      throw new Error('startDate must be before endDate');
    }
  }

  /**
   * Check if a date falls within this schedule period
   */
  isDateWithinSchedule(date: Date): boolean {
    if (!this.isActive) return false;
    
    if (date < this.startDate) return false;
    if (this.endDate && date > this.endDate) return false;
    
    return true;
  }

  /**
   * Check if a user type is allowed by this schedule's restrictions
   */
  isUserTypeAllowed(userType: string): boolean {
    if (!this.restrictions?.allowedUserTypes) return true;
    return this.restrictions.allowedUserTypes.includes(userType);
  }

  /**
   * Get minimum advance notice required in hours
   */
  getMinimumAdvanceNotice(): number {
    return this.restrictions?.minAdvanceNotice || 0;
  }

  /**
   * Get schedule priority level
   */
  getPriority(): SchedulePriority {
    return this.restrictions?.priority || SchedulePriority.NORMAL;
  }

  /**
   * Check if this schedule conflicts with another schedule
   */
  conflictsWith(other: ScheduleEntity): boolean {
    if (this.resourceId !== other.resourceId) return false;
    if (!this.isActive || !other.isActive) return false;

    // Check date overlap
    const thisStart = this.startDate;
    const thisEnd = this.endDate || new Date('2099-12-31');
    const otherStart = other.startDate;
    const otherEnd = other.endDate || new Date('2099-12-31');

    return thisStart <= otherEnd && otherStart <= thisEnd;
  }
}

export enum ScheduleType {
  REGULAR = 'REGULAR',
  RESTRICTED = 'RESTRICTED',
  EXCEPTION = 'EXCEPTION',
  MAINTENANCE = 'MAINTENANCE',
  ACADEMIC_EVENT = 'ACADEMIC_EVENT'
}

export enum SchedulePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ScheduleRestrictions {
  allowedUserTypes?: string[];
  priority?: SchedulePriority;
  minAdvanceNotice?: number; // in hours
  maxReservationDuration?: number; // in hours
  requiresApproval?: boolean;
  blackoutDates?: Date[];
}
