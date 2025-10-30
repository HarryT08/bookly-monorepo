import { ReservationEntity, ReservationStatus } from '../entities/reservation.entity';

/**
 * Reservation Repository Interface - Domain Layer
 * Defines the contract for reservation data access
 */
export interface ReservationRepository {
  /**
   * Create a new reservation
   */
  create(reservationData: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    status: ReservationStatus;
    isRecurring: boolean;
    recurrence?: any;
    userId: string;
    resourceId: string;
  }): Promise<ReservationEntity>;

  /**
   * Find reservation by ID
   */
  findById(id: string): Promise<ReservationEntity | null>;

  /**
   * Find all reservations for a user
   */
  findByUserId(userId: string): Promise<ReservationEntity[]>;

  /**
   * Find all reservations for a resource
   */
  findByResourceId(resourceId: string): Promise<ReservationEntity[]>;

  /**
   * Find reservations within date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<ReservationEntity[]>;

  /**
   * Find reservations for a resource within date range
   */
  findByResourceAndDateRange(
    resourceId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ReservationEntity[]>;

  /**
   * Find conflicting reservations
   */
  findConflictingReservations(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<ReservationEntity[]>;

  /**
   * Update reservation
   */
  update(id: string, updates: Partial<ReservationEntity>): Promise<ReservationEntity>;

  /**
   * Delete reservation
   */
  delete(id: string): Promise<void>;

  /**
   * Find reservations by status
   */
  findByStatus(status: string): Promise<ReservationEntity[]>;

  /**
   * Find upcoming reservations for a user
   */
  findUpcomingByUserId(userId: string): Promise<ReservationEntity[]>;

  /**
   * Find active reservations (currently happening)
   */
  findActiveReservations(): Promise<ReservationEntity[]>;
}
