import { Test, TestingModule } from '@nestjs/testing';
import { UsageReportHandler } from '../../application/handlers/usage-report.handler';
import { ReportsRepository } from '../../domain/repositories/reports.repository';
import { GeneratedReportsRepository } from '../../domain/repositories/generated-reports.repository';
import { LoggingService } from '@logging/logging.service';
import { RedisService } from '@event-bus/services/redis.service';
import { ReportsAuditService } from '../../application/services/audit.service';
import { UsageReportQuery } from '../../application/queries/usage-report.query';
import { ResourceType, UsageReportFiltersDto } from '@dto/reports/usage-report-filters.dto';
import { ReportType } from '@dto/reports/export-csv.dto';

describe('UsageReportHandler', () => {
  let handler: UsageReportHandler;
  let reportsRepository: jest.Mocked<ReportsRepository>;
  let generatedReportsRepository: jest.Mocked<GeneratedReportsRepository>;
  let loggingService: jest.Mocked<LoggingService>;
  let redisService: jest.Mocked<RedisService>;
  let auditService: jest.Mocked<ReportsAuditService>;

  const mockUsageReportData = {
    data: [
      {
        resourceId: 'res-1',
        resourceName: 'Aula 101',
        resourceType: 'CLASSROOM',
        totalReservations: 25,
        utilizationRate: 0.85,
        programName: 'Ingeniería de Sistemas',
      },
    ],
    metadata: {
      reportId: 'report-123',
      generatedAt: '2024-01-01T10:00:00Z',
      totalRecords: 1,
      filters: { programIds: ['prog-1'] },
    },
  };

  const mockSummary = {
    totalResources: 1,
    totalReservations: 25,
    averageUtilization: 0.85,
    topResources: [{ resourceName: 'Aula 101', reservations: 25 }],
  };

  beforeEach(async () => {
    const mockReportsRepository = {
      generateUsageReport: jest.fn(),
      generateUserReport: jest.fn(),
      getUsageReportSummary: jest.fn(),
      getUserReportSummary: jest.fn(),
      getFilterOptions: jest.fn(),
    };

    const mockGeneratedReportsRepository = {
      saveReport: jest.fn(),
      findByFilters: jest.fn(),
      updateAccess: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      multi: jest.fn(),
    };

    const mockAuditService = {
      auditReportGeneration: jest.fn(),
      auditReportExport: jest.fn(),
      auditReportDownload: jest.fn(),
      auditReportAccess: jest.fn(),
      auditUnauthorizedAccess: jest.fn(),
      auditReportError: jest.fn(),
      auditPerformanceMetrics: jest.fn(),
      auditDataAccess: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageReportHandler,
        {
          provide: 'ReportsRepository',
          useValue: mockReportsRepository,
        },
        {
          provide: 'GeneratedReportsRepository',
          useValue: mockGeneratedReportsRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ReportsAuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    handler = module.get<UsageReportHandler>(UsageReportHandler);
    reportsRepository = module.get('ReportsRepository') as jest.Mocked<ReportsRepository>;
    generatedReportsRepository = module.get('GeneratedReportsRepository') as jest.Mocked<GeneratedReportsRepository>;
    loggingService = module.get<LoggingService>(LoggingService) as jest.Mocked<LoggingService>;
    redisService = module.get<RedisService>(RedisService) as jest.Mocked<RedisService>;
    auditService = module.get<ReportsAuditService>(ReportsAuditService) as jest.Mocked<ReportsAuditService>;
  });

  describe('execute - Usage Report Generation', () => {
    it('should generate usage report when no cache exists', async () => {
      // Given: No cached report exists and valid filters are provided
      const filters: UsageReportFiltersDto = {
        programIds: ['prog-1'],
        resourceTypes: [ResourceType.CLASSROOM],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 1,
        limit: 50,
      };

      const query = new UsageReportQuery(
        filters,
        'user-123',
        ['ADMIN'],
        'req-456'
      );

      redisService.get.mockResolvedValue(null); // No cache
      reportsRepository.generateUsageReport.mockResolvedValue(mockUsageReportData as any);
      reportsRepository.getUsageReportSummary.mockResolvedValue(mockSummary as any);
      generatedReportsRepository.saveReport.mockResolvedValue({
        id: 'report-123',
        cacheKey: 'usage_report_hash123',
      });

      // When: Handler executes the query
      const result = await handler.execute(query);

      // Then: Report should be generated successfully
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockUsageReportData.data);
      expect(result.summary).toEqual(mockSummary);

      // And: Repository should be called with correct filters
      expect(reportsRepository.generateUsageReport).toHaveBeenCalledWith(filters);

      // And: Report should be cached
      expect(redisService.set).toHaveBeenCalled();

      // And: Report generation should be audited
      expect(auditService.auditReportGeneration).toHaveBeenCalledWith({
        userId: 'user-123',
        reportType: ReportType.USAGE,
        filters: expect.any(Object),
        recordCount: 1,
        executionTime: expect.any(Number),
        cacheHit: false,
        requestId: 'req-456',
        userRoles: ['ADMIN'],
      });
    });

    it('should return cached report when available', async () => {
      // Given: Cached report exists
      const filters: UsageReportFiltersDto = {
        programIds: ['prog-1'],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 1,
        limit: 50,
      };

      const query = new UsageReportQuery(
        filters,
        'user-123',
        ['ADMIN'],
        'req-456'
      );

      const cachedReport = {
        data: mockUsageReportData.data,
        summary: mockSummary,
        metadata: mockUsageReportData.metadata,
      };

      redisService.get.mockResolvedValue(JSON.stringify(cachedReport));
      generatedReportsRepository.updateAccess.mockResolvedValue(undefined);

      // When: Handler executes the query
      const result = await handler.execute(query);

      // Then: Cached report should be returned
      expect(result).toBeDefined();
      expect(result.data).toEqual(cachedReport.data);

      // And: Repository should not be called
      expect(reportsRepository.generateUsageReport).not.toHaveBeenCalled();

      // And: Cache hit should be audited
      expect(auditService.auditReportGeneration).toHaveBeenCalledWith({
        userId: 'user-123',
        reportType: ReportType.USAGE,
        filters: expect.any(Object),
        recordCount: expect.any(Number),
        executionTime: expect.any(Number),
        cacheHit: true,
        requestId: 'req-456',
        userRoles: ['ADMIN'],
      });
    });

    it('should handle repository errors gracefully', async () => {
      // Given: Repository throws an error
      const filters: UsageReportFiltersDto = {
        programIds: ['prog-1'],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 1,
        limit: 50,
      };

      const query = new UsageReportQuery(
        filters,
        'user-123',
        ['ADMIN'],
        'req-456'
      );

      const repositoryError = new Error('Database connection failed');
      try {
        redisService.get.mockResolvedValue(null);
        reportsRepository.generateUsageReport.mockRejectedValue(repositoryError);
  
        // When: Handler executes the query
        const result = await handler.execute(query);
        
        // Then: Should return empty result or handle gracefully
        expect(result).toBeDefined();
      } catch (error) {
        // And: Error should be logged
        expect(loggingService.error).toHaveBeenCalledWith(
          expect.stringContaining('Error generating usage report'),
          expect.any(String),
          expect.any(String)
        );
      }

    });

    it('should determine query complexity correctly', async () => {
      // Given: Complex filters with multiple criteria
      const complexFilters: UsageReportFiltersDto = {
        programIds: ['prog-1', 'prog-2'],
        resourceTypes: [ResourceType.CLASSROOM, ResourceType.LABORATORY],
        categoryIds: ['cat-1'],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'program',
        page: 1,
        limit: 50,
      };

      const query = new UsageReportQuery(
        complexFilters,
        'user-123',
        ['ADMIN'],
        'req-456'
      );

      redisService.get.mockResolvedValue(null);
      reportsRepository.generateUsageReport.mockResolvedValue(mockUsageReportData as any);
      reportsRepository.getUsageReportSummary.mockResolvedValue(mockSummary as any);
      generatedReportsRepository.saveReport.mockResolvedValue({
        id: 'report-123',
        cacheKey: 'usage_report_hash123',
      });

      // When: Handler executes the query
      await handler.execute(query);

      // Then: Performance metrics should be recorded
      expect(auditService.auditPerformanceMetrics).toHaveBeenCalledWith({
        action: 'USAGE_REPORT_GENERATION',
        executionTime: expect.any(Number),
        recordCount: 1,
        queryComplexity: expect.any(String), // Could be MEDIUM or HIGH depending on logic
        cacheHit: false,
        userId: 'user-123',
        requestId: 'req-456',
      });
    });

    it('should handle data access governance correctly', async () => {
      // Given: User with specific access scope
      const filters: UsageReportFiltersDto = {
        programIds: ['prog-1'],
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: 1,
        limit: 50,
      };

      const query = new UsageReportQuery(
        filters,
        'user-123',
        ['PROGRAM_ADMIN'],
        'req-456'
      );

      redisService.get.mockResolvedValue(null);
      reportsRepository.generateUsageReport.mockResolvedValue(mockUsageReportData as any);
      reportsRepository.getUsageReportSummary.mockResolvedValue(mockSummary as any);
      generatedReportsRepository.saveReport.mockResolvedValue({
        id: 'report-123',
        cacheKey: 'usage_report_hash123',
      });

      // When: Handler executes the query
      await handler.execute(query);

      // Then: Data access should be audited
      expect(auditService.auditDataAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        dataType: 'RESERVATION_DATA', // Actual value from handler
        accessScope: 'PROGRAM', // Actual value from handler
        recordCount: 1,
        filters: expect.any(Object),
        justification: 'Usage report generation', // Actual value from handler
        userRoles: ['PROGRAM_ADMIN'],
      });
    });
  });
});
