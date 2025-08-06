import { Test, TestingModule } from '@nestjs/testing';
import { ExportReportHandler } from '../../application/handlers/export-report.handler';
import { ReportsRepository } from '../../domain/repositories/reports.repository';
import { GeneratedReportsRepository, ReportExportsRepository } from '../../domain/repositories/generated-reports.repository';
import { LoggingService } from '@logging/logging.service';
import { RedisService } from '@event-bus/services/redis.service';
import { ReportsAuditService } from '../../application/services/audit.service';
import { ExportReportQuery } from '../../application/queries/export-report.query';
import { ReportType, ExportFormat } from '@dto/reports/export-csv.dto';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('ExportReportHandler', () => {
  let handler: ExportReportHandler;
  let exportRepository: jest.Mocked<ReportExportsRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockReportData = {
    data: [
      {
        resourceName: 'Aula 101',
        totalReservations: 25,
        utilizationRate: 0.85,
      },
      {
        resourceName: 'Lab 201',
        totalReservations: 15,
        utilizationRate: 0.65,
      },
    ],
    metadata: {
      reportId: 'report-123',
      generatedAt: '2024-01-01T10:00:00Z',
      totalRecords: 2,
    },
  };

  beforeEach(async () => {
    const mockExportRepository = {
      saveExport: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      updateStatus: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportReportHandler,
        {
          provide: 'ReportExportsRepository',
          useValue: mockExportRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    handler = module.get<ExportReportHandler>(ExportReportHandler);
    exportRepository = module.get('ReportExportsRepository') as jest.Mocked<ReportExportsRepository>;
    loggingService = module.get<LoggingService>(LoggingService) as jest.Mocked<LoggingService>;

    // Setup path mocks
    mockPath.join.mockImplementation((...args) => args.join('/'));
    mockPath.resolve.mockImplementation((dir) => `/app/${dir}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - CSV Export', () => {
    it('should export usage report to CSV successfully', async () => {
      // Given: Valid export configuration for usage report
      const exportConfig = {
        reportType: ReportType.USAGE,
        format: ExportFormat.CSV,
        filename: 'usage-report-2024',
        columns: ['resourceName', 'totalReservations', 'utilizationRate'],
        filters: {
          programIds: ['prog-1'],
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      };

      const query = new ExportReportQuery(
        exportConfig,
        mockReportData, // Provide report data directly
        'user-123',
        ['ADMIN'],
        'req-456'
      );

      // Mock file system operations
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 1024 } as any);

      // Mock export saving
      exportRepository.saveExport.mockResolvedValue({
        id: 'export-123',
        filename: 'usage-report-2024.csv',
        filePath: '/app/exports/usage-report-2024.csv',
      });

      // When: Handler executes the export
      const result = await handler.execute(query);

      // Then: Export should be created successfully
      expect(result).toBeDefined();
      expect(result.filename).toBe('usage-report-2024.csv');
      expect(result.status).toBe('SUCCESS');

      // And: File should be written
      expect(mockFs.writeFileSync).toHaveBeenCalled();

      // And: Export should be saved to database
      expect(exportRepository.saveExport).toHaveBeenCalledWith({
        reportId: 'report-123',
        format: ExportFormat.CSV,
        filename: 'usage-report-2024.csv',
        filePath: expect.stringContaining('usage-report-2024.csv'),
        fileSize: 1024,
        columns: exportConfig.columns,
        customHeaders: undefined,
        includeMetadata: true,
        delimiter: ',',
        exportedBy: 'user-123',
        expiresAt: expect.any(Date),
        sendByEmail: undefined,
        emailAddress: undefined,
      });

      // And: Success should be logged
      expect(loggingService.log).toHaveBeenCalledWith(
        expect.stringContaining('Report exported successfully'),
        'ExportReportHandler',
        expect.any(String)
      );
    });

    it('should handle export errors gracefully', async () => {
      // Given: Valid export configuration but file system error
      const exportConfig = {
        reportType: ReportType.USAGE,
        format: ExportFormat.CSV,
        filename: 'fs-error-export',
        columns: ['resourceName'],
        filters: { programIds: ['prog-1'] },
      };

      const query = new ExportReportQuery(
        exportConfig,
        mockReportData,
        'user-123',
        ['ADMIN'],
        'req-456'
      );

      // Mock file system to throw error
      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      // When: Handler executes the export
      const result = await handler.execute(query);
      
      // Then: Should return failed status
      expect(result.status).toBe('FAILED');
      expect(result.errorMessage).toContain('Permission denied');

      // And: Error should be logged
      expect(loggingService.error).toHaveBeenCalledWith(
        expect.stringContaining('Error exporting report'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should create exports directory if it does not exist', async () => {
      // Given: Exports directory does not exist
      const exportConfig = {
        reportType: ReportType.USAGE,
        format: ExportFormat.CSV,
        filename: 'new-dir-export',
        columns: ['resourceName'],
        filters: { programIds: ['prog-1'] },
      };

      const query = new ExportReportQuery(
        exportConfig,
        mockReportData,
        'user-123',
        ['ADMIN'],
        'req-456'
      );

      // Mock directory does not exist
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => '/app/exports');
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 512 } as any);

      // Mock export saving
      exportRepository.saveExport.mockResolvedValue({
        id: 'export-789',
        filename: 'new-dir-export.csv',
        filePath: '/app/exports/new-dir-export.csv',
      });

      // When: Handler executes the export
      const result = await handler.execute(query);

      // Then: Directory should be created
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('exports'),
        { recursive: true }
      );

      // And: Export should succeed
      expect(result).toBeDefined();
      expect(result.status).toBe('SUCCESS');
    });
  });

  // Note: CSV generation is handled internally by the handler
  // These tests would require exposing private methods or integration testing
});
