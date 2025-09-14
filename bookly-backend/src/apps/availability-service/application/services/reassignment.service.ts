/**
 * Reassignment Application Service (RF-15)
 * Orchestrates CQRS commands and queries for reassignment requests
 */

import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';

// DTOs
import { CreateReassignmentRequestDto } from '../../infrastructure/dtos/create-reassignment-request.dto';
import { ReassignmentRequestResponseDto } from '../../infrastructure/dtos/reassignment-response.dto';
import { 
  ReassignmentRequestDto, 
  EquivalentResourcesDto, 
  AutoProcessReassignmentResultDto, 
  OptimizeReassignmentQueueResultDto 
} from '@libs/dto/availability/reassignment.dto';

// Commands
import {
  CreateReassignmentRequestCommand,
  RespondToReassignmentRequestCommand,
  FindEquivalentResourcesCommand,
  ProcessReassignmentRequestCommand,
  CancelReassignmentRequestCommand,
  EscalateReassignmentRequestCommand,
  UpdateReassignmentRequestCommand,
  AutoProcessReassignmentRequestsCommand,
  BulkProcessReassignmentRequestsCommand,
  ValidateReassignmentRequestCommand,
  GenerateReassignmentSuggestionsCommand,
  ApplyReassignmentCommand,
  RejectReassignmentSuggestionCommand,
  SetReassignmentPreferencesCommand,
  CalculateReassignmentImpactCommand,
  OptimizeReassignmentQueueCommand,
  CreateBulkReassignmentRequestCommand
} from '../commands/reassignment.commands';

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

// Entities
import { ReassignmentRequestEntity } from '../../domain/entities/reassignment-request.entity';
import { ReassignmentQueryDto } from '../../infrastructure/dtos/reassignment-query.dto';
import { ReassignmentStatus, ReassignmentReason, ReassignmentPriority } from '../../utils';
import { ResourceEquivalenceResponseDto } from '../../infrastructure/dtos/resource-equivalence-response.dto';

@Injectable()
export class ReassignmentService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggingService
  ) {}

  // Command Methods

  async createReassignmentRequest(
    dto: CreateReassignmentRequestDto,
    requestedBy: string
  ): Promise<ReassignmentRequestDto> {
    this.logger.log('Creating reassignment request via application service', {
      originalReservationId: dto.originalReservationId,
      requestedBy,
      reason: dto.reason,
      priority: dto.priority
    });

    const command = new CreateReassignmentRequestCommand(
      dto.originalReservationId,
      requestedBy,
      dto.reason,
      dto.reasonDescription,
      dto.suggestedResourceId,
      dto.priority,
      dto.responseDeadline ? new Date(dto.responseDeadline) : undefined,
      dto.acceptEquivalentResources,
      dto.acceptAlternativeTimeSlots,
      dto.capacityTolerancePercent,
      dto.requiredFeatures,
      dto.preferredFeatures,
      dto.maxDistanceMeters,
      dto.notifyUser,
      dto.notificationMethods,
      dto.autoProcessSingleOption,
      dto.compensationInfo,
      dto.internalNotes,
      dto.tags,
      dto.impactLevel,
      dto.estimatedResolutionHours,
      dto.relatedTicketId,
      dto.affectedProgramId,
      dto.minAdvanceNoticeHours,
      dto.allowPartialReassignment,
      dto.requireUserConfirmation
    );

    return await this.commandBus.execute(command);
  }

  async respondToReassignmentRequest(
    reassignmentRequestId: string,
    userId: string,
    response: 'ACCEPTED' | 'REJECTED',
    selectedResourceId?: string,
    responseNotes?: string,
    requestAlternatives: boolean = false,
    alternativePreferences?: any
  ): Promise<void> {
    this.logger.log('User responding to reassignment request via application service', {
      reassignmentRequestId,
      userId,
      response,
      selectedResourceId
    });

    const command = new RespondToReassignmentRequestCommand(
      reassignmentRequestId,
      userId,
      response,
      selectedResourceId,
      responseNotes,
      requestAlternatives,
      alternativePreferences,
      userId
    );

    return await this.commandBus.execute(command);
  }

  async findEquivalentResources(
    originalResourceId: string,
    startTime: Date,
    endTime: Date,
    capacityTolerancePercent: number = 5,
    requiredFeatures?: string[],
    preferredFeatures?: string[],
    maxDistanceMeters?: number,
    excludeResourceIds?: string[],
    limit: number = 10,
    requestedBy?: string
  ): Promise<{
      exactMatches: ResourceEquivalenceResponseDto[];
      goodMatches: ResourceEquivalenceResponseDto[];
      acceptableMatches: ResourceEquivalenceResponseDto[];
      recommendations: any[];
    }> {
    this.logger.log('Finding equivalent resources via application service', {
      originalResourceId,
      startTime,
      endTime,
      capacityTolerancePercent,
      limit,
      requestedBy
    });

    const command = new FindEquivalentResourcesCommand(
      originalResourceId,
      startTime,
      endTime,
      capacityTolerancePercent,
      requiredFeatures,
      preferredFeatures,
      maxDistanceMeters,
      excludeResourceIds,
      limit,
      requestedBy
    );

    return await this.commandBus.execute(command);
  }

  async processReassignmentRequest(
    reassignmentRequestId: string,
    processedBy: string,
    autoSelectBestOption: boolean = false,
    notifyUser: boolean = true,
    processingNotes?: string
  ): Promise<void> {
    this.logger.log('Processing reassignment request via application service', {
      reassignmentRequestId,
      processedBy,
      autoSelectBestOption
    });

    const command = new ProcessReassignmentRequestCommand(
      reassignmentRequestId,
      processedBy,
      autoSelectBestOption,
      notifyUser,
      processingNotes
    );

    return await this.commandBus.execute(command);
  }

  async cancelReassignmentRequest(
    reassignmentRequestId: string,
    userId: string,
    reason: string,
    notifyStakeholders: boolean = true
  ): Promise<void> {
    this.logger.log('Cancelling reassignment request via application service', {
      reassignmentRequestId,
      userId,
      reason
    });

    const command = new CancelReassignmentRequestCommand(
      reassignmentRequestId,
      userId,
      reason,
      userId,
      notifyStakeholders
    );

    return await this.commandBus.execute(command);
  }

  async escalateReassignmentRequest(
    reassignmentRequestId: string,
    newPriority: any,
    escalationReason: string,
    escalatedBy: string,
    notifyUser: boolean = true,
    notifyAdmins: boolean = true
  ): Promise<void> {
    this.logger.log('Escalating reassignment request via application service', {
      reassignmentRequestId,
      newPriority,
      escalationReason,
      escalatedBy
    });

    const command = new EscalateReassignmentRequestCommand(
      reassignmentRequestId,
      newPriority,
      escalationReason,
      escalatedBy,
      notifyUser,
      notifyAdmins
    );

    return await this.commandBus.execute(command);
  }

  async updateReassignmentRequest(
    reassignmentRequestId: string,
    userId: string,
    updateData: any,
    updateReason?: string,
    notifyUser: boolean = true
  ): Promise<void> {
    this.logger.log('Updating reassignment request via application service', {
      reassignmentRequestId,
      userId,
      updateReason
    });

    const command = new UpdateReassignmentRequestCommand(
      reassignmentRequestId,
      userId,
      updateData,
      updateReason,
      userId,
      notifyUser
    );

    return await this.commandBus.execute(command);
  }

  async autoProcessReassignmentRequests(
    criteria: any,
    processedBy: string,
    dryRun: boolean = false,
    maxRequests: number = 50
  ): Promise<AutoProcessReassignmentResultDto> {
    this.logger.log('Auto-processing reassignment requests via application service', {
      criteria,
      processedBy,
      dryRun,
      maxRequests
    });

    const command = new AutoProcessReassignmentRequestsCommand(
      criteria,
      processedBy,
      dryRun,
      maxRequests
    );

    return await this.commandBus.execute(command);
  }

  async bulkProcessReassignmentRequests(
    reassignmentRequestIds: string[],
    action: 'PROCESS' | 'CANCEL' | 'ESCALATE' | 'UPDATE_PRIORITY',
    parameters: any,
    processedBy: string,
    notifyUsers: boolean = true
  ): Promise<any> {
    this.logger.log('Bulk processing reassignment requests via application service', {
      reassignmentRequestIds,
      action,
      processedBy
    });

    const command = new BulkProcessReassignmentRequestsCommand(
      reassignmentRequestIds,
      action,
      parameters,
      processedBy,
      notifyUsers
    );

    return await this.commandBus.execute(command);
  }

  async validateReassignmentRequest(
    originalReservationId: string,
    reason: any,
    suggestedResourceId?: string,
    acceptEquivalentResources: boolean = true,
    capacityTolerancePercent?: number,
    requiredFeatures?: string[],
    requestedBy?: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Validating reassignment request via application service', {
      originalReservationId,
      reason,
      suggestedResourceId,
      requestedBy
    });

    const command = new ValidateReassignmentRequestCommand(
      originalReservationId,
      reason,
      suggestedResourceId,
      acceptEquivalentResources,
      capacityTolerancePercent,
      requiredFeatures,
      requestedBy
    );

    return await this.commandBus.execute(command);
  }

  async generateReassignmentSuggestions(
    originalReservationId: string,
    criteria: any,
    limit: number = 5,
    requestedBy: string
  ): Promise<any[]> {
    this.logger.log('Generating reassignment suggestions via application service', {
      originalReservationId,
      criteria,
      limit,
      requestedBy
    });

    const command = new GenerateReassignmentSuggestionsCommand(
      originalReservationId,
      criteria,
      limit,
      requestedBy
    );

    return await this.commandBus.execute(command);
  }

  async applyReassignment(
    reassignmentRequestId: string,
    selectedResourceId: string,
    appliedBy: string,
    newStartTime?: Date,
    newEndTime?: Date,
    notifyUser: boolean = true,
    compensationApplied?: string,
    applicationNotes?: string
  ): Promise<void> {
    this.logger.log('Applying reassignment via application service', {
      reassignmentRequestId,
      selectedResourceId,
      appliedBy
    });

    const command = new ApplyReassignmentCommand(
      reassignmentRequestId,
      selectedResourceId,
      newStartTime,
      newEndTime,
      appliedBy,
      notifyUser,
      compensationApplied,
      applicationNotes
    );

    return await this.commandBus.execute(command);
  }

  async optimizeReassignmentQueue(
    criteria: 'PRIORITY' | 'RESPONSE_TIME' | 'USER_SATISFACTION' | 'RESOURCE_UTILIZATION',
    optimizedBy: string,
    dryRun: boolean = false,
    maxReassignments: number = 100,
    notifyAffectedUsers: boolean = true
  ): Promise<OptimizeReassignmentQueueResultDto> {
    this.logger.log('Optimizing reassignment queue via application service', {
      criteria,
      optimizedBy,
      dryRun,
      maxReassignments
    });

    const command = new OptimizeReassignmentQueueCommand(
      criteria,
      optimizedBy,
      dryRun,
      maxReassignments,
      notifyAffectedUsers
    );

    return await this.commandBus.execute(command);
  }

  // Query Methods

  async getReassignmentRequest(
    reassignmentRequestId: string,
    userId: string,
    includeEquivalentResources: boolean = true,
    includeAlternativeTimeSlots: boolean = false,
    includeProcessingHistory: boolean = true,
    includeNotificationHistory: boolean = false
  ): Promise<any> {
    this.logger.log('Getting reassignment request via application service', {
      reassignmentRequestId,
      userId,
      includeEquivalentResources,
      includeProcessingHistory
    });

    const query = new GetReassignmentRequestQuery(
      reassignmentRequestId,
      userId,
      includeEquivalentResources,
      includeAlternativeTimeSlots,
      includeProcessingHistory,
      includeNotificationHistory
    );

    return await this.queryBus.execute(query);
  }

  async getReassignmentRequests(
    filters: any,
    pagination: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
    options: {
      includeEquivalentResources?: boolean;
      includeStats?: boolean;
      includeProcessingHistory?: boolean;
    },
    requestingUserId: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting reassignment requests via application service', {
      filters,
      pagination,
      requestingUserId
    });

    const query = new GetReassignmentRequestsQuery(
      filters,
      pagination,
      options,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getUserReassignmentRequests(
    userId: string,
    status?: string,
    userResponse?: string,
    includeExpired: boolean = false,
    includeEquivalentResources: boolean = true,
    page: number = 1,
    limit: number = 10,
    requestingUserId: string = userId
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting user reassignment requests via application service', {
      userId,
      status,
      userResponse,
      page,
      limit
    });

    const query = new GetUserReassignmentRequestsQuery(
      userId,
      status,
      userResponse,
      includeExpired,
      includeEquivalentResources,
      page,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getEquivalentResources(
    originalResourceId: string,
    startTime: Date,
    endTime: Date,
    capacityTolerancePercent: number = 5,
    requiredFeatures?: string[],
    preferredFeatures?: string[],
    maxDistanceMeters?: number,
    excludeResourceIds?: string[],
    limit: number = 10,
    requestingUserId?: string
  ): Promise<any[]> {
    this.logger.log('Getting equivalent resources via application service', {
      originalResourceId,
      startTime,
      endTime,
      capacityTolerancePercent,
      limit
    });

    const query = new GetEquivalentResourcesQuery(
      originalResourceId,
      startTime,
      endTime,
      capacityTolerancePercent,
      requiredFeatures,
      preferredFeatures,
      maxDistanceMeters,
      excludeResourceIds,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getReassignmentRequestStats(
    reassignmentRequestId?: string,
    userId?: string,
    resourceId?: string,
    programId?: string,
    startDate?: Date,
    endDate?: Date,
    groupBy: 'day' | 'week' | 'month' = 'day',
    includeProjections: boolean = false,
    requestingUserId?: string
  ): Promise<any> {
    this.logger.log('Getting reassignment request stats via application service', {
      reassignmentRequestId,
      userId,
      resourceId,
      groupBy
    });

    const query = new GetReassignmentRequestStatsQuery(
      reassignmentRequestId,
      userId,
      resourceId,
      programId,
      startDate,
      endDate,
      groupBy,
      includeProjections,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async validateReassignmentRequestQuery(
    originalReservationId: string,
    reason: any,
    suggestedResourceId?: string,
    acceptEquivalentResources: boolean = true,
    capacityTolerancePercent?: number,
    requiredFeatures?: string[],
    requestingUserId?: string,
    excludeRequestId?: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Validating reassignment request query via application service', {
      originalReservationId,
      reason,
      suggestedResourceId,
      requestingUserId
    });

    const query = new ValidateReassignmentRequestQuery(
      originalReservationId,
      reason,
      suggestedResourceId,
      acceptEquivalentResources,
      capacityTolerancePercent,
      requiredFeatures,
      requestingUserId,
      excludeRequestId
    );

    return await this.queryBus.execute(query);
  }

  async getReassignmentSuggestions(
    originalReservationId: string,
    criteria: any,
    limit: number = 5,
    requestingUserId: string
  ): Promise<any[]> {
    this.logger.log('Getting reassignment suggestions via application service', {
      originalReservationId,
      criteria,
      limit,
      requestingUserId
    });

    const query = new GetReassignmentSuggestionsQuery(
      originalReservationId,
      criteria,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getReassignmentAnalytics(
    filters: any,
    metrics: string[] = ['total_requests', 'success_rate', 'average_response_time'],
    groupBy: 'hour' | 'day' | 'week' | 'month' = 'day',
    requestingUserId: string
  ): Promise<any> {
    this.logger.log('Getting reassignment analytics via application service', {
      filters,
      metrics,
      groupBy,
      requestingUserId
    });

    const query = new GetReassignmentAnalyticsQuery(
      filters,
      metrics,
      groupBy,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getPendingReassignmentRequests(
    userId?: string,
    priority?: any,
    reason?: any,
    expiringSoon: boolean = false,
    hoursUntilExpiry: number = 24,
    includeEquivalentResources: boolean = true,
    page: number = 1,
    limit: number = 20,
    requestingUserId?: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting pending reassignment requests via application service', {
      userId,
      priority,
      reason,
      expiringSoon,
      page,
      limit
    });

    const query = new GetPendingReassignmentRequestsQuery(
      userId,
      priority,
      reason,
      expiringSoon,
      hoursUntilExpiry,
      includeEquivalentResources,
      page,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getReassignmentSuccessPrediction(
    reassignmentRequestId: string,
    proposedResourceId?: string,
    includeFactors: boolean = true,
    includeRecommendations: boolean = true,
    requestingUserId?: string
  ): Promise<any> {
    this.logger.log('Getting reassignment success prediction via application service', {
      reassignmentRequestId,
      proposedResourceId,
      includeFactors,
      includeRecommendations
    });

    const query = new GetReassignmentSuccessPredictionQuery(
      reassignmentRequestId,
      proposedResourceId,
      includeFactors,
      includeRecommendations,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getReassignmentRequestHistory(
    reassignmentRequestId: string,
    includeProcessingSteps: boolean = true,
    includeNotifications: boolean = true,
    includeUserInteractions: boolean = true,
    page: number = 1,
    limit: number = 50,
    requestingUserId?: string
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    this.logger.log('Getting reassignment request history via application service', {
      reassignmentRequestId,
      includeProcessingSteps,
      includeNotifications,
      includeUserInteractions,
      page,
      limit
    });

    const query = new GetReassignmentRequestHistoryQuery(
      reassignmentRequestId,
      includeProcessingSteps,
      includeNotifications,
      includeUserInteractions,
      page,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getResourceReassignmentRequests(
    resourceId: string,
    status?: string,
    reason?: any,
    startDate?: Date,
    endDate?: Date,
    includeStats: boolean = true,
    page: number = 1,
    limit: number = 10,
    requestingUserId?: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number; stats?: any }> {
    this.logger.log('Getting resource reassignment requests via application service', {
      resourceId,
      status,
      reason,
      includeStats,
      page,
      limit
    });

    const query = new GetResourceReassignmentRequestsQuery(
      resourceId,
      status,
      reason,
      startDate,
      endDate,
      includeStats,
      page,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getProgramReassignmentRequests(
    programId: string,
    status?: string,
    reason?: any,
    includeStats: boolean = true,
    page: number = 1,
    limit: number = 10,
    requestingUserId?: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number; stats?: any }> {
    this.logger.log('Getting program reassignment requests via application service', {
      programId,
      status,
      reason,
      includeStats,
      page,
      limit
    });

    const query = new GetProgramReassignmentRequestsQuery(
      programId,
      status,
      reason,
      includeStats,
      page,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getUserReassignmentHistory(
    userId: string,
    includeStats: boolean = true,
    includePatterns: boolean = true,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 20,
    requestingUserId?: string
  ): Promise<{ items: any[]; total: number; stats?: any; patterns?: any }> {
    this.logger.log('Getting user reassignment history via application service', {
      userId,
      includeStats,
      includePatterns,
      page,
      limit
    });

    const query = new GetUserReassignmentHistoryQuery(
      userId,
      includeStats,
      includePatterns,
      startDate,
      endDate,
      page,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  async getReassignmentTrends(
    resourceId?: string,
    programId?: string,
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month',
    metrics: string[] = ['requests', 'success_rate', 'response_times'],
    compareWithPrevious: boolean = true,
    requestingUserId?: string
  ): Promise<any> {
    this.logger.log('Getting reassignment trends via application service', {
      resourceId,
      programId,
      timeframe,
      metrics,
      compareWithPrevious
    });

    const query = new GetReassignmentTrendsQuery(
      resourceId,
      programId,
      timeframe,
      metrics,
      compareWithPrevious,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  // Additional methods required by controllers

  async validateRequest(data: {
    originalReservationId: string;
    reason: any;
    suggestedResourceId?: string;
    acceptEquivalentResources?: boolean;
    capacityTolerancePercent?: number;
    requiredFeatures?: string[];
    requestedBy?: string;
  }): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    this.logger.log('Validating reassignment request', data);
    
    return await this.validateReassignmentRequest(
      data.originalReservationId,
      data.reason,
      data.suggestedResourceId,
      data.acceptEquivalentResources || true,
      data.capacityTolerancePercent,
      data.requiredFeatures,
      data.requestedBy
    );
  }

  async cancelRequest(reassignmentRequestId: string, userId: string, reason: string): Promise<void> {
    this.logger.log('Cancelling reassignment request', { reassignmentRequestId, userId, reason });
    
    await this.cancelReassignmentRequest(reassignmentRequestId, userId, reason);
  }

  async autoProcessRequest(reassignmentRequestId: string, hoursUntilEvent: number): Promise<any> {
    this.logger.log('Auto processing reassignment request', { reassignmentRequestId, hoursUntilEvent });
    
    return await this.autoProcessReassignmentRequests(
      { reassignmentRequestId, hoursUntilEvent },
      'system',
      false,
      1
    );
  }

  async generateAnalytics(filters: {
    resourceId?: string;
    programId?: string;
    startDate?: Date;
    endDate?: Date;
    groupBy?: string;
  }): Promise<any> {
    this.logger.log('Generating reassignment analytics', filters);
    
    return await this.getReassignmentAnalytics(
      filters,
      ['total_requests', 'success_rate', 'average_response_time'],
      (filters.groupBy as 'hour' | 'day' | 'week' | 'month') || 'day',
      'system'
    );
  }

  async processBulkReassignment(operations: any[]): Promise<any> {
    this.logger.log('Processing bulk reassignment', { operationsCount: operations.length });
    
    const reassignmentRequestIds = operations.map(op => op.reassignmentRequestId);
    const action = operations[0]?.action || 'PROCESS';
    const parameters = operations[0]?.parameters || {};
    
    return await this.bulkProcessReassignmentRequests(
      reassignmentRequestIds,
      action,
      parameters,
      'system'
    );
  }

  async predictSuccess(reassignmentRequestId: string): Promise<any> {
    this.logger.log('Predicting reassignment success', { reassignmentRequestId });
    
    return await this.getReassignmentSuccessPrediction(
      reassignmentRequestId,
      undefined,
      true,
      true,
      'system'
    );
  }

  async getUserHistory(userId: string, limit: number = 10): Promise<any> {
    this.logger.log('Getting user reassignment history', { userId, limit });
    
    return await this.getUserReassignmentHistory(
      userId,
      true,
      true,
      undefined,
      undefined,
      1,
      limit,
      'system'
    );
  }

  async optimizeConfiguration(programId?: string): Promise<any> {
    this.logger.log('Optimizing reassignment configuration', { programId });
    
    return await this.optimizeReassignmentQueue(
      'RESOURCE_UTILIZATION',
      'system',
      false,
      100,
      false
    );
  }

  // Additional methods required by controllers

  async createRequest(data: any): Promise<any> {
    this.logger.log('Creating reassignment request', data);
    
    return await this.createReassignmentRequest(data, data.requestedBy || 'system');
  }

  async findAll(query: any): Promise<any> {
    this.logger.log('Finding all reassignment requests', query);
    
    return await this.getReassignmentRequests(
      query.filters || {},
      {
        page: query.page || 1,
        limit: query.limit || 10,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
      },
      {
        includeEquivalentResources: query.includeEquivalentResources,
        includeStats: query.includeStats,
        includeProcessingHistory: query.includeProcessingHistory
      },
      query.requestingUserId || 'system'
    );
  }

  async findById(reassignmentRequestId: string, userId: string): Promise<any> {
    this.logger.log('Finding reassignment request by ID', { reassignmentRequestId, userId });
    
    return await this.getReassignmentRequest(
      reassignmentRequestId,
      userId,
      true,
      false,
      true,
      false
    );
  }

  async processUserResponse(reassignmentRequestId: string, userId: string, response: any, selectedResourceId?: string, responseNotes?: string): Promise<any> {
    this.logger.log('Processing user response', { reassignmentRequestId, userId, response });
    
    return await this.respondToReassignmentRequest(
      reassignmentRequestId,
      userId,
      response,
      selectedResourceId,
      responseNotes
    );
  }
}
