import { IQuery } from '@nestjs/cqrs';

/**
 * Query for getting availability considering calendar conflicts (RF-08)
 */
export class GetAvailabilityWithConflictsQuery implements IQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly includeConflicts: boolean = true
  ) {}
}
