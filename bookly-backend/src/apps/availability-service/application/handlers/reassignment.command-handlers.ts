/**
 * Command Handlers for Reassignment Request Management (RF-15)
 * CQRS Command Handler Pattern Implementation
 * 
 * Clean Architecture Compliance:
 * - Handlers only import and use application services
 * - Services contain all business logic and repository access
 * - Event-Driven Architecture for cross-service communication
 */

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { LoggingService } from "@libs/logging/logging.service";

// Commands
import {
  CreateReassignmentRequestCommand,
  RespondToReassignmentRequestCommand,
  FindEquivalentResourcesCommand,
  ProcessReassignmentRequestCommand,
  CancelReassignmentRequestCommand,
  AutoProcessReassignmentRequestsCommand,
  ApplyReassignmentCommand,
  OptimizeReassignmentQueueCommand,
} from "../commands/reassignment.commands";

// Application Services (Clean Architecture compliance)
import { ReassignmentService } from "../services/reassignment.service";
import { CommandBus } from "@nestjs/cqrs";

// DTOs
import { 
  ReassignmentRequestDto, 
  EquivalentResourcesDto, 
  AutoProcessReassignmentResultDto, 
  OptimizeReassignmentQueueResultDto 
} from "@libs/dto/availability/reassignment.dto";

/**
 * Handler: Create Reassignment Request
 * Orchestrates the creation of a new reassignment request by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(CreateReassignmentRequestCommand)
export class CreateReassignmentRequestHandler
  implements ICommandHandler<CreateReassignmentRequestCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: CreateReassignmentRequestCommand
  ): Promise<ReassignmentRequestDto> {
    this.logger.log("Orchestrating reassignment request creation", {
      originalReservationId: command.originalReservationId,
      requestedBy: command.requestedBy,
      reason: command.reason,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    const dto = {
      originalReservationId: command.originalReservationId,
      reason: command.reason,
      reasonDescription: command.reasonDescription,
      suggestedResourceId: command.suggestedResourceId,
      priority: command.userPriority as any,
      responseDeadline: command.responseDeadline?.toISOString(),
      acceptEquivalentResources: command.acceptEquivalentResources,
      acceptAlternativeTimeSlots: command.acceptAlternativeTimeSlots,
      capacityTolerancePercent: command.capacityTolerancePercent,
      requiredFeatures: command.requiredFeatures,
      preferredFeatures: command.preferredFeatures,
      maxDistanceMeters: command.maxDistanceMeters,
      notifyUser: command.notifyUser,
      notificationMethods: command.notificationMethods,
      autoProcessSingleOption: command.autoProcessSingleOption,
      compensationInfo: command.compensationInfo,
      internalNotes: command.internalNotes,
      tags: command.tags,
      impactLevel: command.impactLevel,
      estimatedResolutionHours: command.estimatedResolutionHours,
      relatedTicketId: command.relatedTicketId,
      affectedProgramId: command.affectedProgramId,
      minAdvanceNoticeHours: command.minAdvanceNoticeHours,
      allowPartialReassignment: command.allowPartialReassignment,
      requireUserConfirmation: command.requireUserConfirmation
    };
    return await this.reassignmentService.createReassignmentRequest(dto, command.requestedBy);
  }
}

/**
 * Handler: Respond to Reassignment Request
 * Orchestrates user response to reassignment request by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(RespondToReassignmentRequestCommand)
export class RespondToReassignmentRequestHandler
  implements ICommandHandler<RespondToReassignmentRequestCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: RespondToReassignmentRequestCommand): Promise<void> {
    this.logger.log("Orchestrating user response to reassignment request", {
      reassignmentRequestId: command.reassignmentRequestId,
      userId: command.userId,
      response: command.response,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    await this.reassignmentService.respondToReassignmentRequest(
      command.reassignmentRequestId,
      command.userId,
      command.response as 'ACCEPTED' | 'REJECTED',
      command.selectedResourceId,
      command.responseNotes,
      command.requestAlternatives,
      command.alternativePreferences
    );
  }
}

/**
 * Handler: Find Equivalent Resources
 * Orchestrates search for equivalent resources by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(FindEquivalentResourcesCommand)
export class FindEquivalentResourcesHandler
  implements ICommandHandler<FindEquivalentResourcesCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: FindEquivalentResourcesCommand): Promise<EquivalentResourcesDto> {
    this.logger.log("Orchestrating equivalent resources search", {
      originalResourceId: command.originalResourceId,
      startTime: command.startTime,
      endTime: command.endTime,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    return await this.reassignmentService.findEquivalentResources(
      command.originalResourceId,
      command.startTime,
      command.endTime,
      command.capacityTolerancePercent,
      command.requiredFeatures,
      command.preferredFeatures,
      command.maxDistanceMeters,
      command.excludeResourceIds,
      command.limit,
      command.requestedBy
    );
  }
}

/**
 * Handler: Process Reassignment Request
 * Orchestrates reassignment request processing by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(ProcessReassignmentRequestCommand)
export class ProcessReassignmentRequestHandler
  implements ICommandHandler<ProcessReassignmentRequestCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ProcessReassignmentRequestCommand): Promise<void> {
    this.logger.log("Orchestrating reassignment request processing", {
      reassignmentRequestId: command.reassignmentRequestId,
      processedBy: command.processedBy,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    await this.reassignmentService.processReassignmentRequest(
      command.reassignmentRequestId,
      command.processedBy,
      command.autoSelectBestOption,
      command.notifyUser,
      command.processingNotes
    );
  }
}

/**
 * Handler: Cancel Reassignment Request
 * Orchestrates reassignment request cancellation by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(CancelReassignmentRequestCommand)
export class CancelReassignmentRequestHandler
  implements ICommandHandler<CancelReassignmentRequestCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CancelReassignmentRequestCommand): Promise<void> {
    this.logger.log("Orchestrating reassignment request cancellation", {
      reassignmentRequestId: command.reassignmentRequestId,
      userId: command.userId,
      reason: command.reason,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    await this.reassignmentService.cancelReassignmentRequest(
      command.reassignmentRequestId,
      command.userId,
      command.reason,
      command.notifyStakeholders
    );
  }
}

/**
 * Handler: Auto Process Reassignment Requests
 * Orchestrates automatic processing of reassignment requests by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(AutoProcessReassignmentRequestsCommand)
export class AutoProcessReassignmentRequestsHandler
  implements ICommandHandler<AutoProcessReassignmentRequestsCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: AutoProcessReassignmentRequestsCommand): Promise<AutoProcessReassignmentResultDto> {
    this.logger.log("Orchestrating auto processing of reassignment requests", {
      criteria: command.criteria,
      maxRequests: command.maxRequests,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    return await this.reassignmentService.autoProcessReassignmentRequests(
      command.criteria,
      'system',
      false,
      command.maxRequests
    );
  }
}

/**
 * Handler: Apply Reassignment
 * Orchestrates reassignment application by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(ApplyReassignmentCommand)
export class ApplyReassignmentHandler
  implements ICommandHandler<ApplyReassignmentCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ApplyReassignmentCommand): Promise<void> {
    this.logger.log("Orchestrating reassignment application", {
      reassignmentRequestId: command.reassignmentRequestId,
      selectedResourceId: command.selectedResourceId,
      newStartTime: command.newStartTime,
      newEndTime: command.newEndTime,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    await this.reassignmentService.applyReassignment(
      command.reassignmentRequestId,
      command.selectedResourceId,
      command.appliedBy,
      command.newStartTime,
      command.newEndTime,
      command.notifyUser,
      command.compensationApplied,
      command.applicationNotes
    );
  }
}

/**
 * Handler: Optimize Reassignment Queue
 * Orchestrates reassignment queue optimization by delegating to ReassignmentService
 */
@Injectable()
@CommandHandler(OptimizeReassignmentQueueCommand)
export class OptimizeReassignmentQueueHandler
  implements ICommandHandler<OptimizeReassignmentQueueCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentService,
    private readonly commandBus: CommandBus,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: OptimizeReassignmentQueueCommand
  ): Promise<OptimizeReassignmentQueueResultDto> {
    this.logger.log("Orchestrating reassignment queue optimization", {
      criteria: command.criteria,
      optimizedBy: command.optimizedBy,
      dryRun: command.dryRun,
    });

    // Delegate all business logic to service (Clean Architecture pattern)
    return await this.reassignmentService.optimizeReassignmentQueue(
      command.criteria,
      command.optimizedBy,
      command.dryRun,
      command.maxReassignments
    );
  }
}
