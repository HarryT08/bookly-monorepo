import { IQuery } from '@nestjs/cqrs';
import { UsageReportFiltersDto } from '@dto/reports/usage-report-filters.dto';

/**
 * RF-31: Query for generating usage reports
 * Reports about resource utilization by academic program, period, and resource type
 */
export class UsageReportQuery implements IQuery {
  constructor(
    public readonly filters: UsageReportFiltersDto,
    public readonly userId: string,
    public readonly userRoles: string[],
    public readonly requestId?: string,
  ) {}
}

/**
 * Query for getting usage report summary statistics
 */
export class UsageReportSummaryQuery implements IQuery {
  constructor(
    public readonly filters: UsageReportFiltersDto,
    public readonly userId: string,
    public readonly userRoles: string[],
  ) {}
}

/**
 * Query for getting available filter options
 */
export class ReportFilterOptionsQuery implements IQuery {
  constructor(
    public readonly filterType: 'programs' | 'resourceTypes' | 'categories' | 'users',
    public readonly userId: string,
    public readonly userRoles: string[],
    public readonly userType?: string,
  ) {}
}
