import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { ResourceImportEntity } from '@apps/resources-service/domain/entities/resource-import.entity';
import { ResourceImportRepository } from '@apps/resources-service/domain/repositories/resource-import.repository';
import { ImportStatus } from '@apps/resources-service/utils/import-status.enum';

/**
 * HITO 6 - RF-04: Prisma ResourceImport Repository Implementation
 */
@Injectable()
export class PrismaResourceImportRepository implements ResourceImportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(resourceImport: ResourceImportEntity): Promise<ResourceImportEntity> {
    const created = await this.prisma.resourceImport.create({
      data: {
        filename: resourceImport.filename,
        originalFilename: resourceImport.originalFilename,
        totalRows: resourceImport.totalRows,
        successfulRows: resourceImport.successfulRows,
        failedRows: resourceImport.failedRows,
        status: resourceImport.status,
        errors: resourceImport.errors as any,
        summary: resourceImport.summary as any,
        importedBy: resourceImport.importedBy,
        importedAt: resourceImport.importedAt,
        completedAt: resourceImport.completedAt,
      },
    });

    return this.toDomainEntity(created);
  }

  async update(id: string, resourceImport: ResourceImportEntity): Promise<ResourceImportEntity> {
    const updated = await this.prisma.resourceImport.update({
      where: { id },
      data: {
        successfulRows: resourceImport.successfulRows,
        failedRows: resourceImport.failedRows,
        status: resourceImport.status,
        errors: resourceImport.errors as any,
        summary: resourceImport.summary as any,
        completedAt: resourceImport.completedAt,
      },
    });

    return this.toDomainEntity(updated);
  }

  async findById(id: string): Promise<ResourceImportEntity | null> {
    const resourceImport = await this.prisma.resourceImport.findUnique({
      where: { id },
    });

    return resourceImport ? this.toDomainEntity(resourceImport) : null;
  }

  async findByUser(userId: string): Promise<ResourceImportEntity[]> {
    const imports = await this.prisma.resourceImport.findMany({
      where: { importedBy: userId },
      orderBy: { importedAt: 'desc' },
    });

    return imports.map(this.toDomainEntity);
  }

  async findByStatus(status: ImportStatus): Promise<ResourceImportEntity[]> {
    const imports = await this.prisma.resourceImport.findMany({
      where: { status },
      orderBy: { importedAt: 'desc' },
    });

    return imports.map(this.toDomainEntity);
  }

  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      userId?: string;
      status?: ImportStatus;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{ imports: ResourceImportEntity[]; total: number }> {
    const where: any = {};

    if (filters?.userId) {
      where.importedBy = filters.userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.importedAt = {};
      if (filters.dateFrom) {
        where.importedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.importedAt.lte = filters.dateTo;
      }
    }

    const [imports, total] = await Promise.all([
      this.prisma.resourceImport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { importedAt: 'desc' },
      }),
      this.prisma.resourceImport.count({ where }),
    ]);

    return {
      imports: imports.map(this.toDomainEntity),
      total,
    };
  }

  async findRecent(limit: number = 10): Promise<ResourceImportEntity[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const imports = await this.prisma.resourceImport.findMany({
      where: {
        importedAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { importedAt: 'desc' },
      take: limit,
    });

    return imports.map(this.toDomainEntity);
  }

  async getStatistics(userId?: string): Promise<{
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalResourcesImported: number;
    averageSuccessRate: number;
  }> {
    const where: any = {};
    if (userId) {
      where.importedBy = userId;
    }

    const [totalImports, successfulImports, failedImports, aggregations] = await Promise.all([
      this.prisma.resourceImport.count({ where }),
      this.prisma.resourceImport.count({
        where: { ...where, status: ImportStatus.COMPLETED },
      }),
      this.prisma.resourceImport.count({
        where: { ...where, status: ImportStatus.FAILED },
      }),
      this.prisma.resourceImport.aggregate({
        where,
        _sum: {
          successfulRows: true,
        },
        _avg: {
          successfulRows: true,
          totalRows: true,
        },
      }),
    ]);

    const totalResourcesImported = aggregations._sum.successfulRows || 0;
    const avgSuccessful = aggregations._avg.successfulRows || 0;
    const avgTotal = aggregations._avg.totalRows || 0;
    const averageSuccessRate = avgTotal > 0 ? (avgSuccessful / avgTotal) * 100 : 0;

    return {
      totalImports,
      successfulImports,
      failedImports,
      totalResourcesImported,
      averageSuccessRate,
    };
  }

  async deleteOldImports(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.resourceImport.deleteMany({
      where: {
        importedAt: {
          lt: cutoffDate,
        },
        status: {
          in: [ImportStatus.COMPLETED, ImportStatus.FAILED, ImportStatus.CANCELLED],
        },
      },
    });

    return result.count;
  }

  private toDomainEntity(prismaImport: any): ResourceImportEntity {
    return new ResourceImportEntity(
      prismaImport.id,
      prismaImport.filename,
      prismaImport.originalFilename,
      prismaImport.totalRows,
      prismaImport.successfulRows,
      prismaImport.failedRows,
      prismaImport.status as ImportStatus,
      prismaImport.errors,
      prismaImport.summary,
      prismaImport.importedBy,
      prismaImport.importedAt,
      prismaImport.completedAt,
    );
  }
}
