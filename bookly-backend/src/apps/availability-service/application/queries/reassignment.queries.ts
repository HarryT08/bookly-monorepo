/**
 * Queries for reassignment request management (RF-15)
 * CQRS Query Pattern Implementation
 */

import { IQuery } from '@nestjs/cqrs';
import { ReassignmentPriority, ReassignmentReason } from '../../utils';

export class GetReassignmentRequestQuery implements IQuery {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly userId: string,
    public readonly includeEquivalentResources: boolean = true,
    public readonly includeAlternativeTimeSlots: boolean = false,
    public readonly includeProcessingHistory: boolean = true,
    public readonly includeNotificationHistory: boolean = false
  ) {}
}

export class GetReassignmentRequestsQuery implements IQuery {
  constructor(
    public readonly filters: {
      userId?: string;
      requestedBy?: string;
      originalReservationId?: string;
      status?: string;
      userResponse?: string;
      reason?: ReassignmentReason;
      priority?: ReassignmentPriority;
      startDate?: Date;
      endDate?: Date;
      resourceId?: string;
      programId?: string;
    },
    public readonly pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
    public readonly options: {
      includeEquivalentResources?: boolean;
      includeStats?: boolean;
      includeProcessingHistory?: boolean;
    },
    public readonly requestingUserId: string
  ) {}
}

export class GetUserReassignmentRequestsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly status?: string,
    public readonly userResponse?: string,
    public readonly includeExpired: boolean = false,
    public readonly includeEquivalentResources: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId?: string
  ) {}
}

export class GetEquivalentResourcesQuery implements IQuery {
  constructor(
    public readonly originalResourceId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly capacityTolerancePercent: number = 5,
    public readonly requiredFeatures?: string[],
    public readonly preferredFeatures?: string[],
    public readonly maxDistanceMeters?: number,
    public readonly excludeResourceIds?: string[],
    public readonly limit: number = 10,
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentRequestStatsQuery implements IQuery {
  constructor(
    public readonly reassignmentRequestId?: string,
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly groupBy: 'day' | 'week' | 'month' = 'day',
    public readonly includeProjections: boolean = false,
    public readonly requestingUserId?: string
  ) {}
}

export class ValidateReassignmentRequestQuery implements IQuery {
  constructor(
    public readonly originalReservationId: string,
    public readonly reason: ReassignmentReason,
    public readonly suggestedResourceId?: string,
    public readonly acceptEquivalentResources: boolean = true,
    public readonly capacityTolerancePercent?: number,
    public readonly requiredFeatures?: string[],
    public readonly requestingUserId?: string,
    public readonly excludeRequestId?: string
  ) {}
}

export class GetReassignmentSuggestionsQuery implements IQuery {
  constructor(
    public readonly originalReservationId: string,
    public readonly criteria: {
      capacityTolerancePercent?: number;
      requiredFeatures?: string[];
      preferredFeatures?: string[];
      maxDistanceMeters?: number;
      acceptAlternativeTimeSlots?: boolean;
      timeFlexibilityMinutes?: number;
    },
    public readonly limit: number = 5,
    public readonly requestingUserId: string
  ) {}
}

export class GetReassignmentAnalyticsQuery implements IQuery {
  constructor(
    public readonly filters: {
      userId?: string;
      resourceId?: string;
      programId?: string;
      reason?: ReassignmentReason;
      startDate?: Date;
      endDate?: Date;
    },
    public readonly metrics: string[] = ['total_requests', 'success_rate', 'average_response_time'],
    public readonly groupBy: 'hour' | 'day' | 'week' | 'month' = 'day',
    public readonly requestingUserId: string
  ) {}
}

export class GetPendingReassignmentRequestsQuery implements IQuery {
  constructor(
    public readonly userId?: string,
    public readonly priority?: ReassignmentPriority,
    public readonly reason?: ReassignmentReason,
    public readonly expiringSoon: boolean = false,
    public readonly hoursUntilExpiry: number = 24,
    public readonly includeEquivalentResources: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentRequestHistoryQuery implements IQuery {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly includeProcessingSteps: boolean = true,
    public readonly includeNotifications: boolean = true,
    public readonly includeUserInteractions: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly requestingUserId: string
  ) {}
}

export class GetResourceReassignmentRequestsQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly status?: string,
    public readonly reason?: ReassignmentReason,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly includeStats: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId?: string
  ) {}
}

export class GetProgramReassignmentRequestsQuery implements IQuery {
  constructor(
    public readonly programId: string,
    public readonly status?: string,
    public readonly reason?: ReassignmentReason,
    public readonly includeStats: boolean = true,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId?: string
  ) {}
}

export class SearchReassignmentRequestsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly filters: {
      status?: string;
      reason?: ReassignmentReason;
      priority?: ReassignmentPriority;
      userId?: string;
      resourceId?: string;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    public readonly includeEquivalentResources: boolean = false,
    public readonly includeStats: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requestingUserId: string
  ) {}
}

export class GetReassignmentSuccessPredictionQuery implements IQuery {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly proposedResourceId?: string,
    public readonly includeFactors: boolean = true,
    public readonly includeRecommendations: boolean = true,
    public readonly requestingUserId?: string
  ) {}
}

export class GetUserReassignmentHistoryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly includeStats: boolean = true,
    public readonly includePatterns: boolean = true,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentTrendsQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
    public readonly metrics: string[] = ['requests', 'success_rate', 'response_times'],
    public readonly compareWithPrevious: boolean = true,
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentConfigurationQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly programId?: string,
    public readonly userId?: string,
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentImpactAnalysisQuery implements IQuery {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly proposedResourceId: string,
    public readonly proposedStartTime?: Date,
    public readonly proposedEndTime?: Date,
    public readonly includeUserSatisfactionPrediction: boolean = true,
    public readonly includeResourceUtilizationImpact: boolean = true,
    public readonly includeFinancialImpact: boolean = false,
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentQueueOptimizationQuery implements IQuery {
  constructor(
    public readonly criteria: 'PRIORITY' | 'RESPONSE_TIME' | 'USER_SATISFACTION' | 'RESOURCE_UTILIZATION',
    public readonly maxReassignments: number = 100,
    public readonly includeImpactAnalysis: boolean = true,
    public readonly requestingUserId: string
  ) {}
}

export class GetUserReassignmentPreferencesQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly requestingUserId: string
  ) {}
}

export class GetReassignmentNotificationStatusQuery implements IQuery {
  constructor(
    public readonly reassignmentRequestId: string,
    public readonly notificationType?: string,
    public readonly status?: 'PENDING' | 'SENT' | 'FAILED',
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentResourceCompatibilityQuery implements IQuery {
  constructor(
    public readonly originalResourceId: string,
    public readonly candidateResourceIds: string[],
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly requiredFeatures?: string[],
    public readonly preferredFeatures?: string[],
    public readonly requestingUserId?: string
  ) {}
}

export class GetReassignmentAlternativeTimeSlotsQuery implements IQuery {
  constructor(
    public readonly originalReservationId: string,
    public readonly resourceId: string,
    public readonly timeFlexibilityMinutes: number = 60,
    public readonly maxAlternatives: number = 10,
    public readonly requestingUserId: string
  ) {}
}

export class GetReassignmentBulkOperationStatusQuery implements IQuery {
  constructor(
    public readonly operationId: string,
    public readonly includeDetails: boolean = true,
    public readonly includeErrors: boolean = true,
    public readonly requestingUserId: string
  ) {}
}
