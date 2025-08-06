import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { 
  UsageReportQuery, 
  UsageReportSummaryQuery, 
  ReportFilterOptionsQuery 
} from '../queries/usage-report.query';
import { UsageReportResponseDto, PaginationDto } from '@dto/reports/report-response.dto';
import * as crypto from 'crypto';
import { ReportsRepository } from '../../domain/repositories/reports.repository';
import { GeneratedReportsRepository } from '../../domain/repositories/generated-reports.repository';
import { RedisService } from '@event-bus/services/redis.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { ReportsAuditService } from '../services/audit.service';
import { ReportType } from '@/libs/dto/reports/export-csv.dto';

/**
 * RF-31: Handler for usage report generation
 * Implements caching with Redis and persistent storage
 */
@QueryHandler(UsageReportQuery)
@Injectable()
export class UsageReportHandler implements IQueryHandler<UsageReportQuery> {
  constructor(
    @Inject('ReportsRepository')
    private readonly reportsRepository: ReportsRepository,
    @Inject('GeneratedReportsRepository')
    private readonly generatedReportsRepository: GeneratedReportsRepository,
    private readonly loggingService: LoggingService,
    private readonly redisService: RedisService,
    private readonly auditService: ReportsAuditService,
  ) {}

  async execute(query: UsageReportQuery): Promise<UsageReportResponseDto> {
    const startTime = Date.now();
    const { filters, userId, userRoles, requestId } = query;

    try {
      // Generate cache key based on filters
      const cacheKey = this.generateCacheKey('usage_report', filters);
      
      this.loggingService.log(
        `Generating usage report for user ${userId}`,
        'UsageReportHandler',
        LoggingHelper.logParams({ filters, requestId, cacheKey })
      );

      // Try to get from Redis cache first
      const cachedResult = await this.getCachedReport(cacheKey);
      if (cachedResult) {
        const executionTime = Date.now() - startTime;
        
        // Audit cache hit
        this.auditService.auditReportGeneration({
          userId,
          reportType: ReportType.USAGE,
          filters,
          recordCount: Array.isArray(cachedResult.data) ? cachedResult.data.length : 1,
          executionTime,
          cacheHit: true,
          requestId,
          userRoles,
        });
        
        this.auditService.auditReportAccess({
          userId,
          reportId: cachedResult.reportId,
          reportType: ReportType.USAGE,
          accessType: 'VIEW',
          userRoles,
        });
        
        this.loggingService.log(
          `Usage report served from cache`,
          'UsageReportHandler',
          LoggingHelper.logParams({ cacheKey, userId, executionTime })
        );
        
        // Update access tracking
        await this.updateReportAccess(cachedResult.reportId, userId);
        
        return cachedResult.data;
      }

      // Generate new report
      const [reportData, summary] = await Promise.all([
        this.reportsRepository.generateUsageReport(filters),
        this.reportsRepository.getUsageReportSummary(filters),
      ]);

      const executionTime = Date.now() - startTime;

      // Build pagination
      const pagination: PaginationDto = {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: reportData.totalCount,
        totalPages: Math.ceil(reportData.totalCount / (filters.limit || 50)),
        hasNext: (filters.page || 1) * (filters.limit || 50) < reportData.totalCount,
        hasPrev: (filters.page || 1) > 1,
      };

      // Build response
      const response: UsageReportResponseDto = {
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: userId,
          reportType: 'USAGE_REPORT',
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

      // Audit new report generation
      this.auditService.auditReportGeneration({
        userId,
        reportType: ReportType.USAGE,
        filters,
        recordCount: reportData.data.length,
        executionTime,
        cacheHit: false,
        requestId,
        userRoles,
      });

      // Audit performance metrics
      this.auditService.auditPerformanceMetrics({
        action: 'USAGE_REPORT_GENERATION',
        executionTime,
        recordCount: reportData.data.length,
        cacheHit: false,
        queryComplexity: this.determineQueryComplexity(filters),
        userId,
        requestId,
      });

      // Audit data access
      this.auditService.auditDataAccess({
        userId,
        dataType: 'RESERVATION_DATA',
        accessScope: this.determineAccessScope(userRoles),
        recordCount: reportData.data.length,
        filters,
        userRoles,
        justification: 'Usage report generation',
      });

      // Save to persistent storage
      await this.saveReportToPersistentStorage(
        ReportType.USAGE,
        'Reporte de Uso de Recursos',
        userId,
        filters,
        response,
        cacheKey
      );

      this.loggingService.log(
        `Usage report generated successfully`,
        'UsageReportHandler',
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
        `Error generating usage report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, filters, requestId })
      );
      throw error;
    }
  }

  private generateCacheKey(reportType: string, filters: any): string {
    const filterString = JSON.stringify(filters, Object.keys(filters).sort());
    return crypto.createHash('md5').update(`${reportType}:${filterString}`).digest('hex');
  }

  /**
   * Determine query complexity based on filters
   */
  private determineQueryComplexity(filters: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    let complexityScore = 0;
    
    // Count active filters
    if (filters.programIds?.length) complexityScore += 1;
    if (filters.resourceTypes?.length) complexityScore += 1;
    if (filters.categories?.length) complexityScore += 1;
    if (filters.startDate || filters.endDate) complexityScore += 1;
    if (filters.groupBy?.length) complexityScore += 2;
    if (filters.includeDetails) complexityScore += 2;
    if (filters.aggregations?.length) complexityScore += 3;
    
    if (complexityScore <= 2) return 'LOW';
    if (complexityScore <= 5) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Determine data access scope based on user roles
   */
  private determineAccessScope(userRoles: string[]): 'OWN' | 'PROGRAM' | 'GLOBAL' {
    if (userRoles.includes('ADMIN') || userRoles.includes('ADMINISTRATIVE')) {
      return 'GLOBAL';
    }
    if (userRoles.includes('PROGRAM_ADMIN')) {
      return 'PROGRAM';
    }
    return 'OWN';
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
        'UsageReportHandler',
        LoggingHelper.logParams({ cacheKey })
      );
      return null;
    }
  }

  private async cacheReport(
    cacheKey: string, 
    response: UsageReportResponseDto, 
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
        'UsageReportHandler',
        LoggingHelper.logParams({ cacheKey, userId })
      );
    }
  }

  private async saveReportToPersistentStorage(
    reportType: string,
    title: string,
    userId: string,
    filters: any,
    response: UsageReportResponseDto,
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
        'UsageReportHandler',
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
        'UsageReportHandler',
        LoggingHelper.logParams({ reportId, userId })
      );
    }
  }
}

/**
 * Handler for usage report summary
 */
@QueryHandler(UsageReportSummaryQuery)
@Injectable()
export class UsageReportSummaryHandler implements IQueryHandler<UsageReportSummaryQuery> {
  constructor(
    @Inject('ReportsRepository')
    private readonly reportsRepository: ReportsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: UsageReportSummaryQuery): Promise<any> {
    const { filters, userId } = query;

    try {
      this.loggingService.log(
        `Generating usage report summary for user ${userId}`,
        'UsageReportSummaryHandler',
        LoggingHelper.logParams({ filters })
      );

      const summary = await this.reportsRepository.getUsageReportSummary(filters);

      return summary;

    } catch (error) {
      this.loggingService.error(
        `Error generating usage report summary: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, filters })
      );
      throw error;
    }
  }
}

/**
 * Handler for getting filter options
 */
@QueryHandler(ReportFilterOptionsQuery)
@Injectable()
export class ReportFilterOptionsHandler implements IQueryHandler<ReportFilterOptionsQuery> {
  constructor(
    @Inject('ReportsRepository')
    private readonly reportsRepository: ReportsRepository,
    private readonly loggingService: LoggingService,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: ReportFilterOptionsQuery): Promise<any> {
    const { filterType, userId, userType } = query;

    try {
      // Cache filter options for 1 hour
      const cacheKey = `filter_options:${filterType}:${userType || 'all'}`;
      
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached as string);
      }

      let options: any;

      switch (filterType) {
        case 'programs':
          options = await this.reportsRepository.getAvailablePrograms();
          break;
        case 'resourceTypes':
          options = await this.reportsRepository.getAvailableResourceTypes();
          break;
        case 'categories':
          options = await this.reportsRepository.getAvailableCategories();
          break;
        case 'users':
          options = await this.reportsRepository.getAvailableUsers(userType);
          break;
        default:
          throw new Error(`Unknown filter type: ${filterType}`);
      }

      // Cache for 1 hour
      await this.redisService.set(cacheKey, JSON.stringify(options), 3600);

      return options;

    } catch (error) {
      this.loggingService.error(
        `Error getting filter options: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ filterType, userId })
      );
      throw error;
    }
  }
}
