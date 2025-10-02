import { HistoryAction, HistorySource } from '../../../../libs/dto/availability/reservation-history-detailed.dto';

/**
 * Query to get detailed reservation history with advanced filtering (RF-11)
 * Supports pagination, filtering by multiple criteria, and includes related data
 */
export class GetReservationHistoryDetailedQuery {
  constructor(
    public readonly reservationId?: string,
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly actions?: HistoryAction[],
    public readonly sources?: HistorySource[],
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'asc' | 'desc' = 'desc',
    public readonly includeReservationData: boolean = false,
    public readonly includeUserData: boolean = false
  ) {}
}
