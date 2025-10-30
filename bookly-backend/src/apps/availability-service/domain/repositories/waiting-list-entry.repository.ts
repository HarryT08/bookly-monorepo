import { UserPriority, WaitingEntryStatus } from "../../utils";
import { WaitingListEntryEntity } from "../entities/waiting-list-entry.entity";

/**
 * Waiting List Entry Repository Interface - Domain Layer
 * Defines the contract for waiting list entry data access
 */
export interface WaitingListEntryRepository {
  findByResourceAndTime(resourceId: string, desiredStartTime: Date, desiredEndTime: Date): Promise<WaitingListEntryEntity[]>;
  search(
    searchTerm: string,
    filters: {
      resourceId?: string;
      status?: string;
      priority?: UserPriority;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
      hasEntries?: boolean;
    },
    page: number,
    limit: number
  ): { items: WaitingListEntryEntity[]; total: any } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any }>;
  findMany(
    filters: { resourceId: string; date: Date; status: string },
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): { items: WaitingListEntryEntity[]; total: any } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any }>;
  findByUser(
    filters: {
      userId: string;
      status: string;
      resourceId: string;
      programId: string;
      includeExpired: boolean;
    },
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): { items: WaitingListEntryEntity[]; total: any } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any }>;
  findExpired(
    filters: {
      waitingListId: string;
      resourceId: string;
      expiredBefore: Date;
      includeProcessed: boolean;
    },
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): { items: WaitingListEntryEntity[]; total: any } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any }>;
  /**
   * Create a new waiting list entry
   */
  create(data: {
    waitingListId: string;
    userId: string;
    position: number;
    priority: UserPriority;
    confirmationTimeLimit: number;
    status: WaitingEntryStatus;
  }): Promise<WaitingListEntryEntity>;

  /**
   * Find entry by ID
   */
  findById(id: string): Promise<WaitingListEntryEntity | null>;

  /**
   * Find all entries for a waiting list
   */
  findByWaitingListId(waitingListId: string): Promise<WaitingListEntryEntity[]>;

  /**
   * Find all entries for a user
   */
  findByUserId(userId: string): Promise<WaitingListEntryEntity[]>;

  /**
   * Find entry for a specific user in a specific waiting list
   */
  findByWaitingListAndUser(
    waitingListId: string,
    userId: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity | null>;

  /**
   * Find entries by status
   */
  findByStatus(status: WaitingEntryStatus): Promise<WaitingListEntryEntity[]>;

  /**
   * Find entries by status for a specific waiting list
   */
  findByWaitingListAndStatus(
    waitingListId: string,
    status: WaitingEntryStatus,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity[]>;

  /**
   * Find entries by priority
   */
  findByPriority(priority: UserPriority): Promise<WaitingListEntryEntity[]>;

  /**
   * Find waiting entries ordered by priority and position
   */
  findWaitingEntriesOrdered(
    waitingListId: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity[]>;

  /**
   * Find the next entry to be notified in a waiting list
   */
  findNextToNotify(
    waitingListId: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity | null>;

  /**
   * Find notified entries that have expired
   */
  findExpiredNotifications(): Promise<WaitingListEntryEntity[]>;

  /**
   * Find notified entries that are about to expire
   */
  findExpiringNotifications(
    minutesBeforeExpiry: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity[]>;

  /**
   * Find active entries for a user (waiting or notified)
   */
  findActiveByUserId(userId: string): Promise<WaitingListEntryEntity[]>;

  /**
   * Find entries that need reminder notifications
   */
  findNeedingReminders(
    reminderIntervalMinutes: number
  ): Promise<WaitingListEntryEntity[]>;

  /**
   * Update entry
   */
  update(
    id: string,
    updates: Partial<WaitingListEntryEntity>
  ): Promise<WaitingListEntryEntity>;

  /**
   * Update multiple entries
   */
  updateMany(
    entryIds: string[],
    updates: Partial<WaitingListEntryEntity>
  ): Promise<WaitingListEntryEntity[]>;

  /**
   * Delete entry
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all entries for a waiting list
   */
  deleteByWaitingListId(waitingListId: string): Promise<void>;

  /**
   * Delete all entries for a user
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Count entries in a waiting list by status
   */
  countByWaitingListAndStatus(
    waitingListId: string,
    status: WaitingEntryStatus
  ): Promise<number>;

  /**
   * Count total entries in a waiting list
   */
  countByWaitingListId(waitingListId: string): Promise<number>;

  /**
   * Count active entries for a user
   */
  countActiveByUserId(userId: string): Promise<number>;

  /**
   * Get the current position of a user in a waiting list
   */
  getUserPosition(
    waitingListId: string,
    userId: string
  ): Promise<number | null>;

  /**
   * Get the estimated wait time for a user
   */
  getEstimatedWaitTime(
    waitingListId: string,
    userId: string
  ): Promise<number | null>;

  /**
   * Reorder entries in a waiting list based on priority
   */
  reorderByPriority(waitingListId: string): Promise<WaitingListEntryEntity[]>;

  /**
   * Move entry to a new position
   */
  moveToPosition(
    id: string,
    newPosition: number
  ): Promise<WaitingListEntryEntity>;

  /**
   * Notify the next entry in line
   */
  notifyNext(waitingListId: string): Promise<WaitingListEntryEntity | null>;

  /**
   * Confirm an entry (user accepted the notification)
   */
  confirmEntry(id: string): Promise<WaitingListEntryEntity>;

  /**
   * Expire an entry due to timeout
   */
  expireEntry(id: string): Promise<WaitingListEntryEntity>;

  /**
   * Cancel an entry
   */
  cancelEntry(id: string): Promise<WaitingListEntryEntity>;

  /**
   * Escalate priority of an entry
   */
  escalatePriority(
    id: string,
    newPriority: UserPriority
  ): Promise<WaitingListEntryEntity>;

  /**
   * Find entries that can be promoted (when a slot becomes available)
   */
  findPromotableEntries(
    waitingListId: string,
    maxEntries: number
  ): Promise<WaitingListEntryEntity[]>;

  /**
   * Bulk expire entries that have timed out
   */
  bulkExpireTimedOutEntries(): Promise<WaitingListEntryEntity[]>;

  /**
   * Get waiting list statistics
   */
  getWaitingListStats(waitingListId: string): Promise<{
    totalEntries: number;
    waitingEntries: number;
    notifiedEntries: number;
    confirmedEntries: number;
    expiredEntries: number;
    cancelledEntries: number;
    averageWaitTime: number;
    averageConfirmationTime: number;
  }>;

  /**
   * Find all entries (needed for statistics)
   */
  findAll(): Promise<WaitingListEntryEntity[]>;

  /**
   * Find entries by resource ID
   */
  findByResourceId(resourceId: string): Promise<WaitingListEntryEntity[]>;
}
