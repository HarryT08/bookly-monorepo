import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { 
  ExportReportQuery, 
  ExportHistoryQuery, 
  DownloadExportQuery,
  CachedReportQuery 
} from '../queries/export-report.query';
import { ReportExportsRepository, GeneratedReportsRepository } from '../../domain/repositories/generated-reports.repository';
import { ReportsRepository } from '../../domain/repositories/reports.repository';
import { ExportResponseDto } from '@dto/reports/report-response.dto';
import { ReportType, ExportFormat } from '@dto/reports/export-csv.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'json2csv';
import { LoggingHelper } from '@/libs/logging/logging.helper';

/**
 * RF-33: Handler for exporting reports to CSV and other formats
 */
@QueryHandler(ExportReportQuery)
@Injectable()
export class ExportReportHandler implements IQueryHandler<ExportReportQuery> {
  constructor(
    @Inject('ReportExportsRepository')
    private readonly exportsRepository: ReportExportsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: ExportReportQuery): Promise<ExportResponseDto> {
    const { exportConfig, reportData, userId, requestId } = query;

    try {
      this.loggingService.log(
        `Exporting report to ${exportConfig.format}`,
        'ExportReportHandler',
        LoggingHelper.logParams({ userId, reportType: exportConfig.reportType, format: exportConfig.format, requestId }),
      );

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = exportConfig.filename 
        ? `${exportConfig.filename}.${exportConfig.format.toLowerCase()}`
        : `${exportConfig.reportType.toLowerCase()}_${timestamp}.${exportConfig.format.toLowerCase()}`;

      // Create exports directory if it doesn't exist
      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const filePath = path.join(exportsDir, filename);
      let fileContent: string;
      let fileSize: number;

      // Generate file content based on format
      switch (exportConfig.format) {
        case 'CSV':
          fileContent = await this.generateCSV(reportData, exportConfig);
          break;
        case 'EXCEL':
          throw new Error('Excel export not implemented yet');
        case 'JSON':
          fileContent = JSON.stringify(reportData, null, 2);
          break;
        default:
          throw new Error(`Unsupported export format: ${exportConfig.format}`);
      }

      // Write file
      fs.writeFileSync(filePath, fileContent, 'utf8');
      fileSize = fs.statSync(filePath).size;

      // Save export record
      const exportRecord = await this.exportsRepository.saveExport({
        reportId: reportData.metadata?.reportId || 'temp',
        format: exportConfig.format,
        filename,
        filePath,
        fileSize,
        columns: exportConfig.columns || [],
        customHeaders: exportConfig.customHeaders,
        includeMetadata: exportConfig.includeMetadata ?? true,
        delimiter: exportConfig.delimiter || ',',
        exportedBy: userId,
        expiresAt: this.calculateExpirationDate(),
        sendByEmail: exportConfig.sendByEmail,
        emailAddress: exportConfig.emailAddress,
      });

      // TODO: If sendByEmail is true, send email with attachment

      const response: ExportResponseDto = {
        status: 'SUCCESS',
        downloadUrl: `/api/reports/exports/download/${exportRecord.id}`,
        filename,
        fileSize,
        recordCount: Array.isArray(reportData.data) ? reportData.data.length : 0,
        generatedAt: new Date().toISOString(),
        expiresAt: this.calculateExpirationDate().toISOString(),
      };

      this.loggingService.log(
        `Report exported successfully`,
        'ExportReportHandler',
        LoggingHelper.logParams({ 
          userId, 
          filename, 
          fileSize, 
          format: exportConfig.format,
          exportId: exportRecord.id 
        })
      );

      return response;

    } catch (error) {
      this.loggingService.error(
        `Error exporting report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, exportConfig, requestId })
      );

      return {
        status: 'FAILED',
        downloadUrl: '',
        filename: '',
        fileSize: 0,
        recordCount: 0,
        generatedAt: new Date().toISOString(),
        errorMessage: error.message,
      };
    }
  }

  private async generateCSV(reportData: any, config: any): Promise<string> {
    try {
      this.loggingService.log(
        `Generating CSV for report`,
        'ExportReportHandler',
        LoggingHelper.logParams({ reportData, config })
      );
      
      const data = Array.isArray(reportData.data) ? reportData.data : [reportData.data];
      
      if (data.length === 0) {
        return config.includeHeaders ? (config.customHeaders?.join(config.delimiter) || '') : '';
      }

      const csvOptions: any = {
        delimiter: config.delimiter || ',',
        header: config.includeHeaders ?? true,
      };

      // Use specific columns if provided
      if (config.columns && config.columns.length > 0) {
        csvOptions.fields = config.columns;
      }

      // Use custom headers if provided
      if (config.customHeaders && config.customHeaders.length > 0) {
        csvOptions.header = config.customHeaders;
      }

      let csvContent = csv.parse(data, csvOptions);

      // Add metadata if requested
      if (config.includeMetadata && reportData.metadata) {
        const metadataLines = [
          `# Reporte generado el: ${reportData.metadata.generatedAt}`,
          `# Tipo de reporte: ${reportData.metadata.reportType}`,
          `# Total de registros: ${reportData.metadata.totalRecords}`,
          `# Tiempo de ejecución: ${reportData.metadata.executionTime}ms`,
          '',
        ];

        if (reportData.metadata.filters) {
          metadataLines.splice(-1, 0, `# Filtros aplicados: ${JSON.stringify(reportData.metadata.filters)}`);
        }

        csvContent = metadataLines.join('\n') + csvContent;
      }

      return csvContent;

    } catch (error) {
      this.loggingService.error(
        `Error generating CSV: ${error.message}`,
        error.stack,
        'ExportReportHandler'
      );
      throw error;
    }
  }

  private calculateExpirationDate(): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7); // Expire in 7 days
    return expiration;
  }
}

/**
 * Handler for getting export history
 */
@QueryHandler(ExportHistoryQuery)
@Injectable()
export class ExportHistoryHandler implements IQueryHandler<ExportHistoryQuery> {
  constructor(
    @Inject('ReportExportsRepository')
    private readonly exportsRepository: ReportExportsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: ExportHistoryQuery): Promise<any[]> {
    const { userId, reportType, limit } = query;

    try {
      this.loggingService.log(
        `Getting export history for user ${userId}`,
        'ExportHistoryHandler',
        LoggingHelper.logParams({ reportType, limit })
      );

      const history = await this.exportsRepository.getUserExportHistory(
        userId,
        limit || 20
      );

      return history;

    } catch (error) {
      this.loggingService.error(
        `Error getting export history: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, reportType })
      );
      throw error;
    }
  }
}

/**
 * Handler for downloading exported files
 */
@QueryHandler(DownloadExportQuery)
@Injectable()
export class DownloadExportHandler implements IQueryHandler<DownloadExportQuery> {
  constructor(
    @Inject('ReportExportsRepository')
    private readonly exportsRepository: ReportExportsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: DownloadExportQuery): Promise<{ filePath: string; filename: string; mimeType: string }> {
    const { exportId, userId } = query;

    try {
      this.loggingService.log(
        `Processing download request for export ${exportId}`,
        'DownloadExportHandler',
        LoggingHelper.logParams({ userId, exportId })
      );

      const exportRecord = await this.exportsRepository.findById(exportId);
      
      if (!exportRecord) {
        throw new Error('Export not found');
      }

      if (!exportRecord.isAvailable) {
        throw new Error('Export is no longer available');
      }

      if (exportRecord.expiresAt && new Date(exportRecord.expiresAt) < new Date()) {
        throw new Error('Export has expired');
      }

      // Check if file exists
      if (!fs.existsSync(exportRecord.filePath)) {
        throw new Error('Export file not found on disk');
      }

      // Update download count
      await this.exportsRepository.updateDownloadCount(exportId);

      // Determine MIME type
      const mimeType = this.getMimeType(exportRecord.format);

      this.loggingService.log(
        `Export download prepared successfully`,
        'DownloadExportHandler',
        LoggingHelper.logParams({ userId, exportId, filename: exportRecord.filename })
      );

      return {
        filePath: exportRecord.filePath,
        filename: exportRecord.filename,
        mimeType,
      };

    } catch (error) {
      this.loggingService.error(
        `Error preparing export download: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, exportId })
      );
      throw error;
    }
  }

  private getMimeType(format: string): string {
    switch (format.toUpperCase()) {
      case 'CSV':
        return 'text/csv';
      case 'EXCEL':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'JSON':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}

/**
 * Handler for getting cached reports
 */
@QueryHandler(CachedReportQuery)
@Injectable()
export class CachedReportHandler implements IQueryHandler<CachedReportQuery> {
  constructor(
    @Inject('GeneratedReportsRepository')
    private readonly generatedReportsRepository: GeneratedReportsRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async execute(query: CachedReportQuery): Promise<any | null> {
    const { cacheKey, userId, userRoles } = query;

    try {
      this.loggingService.log(
        `Retrieving cached report`,
        'CachedReportHandler',
        LoggingHelper.logParams({ userId, cacheKey })
      );

      const cachedReport = await this.generatedReportsRepository.findByCacheKey(cacheKey);
      
      if (!cachedReport) {
        return null;
      }

      // Check access permissions
      const canAccess = await this.generatedReportsRepository.canUserAccessReport(
        cachedReport.id,
        userId,
        userRoles
      );

      if (!canAccess) {
        this.loggingService.warn(
          `User ${userId} attempted to access unauthorized cached report`,
          'CachedReportHandler',
          LoggingHelper.logParams({ cacheKey, reportId: cachedReport.id })
        );
        return null;
      }

      // Update access tracking
      await this.generatedReportsRepository.updateAccess(cachedReport.id, userId);

      return cachedReport.data;

    } catch (error) {
      this.loggingService.error(
        `Error retrieving cached report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, cacheKey })
      );
      return null;
    }
  }
}
