import { Controller, Get, Post, Body, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { REPORTS_URLS } from '../../utils/maps/urls.map';

// Import commands (these would need to be created)
import { GenerateUsageReportCommand } from '../../application/commands/generate-usage-report.command';
import { GenerateUserReportCommand } from '../../application/commands/generate-user-report.command';
import { ExportReportCommand } from '../../application/commands/export-report.command';
import { CreateFeedbackCommand } from '../../application/commands/create-feedback.command';
import { GenerateDemandReportCommand } from '../../application/commands/generate-demand-report.command';

// Import queries (these would need to be created)
import { GetDashboardDataQuery } from '../../application/queries/get-dashboard-data.query';
import { GetFeedbackQuery } from '../../application/queries/get-feedback.query';
import { GetAuditLogsQuery } from '../../application/queries/get-audit-logs.query';

/**
 * Reports Controller
 * 
 * Implements CQRS pattern for all report generation and data retrieval operations.
 * Follows Clean Architecture principles with CommandBus and QueryBus separation.
 * 
 * Coverage:
 * - RF-31: Report generation by resource/program/period
 * - RF-32: User and professor reports
 * - RF-33: CSV export functionality
 * - RF-34: Feedback management
 * - RF-36: Dashboard data and analytics
 * - RF-37: Demand analysis reports
 */
@ApiTags('Reports')
@Controller(REPORTS_URLS.BASE)
export class ReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(REPORTS_URLS.USAGE_REPORTS)
  @ApiOperation({ 
    summary: 'Generate usage report (RF-31)',
    description: 'Generate comprehensive usage reports by resource, program, or time period'
  })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by: resource, program, user, date' })
  @ApiResponse({ status: 200, description: 'Usage report generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid filter parameters' })
  async generateUsageReport(@Query() filters: any) {
    const command = new GenerateUsageReportCommand(
      filters.startDate ? new Date(filters.startDate) : new Date(),
      filters.endDate ? new Date(filters.endDate) : new Date(),
      filters.resourceId ? [filters.resourceId] : undefined,
      filters.programId ? [filters.programId] : undefined,
      filters.includeDetails
    );
    return await this.commandBus.execute(command);
  }

  @Get(REPORTS_URLS.USER_ACTIVITY)
  @ApiOperation({ 
    summary: 'Generate user report (RF-32)',
    description: 'Generate detailed report for specific user or professor'
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'User report generated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async generateUserReport(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const command = new GenerateUserReportCommand(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    return await this.commandBus.execute(command);
  }

  @Post(REPORTS_URLS.EXPORT_CSV_REPORT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Export report to CSV (RF-33)',
    description: 'Export any report data to CSV format for external analysis'
  })
  @ApiBody({ 
    description: 'Report data to export',
    schema: {
      type: 'object',
      properties: {
        reportType: { type: 'string', description: 'Type of report to export' },
        data: { type: 'object', description: 'Report data' },
        filename: { type: 'string', description: 'Desired filename (optional)' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid export data' })
  async exportToCSV(@Body() reportData: any) {
    const command = new ExportReportCommand(
      reportData.reportType,
      'CSV',
      reportData.filters
    );
    return await this.commandBus.execute(command);
  }

  @Get(REPORTS_URLS.DASHBOARD_DATA)
  @ApiOperation({ 
    summary: 'Get dashboard data (RF-36)',
    description: 'Retrieve real-time dashboard analytics and metrics'
  })
  @ApiQuery({ name: 'refresh', required: false, type: Boolean, description: 'Force refresh of cached data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboardData(@Query('refresh') refresh?: boolean) {
    const query = new GetDashboardDataQuery(
      undefined, // userId
      refresh ? 'force-refresh' : 'default', // timeRange
      { refresh }
    );
    return await this.queryBus.execute(query);
  }

  @Get(REPORTS_URLS.FEEDBACK_REPORTS)
  @ApiOperation({ 
    summary: 'Get all feedback (RF-34)',
    description: 'Retrieve user feedback with optional filtering'
  })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'rating', required: false, type: Number, description: 'Filter by rating' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  async findAllFeedback(
    @Query('resourceId') resourceId?: string,
    @Query('userId') userId?: string,
    @Query('rating') rating?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const query = new GetFeedbackQuery(
      resourceId,
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    return await this.queryBus.execute(query);
  }

  @Post(REPORTS_URLS.FEEDBACK_REPORTS)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create new feedback (RF-34)',
    description: 'Submit user feedback for resources or services'
  })
  @ApiBody({
    description: 'Feedback data',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        resourceId: { type: 'string', description: 'Resource ID (optional)' },
        reservationId: { type: 'string', description: 'Reservation ID (optional)' },
        rating: { type: 'number', description: 'Rating (1-5)' },
        comment: { type: 'string', description: 'Feedback comment' },
        category: { type: 'string', description: 'Feedback category' }
      },
      required: ['userId', 'rating']
    }
  })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid feedback data' })
  async createFeedback(@Body() data: any) {
    const command = new CreateFeedbackCommand(
      data.userId,
      data.resourceId,
      data.reservationId,
      data.rating,
      data.comment,
      data.category
    );
    return await this.commandBus.execute(command);
  }

  @Get(REPORTS_URLS.AUDIT_LOGS)
  @ApiOperation({ 
    summary: 'Get audit logs',
    description: 'Retrieve system audit logs with filtering capabilities'
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(@Query() filters: any) {
    const query = new GetAuditLogsQuery(
      filters.resourceId,
      filters.entityType,
      filters.userId,
      filters.action,
      filters.startDate ? new Date(filters.startDate) : undefined,
      filters.endDate ? new Date(filters.endDate) : undefined,
      filters.page || 1,
      filters.limit || 50
    );
    return await this.queryBus.execute(query);
  }

  @Get(REPORTS_URLS.DEMAND_ANALYSIS)
  @ApiOperation({ 
    summary: 'Generate demand report (RF-37)',
    description: 'Analyze demand patterns and unsatisfied reservation requests'
  })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'programId', required: false, description: 'Filter by program ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Demand report generated successfully' })
  async generateDemandReport(
    @Query('resourceType') resourceType?: string,
    @Query('programId') programId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const command = new GenerateDemandReportCommand(
      startDate ? new Date(startDate) : new Date(),
      endDate ? new Date(endDate) : new Date(),
      resourceType ? [resourceType] : undefined,
      programId ? [programId] : undefined
    );
    return await this.commandBus.execute(command);
  }
}
