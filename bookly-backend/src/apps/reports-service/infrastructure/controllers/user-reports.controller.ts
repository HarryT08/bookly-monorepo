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
import { PaginatedResponseDto, SuccessResponseDto } from '@libs/dto/common/response.dto';
import { ResponseUtil } from '@libs/common/utils/response.util';
import { UserReportFiltersDto } from '@dto/reports/user-report-filters.dto';
import { UserReportResponseDto } from '@dto/reports/report-response.dto';
import { 
  UserReportQuery, 
  UserReportSummaryQuery, 
  UserReportHistoryQuery 
} from '../../application/queries/user-report.query';
import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';
import { REPORTS_URLS } from '../../utils/maps/urls.map';

/**
 * RF-32: User Reports Controller
 * Handles endpoints for generating reports about reservations made by users/professors
 */
@ApiTags('User Reports')
@Controller(REPORTS_URLS.USER_REPORTS)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserReportsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Generate user reservations report with filters
   * RF-32: Reports about reservations made by specific users or professors
   */
  @Get(REPORTS_URLS.USER_REPORTS)
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE')
  @ApiOperation({ 
    summary: 'Generate user reservations report',
    description: 'Generate detailed report about reservations made by users/professors' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User report generated successfully',
    type: SuccessResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid filters provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateUserReport(
    @Query() filters: UserReportFiltersDto,
    @Request() req: any,
  ) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;

    try {
      this.loggingService.log(
        `User report requested`,
        'UserReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          filters: JSON.stringify(filters),
          requestId 
        })
      );

      const query = new UserReportQuery(
        filters,
        req.user.id,
        req.user.roles || [],
        requestId,
      );

      const result = await this.queryBus.execute<UserReportQuery, UserReportResponseDto>(query);

      const executionTime = Date.now() - startTime;

      this.loggingService.log(
        `User report generated successfully`,
        'UserReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id,
          recordCount: result.data.length,
          executionTime,
          requestId 
        })
      );

      return ResponseUtil.success(result, 'User report generated successfully');

    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.loggingService.error(
        `Error generating user report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          filters: JSON.stringify(filters),
          executionTime,
          requestId 
        })
      );

      throw new HttpException(
        'Error generating user report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user report summary statistics
   */
  @Get(REPORTS_URLS.USER_SUMMARY)
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE')
  @ApiOperation({ 
    summary: 'Get user report summary',
    description: 'Get summary statistics for user report with given filters' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User report summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 25 },
        totalReservations: { type: 'number', example: 375 },
        averageReservationsPerUser: { type: 'number', example: 15 },
        topUser: { type: 'string', example: 'profesor@ufps.edu.co' },
        averageUtilization: { type: 'number', example: 82.5 },
      },
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserReportSummary(
    @Query() filters: UserReportFiltersDto,
    @Request() req: any,
  ): Promise<any> {
    try {
      this.loggingService.log(
        `User report summary requested`,
        'UserReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          filters: JSON.stringify(filters) 
        })
      );

      const query = new UserReportSummaryQuery(
        filters,
        req.user.id,
        req.user.roles || [],
      );

      const result = await this.queryBus.execute(query);

      return result;

    } catch (error) {
      this.loggingService.error(
        `Error getting user report summary: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          filters: JSON.stringify(filters) 
        })
      );

      throw new HttpException(
        {
          message: 'Error getting user report summary',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: '/reports/users/summary',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user's own report history
   */
  @Get(REPORTS_URLS.USER_HISTORY)
  @Roles('ADMIN', 'PROGRAM_ADMIN', 'ADMINISTRATIVE', 'TEACHER', 'STUDENT')
  @ApiOperation({ 
    summary: 'Get user report history',
    description: 'Get history of reports generated by the current user' 
  })
  @ApiQuery({ 
    name: 'reportType', 
    required: false,
    description: 'Filter by report type' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false,
    type: 'number',
    description: 'Maximum number of reports to return (default: 20)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Report history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          reportType: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          metadata: { type: 'object' },
          summary: { type: 'object' },
          accessCount: { type: 'number' },
          lastAccessed: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
        },
      },
    }
  })
  async getReportHistory(
    @Query('reportType') reportType?: string,
    @Query('limit') limit?: number,
    @Request() req?: any,
  ): Promise<any[]> {
    try {
      this.loggingService.log(
        `Report history requested`,
        'UserReportsController',
        LoggingHelper.logParams({ 
          userId: req.user.id, 
          reportType, 
          limit 
        })
      );

      const query = new UserReportHistoryQuery(
        req.user.id,
        reportType,
        limit,
      );

      const result = await this.queryBus.execute(query);

      return result;

    } catch (error) {
      this.loggingService.error(
        `Error getting report history: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ 
          userId: req.user?.id,
          reportType,
          limit 
        })
      );

      throw new HttpException(
        {
          message: 'Error getting report history',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: '/reports/users/history',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get current user's own reservation statistics
   */
  @Get(REPORTS_URLS.USER_STATS)
  @Roles('TEACHER', 'STUDENT', 'ADMINISTRATIVE', 'ADMIN', 'PROGRAM_ADMIN')
  @ApiOperation({ 
    summary: 'Get my reservation statistics',
    description: 'Get reservation statistics for the current user' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalReservations: { type: 'number' },
        confirmedReservations: { type: 'number' },
        cancelledReservations: { type: 'number' },
        noShowReservations: { type: 'number' },
        utilizationRate: { type: 'number' },
        cancellationRate: { type: 'number' },
        totalHours: { type: 'number' },
        frequentResources: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              resourceName: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    }
  })
  async getMyStats(
    @Request() req: any,
  ): Promise<any> {
    try {
      this.loggingService.log(
        `User stats requested for own profile`,
        'UserReportsController',
        LoggingHelper.logParams({ userId: req.user.id })
      );

      // Create filters for current user only
      const filters: UserReportFiltersDto = {
        userIds: [req.user.id],
        includeDetails: false,
        page: 1,
        limit: 1,
      };

      const query = new UserReportQuery(
        filters,
        req.user.id,
        req.user.roles || [],
      );

      const result = await this.queryBus.execute<UserReportQuery, UserReportResponseDto>(query);

      // Return only the user's data (should be first and only item)
      const userData = result.data[0];
      if (!userData) {
        return {
          totalReservations: 0,
          confirmedReservations: 0,
          cancelledReservations: 0,
          noShowReservations: 0,
          utilizationRate: 0,
          cancellationRate: 0,
          totalHours: 0,
          frequentResources: [],
        };
      }

      return {
        totalReservations: userData.totalReservations,
        confirmedReservations: userData.confirmedReservations,
        cancelledReservations: userData.cancelledReservations,
        noShowReservations: userData.noShowReservations,
        utilizationRate: userData.utilizationRate,
        cancellationRate: userData.cancellationRate,
        totalHours: userData.totalHours,
        frequentResources: userData.frequentResources,
      };

    } catch (error) {
      this.loggingService.error(
        `Error getting user stats: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId: req.user?.id })
      );

      throw new HttpException(
        {
          message: 'Error getting user statistics',
          error: error.message,
          timestamp: new Date().toISOString(),
          path: '/reports/users/my-stats',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
