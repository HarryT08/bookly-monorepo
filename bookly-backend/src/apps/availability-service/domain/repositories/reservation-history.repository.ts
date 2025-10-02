import { ReservationAction } from '../../../../libs/dto/availability/reservation-history.dto';
import { HistoryAction, HistorySource } from '../../../../libs/dto/availability/reservation-history-detailed.dto';

/**
 * Reservation History Repository Interface - Domain Layer (RF-11)
 * Defines the contract for reservation history data access
 */
export interface ReservationHistoryRepository {
  /**
   * Create a new history entry
   */
  create(historyEntry: {
    reservationId: string;
    userId: string;
    action: ReservationAction;
    previousData?: any;
    newData: any;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ReservationHistoryEntity>;

  /**
   * Find history by reservation ID
   */
  findByReservationId(reservationId: string): Promise<ReservationHistoryEntity[]>;

  /**
   * Find history by user ID
   */
  findByUserId(userId: string): Promise<ReservationHistoryEntity[]>;

  /**
   * Find history by resource ID (through reservations)
   */
  findByResourceId(resourceId: string): Promise<ReservationHistoryEntity[]>;

  /**
   * Find history by action type
   */
  findByAction(action: ReservationAction): Promise<ReservationHistoryEntity[]>;

  /**
   * Find history within date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<ReservationHistoryEntity[]>;

  /**
   * Find history with pagination and filters
   */
  findWithFilters(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    action?: ReservationAction;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ReservationHistoryEntity[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Count history entries by advanced filters (RF-11)
   */
  countByFilters(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    actions?: HistoryAction[];
    sources?: HistorySource[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<number>;

  /**
   * Find history entries by advanced filters with pagination (RF-11)
   */
  findByFilters(
    filters: {
      reservationId?: string;
      userId?: string;
      resourceId?: string;
      actions?: HistoryAction[];
      sources?: HistorySource[];
      startDate?: Date;
      endDate?: Date;
    },
    options: {
      limit: number;
      offset: number;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
      includeReservationData: boolean;
      includeUserData: boolean;
    }
  ): Promise<any[]>;

  /**
   * Export history to CSV format
   */
  exportToCsv(filters: {
    reservationId?: string;
    userId?: string;
    resourceId?: string;
    action?: ReservationAction;
    startDate?: Date;
    endDate?: Date;
  }): Promise<string>;
}

/**
 * Reservation History Entity for domain operations
 */
export class ReservationHistoryEntity {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly action: ReservationAction,
    public readonly source: HistorySource,
    public readonly previousData: any | null,
    public readonly newData: any,
    public readonly reason: string | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly createdAt: Date
  ) {}

  /**
   * Get a summary of the change
   */
  getChangeSummary(): string {
    switch (this.action) {
      case ReservationAction.CREATED:
        return `Reservation created: ${this.newData.title}`;
      case ReservationAction.MODIFIED:
        return `Reservation modified: ${this.getModificationDetails()}`;
      case ReservationAction.CANCELLED:
        return `Reservation cancelled${this.reason ? `: ${this.reason}` : ''}`;
      case ReservationAction.APPROVED:
        return `Reservation approved`;
      case ReservationAction.REJECTED:
        return `Reservation rejected${this.reason ? `: ${this.reason}` : ''}`;
      case ReservationAction.COMPLETED:
        return `Reservation completed`;
      default:
        return `Reservation ${String(this.action).toLowerCase()}`;
    }
  }

  private getModificationDetails(): string {
    if (!this.previousData || !this.newData) return 'details unavailable';
    
    const changes: string[] = [];
    
    if (this.previousData.title !== this.newData.title) {
      changes.push(`title changed from "${this.previousData.title}" to "${this.newData.title}"`);
    }
    
    if (this.previousData.startDate !== this.newData.startDate) {
      changes.push(`start time changed`);
    }
    
    if (this.previousData.endDate !== this.newData.endDate) {
      changes.push(`end time changed`);
    }
    
    return changes.length > 0 ? changes.join(', ') : 'minor changes';
  }
}
