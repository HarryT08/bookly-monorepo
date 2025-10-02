import { IQuery } from '@nestjs/cqrs';
import { UserReportFiltersDto } from '@dto/reports/user-report-filters.dto';

/**
 * RF-32: Query for generating user/professor reports
 * Reports about reservations made by specific users or professors
 */
export class UserReportQuery implements IQuery {
  constructor(
    public readonly filters: UserReportFiltersDto,
    public readonly userId: string,
    public readonly userRoles: string[],
    public readonly requestId?: string,
  ) {}
}

/**
 * Query for getting user report summary statistics
 */
export class UserReportSummaryQuery implements IQuery {
  constructor(
    public readonly filters: UserReportFiltersDto,
    public readonly userId: string,
    public readonly userRoles: string[],
  ) {}
}

/**
 * Query for getting user's report history
 */
export class UserReportHistoryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly reportType?: string,
    public readonly limit?: number,
  ) {}
}
