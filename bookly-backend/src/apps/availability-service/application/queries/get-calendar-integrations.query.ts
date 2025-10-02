import { IQuery } from '@nestjs/cqrs';

/**
 * Query for getting calendar integrations (RF-08)
 */
export class GetCalendarIntegrationsQuery implements IQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly provider?: string,
    public readonly isActive?: boolean
  ) {}
}
