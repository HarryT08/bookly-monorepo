/**
 * Get Check-In Status Query
 */

import { IQuery } from '@nestjs/cqrs';

export class GetCheckInStatusQuery implements IQuery {
  constructor(
    public readonly reservationId: string,
    public readonly includeHistory?: boolean,
  ) {}
}
