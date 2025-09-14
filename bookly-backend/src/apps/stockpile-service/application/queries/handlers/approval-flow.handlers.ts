import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import {
  GetApprovalFlowsQuery,
  GetApprovalFlowByIdQuery,
  GetDefaultApprovalFlowQuery,
  GetApprovalLevelsByFlowIdQuery,
  GetPendingApprovalRequestsQuery,
  GetApprovalRequestsByReservationQuery,
  GetReservationStatusQuery,
  GetExpiredApprovalRequestsQuery,
  GetApprovalHistoryQuery,
  GetUserApprovalStatisticsQuery
} from '../approval-flow.queries';
import { ApprovalFlowRepository } from '../../../domain/repositories/approval-flow.repository';
import { ApprovalFlowEntity, ApprovalLevelEntity, ApprovalRequestEntity } from '../../../domain/entities/approval-flow.entity';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
@QueryHandler(GetApprovalFlowsQuery)
export class GetApprovalFlowsHandler implements IQueryHandler<GetApprovalFlowsQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalFlowsQuery): Promise<ApprovalFlowEntity[]> {
    this.loggingService.log('Getting approval flows', 'GetApprovalFlowsHandler', LoggingHelper.logParams({ query }));

    const flows = await this.approvalFlowRepository.findApprovalFlowsByScope(
      query.programId,
      query.resourceType,
      query.categoryId
    );

    // Filter by isActive if specified
    if (query.isActive !== undefined) {
      return flows.filter(flow => flow.isActive === query.isActive);
    }

    return flows;
  }
}

@Injectable()
@QueryHandler(GetApprovalFlowByIdQuery)
export class GetApprovalFlowByIdHandler implements IQueryHandler<GetApprovalFlowByIdQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalFlowByIdQuery): Promise<ApprovalFlowEntity | null> {
    this.loggingService.log('Getting approval flow by ID', 'GetApprovalFlowByIdHandler', LoggingHelper.logId(query.id));

    return await this.approvalFlowRepository.findApprovalFlowById(query.id);
  }
}

@Injectable()
@QueryHandler(GetDefaultApprovalFlowQuery)
export class GetDefaultApprovalFlowHandler implements IQueryHandler<GetDefaultApprovalFlowQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDefaultApprovalFlowQuery): Promise<ApprovalFlowEntity | null> {
    this.loggingService.log('Getting default approval flow', 'GetDefaultApprovalFlowHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowRepository.findDefaultApprovalFlow(
      query.programId,
      query.resourceType,
      query.categoryId
    );
  }
}

@Injectable()
@QueryHandler(GetApprovalLevelsByFlowIdQuery)
export class GetApprovalLevelsByFlowIdHandler implements IQueryHandler<GetApprovalLevelsByFlowIdQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalLevelsByFlowIdQuery): Promise<ApprovalLevelEntity[]> {
    this.loggingService.log('Getting approval levels by flow ID', 'GetApprovalLevelsByFlowIdHandler', LoggingHelper.logId(query.flowId));

    return await this.approvalFlowRepository.findApprovalLevelsByFlowId(query.flowId);
  }
}

@Injectable()
@QueryHandler(GetPendingApprovalRequestsQuery)
export class GetPendingApprovalRequestsHandler implements IQueryHandler<GetPendingApprovalRequestsQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetPendingApprovalRequestsQuery): Promise<{ requests: ApprovalRequestEntity[]; total: number }> {
    this.loggingService.log('Getting pending approval requests', 'GetPendingApprovalRequestsHandler', LoggingHelper.logParams({ query }));

    if (query.approverId) {
      const requests = await this.approvalFlowRepository.findPendingApprovalRequestsByApprover(query.approverId);
      
      // Apply pagination
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      const paginatedRequests = requests.slice(startIndex, endIndex);

      return {
        requests: paginatedRequests,
        total: requests.length
      };
    }

    // TODO: Implement filtering by programId, resourceType, categoryId
    // For now, return empty result
    return { requests: [], total: 0 };
  }
}

@Injectable()
@QueryHandler(GetApprovalRequestsByReservationQuery)
export class GetApprovalRequestsByReservationHandler implements IQueryHandler<GetApprovalRequestsByReservationQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalRequestsByReservationQuery): Promise<ApprovalRequestEntity[]> {
    this.loggingService.log('Getting approval requests by reservation', 'GetApprovalRequestsByReservationHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowRepository.findApprovalRequestsByReservationId(query.reservationId);
  }
}

@Injectable()
@QueryHandler(GetReservationStatusQuery)
export class GetReservationStatusHandler implements IQueryHandler<GetReservationStatusQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetReservationStatusQuery): Promise<{
    reservationId: string;
    status: string;
    currentLevel?: number;
    pendingRequests: ApprovalRequestEntity[];
    completedRequests: ApprovalRequestEntity[];
  }> {
    this.loggingService.log('Getting reservation status', 'GetReservationStatusHandler', LoggingHelper.logParams({ query }));

    const requests = await this.approvalFlowRepository.findApprovalRequestsByReservationId(query.reservationId);
    
    const pendingRequests = requests.filter(req => req.isPending());
    const completedRequests = requests.filter(req => req.isCompleted());

    let status = 'INITIAL';
    let currentLevel = 0;

    if (requests.length === 0) {
      status = 'INITIAL';
    } else if (pendingRequests.length > 0) {
      status = 'REVIEWING';
      // Find the current level from pending requests
      const levels = await Promise.all(
        pendingRequests.map(req => this.approvalFlowRepository.findApprovalLevelById(req.levelId))
      );
      currentLevel = Math.min(...levels.filter(l => l).map(l => l!.level));
    } else {
      // Check if all requests are approved or if any is rejected
      const hasRejected = completedRequests.some(req => req.status === 'REJECTED');
      const hasTimeout = completedRequests.some(req => req.status === 'TIMEOUT');
      
      if (hasRejected) {
        status = 'REJECTED';
      } else if (hasTimeout) {
        status = 'TIMEOUT';
      } else {
        status = 'APPROVED';
      }
    }

    return {
      reservationId: query.reservationId,
      status,
      currentLevel: currentLevel > 0 ? currentLevel : undefined,
      pendingRequests,
      completedRequests
    };
  }
}

@Injectable()
@QueryHandler(GetExpiredApprovalRequestsQuery)
export class GetExpiredApprovalRequestsHandler implements IQueryHandler<GetExpiredApprovalRequestsQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetExpiredApprovalRequestsQuery): Promise<ApprovalRequestEntity[]> {
    this.loggingService.log('Getting expired approval requests', 'GetExpiredApprovalRequestsHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowRepository.findExpiredApprovalRequests();
  }
}

@Injectable()
@QueryHandler(GetApprovalHistoryQuery)
export class GetApprovalHistoryHandler implements IQueryHandler<GetApprovalHistoryQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalHistoryQuery): Promise<{ actions: any[]; total: number }> {
    this.loggingService.log('Getting approval history', 'GetApprovalHistoryHandler', LoggingHelper.logParams({ query }));

    // TODO: Implement approval history query with filtering and pagination
    // This would require additional repository methods

    return { actions: [], total: 0 };
  }
}

@Injectable()
@QueryHandler(GetUserApprovalStatisticsQuery)
export class GetUserApprovalStatisticsHandler implements IQueryHandler<GetUserApprovalStatisticsQuery> {
  constructor(
    @Inject('ApprovalFlowRepository') private readonly approvalFlowRepository: ApprovalFlowRepository,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetUserApprovalStatisticsQuery): Promise<{
    userId: string;
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    averageResponseTime?: number;
  }> {
    this.loggingService.log('Getting user approval statistics', 'GetUserApprovalStatisticsHandler', LoggingHelper.logParams({ query }));

    // TODO: Implement user statistics calculation
    // This would require additional repository methods and calculations

    return {
      userId: query.userId,
      totalRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      pendingRequests: 0
    };
  }
}
