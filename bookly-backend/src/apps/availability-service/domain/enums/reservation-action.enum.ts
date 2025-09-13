/**
 * Reservation Action Enum
 * Defines the possible actions that can be performed on reservations
 */
export enum ReservationAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  CANCELLED = 'CANCELLED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  NO_SHOW = 'NO_SHOW',
  MODIFIED = 'MODIFIED'
}
