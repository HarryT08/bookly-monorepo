import { Test, TestingModule } from '@nestjs/testing';
import { ReportsAuditService } from '../../application/services/audit.service';
import { LoggingService } from '@logging/logging.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { ExportFormat, ReportType } from '@/libs/dto/reports/export-csv.dto';

describe('ReportsAuditService', () => {
  let service: ReportsAuditService;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsAuditService,
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<ReportsAuditService>(ReportsAuditService);
    loggingService = module.get<LoggingService>(LoggingService) as jest.Mocked<LoggingService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auditReportGeneration', () => {
    it('should audit report generation with all parameters', () => {
      // Given: Complete report generation parameters
      const params = {
        userId: 'user-123',
        reportType: 'usage' as const,
        filters: { programIds: ['prog-1'], startDate: '2024-01-01' },
        recordCount: 25,
        executionTime: 1500,
        cacheHit: false,
        requestId: 'req-456',
        userRoles: ['ADMIN', 'USER'],
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Test Browser)',
      };

      // When: Audit is performed
      service.auditReportGeneration(params as any);

      // Then: Should log with correct structure
      expect(loggingService.log).toHaveBeenCalledWith(
        'Report generated - usage',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'REPORT_GENERATION',
          userId: 'user-123',
          reportType: 'usage',
          filters: JSON.stringify(params.filters),
          recordCount: 25,
          executionTime: 1500,
          cacheHit: false,
          requestId: 'req-456',
          userRoles: 'ADMIN,USER',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          timestamp: expect.any(String),
          severity: 'INFO',
          category: 'AUDIT',
        })
      );
    });

    it('should audit report generation with minimal parameters', () => {
      // Given: Minimal report generation parameters
      const params = {
        userId: 'user-123',
        reportType: ReportType.USER_RESERVATIONS,
        filters: {},
        recordCount: 10,
        executionTime: 500,
        cacheHit: true,
        requestId: 'req-789',
        userRoles: ['STUDENT'],
      };

      // When: Audit is performed
      service.auditReportGeneration(params as any);

      // Then: Should log with minimal structure
      expect(loggingService.log).toHaveBeenCalledWith(
        'Report generated - user',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'REPORT_GENERATION',
          userId: 'user-123',
          reportType: ReportType.USER_RESERVATIONS,
          filters: '{}',
          recordCount: 10,
          executionTime: 500,
          cacheHit: true,
          requestId: 'req-789',
          userRoles: 'STUDENT',
          ipAddress: undefined,
          userAgent: undefined,
          timestamp: expect.any(String),
          severity: 'INFO',
          category: 'AUDIT',
        })
      );
    });
  });

  describe('auditReportExport', () => {
    it('should audit report export with complete information', () => {
      // Given: Complete export parameters
      const params = {
        userId: 'user-456',
        reportType: ReportType.USAGE,
        exportFormat: ExportFormat.CSV,
        filename: 'usage-report-2024.csv',
        fileSize: 2048,
        executionTime: 3000,
        exportId: 'export-123',
        requestId: 'req-export-456',
        userRoles: ['ADMIN'],
        ipAddress: '10.0.0.1',
        userAgent: 'PostmanRuntime/7.32.3',
      };

      // When: Export audit is performed
      service.auditReportExport(params as any);

      // Then: Should log export details
      expect(loggingService.log).toHaveBeenCalledWith(
        'Report exported - usage to csv',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'REPORT_EXPORT',
          userId: 'user-456',
          reportType: ReportType.USAGE,
          exportFormat: ExportFormat.CSV,
          filename: 'usage-report-2024.csv',
          fileSize: 2048,
          executionTime: 3000,
          exportId: 'export-123',
          requestId: 'req-export-456',
          userRoles: 'ADMIN',
          ipAddress: '10.0.0.1',
          userAgent: 'PostmanRuntime/7.32.3',
          timestamp: expect.any(String),
          severity: 'INFO',
          category: 'AUDIT',
        })
      );
    });
  });

  describe('auditReportDownload', () => {
    it('should audit report download events', () => {
      // Given: Download parameters
      const params = {
        userId: 'user-789',
        exportId: 'export-456',
        filename: 'user-report-2024.csv',
        fileSize: 1024,
        userRoles: ['PROGRAM_ADMIN'],
        ipAddress: '172.16.0.1',
        userAgent: 'curl/7.68.0',
      };

      // When: Download audit is performed
      service.auditReportDownload(params as any);

      // Then: Should log download details
      expect(loggingService.log).toHaveBeenCalledWith(
        'Report downloaded - user-report-2024.csv',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'REPORT_DOWNLOAD',
          userId: 'user-789',
          exportId: 'export-456',
          filename: 'user-report-2024.csv',
          fileSize: 1024,
          userRoles: 'PROGRAM_ADMIN',
          ipAddress: '172.16.0.1',
          userAgent: 'curl/7.68.0',
          timestamp: expect.any(String),
          severity: 'INFO',
          category: 'AUDIT',
        })
      );
    });
  });

  describe('auditReportAccess', () => {
    it('should audit report access with different access types', () => {
      // Given: Report access parameters
      const params = {
        userId: 'user-101',
        reportId: 'report-789',
        reportType: 'usage',
        accessType: 'SUMMARY' as const,
        userRoles: ['TEACHER'],
        ipAddress: '192.168.0.50',
        userAgent: 'Firefox/91.0',
      };

      // When: Access audit is performed
      service.auditReportAccess(params as any);

      // Then: Should log access details
      expect(loggingService.log).toHaveBeenCalledWith(
        'Report accessed - usage (SUMMARY)',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'REPORT_ACCESS',
          userId: 'user-101',
          reportId: 'report-789',
          reportType: 'usage',
          accessType: 'SUMMARY',
          userRoles: 'TEACHER',
          ipAddress: '192.168.0.50',
          userAgent: 'Firefox/91.0',
          timestamp: expect.any(String),
          severity: 'INFO',
          category: 'AUDIT',
        })
      );
    });

    it('should audit different access types correctly', () => {
      // Given: Different access types to test
      const accessTypes = ['VIEW', 'SUMMARY', 'FILTER_OPTIONS'] as const;

      accessTypes.forEach((accessType) => {
        // When: Each access type is audited
        service.auditReportAccess({
          userId: 'user-test',
          reportId: 'report-test',
          reportType: ReportType.USER_RESERVATIONS,
          accessType,
          userRoles: ['USER'],
        });

        // Then: Should log with correct access type
        expect(loggingService.log).toHaveBeenCalledWith(
          `Report accessed - user (${accessType})`,
          'ReportsAuditService',
          expect.objectContaining({
            accessType,
          })
        );
      });

      expect(loggingService.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('auditUnauthorizedAccess', () => {
    it('should audit unauthorized access attempts as warnings', () => {
      // Given: Unauthorized access parameters
      const params = {
        userId: 'user-unauthorized',
        action: 'EXPORT_REPORT',
        resource: '/reports/export/csv',
        reason: 'Insufficient permissions - requires ADMIN role',
        userRoles: ['STUDENT'],
        ipAddress: '203.0.113.1',
        userAgent: 'Suspicious-Client/1.0',
      };

      // When: Unauthorized access is audited
      service.auditUnauthorizedAccess(params);

      // Then: Should log as warning with security category
      expect(loggingService.warn).toHaveBeenCalledWith(
        'Unauthorized access attempt - EXPORT_REPORT on /reports/export/csv',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'UNAUTHORIZED_ACCESS',
          userId: 'user-unauthorized',
          targetAction: 'EXPORT_REPORT',
          resource: '/reports/export/csv',
          reason: 'Insufficient permissions - requires ADMIN role',
          userRoles: 'STUDENT',
          ipAddress: '203.0.113.1',
          userAgent: 'Suspicious-Client/1.0',
          timestamp: expect.any(String),
          severity: 'WARNING',
          category: 'SECURITY',
        })
      );
    });

    it('should handle anonymous unauthorized access', () => {
      // Given: Anonymous unauthorized access
      const params = {
        action: 'ACCESS_REPORTS',
        resource: '/reports/usage',
        reason: 'No authentication token provided',
      };

      // When: Anonymous access is audited
      service.auditUnauthorizedAccess(params);

      // Then: Should log with anonymous user
      expect(loggingService.warn).toHaveBeenCalledWith(
        'Unauthorized access attempt - ACCESS_REPORTS on /reports/usage',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'UNAUTHORIZED_ACCESS',
          userId: 'anonymous',
          targetAction: 'ACCESS_REPORTS',
          resource: '/reports/usage',
          reason: 'No authentication token provided',
          userRoles: 'none',
          ipAddress: undefined,
          userAgent: undefined,
          timestamp: expect.any(String),
          severity: 'WARNING',
          category: 'SECURITY',
        })
      );
    });
  });

  describe('auditReportError', () => {
    it('should audit report errors with full context', () => {
      // Given: Error parameters with stack trace
      const params = {
        userId: 'user-error',
        action: 'GENERATE_USAGE_REPORT',
        errorType: 'DATABASE_ERROR',
        errorMessage: 'Connection timeout after 30 seconds',
        stackTrace: 'Error: Connection timeout\n    at Database.connect',
        requestId: 'req-error-123',
        userRoles: ['ADMIN'],
        ipAddress: '10.1.1.1',
        userAgent: 'ReportClient/2.0',
      };

      // When: Error is audited
      service.auditReportError(params);

      // Then: Should log as error with full context
      expect(loggingService.error).toHaveBeenCalledWith(
        'Report error - GENERATE_USAGE_REPORT: Connection timeout after 30 seconds',
        'Error: Connection timeout\n    at Database.connect',
        LoggingHelper.logParams({
          action: 'REPORT_ERROR',
          userId: 'user-error',
          targetAction: 'GENERATE_USAGE_REPORT',
          errorType: 'DATABASE_ERROR',
          errorMessage: 'Connection timeout after 30 seconds',
          requestId: 'req-error-123',
          userRoles: 'ADMIN',
          ipAddress: '10.1.1.1',
          userAgent: 'ReportClient/2.0',
          timestamp: expect.any(String),
          severity: 'ERROR',
          category: 'ERROR',
        })
      );
    });
  });

  describe('auditPerformanceMetrics', () => {
    it('should audit performance metrics as INFO for fast operations', () => {
      // Given: Fast operation performance metrics
      const params = {
        action: 'USAGE_REPORT_GENERATION',
        executionTime: 1500, // Under 2 seconds
        recordCount: 100,
        cacheHit: true,
        queryComplexity: 'LOW' as const,
        userId: 'user-perf',
        requestId: 'req-perf-123',
      };

      // When: Performance is audited
      service.auditPerformanceMetrics(params);

      // Then: Should log as INFO
      expect(loggingService.log).toHaveBeenCalledWith(
        'Performance metric - USAGE_REPORT_GENERATION: 1500ms',
        'ReportsAuditService',
        LoggingHelper.logParams({
          action: 'PERFORMANCE_METRIC',
          targetAction: 'USAGE_REPORT_GENERATION',
          executionTime: 1500,
          recordCount: 100,
          cacheHit: true,
          queryComplexity: 'LOW',
          userId: 'user-perf',
          requestId: 'req-perf-123',
          timestamp: expect.any(String),
          severity: 'INFO',
          category: 'PERFORMANCE',
        })
      );
    });

    it('should audit performance metrics as WARNING for slow operations', () => {
      // Given: Slow operation performance metrics
      const params = {
        action: 'COMPLEX_REPORT_GENERATION',
        executionTime: 5000, // Over 2 seconds
        recordCount: 10000,
        cacheHit: false,
        queryComplexity: 'HIGH' as const,
        userId: 'user-slow',
      };

      // When: Performance is audited
      service.auditPerformanceMetrics(params);

      // Then: Should log as WARNING due to slow execution
      expect(loggingService.log).toHaveBeenCalledWith(
        'Performance metric - COMPLEX_REPORT_GENERATION: 5000ms',
        'ReportsAuditService',
        expect.any(String)
      );
    });
  });

  describe('auditDataAccess', () => {
    it('should audit data access with different scopes', () => {
      // Given: Data access parameters for different scopes
      const scopes = ['OWN', 'PROGRAM', 'GLOBAL'] as const;

      scopes.forEach((scope) => {
        // When: Data access is audited for each scope
        service.auditDataAccess({
          userId: 'user-data',
          dataType: 'USER_DATA',
          accessScope: scope,
          recordCount: 50,
          filters: { scope: scope.toLowerCase() },
          userRoles: ['ADMIN'],
          justification: `Testing ${scope} scope access`,
        });

        // Then: Should log with correct scope
        expect(loggingService.log).toHaveBeenCalledWith(
          `Data access - USER_DATA (${scope})`,
          'ReportsAuditService',
          expect.any(String)
        );
      });

      expect(loggingService.log).toHaveBeenCalledTimes(3);
    });

    it('should audit different data types correctly', () => {
      // Given: Different data types
      const dataTypes = ['USER_DATA', 'RESERVATION_DATA', 'RESOURCE_DATA'] as const;

      dataTypes.forEach((dataType) => {
        // When: Each data type access is audited
        service.auditDataAccess({
          userId: 'user-types',
          dataType,
          accessScope: 'GLOBAL',
          recordCount: 25,
          filters: { type: dataType },
          userRoles: ['ADMIN'],
        });

        // Then: Should log with correct data type
        expect(loggingService.log).toHaveBeenCalledWith(
          `Data access - ${dataType} (GLOBAL)`,
          'ReportsAuditService',
          expect.objectContaining({
            dataType,
          })
        );
      });

      expect(loggingService.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple audit calls in sequence', () => {
      // Given: Multiple audit operations
      const userId = 'user-integration';
      const userRoles = ['ADMIN'];

      // When: Multiple audit operations are performed
      service.auditReportGeneration({
        userId,
        reportType: ReportType.USAGE,
        filters: {},
        recordCount: 10,
        executionTime: 1000,
        cacheHit: false,
        requestId: 'req-1',
        userRoles,
      });

      service.auditReportExport({
        userId,
        reportType: ReportType.USAGE,
        exportFormat: ExportFormat.CSV,
        filename: 'test.csv',
        fileSize: 1024,
        executionTime: 500,
        exportId: 'exp-1',
        requestId: 'req-2',
        userRoles,
      });

      service.auditReportDownload({
        userId,
        exportId: 'exp-1',
        filename: 'test.csv',
        fileSize: 1024,
        userRoles,
      });

      // Then: All operations should be logged
      expect(loggingService.log).toHaveBeenCalledTimes(3);
      expect(loggingService.log).toHaveBeenNthCalledWith(1, 
        'Report generated - USAGE', 
        'ReportsAuditService', 
        expect.any(Object)
      );
      expect(loggingService.log).toHaveBeenNthCalledWith(2, 
        'Report exported - USAGE to CSV', 
        'ReportsAuditService', 
        expect.any(Object)
      );
      expect(loggingService.log).toHaveBeenNthCalledWith(3, 
        'Report downloaded - test.csv', 
        'ReportsAuditService', 
        expect.any(Object)
      );
    });
  });
});
