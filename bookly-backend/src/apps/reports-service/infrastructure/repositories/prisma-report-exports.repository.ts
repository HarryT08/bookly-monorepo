import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/libs/common/services/prisma.service';
import { ReportExportsRepository } from '../../domain/repositories/report-exports.repository';

@Injectable()
export class PrismaReportExportsRepository implements ReportExportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveExport(exportData: {
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    columns: string[];
    customHeaders?: string[];
    includeMetadata: boolean;
    delimiter: string;
    exportedBy: string;
    expiresAt: Date;
    sentByEmail?: boolean;
    emailAddress?: string;
  }): Promise<{
    id: string;
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    exportedBy: string;
    createdAt: Date;
    expiresAt: Date;
    sentByEmail?: boolean;
    emailAddress?: string;
  }> {
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
        delimiter: exportData.delimiter,
        exportedBy: exportData.exportedBy,
        expiresAt: exportData.expiresAt,
        sentByEmail: exportData.sentByEmail || false,
        emailAddress: exportData.emailAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      id: exportRecord.id,
      reportId: exportRecord.reportId,
      format: exportRecord.format,
      filename: exportRecord.filename,
      filePath: exportRecord.filePath,
      fileSize: exportRecord.fileSize,
      exportedBy: exportRecord.exportedBy,
      createdAt: exportRecord.createdAt,
      expiresAt: exportRecord.expiresAt,
    };
  }

  async findById(id: string): Promise<{
    id: string;
    reportId: string;
    format: string;
    filename: string;
    filePath: string;
    fileSize: number;
    exportedBy: string;
    createdAt: Date;
    expiresAt: Date;
  } | null> {
    const exportRecord = await this.prisma.reportExport.findUnique({
      where: { id },
    });

    if (!exportRecord) {
      return null;
    }

    return {
      id: exportRecord.id,
      reportId: exportRecord.reportId,
      format: exportRecord.format,
      filename: exportRecord.filename,
      filePath: exportRecord.filePath,
      fileSize: exportRecord.fileSize,
      exportedBy: exportRecord.exportedBy,
      createdAt: exportRecord.createdAt,
      expiresAt: exportRecord.expiresAt,
    };
  }

  async findByUserId(userId: string, limit = 50): Promise<Array<{
    id: string;
    reportId: string;
    format: string;
    filename: string;
    fileSize: number;
    createdAt: Date;
    expiresAt: Date;
  }>> {
    const exports = await this.prisma.reportExport.findMany({
      where: { exportedBy: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        reportId: true,
        format: true,
        filename: true,
        fileSize: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return exports;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.reportExport.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
