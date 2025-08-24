/**
 * RF-14: Waiting List Domain Service
 * Encapsulates complex business logic for managing waiting lists and priority queues
 */

import { WaitingListPriority } from "../../utils/waiting-list-priority.enum";
import { UserPriority } from "../../utils/user-priority.enum";
import {
  WaitingListEntryEntity,
} from "../entities/waiting-list-entry.entity";
import { WaitingListEntryRepository } from "../repositories/waiting-list-entry.repository";
import { WaitingEntryStatus } from "../../utils";

export abstract class WaitingListDomainService {
  constructor(
    protected readonly waitingListRepository: WaitingListEntryRepository
  ) {}

  abstract createWaitingList(
    resourceId: string,
    desiredStartTime: Date,
    desiredEndTime: Date,
    maxCapacity: number,
    requestedBy: string
  ): Promise<WaitingListEntryEntity>;

  abstract removeFromWaitingList(
    waitingListId: string,
    entryId: string,
    reason: string
  ): Promise<{
    removedEntry: WaitingListEntryEntity;
    nextInLine: WaitingListEntryEntity | null;
  }>;

  abstract confirmSlot(waitingListId: string, entryId: string, notes: string): Promise<WaitingListEntryEntity>;

  abstract processAvailableSlots(
    waitingListId: string,
    availableSlots: { startTime: Date; endTime: Date; resourceId: string }[],
    notifyUsers: boolean,
    autoConfirmIfSingleUser: boolean
  ): Promise<{
    notifiedEntries: WaitingListEntryEntity[];
    remainingEntries: WaitingListEntryEntity[];
    skippedEntries: Array<{ entry: WaitingListEntryEntity; reason: string }>;
  }>;

  abstract escalatePriority(
    waitingListId: string,
    entryId: string,
    newPriority: WaitingListPriority,
    reason: string
  ): Promise<{
    escalatedEntry: WaitingListEntryEntity;
    newPosition: number;
    affectedEntries: WaitingListEntryEntity[];
  }>;

  abstract processExpiredEntries(
    waitingListId: string,
    processAll: boolean,
    notifyUsers: boolean
  ): Promise<{
    expiredEntries: WaitingListEntryEntity[];
    newlyNotified: WaitingListEntryEntity[];
    totalProcessed: number;
  }>;

  abstract bulkNotifyEntries(
    waitingListId: string,
    entryIds: string[],
    message: string,
    notificationType: string,
    includeAlternatives: boolean
  ): Promise<{
    notifiedEntries: WaitingListEntryEntity[];
    remainingEntries: WaitingListEntryEntity[];
    skippedEntries: Array<{ entry: WaitingListEntryEntity; reason: string }>;
  }>;

  abstract optimizeWaitingList(
    waitingListId: string,
    optimizationCriteria: string,
    dryRun: boolean
  ): Promise<{ reordered: number; suggestions: any[] }>;

  abstract getAlternativeSlots(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    userId: string
  ): Promise<{ alternatives: any[] }>;

  abstract getEntryPosition(waitingListId: string, entryId: string): Promise<number>;

  abstract getEstimatedWaitTime(waitingListId: string, entryId: string): Promise<{ estimatedMinutes: number; confidence: number }>;

  abstract getEntryAlternatives(entryId: string): Promise<{ alternatives: any[] }>;

  abstract getStats(params: {
    waitingListId: string;
    resourceId: string;
    programId: string;
    startDate: Date;
    endDate: Date;
    groupBy: "day" | "week" | "month";
    includeProjections: boolean;
  }): Promise<any>;

  abstract getAnalytics(params: {
    resourceId: string;
    programId: string;
    startDate: Date;
    endDate: Date;
    metrics: string[];
    groupBy: "day" | "week" | "month" | "hour";
  }): Promise<any>;
  abstract validateEntry(params: {
    resourceId: string;
    userId: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    priority: WaitingListPriority;
    programId: string;
    expectedAttendees: number;
    excludeEntryId: string;
  }): Promise<{ isValid: boolean; violations: string[]; warnings: string[] }>;
  abstract getAlternatives(params: {
    resourceId: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    userId: string;
    acceptAlternativeResources: boolean;
    maxDurationDifference: number;
    flexibleTimeRange: number;
    limit: number;
  }): Promise<{ alternatives: any[] }>;
  abstract getWaitingListEntries(id: string): Promise<WaitingListEntryEntity[]>;
  /**
   * Adds a user to a waiting list with automatic priority and position assignment
   */
  abstract addToWaitingList(data: {
    waitingListId: string;
    userId: string;
    resourceId: string;
    userPriority: UserPriority;
    confirmationTimeLimit?: number;
  }): Promise<{
    entry: WaitingListEntryEntity;
    position: number;
    estimatedWaitTime: number | null;
    warnings: string[];
  }>;

  /**
   * Processes the waiting list when a slot becomes available
   */
  abstract processAvailableSlot(
    waitingListId: string,
    availableSlots: number
  ): Promise<{
    notifiedEntries: WaitingListEntryEntity[];
    remainingEntries: WaitingListEntryEntity[];
    skippedEntries: Array<{
      entry: WaitingListEntryEntity;
      reason: string;
    }>;
  }>;

  /**
   * Handles user confirmation of a waiting list notification
   */
  abstract confirmWaitingListEntry(entryId: string): Promise<{
    confirmedEntry: WaitingListEntryEntity;
    nextInLine: WaitingListEntryEntity | null;
  }>;

  /**
   * Handles user rejection or timeout of a waiting list notification
   */
  abstract handleEntryExpiration(
    entryId: string,
    reason: "TIMEOUT" | "USER_REJECTED"
  ): Promise<{
    expiredEntry: WaitingListEntryEntity;
    nextNotified: WaitingListEntryEntity | null;
    reorderedEntries: WaitingListEntryEntity[];
  }>;

  /**
   * Reorders the waiting list based on priority changes or escalations
   */
  abstract reorderWaitingList(waitingListId: string): Promise<{
    reorderedEntries: WaitingListEntryEntity[];
    positionChanges: Array<{
      entryId: string;
      oldPosition: number;
      newPosition: number;
    }>;
  }>;

  /**
   * Escalates a user's priority in the waiting list
   */
  abstract escalateUserPriority(
    entryId: string,
    newPriority: UserPriority,
    escalatedBy: string,
    reason: string
  ): Promise<{
    escalatedEntry: WaitingListEntryEntity;
    newPosition: number;
    affectedEntries: WaitingListEntryEntity[];
  }>;

  /**
   * Validates if a user can be added to a waiting list
   */
  abstract validateWaitingListEntry(
    userId: string,
    waitingListId: string,
    userPriority: UserPriority
  ): Promise<{
    canJoin: boolean;
    violations: string[];
    warnings: string[];
    estimatedPosition: number;
    estimatedWaitTime: number | null;
  }>;

  /**
   * Processes expired notifications and moves to next in line
   */
  abstract processExpiredNotifications(): Promise<{
    expiredEntries: WaitingListEntryEntity[];
    newlyNotified: WaitingListEntryEntity[];
    totalProcessed: number;
  }>;

  /**
   * Sends reminder notifications to users who haven't responded
   */
  abstract sendReminderNotifications(reminderIntervalMinutes: number): Promise<{
    remindersSet: WaitingListEntryEntity[];
    totalReminders: number;
  }>;

  /**
   * Gets comprehensive waiting list statistics
   */
  abstract getWaitingListStats(waitingListId: string): Promise<{
    totalEntries: number;
    entriesByStatus: Record<WaitingEntryStatus, number>;
    entriesByPriority: Record<UserPriority, number>;
    averageWaitTime: number;
    averageConfirmationTime: number;
    confirmationRate: number;
    expirationRate: number;
    currentQueueDepth: number;
    estimatedProcessingTime: number;
  }>;

  /**
   * Analyzes waiting list performance and suggests optimizations
   */
  abstract analyzeWaitingListPerformance(waitingListId: string): Promise<{
    performance: {
      throughput: number; // entries processed per hour
      efficiency: number; // successful confirmations / total notifications
      fairness: number; // priority adherence score
    };
    bottlenecks: Array<{
      type:
        | "CONFIRMATION_TIMEOUT"
        | "PRIORITY_IMBALANCE"
        | "NOTIFICATION_DELAY";
      severity: "LOW" | "MEDIUM" | "HIGH";
      description: string;
      impact: string;
    }>;
    recommendations: Array<{
      action: string;
      expectedImprovement: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
    }>;
  }>;

  /**
   * Optimizes confirmation time limits based on historical data
   */
  abstract optimizeConfirmationTimeLimits(waitingListId: string): Promise<{
    currentAverageResponseTime: number;
    recommendedTimeLimit: number;
    expectedImprovements: {
      confirmationRateIncrease: number;
      throughputIncrease: number;
      userSatisfactionImprovement: number;
    };
  }>;

  /**
   * Handles bulk operations on waiting list entries
   */
  abstract bulkProcessWaitingListEntries(
    operations: Array<{
      entryId: string;
      operation: "CANCEL" | "ESCALATE" | "EXTEND_TIMEOUT" | "NOTIFY";
      parameters?: any;
    }>
  ): Promise<{
    successful: Array<{
      entryId: string;
      operation: string;
      result: WaitingListEntryEntity;
    }>;
    failed: Array<{
      entryId: string;
      operation: string;
      error: string;
    }>;
  }>;

  /**
   * Predicts waiting times based on historical patterns
   */
  abstract predictWaitingTime(
    waitingListId: string,
    userPriority: UserPriority,
    currentPosition?: number
  ): Promise<{
    estimatedWaitTimeMinutes: number | null;
    confidenceLevel: number; // 0-100
    factors: Array<{
      factor: string;
      impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
      description: string;
    }>;
  }>;

  /**
   * Manages priority-based queue fairness
   */
  abstract ensureQueueFairness(waitingListId: string): Promise<{
    fairnessScore: number; // 0-100
    adjustmentsMade: Array<{
      entryId: string;
      adjustment: string;
      reason: string;
    }>;
    recommendations: string[];
  }>;
}

export class WaitingListDomainServiceImpl extends WaitingListDomainService {
  constructor(
    protected readonly waitingListRepository: WaitingListEntryRepository,
    protected readonly waitingListEntryRepository: WaitingListEntryRepository
  ) {
    super(waitingListRepository);
  }

  async createWaitingList(
    resourceId: string,
    desiredStartTime: Date,
    desiredEndTime: Date,
    maxCapacity: number,
    requestedBy: string
  ): Promise<WaitingListEntryEntity> {
    // TODO: implement this method
    // Mock implementation - would create actual waiting list entry
    const entry = WaitingListEntryEntity.create({
      resourceId,
      userId: requestedBy,
      waitingListId: `wl_${Date.now()}`,
      priority: UserPriority.TEACHER,
      status: WaitingEntryStatus.WAITING,
      position: 1,
      confirmationTimeLimit: 10,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    return entry;
  }
  async removeFromWaitingList(
    waitingListId: string,
    entryId: string,
    reason: string
  ): Promise<{
    removedEntry: WaitingListEntryEntity;
    nextInLine: WaitingListEntryEntity | null;
  }> {
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new Error("Waiting list entry not found");
    }
    
    const removedEntry = await this.waitingListEntryRepository.expireEntry(entryId);
    const nextInLine = await this.waitingListEntryRepository.findNextToNotify(waitingListId);
    
    return { removedEntry, nextInLine };
  }
  async confirmSlot(waitingListId: string, entryId: string, notes: string): Promise<WaitingListEntryEntity> {
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new Error("Waiting list entry not found");
    }
    return await this.waitingListEntryRepository.confirmEntry(entryId);
  }
  async processAvailableSlots(
    waitingListId: string,
    availableSlots: { startTime: Date; endTime: Date; resourceId: string }[],
    notifyUsers: boolean,
    autoConfirmIfSingleUser: boolean
  ): Promise<{
    notifiedEntries: WaitingListEntryEntity[];
    remainingEntries: WaitingListEntryEntity[];
    skippedEntries: Array<{ entry: WaitingListEntryEntity; reason: string }>;
  }> {
    const notifiedEntries: WaitingListEntryEntity[] = [];
    const skippedEntries: Array<{ entry: WaitingListEntryEntity; reason: string }> = [];
    
    const waitingEntries = await this.waitingListEntryRepository.findWaitingEntriesOrdered(waitingListId);
    
    for (let i = 0; i < Math.min(availableSlots.length, waitingEntries.length); i++) {
      const entry = waitingEntries[i];
      try {
        const notified = await this.waitingListEntryRepository.notifyNext(waitingListId);
        if (notified) notifiedEntries.push(notified);
      } catch (error) {
        skippedEntries.push({ entry, reason: 'Failed to notify user' });
      }
    }
    
    const remainingEntries = await this.waitingListEntryRepository.findByWaitingListAndStatus(
      waitingListId,
      WaitingEntryStatus.WAITING
    );
    
    return { notifiedEntries, remainingEntries, skippedEntries };
  }
  async escalatePriority(
    waitingListId: string,
    entryId: string,
    newPriority: WaitingListPriority,
    reason: string
  ): Promise<{
    escalatedEntry: WaitingListEntryEntity;
    newPosition: number;
    affectedEntries: WaitingListEntryEntity[];
  }> {
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new Error("Waiting list entry not found");
    }
    
    const escalatedEntry = await this.waitingListEntryRepository.escalatePriority(entryId, newPriority as any);
    const { reorderedEntries } = await this.reorderWaitingList(waitingListId);
    const newPosition = await this.waitingListEntryRepository.getUserPosition(waitingListId, entry.userId) || 1;
    
    return {
      escalatedEntry,
      newPosition,
      affectedEntries: reorderedEntries
    };
  }
  async processExpiredEntries(
    waitingListId: string,
    processAll: boolean,
    notifyUsers: boolean
  ): Promise<{
    expiredEntries: WaitingListEntryEntity[];
    newlyNotified: WaitingListEntryEntity[];
    totalProcessed: number;
  }> {
    const expiredEntries: WaitingListEntryEntity[] = [];
    const newlyNotified: WaitingListEntryEntity[] = [];
    
    // TODO: implement this method
    // Mock implementation - would process expired entries
    return {
      expiredEntries,
      newlyNotified,
      totalProcessed: 0
    };
  }
  async bulkNotifyEntries(
    waitingListId: string,
    entryIds: string[],
    message: string,
    notificationType: string,
    includeAlternatives: boolean
  ): Promise<{
    notifiedEntries: WaitingListEntryEntity[];
    remainingEntries: WaitingListEntryEntity[];
    skippedEntries: Array<{ entry: WaitingListEntryEntity; reason: string }>;
  }> {
    const notifiedEntries: WaitingListEntryEntity[] = [];
    const skippedEntries: Array<{ entry: WaitingListEntryEntity; reason: string }> = [];
    
    // TODO: implement this method
    // Mock implementation
    const remainingEntries = await this.waitingListEntryRepository.findByWaitingListAndStatus(
      waitingListId,
      WaitingEntryStatus.WAITING
    );
    
    return { notifiedEntries, remainingEntries, skippedEntries };
  }
  async optimizeWaitingList(
    waitingListId: string,
    optimizationCriteria: string,
    dryRun: boolean
  ): Promise<{ reordered: number; suggestions: any[] }> {
    // TODO: implement this method
    // Mock implementation
    return { reordered: 0, suggestions: [] };
  }
  async getAlternativeSlots(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    userId: string
  ): Promise<{ alternatives: any[] }> {
    // TODO: implement this method
    // Mock implementation
    return { alternatives: [] };
  }
  async getEntryPosition(waitingListId: string, entryId: string): Promise<number> {
    // TODO: implement this method
    const entry = await this.waitingListEntryRepository.findById(entryId);
    return entry?.position || 0;
  }
  async getEstimatedWaitTime(waitingListId: string, entryId: string): Promise<{ estimatedMinutes: number; confidence: number }> {
    // TODO: implement this method
    // Mock implementation
    return { estimatedMinutes: 30, confidence: 50 };
  }
  async getEntryAlternatives(entryId: string): Promise<{ alternatives: any[] }> {
    // TODO: implement this method
    // Mock implementation
    return { alternatives: [] };
  }
  async getStats(params: {
    waitingListId: string;
    resourceId: string;
    programId: string;
    startDate: Date;
    endDate: Date;
    groupBy: "day" | "week" | "month";
    includeProjections: boolean;
  }): Promise<any> {
    // TODO: implement this method
    // Mock implementation
    return { stats: {} };
  }
  async getAnalytics(params: {
    resourceId: string;
    programId: string;
    startDate: Date;
    endDate: Date;
    metrics: string[];
    groupBy: "day" | "week" | "month" | "hour";
  }): Promise<any> {
    // TODO: implement this method
    // Mock implementation
    return { analytics: {} };
  }
  async validateEntry(params: {
    resourceId: string;
    userId: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    priority: WaitingListPriority;
    programId: string;
    expectedAttendees: number;
    excludeEntryId: string;
  }): Promise<{ isValid: boolean; violations: string[]; warnings: string[] }> {
    // TODO: implement this method
    // Mock implementation
    return { isValid: true, violations: [], warnings: [] };
  }
  async getAlternatives(params: {
    resourceId: string;
    desiredStartTime: Date;
    desiredEndTime: Date;
    userId: string;
    acceptAlternativeResources: boolean;
    maxDurationDifference: number;
    flexibleTimeRange: number;
    limit: number;
  }): Promise<{ alternatives: any[] }> {
    // TODO: implement this method
    // Mock implementation
    return { alternatives: [] };
  }
  async getWaitingListEntries(id: string): Promise<WaitingListEntryEntity[]> {
    return await this.waitingListEntryRepository.findByWaitingListAndStatus(id, WaitingEntryStatus.WAITING);
  }

  async addToWaitingList(data: {
    waitingListId: string;
    userId: string;
    resourceId: string;
    userPriority: UserPriority;
    confirmationTimeLimit?: number;
  }): Promise<{
    entry: WaitingListEntryEntity;
    position: number;
    estimatedWaitTime: number | null;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    // Check if user is already in this waiting list
    const existingEntry =
      await this.waitingListEntryRepository.findByWaitingListAndUser(
        data.waitingListId,
        data.userId
      );

    if (existingEntry && existingEntry.isWaiting()) {
      throw new Error("User is already in this waiting list");
    }

    if (existingEntry && existingEntry.isNotified()) {
      throw new Error("User has a pending notification for this waiting list");
    }

    // Get current entries to determine position
    const currentEntries =
      await this.waitingListEntryRepository.findWaitingEntriesOrdered(
        data.waitingListId
      );

    // Calculate position based on priority
    let position = 1;
    for (const entry of currentEntries) {
      if (
        entry.getPriorityWeight() > this.getPriorityWeight(data.userPriority)
      ) {
        position++;
      } else if (
        entry.getPriorityWeight() === this.getPriorityWeight(data.userPriority)
      ) {
        // Same priority, position based on arrival time (FIFO within priority)
        position++;
      }
    }

    // Create the entry
    const entry = WaitingListEntryEntity.create({
      resourceId: data.resourceId,
      waitingListId: data.waitingListId,
      userId: data.userId,
      position,
      priority: data.userPriority,
      confirmationTimeLimit: data.confirmationTimeLimit || 10,
      status: WaitingEntryStatus.WAITING,
    });

    // Validate the entry
    const validation = entry.validate();
    if (!validation.isValid) {
      throw new Error(
        `Invalid waiting list entry: ${validation.errors.join(", ")}`
      );
    }

    // Save the entry
    const savedEntry = await this.waitingListEntryRepository.create(
      entry.toPersistence()
    );

    // Reorder the waiting list to ensure correct positioning
    await this.reorderWaitingList(data.waitingListId);

    // Get updated position after reordering
    const finalPosition = await this.waitingListEntryRepository.getUserPosition(
      data.waitingListId,
      data.userId
    );

    // Estimate wait time
    const estimatedWaitTime =
      await this.waitingListEntryRepository.getEstimatedWaitTime(
        data.waitingListId,
        data.userId
      );

    // Add warnings based on position and wait time
    if (finalPosition && finalPosition > 10) {
      warnings.push(
        `Position ${finalPosition} in queue - expect longer wait time`
      );
    }

    if (estimatedWaitTime && estimatedWaitTime > 60) {
      warnings.push(`Estimated wait time exceeds 1 hour`);
    }

    return {
      entry: savedEntry,
      position: finalPosition || position,
      estimatedWaitTime,
      warnings,
    };
  }

  async processAvailableSlot(
    waitingListId: string,
    availableSlots: number
  ): Promise<{
    notifiedEntries: WaitingListEntryEntity[];
    remainingEntries: WaitingListEntryEntity[];
    skippedEntries: Array<{
      entry: WaitingListEntryEntity;
      reason: string;
    }>;
  }> {
    const notifiedEntries: WaitingListEntryEntity[] = [];
    const skippedEntries: Array<{
      entry: WaitingListEntryEntity;
      reason: string;
    }> = [];

    // Get waiting entries ordered by priority
    const waitingEntries =
      await this.waitingListEntryRepository.findWaitingEntriesOrdered(
        waitingListId
      );

    let slotsToFill = availableSlots;

    for (const entry of waitingEntries) {
      if (slotsToFill <= 0) break;

      // Check if user has any active penalties that prevent reservations
      // This would require integration with penalty service
      const canMakeReservation = await this.validateUserCanMakeReservation(
        entry.userId
      );

      if (!canMakeReservation.allowed) {
        skippedEntries.push({
          entry,
          reason: canMakeReservation.reason || "User has active restrictions",
        });
        continue;
      }

      // Notify the user
      const notifiedEntry =
        await this.waitingListEntryRepository.notifyNext(waitingListId);

      if (notifiedEntry) {
        notifiedEntries.push(notifiedEntry);
        slotsToFill--;
      }
    }

    // Get remaining waiting entries
    const remainingEntries =
      await this.waitingListEntryRepository.findByWaitingListAndStatus(
        waitingListId,
        WaitingEntryStatus.WAITING
      );

    return {
      notifiedEntries,
      remainingEntries,
      skippedEntries,
    };
  }

  async confirmWaitingListEntry(entryId: string): Promise<{
    confirmedEntry: WaitingListEntryEntity;
    nextInLine: WaitingListEntryEntity | null;
  }> {
    // Get the entry
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new Error("Waiting list entry not found");
    }

    if (!entry.isNotified()) {
      throw new Error("Entry is not in notified status");
    }

    if (entry.isExpired()) {
      throw new Error("Entry has expired");
    }

    // Confirm the entry
    const confirmedEntry =
      await this.waitingListEntryRepository.confirmEntry(entryId);

    // Check if there are more slots available and notify next in line
    const nextInLine = await this.waitingListEntryRepository.findNextToNotify(
      entry.waitingListId
    );

    return {
      confirmedEntry,
      nextInLine,
    };
  }

  async handleEntryExpiration(
    entryId: string,
    reason: "TIMEOUT" | "USER_REJECTED"
  ): Promise<{
    expiredEntry: WaitingListEntryEntity;
    nextNotified: WaitingListEntryEntity | null;
    reorderedEntries: WaitingListEntryEntity[];
  }> {
    // Get the entry
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new Error("Waiting list entry not found");
    }

    // Expire the entry
    const expiredEntry =
      await this.waitingListEntryRepository.expireEntry(entryId);

    // If this was a rejection, lower the user's priority for future entries
    if (reason === "USER_REJECTED") {
      // This could be implemented as a penalty or priority adjustment
      // For now, we'll just log it for future reference
    }

    // Notify the next person in line
    const nextNotified = await this.waitingListEntryRepository.notifyNext(
      entry.waitingListId
    );

    // Reorder the waiting list
    const reorderedEntries =
      await this.waitingListEntryRepository.reorderByPriority(
        entry.waitingListId
      );

    return {
      expiredEntry,
      nextNotified,
      reorderedEntries,
    };
  }

  async reorderWaitingList(waitingListId: string): Promise<{
    reorderedEntries: WaitingListEntryEntity[];
    positionChanges: Array<{
      entryId: string;
      oldPosition: number;
      newPosition: number;
    }>;
  }> {
    // Get current waiting entries
    const currentEntries =
      await this.waitingListEntryRepository.findByWaitingListAndStatus(
        waitingListId,
        WaitingEntryStatus.WAITING
      );

    // Store old positions
    const oldPositions = new Map<string, number>();
    currentEntries.forEach((entry) => {
      oldPositions.set(entry.id, entry.position);
    });

    // Sort entries by priority and then by request time
    const sortedEntries = currentEntries.sort((a, b) => a.comparePriority(b));

    // Update positions
    const positionChanges: Array<{
      entryId: string;
      oldPosition: number;
      newPosition: number;
    }> = [];

    const reorderedEntries: WaitingListEntryEntity[] = [];

    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const newPosition = i + 1;
      const oldPosition = oldPositions.get(entry.id) || 0;

      if (newPosition !== oldPosition) {
        const updatedEntry =
          await this.waitingListEntryRepository.moveToPosition(
            entry.id,
            newPosition
          );
        reorderedEntries.push(updatedEntry);

        positionChanges.push({
          entryId: entry.id,
          oldPosition,
          newPosition,
        });
      } else {
        reorderedEntries.push(entry);
      }
    }

    return {
      reorderedEntries,
      positionChanges,
    };
  }

  async escalateUserPriority(
    entryId: string,
    newPriority: UserPriority,
    escalatedBy: string,
    reason: string
  ): Promise<{
    escalatedEntry: WaitingListEntryEntity;
    newPosition: number;
    affectedEntries: WaitingListEntryEntity[];
  }> {
    // Get the entry
    const entry = await this.waitingListEntryRepository.findById(entryId);
    if (!entry) {
      throw new Error("Waiting list entry not found");
    }

    // Escalate priority
    const escalatedEntry =
      await this.waitingListEntryRepository.escalatePriority(
        entryId,
        newPriority
      );

    // Reorder the waiting list
    const { reorderedEntries } = await this.reorderWaitingList(
      entry.waitingListId
    );

    // Get new position
    const newPosition = await this.waitingListEntryRepository.getUserPosition(
      entry.waitingListId,
      entry.userId
    );

    // Log the escalation for audit purposes
    // This would integrate with the audit/logging system

    return {
      escalatedEntry,
      newPosition: newPosition || 1,
      affectedEntries: reorderedEntries,
    };
  }

  async validateWaitingListEntry(
    userId: string,
    waitingListId: string,
    userPriority: UserPriority
  ): Promise<{
    canJoin: boolean;
    violations: string[];
    warnings: string[];
    estimatedPosition: number;
    estimatedWaitTime: number | null;
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Check if user is already in the waiting list
    const existingEntry =
      await this.waitingListEntryRepository.findByWaitingListAndUser(
        waitingListId,
        userId
      );

    if (existingEntry) {
      if (existingEntry.isWaiting()) {
        violations.push("User is already waiting in this list");
      } else if (existingEntry.isNotified()) {
        violations.push("User has a pending notification for this list");
      }
    }

    // Check user's active waiting list entries across all lists
    const activeEntries =
      await this.waitingListEntryRepository.findActiveByUserId(userId);

    if (activeEntries.length >= 5) {
      // Configurable limit
      violations.push(
        "User has reached maximum number of active waiting list entries"
      );
    } else if (activeEntries.length >= 3) {
      warnings.push("User has multiple active waiting list entries");
    }

    // Calculate estimated position and wait time
    const currentEntries =
      await this.waitingListEntryRepository.findWaitingEntriesOrdered(
        waitingListId
      );

    let estimatedPosition = 1;
    for (const entry of currentEntries) {
      if (entry.getPriorityWeight() >= this.getPriorityWeight(userPriority)) {
        estimatedPosition++;
      }
    }

    const estimatedWaitTime = await this.predictWaitingTime(
      waitingListId,
      userPriority,
      estimatedPosition
    );

    return {
      canJoin: violations.length === 0,
      violations,
      warnings,
      estimatedPosition,
      estimatedWaitTime: estimatedWaitTime.estimatedWaitTimeMinutes,
    };
  }

  // Helper methods and remaining implementations would follow...

  private getPriorityWeight(priority: UserPriority): number {
    const weights = {
      [UserPriority.ADMIN_GENERAL]: 5,
      [UserPriority.PROGRAM_DIRECTOR]: 4,
      [UserPriority.TEACHER]: 3,
      [UserPriority.STUDENT]: 2,
      [UserPriority.EXTERNAL]: 1,
    };
    return weights[priority] || 0;
  }

  private async validateUserCanMakeReservation(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // This would integrate with the penalty system to check if user has restrictions
    // For now, we'll assume all users can make reservations
    return { allowed: true };
  }

  // Real implementations for remaining methods...
  async processExpiredNotifications(): Promise<{
    expiredEntries: WaitingListEntryEntity[];
    newlyNotified: WaitingListEntryEntity[];
    totalProcessed: number;
  }> {
    const expiredEntries: WaitingListEntryEntity[] = [];
    const newlyNotified: WaitingListEntryEntity[] = [];
    
    try {
      // Find all notified entries that have expired
      const notifiedEntries = await this.waitingListEntryRepository.findByStatus(
        WaitingEntryStatus.NOTIFIED
      );
      
      const now = new Date();
      
      for (const entry of notifiedEntries) {
        if (entry.isExpired()) {
          // Expire the entry
          const expiredEntry = await this.waitingListEntryRepository.expireEntry(entry.id);
          expiredEntries.push(expiredEntry);
          
          // Notify next person in line for this waiting list
          const nextNotified = await this.waitingListEntryRepository.notifyNext(
            entry.waitingListId
          );
          
          if (nextNotified) {
            newlyNotified.push(nextNotified);
          }
        }
      }
      
      return {
        expiredEntries,
        newlyNotified,
        totalProcessed: expiredEntries.length
      };
    } catch (error) {
      throw new Error(`Failed to process expired notifications: ${error.message}`);
    }
  }

  async sendReminderNotifications(reminderIntervalMinutes: number): Promise<{
    remindersSet: WaitingListEntryEntity[];
    totalReminders: number;
  }> {
    const remindersSet: WaitingListEntryEntity[] = [];
    
    try {
      // Find notified entries that haven't been reminded recently
      const notifiedEntries = await this.waitingListEntryRepository.findByStatus(
        WaitingEntryStatus.NOTIFIED
      );
      
      const now = new Date();
      const reminderThreshold = new Date(now.getTime() - reminderIntervalMinutes * 60 * 1000);
      
      for (const entry of notifiedEntries) {
        // Check if entry needs a reminder (hasn't been reminded recently)
        const lastReminder = entry.notifiedAt;
        
        if (lastReminder && lastReminder < reminderThreshold && !entry.isExpired()) {
          // Send reminder and update entry
          // Update entry with reminder timestamp
          const updatedEntry = await this.waitingListEntryRepository.update(entry.id, {
            lastReminderAt: now
          } as Partial<WaitingListEntryEntity>);
          
          remindersSet.push(updatedEntry);
          
          // Here you would integrate with notification service
          // await this.notificationService.sendReminder(entry.userId, entry.waitingListId);
        }
      }
      
      return {
        remindersSet,
        totalReminders: remindersSet.length
      };
    } catch (error) {
      throw new Error(`Failed to send reminder notifications: ${error.message}`);
    }
  }

  async getWaitingListStats(waitingListId: string): Promise<{
    totalEntries: number;
    entriesByStatus: Record<WaitingEntryStatus, number>;
    entriesByPriority: Record<UserPriority, number>;
    averageWaitTime: number;
    averageConfirmationTime: number;
    confirmationRate: number;
    expirationRate: number;
    currentQueueDepth: number;
    estimatedProcessingTime: number;
  }> {
    try {
      // Get all entries for this waiting list
      const allEntries = await this.waitingListEntryRepository.findByWaitingListId(waitingListId);
      
      // Calculate status distribution
      const entriesByStatus = {
        [WaitingEntryStatus.WAITING]: 0,
        [WaitingEntryStatus.NOTIFIED]: 0,
        [WaitingEntryStatus.CONFIRMED]: 0,
        [WaitingEntryStatus.EXPIRED]: 0,
        [WaitingEntryStatus.CANCELLED]: 0
      };
      
      // Calculate priority distribution
      const entriesByPriority = {
        [UserPriority.ADMIN_GENERAL]: 0,
        [UserPriority.PROGRAM_DIRECTOR]: 0,
        [UserPriority.TEACHER]: 0,
        [UserPriority.STUDENT]: 0,
        [UserPriority.EXTERNAL]: 0
      };
      
      let totalWaitTime = 0;
      let totalConfirmationTime = 0;
      let confirmedCount = 0;
      let expiredCount = 0;
      let waitTimeCount = 0;
      
      for (const entry of allEntries) {
        // Count by status
        entriesByStatus[entry.status]++;
        
        // Count by priority
        entriesByPriority[entry.priority]++;
        
        // Calculate wait times
        if (entry.status === WaitingEntryStatus.CONFIRMED && entry.confirmedAt) {
          const waitTime = entry.confirmedAt.getTime() - entry.requestedAt.getTime();
          totalWaitTime += waitTime;
          waitTimeCount++;
          confirmedCount++;
          
          if (entry.notifiedAt) {
            const confirmationTime = entry.confirmedAt.getTime() - entry.notifiedAt.getTime();
            totalConfirmationTime += confirmationTime;
          }
        }
        
        if (entry.status === WaitingEntryStatus.EXPIRED) {
          expiredCount++;
        }
      }
      
      const totalEntries = allEntries.length;
      const currentQueueDepth = entriesByStatus[WaitingEntryStatus.WAITING];
      
      return {
        totalEntries,
        entriesByStatus,
        entriesByPriority,
        averageWaitTime: waitTimeCount > 0 ? totalWaitTime / waitTimeCount / (1000 * 60) : 0, // in minutes
        averageConfirmationTime: confirmedCount > 0 ? totalConfirmationTime / confirmedCount / (1000 * 60) : 0, // in minutes
        confirmationRate: totalEntries > 0 ? (confirmedCount / totalEntries) * 100 : 0,
        expirationRate: totalEntries > 0 ? (expiredCount / totalEntries) * 100 : 0,
        currentQueueDepth,
        estimatedProcessingTime: currentQueueDepth * 15 // Estimate 15 minutes per entry
      };
    } catch (error) {
      throw new Error(`Failed to get waiting list stats: ${error.message}`);
    }
  }

  async analyzeWaitingListPerformance(waitingListId: string): Promise<{
    performance: {
      throughput: number;
      efficiency: number;
      fairness: number;
    };
    bottlenecks: Array<{
      type:
        | "CONFIRMATION_TIMEOUT"
        | "PRIORITY_IMBALANCE"
        | "NOTIFICATION_DELAY";
      severity: "LOW" | "MEDIUM" | "HIGH";
      description: string;
      impact: string;
    }>;
    recommendations: Array<{
      action: string;
      expectedImprovement: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
    }>;
  }> {
    try {
      const stats = await this.getWaitingListStats(waitingListId);
      const allEntries = await this.waitingListEntryRepository.findByWaitingListId(waitingListId);
      
      // Calculate throughput (entries processed per hour)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentEntries = allEntries.filter(entry => 
        entry.requestedAt >= last24Hours
      );
      const processedEntries = recentEntries.filter(entry => 
        entry.status === WaitingEntryStatus.CONFIRMED || 
        entry.status === WaitingEntryStatus.EXPIRED
      );
      const throughput = processedEntries.length / 24; // per hour
      
      // Calculate efficiency (successful confirmations / total notifications)
      const efficiency = stats.confirmationRate;
      
      // Calculate fairness (priority adherence score)
      let fairnessScore = 100;
      const priorityWeights = {
        [UserPriority.ADMIN_GENERAL]: 5,
        [UserPriority.PROGRAM_DIRECTOR]: 4,
        [UserPriority.TEACHER]: 3,
        [UserPriority.STUDENT]: 2,
        [UserPriority.EXTERNAL]: 1
      };
      
      // Check if higher priority users are being processed first
      const waitingEntries = allEntries.filter(e => e.status === WaitingEntryStatus.WAITING)
        .sort((a, b) => a.position - b.position);
      
      for (let i = 0; i < waitingEntries.length - 1; i++) {
        const current = waitingEntries[i];
        const next = waitingEntries[i + 1];
        
        if (priorityWeights[current.priority] < priorityWeights[next.priority]) {
          fairnessScore -= 5; // Penalty for priority inversion
        }
      }
      
      // Identify bottlenecks
      const bottlenecks = [];
      const recommendations = [];
      
      // Check for confirmation timeout issues
      if (stats.expirationRate > 30) {
        bottlenecks.push({
          type: "CONFIRMATION_TIMEOUT" as const,
          severity: "HIGH" as const,
          description: `High expiration rate of ${stats.expirationRate.toFixed(1)}%`,
          impact: "Users are not responding to notifications in time"
        });
        
        recommendations.push({
          action: "Reduce confirmation time limit or send more reminders",
          expectedImprovement: "Reduce expiration rate by 15-20%",
          priority: "HIGH" as const
        });
      }
      
      // Check for priority imbalance
      if (fairnessScore < 80) {
        bottlenecks.push({
          type: "PRIORITY_IMBALANCE" as const,
          severity: "MEDIUM" as const,
          description: `Priority fairness score is ${fairnessScore.toFixed(1)}%`,
          impact: "Lower priority users may be processed before higher priority ones"
        });
        
        recommendations.push({
          action: "Reorder waiting list based on priority weights",
          expectedImprovement: "Improve fairness score to >90%",
          priority: "MEDIUM" as const
        });
      }
      
      // Check for notification delays
      if (stats.averageConfirmationTime > 60) { // More than 1 hour
        bottlenecks.push({
          type: "NOTIFICATION_DELAY" as const,
          severity: "MEDIUM" as const,
          description: `Average confirmation time is ${stats.averageConfirmationTime.toFixed(1)} minutes`,
          impact: "Users are taking too long to respond to notifications"
        });
        
        recommendations.push({
          action: "Implement push notifications or SMS alerts",
          expectedImprovement: "Reduce confirmation time by 30-40%",
          priority: "MEDIUM" as const
        });
      }
      
      return {
        performance: {
          throughput,
          efficiency,
          fairness: fairnessScore
        },
        bottlenecks,
        recommendations
      };
    } catch (error) {
      throw new Error(`Failed to analyze waiting list performance: ${error.message}`);
    }
  }

  async optimizeConfirmationTimeLimits(waitingListId: string): Promise<{
    currentAverageResponseTime: number;
    recommendedTimeLimit: number;
    expectedImprovements: {
      confirmationRateIncrease: number;
      throughputIncrease: number;
      userSatisfactionImprovement: number;
    };
  }> {
    try {
      const stats = await this.getWaitingListStats(waitingListId);
      const allEntries = await this.waitingListEntryRepository.findByWaitingListId(waitingListId);
      
      // Calculate current average response time
      const confirmedEntries = allEntries.filter(entry => 
        entry.status === WaitingEntryStatus.CONFIRMED && 
        entry.notifiedAt && 
        entry.confirmedAt
      );
      
      let totalResponseTime = 0;
      for (const entry of confirmedEntries) {
        const responseTime = entry.confirmedAt!.getTime() - entry.notifiedAt!.getTime();
        totalResponseTime += responseTime;
      }
      
      const currentAverageResponseTime = confirmedEntries.length > 0 
        ? totalResponseTime / confirmedEntries.length / (1000 * 60) // in minutes
        : 30; // default 30 minutes
      
      // Analyze response time distribution
      const responseTimes = confirmedEntries.map(entry => 
        (entry.confirmedAt!.getTime() - entry.notifiedAt!.getTime()) / (1000 * 60)
      ).sort((a, b) => a - b);
      
      // Calculate percentiles
      const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)] || 15;
      const p75 = responseTimes[Math.floor(responseTimes.length * 0.75)] || 30;
      const p90 = responseTimes[Math.floor(responseTimes.length * 0.9)] || 60;
      
      // Recommend time limit based on 75th percentile + buffer
      const recommendedTimeLimit = Math.max(10, Math.min(120, p75 * 1.5));
      
      // Calculate expected improvements
      const currentConfirmationRate = stats.confirmationRate;
      const expectedConfirmationRateIncrease = Math.max(0, 
        (recommendedTimeLimit - currentAverageResponseTime) / currentAverageResponseTime * 10
      );
      
      const expectedThroughputIncrease = expectedConfirmationRateIncrease * 0.8;
      const expectedUserSatisfactionImprovement = recommendedTimeLimit > currentAverageResponseTime ? 15 : 5;
      
      return {
        currentAverageResponseTime,
        recommendedTimeLimit,
        expectedImprovements: {
          confirmationRateIncrease: Math.min(expectedConfirmationRateIncrease, 25),
          throughputIncrease: Math.min(expectedThroughputIncrease, 20),
          userSatisfactionImprovement: expectedUserSatisfactionImprovement
        }
      };
    } catch (error) {
      throw new Error(`Failed to optimize confirmation time limits: ${error.message}`);
    }
  }

  async bulkProcessWaitingListEntries(
    operations: Array<{
      entryId: string;
      operation: "CANCEL" | "ESCALATE" | "EXTEND_TIMEOUT" | "NOTIFY";
      parameters?: any;
    }>
  ): Promise<{
    successful: Array<{
      entryId: string;
      operation: string;
      result: WaitingListEntryEntity;
    }>;
    failed: Array<{
      entryId: string;
      operation: string;
      error: string;
    }>;
  }> {
    const successful: Array<{
      entryId: string;
      operation: string;
      result: WaitingListEntryEntity;
    }> = [];
    const failed: Array<{
      entryId: string;
      operation: string;
      error: string;
    }> = [];

    try {
      // Process operations in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        
        // Process each operation in the batch
        const batchPromises = batch.map(async (operation) => {
          try {
            let result: WaitingListEntryEntity;
            
            switch (operation.operation) {
              case 'CANCEL':
                result = await this.waitingListEntryRepository.cancelEntry(operation.entryId);
                break;
                
              case 'ESCALATE':
                const newPriority = operation.parameters?.priority || UserPriority.ADMIN_GENERAL;
                result = await this.waitingListEntryRepository.escalatePriority(
                  operation.entryId,
                  newPriority
                );
                break;
                
              case 'EXTEND_TIMEOUT':
                // Extend timeout by updating confirmation time limit
                const extensionMinutes = operation.parameters?.extensionMinutes || 30;
                result = await this.waitingListEntryRepository.update(operation.entryId, {
                  confirmationTimeLimit: extensionMinutes
                } as Partial<WaitingListEntryEntity>);
                break;
                
              case 'NOTIFY':
                result = await this.waitingListEntryRepository.notifyNext(
                  operation.parameters?.waitingListId
                );
                if (!result) {
                  throw new Error('No entry found to notify');
                }
                break;
                
              default:
                throw new Error(`Unknown operation: ${operation.operation}`);
            }
            
            successful.push({
              entryId: operation.entryId,
              operation: operation.operation,
              result
            });
            return { success: true, entryId: operation.entryId, result };
          } catch (error) {
            failed.push({
              entryId: operation.entryId,
              operation: operation.operation,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            return { success: false, entryId: operation.entryId, error };
          }
        });
        
        // Wait for batch to complete before processing next batch
        await Promise.all(batchPromises);
        
        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < operations.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Log completion (logger will be added to constructor)
      // this.logger.log('Bulk processing completed', {
      //   totalOperations: operations.length,
      //   successful: successful.length,
      //   failed: failed.length
      // });

      return {
        successful,
        failed
      };
    } catch (error) {
      // this.logger.error('Error in bulk processing', error);
      throw error;
    }
  }

  async predictWaitingTime(
    waitingListId: string,
    userPriority: UserPriority,
    currentPosition?: number
  ): Promise<{
    estimatedWaitTimeMinutes: number | null;
    confidenceLevel: number;
    factors: Array<{
      factor: string;
      impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
      description: string;
    }>;
  }> {
    try {
      const allEntries = await this.waitingListEntryRepository.findByWaitingListId(waitingListId);
      const factors: Array<{
        factor: string;
        impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
        description: string;
      }> = [];

      if (allEntries.length === 0) {
        return {
          estimatedWaitTimeMinutes: 0,
          confidenceLevel: 1.0,
          factors: [{
            factor: "EMPTY_QUEUE",
            impact: "POSITIVE",
            description: "No other users in the waiting list"
          }]
        };
      }

      // Calculate historical processing times
      const confirmedEntries = allEntries.filter(entry => 
        entry.status === WaitingEntryStatus.CONFIRMED && 
        entry.notifiedAt && 
        entry.confirmedAt
      );

      let averageProcessingTime = 30; // Default 30 minutes
      if (confirmedEntries.length > 0) {
        const totalProcessingTime = confirmedEntries.reduce((sum, entry) => {
          const processingTime = entry.confirmedAt!.getTime() - entry.notifiedAt!.getTime();
          return sum + (processingTime / (1000 * 60)); // Convert to minutes
        }, 0);
        averageProcessingTime = totalProcessingTime / confirmedEntries.length;
      }

      // Get current position if not provided
      let position = currentPosition;
      if (!position) {
        const waitingEntries = allEntries
          .filter(entry => entry.status === WaitingEntryStatus.WAITING)
          .sort((a, b) => a.position - b.position);
        
        // Estimate position based on priority
        const higherPriorityCount = waitingEntries.filter(entry => {
          const entryPriorityValue = this.getPriorityValue(entry.priority);
          const userPriorityValue = this.getPriorityValue(userPriority);
          return entryPriorityValue > userPriorityValue;
        }).length;
        
        position = higherPriorityCount + 1;
      }

      // Calculate base wait time
      const baseWaitTime = position * averageProcessingTime;

      // Apply priority adjustments
      let priorityMultiplier = 1.0;
      switch (userPriority) {
        case UserPriority.ADMIN_GENERAL:
          priorityMultiplier = 0.3;
          factors.push({
            factor: "HIGH_PRIORITY_USER",
            impact: "POSITIVE",
            description: "Admin users typically get processed faster"
          });
          break;
        case UserPriority.PROGRAM_DIRECTOR:
          priorityMultiplier = 0.5;
          factors.push({
            factor: "MEDIUM_HIGH_PRIORITY",
            impact: "POSITIVE",
            description: "Program directors have elevated priority"
          });
          break;
        case UserPriority.TEACHER:
          priorityMultiplier = 0.8;
          factors.push({
            factor: "TEACHER_PRIORITY",
            impact: "POSITIVE",
            description: "Teachers have moderate priority boost"
          });
          break;
        case UserPriority.STUDENT:
          priorityMultiplier = 1.2;
          factors.push({
            factor: "STANDARD_PRIORITY",
            impact: "NEUTRAL",
            description: "Standard processing time for students"
          });
          break;
        case UserPriority.EXTERNAL:
          priorityMultiplier = 1.5;
          factors.push({
            factor: "LOW_PRIORITY_USER",
            impact: "NEGATIVE",
            description: "External users have lower priority"
          });
          break;
      }

      // Consider queue activity
      const recentActivity = allEntries.filter(entry => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return entry.requestedAt >= oneHourAgo;
      }).length;

      if (recentActivity > 5) {
        factors.push({
          factor: "HIGH_QUEUE_ACTIVITY",
          impact: "NEGATIVE",
          description: "High recent activity may increase wait times"
        });
      } else if (recentActivity < 2) {
        factors.push({
          factor: "LOW_QUEUE_ACTIVITY",
          impact: "POSITIVE",
          description: "Low recent activity may decrease wait times"
        });
      }

      // Calculate final estimate
      const estimatedWaitTimeMinutes = Math.max(0, Math.round(baseWaitTime * priorityMultiplier));

      // Calculate confidence level based on historical data
      let confidenceLevel = 0.5; // Base confidence
      if (confirmedEntries.length > 10) {
        confidenceLevel = 0.8;
        factors.push({
          factor: "SUFFICIENT_HISTORICAL_DATA",
          impact: "POSITIVE",
          description: "Good historical data improves prediction accuracy"
        });
      } else if (confirmedEntries.length > 5) {
        confidenceLevel = 0.6;
      } else {
        factors.push({
          factor: "LIMITED_HISTORICAL_DATA",
          impact: "NEGATIVE",
          description: "Limited historical data reduces prediction accuracy"
        });
      }

      return {
        estimatedWaitTimeMinutes,
        confidenceLevel,
        factors
      };
    } catch (error) {
      throw new Error(`Failed to predict waiting time: ${error.message}`);
    }
  }

  private getPriorityValue(priority: UserPriority): number {
    switch (priority) {
      case UserPriority.ADMIN_GENERAL: return 5;
      case UserPriority.PROGRAM_DIRECTOR: return 4;
      case UserPriority.TEACHER: return 3;
      case UserPriority.STUDENT: return 2;
      case UserPriority.EXTERNAL: return 1;
      default: return 1;
    }
  }

  async ensureQueueFairness(waitingListId: string): Promise<{
    fairnessScore: number;
    adjustmentsMade: Array<{
      entryId: string;
      adjustment: string;
      reason: string;
    }>;
    recommendations: string[];
  }> {
    try {
      const allEntries = await this.waitingListEntryRepository.findByWaitingListId(waitingListId);
      const adjustmentsMade: Array<{
        entryId: string;
        adjustment: string;
        reason: string;
      }> = [];
      const recommendations: string[] = [];

      if (allEntries.length === 0) {
        return {
          fairnessScore: 1.0,
          adjustmentsMade: [],
          recommendations: []
        };
      }

      // Analyze current queue order
      const waitingEntries = allEntries
        .filter(entry => entry.status === WaitingEntryStatus.WAITING)
        .sort((a, b) => a.position - b.position);

      let fairnessViolations = 0;
      let totalComparisons = 0;

      // Check for priority inversions (lower priority users ahead of higher priority users)
      for (let i = 0; i < waitingEntries.length - 1; i++) {
        for (let j = i + 1; j < waitingEntries.length; j++) {
          totalComparisons++;
          const currentEntry = waitingEntries[i];
          const nextEntry = waitingEntries[j];
          
          const currentPriorityValue = this.getPriorityValue(currentEntry.priority);
          const nextPriorityValue = this.getPriorityValue(nextEntry.priority);
          
          // If a lower priority user is ahead of a higher priority user
          if (currentPriorityValue < nextPriorityValue) {
            fairnessViolations++;
            
            // Check if this is a significant violation (not just same priority level)
            if (nextPriorityValue - currentPriorityValue > 1) {
              // Swap positions to fix priority inversion
              await this.waitingListEntryRepository.moveToPosition(nextEntry.id, currentEntry.position);
              await this.waitingListEntryRepository.moveToPosition(currentEntry.id, nextEntry.position);
              
              adjustmentsMade.push({
                entryId: nextEntry.id,
                adjustment: `Moved from position ${nextEntry.position} to position ${currentEntry.position}`,
                reason: `Priority inversion: ${nextEntry.priority} user was behind ${currentEntry.priority} user`
              });
              
              adjustmentsMade.push({
                entryId: currentEntry.id,
                adjustment: `Moved from position ${currentEntry.position} to position ${nextEntry.position}`,
                reason: `Corrected priority order`
              });
            }
          }
        }
      }

      // Calculate fairness score (1.0 = perfectly fair, 0.0 = completely unfair)
      const fairnessScore = totalComparisons > 0 
        ? Math.max(0, 1 - (fairnessViolations / totalComparisons))
        : 1.0;

      // Analyze wait times for different priority groups
      const now = new Date();
      const priorityGroups = {
        [UserPriority.ADMIN_GENERAL]: [] as typeof waitingEntries,
        [UserPriority.PROGRAM_DIRECTOR]: [] as typeof waitingEntries,
        [UserPriority.TEACHER]: [] as typeof waitingEntries,
        [UserPriority.STUDENT]: [] as typeof waitingEntries,
        [UserPriority.EXTERNAL]: [] as typeof waitingEntries
      };

      waitingEntries.forEach(entry => {
        priorityGroups[entry.priority].push(entry);
      });

      // Check for excessive wait times
      Object.entries(priorityGroups).forEach(([priority, entries]) => {
        if (entries.length === 0) return;
        
        const averageWaitTime = entries.reduce((sum, entry) => {
          const waitTime = now.getTime() - entry.requestedAt.getTime();
          return sum + (waitTime / (1000 * 60)); // Convert to minutes
        }, 0) / entries.length;

        // Define acceptable wait times by priority (in minutes)
        const acceptableWaitTimes = {
          [UserPriority.ADMIN_GENERAL]: 15,
          [UserPriority.PROGRAM_DIRECTOR]: 30,
          [UserPriority.TEACHER]: 60,
          [UserPriority.STUDENT]: 120,
          [UserPriority.EXTERNAL]: 180
        };

        const acceptableWaitTime = acceptableWaitTimes[priority as UserPriority];
        
        if (averageWaitTime > acceptableWaitTime) {
          recommendations.push(
            `${priority} users are waiting ${Math.round(averageWaitTime)} minutes on average, ` +
            `which exceeds the acceptable ${acceptableWaitTime} minutes. Consider increasing processing capacity.`
          );
        }
      });

      // Check for stale entries (users who have been waiting too long)
      const staleThreshold = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
      const staleEntries = waitingEntries.filter(entry => {
        const waitTime = now.getTime() - entry.requestedAt.getTime();
        return waitTime > staleThreshold;
      });

      if (staleEntries.length > 0) {
        recommendations.push(
          `${staleEntries.length} entries have been waiting for more than 4 hours. ` +
          `Consider escalating their priority or providing alternative solutions.`
        );
      }

      // Check for priority distribution balance
      const totalEntries = waitingEntries.length;
      const highPriorityCount = priorityGroups[UserPriority.ADMIN_GENERAL].length + 
                               priorityGroups[UserPriority.PROGRAM_DIRECTOR].length;
      const highPriorityRatio = highPriorityCount / totalEntries;

      if (highPriorityRatio > 0.3) {
        recommendations.push(
          `High priority users make up ${Math.round(highPriorityRatio * 100)}% of the queue. ` +
          `Consider reviewing priority assignment criteria.`
        );
      }

      // Check for position clustering (multiple users with same priority in wrong order)
      const positionClusters = new Map<UserPriority, number[]>();
      waitingEntries.forEach(entry => {
        if (!positionClusters.has(entry.priority)) {
          positionClusters.set(entry.priority, []);
        }
        positionClusters.get(entry.priority)!.push(entry.position);
      });

      positionClusters.forEach((positions, priority) => {
        if (positions.length > 1) {
          // Check if positions are not consecutive for same priority
          positions.sort((a, b) => a - b);
          let gaps = 0;
          for (let i = 1; i < positions.length; i++) {
            if (positions[i] - positions[i-1] > 1) {
              gaps++;
            }
          }
          
          if (gaps > positions.length * 0.3) {
            recommendations.push(
              `Users with ${priority} priority are scattered across positions. ` +
              `Consider consolidating same-priority users for better queue management.`
            );
          }
        }
      });

      return {
        fairnessScore: Math.round(fairnessScore * 100) / 100, // Round to 2 decimal places
        adjustmentsMade,
        recommendations
      };
    } catch (error) {
      throw new Error(`Failed to ensure queue fairness: ${error.message}`);
    }
  }
}
