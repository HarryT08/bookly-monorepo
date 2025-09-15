import { ScheduleEntity } from '../entities/schedule.entity';
import { ScheduleType } from '../../../../libs/dto/availability/create-schedule.dto';

/**
 * Schedule Repository Interface - Domain Layer (RF-07)
 * Defines the contract for schedule data access
 */
export interface ScheduleRepository {
  /**
   * Create a new schedule
   */
  create(scheduleData: {
    resourceId: string;
    name: string;
    type: ScheduleType;
    startDate: Date;
    endDate?: Date;
    recurrenceRule?: any;
    restrictions?: any;
    isActive: boolean;
    createdBy: string;
  }): Promise<ScheduleEntity>;

  /**
   * Find schedule by ID
   */
  findById(id: string): Promise<ScheduleEntity | null>;

  /**
   * Find all schedules for a resource
   */
  findByResourceId(resourceId: string): Promise<ScheduleEntity[]>;

  /**
   * Find active schedules for a resource within date range
   */
  findActiveByResourceAndDateRange(
    resourceId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ScheduleEntity[]>;

  /**
   * Find schedules by type
   */
  findByType(type: string): Promise<ScheduleEntity[]>;

  /**
   * Find schedules by resource and type
   */
  findByResourceAndType(resourceId: string, type: string): Promise<ScheduleEntity[]>;

  /**
   * Update schedule
   */
  update(id: string, updates: Partial<ScheduleEntity>): Promise<ScheduleEntity>;

  /**
   * Delete schedule
   */
  delete(id: string): Promise<void>;

  /**
   * Find conflicting schedules
   */
  findConflictingSchedules(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<ScheduleEntity[]>;

  /**
   * Find schedules that affect a specific date
   */
  findByResourceAndDate(resourceId: string, date: Date): Promise<ScheduleEntity[]>;

  /**
   * Find schedules within a date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<ScheduleEntity[]>;
}
