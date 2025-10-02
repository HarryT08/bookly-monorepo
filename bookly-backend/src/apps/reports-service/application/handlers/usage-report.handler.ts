import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { LoggingService } from "@libs/logging/logging.service";
import { 
  UsageReportQuery,
  UsageReportSummaryQuery,
  ReportFilterOptionsQuery
} from '@apps/reports-service/application/queries/usage-report.query';
import { ReportsService } from '@apps/reports-service/application/services/reports.service';

/**
 * Usage Report Query Handler
 * Implements RF-31 (usage reports by resource/program/period)
 */
@QueryHandler(UsageReportQuery)
@Injectable()
export class UsageReportHandler implements IQueryHandler<UsageReportQuery> {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: UsageReportQuery): Promise<any> {
    const { filters, userId, requestId } = query;

    try {
      this.loggingService.log(
        'Executing usage report query',
        `UsageReportHandler - userId: ${userId}, requestId: ${requestId}`,
        'UsageReportHandler'
      );

      // Delegate to service
      const reportData = await this.reportsService.generateUsageReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        resourceIds: filters.resourceIds,
        programIds: filters.programIds,
      });

      this.loggingService.log(
        'Usage report query executed successfully',
        `UsageReportHandler - reportId: ${reportData.id}`,
        'UsageReportHandler'
      );

      return reportData;

    } catch (error) {
      this.loggingService.error(
        `Failed to execute usage report query: ${error.message}`,
        error.stack,
        'UsageReportHandler'
      );
      
      throw error;
    }
  }
}

/**
 * Usage Report Summary Query Handler
 */
@QueryHandler(UsageReportSummaryQuery)
@Injectable()
export class UsageReportSummaryHandler implements IQueryHandler<UsageReportSummaryQuery> {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: UsageReportSummaryQuery): Promise<any> {
    try {
      this.loggingService.log(
        'Executing usage report summary query',
        `UsageReportSummaryHandler - userId: ${query.userId}`,
        'UsageReportSummaryHandler'
      );

      const summary = await this.reportsService.getDashboardData();
      
      return {
        data: summary,
        message: 'Usage report summary retrieved successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.loggingService.error(
        `Failed to generate usage summary: ${error.message}`,
        error.stack,
        'UsageReportSummaryHandler'
      );
      throw error;
    }
  }
}

/**
 * Report Filter Options Query Handler
 */
@QueryHandler(ReportFilterOptionsQuery)
@Injectable()
export class ReportFilterOptionsHandler implements IQueryHandler<ReportFilterOptionsQuery> {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: ReportFilterOptionsQuery): Promise<any> {
    try {
      this.loggingService.log(
        'Executing report filter options query',
        'ReportFilterOptionsHandler'
      );

      const options = {
        data: {
          resources: [],
          programs: [],
          categories: [],
          timeRanges: [
            { value: 'last_7_days', label: 'Last 7 days' },
            { value: 'last_30_days', label: 'Last 30 days' },
            { value: 'last_90_days', label: 'Last 3 months' },
            { value: 'custom', label: 'Custom range' },
          ],
        },
        message: 'Filter options retrieved successfully',
        timestamp: new Date(),
      };

      return options;
    } catch (error) {
      this.loggingService.error(
        `Failed to get filter options: ${error.message}`,
        error.stack,
        'ReportFilterOptionsHandler'
      );
      throw error;
    }
  }
}
