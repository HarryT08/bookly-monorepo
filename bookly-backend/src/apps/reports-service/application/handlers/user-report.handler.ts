import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Injectable, Inject } from "@nestjs/common";
import { LoggingService } from "@logging/logging.service";
import { 
  UserReportQuery, 
  UserReportSummaryQuery, 
  UserReportHistoryQuery 
} from '../queries/user-report.query';
import { ReportsRepository } from '../../domain/repositories/reports.repository';
import { GeneratedReportsRepository } from '../../domain/repositories/generated-reports.repository';
import { UserReportResponseDto } from '@dto/reports/report-response.dto';
import { PaginationMetaDto } from '@dto/common/pagination-meta.dto';
import * as crypto from 'crypto';
import { RedisService } from '@/libs/event-bus/services/redis.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';

/**
 * RF-32: Handler for user/professor report generation
 * Reports about reservations made by specific users or professors
 */
@QueryHandler(UserReportQuery)
@Injectable()
export class UserReportHandler implements IQueryHandler<UserReportQuery> {
  constructor(
    @Inject('ReportsRepository')
    private readonly reportsRepository: ReportsRepository,
    @Inject('GeneratedReportsRepository')
    private readonly generatedReportsRepository: GeneratedReportsRepository,
    private readonly loggingService: LoggingService,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: UserReportQuery): Promise<UserReportResponseDto> {
    const startTime = Date.now();
    const { filters, userId, userRoles, requestId } = query;

    try {
      // Generate cache key based on filters
      const cacheKey = this.generateCacheKey('user_report', filters);
      
      this.loggingService.log(
        `Generating user report for user ${userId}`,
        'UserReportHandler',
        LoggingHelper.logParams({ filters, requestId, cacheKey })
      );

      // Try to get from Redis cache first
      const cachedResult = await this.getCachedReport(cacheKey);
      if (cachedResult) {
        this.loggingService.log(
          `User report served from cache`,
          'UserReportHandler',
          LoggingHelper.logParams({ cacheKey, userId })
        );
        
        // Update access tracking
        await this.updateReportAccess(cachedResult.reportId, userId);
        
        return cachedResult.data;
      }

      // Generate new report
      const [reportData, summary] = await Promise.all([
        this.reportsRepository.generateUserReport(filters),
        this.reportsRepository.getUserReportSummary(filters),
      ]);

      const executionTime = Date.now() - startTime;

      // Build pagination metadata
      const pagination: PaginationMetaDto = {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: reportData.totalCount,
        totalPages: Math.ceil(reportData.totalCount / (filters.limit || 50)),
        hasNext: (filters.page || 1) * (filters.limit || 50) < reportData.totalCount,
        hasPrev: (filters.page || 1) > 1,
      };

      // Build response
      const response: UserReportResponseDto = {
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: userId,
          reportType: 'USER_RESERVATIONS_REPORT',
          filters,
          totalRecords: reportData.totalCount,
          executionTime: reportData.executionTime,
        },
        data: reportData.data,
        pagination,
        summary,
      };

      // Cache the result
      await this.cacheReport(cacheKey, response, filters, userId);

      // Save to persistent storage
      await this.saveReportToPersistentStorage(
        'USER_RESERVATIONS',
        'Reporte de Reservas por Usuario',
        userId,
        filters,
        response,
        cacheKey
      );

      this.loggingService.log(
        `User report generated successfully`,
        'UserReportHandler',
        LoggingHelper.logParams({ 
          userId, 
          executionTime, 
          recordCount: reportData.totalCount,
          cacheKey 
        })
      );

      return response;

    } catch (error) {
      this.loggingService.error(
        `Error generating user report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, filters, requestId })
      );
      throw error;
    }
  }

  private generateCacheKey(reportType: string, filters: any): string {
    const filterString = JSON.stringify(filters, Object.keys(filters).sort());
    const hash = crypto.createHash('md5').update(filterString).digest('hex');
    return `report:${reportType}:${hash}`;
  }

  private async getCachedReport(cacheKey: string): Promise<any | null> {
    try {
      // Try Redis first
      const redisData = await this.redisService.get(cacheKey);
      if (redisData) {
        return JSON.parse(redisData as string);
      }

      // Try persistent storage
      const persistentData = await this.generatedReportsRepository.findByCacheKey(cacheKey);
      if (persistentData && persistentData.isValid && 
          (!persistentData.expiresAt || new Date(persistentData.expiresAt) > new Date())) {
        
        // Restore to Redis cache
        await this.redisService.set(
          cacheKey, 
          JSON.stringify({
            reportId: persistentData.id,
            data: persistentData.data
          }),
          1800 // 30 minutes
        );
        
        return {
          reportId: persistentData.id,
          data: persistentData.data
        };
      }

      return null;
    } catch (error) {
      this.loggingService.warn(
        `Error retrieving cached report: ${error.message}`,
        LoggingHelper.logParams({ cacheKey })
      );
      return null;
    }
  }

  private async cacheReport(
    cacheKey: string, 
    response: UserReportResponseDto, 
    filters: any, 
    userId: string
  ): Promise<void> {
    try {
      const cacheData = {
        data: response,
        generatedAt: new Date().toISOString(),
        userId,
      };

      // Cache in Redis for 30 minutes
      await this.redisService.set(
        cacheKey, 
        JSON.stringify(cacheData),
        1800
      );

    } catch (error) {
      this.loggingService.warn(
        `Error caching report: ${error.message}`,
        'UserReportHandler',
        LoggingHelper.logParams({ cacheKey, userId })
      );
    }
  }

  private async saveReportToPersistentStorage(
    reportType: string,
    title: string,
    userId: string,
    filters: any,
    response: UserReportResponseDto,
    cacheKey: string
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours

      await this.generatedReportsRepository.saveReport({
        reportType,
        title,
        description: `Reporte generado con filtros: ${JSON.stringify(filters)}`,
        generatedBy: userId,
        filters,
        data: response,
        metadata: response.metadata,
        summary: response.summary,
        cacheKey,
        expiresAt,
        isPublic: false,
        allowedUsers: [userId],
        allowedRoles: ['ADMIN', 'PROGRAM_ADMIN'],
      });

    } catch (error) {
      this.loggingService.warn(
        `Error saving report to persistent storage: ${error.message}`,
        'UserReportHandler',
        LoggingHelper.logParams({ userId, cacheKey })
      );
    }
  }

  private async updateReportAccess(reportId: string, userId: string): Promise<void> {
    try {
      await this.generatedReportsRepository.updateAccess(reportId, userId);
    } catch (error) {
      this.loggingService.warn(
        `Error updating report access: ${error.message}`,
        'UserReportHandler',
        LoggingHelper.logParams({ reportId, userId })
      );
    }
  }
}

/**
 * Handler for user report summary
 */
@QueryHandler(UserReportSummaryQuery)
@Injectable()
export class UserReportSummaryHandler implements IQueryHandler<UserReportSummaryQuery> {
  constructor(
    @Inject('ReportsRepository')
    private readonly reportsRepository: ReportsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: UserReportSummaryQuery): Promise<any> {
    const { filters, userId } = query;

    try {
      this.loggingService.log(
        `Generating user report summary for user ${userId}`,
        'UserReportSummaryHandler',
        LoggingHelper.logParams({ filters })
      );

      const summary = await this.reportsRepository.getUserReportSummary(filters);

      return summary;

    } catch (error) {
      this.loggingService.error(
        `Error generating user report summary: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, filters })
      );
      throw error;
    }
  }
}

/**
 * Handler for getting user's report history
 */
@QueryHandler(UserReportHistoryQuery)
@Injectable()
export class UserReportHistoryHandler implements IQueryHandler<UserReportHistoryQuery> {
  constructor(
    @Inject('GeneratedReportsRepository')
    private readonly generatedReportsRepository: GeneratedReportsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: UserReportHistoryQuery): Promise<any[]> {
    const { userId, reportType, limit } = query;

    try {
      this.loggingService.log(
        `Getting report history for user ${userId}`,
        'UserReportHistoryHandler',
        LoggingHelper.logParams({ reportType, limit })
      );

      const history = await this.generatedReportsRepository.getReportHistory(
        userId,
        reportType,
        limit || 20
      );

      return history;

    } catch (error) {
      this.loggingService.error(
        `Error getting report history: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, reportType })
      );
      throw error;
    }
  }
}
