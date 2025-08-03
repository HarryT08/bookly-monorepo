import { Injectable } from '@nestjs/common';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { ReservationEntity } from '../../domain/entities/reservation.entity';
import { PrismaService } from '../../../../libs/common/services/prisma.service';

/**
 * Prisma Reservation Repository Implementation
 * Implements reservation data access using Prisma ORM
 */
@Injectable()
export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(reservation: Omit<ReservationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReservationEntity> {
    const created = await this.prisma.reservation.create({
      data: {
        title: reservation.title,
        description: reservation.description,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservation.status,
        isRecurring: reservation.isRecurring,
        recurrence: reservation.recurrence,
        userId: reservation.userId,
        resourceId: reservation.resourceId
      }
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id }
    });

    return reservation ? this.toDomainEntity(reservation) : null;
  }

  async findByUserId(userId: string): Promise<ReservationEntity[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  async findByResourceId(resourceId: string): Promise<ReservationEntity[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { resourceId },
      orderBy: { startDate: 'desc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ReservationEntity[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        OR: [
          // Reservation starts within the range
          {
            AND: [
              { startDate: { gte: startDate } },
              { startDate: { lte: endDate } }
            ]
          },
          // Reservation ends within the range
          {
            AND: [
              { endDate: { gte: startDate } },
              { endDate: { lte: endDate } }
            ]
          },
          // Reservation completely contains the range
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } }
            ]
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  async findByResourceAndDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReservationEntity[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        resourceId,
        OR: [
          // Reservation starts within the range
          {
            AND: [
              { startDate: { gte: startDate } },
              { startDate: { lte: endDate } }
            ]
          },
          // Reservation ends within the range
          {
            AND: [
              { endDate: { gte: startDate } },
              { endDate: { lte: endDate } }
            ]
          },
          // Reservation completely contains the range
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } }
            ]
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  async findConflictingReservations(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<ReservationEntity[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        resourceId,
        status: {
          in: ['PENDING', 'APPROVED']
        },
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          // New reservation starts within existing reservation
          {
            AND: [
              { startDate: { lt: startDate } },
              { endDate: { gt: startDate } }
            ]
          },
          // New reservation ends within existing reservation
          {
            AND: [
              { startDate: { lt: endDate } },
              { endDate: { gt: endDate } }
            ]
          },
          // New reservation completely contains existing reservation
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } }
            ]
          },
          // Existing reservation completely contains new reservation
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } }
            ]
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  async update(id: string, updates: Partial<ReservationEntity>): Promise<ReservationEntity> {
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.startDate && { startDate: updates.startDate }),
        ...(updates.endDate && { endDate: updates.endDate }),
        ...(updates.status && { status: updates.status }),
        ...(updates.isRecurring !== undefined && { isRecurring: updates.isRecurring }),
        ...(updates.recurrence !== undefined && { recurrence: updates.recurrence })
      }
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reservation.delete({
      where: { id }
    });
  }

  async findByStatus(status: string): Promise<ReservationEntity[]> {
    const reservations = await this.prisma.reservation.findMany({
      where: { status },
      orderBy: { startDate: 'asc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  async findUpcomingByUserId(userId: string): Promise<ReservationEntity[]> {
    const now = new Date();
    const reservations = await this.prisma.reservation.findMany({
      where: {
        userId,
        startDate: { gte: now },
        status: {
          in: ['PENDING', 'APPROVED']
        }
      },
      orderBy: { startDate: 'asc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  async findActiveReservations(): Promise<ReservationEntity[]> {
    const now = new Date();
    const reservations = await this.prisma.reservation.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        status: 'APPROVED'
      },
      orderBy: { startDate: 'asc' }
    });

    return reservations.map(this.toDomainEntity);
  }

  private toDomainEntity(prismaReservation: any): ReservationEntity {
    return new ReservationEntity(
      prismaReservation.id,
      prismaReservation.title,
      prismaReservation.description,
      prismaReservation.startDate,
      prismaReservation.endDate,
      prismaReservation.status,
      prismaReservation.isRecurring,
      prismaReservation.recurrence,
      prismaReservation.userId,
      prismaReservation.resourceId,
      prismaReservation.createdAt,
      prismaReservation.updatedAt
    );
  }
}
