/**
 * Query Handlers for Waiting List Management (RF-14)
 * CQRS Query Handler Pattern Implementation
 */

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';

// Queries
import {
  GetWaitingListQuery,
  GetWaitingListsQuery,
  GetWaitingListEntryQuery,
  GetUserWaitingListEntriesQuery,
  GetWaitingListStatsQuery,
  GetWaitingListPositionQuery,
  ValidateWaitingListEntryQuery,
  GetWaitingListAlternativesQuery,
  GetWaitingListAnalyticsQuery,
  GetExpiredWaitingListEntriesQuery,
  GetWaitingListNotificationsQuery,
  SearchWaitingListsQuery,
  GetWaitingListOptimizationSuggestionsQuery,
  GetWaitingListHistoryQuery,
  GetResourceWaitingListsQuery,
  GetProgramWaitingListsQuery,
  GetWaitingListTrendsQuery,
  GetWaitingListCapacityQuery,
  GetUserWaitingListPreferencesQuery,
  GetWaitingListRecommendationsQuery,
  GetWaitingListConflictsQuery
} from '../queries/waiting-list.queries';

// Application Services
import { WaitingListService } from '../services/waiting-list.service';

// Entities
import { WaitingListEntryEntity } from '../../domain/entities/waiting-list-entry.entity';

@Injectable()
@QueryHandler(GetWaitingListQuery)
export class GetWaitingListHandler implements IQueryHandler<GetWaitingListQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListQuery): Promise<WaitingListEntryEntity & { entries?: WaitingListEntryEntity[]; stats?: any; alternatives?: any[] }> {
    this.logger.log('Orchestrating get waiting list query', {
      waitingListId: query.waitingListId,
      userId: query.userId,
      includeEntries: query.includeEntries,
      includeStats: query.includeStats
    });

    try {
      const result = await this.waitingListService.getWaitingList({
        waitingListId: query.waitingListId,
        userId: query.userId,
        includeEntries: query.includeEntries,
        includeStats: query.includeStats,
        includeAlternatives: query.includeAlternatives
      });

      this.logger.log('Waiting list retrieved successfully', {
        waitingListId: query.waitingListId,
        entriesCount: result.entries?.length || 0
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to orchestrate get waiting list query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListsQuery)
export class GetWaitingListsHandler implements IQueryHandler<GetWaitingListsQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListsQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating get waiting lists query', {
      resourceId: query.resourceId,
      date: query.date,
      status: query.status,
      page: query.page,
      limit: query.limit
    });

    try {
      const result = await this.waitingListService.getWaitingLists({
        resourceId: query.resourceId,
        date: query.date,
        status: query.status,
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        includeEntries: query.includeEntries,
        includeStats: query.includeStats
      });

      this.logger.log('Waiting lists retrieved successfully', {
        count: result.items.length,
        total: result.total,
        page: query.page
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to orchestrate get waiting lists query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListEntryQuery)
export class GetWaitingListEntryHandler implements IQueryHandler<GetWaitingListEntryQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListEntryQuery): Promise<WaitingListEntryEntity & { position?: number; estimatedWait?: number; alternatives?: any[] }> {
    this.logger.log('Orchestrating get waiting list entry query', {
      waitingListId: query.waitingListId,
      entryId: query.entryId,
      userId: query.userId
    });

    try {
      const result = await this.waitingListService.getWaitingListEntry({
        waitingListId: query.waitingListId,
        entryId: query.entryId,
        userId: query.userId,
        includePosition: query.includePosition,
        includeEstimatedWait: query.includeEstimatedWait,
        includeAlternatives: query.includeAlternatives
      });

      this.logger.log('Waiting list entry retrieved successfully', {
        entryId: query.entryId,
        position: result.position
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to orchestrate get waiting list entry query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserWaitingListEntriesQuery)
export class GetUserWaitingListEntriesHandler implements IQueryHandler<GetUserWaitingListEntriesQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUserWaitingListEntriesQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating get user waiting list entries query', {
      userId: query.userId,
      status: query.status,
      resourceId: query.resourceId,
      page: query.page,
      limit: query.limit
    });

    try {
      const result = await this.waitingListService.getUserWaitingListEntries({
        userId: query.userId,
        requestingUserId: query.requestingUserId,
        status: query.status,
        resourceId: query.resourceId,
        programId: query.programId,
        includeExpired: query.includeExpired,
        includeEstimatedWait: query.includeEstimatedWait,
        page: query.page,
        limit: query.limit
      });

      this.logger.log('User waiting list entries retrieved successfully', {
        userId: query.userId,
        count: result.items.length,
        total: result.total
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to orchestrate get user waiting list entries query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListStatsQuery)
export class GetWaitingListStatsHandler implements IQueryHandler<GetWaitingListStatsQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListStatsQuery): Promise<any> {
    this.logger.log('Orchestrating get waiting list stats query', {
      waitingListId: query.waitingListId,
      resourceId: query.resourceId,
      programId: query.programId,
      groupBy: query.groupBy
    });

    try {
      const stats = await this.waitingListService.getWaitingListStats({
        waitingListId: query.waitingListId,
        resourceId: query.resourceId,
        programId: query.programId,
        startDate: query.startDate,
        endDate: query.endDate,
        groupBy: query.groupBy,
        includeProjections: query.includeProjections
      });

      this.logger.log('Waiting list stats retrieved successfully', {
        waitingListId: query.waitingListId
      });

      return stats;

    } catch (error) {
      this.logger.error('Failed to orchestrate get waiting list stats query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListAnalyticsQuery)
export class GetWaitingListAnalyticsHandler implements IQueryHandler<GetWaitingListAnalyticsQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListAnalyticsQuery): Promise<any> {
    this.logger.log('Orchestrating get waiting list analytics query', {
      resourceId: query.resourceId,
      programId: query.programId,
      groupBy: query.groupBy,
      metrics: query.metrics
    });

    try {
      const analytics = await this.waitingListService.getWaitingListAnalytics({
        resourceId: query.resourceId,
        programId: query.programId,
        startDate: query.startDate,
        endDate: query.endDate,
        metrics: query.metrics,
        groupBy: query.groupBy
      });

      this.logger.log('Waiting list analytics retrieved successfully', {
        dataPoints: analytics.dataPoints?.length || 0,
        metrics: query.metrics
      });

      return analytics;

    } catch (error) {
      this.logger.error('Failed to orchestrate get waiting list analytics query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(ValidateWaitingListEntryQuery)
export class ValidateWaitingListEntryQueryHandler implements IQueryHandler<ValidateWaitingListEntryQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: ValidateWaitingListEntryQuery): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Validating waiting list entry query', {
      resourceId: query.resourceId,
      userId: query.userId,
      desiredStartTime: query.desiredStartTime,
      priority: query.priority
    });

    try {
      const validation = await this.waitingListService.validateEntry({
        resourceId: query.resourceId,
        userId: query.userId,
        desiredStartTime: query.desiredStartTime,
        desiredEndTime: query.desiredEndTime,
        priority: query.priority,
        programId: query.programId,
        expectedAttendees: query.expectedAttendees,
        excludeEntryId: query.excludeEntryId
      });

      this.logger.log('Waiting list entry validation query completed', {
        isValid: validation.isValid,
        errorsCount: validation.violations.length,
        warningsCount: validation.warnings.length
      });

      return {
        isValid: validation.isValid,
        errors: validation.violations,
        warnings: validation.warnings
      };

    } catch (error) {
      this.logger.error('Failed to validate waiting list entry query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListAlternativesQuery)
export class GetWaitingListAlternativesHandler implements IQueryHandler<GetWaitingListAlternativesQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListAlternativesQuery): Promise<any[]> {
    this.logger.log('Getting waiting list alternatives', {
      resourceId: query.resourceId,
      desiredStartTime: query.desiredStartTime,
      desiredEndTime: query.desiredEndTime,
      userId: query.userId,
      limit: query.limit
    });

    try {
      const alternatives = await this.waitingListService.getAlternatives({
        resourceId: query.resourceId,
        desiredStartTime: query.desiredStartTime,
        desiredEndTime: query.desiredEndTime,
        userId: query.userId,
        acceptAlternativeResources: query.acceptAlternativeResources,
        maxDurationDifference: query.maxDurationDifference,
        flexibleTimeRange: query.flexibleTimeRange,
        limit: query.limit
      });

      this.logger.log('Waiting list alternatives retrieved successfully', {
        resourceId: query.resourceId,
        alternativesCount: alternatives.alternatives.length
      });

      return alternatives.alternatives;

    } catch (error) {
      this.logger.error('Failed to get waiting list alternatives', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetExpiredWaitingListEntriesQuery)
export class GetExpiredWaitingListEntriesHandler implements IQueryHandler<GetExpiredWaitingListEntriesQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetExpiredWaitingListEntriesQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating get expired waiting list entries query', {
      waitingListId: query.waitingListId,
      resourceId: query.resourceId,
      expiredBefore: query.expiredBefore,
      page: query.page,
      limit: query.limit
    });

    try {
      const result = await this.waitingListService.getExpiredWaitingListEntries({
        waitingListId: query.waitingListId,
        resourceId: query.resourceId,
        expiredBefore: query.expiredBefore,
        includeProcessed: query.includeProcessed,
        page: query.page,
        limit: query.limit
      });

      this.logger.log('Expired waiting list entries retrieved successfully', {
        count: result.items.length,
        total: result.total
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to orchestrate get expired waiting list entries query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(SearchWaitingListsQuery)
export class SearchWaitingListsHandler implements IQueryHandler<SearchWaitingListsQuery> {
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: SearchWaitingListsQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating waiting lists search query', {
      searchTerm: query.searchTerm,
      filters: query.filters,
      page: query.page,
      limit: query.limit
    });

    try {
      const result = await this.waitingListService.searchWaitingLists({
        searchTerm: query.searchTerm,
        filters: query.filters,
        page: query.page,
        limit: query.limit,
        includeEntries: query.includeEntries,
        includeStats: query.includeStats
      });

      this.logger.log('Waiting lists search completed successfully', {
        searchTerm: query.searchTerm,
        count: result.items.length,
        total: result.total
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to orchestrate waiting lists search query', error);
      throw error;
    }
  }
}
