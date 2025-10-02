import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';
import { ApprovalFlowService } from '../../services/approval-flow.service';
import { 
  ApprovalFlowEntity, 
  ApprovalLevelEntity, 
  ApprovalRequestEntity, 
  ApprovalActionEntity
} from '@apps/stockpile-service/domain/entities/approval-flow.entity';
import {
  CreateApprovalFlowCommand,
  UpdateApprovalFlowCommand,
  CreateApprovalLevelCommand,
  SubmitReservationForApprovalCommand,
  ProcessApprovalRequestCommand,
  CancelReservationCommand,
  ProcessTimeoutCommand,
  SendApprovalReminderCommand
} from '../approval-flow.commands';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { 
  ApprovalFlowDto, 
  ApprovalLevelDto,
  CreateApprovalFlowDto,
  UpdateApprovalFlowDto,
  CreateApprovalLevelDto
} from '@libs/dto/stockpile/approval-flow.dto';

/**
 * Create Approval Flow Command Handler
 * Orchestrates creation of approval flows by delegating to ApprovalFlowService
 * Implements Clean Architecture - handler acts as orchestrator only
 */
@Injectable()
@CommandHandler(CreateApprovalFlowCommand)
export class CreateApprovalFlowHandler implements ICommandHandler<CreateApprovalFlowCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CreateApprovalFlowCommand): Promise<ApprovalFlowDto> {
    this.loggingService.log('Orchestrating create approval flow command', 'CreateApprovalFlowHandler', LoggingHelper.logParams({ command }));
    
    const result = await this.approvalFlowService.createApprovalFlow({
      name: command.name,
      description: command.description,
      programId: command.programId,
      categoryId: command.categoryId,
      isDefault: command.isDefault,
      requiresAllApprovals: command.requiresAllApprovals,
      autoApprovalEnabled: command.autoApprovalEnabled,
      reviewTimeHours: command.reviewTimeHours,
      reminderHours: command.reminderHours,
      createdBy: command.createdBy
    });
    
    this.loggingService.log('Create approval flow command completed', 'CreateApprovalFlowHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Update Approval Flow Command Handler
 * Orchestrates update of approval flows by delegating to ApprovalFlowService
 */
@Injectable()
@CommandHandler(UpdateApprovalFlowCommand)
export class UpdateApprovalFlowHandler implements ICommandHandler<UpdateApprovalFlowCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: UpdateApprovalFlowCommand): Promise<ApprovalFlowDto> {
    this.loggingService.log('Orchestrating update approval flow command', 'UpdateApprovalFlowHandler', LoggingHelper.logParams({ command }));
    
    const result = await this.approvalFlowService.updateApprovalFlow(command.id, {
      name: command.name,
      description: command.description,
      requiresAllApprovals: command.requiresAllApprovals,
      autoApprovalEnabled: command.autoApprovalEnabled,
      reviewTimeHours: command.reviewTimeHours,
      reminderHours: command.reminderHours,
      isActive: command.isActive
    });
    
    this.loggingService.log('Update approval flow command completed', 'UpdateApprovalFlowHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Create Approval Level Command Handler
 * Orchestrates creation of approval levels by delegating to ApprovalFlowService
 */
@Injectable()
@CommandHandler(CreateApprovalLevelCommand)
export class CreateApprovalLevelHandler implements ICommandHandler<CreateApprovalLevelCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CreateApprovalLevelCommand): Promise<ApprovalLevelDto> {
    this.loggingService.log('Orchestrating create approval level command', 'CreateApprovalLevelHandler', LoggingHelper.logParams({ command }));
    
    const result = await this.approvalFlowService.createApprovalLevel({
      flowId: command.flowId,
      level: command.level,
      name: command.name,
      description: command.description,
      approverRoles: command.approverRoles,
      approverUsers: command.approverUsers,
      requiresAll: command.requiresAll,
      timeoutHours: command.timeoutHours
    });
    
    this.loggingService.log('Create approval level command completed', 'CreateApprovalLevelHandler', LoggingHelper.logId(result.id));
    return result;
  }
}

/**
 * Submit Reservation for Approval Command Handler
 * Orchestrates reservation approval submission by delegating to ApprovalFlowService
 */
@Injectable()
@CommandHandler(SubmitReservationForApprovalCommand)
export class SubmitReservationForApprovalHandler implements ICommandHandler<SubmitReservationForApprovalCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: SubmitReservationForApprovalCommand): Promise<void> {
    this.loggingService.log('Orchestrating submit reservation for approval command', 'SubmitReservationForApprovalHandler', LoggingHelper.logParams({ command }));
    
    await this.approvalFlowService.submitReservationForApproval({
      reservationId: command.reservationId,
      userId: command.userId,
      resourceId: command.resourceId,
      resourceType: command.resourceType,
      categoryId: command.categoryId,
      programId: command.programId
    });
    
    this.loggingService.log('Submit reservation for approval command completed', 'SubmitReservationForApprovalHandler');
  }
}

/**
 * Process Approval Request Command Handler
 * Orchestrates approval request processing by delegating to ApprovalFlowService
 */
@Injectable()
@CommandHandler(ProcessApprovalRequestCommand)
export class ProcessApprovalRequestHandler implements ICommandHandler<ProcessApprovalRequestCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: ProcessApprovalRequestCommand): Promise<void> {
    this.loggingService.log('Orchestrating process approval request command', 'ProcessApprovalRequestHandler', LoggingHelper.logParams({ command }));
    
    await this.approvalFlowService.processApprovalRequest(
      command.requestId,
      {
      approverId: command.approverId,
      action: command.action,
      comments: command.comments
      }
    );
    
    this.loggingService.log('Process approval request command completed', 'ProcessApprovalRequestHandler');
  }
}

/**
 * Cancel Reservation Command Handler
 * Orchestrates reservation cancellation by delegating to ApprovalFlowService
 */
@Injectable()
@CommandHandler(CancelReservationCommand)
export class CancelReservationHandler implements ICommandHandler<CancelReservationCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CancelReservationCommand): Promise<void> {
    this.loggingService.log('Orchestrating cancel reservation command', 'CancelReservationHandler', LoggingHelper.logParams({ command }));
    
    await this.approvalFlowService.cancelReservation({
      reservationId: command.reservationId,
      userId: command.userId,
      reason: command.reason
    });
    
    this.loggingService.log('Cancel reservation command completed', 'CancelReservationHandler');
  }
}

/**
 * Process Timeout Command Handler
 * Orchestrates timeout processing by delegating to ApprovalFlowService
 */
@Injectable()
@CommandHandler(ProcessTimeoutCommand)
export class ProcessTimeoutHandler implements ICommandHandler<ProcessTimeoutCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: ProcessTimeoutCommand): Promise<void> {
    this.loggingService.log('Orchestrating process timeout command', 'ProcessTimeoutHandler', LoggingHelper.logParams({ command }));
    
    // TODO: Implement processTimeout method in ApprovalFlowService
    this.loggingService.log('ProcessTimeout method not implemented yet', 'ProcessTimeoutHandler', LoggingHelper.logId(command.requestId));
    
    this.loggingService.log('Process timeout command completed', 'ProcessTimeoutHandler');
  }
}

/**
 * Send Approval Reminder Command Handler
 * Orchestrates approval reminder sending by delegating to ApprovalFlowService
 */
@Injectable()
@CommandHandler(SendApprovalReminderCommand)
export class SendApprovalReminderHandler implements ICommandHandler<SendApprovalReminderCommand> {
  constructor(
    private readonly approvalFlowService: ApprovalFlowService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: SendApprovalReminderCommand): Promise<void> {
    this.loggingService.log('Orchestrating send approval reminder command', 'SendApprovalReminderHandler', LoggingHelper.logParams({ command }));
    
    // TODO: Implement sendApprovalReminder method in ApprovalFlowService
    this.loggingService.log('SendApprovalReminder method not implemented yet', 'SendApprovalReminderHandler', LoggingHelper.logParams({ requestId: command.requestId, reminderType: command.reminderType }));
    
    this.loggingService.log('Send approval reminder command completed', 'SendApprovalReminderHandler');
  }
}

