import { Injectable } from '@nestjs/common';
import { WaitingListEntryRepository } from '../../domain/repositories/waiting-list-entry.repository';
import { WaitingListEntryEntity } from '../../domain/entities/waiting-list-entry.entity';
import { UserPriority, WaitingEntryStatus } from '../../utils';

@Injectable()
export class SimpleWaitingListEntryRepository implements WaitingListEntryRepository {
  async findById(id: string): Promise<WaitingListEntryEntity | null> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findByUserId(userId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findByResourceId(resourceId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findByStatus(status: WaitingEntryStatus): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findByResourceAndTime(resourceId: string, startTime: Date, endTime: Date): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async search(
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
  ): Promise<{ items: WaitingListEntryEntity[]; total: any }> {
    throw new Error('Method not implemented.');
  }

  async findMany(
    filters: { resourceId: string; date: Date; status: string },
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<{ items: WaitingListEntryEntity[]; total: any }> {
    throw new Error('Method not implemented.');
  }

  async findByUser(
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
  ): Promise<{ items: WaitingListEntryEntity[]; total: any }> {
    throw new Error('Method not implemented.');
  }

  async findExpired(
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
  ): Promise<{ items: WaitingListEntryEntity[]; total: any }> {
    throw new Error('Method not implemented.');
  }

  async create(data: {
    waitingListId: string;
    userId: string;
    position: number;
    priority: UserPriority;
    confirmationTimeLimit: number;
    status: WaitingEntryStatus;
  }): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented');
  }

  async findByWaitingListId(waitingListId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findByWaitingListAndUser(
    waitingListId: string,
    userId: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity | null> {
    throw new Error('Method not implemented.');
  }

  async findByWaitingListAndStatus(
    waitingListId: string,
    status: WaitingEntryStatus,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findByPriority(priority: UserPriority): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findWaitingEntriesOrdered(
    waitingListId: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findNextToNotify(
    waitingListId: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity | null> {
    throw new Error('Method not implemented.');
  }

  async findExpiredNotifications(): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findExpiringNotifications(
    minutesBeforeExpiry: number,
    sortBy?: string,
    sortOrder?: string
  ): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findActiveByUserId(userId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async findNeedingReminders(
    reminderIntervalMinutes: number
  ): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async update(
    id: string,
    updates: Partial<WaitingListEntryEntity>
  ): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented');
  }

  async updateMany(
    entryIds: string[],
    updates: Partial<WaitingListEntryEntity>
  ): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented');
  }

  async deleteByWaitingListId(waitingListId: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  async deleteByUserId(userId: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  async countByWaitingListAndStatus(
    waitingListId: string,
    status: WaitingEntryStatus
  ): Promise<number> {
    throw new Error('Method not implemented');
  }

  async countByWaitingListId(waitingListId: string): Promise<number> {
    throw new Error('Method not implemented');
  }

  async countActiveByUserId(userId: string): Promise<number> {
    throw new Error('Method not implemented');
  }

  async getUserPosition(
    waitingListId: string,
    userId: string
  ): Promise<number | null> {
    throw new Error('Method not implemented');
  }

  async getEstimatedWaitTime(
    waitingListId: string,
    userId: string
  ): Promise<number | null> {
    throw new Error('Method not implemented');
  }

  async reorderByPriority(waitingListId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented');
  }

  async moveToPosition(
    id: string,
    newPosition: number
  ): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented');
  }

  async notifyNext(waitingListId: string): Promise<WaitingListEntryEntity | null> {
    return null;
  }

  async confirmEntry(id: string): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented');
  }

  async expireEntry(id: string): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented');
  }

  async cancelEntry(id: string): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented');
  }

  async escalatePriority(
    id: string,
    newPriority: UserPriority
  ): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented');
  }

  async findPromotableEntries(
    waitingListId: string,
    maxEntries: number
  ): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async bulkExpireTimedOutEntries(): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async getWaitingListStats(waitingListId: string): Promise<{
    totalEntries: number;
    waitingEntries: number;
    notifiedEntries: number;
    confirmedEntries: number;
    expiredEntries: number;
    cancelledEntries: number;
    averageWaitTime: number;
    averageConfirmationTime: number;
  }> {
    throw new Error('Method not implemented.');
  }

  async validateEntry(entry: any): Promise<{ valid: boolean; errors: string[] }> {
    throw new Error('Method not implemented.');
  }

  async findSimilarRequests(entry: WaitingListEntryEntity): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }

  async getPositionInQueue(entryId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
