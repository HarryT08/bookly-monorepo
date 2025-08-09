/**
 * Query Handlers for Recurring Reservations (RF-12)
 * CQRS Query Handler Pattern Implementation
 */

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';

// Queries
import {
  GetRecurringReservationQuery,
  GetRecurringReservationsQuery,
  GetRecurringReservationInstancesQuery,
  GetRecurringReservationStatsQuery,
  ValidateRecurringReservationQuery,
  GetRecurringReservationConflictsQuery,
  GetUserRecurringReservationsQuery,
  GetRecurringReservationAnalyticsQuery,
  GetUpcomingRecurringInstancesQuery} from '../queries/recurring-reservation.queries';

// Domain Services
import { RecurringReservationDomainService } from '../../domain/services/recurring-reservation-domain.service';

// Repositories
import { RecurringReservationRepository } from '../../domain/repositories/recurring-reservation.repository';
import { RecurringReservationInstanceRepository } from '../../domain/repositories/recurring-reservation-instance.repository';

// Entities
import { RecurringReservationEntity } from '../../domain/entities/recurring-reservation.entity';
import { RecurringReservationInstanceEntity } from '../../domain/entities/recurring-reservation-instance.entity';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { RecurrenceFrequency, RecurringReservationStatus } from '../../utils';

@Injectable()
@QueryHandler(GetRecurringReservationQuery)
export class GetRecurringReservationHandler implements IQueryHandler<GetRecurringReservationQuery> {
  constructor(
    private readonly recurringReservationRepository: RecurringReservationRepository,
    private readonly recurringReservationInstanceRepository: RecurringReservationInstanceRepository,
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationQuery): Promise<RecurringReservationEntity & { instances?: RecurringReservationInstanceEntity[]; stats?: any }> {
    this.logger.log('Getting recurring reservation', {
      id: query.id,
      userId: query.userId,
      includeInstances: query.includeInstances,
      includeStats: query.includeStats
    });

    try {
      const reservation = await this.recurringReservationRepository.findById(query.id);
      if (!reservation) {
        throw new NotFoundException(`Recurring reservation with ID ${query.id} not found`);
      }

      // Check permissions (users can only see their own reservations unless admin)
      if (reservation.userId !== query.userId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view your own reservations');
      }

      const result: any = { ...reservation };

      // Include instances if requested
      if (query.includeInstances) {
        result.instances = await this.recurringReservationInstanceRepository.findByRecurringReservationId(query.id);
      }

      // Include stats if requested
      if (query.includeStats) {
        result.stats = await this.recurringReservationService.getRecurringReservationStats(query.id);
      }

      this.logger.log('Recurring reservation retrieved successfully', {
        id: query.id,
        title: reservation.title
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to get recurring reservation', error, LoggingHelper.logParams({
        id: query.id,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationsQuery)
export class GetRecurringReservationsHandler implements IQueryHandler<GetRecurringReservationsQuery> {
  constructor(
    private readonly recurringReservationRepository: RecurringReservationRepository,
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationsQuery): Promise<{ items: RecurringReservationEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting recurring reservations', {
      userId: query.userId,
      resourceId: query.resourceId,
      programId: query.programId,
      page: query.page,
      limit: query.limit
    });

    try {
      const filters = {
        userId: query.userId,
        resourceId: query.resourceId,
        programId: query.programId,
        status: query.status,
        frequency: query.frequency,
        startDate: query.startDate,
        endDate: query.endDate,
        priority: query.priority,
        tags: query.tags
      };

      const { items, total } = await this.recurringReservationRepository.findMany(
        filters,
        query.page,
        query.limit,
        query.sortBy,
        query.sortOrder
      );

      // Enhance with stats and instances if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.includeStats) {
            enhanced.stats = await this.recurringReservationService.getRecurringReservationStats(item.id);
          }

          if (query.includeInstances) {
            enhanced.recentInstances = await this.recurringReservationService.getRecentInstances(item.id, 5);
            enhanced.upcomingInstances = await this.recurringReservationService.getUpcomingInstances(item.userId, item.resourceId, item.programId, 5, false, 5);
          }

          return enhanced;
        })
      );

      this.logger.log('Recurring reservations retrieved successfully', {
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
      this.logger.error('Failed to get recurring reservations', error, LoggingHelper.logParams({
        userId: query.userId,
        resourceId: query.resourceId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationInstancesQuery)
export class GetRecurringReservationInstancesHandler implements IQueryHandler<GetRecurringReservationInstancesQuery> {
  constructor(
    private readonly recurringReservationRepository: RecurringReservationRepository,
    private readonly recurringReservationInstanceRepository: RecurringReservationInstanceRepository,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationInstancesQuery): Promise<{ items: RecurringReservationInstanceEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting recurring reservation instances', {
      recurringReservationId: query.recurringReservationId,
      userId: query.userId,
      status: query.status,
      page: query.page,
      limit: query.limit
    });

    try {
      // Verify the recurring reservation exists and user has access
      const reservation = await this.recurringReservationRepository.findById(query.recurringReservationId);
      if (!reservation) {
        throw new NotFoundException(`Recurring reservation with ID ${query.recurringReservationId} not found`);
      }

      if (reservation.userId !== query.userId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view instances of your own reservations');
      }

      const filters = {
        recurringReservationId: query.recurringReservationId,
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate,
        includeConfirmed: query.includeConfirmed,
        includePending: query.includePending,
        includeCancelled: query.includeCancelled
      };

      const { items, total } = await this.recurringReservationInstanceRepository.findMany(
        filters,
        query.page,
        query.limit,
        query.sortBy,
        query.sortOrder
      );

      this.logger.log('Recurring reservation instances retrieved successfully', {
        recurringReservationId: query.recurringReservationId,
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
      this.logger.error('Failed to get recurring reservation instances', error, LoggingHelper.logParams({
        recurringReservationId: query.recurringReservationId,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationStatsQuery)
export class GetRecurringReservationStatsHandler implements IQueryHandler<GetRecurringReservationStatsQuery> {
  constructor(
    private readonly recurringReservationRepository: RecurringReservationRepository,
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationStatsQuery): Promise<any> {
    this.logger.log('Getting recurring reservation stats', {
      id: query.id,
      userId: query.userId,
      includeProjections: query.includeProjections,
      includeComparisons: query.includeComparisons
    });

    try {
      // Verify the recurring reservation exists and user has access
      const reservation = await this.recurringReservationRepository.findById(query.id);
      if (!reservation) {
        throw new NotFoundException(`Recurring reservation with ID ${query.id} not found`);
      }

      if (reservation.userId !== query.userId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view stats of your own reservations');
      }

      const stats = await this.recurringReservationService.getRecurringReservationStats(query.id);

      // Add projections if requested
      if (query.includeProjections) {
        stats.projections = await this.recurringReservationService.getProjections(query.id);
      }

      // Add comparisons if requested
      if (query.includeComparisons) {
        stats.comparisons = await this.recurringReservationService.getComparisons(query.id, query.userId);
      }

      this.logger.log('Recurring reservation stats retrieved successfully', {
        id: query.id,
        totalInstances: stats.totalInstances,
        confirmedInstances: stats.confirmedInstances
      });

      return stats;

    } catch (error) {
      this.logger.error('Failed to get recurring reservation stats', error, LoggingHelper.logParams({
        id: query.id,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(ValidateRecurringReservationQuery)
export class ValidateRecurringReservationQueryHandler implements IQueryHandler<ValidateRecurringReservationQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: ValidateRecurringReservationQuery): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Validating recurring reservation query', {
      userId: query.userId,
      resourceId: query.resourceId,
      frequency: query.frequency
    });

    try {
      // Create temporary entity for validation
      const tempReservation = RecurringReservationEntity.create({
        excludeId: query.excludeId || 'temp-id',
        title: query.title,
        resourceId: query.resourceId,
        userId: query.userId,
        startDate: query.startDate,
        endDate: query.endDate,
        startTime: query.startTime,
        endTime: query.endTime,
        frequency: query.frequency || RecurrenceFrequency.WEEKLY,
        interval: query.interval,
        daysOfWeek: query.daysOfWeek,
        dayOfMonth: query.dayOfMonth,
        programId: query.programId,
        status: RecurringReservationStatus.ACTIVE,
        totalInstances: 0,
        confirmedInstances: 0
      });

      const validation = await this.recurringReservationService.validateRecurringReservation(
        tempReservation,
        query.maxInstances,
        query.allowOverlap
      );

      this.logger.log('Recurring reservation validation query completed', LoggingHelper.logParams({
        isValid: validation.isValid,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length
      }));

      return validation;

    } catch (error) {
      this.logger.error('Failed to validate recurring reservation query', error, LoggingHelper.logParams({
        userId: query.userId,
        resourceId: query.resourceId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationConflictsQuery)
export class GetRecurringReservationConflictsHandler implements IQueryHandler<GetRecurringReservationConflictsQuery> {
  constructor(
    private readonly recurringReservationRepository: RecurringReservationRepository,
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationConflictsQuery): Promise<any> {
    this.logger.log('Getting recurring reservation conflicts', {
      id: query.id,
      userId: query.userId,
      checkFutureOnly: query.checkFutureOnly
    });

    try {
      // Verify the recurring reservation exists and user has access
      const reservation = await this.recurringReservationRepository.findById(query.id);
      if (!reservation) {
        throw new NotFoundException(`Recurring reservation with ID ${query.id} not found`);
      }

      if (reservation.userId !== query.userId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view conflicts of your own reservations');
      }

      const conflicts = await this.recurringReservationService.getConflicts(
        query.id,
        query.checkFutureOnly,
        query.includeResolutions
      );

      this.logger.log('Recurring reservation conflicts retrieved successfully', {
        id: query.id,
        conflictsCount: conflicts.length
      });

      return conflicts;

    } catch (error) {
      this.logger.error('Failed to get recurring reservation conflicts', error, LoggingHelper.logParams({
        id: query.id,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserRecurringReservationsQuery)
export class GetUserRecurringReservationsHandler implements IQueryHandler<GetUserRecurringReservationsQuery> {
  constructor(
    private readonly recurringReservationRepository: RecurringReservationRepository,
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUserRecurringReservationsQuery): Promise<any> {
    this.logger.log('Getting user recurring reservations', {
      userId: query.userId,
      status: query.status,
      limit: query.limit
    });

    try {
      // Check permissions (users can only see their own reservations unless admin)
      if (query.userId !== query.requestingUserId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view your own reservations');
      }

      const reservations = await this.recurringReservationRepository.findByUserId(
        query.userId,
        query.status,
        query.limit
      );

      const result: any = { reservations };

      // Include stats if requested
      if (query.includeStats) {
        result.stats = await this.recurringReservationService.getUserStats(query.userId);
      }

      // Include upcoming instances if requested
      if (query.includeUpcoming) {
        result.upcomingInstances = await this.recurringReservationService.getUserUpcomingInstances(
          query.userId,
          7 // next 7 days
        );
      }

      this.logger.log('User recurring reservations retrieved successfully', {
        userId: query.userId,
        count: reservations.length
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to get user recurring reservations', error, LoggingHelper.logParams({
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationAnalyticsQuery)
export class GetRecurringReservationAnalyticsHandler implements IQueryHandler<GetRecurringReservationAnalyticsQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationAnalyticsQuery): Promise<any> {
    this.logger.log('Getting recurring reservation analytics', {
      userId: query.userId,
      resourceId: query.resourceId,
      programId: query.programId,
      groupBy: query.groupBy,
      metrics: query.metrics
    });

    try {
      const analytics = await this.recurringReservationService.getAnalytics({
        userId: query.userId,
        resourceId: query.resourceId,
        programId: query.programId,
        startDate: query.startDate,
        endDate: query.endDate,
        groupBy: query.groupBy,
        metrics: query.metrics
      });

      this.logger.log('Recurring reservation analytics retrieved successfully', {
        dataPoints: analytics.dataPoints?.length || 0,
        metrics: query.metrics
      });

      return analytics;

    } catch (error) {
      this.logger.error('Failed to get recurring reservation analytics', error, LoggingHelper.logParams({
        userId: query.userId,
        resourceId: query.resourceId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUpcomingRecurringInstancesQuery)
export class GetUpcomingRecurringInstancesHandler implements IQueryHandler<GetUpcomingRecurringInstancesQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUpcomingRecurringInstancesQuery): Promise<RecurringReservationInstanceEntity[]> {
    this.logger.log('Getting upcoming recurring instances', {
      userId: query.userId,
      resourceId: query.resourceId,
      programId: query.programId,
      days: query.days,
      limit: query.limit
    });

    try {
      const instances = await this.recurringReservationService.getUpcomingInstances(
        query.userId,
        query.resourceId,
        query.programId,
        query.days,
        query.includeUnconfirmed,
        query.limit
      );

      this.logger.log('Upcoming recurring instances retrieved successfully', {
        count: instances.length,
        days: query.days
      });

      return instances;

    } catch (error) {
      this.logger.error('Failed to get upcoming recurring instances', error, LoggingHelper.logParams({
        userId: query.userId,
        resourceId: query.resourceId
      }));
      throw error;
    }
  }
}
