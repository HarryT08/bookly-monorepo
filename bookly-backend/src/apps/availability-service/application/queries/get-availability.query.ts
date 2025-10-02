import { IQuery } from '@nestjs/cqrs';

/**
 * Get Availability Query (RF-07, RF-10)
 * Query to retrieve availability information for calendar visualization
 */
export class GetAvailabilityQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly dayOfWeek?: number,
    public readonly includeInactive?: boolean
  ) {}
}

/**
 * Get Resource Availability Query (RF-10)
 * Query to get comprehensive availability for calendar display
 */
export class GetResourceAvailabilityQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly includeReservations: boolean = true,
    public readonly includeScheduleRestrictions: boolean = true
  ) {}
}

/**
 * Check Availability Query
 * Query to check if a specific time slot is available
 */
export class CheckAvailabilityQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly userId?: string // For user-specific restrictions
  ) {}
}
