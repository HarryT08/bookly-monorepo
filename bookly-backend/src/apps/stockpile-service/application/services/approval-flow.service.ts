import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService } from '@logging/logging.service';
import {
  CreateApprovalFlowCommand,
  UpdateApprovalFlowCommand,
  CreateApprovalLevelCommand,
  SubmitReservationForApprovalCommand,
  ProcessApprovalRequestCommand,
  CancelReservationCommand
} from '../commands/approval-flow.commands';
import {
  GetApprovalFlowsQuery,
  GetApprovalFlowByIdQuery,
  GetDefaultApprovalFlowQuery,
  GetApprovalLevelsByFlowIdQuery,
  GetPendingApprovalRequestsQuery,
  GetApprovalRequestsByReservationQuery,
  GetReservationStatusQuery
} from '../queries/approval-flow.queries';
import {
  CreateApprovalFlowDto,
  UpdateApprovalFlowDto,
  CreateApprovalLevelDto,
  ProcessApprovalRequestDto,
  ApprovalFlowDto,
  ApprovalLevelDto,
  ApprovalRequestDto
} from '@dto/stockpile/approval-flow.dto';
import { LoggingHelper } from '@logging/logging.helper';

@Injectable()
export class ApprovalFlowService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService
  ) {}

  async createApprovalFlow(dto: CreateApprovalFlowDto): Promise<ApprovalFlowDto> {
    this.loggingService.log('Creating approval flow', 'ApprovalFlowService', LoggingHelper.logParams({ dto }));

    const command = new CreateApprovalFlowCommand(
      dto.name,
      dto.description,
      dto.programId,
      dto.resourceType,
      dto.categoryId,
      dto.isDefault,
      dto.requiresAllApprovals,
      dto.autoApprovalEnabled,
      dto.createdBy,
      dto.reviewTimeHours,
      dto.reminderHours
    );

    return await this.commandBus.execute(command);
  }

  async updateApprovalFlow(id: string, dto: UpdateApprovalFlowDto): Promise<ApprovalFlowDto> {
    this.loggingService.log('Updating approval flow', 'ApprovalFlowService', LoggingHelper.logParams({ id, dto }));

    const command = new UpdateApprovalFlowCommand(
      id,
      dto.name,
      dto.description,
      dto.requiresAllApprovals,
      dto.autoApprovalEnabled,
      dto.reviewTimeHours,
      dto.reminderHours,
      dto.isActive
    );

    return await this.commandBus.execute(command);
  }

  async createApprovalLevel(dto: CreateApprovalLevelDto): Promise<ApprovalLevelDto> {
    this.loggingService.log('Creating approval level', 'ApprovalFlowService', LoggingHelper.logParams({ dto }));

    const command = new CreateApprovalLevelCommand(
      dto.flowId,
      dto.level,
      dto.name,
      dto.description,
      dto.approverRoles,
      dto.approverUsers,
      dto.requiresAll,
      dto.timeoutHours
    );

    return await this.commandBus.execute(command);
  }

  async submitReservationForApproval(
    reservationId: string,
    userId: string,
    resourceId: string,
    resourceType?: string,
    categoryId?: string,
    programId?: string
  ): Promise<void> {
    this.loggingService.log('Submitting reservation for approval', 'ApprovalFlowService', LoggingHelper.logParams({
      reservationId,
      userId,
      resourceId
    }));

    const command = new SubmitReservationForApprovalCommand(
      reservationId,
      userId,
      resourceId,
      resourceType,
      categoryId,
      programId
    );

    return await this.commandBus.execute(command);
  }

  async processApprovalRequest(requestId: string, dto: ProcessApprovalRequestDto): Promise<void> {
    this.loggingService.log('Processing approval request', 'ApprovalFlowService', LoggingHelper.logParams({ requestId, dto }));

    const command = new ProcessApprovalRequestCommand(
      requestId,
      dto.approverId,
      dto.action,
      dto.comments
    );

    return await this.commandBus.execute(command);
  }

  async cancelReservation(reservationId: string, userId: string, reason?: string): Promise<void> {
    this.loggingService.log('Cancelling reservation', 'ApprovalFlowService', LoggingHelper.logParams({
      reservationId,
      userId,
      reason
    }));

    const command = new CancelReservationCommand(reservationId, userId, reason);

    return await this.commandBus.execute(command);
  }

  async getApprovalFlows(
    programId?: string,
    resourceType?: string,
    categoryId?: string,
    isActive?: boolean
  ): Promise<ApprovalFlowDto[]> {
    this.loggingService.log('Getting approval flows', 'ApprovalFlowService', LoggingHelper.logParams({
      programId,
      resourceType,
      categoryId,
      isActive
    }));

    const query = new GetApprovalFlowsQuery(programId, resourceType, categoryId, isActive);

    return await this.queryBus.execute(query);
  }

  async getApprovalFlowById(id: string): Promise<ApprovalFlowDto | null> {
    this.loggingService.log('Getting approval flow by ID', 'ApprovalFlowService', LoggingHelper.logParams({ id }));

    const query = new GetApprovalFlowByIdQuery(id);

    return await this.queryBus.execute(query);
  }

  async getDefaultApprovalFlow(
    programId?: string,
    resourceType?: string,
    categoryId?: string
  ): Promise<ApprovalFlowDto | null> {
    this.loggingService.log('Getting default approval flow', 'ApprovalFlowService', LoggingHelper.logParams({
      programId,
      resourceType,
      categoryId
    }));

    const query = new GetDefaultApprovalFlowQuery(programId, resourceType, categoryId);

    return await this.queryBus.execute(query);
  }

  async getApprovalLevelsByFlowId(flowId: string): Promise<ApprovalLevelDto[]> {
    this.loggingService.log('Getting approval levels by flow ID', 'ApprovalFlowService', LoggingHelper.logParams({ flowId }));

    const query = new GetApprovalLevelsByFlowIdQuery(flowId);

    return await this.queryBus.execute(query);
  }

  async getPendingApprovalRequests(
    approverId?: string,
    programId?: string,
    resourceType?: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ requests: ApprovalRequestDto[]; total: number }> {
    this.loggingService.log('Getting pending approval requests', 'ApprovalFlowService', LoggingHelper.logParams({
      approverId,
      programId,
      resourceType,
      categoryId,
      page,
      limit
    }));

    const query = new GetPendingApprovalRequestsQuery(
      approverId,
      programId,
      resourceType,
      categoryId,
      page,
      limit
    );

    return await this.queryBus.execute(query);
  }

  async getApprovalRequestsByReservation(reservationId: string): Promise<ApprovalRequestDto[]> {
    this.loggingService.log('Getting approval requests by reservation', 'ApprovalFlowService', LoggingHelper.logParams({ reservationId }));

    const query = new GetApprovalRequestsByReservationQuery(reservationId);

    return await this.queryBus.execute(query);
  }

  async getReservationStatus(reservationId: string): Promise<{
    reservationId: string;
    status: string;
    currentLevel?: number;
    pendingRequests: ApprovalRequestDto[];
    completedRequests: ApprovalRequestDto[];
  }> {
    this.loggingService.log('Getting reservation status', 'ApprovalFlowService', LoggingHelper.logParams({ reservationId }));

    const query = new GetReservationStatusQuery(reservationId);

    return await this.queryBus.execute(query);
  }
}
