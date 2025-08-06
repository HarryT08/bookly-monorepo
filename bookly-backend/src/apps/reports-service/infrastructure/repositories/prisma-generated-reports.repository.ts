import { Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';
import { GeneratedReportsRepository, ReportExportsRepository } from '../../domain/repositories/generated-reports.repository';
import { LoggingHelper } from '@/libs/logging/logging.helper';
import { PrismaService } from '@/libs/common/services/prisma.service';

/**
 * Prisma implementation of GeneratedReportsRepository
 * Handles persistent storage of generated reports for caching and history
 */
@Injectable()
export class PrismaGeneratedReportsRepository implements GeneratedReportsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Save a generated report to persistent storage
   */
  async saveReport(reportData: {
    reportType: string;
    title: string;
    description?: string;
    generatedBy: string;
    filters: any;
    parameters?: any;
    data: any;
    metadata: any;
    summary?: any;
    cacheKey: string;
    expiresAt?: Date;
    isPublic?: boolean;
    allowedUsers?: string[];
    allowedRoles?: string[];
  }): Promise<{ id: string; cacheKey: string }> {
    try {
      const report = await this.prisma.generatedReport.create({
        data: {
          reportType: reportData.reportType,
          title: reportData.title,
          description: reportData.description,
          generatedBy: reportData.generatedBy,
          filters: reportData.filters,
          parameters: reportData.parameters || {},
          data: reportData.data,
          metadata: reportData.metadata,
          summary: reportData.summary || {},
          cacheKey: reportData.cacheKey,
          expiresAt: reportData.expiresAt,
          isPublic: reportData.isPublic || false,
          allowedUsers: reportData.allowedUsers || [],
          allowedRoles: reportData.allowedRoles || [],
          status: 'COMPLETED',
          isValid: true,
          accessCount: 0,
        },
      });

      this.loggingService.log(
        `Report saved to persistent storage`,
        'PrismaGeneratedReportsRepository',
        LoggingHelper.logParams({ 
          reportId: report.id, 
          reportType: reportData.reportType,
          cacheKey: reportData.cacheKey 
        })
      );

      return { id: report.id, cacheKey: report.cacheKey };

    } catch (error) {
      this.loggingService.error(
        `Error saving report to persistent storage: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ reportType: reportData.reportType, cacheKey: reportData.cacheKey })
      );
      throw error;
    }
  }

  /**
   * Find a report by cache key
   */
  async findByCacheKey(cacheKey: string): Promise<any | null> {
    try {
      const report = await this.prisma.generatedReport.findUnique({
        where: { cacheKey },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (report) {
        this.loggingService.log(
          `Report found by cache key`,
          'PrismaGeneratedReportsRepository',
          LoggingHelper.logParams({ cacheKey, reportId: report.id })
        );
      }

      return report;

    } catch (error) {
      this.loggingService.error(
        `Error finding report by cache key: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ cacheKey })
      );
      return null;
    }
  }

  /**
   * Find reports by user and filters
   */
  async findByUserAndFilters(
    userId: string,
    reportType: string,
    filters?: any,
  ): Promise<any[]> {
    try {
      const reports = await this.prisma.generatedReport.findMany({
        where: {
          generatedBy: userId,
          reportType,
          isValid: true,
          ...(filters && {
            filters: {
              equals: filters,
            },
          }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.loggingService.log(
        `Found ${reports.length} reports for user`,
        'PrismaGeneratedReportsRepository',
        LoggingHelper.logParams({ userId, reportType, count: reports.length })
      );

      return reports;

    } catch (error) {
      this.loggingService.error(
        `Error finding reports by user and filters: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, reportType })
      );
      return [];
    }
  }

  /**
   * Update report access count and last accessed time
   */
  async updateAccess(reportId: string, userId: string): Promise<void> {
    try {
      await this.prisma.generatedReport.update({
        where: { id: reportId },
        data: {
          accessCount: {
            increment: 1,
          },
          lastAccessed: new Date(),
        },
      });

      // Create access log
      await this.prisma.reportAccessLog.create({
        data: {
          reportId,
          accessedBy: userId,
          accessType: 'VIEW',
          accessedAt: new Date(),
        },
      });

      this.loggingService.log(
        `Report access updated`,
        'PrismaGeneratedReportsRepository',
        LoggingHelper.logParams({ reportId, userId })
      );

    } catch (error) {
      this.loggingService.warn(
        `Error updating report access: ${error.message}`,
        'PrismaGeneratedReportsRepository',
        LoggingHelper.logParams({ reportId, userId })
      );
    }
  }

  /**
   * Mark report as invalid (for cache invalidation)
   */
  async invalidateReport(reportId: string): Promise<void> {
    try {
      await this.prisma.generatedReport.update({
        where: { id: reportId },
        data: {
          isValid: false,
          status: 'EXPIRED',
        },
      });

      this.loggingService.log(
        `Report invalidated`,
        'PrismaGeneratedReportsRepository',
        LoggingHelper.logParams({ reportId })
      );

    } catch (error) {
      this.loggingService.error(
        `Error invalidating report: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ reportId })
      );
      throw error;
    }
  }

  /**
   * Clean up expired reports
   */
  async cleanupExpiredReports(): Promise<number> {
    try {
      const result = await this.prisma.generatedReport.updateMany({
        where: {
          OR: [
            {
              expiresAt: {
                lte: new Date(),
              },
            },
            {
              createdAt: {
                lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days old
              },
            },
          ],
          isValid: true,
        },
        data: {
          isValid: false,
          status: 'EXPIRED',
        },
      });

      this.loggingService.log(
        `Cleaned up ${result.count} expired reports`,
        'PrismaGeneratedReportsRepository',
        LoggingHelper.logParams({ count: result.count })
      );

      return result.count;

    } catch (error) {
      this.loggingService.error(
        `Error cleaning up expired reports: ${error.message}`,
        error.stack,
        'PrismaGeneratedReportsRepository'
      );
      return 0;
    }
  }

  /**
   * Get report history for a user
   */
  async getReportHistory(
    userId: string,
    reportType?: string,
    limit?: number,
  ): Promise<any[]> {
    try {
      const reports = await this.prisma.generatedReport.findMany({
        where: {
          generatedBy: userId,
          ...(reportType && { reportType }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit || 20,
        select: {
          id: true,
          reportType: true,
          title: true,
          description: true,
          createdAt: true,
          metadata: true,
          summary: true,
          accessCount: true,
          lastAccessed: true,
          status: true,
        },
      });

      this.loggingService.log(
        `Retrieved report history for user`,
        'PrismaGeneratedReportsRepository',
        LoggingHelper.logParams({ userId, reportType, count: reports.length })
      );

      return reports;

    } catch (error) {
      this.loggingService.error(
        `Error getting report history: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId, reportType })
      );
      return [];
    }
  }

  /**
   * Check if user can access report
   */
  async canUserAccessReport(reportId: string, userId: string, userRoles: string[]): Promise<boolean> {
    try {
      const report = await this.prisma.generatedReport.findUnique({
        where: { id: reportId },
        select: {
          generatedBy: true,
          isPublic: true,
          allowedUsers: true,
          allowedRoles: true,
        },
      });

      if (!report) {
        return false;
      }

      // Owner can always access
      if (report.generatedBy === userId) {
        return true;
      }

      // Public reports can be accessed by anyone
      if (report.isPublic) {
        return true;
      }

      // Check if user is in allowed users list
      if (report.allowedUsers.includes(userId)) {
        return true;
      }

      // Check if user has any of the allowed roles
      if (report.allowedRoles.some(role => userRoles.includes(role))) {
        return true;
      }

      return false;

    } catch (error) {
      this.loggingService.error(
        `Error checking report access: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ reportId, userId })
      );
      return false;
    }
  }
}

/**
 * Prisma implementation of ReportExportsRepository
 * Handles export file tracking and management
 */
@Injectable()
export class PrismaReportExportsRepository implements ReportExportsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Save export information
   */
  async saveExport(exportData: {
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    columns: string[];
    customHeaders?: string[];
    includeMetadata: boolean;
    delimiter?: string;
    exportedBy: string;
    expiresAt?: Date;
    sendByEmail?: boolean;
    emailAddress?: string;
  }): Promise<{ id: string; filename: string; filePath: string }> {
    try {
      const exportRecord = await this.prisma.reportExport.create({
        data: {
          reportId: exportData.reportId,
          format: exportData.format,
          filename: exportData.filename,
          filePath: exportData.filePath,
          fileSize: exportData.fileSize,
          columns: exportData.columns,
          customHeaders: exportData.customHeaders || [],
          includeMetadata: exportData.includeMetadata,
          delimiter: exportData.delimiter || ',',
          exportedBy: exportData.exportedBy,
          expiresAt: exportData.expiresAt,
          sentByEmail: exportData.sendByEmail || false,
          emailAddress: exportData.emailAddress,
          downloadCount: 0,
          isAvailable: true,
        },
      });

      this.loggingService.log(
        `Export record saved`,
        'PrismaReportExportsRepository',
        LoggingHelper.logParams({ 
          exportId: exportRecord.id, 
          filename: exportData.filename,
          format: exportData.format 
        })
      );

      return {
        id: exportRecord.id,
        filename: exportRecord.filename,
        filePath: exportRecord.filePath,
      };

    } catch (error) {
      this.loggingService.error(
        `Error saving export record: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ filename: exportData.filename })
      );
      throw error;
    }
  }

  /**
   * Find export by ID
   */
  async findById(exportId: string): Promise<any | null> {
    try {
      const exportRecord = await this.prisma.reportExport.findUnique({
        where: { id: exportId },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          report: {
            select: {
              title: true,
              reportType: true,
            },
          },
        },
      });

      return exportRecord;

    } catch (error) {
      this.loggingService.error(
        `Error finding export by ID: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ exportId })
      );
      return null;
    }
  }

  /**
   * Find exports by report ID
   */
  async findByReportId(reportId: string): Promise<any[]> {
    try {
      const exports = await this.prisma.reportExport.findMany({
        where: { reportId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return exports;

    } catch (error) {
      this.loggingService.error(
        `Error finding exports by report ID: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ reportId })
      );
      return [];
    }
  }

  /**
   * Update download count
   */
  async updateDownloadCount(exportId: string): Promise<void> {
    try {
      await this.prisma.reportExport.update({
        where: { id: exportId },
        data: {
          downloadCount: {
            increment: 1,
          },
          lastDownload: new Date(),
        },
      });

      this.loggingService.log(
        `Export download count updated`,
        'PrismaReportExportsRepository',
        LoggingHelper.logParams({ exportId })
      );

    } catch (error) {
      this.loggingService.warn(
        `Error updating download count: ${error.message}`,
        'PrismaReportExportsRepository',
        LoggingHelper.logParams({ exportId })
      );
    }
  }

  /**
   * Mark export as unavailable
   */
  async markUnavailable(exportId: string): Promise<void> {
    try {
      await this.prisma.reportExport.update({
        where: { id: exportId },
        data: {
          isAvailable: false,
        },
      });

      this.loggingService.log(
        `Export marked as unavailable`,
        'PrismaReportExportsRepository',
        LoggingHelper.logParams({ exportId })
      );

    } catch (error) {
      this.loggingService.error(
        `Error marking export as unavailable: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ exportId })
      );
      throw error;
    }
  }

  /**
   * Clean up expired exports
   */
  async cleanupExpiredExports(): Promise<number> {
    try {
      const result = await this.prisma.reportExport.updateMany({
        where: {
          OR: [
            {
              expiresAt: {
                lte: new Date(),
              },
            },
            {
              createdAt: {
                lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days old
              },
            },
          ],
          isAvailable: true,
        },
        data: {
          isAvailable: false,
        },
      });

      this.loggingService.log(
        `Cleaned up ${result.count} expired exports`,
        'PrismaReportExportsRepository',
        LoggingHelper.logParams({ count: result.count })
      );

      return result.count;

    } catch (error) {
      this.loggingService.error(
        `Error cleaning up expired exports: ${error.message}`,
        error.stack,
        'PrismaReportExportsRepository'
      );
      return 0;
    }
  }

  /**
   * Get user's export history
   */
  async getUserExportHistory(userId: string, limit?: number): Promise<any[]> {
    try {
      const exports = await this.prisma.reportExport.findMany({
        where: {
          exportedBy: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit || 20,
        include: {
          report: {
            select: {
              title: true,
              reportType: true,
            },
          },
        },
      });

      this.loggingService.log(
        `Retrieved export history for user`,
        'PrismaReportExportsRepository',
        LoggingHelper.logParams({ userId, count: exports.length })
      );

      return exports;

    } catch (error) {
      this.loggingService.error(
        `Error getting user export history: ${error.message}`,
        error.stack,
        LoggingHelper.logParams({ userId })
      );
      return [];
    }
  }
}
