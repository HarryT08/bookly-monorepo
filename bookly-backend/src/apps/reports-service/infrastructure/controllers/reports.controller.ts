import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from '../../application/services/reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('usage')
  @ApiOperation({ summary: 'Generate usage report' })
  @ApiResponse({ status: 200, description: 'Usage report generated successfully' })
  async generateUsageReport(@Query() filters: any) {
    return this.reportsService.generateUsageReport(filters);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Generate user report' })
  @ApiResponse({ status: 200, description: 'User report generated successfully' })
  async generateUserReport(@Query('userId') userId: string) {
    return this.reportsService.generateUserReport(userId);
  }

  @Post('export/csv')
  @ApiOperation({ summary: 'Export report to CSV' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  async exportToCSV(@Body() reportData: any) {
    return this.reportsService.exportToCSV(reportData);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboardData() {
    return this.reportsService.getDashboardData();
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  async findAllFeedback() {
    return this.reportsService.findAllFeedback();
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  async createFeedback(@Body() data: any) {
    return this.reportsService.createFeedback(data);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(@Query() filters: any) {
    return this.reportsService.getAuditLogs(filters);
  }

  @Get('demand')
  @ApiOperation({ summary: 'Generate demand report' })
  @ApiResponse({ status: 200, description: 'Demand report generated successfully' })
  async generateDemandReport() {
    return this.reportsService.generateDemandReport();
  }
}
