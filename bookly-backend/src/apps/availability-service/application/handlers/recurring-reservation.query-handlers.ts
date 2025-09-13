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

// Application Services
import { RecurringReservationService } from '../services/recurring-reservation.service';

// Entities
import { RecurringReservationEntity } from '../../domain/entities/recurring-reservation.entity';
import { RecurringReservationInstanceEntity } from '../../domain/entities/recurring-reservation-instance.entity';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { RecurrenceFrequency, RecurringReservationStatus } from '../../utils';

@Injectable()
@QueryHandler(GetRecurringReservationQuery)
export class GetRecurringReservationHandler implements IQueryHandler<GetRecurringReservationQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationQuery): Promise<RecurringReservationEntity & { instances?: RecurringReservationInstanceEntity[]; stats?: any }> {
    this.logger.log('Orchestrating get recurring reservation query', {
      id: query.id,
      userId: query.userId,
      includeInstances: query.includeInstances,
      includeStats: query.includeStats
    });

    try {
      const result = await this.recurringReservationService.getRecurringReservation(
        query.id,
        query.userId,
        query.includeInstances,
        query.includeStats
      );
      this.logger.log('Recurring reservation retrieved successfully', { id: query.id });
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get recurring reservation query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationsQuery)
export class GetRecurringReservationsHandler implements IQueryHandler<GetRecurringReservationsQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationsQuery): Promise<{ items: RecurringReservationEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating get recurring reservations query', {
      userId: query.userId,
      resourceId: query.resourceId,
      page: query.page,
      limit: query.limit
    });

    try {
      const filters = {
        userId: query.userId,
        resourceId: query.resourceId,
        programId: query.programId,
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate
      };

      const pagination = {
        page: query.page || 1,
        limit: Math.min(query.limit || 10, 100),
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'DESC'
      };

      const options = {
        includeStats: query.includeStats,
        includeInstances: query.includeInstances
      };

      const result = await this.recurringReservationService.getRecurringReservations(
        filters,
        pagination,
        options,
        query.userId
      );
      
      this.logger.log('Recurring reservations retrieved successfully', {
        total: result.total,
        page: result.page,
        limit: result.limit
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get recurring reservations query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationInstancesQuery)
export class GetRecurringReservationInstancesHandler implements IQueryHandler<GetRecurringReservationInstancesQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationInstancesQuery): Promise<{ items: RecurringReservationInstanceEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating get recurring reservation instances query', {
      recurringReservationId: query.recurringReservationId,
      status: query.status,
      page: query.page,
      limit: query.limit
    });

    try {
      const filters = {
        status: query.status,
        fromDate: query.startDate,
        toDate: query.endDate
      };

      const pagination = {
        page: query.page || 1,
        limit: Math.min(query.limit || 10, 100),
        sortBy: query.sortBy || 'scheduledDate',
        sortOrder: query.sortOrder || 'ASC'
      };

      const result = await this.recurringReservationService.getRecurringReservationInstances(
        query.recurringReservationId,
        query.userId,
        filters,
        pagination
      );
      
      this.logger.log('Recurring reservation instances retrieved successfully', {
        total: result.total,
        page: result.page,
        limit: result.limit
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get recurring reservation instances query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationStatsQuery)
export class GetRecurringReservationStatsHandler implements IQueryHandler<GetRecurringReservationStatsQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationStatsQuery): Promise<any> {
    this.logger.log('Orchestrating get recurring reservation stats query', {
      id: query.id,
      userId: query.userId,
      includeProjections: query.includeProjections,
      includeComparisons: query.includeComparisons
    });

    try {
      const result = await this.recurringReservationService.getRecurringReservationStats(
        query.id,
        query.userId,
        query.includeProjections,
        query.includeComparisons
      );
      
      this.logger.log('Recurring reservation stats retrieved successfully', { id: query.id });
      return result;

    } catch (error) {
      this.logger.error('Failed to orchestrate get recurring reservation stats query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(ValidateRecurringReservationQuery)
export class ValidateRecurringReservationQueryHandler implements IQueryHandler<ValidateRecurringReservationQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: ValidateRecurringReservationQuery): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Orchestrating validate recurring reservation query', {
      userId: query.userId,
      resourceId: query.resourceId,
      frequency: query.frequency
    });

    try {
      const createDto = {
        title: query.title,
        resourceId: query.resourceId,
        startDate: query.startDate.toISOString(),
        endDate: query.endDate.toISOString(),
        startTime: query.startTime,
        endTime: query.endTime,
        frequency: query.frequency,
        interval: query.interval,
        daysOfWeek: query.daysOfWeek,
        dayOfMonth: query.dayOfMonth
      };

      const result = await this.recurringReservationService.validateRecurringReservationQuery(
        createDto,
        query.userId,
        query.excludeId
      );
      
      this.logger.log('Recurring reservation validation completed', {
        isValid: result.isValid,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate validate recurring reservation query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationConflictsQuery)
export class GetRecurringReservationConflictsHandler implements IQueryHandler<GetRecurringReservationConflictsQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationConflictsQuery): Promise<any> {
    this.logger.log('Orchestrating get recurring reservation conflicts query', {
      id: query.id,
      userId: query.userId,
      checkFutureOnly: query.checkFutureOnly
    });

    try {
      const result = await this.recurringReservationService.getRecurringReservationConflicts(
        query.id,
        query.userId,
        query.checkFutureOnly,
        query.includeResolutions
      );
      
      this.logger.log('Recurring reservation conflicts retrieved successfully', {
        id: query.id
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get recurring reservation conflicts query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserRecurringReservationsQuery)
export class GetUserRecurringReservationsHandler implements IQueryHandler<GetUserRecurringReservationsQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUserRecurringReservationsQuery): Promise<any> {
    this.logger.log('Orchestrating get user recurring reservations query', {
      userId: query.userId,
      status: query.status,
      limit: query.limit
    });

    try {
      const result = await this.recurringReservationService.getUserRecurringReservations(
        query.userId,
        query.status,
        query.includeStats,
        query.includeUpcoming,
        query.limit,
        query.userId
      );
      
      this.logger.log('User recurring reservations retrieved successfully', {
        userId: query.userId
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get user recurring reservations query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetRecurringReservationAnalyticsQuery)
export class GetRecurringReservationAnalyticsHandler implements IQueryHandler<GetRecurringReservationAnalyticsQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetRecurringReservationAnalyticsQuery): Promise<any> {
    this.logger.log('Orchestrating get recurring reservation analytics query', {
      userId: query.userId,
      resourceId: query.resourceId,
      programId: query.programId,
      groupBy: query.groupBy,
      metrics: query.metrics
    });

    try {
      const filters = {
        userId: query.userId,
        resourceId: query.resourceId,
        programId: query.programId,
        startDate: query.startDate,
        endDate: query.endDate
      };

      const options = {
        groupBy: query.groupBy,
        metrics: query.metrics
      };

      const result = await this.recurringReservationService.getRecurringReservationAnalytics(
        filters,
        options,
        query.userId
      );
      
      this.logger.log('Recurring reservation analytics retrieved successfully', {
        userId: query.userId,
        resourceId: query.resourceId,
        groupBy: query.groupBy
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get recurring reservation analytics query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUpcomingRecurringInstancesQuery)
export class GetUpcomingRecurringInstancesHandler implements IQueryHandler<GetUpcomingRecurringInstancesQuery> {
  constructor(
    private readonly recurringReservationService: RecurringReservationService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUpcomingRecurringInstancesQuery): Promise<RecurringReservationInstanceEntity[]> {
    this.logger.log('Orchestrating get upcoming recurring instances query', {
      userId: query.userId,
      resourceId: query.resourceId,
      programId: query.programId,
      days: query.days,
      limit: query.limit
    });

    try {
      const filters = {
        userId: query.userId,
        resourceId: query.resourceId,
        programId: query.programId
      };

      const result = await this.recurringReservationService.getUpcomingRecurringInstances(
        filters,
        query.days,
        query.includeUnconfirmed,
        query.limit,
        query.userId
      );
      
      this.logger.log('Upcoming recurring instances retrieved successfully', {
        userId: query.userId,
        resourceId: query.resourceId,
        instancesCount: result.length
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get upcoming recurring instances query', error);
      throw error;
    }
  }
}
