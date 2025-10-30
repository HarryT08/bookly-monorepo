import { IQuery } from '@nestjs/cqrs';
import { ReservationAction } from '../../../../libs/dto/availability/reservation-history.dto';

/**
 * Get Reservation History Query (RF-11)
 * Query to retrieve reservation history with filters and pagination
 */
export class GetReservationHistoryQuery implements IQuery {
  constructor(
    public readonly reservationId?: string,
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly action?: ReservationAction,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}
}

/**
 * Export Reservation History Query (RF-11)
 * Query to export reservation history to CSV format
 */
export class ExportReservationHistoryQuery implements IQuery {
  constructor(
    public readonly reservationId?: string,
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly action?: ReservationAction,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}
