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
} from "../commands/waiting-list.commands";

// Application Services
import { WaitingListService } from "../services/waiting-list.service";

// Entities  
import { WaitingListEntryEntity } from "@apps/availability-service/domain/entities/waiting-list-entry.entity";
import { LoggingService } from "@libs/logging/logging.service";
import { WaitingListPriority } from "../../utils";

@Injectable()
@CommandHandler(JoinWaitingListCommand)
export class JoinWaitingListHandler
  implements ICommandHandler<JoinWaitingListCommand>
{
  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: JoinWaitingListCommand): Promise<{
    entry: WaitingListEntryEntity;
    position: number;
    estimatedWaitTime: number | null;
    warnings: string[];
  }> {
    this.logger.log("Orchestrating user join waiting list", {
      userId: command.userId,
      resourceId: command.resourceId,
      priority: command.priority,
    });

    try {
      // Delegate all business logic to WaitingListService
      return await this.waitingListService.joinWaitingList({
        userId: command.userId,
        resourceId: command.resourceId,
        programId: command.programId,
        desiredStartTime: command.desiredStartTime,
        desiredEndTime: command.desiredEndTime,
        priority: command.priority.toString(),
        confirmationTimeLimit: command.confirmationTimeLimit,
        requestedBy: command.requestedBy,
      });
    } catch (error) {
      this.logger.error("Failed to orchestrate join waiting list", error);
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
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: LeaveWaitingListCommand): Promise<void> {
    this.logger.log("Orchestrating user leave waiting list", {
      userId: command.userId,
      entryId: command.entryId,
      reason: command.reason,
    });

    try {
      // Delegate all business logic to WaitingListService
      await this.waitingListService.leaveWaitingList(
        command.entryId,
        command.userId,
        command.reason
      );

      this.logger.log("User successfully left waiting list", {
        entryId: command.entryId,
        userId: command.userId,
      });
    } catch (error) {
      this.logger.error("Failed to orchestrate leave waiting list", error);
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
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: ConfirmWaitingListSlotCommand): Promise<void> {
    this.logger.log("Orchestrating waiting list slot confirmation", {
      userId: command.userId,
      entryId: command.entryId,
      confirmedBy: command.confirmedBy,
    });

    try {
      // Delegate all business logic to WaitingListService
      const confirmed = command.confirmedBy === command.userId; // User confirms their own slot
      await this.waitingListService.confirmSlot(
        command.entryId,
        command.userId,
        confirmed
      );

      this.logger.log(
        `Waiting list slot ${confirmed ? "confirmed" : "processed"}`,
        {
          entryId: command.entryId,
          userId: command.userId,
          confirmedBy: command.confirmedBy,
        }
      );
    } catch (error) {
      this.logger.error("Failed to orchestrate slot confirmation", error);
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
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: ProcessWaitingListSlotsCommand
  ): Promise<{ remaining: number; skipped: number; notified: number }> {
    this.logger.log("Orchestrating waiting list slots processing", {
      waitingListId: command.waitingListId,
      availableSlots: command.availableSlots.length,
      processedBy: command.processedBy,
    });

    try {
      // Delegate all business logic to WaitingListService
      const result = await this.waitingListService.processAvailableSlots(
        command.waitingListId,
        command.availableSlots,
        command.notifyUsers,
        command.autoConfirmIfSingleUser
      );

      this.logger.log("Waiting list slots processed successfully", {
        waitingListId: command.waitingListId,
        remaining: result.remaining,
        skipped: result.skipped,
        notified: result.notified,
      });

      return result;
    } catch (error) {
      this.logger.error("Failed to orchestrate slots processing", error);
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
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(command: EscalatePriorityCommand): Promise<void> {
    this.logger.log("Orchestrating waiting list priority escalation", {
      waitingListId: command.waitingListId,
      entryId: command.entryId,
      newPriority: command.newPriority,
      reason: command.reason,
    });

    try {
      // Delegate all business logic to WaitingListService
      await this.waitingListService.escalatePriority(
        command.waitingListId,
        command.entryId,
        command.newPriority
      );

      this.logger.log("Waiting list priority escalated successfully", {
        entryId: command.entryId,
        newPriority: command.newPriority,
      });
    } catch (error) {
      this.logger.error("Failed to orchestrate priority escalation", error);
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
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: ProcessExpiredEntriesCommand
  ): Promise<{ processed: number; expired: number }> {
    this.logger.log("Orchestrating expired waiting list entries processing", {
      waitingListId: command.waitingListId,
      processAll: command.processAll,
      processedBy: command.processedBy,
    });

    try {
      const result = await this.waitingListService.processExpiredEntries();

      this.logger.log("Expired waiting list entries processed successfully", {
        processed: result.processedCount,
        expired: result.processedCount,
      });

      return {
        processed: result.processedCount,
        expired: result.processedCount,
      };
    } catch (error) {
      this.logger.error("Failed to orchestrate expired entries processing", error);
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
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: BulkNotifyWaitingListCommand
  ): Promise<{ notified: number; failed: string[] }> {
    this.logger.log("Orchestrating bulk notification of waiting list entries", {
      waitingListId: command.waitingListId,
      entryIds: command.entryIds,
      notificationType: command.notificationType,
    });

    try {
      // Delegate all business logic to WaitingListService
      const result = await this.waitingListService.bulkNotify(
        command.entryIds,
        'Bulk notification from admin'
      );

      this.logger.log("Bulk notification completed successfully", {
        notified: result.notifiedCount,
        failed: 0,
      });

      return {
        notified: result.notifiedCount,
        failed: [],
      };
    } catch (error) {
      this.logger.error("Failed to orchestrate bulk notification", error);
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
    private readonly waitingListService: WaitingListService,
    private readonly logger: LoggingService
  ) {}

  async execute(
    command: OptimizeWaitingListCommand
  ): Promise<{ reordered: number; suggestions: any[] }> {
    this.logger.log("Orchestrating waiting list optimization", {
      waitingListId: command.waitingListId,
      optimizationCriteria: command.optimizationCriteria,
      dryRun: command.dryRun,
    });

    try {
      // Delegate all business logic to WaitingListService
      const result = await this.waitingListService.optimizeQueue(
        command.waitingListId
      );

      this.logger.log("Waiting list optimization completed", {
        waitingListId: command.waitingListId,
        optimizedCount: result.optimizedCount,
        recommendationsCount: result.recommendations.length,
      });

      return {
        reordered: result.optimizedCount,
        suggestions: result.recommendations,
      };
    } catch (error) {
      this.logger.error("Failed to orchestrate optimization", error);
      throw error;
    }
  }
}
