/**
 * Queries for recurring reservations (RF-12)
 * CQRS Query Pattern Implementation
 */

import { IQuery } from '@nestjs/cqrs';
import { RecurrenceFrequency, RecurringReservationPriority, RecurringReservationStatus } from '../../utils';

export class GetRecurringReservationQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly includeInstances: boolean = false,
    public readonly includeStats: boolean = true
  ) {}
}

export class GetRecurringReservationsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly status?: RecurringReservationStatus,
    public readonly frequency?: RecurrenceFrequency,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly priority?: RecurringReservationPriority,
    public readonly tags?: string[],
    public readonly includeStats: boolean = false,
    public readonly includeInstances: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
    public readonly requestingUserId?: string
  ) {}
}

export class GetRecurringReservationInstancesQuery implements IQuery {
  constructor(
    public readonly recurringReservationId: string,
    public readonly userId: string,
    public readonly status?: RecurringReservationStatus,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly includeConfirmed: boolean = true,
    public readonly includePending: boolean = true,
    public readonly includeCancelled: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortBy: string = 'date',
    public readonly sortOrder: 'ASC' | 'DESC' = 'ASC'
  ) {}
}

export class GetRecurringReservationStatsQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly includeProjections: boolean = false,
    public readonly includeComparisons: boolean = false
  ) {}
}

export class ValidateRecurringReservationQuery implements IQuery {
  constructor(
    public readonly title: string,
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly frequency: RecurrenceFrequency,
    public readonly interval: number = 1,
    public readonly daysOfWeek?: number[],
    public readonly dayOfMonth?: number,
    public readonly maxInstances: number = 20,
    public readonly allowOverlap: boolean = false,
    public readonly programId?: string,
    public readonly excludeId?: string
  ) {}
}

export class GetRecurringReservationConflictsQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly checkFutureOnly: boolean = true,
    public readonly includeResolutions: boolean = true
  ) {}
}

export class GetUserRecurringReservationsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly status?: RecurringReservationStatus,
    public readonly includeStats: boolean = true,
    public readonly includeUpcoming: boolean = true,
    public readonly limit: number = 10,
    public readonly requestingUserId?: string
  ) {}
}

export class GetResourceRecurringReservationsQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly status?: RecurringReservationStatus,
    public readonly includeInstances: boolean = false,
    public readonly userId?: string
  ) {}
}

export class GetRecurringReservationsByProgramQuery implements IQuery {
  constructor(
    public readonly programId: string,
    public readonly status?: RecurringReservationStatus,
    public readonly frequency?: RecurrenceFrequency,
    public readonly includeStats: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly userId?: string
  ) {}
}

export class SearchRecurringReservationsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly filters: {
      userId?: string;
      resourceId?: string;
      programId?: string;
      status?: RecurringReservationStatus;
      frequency?: RecurrenceFrequency;
      startDate?: Date;
      endDate?: Date;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      tags?: string[];
    },
    public readonly includeStats: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId: string
  ) {}
}

export class GetRecurringReservationAnalyticsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly groupBy: 'day' | 'week' | 'month' = 'month',
    public readonly metrics: string[] = ['total', 'confirmed', 'cancelled', 'completion_rate'],
    public readonly requestingUserId?: string
  ) {}
}

export class GetUpcomingRecurringInstancesQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly days: number = 7,
    public readonly includeUnconfirmed: boolean = true,
    public readonly limit: number = 20,
    public readonly requestingUserId?: string
  ) {}
}

export class GetRecurringReservationHistoryQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly includeInstances: boolean = true,
    public readonly includeModifications: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 50
  ) {}
}

export class GetRecurringReservationSuggestionsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly resourceType?: string,
    public readonly programId?: string,
    public readonly preferredTimes?: string[],
    public readonly preferredDays?: number[],
    public readonly duration?: number,
    public readonly limit: number = 5
  ) {}
}
