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

// Domain Services
import { getAnalyticsRequest, ReassignmentDomainService } from '../../domain/services/reassignment-domain.service';

// Repositories
import { ReassignmentRequestRepository } from '../../domain/repositories/reassignment-request.repository';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';

// Entities
import { ReassignmentRequestEntity } from '../../domain/entities/reassignment-request.entity';

@Injectable()
@QueryHandler(GetReassignmentRequestQuery)
export class GetReassignmentRequestHandler implements IQueryHandler<GetReassignmentRequestQuery> {
  constructor(
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentRequestQuery): Promise<ReassignmentRequestEntity & { equivalentResources?: any[]; alternativeTimeSlots?: any[]; processingHistory?: any[]; notificationHistory?: any[] }> {
    this.logger.log('Getting reassignment request', {
      reassignmentRequestId: query.reassignmentRequestId,
      userId: query.userId,
      includeEquivalentResources: query.includeEquivalentResources,
      includeProcessingHistory: query.includeProcessingHistory
    });

    try {
      const request = await this.reassignmentRequestRepository.findById(query.reassignmentRequestId);
      if (!request) {
        throw new NotFoundException(`Reassignment request with ID ${query.reassignmentRequestId} not found`);
      }

      // Check permissions
      const reservation = await this.reservationRepository.findById(request.originalReservationId);
      if (!reservation || (reservation.userId !== query.userId && request.requestedBy !== query.userId)) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view your own reassignment requests');
      }

      const result: any = { ...request };

      // Include equivalent resources if requested
      if (query.includeEquivalentResources) {
        result.equivalentResources = await this.reassignmentService.getEquivalentResources(query.reassignmentRequestId);
      }

      // Include alternative time slots if requested
      if (query.includeAlternativeTimeSlots) {
        result.alternativeTimeSlots = await this.reassignmentService.getAlternativeTimeSlots(query.reassignmentRequestId);
      }

      // Include processing history if requested
      if (query.includeProcessingHistory) {
        result.processingHistory = await this.reassignmentService.getProcessingHistory(query.reassignmentRequestId);
      }

      // Include notification history if requested
      if (query.includeNotificationHistory) {
        result.notificationHistory = await this.reassignmentService.getNotificationHistory(query.reassignmentRequestId);
      }

      this.logger.log('Reassignment request retrieved successfully', {
        reassignmentRequestId: query.reassignmentRequestId,
        status: request.status
      });

      return result;

    } catch (error) {
      this.logger.error('Failed to get reassignment request', error, LoggingHelper.logParams({
        reassignmentRequestId: query.reassignmentRequestId,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentRequestsQuery)
export class GetReassignmentRequestsHandler implements IQueryHandler<GetReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting reassignment requests', {
      filters: query.filters,
      pagination: query.pagination,
      requestingUserId: query.requestingUserId
    });

    try {
      const { items, total } = await this.reassignmentRequestRepository.findMany(
        query.filters as any,
        query.pagination.page,
        query.pagination.limit,
        query.pagination.sortBy || 'createdAt',
        query.pagination.sortOrder || 'DESC'
      );

      // Enhance with additional data if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.options.includeEquivalentResources) {
            enhanced.equivalentResources = await this.reassignmentService.getEquivalentResources(item.id);
          }

          if (query.options.includeStats) {
            enhanced.stats = await this.reassignmentService.getRequestStats(item.id);
          }

          if (query.options.includeProcessingHistory) {
            enhanced.processingHistory = await this.reassignmentService.getProcessingHistory(item.id);
          }

          return enhanced;
        })
      );

      this.logger.log('Reassignment requests retrieved successfully', {
        count: items.length,
        total,
        page: query.pagination.page
      });

      return {
        items: enhancedItems,
        total,
        page: query.pagination.page,
        limit: query.pagination.limit
      };

    } catch (error) {
      this.logger.error('Failed to get reassignment requests', error, LoggingHelper.logParams({
        filters: query.filters,
        requestingUserId: query.requestingUserId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetUserReassignmentRequestsQuery)
export class GetUserReassignmentRequestsHandler implements IQueryHandler<GetUserReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetUserReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting user reassignment requests', {
      userId: query.userId,
      status: query.status,
      userResponse: query.userResponse,
      page: query.page,
      limit: query.limit
    });

    try {
      // Check permissions (users can only see their own requests unless admin)
      if (query.userId !== query.requestingUserId) {
        // TODO: Add role-based permission check for admins
        throw new ForbiddenException('You can only view your own reassignment requests');
      }

      const filters = {
        userId: query.userId,
        status: query.status,
        userResponse: query.userResponse,
        includeExpired: query.includeExpired
      };

      const { items, total } = await this.reassignmentRequestRepository.findByUser(
        filters,
        query.page,
        query.limit
      );

      // Enhance with equivalent resources if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.includeEquivalentResources) {
            enhanced.equivalentResources = await this.reassignmentService.getEquivalentResources(item.id);
          }

          return enhanced;
        })
      );

      this.logger.log('User reassignment requests retrieved successfully', {
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
      this.logger.error('Failed to get user reassignment requests', error, LoggingHelper.logParams({
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetEquivalentResourcesQuery)
export class GetEquivalentResourcesHandler implements IQueryHandler<GetEquivalentResourcesQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetEquivalentResourcesQuery): Promise<any[]> {
    this.logger.log('Getting equivalent resources', {
      originalResourceId: query.originalResourceId,
      startTime: query.startTime,
      endTime: query.endTime,
      capacityTolerancePercent: query.capacityTolerancePercent,
      limit: query.limit
    });

    try {
      const equivalentResources = await this.reassignmentService.findEquivalentResourcesForTimeSlot(
        query.originalResourceId,
        query.startTime,
        query.endTime,
        query.capacityTolerancePercent,
        query.requiredFeatures,
        query.preferredFeatures,
        query.maxDistanceMeters,
        query.excludeResourceIds,
        query.limit
      );

      this.logger.log('Equivalent resources retrieved successfully', {
        originalResourceId: query.originalResourceId,
        foundCount: equivalentResources.length
      });

      return equivalentResources;

    } catch (error) {
      this.logger.error('Failed to get equivalent resources', error, LoggingHelper.logParams({
        originalResourceId: query.originalResourceId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentRequestStatsQuery)
export class GetReassignmentRequestStatsHandler implements IQueryHandler<GetReassignmentRequestStatsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentRequestStatsQuery): Promise<any> {
    this.logger.log('Getting reassignment request stats', {
      reassignmentRequestId: query.reassignmentRequestId,
      userId: query.userId,
      resourceId: query.resourceId,
      programId: query.programId,
      groupBy: query.groupBy
    });

    try {
      const stats = await this.reassignmentService.getStats({
        reassignmentRequestId: query.reassignmentRequestId,
        userId: query.userId,
        resourceId: query.resourceId,
        programId: query.programId,
        startDate: query.startDate,
        endDate: query.endDate,
        groupBy: query.groupBy,
        includeProjections: query.includeProjections
      });

      this.logger.log('Reassignment request stats retrieved successfully', LoggingHelper.logParams({
        reassignmentRequestId: query.reassignmentRequestId,
        totalRequests: stats.totalRequests
      }));

      return stats;

    } catch (error) {
      this.logger.error('Failed to get reassignment request stats', error, LoggingHelper.logParams({
        reassignmentRequestId: query.reassignmentRequestId,
        userId: query.userId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentAnalyticsQuery)
export class GetReassignmentAnalyticsHandler implements IQueryHandler<GetReassignmentAnalyticsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentAnalyticsQuery): Promise<any> {
    this.logger.log('Getting reassignment analytics', {
      filters: query.filters,
      metrics: query.metrics,
      groupBy: query.groupBy,
      requestingUserId: query.requestingUserId
    });

    try {
      const analytics = await this.reassignmentService.getAnalytics({
          ...query.filters,
          metrics: query.metrics,
          groupBy: query.groupBy
      } as unknown as getAnalyticsRequest);

      this.logger.log('Reassignment analytics retrieved successfully', {
        dataPoints: analytics.dataPoints?.length || 0,
        metrics: query.metrics
      });

      return analytics;

    } catch (error) {
      this.logger.error('Failed to get reassignment analytics', error, LoggingHelper.logParams({
        filters: query.filters
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(ValidateReassignmentRequestQuery)
export class ValidateReassignmentRequestQueryHandler implements IQueryHandler<ValidateReassignmentRequestQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: ValidateReassignmentRequestQuery): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Validating reassignment request query', {
      originalReservationId: query.originalReservationId,
      reason: query.reason,
      suggestedResourceId: query.suggestedResourceId,
      requestingUserId: query.requestingUserId
    });

    try {
      const validation = await this.reassignmentService.validateReassignmentRequestQuery({
        originalReservationId: query.originalReservationId,
        reason: query.reason,
        suggestedResourceId: query.suggestedResourceId,
        acceptEquivalentResources: query.acceptEquivalentResources,
        capacityTolerancePercent: query.capacityTolerancePercent,
        requiredFeatures: query.requiredFeatures,
        excludeRequestId: query.excludeRequestId
      });

      this.logger.log('Reassignment request validation query completed', {
        isValid: validation.isValid,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length
      });

      return validation;

    } catch (error) {
      this.logger.error('Failed to validate reassignment request query', error, LoggingHelper.logParams({
        originalReservationId: query.originalReservationId,
        requestingUserId: query.requestingUserId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentSuggestionsQuery)
export class GetReassignmentSuggestionsHandler implements IQueryHandler<GetReassignmentSuggestionsQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentSuggestionsQuery): Promise<any[]> {
    this.logger.log('Getting reassignment suggestions', {
      originalReservationId: query.originalReservationId,
      criteria: query.criteria,
      limit: query.limit,
      requestingUserId: query.requestingUserId
    });

    try {
      const suggestions = await this.reassignmentService.generateSuggestions(
        query.originalReservationId,
        query.criteria,
        query.limit
      );

      this.logger.log('Reassignment suggestions retrieved successfully', {
        originalReservationId: query.originalReservationId,
        suggestionsCount: suggestions.length
      });

      return suggestions;

    } catch (error) {
      this.logger.error('Failed to get reassignment suggestions', error, LoggingHelper.logParams({
        originalReservationId: query.originalReservationId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetPendingReassignmentRequestsQuery)
export class GetPendingReassignmentRequestsHandler implements IQueryHandler<GetPendingReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetPendingReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting pending reassignment requests', {
      userId: query.userId,
      priority: query.priority,
      reason: query.reason,
      expiringSoon: query.expiringSoon,
      page: query.page,
      limit: query.limit
    });

    try {
      const filters = {
        userId: query.userId,
        status: 'PENDING',
        priority: query.priority,
        reason: query.reason,
        expiringSoon: query.expiringSoon,
        hoursUntilExpiry: query.hoursUntilExpiry
      };

      const { items, total } = await this.reassignmentRequestRepository.findPending(
        filters,
        query.page,
        query.limit
      );

      // Enhance with equivalent resources if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.includeEquivalentResources) {
            enhanced.equivalentResources = await this.reassignmentService.getEquivalentResources(item.id);
          }

          return enhanced;
        })
      );

      this.logger.log('Pending reassignment requests retrieved successfully', {
        count: items.length,
        total,
        expiringSoon: query.expiringSoon
      });

      return {
        items: enhancedItems,
        total,
        page: query.page,
        limit: query.limit
      };

    } catch (error) {
      this.logger.error('Failed to get pending reassignment requests', error, LoggingHelper.logParams({
        userId: query.userId,
        priority: query.priority
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(GetReassignmentSuccessPredictionQuery)
export class GetReassignmentSuccessPredictionHandler implements IQueryHandler<GetReassignmentSuccessPredictionQuery> {
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: GetReassignmentSuccessPredictionQuery): Promise<any> {
    this.logger.log('Getting reassignment success prediction', {
      reassignmentRequestId: query.reassignmentRequestId,
      proposedResourceId: query.proposedResourceId,
      includeFactors: query.includeFactors,
      includeRecommendations: query.includeRecommendations
    });

    try {
      const prediction = await this.reassignmentService.predictSuccess(
        query.reassignmentRequestId,
        query.proposedResourceId,
        query.includeFactors,
        query.includeRecommendations
      );

      this.logger.log('Reassignment success prediction retrieved successfully', {
        reassignmentRequestId: query.reassignmentRequestId,
        successScore: prediction.successScore
      });

      return prediction;

    } catch (error) {
      this.logger.error('Failed to get reassignment success prediction', error, LoggingHelper.logParams({
        reassignmentRequestId: query.reassignmentRequestId
      }));
      throw error;
    }
  }
}

@Injectable()
@QueryHandler(SearchReassignmentRequestsQuery)
export class SearchReassignmentRequestsHandler implements IQueryHandler<SearchReassignmentRequestsQuery> {
  constructor(
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: SearchReassignmentRequestsQuery): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Searching reassignment requests', {
      searchTerm: query.searchTerm,
      filters: query.filters,
      page: query.page,
      limit: query.limit
    });

    try {
      const { items, total } = await this.reassignmentRequestRepository.search(
        query.searchTerm,
        query.filters as any,
        query.page,
        query.limit
      );

      // Enhance with additional data if requested
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const enhanced: any = { ...item };

          if (query.includeEquivalentResources) {
            enhanced.equivalentResources = await this.reassignmentService.getEquivalentResources(item.id);
          }

          if (query.includeStats) {
            enhanced.stats = await this.reassignmentService.getRequestStats(item.id);
          }

          return enhanced;
        })
      );

      this.logger.log('Reassignment requests search completed successfully', {
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
      this.logger.error('Failed to search reassignment requests', error, LoggingHelper.logParams({
        searchTerm: query.searchTerm
      }));
      throw error;
    }
  }
}
