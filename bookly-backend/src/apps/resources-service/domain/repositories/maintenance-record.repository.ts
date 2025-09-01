import { MaintenanceRecordEntity } from '../entities/maintenance-record.entity';

export interface MaintenanceRecordFilters {
  resourceId?: string;
  userId?: string;
  maintenanceType?: string;
  priority?: string;
  status?: string;
  assignedTechnician?: string;
  isRecurring?: boolean;
  scheduledDateFrom?: Date;
  scheduledDateTo?: Date;
  isOverdue?: boolean;
  followUpRequired?: boolean;
  createdBy?: string;
}

export interface MaintenanceRecordSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface MaintenanceRecordPagination {
  page: number;
  limit: number;
}

export interface MaintenanceRecordQueryResult {
  records: MaintenanceRecordEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MaintenanceRecordStatistics {
  totalRecords: number;
  pendingRecords: number;
  inProgressRecords: number;
  completedRecords: number;
  overdueRecords: number;
  averageCompletionTime: number; // in minutes
  completionRate: number; // percentage
  qualityRatingAverage?: number;
  costTotal?: number;
  byMaintenanceType: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

export abstract class MaintenanceRecordRepository {
  abstract create(maintenanceRecord: MaintenanceRecordEntity): Promise<MaintenanceRecordEntity>;
  abstract findById(id: string): Promise<MaintenanceRecordEntity | null>;
  abstract findAll(
    filters?: MaintenanceRecordFilters,
    sort?: MaintenanceRecordSortOptions,
    pagination?: MaintenanceRecordPagination
  ): Promise<MaintenanceRecordQueryResult>;
  abstract update(id: string, maintenanceRecord: MaintenanceRecordEntity): Promise<MaintenanceRecordEntity>;
  abstract delete(id: string): Promise<void>;
  
  // Specific query methods
  abstract findByResourceId(resourceId: string): Promise<MaintenanceRecordEntity[]>;
  abstract findByUserId(userId: string): Promise<MaintenanceRecordEntity[]>;
  abstract findByStatus(status: string): Promise<MaintenanceRecordEntity[]>;
  abstract findOverdue(): Promise<MaintenanceRecordEntity[]>;
  abstract findScheduledForDate(date: Date): Promise<MaintenanceRecordEntity[]>;
  abstract findByMaintenanceType(type: string): Promise<MaintenanceRecordEntity[]>;
  abstract findByAssignedTechnician(technicianId: string): Promise<MaintenanceRecordEntity[]>;
  abstract findRecurringRecords(): Promise<MaintenanceRecordEntity[]>;
  abstract findByParentRecord(parentRecordId: string): Promise<MaintenanceRecordEntity[]>;
  abstract findRequiringFollowUp(): Promise<MaintenanceRecordEntity[]>;
  
  // Statistics and reporting
  abstract getStatistics(
    filters?: MaintenanceRecordFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<MaintenanceRecordStatistics>;
  abstract getResourceMaintenanceHistory(resourceId: string): Promise<MaintenanceRecordEntity[]>;
  abstract getTechnicianWorkload(technicianId: string): Promise<MaintenanceRecordEntity[]>;
  abstract getUpcomingMaintenance(days?: number): Promise<MaintenanceRecordEntity[]>;
  
  // Bulk operations
  abstract createMany(maintenanceRecords: MaintenanceRecordEntity[]): Promise<MaintenanceRecordEntity[]>;
  abstract updateMany(
    filters: MaintenanceRecordFilters,
    updates: Partial<MaintenanceRecordEntity>
  ): Promise<number>;
  abstract deleteMany(filters: MaintenanceRecordFilters): Promise<number>;
  
  // Specialized methods
  abstract scheduleRecurringMaintenance(
    baseRecord: MaintenanceRecordEntity,
    occurrences: number
  ): Promise<MaintenanceRecordEntity[]>;
  abstract cancelRecurringMaintenance(parentRecordId: string): Promise<number>;
  abstract rescheduleOverdueRecords(newDate: Date): Promise<number>;
}
