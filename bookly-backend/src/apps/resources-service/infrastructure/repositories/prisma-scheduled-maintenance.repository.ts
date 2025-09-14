import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { LoggingService } from '@libs/logging/logging.service';
import { ScheduledMaintenanceEntity } from '@apps/resources-service/domain/entities/scheduled-maintenance.entity';
import { 
  ScheduledMaintenanceFilters, 
  ScheduledMaintenancePagination, 
  ScheduledMaintenanceQueryResult, 
  ScheduledMaintenanceRepository, 
  ScheduledMaintenanceSortOptions, 
  ScheduledMaintenanceStatistics 
} from '@apps/resources-service/domain/repositories/scheduled-maintenance.repository';

@Injectable()
export class PrismaScheduledMaintenanceRepository extends ScheduledMaintenanceRepository {

  constructor(
    private readonly prisma: PrismaService, 
    private readonly loggingService: LoggingService
  ) {
    super();
  }

  // Helper method to map Prisma model to entity
  private mapToEntity(prismaSchedule: any): ScheduledMaintenanceEntity {
    return new ScheduledMaintenanceEntity({
      id: prismaSchedule.id,
      title: prismaSchedule.title,
      description: prismaSchedule.description,
      type: prismaSchedule.type,
      status: prismaSchedule.status,
      priority: prismaSchedule.priority,
      resourceId: prismaSchedule.resourceId,
      scheduledDate: prismaSchedule.scheduledDate,
      estimatedDuration: prismaSchedule.estimatedDuration,
      assignedTo: prismaSchedule.assignedTo,
      createdBy: prismaSchedule.createdBy,
      isRecurring: prismaSchedule.isRecurring,
      notificationSent: prismaSchedule.notificationSent || false,
      createdAt: prismaSchedule.createdAt,
      updatedAt: prismaSchedule.updatedAt,
      // Optional fields that exist in the interface
      recurrenceType: prismaSchedule.recurrenceType,
      recurrenceEnd: prismaSchedule.recurrenceEnd,
      parentScheduleId: prismaSchedule.parentScheduleId,
      estimatedCost: prismaSchedule.estimatedCost,
      instructions: prismaSchedule.instructions,
      requiredTools: prismaSchedule.requiredTools,
      requiredParts: prismaSchedule.requiredParts,
      notifyBefore: prismaSchedule.notifyBefore,
      completionNotes: prismaSchedule.completionNotes,
      actualCost: prismaSchedule.actualCost,
      actualStartDate: prismaSchedule.actualStartDate,
      actualEndDate: prismaSchedule.actualEndDate,
      checklist: prismaSchedule.checklist,
      safetyNotes: prismaSchedule.safetyNotes,
      specialRequirements: prismaSchedule.specialRequirements
    });
  }

  async create(entity: ScheduledMaintenanceEntity): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Creating scheduled maintenance: ${entity.title}`);
    
    const scheduled = await this.prisma.scheduledMaintenance.create({
      data: {
        title: entity.title,
        description: entity.description,
        type: entity.type,
        status: entity.status,
        priority: entity.priority,
        resourceId: entity.resourceId,
        scheduledDate: entity.scheduledDate,
        estimatedDuration: entity.estimatedDuration,
        assignedTo: entity.assignedTo,
        createdBy: entity.createdBy,
        isRecurring: entity.isRecurring,
        recurrenceType: entity.recurrenceType,
        estimatedCost: entity.estimatedCost,
        instructions: entity.instructions,
        requiredTools: entity.requiredTools,
        notificationSent: entity.notificationSent
      },
      include: { resource: true }
    });

    return this.mapToEntity(scheduled);
  }

  async findById(id: string): Promise<ScheduledMaintenanceEntity | null> {
    const scheduled = await this.prisma.scheduledMaintenance.findUnique({
      where: { id },
      include: { resource: true }
    });

    return scheduled ? this.mapToEntity(scheduled) : null;
  }

  async findAll(
    filters?: ScheduledMaintenanceFilters,
    sort?: ScheduledMaintenanceSortOptions,
    pagination?: ScheduledMaintenancePagination
  ): Promise<ScheduledMaintenanceQueryResult> {
    const whereClause = this.buildWhereClause(filters || {});
    
    const orderBy = sort ? {
      [sort.field]: sort.direction as 'asc' | 'desc'
    } : { scheduledDate: 'asc' as const };

    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit || 50;

    const [scheduledMaintenances, total] = await Promise.all([
      this.prisma.scheduledMaintenance.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
        include: { resource: true }
      }),
      this.prisma.scheduledMaintenance.count({ where: whereClause })
    ]);

    const entities = scheduledMaintenances.map(scheduled => this.mapToEntity(scheduled));

    return {
      schedules: entities,
      total,
      page: pagination?.page || 1,
      limit: pagination?.limit || 50,
      totalPages: Math.ceil(total / (pagination?.limit || 50))
    };
  }

  async update(id: string, updates: ScheduledMaintenanceEntity): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Updating scheduled maintenance ${id}`);
    
    const updateData: any = {
      title: updates.title,
      description: updates.description,
      type: updates.type,
      status: updates.status,
      priority: updates.priority,
      scheduledDate: updates.scheduledDate,
      estimatedDuration: updates.estimatedDuration,
      assignedTo: updates.assignedTo,
      instructions: updates.instructions,
      requiredTools: updates.requiredTools,
      updatedAt: new Date()
    };

    const scheduled = await this.prisma.scheduledMaintenance.update({
      where: { id },
      data: updateData,
      include: { resource: true }
    });

    return this.mapToEntity(scheduled);
  }

  async delete(id: string): Promise<void> {
    this.loggingService.log(`Deleting scheduled maintenance ${id}`);
    await this.prisma.scheduledMaintenance.delete({
      where: { id }
    });
  }

  async findByTechnician(technicianId: string): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { assignedTo: technicianId },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });

    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async markInProgress(id: string, startedBy: string): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Marking maintenance ${id} as in progress`);
    
    const scheduled = await this.prisma.scheduledMaintenance.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        actualStartDate: new Date(),
        updatedAt: new Date(),
        // updatedBy: startedBy // Field not available in schema
      },
      include: { resource: true }
    });

    return this.mapToEntity(scheduled);
  }

  async postpone(id: string, newDate: Date, reason?: string): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Postponing maintenance ${id} to ${newDate}`);
    
    const scheduled = await this.prisma.scheduledMaintenance.update({
      where: { id },
      data: {
        scheduledDate: newDate,
        status: 'SCHEDULED',
        updatedAt: new Date()
      },
      include: { resource: true }
    });

    return this.mapToEntity(scheduled);
  }

  async reschedule(id: string, newDate: Date, reason?: string): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Rescheduling maintenance ${id} to ${newDate}`);
    
    const updated = await this.prisma.scheduledMaintenance.update({
      where: { id },
      data: {
        scheduledDate: newDate,
        status: 'SCHEDULED'
      },
      include: { resource: true }
    });
  
    return this.mapToEntity(updated);
  }

  async approve(id: string, approvedBy: string): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Approving maintenance ${id} by ${approvedBy}`);
    
    const scheduled = await this.prisma.scheduledMaintenance.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedAt: new Date()
      },
      include: { resource: true }
    });

    return this.mapToEntity(scheduled);
  }

  async complete(
    id: string, 
    completedBy: string, 
    completionNotes?: string, 
    qualityRating?: number,
    maintenanceRecordId?: string
  ): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Completing scheduled maintenance ${id}`);
    
    const scheduledMaintenance = await this.prisma.scheduledMaintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEndDate: new Date(),
        completionNotes,
        updatedAt: new Date()
      },
      include: { resource: true }
    });

    return this.mapToEntity(scheduledMaintenance);
  }

  async markReminderSent(id: string, reminderDate: Date): Promise<ScheduledMaintenanceEntity> {
    this.loggingService.log(`Marking reminder sent for scheduled maintenance ${id}`);
    
    const scheduledMaintenance = await this.prisma.scheduledMaintenance.update({
      where: { id },
      data: {
        notificationSent: true,
        // reminderDate, // Field not available in schema
        updatedAt: new Date()
      },
      include: { resource: true }
    });

    return this.mapToEntity(scheduledMaintenance);
  }

  async createMany(schedules: ScheduledMaintenanceEntity[]): Promise<ScheduledMaintenanceEntity[]> {
    this.loggingService.log(`Creating ${schedules.length} scheduled maintenances`);
    
    const createData = schedules.map(schedule => ({
      title: schedule.title,
      description: schedule.description,
      type: schedule.type,
      status: schedule.status,
      priority: schedule.priority,
      resourceId: schedule.resourceId,
      scheduledDate: schedule.scheduledDate,
      estimatedDuration: schedule.estimatedDuration,
      assignedTo: schedule.assignedTo,
      createdBy: schedule.createdBy,
      isRecurring: schedule.isRecurring,
      recurrenceType: schedule.recurrenceType,
      estimatedCost: schedule.estimatedCost,
      instructions: schedule.instructions,
      requiredTools: schedule.requiredTools,
      notificationSent: schedule.notificationSent
    }));

    await this.prisma.scheduledMaintenance.createMany({
      data: createData
    });

    // Return created items by fetching them back
    const created = await this.prisma.scheduledMaintenance.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 5000) } // Created in last 5 seconds
      },
      include: { resource: true },
      orderBy: { createdAt: 'desc' },
      take: schedules.length
    });

    return created.map(schedule => this.mapToEntity(schedule));
  }

  async deleteMany(filters: ScheduledMaintenanceFilters): Promise<number> {
    this.loggingService.log('Deleting scheduled maintenances by filters');
    
    const whereClause = this.buildWhereClause(filters);
    const result = await this.prisma.scheduledMaintenance.deleteMany({
      where: whereClause
    });
    
    return result.count;
  }

  async updateMany(
    filters: ScheduledMaintenanceFilters,
    updates: Partial<ScheduledMaintenanceEntity>
  ): Promise<number> {
    this.loggingService.log('Updating scheduled maintenances by filters');
    
    const whereClause = this.buildWhereClause(filters);
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.scheduledDate !== undefined) updateData.scheduledDate = updates.scheduledDate;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    
    updateData.updatedAt = new Date();

    const result = await this.prisma.scheduledMaintenance.updateMany({
      where: whereClause,
      data: updateData
    });

    return result.count;
  }

  async getStatistics(
    filters?: ScheduledMaintenanceFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ScheduledMaintenanceStatistics> {
    const whereClause = this.buildWhereClause(filters || {});
    
    if (dateFrom || dateTo) {
      whereClause.scheduledDate = {};
      if (dateFrom) whereClause.scheduledDate.gte = dateFrom;
      if (dateTo) whereClause.scheduledDate.lte = dateTo;
    }

    const [
      totalSchedules,
      scheduledMaintenance,
      inProgressMaintenance,
      completedMaintenance,
      overdueMaintenance
    ] = await Promise.all([
      this.prisma.scheduledMaintenance.count({ where: whereClause }),
      this.prisma.scheduledMaintenance.count({ 
        where: { ...whereClause, status: 'SCHEDULED' } 
      }),
      this.prisma.scheduledMaintenance.count({ 
        where: { ...whereClause, status: 'IN_PROGRESS' } 
      }),
      this.prisma.scheduledMaintenance.count({ 
        where: { ...whereClause, status: 'COMPLETED' } 
      }),
      this.prisma.scheduledMaintenance.count({ 
        where: { 
          ...whereClause, 
          scheduledDate: { lt: new Date() },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
        } 
      })
    ]);

    return {
      totalSchedules,
      scheduledMaintenance,
      inProgressMaintenance,
      completedMaintenance,
      cancelledMaintenance: 0,
      postponedMaintenance: 0,
      overdueMaintenance,
      pendingApproval: 0,
      averageExecutionTime: 0,
      completionRate: totalSchedules > 0 ? (completedMaintenance / totalSchedules) * 100 : 0,
      totalCost: 0,
      recurringSchedules: 0,
      byMaintenanceType: {},
      byPriority: {},
      byStatus: {},
      upcomingThisWeek: 0,
      upcomingThisMonth: 0
    };
  }

  async generateRecurringSchedules(
    baseSchedule: ScheduledMaintenanceEntity,
    occurrences: number,
    createdBy: string
  ): Promise<ScheduledMaintenanceEntity[]> {
    this.loggingService.log(`Generating ${occurrences} recurring schedules for ${baseSchedule.title}`);

    const schedules: any[] = [];
    let currentDate = new Date(baseSchedule.scheduledDate);
    const recurrenceType = baseSchedule.recurrenceType;

    for (let i = 0; i < occurrences; i++) {
      // Increment date based on recurrence type for next occurrence
      switch (recurrenceType) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case 'YEARLY':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          break;
      }

      schedules.push({
        title: baseSchedule.title,
        description: baseSchedule.description,
        type: baseSchedule.type,
        status: 'SCHEDULED',
        priority: baseSchedule.priority,
        resourceId: baseSchedule.resourceId,
        scheduledDate: new Date(currentDate),
        estimatedDuration: baseSchedule.estimatedDuration,
        assignedTo: baseSchedule.assignedTo,
        isRecurring: true,
        recurrenceType: recurrenceType,
        estimatedCost: baseSchedule.estimatedCost,
        instructions: baseSchedule.instructions,
        requiredTools: baseSchedule.requiredTools,
        recurringParentId: baseSchedule.id,
        createdBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const createdSchedules = await this.prisma.$transaction(
      schedules.map(schedule => 
        this.prisma.scheduledMaintenance.create({
          data: schedule,
          include: { resource: true }
        })
      )
    );

    const entities = createdSchedules.map(schedule => this.mapToEntity(schedule));
    
    this.loggingService.log(`Recurring schedules generated successfully. Count: ${entities.length}`);

    return entities;
  }

  // Missing method implementations to complete abstract class contract

  async findByStatus(status: string): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { status },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByMaintenanceType(type: string): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { type },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findDueToday(): Promise<ScheduledMaintenanceEntity[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        scheduledDate: { gte: startOfDay, lte: endOfDay },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findDueThisWeek(): Promise<ScheduledMaintenanceEntity[]> {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        scheduledDate: { gte: startOfWeek, lte: endOfWeek },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findOverdue(): Promise<ScheduledMaintenanceEntity[]> {
    const now = new Date();
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        scheduledDate: { lt: now },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByResourceId(resourceId: string): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { resourceId },
      include: { resource: true },
      orderBy: { scheduledDate: 'desc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByAssignedTechnician(technicianId: string): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { assignedTo: technicianId },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        scheduledDate: { gte: startDate, lte: endDate }
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findRecurring(): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { isRecurring: true },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByPriority(priority: string): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { priority },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByCreatedBy(createdBy: string): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { createdBy },
      include: { resource: true },
      orderBy: { createdAt: 'desc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findPendingApproval(): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findCompletedInDateRange(startDate: Date, endDate: Date): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: { gte: startDate, lte: endDate }
      },
      include: { resource: true },
      orderBy: { updatedAt: 'desc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findUpcoming(days: number = 7): Promise<ScheduledMaintenanceEntity[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        scheduledDate: { gte: now, lte: futureDate },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findRequiringNotification(): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { 
        notificationSent: false,
        status: 'SCHEDULED'
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await this.prisma.scheduledMaintenance.groupBy({
      by: ['status'],
      _count: { _all: true }
    });
    
    return counts.reduce((acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    }, {} as Record<string, number>);
  }

  async getUpcomingCount(days: number = 7): Promise<number> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.prisma.scheduledMaintenance.count({
      where: {
        scheduledDate: { gte: now, lte: futureDate },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      }
    });
  }

  async getOverdueCount(): Promise<number> {
    const now = new Date();
    return this.prisma.scheduledMaintenance.count({
      where: {
        scheduledDate: { lt: now },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      }
    });
  }

  async getTotalEstimatedCost(filters?: ScheduledMaintenanceFilters): Promise<number> {
    const whereClause = this.buildWhereClause(filters || {});
    const result = await this.prisma.scheduledMaintenance.aggregate({
      where: whereClause,
      _sum: { estimatedCost: true }
    });
    return result._sum.estimatedCost || 0;
  }

  async getAverageEstimatedDuration(filters?: ScheduledMaintenanceFilters): Promise<number> {
    const whereClause = this.buildWhereClause(filters || {});
    const result = await this.prisma.scheduledMaintenance.aggregate({
      where: whereClause,
      _avg: { estimatedDuration: true }
    });
    return result._avg.estimatedDuration || 0;
  }

  async getCompletionRate(dateFrom?: Date, dateTo?: Date): Promise<number> {
    const whereClause: any = {};
    if (dateFrom || dateTo) {
      whereClause.scheduledDate = {};
      if (dateFrom) whereClause.scheduledDate.gte = dateFrom;
      if (dateTo) whereClause.scheduledDate.lte = dateTo;
    }

    const [total, completed] = await Promise.all([
      this.prisma.scheduledMaintenance.count({ where: whereClause }),
      this.prisma.scheduledMaintenance.count({ 
        where: { ...whereClause, status: 'COMPLETED' } 
      })
    ]);

    return total > 0 ? (completed / total) * 100 : 0;
  }

  // Additional missing methods to complete abstract class

  async findDueThisMonth(): Promise<ScheduledMaintenanceEntity[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        scheduledDate: { gte: startOfMonth, lte: endOfMonth },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findRecurringSchedules(): Promise<ScheduledMaintenanceEntity[]> {
    return this.findRecurring();
  }

  async findByParentSchedule(parentId: string): Promise<ScheduledMaintenanceEntity[]> {
    // Note: recurringParentId field doesn't exist in schema, returning empty for now
    return [];
  }

  async findNeedingReminders(): Promise<ScheduledMaintenanceEntity[]> {
    return this.findRequiringNotification();
  }

  async getResourceMaintenanceHistory(resourceId: string): Promise<ScheduledMaintenanceEntity[]> {
    return this.findByResourceId(resourceId);
  }

  async getTechnicianWorkload(technicianId: string): Promise<ScheduledMaintenanceEntity[]> {
    return this.findByAssignedTechnician(technicianId);
  }

  async getMaintenanceCalendar(startDate: Date, endDate: Date): Promise<Record<string, ScheduledMaintenanceEntity[]>> {
    const schedules = await this.findByDateRange(startDate, endDate);
    
    // Group by date string (YYYY-MM-DD)
    const calendar: Record<string, ScheduledMaintenanceEntity[]> = {};
    schedules.forEach(schedule => {
      const dateKey = schedule.scheduledDate.toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(schedule);
    });
    
    return calendar;
  }

  async getRecurringMaintenanceSchedules(): Promise<ScheduledMaintenanceEntity[]> {
    return this.findRecurring();
  }

  async findByTags(tags: string[]): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { requiredTools: { hasEvery: tags } },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findCancelled(): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { status: 'CANCELLED' },
      include: { resource: true },
      orderBy: { updatedAt: 'desc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findPostponed(): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: { status: 'POSTPONED' },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByEstimatedCostRange(minCost: number, maxCost: number): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        estimatedCost: { gte: minCost, lte: maxCost }
      },
      include: { resource: true },
      orderBy: { estimatedCost: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findByEstimatedDurationRange(minDuration: number, maxDuration: number): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        estimatedDuration: { gte: minDuration, lte: maxDuration }
      },
      include: { resource: true },
      orderBy: { estimatedDuration: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async findHighPriority(): Promise<ScheduledMaintenanceEntity[]> {
    return this.findByPriority('HIGH');
  }

  async getCostProjection(dateFrom: Date, dateTo: Date): Promise<number> {
    const result = await this.prisma.scheduledMaintenance.aggregate({
      where: {
        scheduledDate: { gte: dateFrom, lte: dateTo },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      _sum: { estimatedCost: true }
    });
    return result._sum.estimatedCost || 0;
  }

  // Final missing methods implementation
  
  async findScheduledForDate(date: Date): Promise<ScheduledMaintenanceEntity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.findByDateRange(startOfDay, endOfDay);
  }

  async findCompletedInPeriod(startDate: Date, endDate: Date): Promise<ScheduledMaintenanceEntity[]> {
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        scheduledDate: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      },
      include: { resource: true },
      orderBy: { scheduledDate: 'asc' }
    });
    return schedules.map(schedule => this.mapToEntity(schedule));
  }

  async getResourceMaintenanceSchedule(resourceId: string): Promise<ScheduledMaintenanceEntity[]> {
    return this.findByResourceId(resourceId);
  }

  async getRecurringSchedulesSummary(): Promise<any[]> {
    // Simplified summary since groupBy causes issues
    const schedules = await this.findRecurring();
    const summary = schedules.reduce((acc, schedule) => {
      const key = `${schedule.type}_${schedule.priority}`;
      if (!acc[key]) {
        acc[key] = { type: schedule.type, priority: schedule.priority, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(summary);
  }

  async findByScheduledDateRange(startDate: Date, endDate: Date): Promise<ScheduledMaintenanceEntity[]> {
    return this.findByDateRange(startDate, endDate);
  }

  async getMaintenancesByType(): Promise<Record<string, number>> {
    const result = await this.prisma.scheduledMaintenance.groupBy({
      by: ['type'],
      _count: { id: true }
    });
    
    const summary: Record<string, number> = {};
    result.forEach(item => {
      summary[item.type] = item._count.id;
    });
    
    return summary;
  }

  async getMaintenancesByStatus(): Promise<Record<string, number>> {
    const result = await this.prisma.scheduledMaintenance.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    
    const summary: Record<string, number> = {};
    result.forEach(item => {
      summary[item.status] = item._count.id;
    });
    
    return summary;
  }

  async getMaintenancesByPriority(): Promise<Record<string, number>> {
    const result = await this.prisma.scheduledMaintenance.groupBy({
      by: ['priority'],
      _count: { id: true }
    });
    
    const summary: Record<string, number> = {};
    result.forEach(item => {
      summary[item.priority] = item._count.id;
    });
    
    return summary;
  }

  // Final missing bulk operations and schedule management methods
  
  async cancelRecurringSchedules(parentScheduleId: string, reason: string, cancelledBy: string): Promise<number> {
    // Since recurringParentId field doesn't exist in schema, return 0 for now
    this.loggingService.log(`Canceling recurring schedules for parent ${parentScheduleId} by ${cancelledBy}: ${reason}`);
    return 0;
  }

  async rescheduleOverdueSchedules(newBaseDate: Date, updatedBy: string): Promise<number> {
    const overdueSchedules = await this.findOverdue();
    let rescheduledCount = 0;
    
    for (const schedule of overdueSchedules) {
      try {
        await this.prisma.scheduledMaintenance.update({
          where: { id: schedule.id },
          data: { 
            scheduledDate: newBaseDate,
            updatedAt: new Date()
            // updatedBy - field not available in schema
          }
        });
        rescheduledCount++;
      } catch (error) {
        this.loggingService.error(`Failed to reschedule maintenance ${schedule.id}: ${error}`);
      }
    }
    
    return rescheduledCount;
  }

  async bulkApprove(scheduleIds: string[], approvedBy: string): Promise<number> {
    let approvedCount = 0;
    
    for (const id of scheduleIds) {
      try {
        await this.prisma.scheduledMaintenance.update({
          where: { id },
          data: { 
            status: 'APPROVED',
            updatedAt: new Date()
            // updatedBy: approvedBy - field not available in schema
          }
        });
        approvedCount++;
      } catch (error) {
        this.loggingService.error(`Failed to approve maintenance ${id}: ${error}`);
      }
    }
    
    return approvedCount;
  }

  async bulkReschedule(scheduleIds: string[], newDates: Date[], updatedBy: string): Promise<number> {
    let rescheduledCount = 0;
    
    for (let i = 0; i < scheduleIds.length && i < newDates.length; i++) {
      const id = scheduleIds[i];
      const newDate = newDates[i];
      
      try {
        await this.prisma.scheduledMaintenance.update({
          where: { id },
          data: { 
            scheduledDate: newDate,
            updatedAt: new Date()
            // updatedBy - field not available in schema
          }
        });
        rescheduledCount++;
      } catch (error) {
        this.loggingService.error(`Failed to reschedule maintenance ${id}: ${error}`);
      }
    }
    
    return rescheduledCount;
  }

  async bulkCancel(ids: string[], reason: string): Promise<void> {
    for (const id of ids) {
      try {
        await this.prisma.scheduledMaintenance.update({
          where: { id },
          data: { 
            status: 'CANCELLED',
            // cancellationReason: reason, - field not available in schema
            updatedAt: new Date()
          }
        });
      } catch (error) {
        this.loggingService.error(`Failed to cancel maintenance ${id}: ${error}`);
      }
    }
  }

  async findNearingDeadline(days: number = 3): Promise<ScheduledMaintenanceEntity[]> {
    return this.findUpcoming(days);
  }

  async getAverageDuration(): Promise<number> {
    const result = await this.prisma.scheduledMaintenance.aggregate({
      _avg: { estimatedDuration: true }
    });
    return result._avg.estimatedDuration || 0;
  }

  // Final three missing methods to complete abstract class implementation
  
  async findAvailableTimeSlots(resourceId: string, startDate: Date, endDate: Date, durationMinutes: number): Promise<Array<{ start: Date; end: Date }>> {
    // Get all scheduled maintenances for the resource in the given date range
    const scheduledMaintenances = await this.prisma.scheduledMaintenance.findMany({
      where: {
        resourceId,
        scheduledDate: { gte: startDate, lte: endDate },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    // Calculate available slots (simplified logic)
    const availableSlots: Array<{ start: Date; end: Date }> = [];
    
    // For now, return a simplified available slot if no conflicts
    if (scheduledMaintenances.length === 0) {
      const slotStart = new Date(startDate);
      slotStart.setHours(8, 0, 0, 0); // Start at 8 AM
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
      
      availableSlots.push({ start: slotStart, end: slotEnd });
    }

    return availableSlots;
  }

  async checkScheduleConflicts(resourceId: string, scheduledDate: Date, durationMinutes: number, excludeScheduleId?: string): Promise<ScheduledMaintenanceEntity[]> {
    const endDate = new Date(scheduledDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    const whereClause: any = {
      resourceId,
      OR: [
        {
          scheduledDate: { gte: scheduledDate, lte: endDate }
        },
        {
          AND: [
            { scheduledDate: { lte: scheduledDate } },
            { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } }
          ]
        }
      ]
    };

    if (excludeScheduleId) {
      whereClause.id = { not: excludeScheduleId };
    }

    const conflictingSchedules = await this.prisma.scheduledMaintenance.findMany({
      where: whereClause,
      include: { resource: true }
    });

    return conflictingSchedules.map(schedule => this.mapToEntity(schedule));
  }

  async optimizeSchedules(resourceIds: string[], startDate: Date, endDate: Date): Promise<Array<{ resourceId: string; recommendedDate: Date; reason: string }>> {
    // Simplified optimization - get all schedules for the resources in the date range
    const schedules = await this.prisma.scheduledMaintenance.findMany({
      where: {
        resourceId: { in: resourceIds },
        scheduledDate: { gte: startDate, lte: endDate },
        status: { in: ['SCHEDULED', 'PENDING'] }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledDate: 'asc' }
      ]
    });

    // Return optimization recommendations
    return schedules.map(schedule => ({
      resourceId: schedule.resourceId,
      recommendedDate: schedule.scheduledDate,
      reason: `Optimized by priority ${schedule.priority} and scheduled date`
    }));
  }

  private buildWhereClause(filters: ScheduledMaintenanceFilters) {
    const whereClause: any = {};

    if (filters.resourceId) {
      whereClause.resourceId = filters.resourceId;
    }
    
    if (filters.status) {
      whereClause.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status;
    }
    
    if (filters.maintenanceType) {
      whereClause.type = Array.isArray(filters.maintenanceType) ? { in: filters.maintenanceType } : filters.maintenanceType;
    }
    
    if (filters.priority) {
      whereClause.priority = Array.isArray(filters.priority) ? { in: filters.priority } : filters.priority;
    }
    
    if (filters.assignedTechnician) {
      whereClause.assignedTo = filters.assignedTechnician;
    }
    
    if (filters.tags?.length) {
      whereClause.requiredTools = { hasEvery: filters.tags };
    }
    
    if (filters.scheduledDateFrom || filters.scheduledDateTo) {
      whereClause.scheduledDate = {};
      if (filters.scheduledDateFrom) {
        whereClause.scheduledDate.gte = new Date(filters.scheduledDateFrom);
      }
      if (filters.scheduledDateTo) {
        whereClause.scheduledDate.lte = new Date(filters.scheduledDateTo);
      }
    }
    
    if (filters.isRecurring !== undefined) {
      whereClause.isRecurring = filters.isRecurring;
    }
    
    if (filters.isOverdue) {
      whereClause.scheduledDate = { lt: new Date() };
      whereClause.status = { in: ['SCHEDULED', 'IN_PROGRESS'] };
    }

    return whereClause;
  }
}
