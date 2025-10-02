/**
 * Commands for waiting list management (RF-14)
 * CQRS Command Pattern Implementation
 */

import { ICommand } from '@nestjs/cqrs';
import { WaitingListPriority } from '../../utils';

export class JoinWaitingListCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly desiredStartTime: Date,
    public readonly desiredEndTime: Date,
    public readonly requestedBy: string,
    public readonly priority: WaitingListPriority = WaitingListPriority.MEDIUM,
    public readonly confirmationTimeLimit: number = 10,
    public readonly acceptAlternatives: boolean = true,
    public readonly acceptAlternativeResources: boolean = false,
    public readonly enableNotifications: boolean = true,
    public readonly autoAccept: boolean = false,
    public readonly reason?: string,
    public readonly programId?: string,
    public readonly maxDurationDifference?: number,
    public readonly minDuration?: number,
    public readonly notificationMethods?: string[],
    public readonly notes?: string,
    public readonly tags?: string[],
    public readonly expectedAttendees?: number,
    public readonly flexibleTimeRange?: number,
    public readonly maxWaitTime?: number
  ) {}
}

export class LeaveWaitingListCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId: string,
    public readonly userId: string,
    public readonly cancelledBy: string,
    public readonly reason?: string
  ) {}
}

export class ConfirmWaitingListSlotCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId: string,
    public readonly userId: string,
    public readonly confirmedBy: string,
    public readonly notes?: string
  ) {}
}

export class ProcessWaitingListSlotsCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly availableSlots: Array<{
      startTime: Date;
      endTime: Date;
      resourceId: string;
    }>,
    public readonly processedBy: string,
    public readonly notifyUsers: boolean = true,
    public readonly autoConfirmIfSingleUser: boolean = false
  ) {}
}

export class EscalatePriorityCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId: string,
    public readonly newPriority: WaitingListPriority,
    public readonly reason: string,
    public readonly escalatedBy: string,
    public readonly notifyUser: boolean = true
  ) {}
}

export class ReorderWaitingListCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly newOrder: Array<{
      entryId: string;
      newPosition: number;
    }>,
    public readonly reason: string,
    public readonly reorderedBy: string,
    public readonly notifyUsers: boolean = true
  ) {}
}

export class ProcessExpiredEntriesCommand implements ICommand {
  constructor(
    public readonly processedBy: string,
    public readonly processAll: boolean = false,
    public readonly notifyUsers: boolean = true,
    public readonly waitingListId?: string
  ) {}
}

export class BulkNotifyWaitingListCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly entryIds: string[],
    public readonly message: string,
    public readonly notificationType: 'SLOT_AVAILABLE' | 'POSITION_CHANGED' | 'CUSTOM',
    public readonly notifiedBy: string,
    public readonly includeAlternatives: boolean = false
  ) {}
}

export class UpdateWaitingListEntryCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly entryId: string,
    public readonly userId: string,
    public readonly updateData: {
      desiredStartTime?: Date;
      desiredEndTime?: Date;
      priority?: WaitingListPriority;
      confirmationTimeLimit?: number;
      reason?: string;
      acceptAlternatives?: boolean;
      acceptAlternativeResources?: boolean;
      maxDurationDifference?: number;
      minDuration?: number;
      enableNotifications?: boolean;
      notificationMethods?: string[];
      notes?: string;
      tags?: string[];
      expectedAttendees?: number;
      flexibleTimeRange?: number;
      autoAccept?: boolean;
      maxWaitTime?: number;
    },
    public readonly updatedBy: string,
    public readonly updateReason?: string
  ) {}
}

export class CreateWaitingListCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly date: Date,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly maxEntries: number = 10,
    public readonly createdBy: string,
    public readonly autoProcess: boolean = false,
    public readonly processingInterval?: number
  ) {}
}

export class CloseWaitingListCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly reason: string,
    public readonly closedBy: string,
    public readonly notifyUsers: boolean = true,
    public readonly processRemainingEntries: boolean = false
  ) {}
}

export class ValidateWaitingListEntryCommand implements ICommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly desiredStartTime: Date,
    public readonly desiredEndTime: Date,
    public readonly priority: WaitingListPriority,
    public readonly programId?: string,
    public readonly expectedAttendees?: number
  ) {}
}

export class OptimizeWaitingListCommand implements ICommand {
  constructor(
    public readonly waitingListId: string,
    public readonly optimizationCriteria: 'PRIORITY' | 'WAIT_TIME' | 'RESOURCE_UTILIZATION' | 'BALANCED',
    public readonly optimizedBy: string,
    public readonly notifyUsers: boolean = true,
    public readonly dryRun: boolean = false
  ) {}
}

export class TransferWaitingListEntryCommand implements ICommand {
  constructor(
    public readonly fromWaitingListId: string,
    public readonly toWaitingListId: string,
    public readonly entryId: string,
    public readonly reason: string,
    public readonly transferredBy: string,
    public readonly maintainPosition: boolean = false,
    public readonly notifyUser: boolean = true
  ) {}
}

export class BulkProcessWaitingListsCommand implements ICommand {
  constructor(
    public readonly waitingListIds: string[],
    public readonly action: 'PROCESS_SLOTS' | 'PROCESS_EXPIRED' | 'OPTIMIZE' | 'CLOSE',
    public readonly parameters: any,
    public readonly processedBy: string,
    public readonly notifyUsers: boolean = true
  ) {}
}

export class SetWaitingListPreferencesCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly preferences: {
      defaultConfirmationTimeLimit?: number;
      defaultNotificationMethods?: string[];
      autoAcceptSingleSlots?: boolean;
      maxSimultaneousEntries?: number;
      preferredTimeRanges?: Array<{
        startTime: string;
        endTime: string;
        daysOfWeek: number[];
      }>;
      blackoutDates?: Date[];
      resourceTypePreferences?: Array<{
        resourceType: string;
        priority: number;
      }>;
    },
    public readonly updatedBy: string
  ) {}
}
