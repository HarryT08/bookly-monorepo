import { ScheduledMaintenanceEntity } from '../entities/scheduled-maintenance.entity';

export interface ScheduledMaintenanceFilters {
  resourceId?: string;
  maintenanceType?: string;
  priority?: string;
  status?: string;
  assignedTechnician?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  scheduledDateFrom?: Date;
  scheduledDateTo?: Date;
  isOverdue?: boolean;
  isDue?: boolean;
  needsApproval?: boolean;
  isApproved?: boolean;
  parentScheduleId?: string;
  tags?: string[];
  createdBy?: string;
}

export interface ScheduledMaintenanceSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ScheduledMaintenancePagination {
  page: number;
  limit: number;
}

export interface ScheduledMaintenanceQueryResult {
  schedules: ScheduledMaintenanceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ScheduledMaintenanceStatistics {
  totalSchedules: number;
  scheduledMaintenance: number;
  inProgressMaintenance: number;
  completedMaintenance: number;
  cancelledMaintenance: number;
  postponedMaintenance: number;
  overdueMaintenance: number;
  pendingApproval: number;
  averageExecutionTime: number; // in minutes
  completionRate: number; // percentage
  totalCost?: number;
  recurringSchedules: number;
  byMaintenanceType: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  upcomingThisWeek: number;
  upcomingThisMonth: number;
}

export abstract class ScheduledMaintenanceRepository {
  abstract create(scheduledMaintenance: ScheduledMaintenanceEntity): Promise<ScheduledMaintenanceEntity>;
  abstract findById(id: string): Promise<ScheduledMaintenanceEntity | null>;
  abstract findAll(
    filters?: ScheduledMaintenanceFilters,
    sort?: ScheduledMaintenanceSortOptions,
    pagination?: ScheduledMaintenancePagination
  ): Promise<ScheduledMaintenanceQueryResult>;
  abstract update(id: string, scheduledMaintenance: ScheduledMaintenanceEntity): Promise<ScheduledMaintenanceEntity>;
  abstract delete(id: string): Promise<void>;

  // Specific query methods
  abstract findByResourceId(resourceId: string): Promise<ScheduledMaintenanceEntity[]>;
  abstract findByTechnician(technicianId: string): Promise<ScheduledMaintenanceEntity[]>;
  abstract findByStatus(status: string): Promise<ScheduledMaintenanceEntity[]>;
  abstract findByMaintenanceType(type: string): Promise<ScheduledMaintenanceEntity[]>;
  abstract findOverdue(): Promise<ScheduledMaintenanceEntity[]>;
  abstract findDueToday(): Promise<ScheduledMaintenanceEntity[]>;
  abstract findDueThisWeek(): Promise<ScheduledMaintenanceEntity[]>;
  abstract findDueThisMonth(): Promise<ScheduledMaintenanceEntity[]>;
  abstract findUpcoming(days?: number): Promise<ScheduledMaintenanceEntity[]>;
  abstract findRecurringSchedules(): Promise<ScheduledMaintenanceEntity[]>;
  abstract findByParentSchedule(parentScheduleId: string): Promise<ScheduledMaintenanceEntity[]>;
  abstract findPendingApproval(): Promise<ScheduledMaintenanceEntity[]>;
  abstract findNeedingReminders(hoursAhead?: number): Promise<ScheduledMaintenanceEntity[]>;
  abstract findByTags(tags: string[]): Promise<ScheduledMaintenanceEntity[]>;

  // Date-based queries
  abstract findByDateRange(startDate: Date, endDate: Date): Promise<ScheduledMaintenanceEntity[]>;
  abstract findScheduledForDate(date: Date): Promise<ScheduledMaintenanceEntity[]>;
  abstract findCompletedInPeriod(startDate: Date, endDate: Date): Promise<ScheduledMaintenanceEntity[]>;

  // Statistics and reporting
  abstract getStatistics(
    filters?: ScheduledMaintenanceFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ScheduledMaintenanceStatistics>;
  abstract getResourceMaintenanceSchedule(resourceId: string): Promise<ScheduledMaintenanceEntity[]>;
  abstract getTechnicianWorkload(
    technicianId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<ScheduledMaintenanceEntity[]>;
  abstract getMaintenanceCalendar(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, ScheduledMaintenanceEntity[]>>;
  abstract getRecurringSchedulesSummary(): Promise<Array<{
    parentScheduleId: string;
    resourceId: string;
    maintenanceType: string;
    recurringPattern: string;
    nextScheduled: Date;
    totalOccurrences: number;
    completedOccurrences: number;
  }>>;

  // Advanced operations
  abstract generateRecurringSchedules(
    baseSchedule: ScheduledMaintenanceEntity,
    occurrences: number,
    createdBy: string
  ): Promise<ScheduledMaintenanceEntity[]>;
  abstract cancelRecurringSchedules(
    parentScheduleId: string,
    reason: string,
    cancelledBy: string
  ): Promise<number>;
  abstract rescheduleOverdueSchedules(
    newBaseDate: Date,
    updatedBy: string
  ): Promise<number>;
  abstract bulkApprove(
    scheduleIds: string[],
    approvedBy: string
  ): Promise<number>;
  abstract bulkReschedule(
    scheduleIds: string[],
    newDates: Date[],
    updatedBy: string
  ): Promise<number>;

  // Bulk operations
  abstract createMany(schedules: ScheduledMaintenanceEntity[]): Promise<ScheduledMaintenanceEntity[]>;
  abstract updateMany(
    filters: ScheduledMaintenanceFilters,
    updates: Partial<ScheduledMaintenanceEntity>
  ): Promise<number>;
  abstract deleteMany(filters: ScheduledMaintenanceFilters): Promise<number>;

  // Maintenance planning helpers
  abstract findAvailableTimeSlots(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    durationMinutes: number
  ): Promise<Array<{ start: Date; end: Date }>>;
  abstract checkScheduleConflicts(
    resourceId: string,
    scheduledDate: Date,
    durationMinutes: number,
    excludeScheduleId?: string
  ): Promise<ScheduledMaintenanceEntity[]>;
  abstract optimizeSchedules(
    resourceIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    resourceId: string;
    recommendedDate: Date;
    reason: string;
  }>>;
}
