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

// Domain Services
import { WaitingListDomainService } from '../../domain/services/waiting-list-domain.service';

// Repositories
import { WaitingListEntryRepository } from '../../domain/repositories/waiting-list-entry.repository';

// Entities
import { WaitingListEntryEntity } from '../../domain/entities/waiting-list-entry.entity';
import { LoggingHelper } from '@/libs/logging/logging.helper';

@Injectable()
@QueryHandler(GetWaitingListQuery)
export class GetWaitingListHandler implements IQueryHandler<GetWaitingListQuery> {
  constructor(
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly waitingListService: WaitingListDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListQuery): Promise<WaitingListEntryEntity & { entries?: WaitingListEntryEntity[]; stats?: any; alternatives?: any[] }> {
    this.logger.log('Getting waiting list', {
      waitingListId: query.waitingListId,
      userId: query.userId,
      includeEntries: query.includeEntries,
      includeStats: query.includeStats
    });

    try {
      const waitingList = await this.waitingListEntryRepository.findByWaitingListId(query.waitingListId);
      if (!waitingList) {
        throw new NotFoundException(`Waiting list with ID ${query.waitingListId} not found`);
      }

      const result: any = { ...waitingList };

      // Include entries if requested
      if (query.includeEntries) {
        result.entries = await this.waitingListEntryRepository.findByWaitingListId(query.waitingListId);
      }

      // Include stats if requested
      if (query.includeStats) {
        result.stats = await this.waitingListService.getWaitingListStats(query.waitingListId);
      }

      // Include alternatives if requested
      if (query.includeAlternatives) {
        result.alternatives = await Promise.all(waitingList.map(async (entry, index) => {
          return await this.waitingListService.getAlternativeSlots(
            entry.resourceId,
            entry.requestedAt,
            entry.expiredAt,
            query.userId
          );
        }));
      }

      this.logger.log('Waiting list retrieved successfully', {
        waitingListId: query.waitingListId,
        entriesCount: result.entries?.length || 0
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to get waiting list', error, LoggingHelper.logParams({
        waitingListId: query.waitingListId,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListsQuery)
export class GetWaitingListsHandler implements IQueryHandler<GetWaitingListsQuery> {
  constructor(
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly waitingListService: WaitingListDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListsQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting waiting lists', {
      resourceId: query.resourceId,
      date: query.date,
      status: query.status,
      page: query.page,
      limit: query.limit
    });

    try {
      const filters = {
        resourceId: query.resourceId,
        date: query.date,
        status: query.status
      };

      const { items, total } = await this.waitingListEntryRepository.findMany(
        filters,
        query.page,
        query.limit,
        query.sortBy,
        query.sortOrder
      );

      // Enhance with entries and stats if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.includeEntries) {
            enhanced.entries = await this.waitingListEntryRepository.findByWaitingListId(item.id);
          }

          if (query.includeStats) {
            enhanced.stats = await this.waitingListService.getWaitingListStats(item.id);
          }

          return enhanced;
        })
      );

      this.logger.log('Waiting lists retrieved successfully', {
        count: items.length,
        total,
        page: query.page
      });

      return {
        items: enhancedItems,
        total,
        page: query.page,
        limit: query.limit
      };

    } catch (error) {
      this.logger.error('Failed to get waiting lists', error, LoggingHelper.logParams({
        resourceId: query.resourceId,
        date: query.date
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListEntryQuery)
export class GetWaitingListEntryHandler implements IQueryHandler<GetWaitingListEntryQuery> {
  constructor(
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly waitingListService: WaitingListDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListEntryQuery): Promise<WaitingListEntryEntity & { position?: number; estimatedWait?: number; alternatives?: any[] }> {
    this.logger.log('Getting waiting list entry', {
      waitingListId: query.waitingListId,
      entryId: query.entryId,
      userId: query.userId
    });

    try {
      const entry = await this.waitingListEntryRepository.findById(query.entryId);
      if (!entry) {
        throw new NotFoundException(`Waiting list entry with ID ${query.entryId} not found`);
      }

      // Check permissions (users can only see their own entries unless admin)
      if (entry.userId !== query.userId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view your own waiting list entries');
      }

      const result: any = { ...entry };

      // Include position if requested
      if (query.includePosition) {
        result.position = await this.waitingListService.getEntryPosition(query.waitingListId, query.entryId);
      }

      // Include estimated wait time if requested
      if (query.includeEstimatedWait) {
        result.estimatedWait = await this.waitingListService.getEstimatedWaitTime(query.waitingListId, query.entryId);
      }

      // Include alternatives if requested
      if (query.includeAlternatives) {
        result.alternatives = await this.waitingListService.getEntryAlternatives(query.entryId);
      }

      this.logger.log('Waiting list entry retrieved successfully', {
        entryId: query.entryId,
        position: result.position
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to get waiting list entry', error, LoggingHelper.logParams({
        waitingListId: query.waitingListId,
        entryId: query.entryId,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserWaitingListEntriesQuery)
export class GetUserWaitingListEntriesHandler implements IQueryHandler<GetUserWaitingListEntriesQuery> {
  constructor(
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly waitingListService: WaitingListDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUserWaitingListEntriesQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting user waiting list entries', {
      userId: query.userId,
      status: query.status,
      resourceId: query.resourceId,
      page: query.page,
      limit: query.limit
    });

    try {
      // Check permissions (users can only see their own entries unless admin)
      if (query.userId !== query.requestingUserId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view your own waiting list entries');
      }

      const filters = {
        userId: query.userId,
        status: query.status,
        resourceId: query.resourceId,
        programId: query.programId,
        includeExpired: query.includeExpired
      };

      const { items, total } = await this.waitingListEntryRepository.findByUser(
        filters,
        query.page,
        query.limit
      );

      // Enhance with estimated wait times if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.includeEstimatedWait) {
            enhanced.estimatedWait = await this.waitingListService.getEstimatedWaitTime(
              item.waitingListId,
              item.id
            );
          }

          return enhanced;
        })
      );

      this.logger.log('User waiting list entries retrieved successfully', {
        userId: query.userId,
        count: items.length,
        total
      });

      return {
        items: enhancedItems,
        total,
        page: query.page,
        limit: query.limit
      };

    } catch (error) {
      this.logger.error('Failed to get user waiting list entries', error, LoggingHelper.logParams({
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListStatsQuery)
export class GetWaitingListStatsHandler implements IQueryHandler<GetWaitingListStatsQuery> {
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListStatsQuery): Promise<any> {
    this.logger.log('Getting waiting list stats', {
      waitingListId: query.waitingListId,
      resourceId: query.resourceId,
      programId: query.programId,
      groupBy: query.groupBy
    });

    try {
      const stats = await this.waitingListService.getStats({
        waitingListId: query.waitingListId,
        resourceId: query.resourceId,
        programId: query.programId,
        startDate: query.startDate,
        endDate: query.endDate,
        groupBy: query.groupBy,
        includeProjections: query.includeProjections
      });

      this.logger.log('Waiting list stats retrieved successfully', {
        waitingListId: query.waitingListId,
        totalEntries: stats.totalEntries
      });

      return stats;

    } catch (error) {
      this.logger.error('Failed to get waiting list stats', error, LoggingHelper.logParams({
        waitingListId: query.waitingListId,
        resourceId: query.resourceId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListAnalyticsQuery)
export class GetWaitingListAnalyticsHandler implements IQueryHandler<GetWaitingListAnalyticsQuery> {
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetWaitingListAnalyticsQuery): Promise<any> {
    this.logger.log('Getting waiting list analytics', {
      resourceId: query.resourceId,
      programId: query.programId,
      groupBy: query.groupBy,
      metrics: query.metrics
    });

    try {
      const analytics = await this.waitingListService.getAnalytics({
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
      this.logger.error('Failed to get waiting list analytics', error, LoggingHelper.logParams({
        resourceId: query.resourceId,
        programId: query.programId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(ValidateWaitingListEntryQuery)
export class ValidateWaitingListEntryQueryHandler implements IQueryHandler<ValidateWaitingListEntryQuery> {
  constructor(
    private readonly waitingListService: WaitingListDomainService,
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
      this.logger.error('Failed to validate waiting list entry query', error, LoggingHelper.logParams({
        resourceId: query.resourceId,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetWaitingListAlternativesQuery)
export class GetWaitingListAlternativesHandler implements IQueryHandler<GetWaitingListAlternativesQuery> {
  constructor(
    private readonly waitingListService: WaitingListDomainService,
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
      this.logger.error('Failed to get waiting list alternatives', error, LoggingHelper.logParams({
        resourceId: query.resourceId,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetExpiredWaitingListEntriesQuery)
export class GetExpiredWaitingListEntriesHandler implements IQueryHandler<GetExpiredWaitingListEntriesQuery> {
  constructor(
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetExpiredWaitingListEntriesQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting expired waiting list entries', {
      waitingListId: query.waitingListId,
      resourceId: query.resourceId,
      expiredBefore: query.expiredBefore,
      page: query.page,
      limit: query.limit
    });

    try {
      const filters = {
        waitingListId: query.waitingListId,
        resourceId: query.resourceId,
        expiredBefore: query.expiredBefore,
        includeProcessed: query.includeProcessed
      };

      const { items, total } = await this.waitingListEntryRepository.findExpired(
        filters,
        query.page,
        query.limit
      );

      this.logger.log('Expired waiting list entries retrieved successfully', {
        count: items.length,
        total
      });

      return {
        items,
        total,
        page: query.page,
        limit: query.limit
      };

    } catch (error) {
      this.logger.error('Failed to get expired waiting list entries', error, LoggingHelper.logParams({
        waitingListId: query.waitingListId,
        resourceId: query.resourceId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(SearchWaitingListsQuery)
export class SearchWaitingListsHandler implements IQueryHandler<SearchWaitingListsQuery> {
  constructor(
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly waitingListService: WaitingListDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: SearchWaitingListsQuery): Promise<{ items: WaitingListEntryEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Searching waiting lists', {
      searchTerm: query.searchTerm,
      filters: query.filters,
      page: query.page,
      limit: query.limit
    });

    try {
      const { items, total } = await this.waitingListEntryRepository.search(
        query.searchTerm,
        query.filters,
        query.page,
        query.limit
      );

      // Enhance with entries and stats if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.includeEntries) {
            enhanced.entries = await this.waitingListService.getWaitingListEntries(item.id);
          }

          if (query.includeStats) {
            enhanced.stats = await this.waitingListService.getWaitingListStats(item.id);
          }

          return enhanced;
        })
      );

      this.logger.log('Waiting lists search completed successfully', {
        searchTerm: query.searchTerm,
        count: items.length,
        total
      });

      return {
        items: enhancedItems,
        total,
        page: query.page,
        limit: query.limit
      };

    } catch (error) {
      this.logger.error('Failed to search waiting lists', error, LoggingHelper.logParams({
        searchTerm: query.searchTerm
      }));
      throw error;
    }
  }
}
