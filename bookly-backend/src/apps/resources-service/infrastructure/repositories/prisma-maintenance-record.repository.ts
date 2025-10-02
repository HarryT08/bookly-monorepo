import { Injectable } from '@nestjs/common';
import { 
  MaintenanceRecordRepository,
  MaintenanceRecordFilters,
  MaintenanceRecordSortOptions,
  MaintenanceRecordPagination,
  MaintenanceRecordQueryResult,
  MaintenanceRecordStatistics
} from '../../domain/repositories/maintenance-record.repository';
import { MaintenanceRecordEntity } from '../../domain/entities/maintenance-record.entity';
import { LoggingService } from '@libs/logging/logging.service';
import { MaintenanceRecord } from '@prisma/client';
import { PrismaService } from '@libs/common/services/prisma.service';

@Injectable()
export class PrismaMaintenanceRecordRepository implements MaintenanceRecordRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService,
  ) {}

  async create(maintenanceRecord: MaintenanceRecordEntity): Promise<MaintenanceRecordEntity> {
    try {
      const data = this.entityToModel(maintenanceRecord);
      const created = await this.prisma.maintenanceRecord.create({
        data,
      });
      
      this.logger.log('MaintenanceRecord created successfully', {
        id: created.id,
        resourceId: created.resourceId,
        maintenanceType: created.type,
      });
      
      return this.mapToEntity(created);
    } catch (error) {
      this.logger.error('Error creating maintenance record: ' + (error as Error).message, {
        resourceId: maintenanceRecord.resourceId,
        maintenanceType: maintenanceRecord.maintenanceType,
      });
      throw error;
    }
  }

  async findById(id: string): Promise<MaintenanceRecordEntity | null> {
    try {
      const record = await this.prisma.maintenanceRecord.findUnique({
        where: { id },
      });
      
      return record ? this.mapToEntity(record) : null;
    } catch (error) {
      this.logger.error('Error finding maintenance record by ID: ' + (error as Error).message, { id });
      throw error;
    }
  }

  async findAll(
    filters?: MaintenanceRecordFilters,
    sort?: MaintenanceRecordSortOptions,
    pagination?: MaintenanceRecordPagination
  ): Promise<MaintenanceRecordQueryResult> {
    try {
      const where = this.buildWhereClause(filters);
      const orderBy = sort ? { [sort.field]: sort.direction as 'asc' | 'desc' } : { createdAt: 'desc' as const };
      const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
      const take = pagination?.limit || 50;

      const [records, total] = await Promise.all([
        this.prisma.maintenanceRecord.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        this.prisma.maintenanceRecord.count({ where }),
      ]);

      return {
        records: records.map(record => this.mapToEntity(record)),
        total,
        page: pagination?.page || 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      this.logger.error('Error finding maintenance records: ' + (error as Error).message, { filters });
      throw error;
    }
  }

  async update(id: string, maintenanceRecord: MaintenanceRecordEntity): Promise<MaintenanceRecordEntity> {
    try {
      const data = this.entityToModel(maintenanceRecord);
      const updated = await this.prisma.maintenanceRecord.update({
        where: { id },
        data,
      });
      
      this.logger.log('MaintenanceRecord updated successfully', {
        id: updated.id,
        status: updated.status,
      });
      
      return this.mapToEntity(updated);
    } catch (error) {
      this.logger.error('Error updating maintenance record: ' + (error as Error).message, { id });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.maintenanceRecord.delete({
        where: { id },
      });
      
      this.logger.log('MaintenanceRecord deleted successfully', { id });
    } catch (error) {
      this.logger.error('Error deleting maintenance record: ' + (error as Error).message, { id });
      throw error;
    }
  }

  async findByResourceId(resourceId: string): Promise<MaintenanceRecordEntity[]> {
    try {
      const records = await this.prisma.maintenanceRecord.findMany({
        where: { resourceId },
        orderBy: { startDate: 'desc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records by resource: ' + (error as Error).message, { resourceId });
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<MaintenanceRecordEntity[]> {
    try {
      const records = await this.prisma.maintenanceRecord.findMany({
        where: { 
          OR: [
            { reportedBy: userId },
            { assignedTo: userId }
          ]
        },
        orderBy: { startDate: 'desc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records by user: ' + (error as Error).message, { userId });
      throw error;
    }
  }

  async findByStatus(status: string): Promise<MaintenanceRecordEntity[]> {
    try {
      const records = await this.prisma.maintenanceRecord.findMany({
        where: { status },
        orderBy: { startDate: 'asc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records by status: ' + (error as Error).message, { status });
      throw error;
    }
  }

  async findOverdue(): Promise<MaintenanceRecordEntity[]> {
    try {
      const now = new Date();
      const records = await this.prisma.maintenanceRecord.findMany({
        where: {
          startDate: { lt: now },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
        orderBy: { startDate: 'asc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding overdue maintenance records: ' + (error as Error).message);
      throw error;
    }
  }

  async findScheduledForDate(date: Date): Promise<MaintenanceRecordEntity[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const records = await this.prisma.maintenanceRecord.findMany({
        where: {
          startDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { startDate: 'asc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records for date: ' + (error as Error).message, { date });
      throw error;
    }
  }

  async findByMaintenanceType(type: string): Promise<MaintenanceRecordEntity[]> {
    try {
      const records = await this.prisma.maintenanceRecord.findMany({
        where: { type: type },
        orderBy: { startDate: 'desc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records by type: ' + (error as Error).message, { type });
      throw error;
    }
  }

  async findByAssignedTechnician(technicianId: string): Promise<MaintenanceRecordEntity[]> {
    try {
      const records = await this.prisma.maintenanceRecord.findMany({
        where: { assignedTo: technicianId },
        orderBy: { startDate: 'asc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records by technician: ' + (error as Error).message, { technicianId });
      throw error;
    }
  }

  async findRecurringRecords(): Promise<MaintenanceRecordEntity[]> {
    try {
      // Note: isRecurring and nextScheduledDate fields don't exist in MaintenanceRecord schema
      // This would need to be implemented via ScheduledMaintenance relations
      const records: any[] = [];
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding recurring maintenance records: ' + (error as Error).message);
      throw error;
    }
  }

  async findByParentRecord(parentRecordId: string): Promise<MaintenanceRecordEntity[]> {
    try {
      // Note: parentRecordId field doesn't exist in schema - using empty result for now
      const records: any[] = [];
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records by parent: ' + error.message);
      throw error;
    }
  }

  async findRequiringFollowUp(): Promise<MaintenanceRecordEntity[]> {
    try {
      // Note: followUpRequired and followUpDate fields don't exist in schema - using empty result for now
      const records: any[] = [];
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding maintenance records requiring follow-up: ' + error.message);
      throw error;
    }
  }

  async getStatistics(
    filters?: MaintenanceRecordFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<MaintenanceRecordStatistics> {
    try {
      const where = this.buildWhereClause(filters);
      
      if (dateFrom || dateTo) {
        where.startDate = {};
        if (dateFrom) where.startDate.gte = dateFrom;
        if (dateTo) where.startDate.lte = dateTo;
      }

      const [
        total,
        pending,
        inProgress,
        completed,
        overdue,
        byType,
        byPriority,
        byStatus,
        completedWithDuration,
        qualityRatings,
        costsSum
      ] = await Promise.all([
        this.prisma.maintenanceRecord.count({ where }),
        this.prisma.maintenanceRecord.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.maintenanceRecord.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        this.prisma.maintenanceRecord.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.maintenanceRecord.count({
          where: {
            ...where,
            startDate: { lt: new Date() },
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        }),
        // Group by operations temporarily disabled due to Prisma type issues
        Promise.resolve([]),
        Promise.resolve([]),
        this.prisma.maintenanceRecord.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        this.prisma.maintenanceRecord.aggregate({
          where: { ...where, status: 'COMPLETED', duration: { not: null } },
          _avg: { duration: true },
        }),
        this.prisma.maintenanceRecord.aggregate({
          where: { ...where, cost: { not: null } },
          _avg: { cost: true },
        }),
        this.prisma.maintenanceRecord.aggregate({
          where: { ...where, cost: { not: null } },
          _sum: { cost: true },
        }),
      ]);

      return {
        totalRecords: total,
        pendingRecords: pending,
        inProgressRecords: inProgress,
        completedRecords: completed,
        overdueRecords: overdue,
        averageCompletionTime: completedWithDuration._avg.duration || 0,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        qualityRatingAverage: qualityRatings._avg.cost || undefined,
        costTotal: costsSum._sum.cost || undefined,
        byMaintenanceType: byType.reduce((acc, item) => ({
          ...acc,
          [item.type]: item._count,
        }), {}),
        byPriority: byPriority.reduce((acc, item) => ({
          ...acc,
          [item.priority]: item._count,
        }), {}),
        byStatus: byStatus.reduce((acc, item) => ({
          ...acc,
          [item.status]: item._count,
        }), {}),
      };
    } catch (error) {
      this.logger.error('Error getting maintenance statistics: ' + error.message);
      throw error;
    }
  }

  async getResourceMaintenanceHistory(resourceId: string): Promise<MaintenanceRecordEntity[]> {
    return this.findByResourceId(resourceId);
  }

  async getTechnicianWorkload(technicianId: string): Promise<MaintenanceRecordEntity[]> {
    return this.findByAssignedTechnician(technicianId);
  }

  async getUpcomingMaintenance(days: number = 7): Promise<MaintenanceRecordEntity[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const records = await this.prisma.maintenanceRecord.findMany({
        where: {
          startDate: {
            gte: now,
            lte: futureDate,
          },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        orderBy: { startDate: 'asc' },
      });
      
      return records.map(record => this.mapToEntity(record));
    } catch (error) {
      this.logger.error('Error finding upcoming maintenance: ' + error.message);
      throw error;
    }
  }

  async createMany(maintenanceRecords: MaintenanceRecordEntity[]): Promise<MaintenanceRecordEntity[]> {
    try {
      const data = maintenanceRecords.map(record => this.entityToModel(record));
      const results = await this.prisma.maintenanceRecord.createMany({
        data,
        // skipDuplicates: true, // Not supported with current schema
      });
      
      this.logger.log('Bulk maintenance records created', { count: results.count });
      return maintenanceRecords;
    } catch (error) {
      this.logger.error('Error creating bulk maintenance records: ' + (error as Error).message);
      throw error;
    }
  }

  async updateMany(
    filters: MaintenanceRecordFilters,
    updates: Partial<MaintenanceRecordEntity>
  ): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      const data = this.entityToModel(updates as any);
      
      const result = await this.prisma.maintenanceRecord.updateMany({
        where,
        data,
      });
      
      this.logger.log('Bulk maintenance records updated', { count: result.count });
      return result.count;
    } catch (error) {
      this.logger.error('Error updating bulk maintenance records: ' + error.message);
      throw error;
    }
  }

  async deleteMany(filters: MaintenanceRecordFilters): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      const result = await this.prisma.maintenanceRecord.deleteMany({ where });
      
      this.logger.log('Bulk maintenance records deleted', { count: result.count });
      return result.count;
    } catch (error) {
      this.logger.error('Error deleting bulk maintenance records: ' + error.message);
      throw error;
    }
  }

  async scheduleRecurringMaintenance(
    baseRecord: MaintenanceRecordEntity,
    occurrences: number
  ): Promise<MaintenanceRecordEntity[]> {
    try {
      const recurringRecords: MaintenanceRecordEntity[] = [];
      let currentDate = new Date(baseRecord.startDate);

      for (let i = 0; i < occurrences; i++) {
        const newRecord = MaintenanceRecordEntity.create(
          baseRecord.resourceId,
          baseRecord.userId,
          baseRecord.maintenanceType,
          baseRecord.title,
          baseRecord.description,
          baseRecord.priority,
          currentDate,
          baseRecord.estimatedDuration,
          baseRecord.createdBy
        );

        recurringRecords.push(newRecord);
        currentDate = this.calculateNextDate(currentDate, baseRecord.recurringPattern!);
      }

      return this.createMany(recurringRecords);
    } catch (error) {
      this.logger.error('Error scheduling recurring maintenance: ' + error.message);
      throw error;
    }
  }

  async cancelRecurringMaintenance(parentRecordId: string): Promise<number> {
    try {
      const result = await this.prisma.maintenanceRecord.updateMany({
        where: {
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });
      
      this.logger.log('Recurring maintenance cancelled', { 
        parentRecordId, 
        cancelledCount: result.count 
      });
      
      return result.count;
    } catch (error) {
      this.logger.error('Error cancelling recurring maintenance: ' + error.message);
      throw error;
    }
  }

  async rescheduleOverdueRecords(newDate: Date): Promise<number> {
    try {
      const result = await this.prisma.maintenanceRecord.updateMany({
        where: {
          startDate: { lt: new Date() },
          status: 'PENDING',
        },
        data: {
          startDate: newDate,
          updatedAt: new Date(),
        },
      });
      
      this.logger.log('Overdue records rescheduled', { 
        newDate, 
        rescheduledCount: result.count 
      });
      
      return result.count;
    } catch (error) {
      this.logger.error('Error rescheduling overdue records: ' + error.message);
      throw error;
    }
  }

  private buildWhereClause(filters?: MaintenanceRecordFilters): any {
    if (!filters) return {};

    const where: any = {};

    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.userId) {
      where.OR = [
        { reportedBy: filters.userId },
        { assignedTo: filters.userId }
      ];
    }
    if (filters.maintenanceType) where.maintenanceType = filters.maintenanceType;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;
    if (filters.assignedTechnician) where.assignedTo = filters.assignedTechnician;
    // Note: isRecurring field doesn't exist in MaintenanceRecord schema
    // if (filters.isRecurring !== undefined) where.isRecurring = filters.isRecurring;
    // Note: followUpRequired field doesn't exist in MaintenanceRecord schema
    // if (filters.followUpRequired !== undefined) where.followUpRequired = filters.followUpRequired;
    if (filters.createdBy) where.createdBy = filters.createdBy;

    if (filters.scheduledDateFrom || filters.scheduledDateTo) {
      where.startDate = {};
      if (filters.scheduledDateFrom) where.startDate.gte = filters.scheduledDateFrom;
      if (filters.scheduledDateTo) where.startDate.lte = filters.scheduledDateTo;
    }

    if (filters.isOverdue) {
      where.startDate = { lt: new Date() };
      where.status = { notIn: ['COMPLETED', 'CANCELLED'] };
    }

    return where;
  }

  private mapToEntity(model: any): MaintenanceRecordEntity {
    return new MaintenanceRecordEntity(
      model.id,
      model.resourceId,
      model.reportedBy || 'system',
      model.type,
      model.title,
      model.description,
      model.priority,
      model.status,
      model.startDate,
      model.duration || 60, // Default 60 minutes
      false, // isRecurring - not used in MaintenanceRecord
      0, // completionPercentage - not used in schema
      false, // followUpRequired - not used in schema
      model.createdAt,
      model.updatedAt,
      model.reportedBy || 'system',
      model.startDate,
      model.endDate,
      model.duration,
      model.cost,
      model.workPerformed,
      model.attachments,
      model.technician,
      model.observations
    );
  }

  private entityToModel(entity: MaintenanceRecordEntity): any {
    return {
      id: entity.id,
      resourceId: entity.resourceId,
      reportedBy: entity.userId,
      assignedTo: entity.assignedTechnician,
      type: entity.maintenanceType,
      title: entity.title,
      description: entity.description,
      priority: entity.priority,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      duration: entity.actualDuration || entity.estimatedDuration,
      cost: entity.cost,
      workPerformed: entity.notes,
      attachments: entity.attachments,
      technician: entity.assignedTechnician,
      observations: entity.technicianNotes,
      // Note: These fields don't exist in MaintenanceRecord schema:
      // isRecurring, recurringPattern, nextScheduledDate, parentRecordId,
      // completionPercentage, qualityRating, followUpRequired, followUpDate
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      // updatedBy field doesn't exist in schema
    };
  }

  private calculateNextDate(baseDate: Date, pattern: string): Date {
    const nextDate = new Date(baseDate);
    
    switch (pattern) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        throw new Error(`Invalid recurring pattern: ${pattern}`);
    }
    
    return nextDate;
  }
}
