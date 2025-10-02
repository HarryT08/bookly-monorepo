import { Injectable } from '@nestjs/common';
import { ScheduleRepository } from '../../domain/repositories/schedule.repository';
import { ScheduleEntity } from '../../domain/entities/schedule.entity';
import { PrismaService } from '../../../../libs/common/services/prisma.service';
import { ScheduleType } from '../../../../libs/dto/availability/create-schedule.dto';
import { LoggingService } from '../../../../libs/logging/logging.service';

/**
 * Prisma Schedule Repository Implementation (RF-07)
 * Implements schedule data access using Prisma ORM
 */
@Injectable()
export class PrismaScheduleRepository implements ScheduleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService
  ) {}

  async create(scheduleData: {
    resourceId: string;
    name: string;
    type: ScheduleType;
    startDate: Date;
    endDate?: Date;
    recurrenceRule?: any;
    restrictions?: any;
    isActive: boolean;
  }): Promise<ScheduleEntity> {
    const schedule = await this.prisma.schedule.create({
      data: {
        resourceId: scheduleData.resourceId,
        name: scheduleData.name,
        type: scheduleData.type,
        startDate: scheduleData.startDate,
        endDate: scheduleData.endDate,
        recurrenceRule: scheduleData.recurrenceRule as any,
        restrictions: scheduleData.restrictions as any,
        isActive: scheduleData.isActive
      }
    });

    return this.toDomainEntity(schedule);
  }

  async findById(id: string): Promise<ScheduleEntity | null> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id }
    });

    return schedule ? this.toDomainEntity(schedule) : null;
  }

  async findByResourceId(resourceId: string): Promise<ScheduleEntity[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        resourceId,
        isActive: true
      },
      orderBy: { startDate: 'asc' }
    });

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  async update(id: string, scheduleData: {
    name?: string;
    type?: ScheduleType;
    startDate?: Date;
    endDate?: Date;
    recurrenceRule?: any;
    restrictions?: any;
    isActive?: boolean;
  }): Promise<ScheduleEntity> {
    const updateData: any = {};
    
    if (scheduleData.name !== undefined) updateData.name = scheduleData.name;
    if (scheduleData.type !== undefined) updateData.type = scheduleData.type;
    if (scheduleData.startDate !== undefined) updateData.startDate = scheduleData.startDate;
    if (scheduleData.endDate !== undefined) updateData.endDate = scheduleData.endDate;
    if (scheduleData.recurrenceRule !== undefined) updateData.recurrenceRule = scheduleData.recurrenceRule;
    if (scheduleData.restrictions !== undefined) updateData.restrictions = scheduleData.restrictions;
    if (scheduleData.isActive !== undefined) updateData.isActive = scheduleData.isActive;

    const schedule = await this.prisma.schedule.update({
      where: { id },
      data: updateData
    });

    return this.toDomainEntity(schedule);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.schedule.delete({
      where: { id }
    });
  }

  async findByType(type: ScheduleType): Promise<ScheduleEntity[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        type,
        isActive: true
      },
      orderBy: { startDate: 'asc' }
    });

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  async findByResourceAndType(resourceId: string, type: string): Promise<ScheduleEntity[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        resourceId,
        type: type as ScheduleType,
        isActive: true
      },
      orderBy: { startDate: 'asc' }
    });

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ScheduleEntity[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        isActive: true,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate
            }
          },
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

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  async findActiveByResourceId(resourceId: string): Promise<ScheduleEntity[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        resourceId,
        isActive: true
      },
      orderBy: { startDate: 'asc' }
    });

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  async findActiveByResourceAndDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ScheduleEntity[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        resourceId,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } }
            ]
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: null } // Para horarios sin fecha de fin
            ]
          }
        ]
      },
      orderBy: { startDate: 'asc' }
    });

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  async findConflictingSchedules(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<ScheduleEntity[]> {
    const whereClause: any = {
      resourceId,
      isActive: true,
        ...(excludeId && { id: { not: excludeId } }),
      OR: [
        // New schedule starts within existing schedule
        {
          AND: [
            { startDate: { lte: startDate } },
            {
              OR: [
                { endDate: { gt: startDate } },
                { endDate: null }
              ]
            }
          ]
        },
        // New schedule ends within existing schedule
        {
          AND: [
            { startDate: { lt: endDate } },
            {
              OR: [
                { endDate: { gte: endDate } },
                { endDate: null }
              ]
            }
          ]
        },
        // New schedule completely contains existing schedule
        {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        }
      ]
    };

    const schedules = await this.prisma.schedule.findMany({
      where: whereClause,
      orderBy: { startDate: 'asc' }
    });

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  async findByResourceAndDate(resourceId: string, date: Date): Promise<ScheduleEntity[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        resourceId,
        isActive: true,
        startDate: { lte: date },
        OR: [
          { endDate: { gte: date } },
          { endDate: null }
        ]
      },
      orderBy: [
        { type: 'asc' },
        { startDate: 'asc' }
      ]
    });

    return schedules.map(schedule => this.toDomainEntity(schedule));
  }

  private toDomainEntity(prismaSchedule: any): ScheduleEntity {
    return new ScheduleEntity(
      prismaSchedule.id,
      prismaSchedule.resourceId,
      prismaSchedule.name,
      prismaSchedule.type,
      prismaSchedule.startDate,
      prismaSchedule.endDate,
      prismaSchedule.recurrenceRule,
      prismaSchedule.restrictions,
      prismaSchedule.isActive,
      prismaSchedule.createdAt,
      prismaSchedule.updatedAt,
      prismaSchedule.createdBy
    );
  }
}
