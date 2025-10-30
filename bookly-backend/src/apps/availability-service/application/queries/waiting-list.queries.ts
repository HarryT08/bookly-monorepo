/**
 * Queries for waiting list management (RF-14)
 * CQRS Query Pattern Implementation
 */

import { IQuery } from '@nestjs/cqrs';
import { UserPriority, WaitingListPriority } from '../../utils';

export class GetWaitingListQuery implements IQuery {
  constructor(
    public readonly waitingListId: string,
    public readonly userId: string,
    public readonly includeEntries: boolean = true,
    public readonly includeStats: boolean = true,
    public readonly includeAlternatives: boolean = false
  ) {}
}

export class GetWaitingListsQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly date?: Date,
    public readonly status?: string,
    public readonly includeEntries: boolean = false,
    public readonly includeStats: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
    public readonly requestingUserId?: string
  ) {}
}

export class GetWaitingListEntryQuery implements IQuery {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId: string,
    public readonly userId: string,
    public readonly includePosition: boolean = true,
    public readonly includeEstimatedWait: boolean = true,
    public readonly includeAlternatives: boolean = false
  ) {}
}

export class GetUserWaitingListEntriesQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly status?: string,
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly includeExpired: boolean = false,
    public readonly includeEstimatedWait: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId?: string
  ) {}
}

export class GetWaitingListStatsQuery implements IQuery {
  constructor(
    public readonly waitingListId?: string,
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly groupBy: 'day' | 'week' | 'month' = 'day',
    public readonly includeProjections: boolean = false,
    public readonly requestingUserId?: string
  ) {}
}

export class GetWaitingListPositionQuery implements IQuery {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId: string,
    public readonly userId: string,
    public readonly includeEstimatedWait: boolean = true,
    public readonly includeAheadCount: boolean = true
  ) {}
}

export class ValidateWaitingListEntryQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly desiredStartTime: Date,
    public readonly desiredEndTime: Date,
    public readonly priority: WaitingListPriority,
    public readonly programId?: string,
    public readonly expectedAttendees?: number,
    public readonly excludeEntryId?: string
  ) {}
}

export class GetWaitingListAlternativesQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly desiredStartTime: Date,
    public readonly desiredEndTime: Date,
    public readonly userId: string,
    public readonly acceptAlternativeResources: boolean = false,
    public readonly maxDurationDifference?: number,
    public readonly flexibleTimeRange?: number,
    public readonly limit: number = 5
  ) {}
}

export class GetWaitingListAnalyticsQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly metrics: string[] = ['total_entries', 'confirmation_rate', 'average_wait_time'],
    public readonly groupBy: 'hour' | 'day' | 'week' | 'month' = 'day',
    public readonly requestingUserId?: string
  ) {}
}

export class GetExpiredWaitingListEntriesQuery implements IQuery {
  constructor(
    public readonly waitingListId?: string,
    public readonly resourceId?: string,
    public readonly expiredBefore?: Date,
    public readonly includeProcessed: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly requestingUserId?: string
  ) {}
}

export class GetWaitingListNotificationsQuery implements IQuery {
  constructor(
    public readonly waitingListId?: string,
    public readonly userId?: string,
    public readonly notificationType?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly status?: 'PENDING' | 'SENT' | 'FAILED',
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly requestingUserId?: string
  ) {}
}

export class SearchWaitingListsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly filters: {
      resourceId?: string;
      status?: string;
      priority?: UserPriority;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
      hasEntries?: boolean;
    },
    public readonly includeEntries: boolean = false,
    public readonly includeStats: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId: string
  ) {}
}

export class GetWaitingListOptimizationSuggestionsQuery implements IQuery {
  constructor(
    public readonly waitingListId: string,
    public readonly optimizationCriteria: 'PRIORITY' | 'WAIT_TIME' | 'RESOURCE_UTILIZATION' | 'BALANCED',
    public readonly requestingUserId: string,
    public readonly includeImpactAnalysis: boolean = true,
    public readonly maxSuggestions: number = 10
  ) {}
}

export class GetWaitingListHistoryQuery implements IQuery {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId?: string,
    public readonly actionType?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly requestingUserId?: string
  ) {}
}

export class GetResourceWaitingListsQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly date?: Date,
    public readonly status?: string,
    public readonly includeEntries: boolean = false,
    public readonly includeStats: boolean = true,
    public readonly requestingUserId?: string
  ) {}
}

export class GetProgramWaitingListsQuery implements IQuery {
  constructor(
    public readonly programId: string,
    public readonly status?: string,
    public readonly resourceType?: string,
    public readonly includeStats: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId?: string
  ) {}
}

export class GetWaitingListTrendsQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
    public readonly metrics: string[] = ['entries', 'confirmations', 'wait_times'],
    public readonly compareWithPrevious: boolean = true,
    public readonly requestingUserId?: string
  ) {}
}

export class GetWaitingListCapacityQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly date: Date,
    public readonly timeSlots: Array<{
      startTime: string;
      endTime: string;
    }>,
    public readonly requestingUserId: string
  ) {}
}

export class GetUserWaitingListPreferencesQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly requestingUserId: string
  ) {}
}

export class GetWaitingListRecommendationsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly resourceType?: string,
    public readonly preferredTimes?: Array<{
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    }>,
    public readonly maxRecommendations: number = 5,
    public readonly requestingUserId?: string
  ) {}
}

export class GetWaitingListConflictsQuery implements IQuery {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId?: string,
    public readonly checkType: 'RESOURCE' | 'TIME' | 'USER' | 'ALL' = 'ALL',
    public readonly requestingUserId?: string
  ) {}
}
