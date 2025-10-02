import { Injectable } from '@nestjs/common';
import { ReservationHistoryRepository, ReservationHistoryEntity } from '../../domain/repositories/reservation-history.repository';
import { ReservationAction } from '../../../../libs/dto/availability/reservation-history.dto';
import { HistoryAction, HistorySource } from '../../../../libs/dto/availability/reservation-history-detailed.dto';
import { PrismaService } from '../../../../libs/common/services/prisma.service';

/**
 * Prisma Reservation History Repository Implementation (RF-11)
 * Implements reservation history data access using Prisma ORM
 */
@Injectable()
export class PrismaReservationHistoryRepository implements ReservationHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(historyEntry: {
    reservationId: string;
    userId: string;
    action: ReservationAction;
    previousData?: any;
    newData: any;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ReservationHistoryEntity> {
    const created = await this.prisma.reservationHistory.create({
      data: {
        reservationId: historyEntry.reservationId,
        userId: historyEntry.userId,
        action: historyEntry.action,
        previousData: historyEntry.previousData,
        newData: historyEntry.newData,
        reason: historyEntry.reason,
        ipAddress: historyEntry.ipAddress,
        userAgent: historyEntry.userAgent
      }
    });

    return this.toDomainEntity(created);
  }

  async findByReservationId(reservationId: string): Promise<ReservationHistoryEntity[]> {
    const history = await this.prisma.reservationHistory.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' }
    });

    return history.map(this.toDomainEntity);
  }

  async findByUserId(userId: string): Promise<ReservationHistoryEntity[]> {
    const history = await this.prisma.reservationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return history.map(this.toDomainEntity);
  }

  async findByResourceId(resourceId: string): Promise<ReservationHistoryEntity[]> {
    const history = await this.prisma.reservationHistory.findMany({
      where: {
        reservation: {
          resourceId: resourceId
        }
      },
      include: {
        reservation: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return history.map(this.toDomainEntity);
  }

  async findByAction(action: ReservationAction): Promise<ReservationHistoryEntity[]> {
    const history = await this.prisma.reservationHistory.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' }
    });

    return history.map(this.toDomainEntity);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ReservationHistoryEntity[]> {
    const history = await this.prisma.reservationHistory.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return history.map(this.toDomainEntity);
  }

  async findWithFilters(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    action?: ReservationAction;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ReservationHistoryEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.reservationId) {
      where.reservationId = filters.reservationId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.resourceId) {
      where.reservation = {
        resourceId: filters.resourceId
      };
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [history, total] = await Promise.all([
      this.prisma.reservationHistory.findMany({
        where,
        include: filters.resourceId ? { reservation: true } : undefined,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.reservationHistory.count({ where })
    ]);

    return {
      data: history.map(this.toDomainEntity),
      total,
      page,
      limit
    };
  }

  /**
   * Count history entries by advanced filters (RF-11)
   */
  async countByFilters(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    actions?: HistoryAction[];
    sources?: HistorySource[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    const where: any = {};

    if (filters.reservationId) {
      where.reservationId = filters.reservationId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.resourceId) {
      where.reservation = {
        resourceId: filters.resourceId
      };
    }

    if (filters.actions && filters.actions.length > 0) {
      where.action = {
        in: filters.actions
      };
    }

    if (filters.sources && filters.sources.length > 0) {
      where.source = {
        in: filters.sources
      };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return await this.prisma.reservationHistory.count({ where });
  }

  /**
   * Find history entries by advanced filters with pagination (RF-11)
   */
  async findByFilters(
    filters: {
      reservationId?: string;
      userId?: string;
      resourceId?: string;
      actions?: HistoryAction[];
      sources?: HistorySource[];
      startDate?: Date;
      endDate?: Date;
    },
    options: {
      limit: number;
      offset: number;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
      includeReservationData: boolean;
      includeUserData: boolean;
    }
  ): Promise<any[]> {
    const where: any = {};

    if (filters.reservationId) {
      where.reservationId = filters.reservationId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.resourceId) {
      where.reservation = {
        resourceId: filters.resourceId
      };
    }

    if (filters.actions && filters.actions.length > 0) {
      where.action = {
        in: filters.actions
      };
    }

    if (filters.sources && filters.sources.length > 0) {
      where.source = {
        in: filters.sources
      };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const include: any = {};
    if (options.includeReservationData) {
      include.reservation = {
        include: {
          resource: true
        }
      };
    }
    if (options.includeUserData) {
      include.user = true;
    }

    const orderBy: any = {};
    orderBy[options.sortBy] = options.sortOrder;

    const history = await this.prisma.reservationHistory.findMany({
      where,
      include: Object.keys(include).length > 0 ? include : undefined,
      orderBy,
      skip: options.offset,
      take: options.limit
    });

    return history.map(entry => ({
      ...this.toDomainEntity(entry),
      reservation: entry.reservation,
      user: entry.user
    }));
  }

  async exportToCsv(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    action?: ReservationAction;
    startDate?: Date;
    endDate?: Date;
  }): Promise<string> {
    const where: any = {};

    if (filters.reservationId) {
      where.reservationId = filters.reservationId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.resourceId) {
      where.reservation = {
        resourceId: filters.resourceId
      };
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const history = await this.prisma.reservationHistory.findMany({
      where,
      include: {
        reservation: {
          include: {
            resource: true,
            user: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV header
    const headers = [
      'ID',
      'Reservation ID',
      'Reservation Title',
      'Resource Name',
      'User Email',
      'Action',
      'Previous Data',
      'New Data',
      'Reason',
      'IP Address',
      'User Agent',
      'Created At'
    ];

    // Generate CSV rows
    const rows = history.map(entry => [
      entry.id,
      entry.reservationId,
      entry.reservation?.title || '',
      entry.reservation?.resource?.name || '',
      entry.user?.email || '',
      entry.action,
      entry.previousData ? JSON.stringify(entry.previousData) : '',
      entry.newData ? JSON.stringify(entry.newData) : '',
      entry.reason || '',
      entry.ipAddress || '',
      entry.userAgent || '',
      entry.createdAt.toISOString()
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private toDomainEntity(prismaHistory: any): ReservationHistoryEntity {
    return new ReservationHistoryEntity(
      prismaHistory.id,
      prismaHistory.reservationId,
      prismaHistory.userId,
      prismaHistory.action,
      prismaHistory.source || 'USER', // Default to USER if not specified
      prismaHistory.previousData,
      prismaHistory.newData,
      prismaHistory.reason,
      prismaHistory.ipAddress,
      prismaHistory.userAgent,
      prismaHistory.createdAt
    );
  }
}
