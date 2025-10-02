import { randomUUID } from 'crypto';

export class IncidentReportEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly reportedBy: string,
    public readonly incidentType: string, // DAMAGE, MALFUNCTION, SAFETY, THEFT, VANDALISM, OTHER
    public readonly severity: string, // LOW, MEDIUM, HIGH, CRITICAL
    public readonly title: string,
    public readonly description: string,
    public readonly location: string | undefined,
    public readonly incidentDate: Date,
    public readonly discoveredDate: Date,
    public readonly affectedUsers: number | undefined,
    public readonly estimatedCost: number | undefined,
    public readonly actualCost: number | undefined,
    public readonly status: string, // REPORTED, UNDER_REVIEW, IN_PROGRESS, RESOLVED, CLOSED
    public readonly priority: string, // LOW, MEDIUM, HIGH, URGENT
    public readonly assignedTo: string | undefined,
    public readonly resolution: string | undefined,
    public readonly resolutionDate: Date | undefined,
    public readonly preventiveMeasures: string | undefined,
    public readonly attachments: string[] | undefined, // URLs or file paths
    public readonly witnesses: string[] | undefined, // User IDs
    public readonly relatedIncidents: string[] | undefined, // IDs of related incidents
    public readonly maintenanceRequired: boolean,
    public readonly maintenanceRecordId: string | undefined,
    public readonly followUpRequired: boolean,
    public readonly followUpDate: Date | undefined,
    public readonly followUpNotes: string | undefined,
    public readonly insuranceClaim: boolean | undefined,
    public readonly insuranceClaimNumber: string | undefined,
    public readonly policeReport: boolean | undefined,
    public readonly policeReportNumber: string | undefined,
    public readonly isRecurring: boolean,
    public readonly recurringPattern: string | undefined,
    public readonly rootCause: string | undefined,
    public readonly correctiveActions: string[] | undefined,
    public readonly reviewedBy: string | undefined,
    public readonly reviewedAt: Date | undefined,
    public readonly approvedBy: string | undefined,
    public readonly approvedAt: Date | undefined,
    public readonly closedBy: string | undefined,
    public readonly closedAt: Date | undefined,
    public readonly reopenedCount: number,
    public readonly tags: string[] | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string,
    public readonly updatedBy: string | undefined,
  ) {}

  static create(
    resourceId: string,
    reportedBy: string,
    incidentType: string,
    severity: string,
    title: string,
    description: string,
    location: string | undefined,
    incidentDate: Date,
    discoveredDate: Date,
    priority: string,
    createdBy: string,
    affectedUsers?: number,
    estimatedCost?: number,
    actualCost?: number,
    status = 'REPORTED',
    assignedTo?: string,
    resolution?: string,
    resolutionDate?: Date,
    preventiveMeasures?: string,
    attachments?: string[],
    witnesses?: string[],
    relatedIncidents?: string[],
    maintenanceRequired = false,
    maintenanceRecordId?: string,
    followUpRequired = false,
    followUpDate?: Date,
    followUpNotes?: string,
    insuranceClaim = false,
    insuranceClaimNumber?: string,
    policeReport = false,
    policeReportNumber?: string,
    isRecurring = false,
    recurringPattern?: string,
    rootCause?: string,
    correctiveActions?: string[],
    reviewedBy?: string,
    reviewedAt?: Date,
    approvedBy?: string,
    approvedAt?: Date,
    closedBy?: string,
    closedAt?: Date,
    reopenedCount = 0,
    tags?: string[],
    updatedBy?: string,
  ): IncidentReportEntity {
    return new IncidentReportEntity(
      randomUUID(),
      resourceId,
      reportedBy,
      incidentType,
      severity,
      title,
      description,
      location,
      incidentDate,
      discoveredDate,
      affectedUsers,
      estimatedCost,
      actualCost,
      status,
      priority,
      assignedTo,
      resolution,
      resolutionDate,
      preventiveMeasures,
      attachments,
      witnesses,
      relatedIncidents,
      maintenanceRequired,
      maintenanceRecordId,
      followUpRequired,
      followUpDate,
      followUpNotes,
      insuranceClaim,
      insuranceClaimNumber,
      policeReport,
      policeReportNumber,
      isRecurring,
      recurringPattern,
      rootCause,
      correctiveActions,
      reviewedBy,
      reviewedAt,
      approvedBy,
      approvedAt,
      closedBy,
      closedAt,
      reopenedCount,
      tags,
      new Date(),
      new Date(),
      createdBy,
      updatedBy,
    );
  }

  // Status check methods
  isReported(): boolean {
    return this.status === 'REPORTED';
  }

  isUnderReview(): boolean {
    return this.status === 'UNDER_REVIEW';
  }

  isInProgress(): boolean {
    return this.status === 'IN_PROGRESS';
  }

  isResolved(): boolean {
    return this.status === 'RESOLVED';
  }

  isClosed(): boolean {
    return this.status === 'CLOSED';
  }

  requiresAttention(): boolean {
    const urgentStatuses = ['REPORTED', 'UNDER_REVIEW'];
    const criticalSeverity = this.severity === 'CRITICAL';
    const urgentPriority = this.priority === 'URGENT';
    
    return urgentStatuses.includes(this.status) || criticalSeverity || urgentPriority;
  }

  isOverdue(): boolean {
    if (this.followUpDate && this.followUpRequired) {
      return new Date() > this.followUpDate;
    }
    return false;
  }

  hasFinancialImpact(): boolean {
    return (this.estimatedCost && this.estimatedCost > 0) ||
           (this.actualCost && this.actualCost > 0);
  }

  requiresExternalReporting(): boolean {
    return this.insuranceClaim === true || this.policeReport === true;
  }

  // Validation methods
  validate(): void {
    if (!this.resourceId) {
      throw new Error('Resource ID is required');
    }
    if (!this.reportedBy) {
      throw new Error('Reporter ID is required');
    }
    if (!this.title.trim()) {
      throw new Error('Title is required');
    }
    if (!this.description.trim()) {
      throw new Error('Description is required');
    }
    if (!['DAMAGE', 'MALFUNCTION', 'SAFETY', 'THEFT', 'VANDALISM', 'OTHER'].includes(this.incidentType)) {
      throw new Error('Invalid incident type');
    }
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(this.severity)) {
      throw new Error('Invalid severity level');
    }
    if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(this.priority)) {
      throw new Error('Invalid priority level');
    }
    if (!['REPORTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(this.status)) {
      throw new Error('Invalid status');
    }
    if (this.incidentDate > new Date()) {
      throw new Error('Incident date cannot be in the future');
    }
    if (this.discoveredDate > new Date()) {
      throw new Error('Discovery date cannot be in the future');
    }
    if (this.incidentDate > this.discoveredDate) {
      throw new Error('Incident date cannot be after discovery date');
    }
  }
}
