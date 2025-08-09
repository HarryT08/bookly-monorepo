/**
 * Command Handlers for Reassignment Request Management (RF-15)
 * CQRS Command Handler Pattern Implementation
 */

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { LoggingService } from "@libs/logging/logging.service";
import { EventBusService } from "@libs/event-bus/services/event-bus.service";

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

// Domain Services
import { ReassignmentDomainService } from "../../domain/services/reassignment-domain.service";
import { ReservationLimitsDomainService } from "../../domain/services/reservation-limits-domain.service";

// Repositories
import { ReassignmentRequestRepository } from "../../domain/repositories/reassignment-request.repository";
import { ReservationRepository } from "../../domain/repositories/reservation.repository";

// Entities
import { ReassignmentRequestEntity } from "../../domain/entities/reassignment-request.entity";
import { ReassignmentStatus, UserResponse } from "../../utils";
import { ResourceRepository } from "@/apps/resources-service/domain/repositories/resource.repository";
import { UserRepository } from "@/apps/auth-service/domain/repositories/user.repository";
import { LoggingHelper } from "@/libs/logging/logging.helper";

@Injectable()
@CommandHandler(CreateReassignmentRequestCommand)
export class CreateReassignmentRequestHandler
  implements ICommandHandler<CreateReassignmentRequestCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly reservationLimitsService: ReservationLimitsDomainService,
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly resourceRepository: ResourceRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: CreateReassignmentRequestCommand
  ): Promise<ReassignmentRequestEntity> {
    this.logger.log("Creating reassignment request", {
      originalReservationId: command.originalReservationId,
      requestedBy: command.requestedBy,
      reason: command.reason,
      priority: command.priority,
      suggestedResourceId: command.suggestedResourceId,
    });

    try {
      // Validate original reservation exists
      const originalReservation = await this.reservationRepository.findById(
        command.originalReservationId
      );
      if (!originalReservation) {
        throw new NotFoundException(
          `Reservation with ID ${command.originalReservationId} not found`
        );
      }

      // Validate suggested resource exists
      const suggestedResource = await this.resourceRepository.findById(
        command.suggestedResourceId
      );
      if (!suggestedResource) {
        throw new NotFoundException(
          `Suggested resource with ID ${command.suggestedResourceId} not found`
        );
      }

      // Validate requester exists
      const requester = await this.userRepository.findById(command.requestedBy);
      if (!requester) {
        throw new NotFoundException(
          `User with ID ${command.requestedBy} not found`
        );
      }

      // Validate suggested resource if provided
      if (command.suggestedResourceId) {
        const suggestedResource = await this.resourceRepository.findById(
          command.suggestedResourceId
        );
        if (!suggestedResource) {
          throw new NotFoundException(
            `Suggested resource with ID ${command.suggestedResourceId} not found`
          );
        }
      }

      // Create reassignment request entity
      const reassignmentRequest = ReassignmentRequestEntity.create({
        originalReservationId: command.originalReservationId,
        requestedBy: command.requestedBy,
        reason: command.reason,
        customReason: command.reasonDescription,
        suggestedResourceId: command.suggestedResourceId,
        priority: command.userPriority,
        responseDeadline: command.responseDeadline,
        acceptEquivalentResources: command.acceptEquivalentResources,
        acceptAlternativeTimeSlots: command.acceptAlternativeTimeSlots,
        capacityTolerancePercent: command.capacityTolerancePercent,
        requiredFeatures: command.requiredFeatures,
        preferredFeatures: command.preferredFeatures,
        maxDistanceMeters: command.maxDistanceMeters,
        compensationInfo: command.compensationInfo,
        internalNotes: command.internalNotes,
        tags: command.tags,
        impactLevel: command.impactLevel,
        estimatedResolutionHours: command.estimatedResolutionHours,
        relatedTicketId: command.relatedTicketId,
        affectedProgramId: command.affectedProgramId,
        minAdvanceNoticeHours: command.minAdvanceNoticeHours,
        allowPartialReassignment: command.allowPartialReassignment,
        requireUserConfirmation: command.requireUserConfirmation,
        status: ReassignmentStatus.PENDING,
        userResponse: UserResponse.PENDING,
        rejectionCount: 0,
      });

      // Validate the reassignment request
      const validation =
        await this.reassignmentService.validateReassignmentRequest(
          reassignmentRequest.originalReservationId,
          reassignmentRequest.requestedBy,
          reassignmentRequest.reason
        );
      if (!validation.isValid) {
        throw new BadRequestException(
          `Validation failed: ${validation.errors.join(", ")}`
        );
      }

      // Save the reassignment request
      const savedRequest =
        await this.reassignmentRequestRepository.create(reassignmentRequest);

      // Find equivalent resources if requested
      if (command.acceptEquivalentResources) {
        await this.reassignmentService.findEquivalentResources(
          // originalReservationId
          savedRequest.originalReservationId,
          // programId
          savedRequest.affectedProgramId,
          // requiredCapacity
          suggestedResource.capacity,
          // preferredFeatures
          savedRequest.preferredFeatures,
          // timeSlot
          {
            date: originalReservation.startDate,
            startTime: originalReservation.startDate.toISOString(),
            endTime: originalReservation.endDate.toISOString(),
          }
        );
      }

      // Auto-process if single option and enabled
      if (command.autoProcessSingleOption) {
        await this.reassignmentService.autoProcessIfSingleOption(
          savedRequest.id
        );
      }

      // Notify user if requested
      if (command.notifyUser) {
        await this.reassignmentService.notifyUser(
          savedRequest.id,
          "REASSIGNMENT_REQUEST_CREATED",
          command.notificationMethods
        );
      }

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `reassignment-request.created-${Date.now()}`,
        eventType: "ReassignmentRequestCreated",
        aggregateId: savedRequest.id,
        aggregateType: "ReassignmentRequest",
        eventData: {
          reassignmentRequestId: savedRequest.id,
          originalReservationId: command.originalReservationId,
          requestedBy: command.requestedBy,
          reason: command.reason,
          priority: command.priority,
          suggestedResourceId: command.suggestedResourceId,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      this.logger.log("Reassignment request created successfully", {
        id: savedRequest.id,
        originalReservationId: command.originalReservationId,
        requestedBy: command.requestedBy,
      });

      return savedRequest;
    } catch (error) {
      this.logger.error(
        "Failed to create reassignment request",
        error,
        LoggingHelper.logParams({
          originalReservationId: command.originalReservationId,
          requestedBy: command.requestedBy,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(RespondToReassignmentRequestCommand)
export class RespondToReassignmentRequestHandler
  implements ICommandHandler<RespondToReassignmentRequestCommand>
{
  reservationRepository: any;
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: RespondToReassignmentRequestCommand): Promise<void> {
    this.logger.log("User responding to reassignment request", {
      reassignmentRequestId: command.reassignmentRequestId,
      userId: command.userId,
      response: command.response,
      selectedResourceId: command.selectedResourceId,
    });

    try {
      // Validate request exists
      const request = await this.reassignmentRequestRepository.findById(
        command.reassignmentRequestId
      );
      if (!request) {
        throw new NotFoundException(
          `Reassignment request with ID ${command.reassignmentRequestId} not found`
        );
      }

      // Check permissions (user must be the reservation owner)
      const reservation = await this.reservationRepository.findById(
        request.originalReservationId
      );
      if (!reservation || reservation.userId !== command.userId) {
        throw new ForbiddenException(
          "You can only respond to your own reassignment requests"
        );
      }

      // Process the response
      await this.reassignmentService.processUserResponse(
        command.reassignmentRequestId,
        command.response,
        command.selectedResourceId,
        command.responseNotes,
        command.requestAlternatives,
        command.alternativePreferences as any
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "reassignment-request.user-responded",
        eventId: `reassignment-user-responded-${Date.now()}`,
        aggregateId: command.reassignmentRequestId,
        aggregateType: "ReassignmentRequest",
        eventData: {
          reassignmentRequestId: command.reassignmentRequestId,
          userId: command.userId,
          response: command.response,
          selectedResourceId: command.selectedResourceId,
          responseNotes: command.responseNotes,
          requestAlternatives: command.requestAlternatives,
          respondedBy: command.respondedBy,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      this.logger.log("User response processed successfully", {
        reassignmentRequestId: command.reassignmentRequestId,
        response: command.response,
      });
    } catch (error) {
      this.logger.error(
        "Failed to process user response",
        error,
        LoggingHelper.logParams({
          reassignmentRequestId: command.reassignmentRequestId,
          userId: command.userId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(FindEquivalentResourcesCommand)
export class FindEquivalentResourcesHandler
  implements ICommandHandler<FindEquivalentResourcesCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: FindEquivalentResourcesCommand): Promise<any[]> {
    this.logger.log("Finding equivalent resources", {
      originalResourceId: command.originalResourceId,
      startTime: command.startTime,
      endTime: command.endTime,
      capacityTolerancePercent: command.capacityTolerancePercent,
      limit: command.limit,
    });

    try {
      const equivalentResources =
        await this.reassignmentService.findEquivalentResourcesForTimeSlot(
          command.originalResourceId,
          command.startTime,
          command.endTime,
          command.capacityTolerancePercent,
          command.requiredFeatures,
          command.preferredFeatures,
          command.maxDistanceMeters,
          command.excludeResourceIds,
          command.limit
        );

      this.logger.log("Equivalent resources found successfully", {
        originalResourceId: command.originalResourceId,
        foundCount: equivalentResources.length,
      });

      return equivalentResources;
    } catch (error) {
      this.logger.error(
        "Failed to find equivalent resources",
        error,
        LoggingHelper.logParams({
          originalResourceId: command.originalResourceId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ProcessReassignmentRequestCommand)
export class ProcessReassignmentRequestHandler
  implements ICommandHandler<ProcessReassignmentRequestCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ProcessReassignmentRequestCommand): Promise<void> {
    this.logger.log("Processing reassignment request", {
      reassignmentRequestId: command.reassignmentRequestId,
      processedBy: command.processedBy,
      autoSelectBestOption: command.autoSelectBestOption,
    });

    try {
      await this.reassignmentService.processReassignmentRequest(
        command.reassignmentRequestId,
        command.autoSelectBestOption,
        command.notifyUser,
        command.processingNotes
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "reassignment-request.processed",
        eventId: `reassignment-processed-${Date.now()}`,
        aggregateId: command.reassignmentRequestId,
        aggregateType: "ReassignmentRequest",
        eventData: {
          reassignmentRequestId: command.reassignmentRequestId,
          processedBy: command.processedBy,
          autoSelectBestOption: command.autoSelectBestOption,
          processingNotes: command.processingNotes,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      this.logger.log(
        "Reassignment request processed successfully",
        LoggingHelper.logParams({
          reassignmentRequestId: command.reassignmentRequestId,
        })
      );
    } catch (error) {
      this.logger.error(
        "Failed to process reassignment request",
        error,
        LoggingHelper.logParams({
          reassignmentRequestId: command.reassignmentRequestId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(CancelReassignmentRequestCommand)
export class CancelReassignmentRequestHandler
  implements ICommandHandler<CancelReassignmentRequestCommand>
{
  reservationRepository: any;
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly reassignmentRequestRepository: ReassignmentRequestRepository,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: CancelReassignmentRequestCommand): Promise<void> {
    this.logger.log("Cancelling reassignment request", {
      reassignmentRequestId: command.reassignmentRequestId,
      userId: command.userId,
      reason: command.reason,
    });

    try {
      // Validate request exists
      const request = await this.reassignmentRequestRepository.findById(
        command.reassignmentRequestId
      );
      if (!request) {
        throw new NotFoundException(
          `Reassignment request with ID ${command.reassignmentRequestId} not found`
        );
      }

      // Check permissions
      const reservation = await this.reservationRepository.findById(
        request.originalReservationId
      );
      if (
        !reservation ||
        (reservation.userId !== command.userId &&
          request.requestedBy !== command.userId)
      ) {
        throw new ForbiddenException(
          "You can only cancel your own reassignment requests"
        );
      }

      // Cancel the request
      await this.reassignmentService.cancelReassignmentRequest(
        command.reassignmentRequestId,
        command.reason,
        command.notifyStakeholders
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventId: `reassignment-request-cancelled-${Date.now()}`,
        eventType: "ReassignmentRequestCancelled",
        aggregateId: command.reassignmentRequestId,
        aggregateType: "ReassignmentRequest",
        eventData: {
          reassignmentRequestId: command.reassignmentRequestId,
          userId: command.userId,
          reason: command.reason,
          cancelledBy: command.cancelledBy,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      this.logger.log("Reassignment request cancelled successfully", {
        reassignmentRequestId: command.reassignmentRequestId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to cancel reassignment request",
        error,
        LoggingHelper.logParams({
          reassignmentRequestId: command.reassignmentRequestId,
          userId: command.userId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(AutoProcessReassignmentRequestsCommand)
export class AutoProcessReassignmentRequestsHandler
  implements ICommandHandler<AutoProcessReassignmentRequestsCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: AutoProcessReassignmentRequestsCommand
  ): Promise<{ processed: number; failed: string[] }> {
    this.logger.log("Auto-processing reassignment requests", {
      criteria: command.criteria,
      processedBy: command.processedBy,
      dryRun: command.dryRun,
      maxRequests: command.maxRequests,
    });

    try {
      const result =
        await this.reassignmentService.autoProcessReassignmentRequests(
          command.criteria,
          command.dryRun,
          command.maxRequests
        );

      if (!command.dryRun) {
        // Publish event
        await this.eventBus.publishEvent({
          eventType: "reassignment-requests.auto-processed",
          eventId: `reassignment-auto-processed-${Date.now()}`,
          aggregateId: command.processedBy,
          aggregateType: "ReassignmentRequest",
          eventData: {
            criteria: command.criteria,
            processed: result.processed,
            failed: result.failed,
            processedBy: command.processedBy,
            timestamp: new Date(),
          },
          version: 1,
          timestamp: new Date(),
        });
      }

      this.logger.log(
        "Auto-processing completed",
        LoggingHelper.logParams({
          processed: result.processed,
          failed: result.failed.length,
          dryRun: command.dryRun,
        })
      );

      return result;
    } catch (error) {
      this.logger.error(
        "Failed to auto-process reassignment requests",
        error,
        LoggingHelper.logParams({
          criteria: command.criteria,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ApplyReassignmentCommand)
export class ApplyReassignmentHandler
  implements ICommandHandler<ApplyReassignmentCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ApplyReassignmentCommand): Promise<void> {
    this.logger.log("Applying reassignment", {
      reassignmentRequestId: command.reassignmentRequestId,
      selectedResourceId: command.selectedResourceId,
      appliedBy: command.appliedBy,
    });

    try {
      await this.reassignmentService.applyReassignment(
        command.reassignmentRequestId,
        command.selectedResourceId,
        command.newStartTime,
        command.newEndTime,
        command.notifyUser,
        command.compensationApplied,
        command.applicationNotes
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "reassignment-request.applied",
        eventId: `reassignment-applied-${Date.now()}`,
        aggregateId: command.reassignmentRequestId,
        aggregateType: "ReassignmentRequest",
        eventData: {
          reassignmentRequestId: command.reassignmentRequestId,
          selectedResourceId: command.selectedResourceId,
          newStartTime: command.newStartTime,
          newEndTime: command.newEndTime,
          compensationApplied: command.compensationApplied,
          appliedBy: command.appliedBy,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      this.logger.log("Reassignment applied successfully", {
        reassignmentRequestId: command.reassignmentRequestId,
        selectedResourceId: command.selectedResourceId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to apply reassignment",
        error,
        LoggingHelper.logParams({
          reassignmentRequestId: command.reassignmentRequestId,
          selectedResourceId: command.selectedResourceId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(OptimizeReassignmentQueueCommand)
export class OptimizeReassignmentQueueHandler
  implements ICommandHandler<OptimizeReassignmentQueueCommand>
{
  constructor(
    private readonly reassignmentService: ReassignmentDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: OptimizeReassignmentQueueCommand
  ): Promise<{ optimized: number; suggestions: any[] }> {
    this.logger.log("Optimizing reassignment queue", {
      criteria: command.criteria,
      optimizedBy: command.optimizedBy,
      dryRun: command.dryRun,
      maxReassignments: command.maxReassignments,
    });

    try {
      const result = await this.reassignmentService.optimizeReassignmentQueue(
        command.criteria,
        command.dryRun,
        command.maxReassignments,
        command.notifyAffectedUsers
      );

      if (!command.dryRun) {
        // Publish event
        await this.eventBus.publishEvent({
          eventId: `reassignment-queue-optimized-${Date.now()}`,
          eventType: "ReassignmentQueueOptimized",
          aggregateId: command.optimizedBy,
          aggregateType: "ReassignmentQueue",
          eventData: {
            criteria: command.criteria,
            optimized: result.optimized,
            suggestions: result.suggestions,
            optimizedBy: command.optimizedBy,
            timestamp: new Date(),
          },
          timestamp: new Date(),
          version: 1,
        });
      }

      this.logger.log("Reassignment queue optimization completed", {
        optimized: result.optimized,
        suggestionsCount: result.suggestions.length,
        dryRun: command.dryRun,
      });

      return result;
    } catch (error) {
      this.logger.error(
        "Failed to optimize reassignment queue",
        error,
        LoggingHelper.logParams({
          criteria: command.criteria,
        })
      );
      throw error;
    }
  }
}
