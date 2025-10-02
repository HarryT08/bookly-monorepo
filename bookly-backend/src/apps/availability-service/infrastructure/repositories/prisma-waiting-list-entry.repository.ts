import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { WaitingListEntryRepository } from '../../domain/repositories/waiting-list-entry.repository';
import { WaitingListEntryEntity } from '../../domain/entities/waiting-list-entry.entity';
import { UserPriority, WaitingEntryStatus } from '../../utils';

@Injectable()
export class PrismaWaitingListEntryRepository implements WaitingListEntryRepository {
  constructor(private readonly prisma: PrismaService) {}
  findByResourceAndTime(resourceId: string, desiredStartTime: Date, desiredEndTime: Date): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  search(searchTerm: string, filters: { resourceId?: string; status?: string; priority?: UserPriority; programId?: string; startDate?: Date; endDate?: Date; hasEntries?: boolean; }, page: number, limit: number): { items: WaitingListEntryEntity[]; total: any; } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any; }> {
    throw new Error('Method not implemented.');
  }
  findMany(filters: { resourceId: string; date: Date; status: string; }, page: number, limit: number, sortBy?: string, sortOrder?: string): { items: WaitingListEntryEntity[]; total: any; } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any; }> {
    throw new Error('Method not implemented.');
  }
  findByUser(filters: { userId: string; status: string; resourceId: string; programId: string; includeExpired: boolean; }, page: number, limit: number, sortBy?: string, sortOrder?: string): { items: WaitingListEntryEntity[]; total: any; } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any; }> {
    throw new Error('Method not implemented.');
  }
  findExpired(filters: { waitingListId: string; resourceId: string; expiredBefore: Date; includeProcessed: boolean; }, page: number, limit: number, sortBy?: string, sortOrder?: string): { items: WaitingListEntryEntity[]; total: any; } | PromiseLike<{ items: WaitingListEntryEntity[]; total: any; }> {
    throw new Error('Method not implemented.');
  }
  create(data: { waitingListId: string; userId: string; position: number; priority: UserPriority; confirmationTimeLimit: number; status: WaitingEntryStatus; }): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented.');
  }
  findByWaitingListId(waitingListId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByWaitingListAndUser(waitingListId: string, userId: string, sortBy?: string, sortOrder?: string): Promise<WaitingListEntryEntity | null> {
    throw new Error('Method not implemented.');
  }
  findByWaitingListAndStatus(waitingListId: string, status: WaitingEntryStatus, sortBy?: string, sortOrder?: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  findByPriority(priority: UserPriority): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  findWaitingEntriesOrdered(waitingListId: string, sortBy?: string, sortOrder?: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  findNextToNotify(waitingListId: string, sortBy?: string, sortOrder?: string): Promise<WaitingListEntryEntity | null> {
    throw new Error('Method not implemented.');
  }
  findExpiredNotifications(): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  findExpiringNotifications(minutesBeforeExpiry: number, sortBy?: string, sortOrder?: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  findActiveByUserId(userId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  findNeedingReminders(reminderIntervalMinutes: number): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  update(id: string, updates: Partial<WaitingListEntryEntity>): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented.');
  }
  updateMany(entryIds: string[], updates: Partial<WaitingListEntryEntity>): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  deleteByWaitingListId(waitingListId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteByUserId(userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  countByWaitingListAndStatus(waitingListId: string, status: WaitingEntryStatus): Promise<number> {
    throw new Error('Method not implemented.');
  }
  countByWaitingListId(waitingListId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  countActiveByUserId(userId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getUserPosition(waitingListId: string, userId: string): Promise<number | null> {
    throw new Error('Method not implemented.');
  }
  getEstimatedWaitTime(waitingListId: string, userId: string): Promise<number | null> {
    throw new Error('Method not implemented.');
  }
  reorderByPriority(waitingListId: string): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  moveToPosition(id: string, newPosition: number): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented.');
  }
  notifyNext(waitingListId: string): Promise<WaitingListEntryEntity | null> {
    throw new Error('Method not implemented.');
  }
  confirmEntry(id: string): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented.');
  }
  expireEntry(id: string): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented.');
  }
  cancelEntry(id: string): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented.');
  }
  escalatePriority(id: string, newPriority: UserPriority): Promise<WaitingListEntryEntity> {
    throw new Error('Method not implemented.');
  }
  findPromotableEntries(waitingListId: string, maxEntries: number): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  bulkExpireTimedOutEntries(): Promise<WaitingListEntryEntity[]> {
    throw new Error('Method not implemented.');
  }
  getWaitingListStats(waitingListId: string): Promise<{ totalEntries: number; waitingEntries: number; notifiedEntries: number; confirmedEntries: number; expiredEntries: number; cancelledEntries: number; averageWaitTime: number; averageConfirmationTime: number; }> {
    throw new Error('Method not implemented.');
  }

  private toDomainEntity(entry: any): WaitingListEntryEntity {
    return WaitingListEntryEntity.fromPersistence({
      id: entry.id,
      waitingListId: entry.waitingListId,
      userId: entry.userId,
      resourceId: '', // Not available in current Prisma schema
      position: entry.position,
      priority: entry.priority as any,
      confirmationTimeLimit: entry.confirmationTimeLimit,
      status: entry.status as any,
      requestedAt: entry.requestedAt,
      notifiedAt: entry.notifiedAt,
      confirmedAt: entry.confirmedAt,
      expiredAt: entry.expiredAt
    });
  }

  async findById(id: string): Promise<WaitingListEntryEntity | null> {
    const entry = await this.prisma.waitingListEntry.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!entry) return null;

    return this.toDomainEntity(entry);
  }

  async findAll(filters?: any): Promise<WaitingListEntryEntity[]> {
    const entries = await this.prisma.waitingListEntry.findMany({
      where: filters,
      include: {
        user: true
      },
      orderBy: [
        { priority: 'desc' },
        { requestedAt: 'asc' }
      ]
    });

    return entries.map(entry => this.toDomainEntity(entry));
  }

  async save(entity: WaitingListEntryEntity): Promise<WaitingListEntryEntity> {
    const data = {
      waitingListId: entity.waitingListId,
      userId: entity.userId,
      position: entity.position,
      priority: entity.priority,
      confirmationTimeLimit: entity.confirmationTimeLimit,
      status: entity.status,
      notifiedAt: entity.notifiedAt,
      confirmedAt: entity.confirmedAt,
      expiredAt: entity.expiredAt
    };

    if (entity.id) {
      const updated = await this.prisma.waitingListEntry.update({
        where: { id: entity.id },
        data,
        include: {
          user: true
        }
      });
      return this.toDomainEntity(updated);
    } else {
      const created = await this.prisma.waitingListEntry.create({
        data,
        include: {
          user: true
        }
      });
      return this.toDomainEntity(created);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.waitingListEntry.delete({
      where: { id }
    });
  }

  async findByUserId(userId: string): Promise<WaitingListEntryEntity[]> {
    return this.findAll({ userId });
  }

  async findByResourceId(resourceId: string): Promise<WaitingListEntryEntity[]> {
    // Since WaitingListEntry doesn't have resourceId directly, filter by waitingListId
    return this.findAll({ waitingListId: resourceId });
  }

  async findByStatus(status: string): Promise<WaitingListEntryEntity[]> {
    return this.findAll({ status });
  }

  async findActiveByResourceId(resourceId: string): Promise<WaitingListEntryEntity[]> {
    return this.findAll({ 
      waitingListId: resourceId, 
      status: { in: ['WAITING', 'NOTIFIED'] }
    });
  }

  async updatePositions(waitingListId: string): Promise<void> {
    const entries = await this.prisma.waitingListEntry.findMany({
      where: { 
        waitingListId, 
        status: { in: ['WAITING', 'NOTIFIED'] }
      },
      orderBy: [
        { priority: 'desc' },
        { requestedAt: 'asc' }
      ]
    });

    for (let i = 0; i < entries.length; i++) {
      await this.prisma.waitingListEntry.update({
        where: { id: entries[i].id },
        data: { position: i + 1 }
      });
    }
  }
}
