import { IncidentReportEntity } from '../entities/incident-report.entity';

export interface IncidentReportFilters {
  resourceId?: string;
  reportedBy?: string;
  assignedTo?: string;
  incidentType?: string;
  severity?: string;
  status?: string;
  priority?: string;
  incidentDateFrom?: Date;
  incidentDateTo?: Date;
  discoveredDateFrom?: Date;
  discoveredDateTo?: Date;
  isRecurring?: boolean;
  maintenanceRequired?: boolean;
  followUpRequired?: boolean;
  insuranceClaim?: boolean;
  policeReport?: boolean;
  tags?: string[];
  hasFinancialImpact?: boolean;
  isOverdue?: boolean;
  createdBy?: string;
}

export interface IncidentReportSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface IncidentReportPagination {
  page: number;
  limit: number;
}

export interface IncidentReportQueryResult {
  reports: IncidentReportEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IncidentReportStatistics {
  totalReports: number;
  reportedIncidents: number;
  underReviewIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  averageResolutionTime: number; // in hours
  resolutionRate: number; // percentage
  totalEstimatedCost?: number;
  totalActualCost?: number;
  affectedUsersTotal?: number;
  reopenedCount: number;
  byIncidentType: Record<string, number>;
  bySeverity: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  monthlyTrends: Record<string, number>;
  topResourcesAffected: Array<{ resourceId: string; count: number }>;
}

export abstract class IncidentReportRepository {
  abstract create(incidentReport: IncidentReportEntity): Promise<IncidentReportEntity>;
  abstract findById(id: string): Promise<IncidentReportEntity | null>;
  abstract findAll(
    filters?: IncidentReportFilters,
    sort?: IncidentReportSortOptions,
    pagination?: IncidentReportPagination
  ): Promise<IncidentReportQueryResult>;
  abstract update(id: string, incidentReport: IncidentReportEntity): Promise<IncidentReportEntity>;
  abstract delete(id: string): Promise<void>;

  // Specific query methods
  abstract findByResourceId(resourceId: string): Promise<IncidentReportEntity[]>;
  abstract findByReporter(reportedBy: string): Promise<IncidentReportEntity[]>;
  abstract findByAssignee(assignedTo: string): Promise<IncidentReportEntity[]>;
  abstract findByStatus(status: string): Promise<IncidentReportEntity[]>;
  abstract findBySeverity(severity: string): Promise<IncidentReportEntity[]>;
  abstract findByIncidentType(incidentType: string): Promise<IncidentReportEntity[]>;
  abstract findOverdue(): Promise<IncidentReportEntity[]>;
  abstract findRequiringAttention(): Promise<IncidentReportEntity[]>;
  abstract findWithFinancialImpact(): Promise<IncidentReportEntity[]>;
  abstract findRequiringFollowUp(): Promise<IncidentReportEntity[]>;
  abstract findRequiringMaintenance(): Promise<IncidentReportEntity[]>;
  abstract findWithInsuranceClaims(): Promise<IncidentReportEntity[]>;
  abstract findWithPoliceReports(): Promise<IncidentReportEntity[]>;
  abstract findRecurringIncidents(): Promise<IncidentReportEntity[]>;
  abstract findByTags(tags: string[]): Promise<IncidentReportEntity[]>;
  abstract findRelatedIncidents(incidentId: string): Promise<IncidentReportEntity[]>;

  // Date-based queries
  abstract findByDateRange(startDate: Date, endDate: Date): Promise<IncidentReportEntity[]>;
  abstract findRecentIncidents(days?: number): Promise<IncidentReportEntity[]>;
  abstract findIncidentsThisMonth(): Promise<IncidentReportEntity[]>;
  abstract findIncidentsThisWeek(): Promise<IncidentReportEntity[]>;

  // Statistics and reporting
  abstract getStatistics(
    filters?: IncidentReportFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<IncidentReportStatistics>;
  abstract getResourceIncidentHistory(resourceId: string): Promise<IncidentReportEntity[]>;
  abstract getUserIncidentHistory(userId: string): Promise<IncidentReportEntity[]>;
  abstract getIncidentTrends(months?: number): Promise<Record<string, number>>;
  abstract getTopAffectedResources(limit?: number): Promise<Array<{ resourceId: string; count: number }>>;
  abstract getCostAnalysis(dateFrom?: Date, dateTo?: Date): Promise<{
    totalEstimated: number;
    totalActual: number;
    variance: number;
    byType: Record<string, { estimated: number; actual: number }>;
  }>;

  // Advanced queries
  abstract findSimilarIncidents(
    resourceId: string,
    incidentType: string,
    daysBack?: number
  ): Promise<IncidentReportEntity[]>;
  abstract findEscalatedIncidents(): Promise<IncidentReportEntity[]>;
  abstract findUnassignedIncidents(): Promise<IncidentReportEntity[]>;
  abstract findDelayedResolutions(daysThreshold?: number): Promise<IncidentReportEntity[]>;

  // Bulk operations
  abstract createMany(incidentReports: IncidentReportEntity[]): Promise<IncidentReportEntity[]>;
  abstract updateMany(
    filters: IncidentReportFilters,
    updates: Partial<IncidentReportEntity>
  ): Promise<number>;
  abstract deleteMany(filters: IncidentReportFilters): Promise<number>;
  abstract bulkAssign(
    incidentIds: string[],
    assignedTo: string,
    updatedBy: string
  ): Promise<number>;
  abstract bulkUpdateStatus(
    incidentIds: string[],
    status: string,
    updatedBy: string
  ): Promise<number>;
  abstract bulkUpdatePriority(
    incidentIds: string[],
    priority: string,
    updatedBy: string
  ): Promise<number>;

  // Specialized methods
  abstract escalateIncident(
    incidentId: string,
    newPriority: string,
    newSeverity: string,
    escalatedBy: string
  ): Promise<IncidentReportEntity>;
  abstract linkIncidents(
    primaryIncidentId: string,
    relatedIncidentIds: string[],
    linkedBy: string
  ): Promise<void>;
  abstract generateIncidentReport(
    filters?: IncidentReportFilters,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    summary: IncidentReportStatistics;
    incidents: IncidentReportEntity[];
    recommendations: string[];
  }>;
}
