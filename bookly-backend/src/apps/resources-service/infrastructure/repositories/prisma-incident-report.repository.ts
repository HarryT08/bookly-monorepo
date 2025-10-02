import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@libs/common/services/prisma.service';
import { 
  IncidentReportRepository,
  IncidentReportFilters,
  IncidentReportSortOptions,
  IncidentReportPagination,
  IncidentReportQueryResult,
  IncidentReportStatistics
} from '@apps/resources-service/domain/repositories/incident-report.repository';
import { IncidentReportEntity } from '@apps/resources-service/domain/entities/incident-report.entity';

@Injectable()
export class PrismaIncidentReportRepository extends IncidentReportRepository {
  private readonly logger = new Logger(PrismaIncidentReportRepository.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  // Helper method to map Prisma model to domain entity
  private mapToEntity(model: any): IncidentReportEntity {
    return new IncidentReportEntity(
      model.id,
      model.resourceId,
      model.reportedBy,
      model.type,
      model.severity,
      model.title,
      model.description,
      model.location,
      model.reportedAt,
      model.reportedAt,
      model.affectedUsers,
      model.estimatedCost,
      0,
      model.status,
      model.priority,
      model.assignedTo,
      model.resolutionNotes,
      model.resolvedAt,
      model.preventiveMeasures,
      [...(model.photos || []), ...(model.documents || [])],
      model.witnesses || [],
      [],
      false,
      undefined,
      model.followUpRequired || false,
      model.followUpDate,
      undefined,
      false,
      undefined,
      false,
      undefined,
      false,
      undefined,
      undefined,
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      0,
      [],
      model.createdAt,
      model.updatedAt,
      model.reportedBy,
      model.reportedBy
    );
  }

  // Helper method to build where clause
  private buildWhereClause(filters: IncidentReportFilters): any {
    const where: any = {};
    
    if (filters?.resourceId) where.resourceId = filters.resourceId;
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.incidentType) where.type = filters.incidentType;
    if (filters?.reportedBy) where.reportedBy = filters.reportedBy;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.incidentDateFrom && filters?.incidentDateTo) {
      where.reportedAt = {
        gte: filters.incidentDateFrom,
        lte: filters.incidentDateTo
      };
    } else if (filters?.incidentDateFrom) {
      where.reportedAt = { gte: filters.incidentDateFrom };
    } else if (filters?.incidentDateTo) {
      where.reportedAt = { lte: filters.incidentDateTo };
    }
    if (filters?.followUpRequired !== undefined) where.followUpRequired = filters.followUpRequired;
    if (filters?.tags && filters.tags.length > 0) {
      // Since Prisma schema doesn't have tags field, we'll ignore this filter for now
    }
    
    return where;
  }

  // CRUD Operations
  async create(incidentReport: IncidentReportEntity): Promise<IncidentReportEntity> {
    this.logger.log(`Creating incident report for resource: ${incidentReport.resourceId}`);
    
    const created = await this.prisma.incidentReport.create({
      data: {
        title: incidentReport.title,
        description: incidentReport.description,
        type: incidentReport.incidentType,
        severity: incidentReport.severity,
        status: incidentReport.status,
        priority: incidentReport.priority,
        resourceId: incidentReport.resourceId,
        reportedBy: incidentReport.reportedBy,
        reportedAt: incidentReport.incidentDate,
        assignedTo: incidentReport.assignedTo,
        assignedAt: incidentReport.assignedTo ? new Date() : null,
        location: incidentReport.location,
        witnesses: incidentReport.witnesses || [],
        photos: incidentReport.attachments?.filter(a => a.includes('.jpg') || a.includes('.png')) || [],
        documents: incidentReport.attachments?.filter(a => !a.includes('.jpg') && !a.includes('.png')) || [],
        estimatedCost: incidentReport.estimatedCost,
        resolutionNotes: incidentReport.resolution,
        resolvedAt: incidentReport.resolutionDate,
        preventiveMeasures: incidentReport.preventiveMeasures,
        followUpRequired: incidentReport.followUpRequired,
        followUpDate: incidentReport.followUpDate,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<IncidentReportEntity | null> {
    const incidentReport = await this.prisma.incidentReport.findUnique({
      where: { id },
    });

    return incidentReport ? this.mapToEntity(incidentReport) : null;
  }

  async findAll(
    filters?: IncidentReportFilters,
    sort?: IncidentReportSortOptions,
    pagination?: IncidentReportPagination
  ): Promise<IncidentReportQueryResult> {
    const where = this.buildWhereClause(filters);
    const orderBy = sort ? { [sort.field]: sort.direction as 'asc' | 'desc' } : { reportedAt: 'desc' as const };
    const skip = pagination?.page && pagination?.limit ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit || 50;

    const [reports, total] = await Promise.all([
      this.prisma.incidentReport.findMany({ where, orderBy, skip, take }),
      this.prisma.incidentReport.count({ where })
    ]);

    return {
      reports: reports.map(r => this.mapToEntity(r)),
      total,
      page: pagination?.page || 1,
      limit: take,
      totalPages: Math.ceil(total / take)
    };
  }

  async update(id: string, incidentReport: IncidentReportEntity): Promise<IncidentReportEntity> {
    const updated = await this.prisma.incidentReport.update({
      where: { id },
      data: {
        title: incidentReport.title,
        description: incidentReport.description,
        type: incidentReport.incidentType,
        severity: incidentReport.severity,
        status: incidentReport.status,
        priority: incidentReport.priority,
        assignedTo: incidentReport.assignedTo,
        location: incidentReport.location,
        witnesses: incidentReport.witnesses || [],
        photos: incidentReport.attachments?.filter(a => a.includes('.jpg') || a.includes('.png')) || [],
        documents: incidentReport.attachments?.filter(a => !a.includes('.jpg') && !a.includes('.png')) || [],
        estimatedCost: incidentReport.estimatedCost,
        resolutionNotes: incidentReport.resolution,
        resolvedAt: incidentReport.resolutionDate,
        preventiveMeasures: incidentReport.preventiveMeasures,
        followUpRequired: incidentReport.followUpRequired,
        followUpDate: incidentReport.followUpDate,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.incidentReport.delete({ where: { id } });
  }

  // Métodos de consulta específicos
  async findByResourceId(resourceId: string): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: { resourceId },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findByReporter(reportedBy: string): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: { reportedBy },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findByAssignee(assignedTo: string): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: { assignedTo },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findByStatus(status: string): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: { status },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findBySeverity(severity: string): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: { severity },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findByIncidentType(incidentType: string): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: { type: incidentType },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        reportedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  // Missing methods from abstract interface
  async findOverdue(): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        status: { not: 'RESOLVED' },
        followUpRequired: true,
        followUpDate: { lt: new Date() }
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findByTags(tags: string[]): Promise<IncidentReportEntity[]> {
    // Since Prisma schema doesn't have tags field, return empty array
    return [];
  }

  async findSimilarIncidents(resourceId: string, incidentType: string, daysBack?: number): Promise<IncidentReportEntity[]> {
    const dateThreshold = daysBack ? new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) : undefined;
    const where: any = { resourceId, type: incidentType };
    if (dateThreshold) where.reportedAt = { gte: dateThreshold };
    
    const reports = await this.prisma.incidentReport.findMany({
      where,
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findEscalatedIncidents(): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        OR: [
          { priority: 'HIGH' },
          { severity: 'CRITICAL' }
        ]
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findDelayedResolutions(daysThreshold?: number): Promise<IncidentReportEntity[]> {
    const threshold = daysThreshold || 7;
    const dateThreshold = new Date(Date.now() - threshold * 24 * 60 * 60 * 1000);
    
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        status: { notIn: ['RESOLVED', 'CLOSED'] },
        reportedAt: { lt: dateThreshold }
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  // Métodos requeridos por la interfaz abstracta - implementaciones stub o funcionales
  async findRequiringAttention(): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        OR: [
          { priority: 'HIGH' },
          { severity: { in: ['HIGH', 'CRITICAL'] } },
          { followUpRequired: true }
        ]
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findWithFinancialImpact(): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        estimatedCost: { gt: 0 }
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findRequiringFollowUp(): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: { followUpRequired: true },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findRequiringMaintenance(): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        OR: [
          { type: 'MAINTENANCE' },
          { type: 'EQUIPMENT_FAILURE' }
        ]
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findWithInsuranceClaims(): Promise<IncidentReportEntity[]> { return []; }
  async findWithPoliceReports(): Promise<IncidentReportEntity[]> { return []; }
  async findRecurringIncidents(): Promise<IncidentReportEntity[]> { return []; }
  
  async findRecentIncidents(days: number = 7): Promise<IncidentReportEntity[]> {
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const reports = await this.prisma.incidentReport.findMany({
      where: { reportedAt: { gte: dateThreshold } },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findIncidentsThisMonth(): Promise<IncidentReportEntity[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const reports = await this.prisma.incidentReport.findMany({
      where: { reportedAt: { gte: startOfMonth } },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findIncidentsThisWeek(): Promise<IncidentReportEntity[]> {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const reports = await this.prisma.incidentReport.findMany({
      where: { reportedAt: { gte: startOfWeek } },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findUnassignedIncidents(): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        OR: [
          { assignedTo: null },
          { assignedTo: '' }
        ]
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async findRelatedIncidents(incidentId: string): Promise<IncidentReportEntity[]> {
    // Find incidents for the same resource within the last 30 days
    const incident = await this.prisma.incidentReport.findUnique({ where: { id: incidentId } });
    if (!incident) return [];
    
    const dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        resourceId: incident.resourceId,
        id: { not: incidentId },
        reportedAt: { gte: dateThreshold }
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  // Statistics and reporting methods
  async getStatistics(
    filters?: IncidentReportFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<IncidentReportStatistics> {
    const where = this.buildWhereClause(filters || {});
    if (dateFrom) where.reportedAt = { ...where.reportedAt, gte: dateFrom };
    if (dateTo) where.reportedAt = { ...where.reportedAt, lte: dateTo };

    const [total, byStatus, bySeverity, byType] = await Promise.all([
      this.prisma.incidentReport.count({ where }),
      this.prisma.incidentReport.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      this.prisma.incidentReport.groupBy({
        by: ['severity'],
        where,
        _count: { severity: true }
      }),
      this.prisma.incidentReport.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      })
    ]);

    return {
      totalReports: total,
      reportedIncidents: byStatus.find(s => s.status === 'REPORTED')?._count.status || 0,
      underReviewIncidents: byStatus.find(s => s.status === 'UNDER_REVIEW')?._count.status || 0,
      inProgressIncidents: byStatus.find(s => s.status === 'IN_PROGRESS')?._count.status || 0,
      resolvedIncidents: byStatus.find(s => s.status === 'RESOLVED')?._count.status || 0,
      closedIncidents: byStatus.find(s => s.status === 'CLOSED')?._count.status || 0,
      averageResolutionTime: 0, // Would need more complex query
      resolutionRate: 0,
      reopenedCount: 0,
      byIncidentType: Object.fromEntries(byType.map(t => [t.type, t._count.type])),
      bySeverity: Object.fromEntries(bySeverity.map(s => [s.severity, s._count.severity])),
      byPriority: {},
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count.status])),
      monthlyTrends: {},
      topResourcesAffected: []
    };
  }

  async getResourceIncidentHistory(resourceId: string): Promise<IncidentReportEntity[]> {
    return this.findByResourceId(resourceId);
  }

  async getUserIncidentHistory(userId: string): Promise<IncidentReportEntity[]> {
    const reports = await this.prisma.incidentReport.findMany({
      where: {
        OR: [
          { reportedBy: userId },
          { assignedTo: userId }
        ]
      },
      orderBy: { reportedAt: 'desc' }
    });
    return reports.map(r => this.mapToEntity(r));
  }

  async getIncidentTrends(months?: number): Promise<Record<string, number>> {
    const monthsBack = months || 12;
    const dateThreshold = new Date(Date.now() - monthsBack * 30 * 24 * 60 * 60 * 1000);
    
    const reports = await this.prisma.incidentReport.findMany({
      where: { reportedAt: { gte: dateThreshold } },
      select: { reportedAt: true }
    });
    
    // Group by month
    const trends: Record<string, number> = {};
    reports.forEach(report => {
      const monthKey = report.reportedAt.toISOString().substring(0, 7); // YYYY-MM
      trends[monthKey] = (trends[monthKey] || 0) + 1;
    });
    
    return trends;
  }

  async getTopAffectedResources(limit?: number): Promise<Array<{ resourceId: string; count: number }>> {
    const result = await this.prisma.incidentReport.groupBy({
      by: ['resourceId'],
      _count: { resourceId: true },
      orderBy: { _count: { resourceId: 'desc' } },
      take: limit || 10
    });
    
    return result.map(r => ({ resourceId: r.resourceId, count: r._count.resourceId }));
  }

  async getCostAnalysis(dateFrom?: Date, dateTo?: Date): Promise<{
    totalEstimated: number;
    totalActual: number;
    variance: number;
    byType: Record<string, { estimated: number; actual: number }>;
  }> {
    const where: any = {};
    if (dateFrom) where.reportedAt = { gte: dateFrom };
    if (dateTo) where.reportedAt = { ...where.reportedAt, lte: dateTo };

    const reports = await this.prisma.incidentReport.findMany({
      where,
      select: { estimatedCost: true, type: true }
    });

    const totalEstimated = reports.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    const byType: Record<string, { estimated: number; actual: number }> = {};
    
    reports.forEach(report => {
      if (!byType[report.type]) {
        byType[report.type] = { estimated: 0, actual: 0 };
      }
      byType[report.type].estimated += report.estimatedCost || 0;
    });

    return {
      totalEstimated,
      totalActual: 0, // Would need actualCost field in schema
      variance: 0,
      byType
    };
  }

  // Bulk operations - corrected signatures to match abstract interface
  async createMany(incidentReports: IncidentReportEntity[]): Promise<IncidentReportEntity[]> {
    const data = incidentReports.map(report => ({
      title: report.title,
      description: report.description,
      type: report.incidentType,
      severity: report.severity,
      status: report.status,
      priority: report.priority,
      resourceId: report.resourceId,
      reportedBy: report.reportedBy,
      reportedAt: report.incidentDate,
      assignedTo: report.assignedTo,
      location: report.location,
      witnesses: report.witnesses || [],
      photos: report.attachments?.filter(a => a.includes('.jpg') || a.includes('.png')) || [],
      documents: report.attachments?.filter(a => !a.includes('.jpg') && !a.includes('.png')) || [],
      estimatedCost: report.estimatedCost,
      resolutionNotes: report.resolution,
      resolvedAt: report.resolutionDate,
      preventiveMeasures: report.preventiveMeasures,
      followUpRequired: report.followUpRequired,
      followUpDate: report.followUpDate,
    }));

    await this.prisma.incidentReport.createMany({ data });
    return incidentReports;
  }

  async updateMany(
    filters: IncidentReportFilters,
    updates: Partial<IncidentReportEntity>
  ): Promise<number> {
    const where = this.buildWhereClause(filters);
    const data: any = {};
    
    if (updates.title) data.title = updates.title;
    if (updates.description) data.description = updates.description;
    if (updates.incidentType) data.type = updates.incidentType;
    if (updates.severity) data.severity = updates.severity;
    if (updates.status) data.status = updates.status;
    if (updates.priority) data.priority = updates.priority;
    if (updates.assignedTo) data.assignedTo = updates.assignedTo;
    if (updates.resolution) data.resolutionNotes = updates.resolution;
    if (updates.resolutionDate) data.resolvedAt = updates.resolutionDate;
    
    data.updatedAt = new Date();

    const result = await this.prisma.incidentReport.updateMany({
      where,
      data
    });
    return result.count;
  }

  async deleteMany(filters: IncidentReportFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    const result = await this.prisma.incidentReport.deleteMany({ where });
    return result.count;
  }

  async bulkAssign(
    incidentIds: string[],
    assignedTo: string,
    updatedBy: string
  ): Promise<number> {
    const result = await this.prisma.incidentReport.updateMany({
      where: { id: { in: incidentIds } },
      data: { 
        assignedTo,
        assignedAt: new Date(),
        updatedAt: new Date()
      }
    });
    return result.count;
  }

  async bulkUpdateStatus(
    incidentIds: string[],
    status: string,
    updatedBy: string
  ): Promise<number> {
    const result = await this.prisma.incidentReport.updateMany({
      where: { id: { in: incidentIds } },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
    return result.count;
  }

  async bulkUpdatePriority(
    incidentIds: string[],
    priority: string,
    updatedBy: string
  ): Promise<number> {
    const result = await this.prisma.incidentReport.updateMany({
      where: { id: { in: incidentIds } },
      data: { 
        priority,
        updatedAt: new Date()
      }
    });
    return result.count;
  }

  // Specialized methods
  async escalateIncident(
    incidentId: string,
    newPriority: string,
    newSeverity: string,
    escalatedBy: string
  ): Promise<IncidentReportEntity> {
    const updated = await this.prisma.incidentReport.update({
      where: { id: incidentId },
      data: {
        priority: newPriority,
        severity: newSeverity,
        updatedAt: new Date()
      }
    });
    return this.mapToEntity(updated);
  }

  async linkIncidents(
    primaryIncidentId: string,
    relatedIncidentIds: string[],
    linkedBy: string
  ): Promise<void> {
    // Since Prisma schema doesn't have incident linking, this is a stub
    this.logger.log(`Linking incident ${primaryIncidentId} with ${relatedIncidentIds.join(', ')} by ${linkedBy}`);
  }

  async generateIncidentReport(
    filters?: IncidentReportFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    summary: IncidentReportStatistics;
    incidents: IncidentReportEntity[];
    recommendations: string[];
  }> {
    const [summary, incidents] = await Promise.all([
      this.getStatistics(filters, dateFrom, dateTo),
      this.findAll(filters).then(result => result.reports)
    ]);

    const recommendations = [
      'Review high-priority incidents for escalation',
      'Implement preventive measures for recurring issues',
      'Ensure timely assignment of unassigned incidents'
    ];

    return { summary, incidents, recommendations };
  }
}
