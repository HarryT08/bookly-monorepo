import { RecurringReservationInstanceEntity } from '../entities/recurring-reservation-instance.entity';
import { InstanceStatus } from '../../utils';

/**
 * Recurring Reservation Instance Repository Interface - Domain Layer
 * Defines the contract for recurring reservation instance data access
 */
export interface RecurringReservationInstanceRepository {
  findMany(filters: { recurringReservationId: string; status: string; startDate: Date; endDate: Date; includeConfirmed: boolean; includePending: boolean; includeCancelled: boolean; }, page: number, limit: number, sortBy: string, sortOrder: string): { items: any; total: any; } | PromiseLike<{ items: any; total: any; }>;
  /**
   * Create a new recurring reservation instance
   */
  create(data: {
    recurringReservationId: string;
    reservationId?: string;
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    status: InstanceStatus;
  }): Promise<RecurringReservationInstanceEntity>;

  /**
   * Create multiple instances at once
   */
  createMany(
    instances: Array<{
      recurringReservationId: string;
      scheduledDate: Date;
      startTime: string;
      endTime: string;
      status: InstanceStatus;
    }>
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instance by ID
   */
  findById(id: string): Promise<RecurringReservationInstanceEntity | null>;

  /**
   * Find all instances for a recurring reservation
   */
  findByRecurringReservationId(recurringReservationId: string): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instances by status
   */
  findByStatus(status: InstanceStatus): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instances for a recurring reservation by status
   */
  findByRecurringReservationAndStatus(
    recurringReservationId: string,
    status: InstanceStatus
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instances scheduled for a specific date
   */
  findByScheduledDate(date: Date): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instances scheduled within a date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instances for a recurring reservation within a date range
   */
  findByRecurringReservationAndDateRange(
    recurringReservationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find pending instances that need confirmation
   */
  findPendingInstances(): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find pending instances for a specific recurring reservation
   */
  findPendingByRecurringReservation(
    recurringReservationId: string
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instances that are happening today
   */
  findTodayInstances(): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find upcoming instances (future instances)
   */
  findUpcomingInstances(
    fromDate?: Date,
    limitDays?: number
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find past instances
   */
  findPastInstances(
    toDate?: Date,
    limitDays?: number
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Find instances linked to a specific reservation
   */
  findByReservationId(reservationId: string): Promise<RecurringReservationInstanceEntity | null>;

  /**
   * Find conflicting instances for a resource and time slot
   */
  findConflictingInstances(
    resourceId: string,
    scheduledDate: Date,
    startTime: string,
    endTime: string,
    excludeInstanceId?: string
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Update instance
   */
  update(id: string, updates: Partial<RecurringReservationInstanceEntity>): Promise<RecurringReservationInstanceEntity>;

  /**
   * Update multiple instances
   */
  updateMany(
    instanceIds: string[],
    updates: Partial<RecurringReservationInstanceEntity>
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Delete instance
   */
  delete(id: string): Promise<void>;

  /**
   * Delete multiple instances
   */
  deleteMany(instanceIds: string[]): Promise<void>;

  /**
   * Delete all instances for a recurring reservation
   */
  deleteByRecurringReservationId(recurringReservationId: string): Promise<void>;

  /**
   * Delete future instances for a recurring reservation (from a specific date)
   */
  deleteFutureInstances(
    recurringReservationId: string,
    fromDate: Date
  ): Promise<void>;

  /**
   * Count instances by status for a recurring reservation
   */
  countByRecurringReservationAndStatus(
    recurringReservationId: string,
    status: InstanceStatus
  ): Promise<number>;

  /**
   * Count total instances for a recurring reservation
   */
  countByRecurringReservation(recurringReservationId: string): Promise<number>;

  /**
   * Find instances that need to be processed (e.g., for automatic confirmation)
   */
  findInstancesNeedingProcessing(
    hoursAhead: number
  ): Promise<RecurringReservationInstanceEntity[]>;

  /**
   * Confirm an instance and link it to a reservation
   */
  confirmInstance(id: string, reservationId: string): Promise<RecurringReservationInstanceEntity>;

  /**
   * Cancel an instance
   */
  cancelInstance(id: string): Promise<RecurringReservationInstanceEntity>;

  /**
   * Skip an instance
   */
  skipInstance(id: string): Promise<RecurringReservationInstanceEntity>;
}
