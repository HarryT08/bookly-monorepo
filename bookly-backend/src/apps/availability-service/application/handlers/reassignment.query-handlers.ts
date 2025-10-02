/**
 * Query Handlers for Reassignment Request Management (RF-15)
 * CQRS Query Handler Pattern Implementation
 */

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';

// Queries
import {
  GetReassignmentRequestQuery,
  GetReassignmentRequestsQuery,
  GetUserReassignmentRequestsQuery,
  GetEquivalentResourcesQuery,
  GetReassignmentRequestStatsQuery,
  ValidateReassignmentRequestQuery,
  GetReassignmentSuggestionsQuery,
  GetReassignmentAnalyticsQuery,
  GetPendingReassignmentRequestsQuery,
  GetReassignmentRequestHistoryQuery,
  GetResourceReassignmentRequestsQuery,
  GetProgramReassignmentRequestsQuery,
  SearchReassignmentRequestsQuery,
  GetReassignmentSuccessPredictionQuery,
  GetUserReassignmentHistoryQuery,
  GetReassignmentTrendsQuery,
  GetReassignmentConfigurationQuery,
  GetReassignmentImpactAnalysisQuery,
  GetReassignmentQueueOptimizationQuery,
  GetUserReassignmentPreferencesQuery,
  GetReassignmentNotificationStatusQuery,
  GetReassignmentResourceCompatibilityQuery,
  GetReassignmentAlternativeTimeSlotsQuery,
  GetReassignmentBulkOperationStatusQuery
} from '../queries/reassignment.queries';

// Application Service
import { ReassignmentService } from '../services/reassignment.service';

// Entities
import { ReassignmentRequestEntity } from '../../domain/entities/reassignment-request.entity';

@Injectable()
@QueryHandler(GetReassignmentRequestQuery)
export class GetReassignmentRequestHandler implements IQueryHandler<GetReassignmentRequestQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentRequestQuery): Promise<ReassignmentRequestEntity & { equivalentResources?: any[]; alternativeTimeSlots?: any[]; processingHistory?: any[]; notificationHistory?: any[] }> {
    this.logger.log('Orchestrating get reassignment request query', {
      reassignmentRequestId: query.reassignmentRequestId,
      userId: query.userId,
      includeEquivalentResources: query.includeEquivalentResources,
      includeProcessingHistory: query.includeProcessingHistory
    });

    try {
      const result = await this.reassignmentService.getReassignmentRequest(
        query.reassignmentRequestId,
        query.userId,
        query.includeEquivalentResources,
        query.includeAlternativeTimeSlots,
        query.includeProcessingHistory,
        query.includeNotificationHistory
      );

      this.logger.log('Reassignment request retrieved successfully', {
        reassignmentRequestId: query.reassignmentRequestId
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment request query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentRequestsQuery)
export class GetReassignmentRequestsHandler implements IQueryHandler<GetReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating get reassignment requests query', {
      filters: query.filters,
      pagination: query.pagination,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getReassignmentRequests(
        query.filters,
        query.pagination,
        query.options,
        query.requestingUserId
      );

      this.logger.log('Reassignment requests retrieved successfully', {
        count: result.items.length,
        total: result.total,
        page: result.page
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment requests query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserReassignmentRequestsQuery)
export class GetUserReassignmentRequestsHandler implements IQueryHandler<GetUserReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUserReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; stats?: any }> {
    this.logger.log('Orchestrating get user reassignment requests query', {
      userId: query.userId,
      status: query.status,
      userResponse: query.userResponse,
      includeExpired: query.includeExpired,
      includeEquivalentResources: query.includeEquivalentResources,
      page: query.page,
      limit: query.limit
    });

    try {
      const result = await this.reassignmentService.getUserReassignmentRequests(
        query.userId,
        query.status,
        query.userResponse,
        query.includeExpired,
        query.includeEquivalentResources,
        query.page,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('User reassignment requests retrieved successfully', {
        userId: query.userId,
        count: result.items.length,
        total: result.total
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get user reassignment requests query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetEquivalentResourcesQuery)
export class GetEquivalentResourcesHandler implements IQueryHandler<GetEquivalentResourcesQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetEquivalentResourcesQuery): Promise<any[]> {
    this.logger.log('Orchestrating get equivalent resources query', {
      originalResourceId: query.originalResourceId,
      startTime: query.startTime,
      endTime: query.endTime,
      capacityTolerancePercent: query.capacityTolerancePercent
    });

    try {
      const result = await this.reassignmentService.getEquivalentResources(
        query.originalResourceId,
        query.startTime,
        query.endTime,
        query.capacityTolerancePercent,
        query.requiredFeatures,
        query.preferredFeatures,
        query.maxDistanceMeters,
        query.excludeResourceIds,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('Equivalent resources found successfully', {
        resourcesFound: result.length,
        originalResourceId: query.originalResourceId
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get equivalent resources query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentRequestStatsQuery)
export class GetReassignmentRequestStatsHandler implements IQueryHandler<GetReassignmentRequestStatsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentRequestStatsQuery): Promise<any> {
    this.logger.log('Orchestrating get reassignment request stats query', {
      reassignmentRequestId: query.reassignmentRequestId,
      requestingUserId: query.requestingUserId
    });

    try {
      const stats = await this.reassignmentService.getReassignmentRequestStats(
        query.reassignmentRequestId,
        query.requestingUserId
      );

      this.logger.log('Reassignment request stats retrieved successfully', {
        reassignmentRequestId: query.reassignmentRequestId
      });

      return stats;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment request stats query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentAnalyticsQuery)
export class GetReassignmentAnalyticsHandler implements IQueryHandler<GetReassignmentAnalyticsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentAnalyticsQuery): Promise<any> {
    this.logger.log('Orchestrating get reassignment analytics query', {
      filters: query.filters,
      metrics: query.metrics,
      groupBy: query.groupBy,
      requestingUserId: query.requestingUserId
    });

    try {
      const analytics = await this.reassignmentService.getReassignmentAnalytics(
        query.filters,
        query.metrics,
        query.groupBy,
        query.requestingUserId
      );

      this.logger.log('Reassignment analytics retrieved successfully', {
        metricsCount: query.metrics.length,
        groupBy: query.groupBy
      });

      return analytics;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment analytics query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(ValidateReassignmentRequestQuery)
export class ValidateReassignmentRequestHandler implements IQueryHandler<ValidateReassignmentRequestQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: ValidateReassignmentRequestQuery): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Orchestrating validate reassignment request query', {
      originalReservationId: query.originalReservationId,
      reason: query.reason,
      suggestedResourceId: query.suggestedResourceId,
      requestingUserId: query.requestingUserId
    });

    try {
      const validation = await this.reassignmentService.validateReassignmentRequest(
        query.originalReservationId,
        query.reason,
        query.requestingUserId
      );

      this.logger.log('Reassignment request validation completed', {
        isValid: validation.isValid,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length
      });

      return validation;
    } catch (error) {
      this.logger.error('Failed to orchestrate validate reassignment request query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentSuggestionsQuery)
export class GetReassignmentSuggestionsHandler implements IQueryHandler<GetReassignmentSuggestionsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentSuggestionsQuery): Promise<any[]> {
    this.logger.log('Orchestrating get reassignment suggestions query', {
      originalReservationId: query.originalReservationId,
      criteria: query.criteria,
      limit: query.limit,
      requestingUserId: query.requestingUserId
    });

    try {
      const suggestions = await this.reassignmentService.getReassignmentSuggestions(
        query.originalReservationId,
        query.criteria,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('Reassignment suggestions generated successfully', {
        originalReservationId: query.originalReservationId,
        suggestionsCount: suggestions.length,
        criteriaUsed: query.criteria
      });

      return suggestions;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment suggestions query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetPendingReassignmentRequestsQuery)
export class GetPendingReassignmentRequestsHandler implements IQueryHandler<GetPendingReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetPendingReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; stats?: any }> {
    this.logger.log('Orchestrating get pending reassignment requests query', {
      userId: query.userId,
      priority: query.priority,
      reason: query.reason,
      expiringSoon: query.expiringSoon,
      hoursUntilExpiry: query.hoursUntilExpiry,
      includeEquivalentResources: query.includeEquivalentResources,
      page: query.page,
      limit: query.limit,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getPendingReassignmentRequests(
        query.userId,
        query.priority,
        query.reason,
        query.expiringSoon,
        query.hoursUntilExpiry,
        query.includeEquivalentResources,
        query.page,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('Pending reassignment requests retrieved successfully', {
        count: result.items.length,
        expiringSoon: query.expiringSoon,
        includeEquivalentResources: query.includeEquivalentResources
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get pending reassignment requests query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentSuccessPredictionQuery)
export class GetReassignmentSuccessPredictionHandler implements IQueryHandler<GetReassignmentSuccessPredictionQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentSuccessPredictionQuery): Promise<{ probability: number; factors: any[]; recommendations: string[] }> {
    this.logger.log('Orchestrating get reassignment success prediction query', {
      reassignmentRequestId: query.reassignmentRequestId,
      requestingUserId: query.requestingUserId
    });

    try {
      const prediction = await this.reassignmentService.getReassignmentSuccessPrediction(
        query.reassignmentRequestId,
        query.requestingUserId
      );

      this.logger.log('Reassignment success prediction retrieved successfully', {
        reassignmentRequestId: query.reassignmentRequestId,
        probability: prediction.probability
      });

      return prediction;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment success prediction query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(SearchReassignmentRequestsQuery)
export class SearchReassignmentRequestsHandler implements IQueryHandler<SearchReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: SearchReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; highlights?: any }> {
    this.logger.log('Orchestrating search reassignment requests query', {
      searchTerm: query.searchTerm,
      filters: query.filters,
      page: query.page,
      limit: query.limit,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getReassignmentRequests(
        { ...query.filters, searchTerm: query.searchTerm },
        { page: query.page, limit: query.limit },
        { includeEquivalentResources: query.includeEquivalentResources, includeStats: query.includeStats },
        query.requestingUserId
      );

      this.logger.log('Reassignment requests search completed successfully', {
        searchTerm: query.searchTerm,
        count: result.items.length,
        total: result.total
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate search reassignment requests query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentRequestHistoryQuery)
export class GetReassignmentRequestHistoryHandler implements IQueryHandler<GetReassignmentRequestHistoryQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentRequestHistoryQuery): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    this.logger.log('Orchestrating get reassignment request history query', {
      reassignmentRequestId: query.reassignmentRequestId,
      includeProcessingSteps: query.includeProcessingSteps,
      includeNotifications: query.includeNotifications,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getReassignmentRequestHistory(
        query.reassignmentRequestId,
        query.includeProcessingSteps,
        query.includeNotifications,
        query.includeUserInteractions,
        query.page,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('Reassignment request history retrieved successfully', {
        reassignmentRequestId: query.reassignmentRequestId,
        count: result.items.length,
        total: result.total
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment request history query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetResourceReassignmentRequestsQuery)
export class GetResourceReassignmentRequestsHandler implements IQueryHandler<GetResourceReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetResourceReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; stats?: any }> {
    this.logger.log('Orchestrating get resource reassignment requests query', {
      resourceId: query.resourceId,
      status: query.status,
      includeStats: query.includeStats,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getResourceReassignmentRequests(
        query.resourceId,
        query.status,
        query.reason,
        query.startDate,
        query.endDate,
        query.includeStats,
        query.page,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('Resource reassignment requests retrieved successfully', {
        resourceId: query.resourceId,
        count: result.items.length,
        total: result.total
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get resource reassignment requests query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetProgramReassignmentRequestsQuery)
export class GetProgramReassignmentRequestsHandler implements IQueryHandler<GetProgramReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetProgramReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; stats?: any }> {
    this.logger.log('Orchestrating get program reassignment requests query', {
      programId: query.programId,
      status: query.status,
      includeStats: query.includeStats,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getProgramReassignmentRequests(
        query.programId,
        query.status,
        query.reason,
        query.includeStats,
        query.page,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('Program reassignment requests retrieved successfully', {
        programId: query.programId,
        count: result.items.length,
        total: result.total
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get program reassignment requests query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserReassignmentHistoryQuery)
export class GetUserReassignmentHistoryHandler implements IQueryHandler<GetUserReassignmentHistoryQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUserReassignmentHistoryQuery): Promise<{ items: any[]; total: number; stats?: any; patterns?: any }> {
    this.logger.log('Orchestrating get user reassignment history query', {
      userId: query.userId,
      includeStats: query.includeStats,
      includePatterns: query.includePatterns,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getUserReassignmentHistory(
        query.userId,
        query.includeStats,
        query.includePatterns,
        query.startDate,
        query.endDate,
        query.page,
        query.limit,
        query.requestingUserId
      );

      this.logger.log('User reassignment history retrieved successfully', {
        userId: query.userId,
        count: result.items.length,
        total: result.total
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get user reassignment history query', error);
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentTrendsQuery)
export class GetReassignmentTrendsHandler implements IQueryHandler<GetReassignmentTrendsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentTrendsQuery): Promise<any> {
    this.logger.log('Orchestrating get reassignment trends query', {
      resourceId: query.resourceId,
      programId: query.programId,
      timeframe: query.timeframe,
      metrics: query.metrics,
      requestingUserId: query.requestingUserId
    });

    try {
      const result = await this.reassignmentService.getReassignmentTrends(
        query.resourceId,
        query.programId,
        query.timeframe,
        query.metrics,
        query.compareWithPrevious,
        query.requestingUserId
      );

      this.logger.log('Reassignment trends retrieved successfully', {
        timeframe: query.timeframe,
        metricsCount: query.metrics.length
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to orchestrate get reassignment trends query', error);
      throw error;
    }
  }
}
