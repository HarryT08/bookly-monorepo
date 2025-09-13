import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { RecurringReservationRepository } from '../../domain/repositories/recurring-reservation.repository';
import { RecurringReservationEntity } from '../../domain/entities/recurring-reservation.entity';

@Injectable()
export class PrismaRecurringReservationRepository implements RecurringReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<RecurringReservationEntity | null> {
    const reservation = await this.prisma.recurringReservation.findUnique({
      where: { id },
      include: {
        resource: true,
        user: true,
        instances: true
      }
    });

    if (!reservation) return null;

    return RecurringReservationEntity.fromPersistence({
      id: reservation.id,
      userId: reservation.userId,
      resourceId: reservation.resourceId,
      title: reservation.title,
      description: reservation.description,
      frequency: reservation.frequency as any,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      daysOfWeek: reservation.daysOfWeek as number[],
      totalInstances: reservation.instances?.length || 0,
      confirmedInstances: 0,
      status: reservation.status as any,
      interval: 1,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt
    });
  }

  async findAll(filters?: any): Promise<RecurringReservationEntity[]> {
    const reservations = await this.prisma.recurringReservation.findMany({
      where: filters,
      include: {
        resource: true,
        user: true,
        instances: true
      }
    });

    return reservations.map(reservation => 
      RecurringReservationEntity.fromPersistence({
        id: reservation.id,
        userId: reservation.userId,
        resourceId: reservation.resourceId,
        title: reservation.title,
        description: reservation.description,
        frequency: reservation.frequency as any,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        daysOfWeek: reservation.daysOfWeek as number[],
        totalInstances: reservation.instances?.length || 0,
        confirmedInstances: 0,
        status: reservation.status as any,
        interval: 1,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt
      })
    );
  }

  async save(entity: RecurringReservationEntity): Promise<RecurringReservationEntity> {
    const data = {
      userId: entity.userId,
      resourceId: entity.resourceId,
      title: entity.title,
      description: entity.description,
      frequency: entity.frequency,
      startDate: entity.startDate,
      endDate: entity.endDate,
      startTime: entity.startTime,
      endTime: entity.endTime,
      daysOfWeek: entity.daysOfWeek,
      status: entity.status,
      totalInstances: entity.totalInstances,
    };

    if (entity.id) {
      const updated = await this.prisma.recurringReservation.update({
        where: { id: entity.id },
        data,
        include: {
          resource: true,
          user: true,
          instances: true
        }
      });
      return entity;
    } else {
      const created = await this.prisma.recurringReservation.create({
        data,
        include: {
          resource: true,
          user: true,
          instances: true
        }
      });
      return RecurringReservationEntity.fromPersistence({
        id: created.id,
        userId: created.userId,
        resourceId: created.resourceId,
        title: created.title,
        description: created.description,
        frequency: created.frequency as any,
        startDate: created.startDate,
        endDate: created.endDate,
        startTime: created.startTime,
        endTime: created.endTime,
        daysOfWeek: created.daysOfWeek as number[],
        totalInstances: created.instances?.length || 0,
        confirmedInstances: 0,
        status: created.status as any,
        interval: 1,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
      });
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recurringReservation.delete({
      where: { id }
    });
  }

  async findMany(
    filters: {
      userId: string;
      resourceId: string;
      programId: string;
      status: any;
      frequency: any;
      startDate: Date;
      endDate: Date;
      priority: any;
      tags: string[];
    },
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string
  ): Promise<{ items: any; total: any }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.status) where.status = filters.status;
    if (filters.frequency) where.frequency = filters.frequency;
    if (filters.startDate) where.startDate = { gte: filters.startDate };
    if (filters.endDate) where.endDate = { lte: filters.endDate };

    const [items, total] = await Promise.all([
      this.prisma.recurringReservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { resource: true, user: true, instances: true }
      }),
      this.prisma.recurringReservation.count({ where })
    ]);

    const entities = items.map(item => RecurringReservationEntity.fromPersistence({
      id: item.id,
      userId: item.userId,
      resourceId: item.resourceId,
      title: item.title,
      description: item.description,
      frequency: item.frequency as any,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      daysOfWeek: item.daysOfWeek as number[],
      totalInstances: item.instances?.length || 0,
      confirmedInstances: 0,
      status: item.status as any,
      interval: 1,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return { items: entities, total };
  }

  async create(data: {
    title: string;
    description?: string;
    resourceId: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    frequency: any;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    status: any;
  }): Promise<RecurringReservationEntity> {
    const created = await this.prisma.recurringReservation.create({
      data: {
        title: data.title,
        description: data.description,
        resourceId: data.resourceId,
        userId: data.userId,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        frequency: data.frequency,
        daysOfWeek: data.daysOfWeek,
        status: data.status,
      },
      include: {
        resource: true,
        user: true,
        instances: true
      }
    });

    return RecurringReservationEntity.fromPersistence({
      id: created.id,
      userId: created.userId,
      resourceId: created.resourceId,
      title: created.title,
      description: created.description,
      frequency: created.frequency as any,
      startDate: created.startDate,
      endDate: created.endDate,
      startTime: created.startTime,
      endTime: created.endTime,
      daysOfWeek: created.daysOfWeek as number[],
      totalInstances: created.instances?.length || 0,
      confirmedInstances: 0,
      status: created.status as any,
      interval: 1,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    });
  }

  async findByUserId(
    userId: string,
    status?: any,
    limit?: number
  ): Promise<RecurringReservationEntity[]> {
    return this.findAll({ userId });
  }

  async findByResourceId(resourceId: string): Promise<RecurringReservationEntity[]> {
    return this.findAll({ resourceId });
  }

  async findByStatus(status: any): Promise<RecurringReservationEntity[]> {
    return this.findAll({ status });
  }

  async findActiveByUserId(userId: string): Promise<RecurringReservationEntity[]> {
    return this.findAll({ userId, status: 'ACTIVE' });
  }

  async findActiveByResourceId(resourceId: string): Promise<RecurringReservationEntity[]> {
    return this.findAll({ resourceId, status: 'ACTIVE' });
  }

  async findOverlappingWithDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<RecurringReservationEntity[]> {
    const where: any = {
      resourceId,
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } }
      ]
    };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const reservations = await this.prisma.recurringReservation.findMany({
      where,
      include: { resource: true, user: true, instances: true }
    });

    return reservations.map(item => RecurringReservationEntity.fromPersistence({
      id: item.id,
      userId: item.userId,
      resourceId: item.resourceId,
      title: item.title,
      description: item.description,
      frequency: item.frequency as any,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      daysOfWeek: item.daysOfWeek as number[],
      totalInstances: item.instances?.length || 0,
      confirmedInstances: 0,
      status: item.status as any,
      interval: 1,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async findGeneratingInstancesOnDate(
    resourceId: string,
    date: Date
  ): Promise<RecurringReservationEntity[]> {
    const where: any = {
      resourceId,
      startDate: { lte: date },
      endDate: { gte: date },
      status: 'ACTIVE'
    };

    const reservations = await this.prisma.recurringReservation.findMany({
      where,
      include: { resource: true, user: true, instances: true }
    });

    return reservations.map(item => RecurringReservationEntity.fromPersistence({
      id: item.id,
      userId: item.userId,
      resourceId: item.resourceId,
      title: item.title,
      description: item.description,
      frequency: item.frequency as any,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      daysOfWeek: item.daysOfWeek as number[],
      totalInstances: item.instances?.length || 0,
      confirmedInstances: 0,
      status: item.status as any,
      interval: 1,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async findByFrequency(frequency: any): Promise<RecurringReservationEntity[]> {
    return this.findAll({ frequency });
  }

  async findEndingBefore(date: Date): Promise<RecurringReservationEntity[]> {
    const reservations = await this.prisma.recurringReservation.findMany({
      where: { endDate: { lt: date } },
      include: { resource: true, user: true, instances: true }
    });

    return reservations.map(item => RecurringReservationEntity.fromPersistence({
      id: item.id,
      userId: item.userId,
      resourceId: item.resourceId,
      title: item.title,
      description: item.description,
      frequency: item.frequency as any,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      daysOfWeek: item.daysOfWeek as number[],
      totalInstances: item.instances?.length || 0,
      confirmedInstances: 0,
      status: item.status as any,
      interval: 1,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async countActiveByUserId(userId: string): Promise<number> {
    return this.prisma.recurringReservation.count({
      where: { userId, status: 'ACTIVE' }
    });
  }

  async countActiveByResourceId(resourceId: string): Promise<number> {
    return this.prisma.recurringReservation.count({
      where: { resourceId, status: 'ACTIVE' }
    });
  }

  async findNeedingInstanceGeneration(lookAheadDays: number): Promise<RecurringReservationEntity[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + lookAheadDays);

    const reservations = await this.prisma.recurringReservation.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: { resource: true, user: true, instances: true }
    });

    return reservations.map(item => RecurringReservationEntity.fromPersistence({
      id: item.id,
      userId: item.userId,
      resourceId: item.resourceId,
      title: item.title,
      description: item.description,
      frequency: item.frequency as any,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      daysOfWeek: item.daysOfWeek as number[],
      totalInstances: item.instances?.length || 0,
      confirmedInstances: 0,
      status: item.status as any,
      interval: 1,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  }

  async update(
    id: string,
    updates: Partial<RecurringReservationEntity>
  ): Promise<RecurringReservationEntity> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime;
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.daysOfWeek !== undefined) updateData.daysOfWeek = updates.daysOfWeek;
    if (updates.status !== undefined) updateData.status = updates.status;

    const updated = await this.prisma.recurringReservation.update({
      where: { id },
      data: updateData,
      include: {
        resource: true,
        user: true,
        instances: true
      }
    });

    return RecurringReservationEntity.fromPersistence({
      id: updated.id,
      userId: updated.userId,
      resourceId: updated.resourceId,
      title: updated.title,
      description: updated.description,
      frequency: updated.frequency as any,
      startDate: updated.startDate,
      endDate: updated.endDate,
      startTime: updated.startTime,
      endTime: updated.endTime,
      daysOfWeek: updated.daysOfWeek as number[],
      totalInstances: updated.instances?.length || 0,
      confirmedInstances: 0,
      status: updated.status as any,
      interval: 1,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  }

  async updateInstanceCounts(
    id: string,
    totalInstances: number,
    confirmedInstances: number
  ): Promise<void> {
    // Note: Since the entity doesn't have these fields, this is a stub
    // In a real implementation, you might store this in a separate table
    // or add these fields to the schema
  }
}
