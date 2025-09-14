import { Injectable, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';
import {
  CreateApprovalFlowCommand,
  UpdateApprovalFlowCommand,
  CreateApprovalLevelCommand,
  SubmitReservationForApprovalCommand,
  ProcessApprovalRequestCommand,
  CancelReservationCommand
} from '@apps/stockpile-service/application/commands/approval-flow.commands';
import {
  GetApprovalFlowsQuery,
  GetApprovalFlowByIdQuery,
  GetDefaultApprovalFlowQuery,
  GetApprovalLevelsByFlowIdQuery,
  GetPendingApprovalRequestsQuery,
  GetApprovalRequestsByReservationQuery,
  GetReservationStatusQuery
} from '@apps/stockpile-service/application/queries/approval-flow.queries';
import {
  CreateApprovalFlowDto,
  UpdateApprovalFlowDto,
  CreateApprovalLevelDto,
  ProcessApprovalRequestDto,
  SubmitReservationForApprovalDto,
  CancelReservationDto,
  GetApprovalFlowsDto,
  GetPendingApprovalRequestsDto,
  ApprovalFlowDto,
  ApprovalLevelDto,
  ApprovalRequestDto
} from '@libs/dto/stockpile/approval-flow.dto';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { StockpileHandlerUtil } from '../utils/stockpile-handler.util';

@Injectable()
export class ApprovalFlowService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService
  ) {}

  async createApprovalFlow(dto: CreateApprovalFlowDto): Promise<ApprovalFlowDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Creating approval flow', 'ApprovalFlowService', dto);

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

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'create approval flow',
      'ApprovalFlowService'
    );
  }

  async updateApprovalFlow(id: string, dto: UpdateApprovalFlowDto): Promise<ApprovalFlowDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Updating approval flow', 'ApprovalFlowService', { id, dto });

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

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'update approval flow',
      'ApprovalFlowService'
    );
  }

  async createApprovalLevel(dto: CreateApprovalLevelDto): Promise<ApprovalLevelDto> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Creating approval level', 'ApprovalFlowService', dto);

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

    return await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'create approval level',
      'ApprovalFlowService'
    );
  }

  async submitReservationForApproval(dto: SubmitReservationForApprovalDto): Promise<void> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Submitting reservation for approval', 'ApprovalFlowService', dto);

    const command = new SubmitReservationForApprovalCommand(
      dto.reservationId,
      dto.userId,
      dto.resourceId,
      dto.resourceType,
      dto.categoryId,
      dto.programId
    );

    await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'submit reservation for approval',
      'ApprovalFlowService'
    );
  }

  async processApprovalRequest(requestId: string, dto: ProcessApprovalRequestDto): Promise<void> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Processing approval request', 'ApprovalFlowService', { requestId, dto });

    const command = new ProcessApprovalRequestCommand(
      requestId,
      dto.approverId,
      dto.action,
      dto.comments
    );

    await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'process approval request',
      'ApprovalFlowService'
    );
  }

  async cancelReservation(dto: CancelReservationDto): Promise<void> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Canceling reservation', 'ApprovalFlowService', dto);

    const command = new CancelReservationCommand(
      dto.reservationId,
      dto.userId,
      dto.reason
    );

    await StockpileHandlerUtil.executeCommand(
      this.commandBus,
      command,
      this.loggingService,
      'cancel reservation',
      'ApprovalFlowService'
    );
  }

  async getApprovalFlows(dto: GetApprovalFlowsDto): Promise<ApprovalFlowDto[]> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting approval flows', 'ApprovalFlowService', dto);

    const query = new GetApprovalFlowsQuery(dto.programId, dto.resourceType, dto.categoryId, dto.isActive);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get approval flows',
      'ApprovalFlowService'
    );
  }

  async getApprovalFlowById(id: string): Promise<ApprovalFlowDto | null> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting approval flow by ID', 'ApprovalFlowService', { id });

    const query = new GetApprovalFlowByIdQuery(id);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get approval flow by ID',
      'ApprovalFlowService'
    );
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
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting approval levels by flow ID', 'ApprovalFlowService', { flowId });

    const query = new GetApprovalLevelsByFlowIdQuery(flowId);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get approval levels by flow ID',
      'ApprovalFlowService'
    );
  }

  async getPendingApprovalRequests(dto: GetPendingApprovalRequestsDto): Promise<ApprovalRequestDto[]> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting pending approval requests', 'ApprovalFlowService', dto);

    const query = new GetPendingApprovalRequestsQuery(dto.approverId, dto.programId, dto.resourceType, dto.categoryId, dto.page, dto.limit);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get pending approval requests',
      'ApprovalFlowService'
    );
  }

  async getApprovalRequestsByReservation(reservationId: string): Promise<ApprovalRequestDto[]> {
    StockpileHandlerUtil.logServiceOperation(this.loggingService, 'Getting approval requests by reservation', 'ApprovalFlowService', { reservationId });

    const query = new GetApprovalRequestsByReservationQuery(reservationId);

    return await StockpileHandlerUtil.executeQuery(
      this.queryBus,
      query,
      this.loggingService,
      'get approval requests by reservation',
      'ApprovalFlowService'
    );
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
