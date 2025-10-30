import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { LoggingService } from '@libs/logging/logging.service';
import { ApprovalFlowService } from '@apps/stockpile-service/application/services/approval-flow.service';
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
import {
  ApprovalFlowDto,
  ApprovalLevelDto,
  ApprovalRequestDto
} from '@libs/dto/stockpile/approval-flow.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';

@Injectable()
@QueryHandler(GetApprovalFlowsQuery)
export class GetApprovalFlowsHandler implements IQueryHandler<GetApprovalFlowsQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalFlowsQuery): Promise<ApprovalFlowDto[]> {
    this.loggingService.log('Orchestrating get approval flows query', 'GetApprovalFlowsHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowService.getApprovalFlows({
      programId: query.programId,
      resourceType: query.resourceType,
      categoryId: query.categoryId,
      isActive: query.isActive
    });
  }
}

@Injectable()
@QueryHandler(GetApprovalFlowByIdQuery)
export class GetApprovalFlowByIdHandler implements IQueryHandler<GetApprovalFlowByIdQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalFlowByIdQuery): Promise<ApprovalFlowDto | null> {
    this.loggingService.log('Orchestrating get approval flow by ID query', 'GetApprovalFlowByIdHandler', LoggingHelper.logId(query.id));

    return await this.approvalFlowService.getApprovalFlowById(query.id);
  }
}

@Injectable()
@QueryHandler(GetDefaultApprovalFlowQuery)
export class GetDefaultApprovalFlowHandler implements IQueryHandler<GetDefaultApprovalFlowQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetDefaultApprovalFlowQuery): Promise<ApprovalFlowDto | null> {
    this.loggingService.log('Orchestrating get default approval flow query', 'GetDefaultApprovalFlowHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowService.getDefaultApprovalFlow(
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
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalLevelsByFlowIdQuery): Promise<ApprovalLevelDto[]> {
    this.loggingService.log('Orchestrating get approval levels by flow ID query', 'GetApprovalLevelsByFlowIdHandler', LoggingHelper.logId(query.flowId));

    return await this.approvalFlowService.getApprovalLevelsByFlowId(query.flowId);
  }
}

@Injectable()
@QueryHandler(GetPendingApprovalRequestsQuery)
export class GetPendingApprovalRequestsHandler implements IQueryHandler<GetPendingApprovalRequestsQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetPendingApprovalRequestsQuery): Promise<{ requests: ApprovalRequestDto[]; total: number }> {
    this.loggingService.log('Orchestrating get pending approval requests query', 'GetPendingApprovalRequestsHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowService.getPendingApprovalRequests({
      approverId: query.approverId,
      programId: query.programId,
      resourceType: query.resourceType,
      categoryId: query.categoryId,
      page: query.page,
      limit: query.limit
    });
  }
}

@Injectable()
@QueryHandler(GetApprovalRequestsByReservationQuery)
export class GetApprovalRequestsByReservationHandler implements IQueryHandler<GetApprovalRequestsByReservationQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalRequestsByReservationQuery): Promise<ApprovalRequestDto[]> {
    this.loggingService.log('Orchestrating get approval requests by reservation query', 'GetApprovalRequestsByReservationHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowService.getApprovalRequestsByReservation(query.reservationId);
  }
}

@Injectable()
@QueryHandler(GetReservationStatusQuery)
export class GetReservationStatusHandler implements IQueryHandler<GetReservationStatusQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetReservationStatusQuery): Promise<{
    reservationId: string;
    status: string;
    currentLevel?: number;
    pendingRequests: ApprovalRequestDto[];
    completedRequests: ApprovalRequestDto[];
  }> {
    this.loggingService.log('Orchestrating get reservation status query', 'GetReservationStatusHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowService.getReservationStatus(query.reservationId);
  }
}

@Injectable()
@QueryHandler(GetExpiredApprovalRequestsQuery)
export class GetExpiredApprovalRequestsHandler implements IQueryHandler<GetExpiredApprovalRequestsQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetExpiredApprovalRequestsQuery): Promise<ApprovalRequestDto[]> {
    this.loggingService.log('Orchestrating get expired approval requests query', 'GetExpiredApprovalRequestsHandler');

    return await this.approvalFlowService.getExpiredApprovalRequests();
  }
}

@Injectable()
@QueryHandler(GetApprovalHistoryQuery)
export class GetApprovalHistoryHandler implements IQueryHandler<GetApprovalHistoryQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(query: GetApprovalHistoryQuery): Promise<{ actions: any[]; total: number }> {
    this.loggingService.log('Orchestrating get approval history query', 'GetApprovalHistoryHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowService.getApprovalHistory({
      reservationId: query.reservationId,
      approverId: query.approverId,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit
    });
  }
}

@Injectable()
@QueryHandler(GetUserApprovalStatisticsQuery)
export class GetUserApprovalStatisticsHandler implements IQueryHandler<GetUserApprovalStatisticsQuery> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
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
    this.loggingService.log('Orchestrating get user approval statistics query', 'GetUserApprovalStatisticsHandler', LoggingHelper.logParams({ query }));

    return await this.approvalFlowService.getUserApprovalStatistics({
      userId: query.userId,
      startDate: query.startDate,
      endDate: query.endDate
    });
  }
}
