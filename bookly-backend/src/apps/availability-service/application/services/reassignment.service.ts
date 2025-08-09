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
  ): Promise<ReassignmentRequestEntity> {
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
  ): Promise<{ processed: number; failed: string[] }> {
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
  ): Promise<{ optimized: number; suggestions: any[] }> {
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

  async searchReassignmentRequests(
    searchTerm: string,
    filters: any,
    includeEquivalentResources: boolean = false,
    includeStats: boolean = false,
    page: number = 1,
    limit: number = 10,
    requestingUserId: string
  ): Promise<{ items: ReassignmentRequestEntity[]; total: number; page: number; limit: number }> {
    this.logger.log('Searching reassignment requests via application service', {
      searchTerm,
      filters,
      page,
      limit,
      requestingUserId
    });

    const query = new SearchReassignmentRequestsQuery(
      searchTerm,
      filters,
      includeEquivalentResources,
      includeStats,
      page,
      limit,
      requestingUserId
    );

    return await this.queryBus.execute(query);
  }

  // Controller-specific methods (aliases and wrappers)

  async createRequest(data: any): Promise<any> {
    return await this.createReassignmentRequest(data, data.requestedBy);
  }

  async findAll(queryDto: ReassignmentQueryDto): Promise<any> {
    // Use the correct structure for getReassignmentRequests
    const filters = {
      status: queryDto.status,
      reason: queryDto.reason,
      priority: queryDto.priority,
      userId: queryDto.userId,
      originalResourceId: queryDto.originalResourceId,
      programId: queryDto.programId,
      createdFrom: queryDto.createdFrom ? new Date(queryDto.createdFrom) : undefined,
      createdTo: queryDto.createdTo ? new Date(queryDto.createdTo) : undefined,
      resourceType: queryDto.resourceType,
      minCapacity: queryDto.minCapacity
    };

    const pagination = {
      page: queryDto.page || 1,
      limit: queryDto.limit || 20,
      sortBy: queryDto.sortBy,
      sortOrder: queryDto.sortOrder
    };

    const options = {
      includeEquivalentResources: true,
      includeStats: false,
      includeProcessingHistory: false
    };

    return await this.getReassignmentRequests(
      filters,
      pagination,
      options,
      queryDto.userId || 'system'
    );
  }

  async findById(id: string, userId: string): Promise<any> {
    return await this.getReassignmentRequest(id, userId);
  }

  async processUserResponse(
    id: string,
    response: 'ACCEPT' | 'REJECT',
    userId: string,
    selectedResourceId?: string,
    reason?: string
  ): Promise<any> {
    await this.respondToReassignmentRequest(
      id,
      userId,
      response === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
      selectedResourceId,
      reason
    );
    return { success: true, message: `Request ${response.toLowerCase()}ed successfully` };
  }

  async validateRequest(data: any): Promise<any> {
    return await this.validateReassignmentRequestQuery(
      data.originalReservationId,
      data.reason,
      data.suggestedResourceId,
      data.acceptEquivalentResources,
      data.capacityTolerancePercent,
      data.requiredFeatures,
      data.requestingUserId
    );
  }

  async cancelRequest(id: string, userId: string, reason: string): Promise<void> {
    await this.cancelReassignmentRequest(id, userId, reason);
  }

  async autoProcessRequest(id: string, hoursUntilEvent: number): Promise<any> {
    // TODO: Implement auto-processing logic
    return {
      autoApproved: false,
      selectedResource: null,
      reason: 'Auto-processing not yet implemented',
      notificationsSent: false
    };
  }

  async generateAnalytics(programId?: string, timeRange: string = '30d'): Promise<any> {
    const filters = { programId, timeRange };
    return await this.getReassignmentAnalytics(filters, ['total_requests', 'success_rate'], 'day', programId || 'system');
  }

  async processBulkReassignment(operations: any[]): Promise<any> {
    // TODO: Implement bulk processing logic
    return {
      successful: [],
      failed: [],
      summary: { total: operations.length, processed: 0, errors: operations.length }
    };
  }

  async predictSuccess(id: string): Promise<any> {
    return await this.getReassignmentSuccessPrediction(id);
  }

  async getUserHistory(userId: string, limit: number): Promise<any[]> {
    const result = await this.getUserReassignmentRequests(userId, undefined, undefined, true);
    return result.items || [];
  }

  async optimizeConfiguration(programId: string): Promise<any> {
    // TODO: Implement configuration optimization logic
    return {
      currentConfig: {},
      recommendedChanges: [],
      testResults: {}
    };
  }
}
