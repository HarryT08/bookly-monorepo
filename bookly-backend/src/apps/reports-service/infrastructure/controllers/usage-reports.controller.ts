import { 
  Controller, 
  Get, 
  Query, 
  UseGuards, 
  Request,
  HttpException,
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { RolesGuard } from '@libs/common/guards/roles.guard';
import { Roles } from '@libs/common/decorators/roles.decorator';
import { ApiResponseBookly, PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { UsageReportFiltersDto } from '@dto/reports/usage-report-filters.dto';
import { UsageReportResponseDto } from '@dto/reports/report-response.dto';
import { 
  UsageReportQuery, 
  UsageReportSummaryQuery, 
  ReportFilterOptionsQuery 
} from '../../application/queries/usage-report.query';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { REPORTS_URLS } from '../../utils/maps/urls.map';

/**
 * RF-31: Usage Reports Controller
 * Handles endpoints for generating usage reports by program, period, and resource type
 */
@ApiTags('Usage Reports')
@Controller(REPORTS_URLS.USAGE_REPORTS)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsageReportsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Generate usage report with filters
   * RF-31: Reports about resource utilization by academic program, period, and resource type
   */
  @Get(REPORTS_URLS.USAGE_REPORTS)
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE')
  @ApiOperation({ 
    summary: 'Generate usage report',
    description: 'Generate detailed usage report filtered by program, period, and resource type' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usage report generated successfully',
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid filters provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateUsageReport(
    @Query() filters: UsageReportFiltersDto,
    @Request() req: any,
  ): Promise<ApiResponseBookly<UsageReportResponseDto>> {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;

    try {
      this.loggingService.log(
        `Usage report requested`,
        'UsageReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          filters: JSON.stringify(filters),
          requestId 
        })
      );

      const query = new UsageReportQuery(
        filters,
        req.user.id,
        req.user.roles || [],
        requestId,
      );

      const result = await this.queryBus.execute<UsageReportQuery, UsageReportResponseDto>(query);

      const executionTime = Date.now() - startTime;

      this.loggingService.log(
        `Usage report generated successfully`,
        'UsageReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id,
          recordCount: result.data.length,
          executionTime,
          requestId 
        })
      );

      return ResponseUtil.success(result, 'Usage report generated successfully');

    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.loggingService.error(
        `Error generating usage report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          filters: JSON.stringify(filters),
          executionTime,
          requestId 
        })
      );

      throw new HttpException(
        'Error generating usage report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get usage report summary statistics
   */
  @Get(REPORTS_URLS.USAGE_SUMMARY)
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE')
  @ApiOperation({ 
    summary: 'Get usage report summary',
    description: 'Get summary statistics for usage report with given filters' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usage report summary retrieved successfully',
    type: SuccessResponseDto
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUsageReportSummary(
    @Query() filters: UsageReportFiltersDto,
    @Request() req: any,
  ): Promise<ApiResponseBookly<any>> {
    try {
      this.loggingService.log(
        `Usage report summary requested`,
        'UsageReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          filters: JSON.stringify(filters) 
        })
      );

      const query = new UsageReportSummaryQuery(
        filters,
        req.user.id,
        req.user.roles || [],
      );

      const result = await this.queryBus.execute(query);

      return ResponseUtil.success(result, 'Usage report summary retrieved successfully');

    } catch (error) {
      this.loggingService.error(
        `Error getting usage report summary: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          filters: JSON.stringify(filters) 
        })
      );

      throw new HttpException(
        'Error getting usage report summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get available filter options for usage reports
   */
  @Get(REPORTS_URLS.FILTER_OPTIONS + '/:filterType')
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE', 'TEACHER', 'STUDENT')
  @ApiOperation({ 
    summary: 'Get filter options',
    description: 'Get available options for report filters (programs, resource types, categories, users)' 
  })
  @ApiQuery({ 
    name: 'filterType', 
    enum: ['programs', 'resourceTypes', 'categories', 'users'],
    description: 'Type of filter options to retrieve' 
  })
  @ApiQuery({ 
    name: 'userType', 
    required: false,
    description: 'Filter users by type (only applicable for users filterType)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Filter options retrieved successfully',
    type: SuccessResponseDto
  })
  async getFilterOptions(
    @Query('filterType') filterType: 'programs' | 'resourceTypes' | 'categories' | 'users',
    @Query('userType') userType?: string,
    @Request() req?: any,
  ): Promise<ApiResponseBookly<any>> {
    try {
      this.loggingService.log(
        `Filter options requested`,
        'UsageReportsController',
        LoggingHelper.logParams({ 
          userId: req?.user?.id, 
          filterType, 
          userType 
        })
      );

      const query = new ReportFilterOptionsQuery(
        filterType,
        req?.user?.id || 'anonymous',
        req?.user?.roles || [],
        userType,
      );

      const result = await this.queryBus.execute(query);

      return ResponseUtil.success(result, 'Filter options retrieved successfully');

    } catch (error) {
      this.loggingService.error(
        `Error getting filter options: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req?.user?.id,
          filterType,
          userType 
        })
      );

      throw new HttpException(
        'Error getting filter options',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
