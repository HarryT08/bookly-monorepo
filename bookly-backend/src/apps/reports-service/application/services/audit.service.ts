import { Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { ExportFormat, ReportType } from '@/libs/dto/reports/export-csv.dto';

/**
 * Audit Service for Reports
 * Handles structured logging and auditing of all report-related actions
 * Implements comprehensive audit trail for RF-31, RF-32, RF-33 compliance
 */
@Injectable()
export class ReportsAuditService {
  constructor(
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Audit report generation action
   */
  auditReportGeneration(params: {
    userId: string;
    reportType: ReportType.USAGE | ReportType.USER_RESERVATIONS;
    filters: any;
    recordCount: number;
    executionTime: number;
    cacheHit: boolean;
    requestId: string;
    userRoles: string[];
    ipAddress?: string;
    userAgent?: string;
  }): void {
    this.loggingService.log(
      `Report generated - ${params.reportType}`,
      'ReportsAuditService',
      LoggingHelper.logParams({
        action: 'REPORT_GENERATION',
        userId: params.userId,
        reportType: params.reportType,
        filters: JSON.stringify(params.filters),
        recordCount: params.recordCount,
        executionTime: params.executionTime,
        cacheHit: params.cacheHit,
        requestId: params.requestId,
        userRoles: params.userRoles.join(','),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        category: 'AUDIT',
      })
    );
  }

  /**
   * Audit report export action
   */
  auditReportExport(params: {
    userId: string;
    reportType: ReportType.USAGE | ReportType.USER_RESERVATIONS;
    exportFormat: ExportFormat;
    filename: string;
    fileSize: number;
    executionTime: number;
    exportId: string;
    requestId: string;
    userRoles: string[];
    ipAddress?: string;
    userAgent?: string;
  }): void {
    this.loggingService.log(
      `Report exported - ${params.reportType} to ${params.exportFormat}`,
      'ReportsAuditService',
      LoggingHelper.logParams({
        action: 'REPORT_EXPORT',
        userId: params.userId,
        reportType: params.reportType,
        exportFormat: params.exportFormat,
        filename: params.filename,
        fileSize: params.fileSize,
        executionTime: params.executionTime,
        exportId: params.exportId,
        requestId: params.requestId,
        userRoles: params.userRoles.join(','),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        category: 'AUDIT',
      })
    );
  }

  /**
   * Audit report download action
   */
  auditReportDownload(params: {
    userId: string;
    exportId: string;
    filename: string;
    fileSize: number;
    userRoles: string[];
    ipAddress?: string;
    userAgent?: string;
  }): void {
    this.loggingService.log(
      `Report downloaded - ${params.filename}`,
      'ReportsAuditService',
      LoggingHelper.logParams({
        action: 'REPORT_DOWNLOAD',
        userId: params.userId,
        exportId: params.exportId,
        filename: params.filename,
        fileSize: params.fileSize,
        userRoles: params.userRoles.join(','),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        category: 'AUDIT',
      })
    );
  }

  /**
   * Audit report access action (viewing cached reports)
   */
  auditReportAccess(params: {
    userId: string;
    reportId: string;
    reportType: ReportType;
    accessType: 'VIEW' | 'SUMMARY' | 'FILTER_OPTIONS';
    userRoles: string[];
    ipAddress?: string;
    userAgent?: string;
  }): void {
    this.loggingService.log(
      `Report accessed - ${params.reportType} (${params.accessType})`,
      'ReportsAuditService',
      LoggingHelper.logParams({
        action: 'REPORT_ACCESS',
        userId: params.userId,
        reportId: params.reportId,
        reportType: params.reportType,
        accessType: params.accessType,
        userRoles: params.userRoles.join(','),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        category: 'AUDIT',
      })
    );
  }

  /**
   * Audit unauthorized access attempts
   */
  auditUnauthorizedAccess(params: {
    userId?: string;
    action: string;
    resource: string;
    reason: string;
    userRoles?: string[];
    ipAddress?: string;
    userAgent?: string;
  }): void {
    this.loggingService.warn(
      `Unauthorized access attempt - ${params.action} on ${params.resource}`,
      'ReportsAuditService',
      LoggingHelper.logParams({
        action: 'UNAUTHORIZED_ACCESS',
        userId: params.userId || 'anonymous',
        targetAction: params.action,
        resource: params.resource,
        reason: params.reason,
        userRoles: params.userRoles?.join(',') || 'none',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'WARNING',
        category: 'SECURITY',
      })
    );
  }

  /**
   * Audit report errors
   */
  auditReportError(params: {
    userId: string;
    action: string;
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    requestId?: string;
    userRoles: string[];
    ipAddress?: string;
    userAgent?: string;
  }): void {
    this.loggingService.error(
      `Report error - ${params.action}: ${params.errorMessage}`,
      params.stackTrace,
      LoggingHelper.logParams({
        action: 'REPORT_ERROR',
        userId: params.userId,
        targetAction: params.action,
        errorType: params.errorType,
        errorMessage: params.errorMessage,
        requestId: params.requestId,
        userRoles: params.userRoles.join(','),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'ERROR',
        category: 'ERROR',
      })
    );
  }

  /**
   * Audit performance metrics
   */
  auditPerformanceMetrics(params: {
    action: string;
    executionTime: number;
    recordCount?: number;
    cacheHit?: boolean;
    queryComplexity?: 'LOW' | 'MEDIUM' | 'HIGH';
    userId: string;
    requestId?: string;
  }): void {
    const severity = params.executionTime > 2000 ? 'WARNING' : 'INFO';
    
    this.loggingService.log(
      `Performance metric - ${params.action}: ${params.executionTime}ms`,
      'ReportsAuditService',
      LoggingHelper.logParams({
        action: 'PERFORMANCE_METRIC',
        targetAction: params.action,
        executionTime: params.executionTime,
        recordCount: params.recordCount,
        cacheHit: params.cacheHit,
        queryComplexity: params.queryComplexity,
        userId: params.userId,
        requestId: params.requestId,
        timestamp: new Date().toISOString(),
        severity,
        category: 'PERFORMANCE',
      })
    );
  }

  /**
   * Audit data access patterns for compliance
   */
  auditDataAccess(params: {
    userId: string;
    dataType: 'USER_DATA' | 'RESERVATION_DATA' | 'RESOURCE_DATA';
    accessScope: 'OWN' | 'PROGRAM' | 'GLOBAL';
    recordCount: number;
    filters: any;
    userRoles: string[];
    justification?: string;
  }): void {
    this.loggingService.log(
      `Data access - ${params.dataType} (${params.accessScope})`,
      'ReportsAuditService',
      LoggingHelper.logParams({
        action: 'DATA_ACCESS',
        userId: params.userId,
        dataType: params.dataType,
        accessScope: params.accessScope,
        recordCount: params.recordCount,
        filters: JSON.stringify(params.filters),
        userRoles: params.userRoles.join(','),
        justification: params.justification,
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        category: 'DATA_GOVERNANCE',
      })
    );
  }
}
