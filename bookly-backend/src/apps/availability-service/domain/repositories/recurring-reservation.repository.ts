import {
  RecurringReservationEntity,
} from "../entities/recurring-reservation.entity";
import { RecurrenceFrequency, RecurringReservationPriority, RecurringReservationStatus } from "../../utils";

/**
 * Recurring Reservation Repository Interface - Domain Layer
 * Defines the contract for recurring reservation data access
 */
export interface RecurringReservationRepository {
  findMany(
    filters: {
      userId: string;
      resourceId: string;
      programId: string;
      status: RecurringReservationStatus;
      frequency: RecurrenceFrequency;
      startDate: Date;
      endDate: Date;
      priority: RecurringReservationPriority;
      tags: string[];
    },
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string
  ): { items: any; total: any } | PromiseLike<{ items: any; total: any }>;
  /**
   * Create a new recurring reservation
   */
  create(data: {
    title: string;
    description?: string;
    resourceId: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    frequency: RecurrenceFrequency;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    status: RecurringReservationStatus;
  }): Promise<RecurringReservationEntity>;

  /**
   * Find recurring reservation by ID
   */
  findById(id: string): Promise<RecurringReservationEntity | null>;

  /**
   * Find all recurring reservations for a user
   */
  findByUserId(
    userId: string,
    status?: RecurringReservationStatus,
    limit?: number
  ): Promise<RecurringReservationEntity[]>;

  /**
   * Find all recurring reservations for a resource
   */
  findByResourceId(resourceId: string): Promise<RecurringReservationEntity[]>;

  /**
   * Find recurring reservations by status
   */
  findByStatus(
    status: RecurringReservationStatus
  ): Promise<RecurringReservationEntity[]>;

  /**
   * Find active recurring reservations for a user
   */
  findActiveByUserId(userId: string): Promise<RecurringReservationEntity[]>;

  /**
   * Find active recurring reservations for a resource
   */
  findActiveByResourceId(
    resourceId: string
  ): Promise<RecurringReservationEntity[]>;

  /**
   * Find recurring reservations that overlap with a date range
   */
  findOverlappingWithDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<RecurringReservationEntity[]>;

  /**
   * Find recurring reservations that generate instances on a specific date
   */
  findGeneratingInstancesOnDate(
    resourceId: string,
    date: Date
  ): Promise<RecurringReservationEntity[]>;

  /**
   * Find recurring reservations by frequency
   */
  findByFrequency(
    frequency: RecurrenceFrequency
  ): Promise<RecurringReservationEntity[]>;

  /**
   * Find recurring reservations ending before a date (for cleanup)
   */
  findEndingBefore(date: Date): Promise<RecurringReservationEntity[]>;

  /**
   * Update recurring reservation
   */
  update(
    id: string,
    updates: Partial<RecurringReservationEntity>
  ): Promise<RecurringReservationEntity>;

  /**
   * Delete recurring reservation
   */
  delete(id: string): Promise<void>;

  /**
   * Count active recurring reservations for a user
   */
  countActiveByUserId(userId: string): Promise<number>;

  /**
   * Count active recurring reservations for a resource
   */
  countActiveByResourceId(resourceId: string): Promise<number>;

  /**
   * Find recurring reservations that need instance generation
   */
  findNeedingInstanceGeneration(
    lookAheadDays: number
  ): Promise<RecurringReservationEntity[]>;

  /**
   * Update instance counts for a recurring reservation
   */
  updateInstanceCounts(
    id: string,
    totalInstances: number,
    confirmedInstances: number
  ): Promise<void>;
}
