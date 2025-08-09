/**
 * Command Handlers for Waiting List Management (RF-14)
 * CQRS Command Handler Pattern Implementation
 */

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";

// Commands
import {
  JoinWaitingListCommand,
  LeaveWaitingListCommand,
  ConfirmWaitingListSlotCommand,
  ProcessWaitingListSlotsCommand,
  EscalatePriorityCommand,
  ReorderWaitingListCommand,
  ProcessExpiredEntriesCommand,
  BulkNotifyWaitingListCommand,
  UpdateWaitingListEntryCommand,
  CreateWaitingListCommand,
  CloseWaitingListCommand,
  ValidateWaitingListEntryCommand,
  OptimizeWaitingListCommand,
  TransferWaitingListEntryCommand,
  BulkProcessWaitingListsCommand,
  SetWaitingListPreferencesCommand,
} from "../commands/waiting-list.commands";

// Domain Services
import { WaitingListDomainService } from "@/apps/availability-service/domain/services/waiting-list-domain.service";
import { ReservationLimitsDomainService } from "@/apps/availability-service/domain/services/reservation-limits-domain.service";
import { ResourceRepository } from "@/apps/resources-service/domain/repositories/resource.repository";
import { UserRepository } from "@/apps/auth-service/domain/repositories/user.repository";

// Repositories
import { WaitingListEntryRepository } from "@/apps/availability-service/domain/repositories/waiting-list-entry.repository";

// Entities
import { WaitingListEntryEntity } from "@/apps/availability-service/domain/entities/waiting-list-entry.entity";
import { EventBusService } from "@/libs/event-bus/services/event-bus.service";
import { LoggingService } from "@/libs/logging/logging.service";
import { LoggingHelper } from "@/libs/logging/logging.helper";
import { WaitingListPriority } from "../../utils";
import { UserPriority } from "../../utils";

@Injectable()
@CommandHandler(JoinWaitingListCommand)
export class JoinWaitingListHandler
  implements ICommandHandler<JoinWaitingListCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly reservationLimitsService: ReservationLimitsDomainService,
    private readonly waitingListRepository: WaitingListEntryRepository,
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly resourceRepository: ResourceRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  getUserPriorityFromWaitingListPriority(
    waitingListPriority: WaitingListPriority
  ): UserPriority {
    switch (waitingListPriority) {
      case WaitingListPriority.HIGH:
        return UserPriority.ADMIN_GENERAL;
      case WaitingListPriority.MEDIUM:
        return UserPriority.PROGRAM_DIRECTOR;
      case WaitingListPriority.LOW:
        return UserPriority.TEACHER;
      default:
        return UserPriority.EXTERNAL;
    }
  }

  async execute(command: JoinWaitingListCommand): Promise<{
    entry: WaitingListEntryEntity;
    position: number;
    estimatedWaitTime: number | null;
    warnings: string[];
  }> {
    this.logger.log("User joining waiting list", {
      userId: command.userId,
      resourceId: command.resourceId,
      desiredStartTime: command.desiredStartTime,
      priority: command.priority,
    });

    try {
      // Validate resource exists
      const resource = await this.resourceRepository.findById(
        command.resourceId
      );
      if (!resource) {
        throw new NotFoundException(
          `Resource with ID ${command.resourceId} not found`
        );
      }

      // Validate user exists
      const user = await this.userRepository.findById(command.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${command.userId} not found`);
      }

      // Check reservation limits
      const canJoin =
        await this.reservationLimitsService.validateReservationLimits({
          userId: command.userId,
          resourceId: command.resourceId,
          programId: command.programId,
          startDate: command.desiredStartTime,
          endDate: command.desiredEndTime,
          isRecurring: false,
          recurringInstanceCount: 1,
        });

      if (!canJoin.allowed) {
        throw new BadRequestException(
          `Cannot join waiting list: ${canJoin.violations[0].description}`
        );
      }

      // Find or create waiting list for the resource and time slot
      let waitingList = await this.waitingListRepository.findByResourceAndTime(
        command.resourceId,
        command.desiredStartTime,
        command.desiredEndTime
      );

      if (!waitingList) {
        waitingList = [
          await this.waitingListService.createWaitingList(
            command.resourceId,
            command.desiredStartTime,
            command.desiredEndTime,
            10, // default max entries
            command.requestedBy
          ),
        ];
      }

      // Add user to waiting list
      const entry = await this.waitingListService.addToWaitingList({
        waitingListId: waitingList[0].id,
        userId: command.userId,
        resourceId: command.resourceId,
        userPriority: this.getUserPriorityFromWaitingListPriority(
          command.priority
        ),
        confirmationTimeLimit: command.confirmationTimeLimit,
      });

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "waiting-list.user-joined",
        eventId: `waiting-list-user-joined-${Date.now()}`,
        aggregateId: waitingList[0].id,
        aggregateType: "WaitingList",
        eventData: {
          entryId: entry.entry.id,
          userId: command.userId,
          resourceId: command.resourceId,
          position: entry.position,
          priority: command.priority,
          desiredStartTime: command.desiredStartTime,
          desiredEndTime: command.desiredEndTime,
          requestedBy: command.requestedBy,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      this.logger.log("User successfully joined waiting list", {
        entryId: entry.entry.id,
        waitingListId: waitingList[0].id,
        position: entry.position,
      });

      return entry;
    } catch (error) {
      this.logger.error(
        "Failed to join waiting list",
        error,
        LoggingHelper.stringify({
          userId: command.userId,
          resourceId: command.resourceId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(LeaveWaitingListCommand)
export class LeaveWaitingListHandler
  implements ICommandHandler<LeaveWaitingListCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: LeaveWaitingListCommand): Promise<void> {
    this.logger.log("User leaving waiting list", {
      waitingListId: command.waitingListId,
      entryId: command.entryId,
      userId: command.userId,
      reason: command.reason,
    });

    try {
      // Validate entry exists and belongs to user
      const entry = await this.waitingListEntryRepository.findById(
        command.entryId
      );
      if (!entry) {
        throw new NotFoundException(
          `Waiting list entry with ID ${command.entryId} not found`
        );
      }

      if (entry.userId !== command.userId) {
        throw new ForbiddenException(
          "You can only leave your own waiting list entries"
        );
      }

      // Remove from waiting list
      await this.waitingListService.removeFromWaitingList(
        command.waitingListId,
        command.entryId,
        command.reason
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "waiting-list.user-left",
        eventId: `waiting-list-user-left-${Date.now()}`,
        aggregateId: command.waitingListId,
        aggregateType: "WaitingList",
        eventData: {
          entryId: command.entryId,
          userId: command.userId,
          reason: command.reason,
          cancelledBy: command.cancelledBy,
        },
        timestamp: new Date(),
        version: 1,
      });

      this.logger.log("User successfully left waiting list", {
        entryId: command.entryId,
        waitingListId: command.waitingListId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to leave waiting list",
        error,
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
          entryId: command.entryId,
          userId: command.userId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ConfirmWaitingListSlotCommand)
export class ConfirmWaitingListSlotHandler
  implements ICommandHandler<ConfirmWaitingListSlotCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ConfirmWaitingListSlotCommand): Promise<void> {
    this.logger.log("User confirming waiting list slot", {
      waitingListId: command.waitingListId,
      entryId: command.entryId,
      userId: command.userId,
    });

    try {
      // Validate entry exists and belongs to user
      const entry = await this.waitingListEntryRepository.findById(
        command.entryId
      );
      if (!entry) {
        throw new NotFoundException(
          `Waiting list entry with ID ${command.entryId} not found`
        );
      }

      if (entry.userId !== command.userId) {
        throw new ForbiddenException(
          "You can only confirm your own waiting list entries"
        );
      }

      // Confirm the slot
      await this.waitingListService.confirmSlot(
        command.waitingListId,
        command.entryId,
        command.notes
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "waiting-list.slot-confirmed",
        eventId: `waiting-list-slot-confirmed-${Date.now()}`,
        aggregateId: command.waitingListId,
        aggregateType: "WaitingList",
        eventData: {
          entryId: command.entryId,
          userId: command.userId,
          notes: command.notes,
          confirmedBy: command.confirmedBy,
        },
        timestamp: new Date(),
        version: 1,
      });

      this.logger.log("Waiting list slot confirmed successfully", {
        entryId: command.entryId,
        waitingListId: command.waitingListId,
      });
    } catch (error) {
      this.logger.error(
        "Failed to confirm waiting list slot",
        error,
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
          entryId: command.entryId,
          userId: command.userId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ProcessWaitingListSlotsCommand)
export class ProcessWaitingListSlotsHandler
  implements ICommandHandler<ProcessWaitingListSlotsCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: ProcessWaitingListSlotsCommand
  ): Promise<{ remaining: number; skipped: number; notified: number }> {
    this.logger.log("Processing waiting list slots", {
      waitingListId: command.waitingListId,
      availableSlots: command.availableSlots.length,
      processedBy: command.processedBy,
    });

    try {
      const result = await this.waitingListService.processAvailableSlots(
        command.waitingListId,
        command.availableSlots,
        command.notifyUsers,
        command.autoConfirmIfSingleUser
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "waiting-list.slots-processed",
        eventId: `waiting-list-slots-processed-${Date.now()}`,
        aggregateId: command.waitingListId,
        aggregateType: "WaitingList",
        eventData: {
          availableSlots: command.availableSlots,
          remaining: result.remainingEntries.length,
          skipped: result.skippedEntries.length,
          notified: result.notifiedEntries.length,
          processedBy: command.processedBy,
        },
        timestamp: new Date(),
        version: 1,
      });

      this.logger.log(
        "Waiting list slots processed successfully",
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
          remaining: result.remainingEntries.length,
          skipped: result.skippedEntries.length,
          notified: result.notifiedEntries.length,
        })
      );

      return {
        remaining: result.remainingEntries.length,
        skipped: result.skippedEntries.length,
        notified: result.notifiedEntries.length,
      };
    } catch (error) {
      this.logger.error(
        "Failed to process waiting list slots",
        error,
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(EscalatePriorityCommand)
export class EscalatePriorityHandler
  implements ICommandHandler<EscalatePriorityCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly waitingListEntryRepository: WaitingListEntryRepository,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: EscalatePriorityCommand): Promise<void> {
    this.logger.log("Escalating waiting list priority", {
      waitingListId: command.waitingListId,
      entryId: command.entryId,
      newPriority: command.newPriority,
      reason: command.reason,
    });

    try {
      // Validate entry exists
      const entry = await this.waitingListEntryRepository.findById(
        command.entryId
      );
      if (!entry) {
        throw new NotFoundException(
          `Waiting list entry with ID ${command.entryId} not found`
        );
      }

      // Escalate priority
      await this.waitingListService.escalatePriority(
        command.waitingListId,
        command.entryId,
        command.newPriority,
        command.reason
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "waiting-list.priority-escalated",
        eventId: `waiting-list-priority-escalated-${Date.now()}`,
        aggregateId: command.waitingListId,
        aggregateType: "WaitingList",
        eventData: {
          entryId: command.entryId,
          userId: entry.userId,
          oldPriority: entry.priority,
          newPriority: command.newPriority,
          reason: command.reason,
          escalatedBy: command.escalatedBy,
          timestamp: new Date(),
        },
        version: 1,
        timestamp: new Date(),
      });

      this.logger.log("Waiting list priority escalated successfully", {
        entryId: command.entryId,
        newPriority: command.newPriority,
      });
    } catch (error) {
      this.logger.error(
        "Failed to escalate waiting list priority",
        error,
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
          entryId: command.entryId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(ProcessExpiredEntriesCommand)
export class ProcessExpiredEntriesHandler
  implements ICommandHandler<ProcessExpiredEntriesCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: ProcessExpiredEntriesCommand
  ): Promise<{ processed: number; expired: number }> {
    this.logger.log("Processing expired waiting list entries", {
      waitingListId: command.waitingListId,
      processAll: command.processAll,
      processedBy: command.processedBy,
    });

    try {
      const result = await this.waitingListService.processExpiredEntries(
        command.waitingListId,
        command.processAll,
        command.notifyUsers
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "waiting-list.expired-entries-processed",
        eventId: `waiting-list-expired-entries-processed-${Date.now()}`,
        aggregateId: command.waitingListId,
        aggregateType: "WaitingList",
        eventData: {
          expiredEntries: result.expiredEntries,
          newlyNotified: result.newlyNotified,
          totalProcessed: result.totalProcessed,
          processAll: command.processAll,
          processedBy: command.processedBy,
          timestamp: new Date(),
        },
        timestamp: new Date(),
        version: 1,
      });

      this.logger.log(
        "Expired waiting list entries processed successfully",
        LoggingHelper.stringify({
          expiredEntries: result.expiredEntries,
          newlyNotified: result.newlyNotified,
          totalProcessed: result.totalProcessed,
          processAll: command.processAll,
          processedBy: command.processedBy,
          timestamp: new Date(),
        })
      );

      return {
        processed: result.totalProcessed,
        expired: result.expiredEntries.length,
      };
    } catch (error) {
      this.logger.error(
        "Failed to process expired waiting list entries",
        error,
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(BulkNotifyWaitingListCommand)
export class BulkNotifyWaitingListHandler
  implements ICommandHandler<BulkNotifyWaitingListCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: BulkNotifyWaitingListCommand
  ): Promise<{ notified: number; failed: string[] }> {
    this.logger.log("Bulk notifying waiting list entries", {
      waitingListId: command.waitingListId,
      entryIds: command.entryIds,
      notificationType: command.notificationType,
    });

    try {
      const result = await this.waitingListService.bulkNotifyEntries(
        command.waitingListId,
        command.entryIds,
        command.message,
        command.notificationType,
        command.includeAlternatives
      );

      // Publish event
      await this.eventBus.publishEvent({
        eventType: "waiting-list.bulk-notified",
        eventId: `waiting-list-bulk-notified-${Date.now()}`,
        aggregateId: command.waitingListId,
        aggregateType: "WaitingList",
        eventData: {
          entryIds: command.entryIds,
          notifiedEntries: result.notifiedEntries,
          remainingEntries: result.remainingEntries,
          skippedEntries: result.skippedEntries,
          notificationType: command.notificationType,
          message: command.message,
          notifiedBy: command.notifiedBy,
          timestamp: new Date(),
        },
        timestamp: new Date(),
        version: 1,
      });

      this.logger.log(
        "Bulk notification completed",
        LoggingHelper.stringify({
          notifiedEntries: result.notifiedEntries,
          remainingEntries: result.remainingEntries,
          skippedEntries: result.skippedEntries,
          notificationType: command.notificationType,
          message: command.message,
          notifiedBy: command.notifiedBy,
          timestamp: new Date(),
        })
      );

      return {
        notified: result.notifiedEntries.length,
        failed: result.skippedEntries.map((entry) => entry.entry.id),
      };
    } catch (error) {
      this.logger.error(
        "Failed to bulk notify waiting list entries",
        error,
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
        })
      );
      throw error;
    }
  }
}

@Injectable()
@CommandHandler(OptimizeWaitingListCommand)
export class OptimizeWaitingListHandler
  implements ICommandHandler<OptimizeWaitingListCommand>
{
  constructor(
    private readonly waitingListService: WaitingListDomainService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: OptimizeWaitingListCommand
  ): Promise<{ reordered: number; suggestions: any[] }> {
    this.logger.log("Optimizing waiting list", {
      waitingListId: command.waitingListId,
      optimizationCriteria: command.optimizationCriteria,
      dryRun: command.dryRun,
    });

    try {
      const result = await this.waitingListService.optimizeWaitingList(
        command.waitingListId,
        command.optimizationCriteria,
        command.dryRun
      );

      if (!command.dryRun) {
        // Publish event
        await this.eventBus.publishEvent({
          eventType: "waiting-list.optimized",
          eventId: `waiting-list-optimized-${Date.now()}`,
          aggregateId: command.waitingListId,
          aggregateType: "WaitingList",
          eventData: {
            optimizationCriteria: command.optimizationCriteria,
            reordered: result.reordered,
            suggestions: result.suggestions,
            optimizedBy: command.optimizedBy,
          },
          timestamp: new Date(),
          version: 1,
        });
      }

      this.logger.log("Waiting list optimization completed", {
        waitingListId: command.waitingListId,
        reordered: result.reordered,
        suggestionsCount: result.suggestions.length,
        dryRun: command.dryRun,
      });

      return result;
    } catch (error) {
      this.logger.error(
        "Failed to optimize waiting list",
        error,
        LoggingHelper.stringify({
          waitingListId: command.waitingListId,
        })
      );
      throw error;
    }
  }
}
