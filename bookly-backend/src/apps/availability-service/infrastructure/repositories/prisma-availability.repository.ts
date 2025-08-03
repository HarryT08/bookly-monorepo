import { Injectable } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { AvailabilityEntity } from '../../domain/entities/availability.entity';
import { PrismaService } from '../../../../libs/common/services/prisma.service';

/**
 * Prisma Availability Repository Implementation (RF-07)
 * Implements availability data access using Prisma ORM
 */
@Injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(availability: Omit<AvailabilityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<AvailabilityEntity> {
    const created = await this.prisma.availability.create({
      data: {
        resourceId: availability.resourceId,
        dayOfWeek: availability.dayOfWeek,
        startTime: availability.startTime,
        endTime: availability.endTime,
        isActive: availability.isActive
      }
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<AvailabilityEntity | null> {
    const availability = await this.prisma.availability.findUnique({
      where: { id }
    });

    return availability ? this.toDomainEntity(availability) : null;
  }

  async findByResourceId(resourceId: string): Promise<AvailabilityEntity[]> {
    const availabilities = await this.prisma.availability.findMany({
      where: { resourceId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return availabilities.map(this.toDomainEntity);
  }

  async findByResourceAndDay(resourceId: string, dayOfWeek: number): Promise<AvailabilityEntity[]> {
    const availabilities = await this.prisma.availability.findMany({
      where: {
        resourceId,
        dayOfWeek,
        isActive: true
      },
      orderBy: { startTime: 'asc' }
    });

    return availabilities.map(this.toDomainEntity);
  }

  async update(id: string, updates: Partial<AvailabilityEntity>): Promise<AvailabilityEntity> {
    const updated = await this.prisma.availability.update({
      where: { id },
      data: {
        ...(updates.dayOfWeek !== undefined && { dayOfWeek: updates.dayOfWeek }),
        ...(updates.startTime && { startTime: updates.startTime }),
        ...(updates.endTime && { endTime: updates.endTime }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive })
      }
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.availability.delete({
      where: { id }
    });
  }

  async findAllActive(): Promise<AvailabilityEntity[]> {
    const availabilities = await this.prisma.availability.findMany({
      where: { isActive: true },
      orderBy: [
        { resourceId: 'asc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return availabilities.map(this.toDomainEntity);
  }

  async hasTimeConflict(
    resourceId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const conflicting = await this.prisma.availability.findFirst({
      where: {
        resourceId,
        dayOfWeek,
        isActive: true,
        ...(excludeId && { id: { not: excludeId } }),
        OR: [
          // New slot starts within existing slot
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          // New slot ends within existing slot
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          // New slot completely contains existing slot
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    return !!conflicting;
  }

  private toDomainEntity(prismaAvailability: any): AvailabilityEntity {
    return new AvailabilityEntity(
      prismaAvailability.id,
      prismaAvailability.resourceId,
      prismaAvailability.dayOfWeek,
      prismaAvailability.startTime,
      prismaAvailability.endTime,
      prismaAvailability.isActive,
      prismaAvailability.createdAt,
      prismaAvailability.updatedAt
    );
  }
}
