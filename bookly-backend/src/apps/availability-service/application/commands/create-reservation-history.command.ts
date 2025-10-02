import { HistoryAction, HistorySource } from '../../../../libs/dto/availability/reservation-history-detailed.dto';

/**
 * Command to create a reservation history entry (RF-11)
 * Records all actions performed on reservations for audit trail
 */
export class CreateReservationHistoryCommand {
  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly action: HistoryAction,
    public readonly source: HistorySource,
    public readonly previousData?: any,
    public readonly newData?: any,
    public readonly details?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {}
}
