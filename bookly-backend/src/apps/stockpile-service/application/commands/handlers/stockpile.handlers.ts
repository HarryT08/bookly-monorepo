import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { StockpileService } from '../../services/stockpile.service';

// Import commands
import { ApproveRequestCommand } from '../approve-request.command';
import { RejectRequestCommand } from '../reject-request.command';
import { CheckInCommand } from '../check-in.command';
import { CheckOutCommand } from '../check-out.command';

// Import DTOs from stockpile requests and responses
import {
  ProcessReservationApprovalRequestDto,
  PerformCheckInRequestDto,
  PerformCheckOutRequestDto
} from '@libs/dto/stockpile/stockpile-requests.dto';

import {
  ProcessReservationApprovalResponseDto,
  PerformCheckInResponseDto,
  PerformCheckOutResponseDto
} from '@libs/dto/stockpile/stockpile-responses.dto';

/**
 * Approve Request Command Handler
 * Orchestrates reservation approval by delegating to StockpileService
 * Follows Clean Architecture - handler acts as orchestrator only
 */
@Injectable()
@CommandHandler(ApproveRequestCommand)
export class ApproveRequestHandler implements ICommandHandler<ApproveRequestCommand> {
  constructor(
    private readonly stockpileService: StockpileService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: ApproveRequestCommand): Promise<ProcessReservationApprovalResponseDto> {
    this.loggingService.log('Orchestrating approve request command', 'ApproveRequestHandler', LoggingHelper.logParams({ command }));
    
    const request: ProcessReservationApprovalRequestDto = {
      reservationId: command.requestId,
      programId: '', // Will be resolved from reservation context
      resourceType: '', // Will be resolved from reservation context
      requestedBy: command.approverId,
      comments: command.comments,
      conditions: command.conditions || [],
      priority: 'medium'
    };

    const result = await this.stockpileService.processReservationApproval(request);
    
    this.loggingService.log('Approve request command completed', 'ApproveRequestHandler', LoggingHelper.logId(command.requestId));
    return result;
  }
}

/**
 * Reject Request Command Handler
 * Orchestrates reservation rejection by delegating to StockpileService
 */
@Injectable()
@CommandHandler(RejectRequestCommand)
export class RejectRequestHandler implements ICommandHandler<RejectRequestCommand> {
  constructor(
    private readonly stockpileService: StockpileService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: RejectRequestCommand): Promise<ProcessReservationApprovalResponseDto> {
    this.loggingService.log('Orchestrating reject request command', 'RejectRequestHandler', LoggingHelper.logParams({ command }));
    
    const request: ProcessReservationApprovalRequestDto = {
      reservationId: command.requestId,
      programId: '', // Will be resolved from reservation context
      resourceType: '', // Will be resolved from reservation context
      requestedBy: command.approverId,
      comments: command.comments || command.reason,
      conditions: [],
      priority: 'high' // Rejection has higher priority for immediate processing
    };

    const result = await this.stockpileService.processReservationApproval(request);
    
    this.loggingService.log('Reject request command completed', 'RejectRequestHandler', LoggingHelper.logId(command.requestId));
    return result;
  }
}

/**
 * Check-In Command Handler
 * Orchestrates check-in process by delegating to StockpileService
 */
@Injectable()
@CommandHandler(CheckInCommand)
export class CheckInHandler implements ICommandHandler<CheckInCommand> {
  constructor(
    private readonly stockpileService: StockpileService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CheckInCommand): Promise<PerformCheckInResponseDto> {
    this.loggingService.log('Orchestrating check-in command', 'CheckInHandler', LoggingHelper.logParams({ command }));
    
    const request: PerformCheckInRequestDto = {
      reservationId: command.reservationId,
      userId: command.userId,
      checkInTime: command.timestamp,
      location: command.location || 'Default Location',
      qrCode: '', // Optional QR verification
      deviceInfo: {}
    };

    const result = await this.stockpileService.performCheckIn(request);
    
    this.loggingService.log('Check-in command completed', 'CheckInHandler', LoggingHelper.logParams({
      reservationId: command.reservationId,
      userId: command.userId
    }));
    return result;
  }
}

/**
 * Check-Out Command Handler
 * Orchestrates check-out process by delegating to StockpileService
 */
@Injectable()
@CommandHandler(CheckOutCommand)
export class CheckOutHandler implements ICommandHandler<CheckOutCommand> {
  constructor(
    private readonly stockpileService: StockpileService,
    private readonly loggingService: LoggingService
  ) {}

  async execute(command: CheckOutCommand): Promise<PerformCheckOutResponseDto> {
    this.loggingService.log('Orchestrating check-out command', 'CheckOutHandler', LoggingHelper.logParams({ command }));
    
    const request: PerformCheckOutRequestDto = {
      reservationId: command.reservationId,
      userId: command.userId,
      checkOutTime: command.timestamp,
      resourceCondition: command.resourceCondition || 'GOOD',
      notes: command.notes,
      photos: []
    };

    const result = await this.stockpileService.performCheckOut(request);
    
    this.loggingService.log('Check-out command completed', 'CheckOutHandler', LoggingHelper.logParams({
      reservationId: command.reservationId,
      userId: command.userId
    }));
    return result;
  }
}
