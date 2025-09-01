// Maintenance Record Types
export interface MaintenanceRecord {
	id: string;
	resourceId: string;
	userId: string;
	maintenanceType: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	title: string;
	description: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
	scheduledDate: string;
	startDate?: string;
	endDate?: string;
	actualDuration?: number;
	estimatedDuration: number;
	cost?: number;
	notes?: string;
	attachments?: string[];
	assignedTechnician?: string;
	technicianNotes?: string;
	isRecurring: boolean;
	recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
	nextScheduledDate?: string;
	parentRecordId?: string;
	completionPercentage: number;
	qualityRating?: number;
	followUpRequired: boolean;
	followUpDate?: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy?: string;
}

export interface CreateMaintenanceRecord {
	resourceId: string;
	userId: string;
	maintenanceType: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	title: string;
	description: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	scheduledDate: string;
	estimatedDuration: number;
	cost?: number;
	notes?: string;
	attachments?: string[];
	assignedTechnician?: string;
	isRecurring?: boolean;
	recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
	parentRecordId?: string;
	followUpRequired?: boolean;
	followUpDate?: string;
}

export interface UpdateMaintenanceRecord {
	title?: string;
	description?: string;
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
	scheduledDate?: string;
	startDate?: string;
	endDate?: string;
	estimatedDuration?: number;
	cost?: number;
	notes?: string;
	attachments?: string[];
	assignedTechnician?: string;
	technicianNotes?: string;
	completionPercentage?: number;
	qualityRating?: number;
	followUpRequired?: boolean;
	followUpDate?: string;
}

export interface MaintenanceRecordFilters {
	resourceId?: string;
	userId?: string;
	maintenanceType?: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
	assignedTechnician?: string;
	isRecurring?: boolean;
	scheduledDateFrom?: string;
	scheduledDateTo?: string;
	isOverdue?: boolean;
	followUpRequired?: boolean;
	createdBy?: string;
}

// Incident Report Types
export interface IncidentReport {
	id: string;
	resourceId: string;
	reportedBy: string;
	incidentType: 'DAMAGE' | 'MALFUNCTION' | 'SAFETY' | 'THEFT' | 'VANDALISM' | 'OTHER';
	severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	title: string;
	description: string;
	location?: string;
	incidentDate: string;
	discoveredDate: string;
	affectedUsers?: number;
	estimatedCost?: number;
	actualCost?: number;
	status: 'REPORTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
	assignedTo?: string;
	resolution?: string;
	resolutionDate?: string;
	preventiveMeasures?: string;
	attachments?: string[];
	witnesses?: string[];
	relatedIncidents?: string[];
	maintenanceRequired: boolean;
	maintenanceRecordId?: string;
	followUpRequired: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	insuranceClaim?: boolean;
	insuranceClaimNumber?: string;
	policeReport?: boolean;
	policeReportNumber?: string;
	isRecurring: boolean;
	rootCause?: string;
	correctiveActions?: string[];
	reopenedCount: number;
	tags?: string[];
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy?: string;
}

export interface CreateIncidentReport {
	resourceId: string;
	reportedBy: string;
	incidentType: 'DAMAGE' | 'MALFUNCTION' | 'SAFETY' | 'THEFT' | 'VANDALISM' | 'OTHER';
	severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	title: string;
	description: string;
	location?: string;
	incidentDate: string;
	discoveredDate: string;
	affectedUsers?: number;
	estimatedCost?: number;
	attachments?: string[];
	witnesses?: string[];
	relatedIncidents?: string[];
	maintenanceRequired?: boolean;
	followUpRequired?: boolean;
	followUpDate?: string;
	isRecurring?: boolean;
	recurringPattern?: string;
	tags?: string[];
}

export interface UpdateIncidentReport {
	title?: string;
	description?: string;
	severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	status?: 'REPORTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
	location?: string;
	incidentDate?: string;
	discoveredDate?: string;
	affectedUsers?: number;
	estimatedCost?: number;
	actualCost?: number;
	assignedTo?: string;
	resolution?: string;
	preventiveMeasures?: string;
	attachments?: string[];
	witnesses?: string[];
	relatedIncidents?: string[];
	maintenanceRequired?: boolean;
	maintenanceRecordId?: string;
	followUpRequired?: boolean;
	followUpDate?: string;
	followUpNotes?: string;
	rootCause?: string;
	correctiveActions?: string[];
	tags?: string[];
}

export interface IncidentReportFilters {
	resourceId?: string;
	reportedBy?: string;
	assignedTo?: string;
	incidentType?: 'DAMAGE' | 'MALFUNCTION' | 'SAFETY' | 'THEFT' | 'VANDALISM' | 'OTHER';
	severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status?: 'REPORTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	incidentDateFrom?: string;
	incidentDateTo?: string;
	isRecurring?: boolean;
	maintenanceRequired?: boolean;
	followUpRequired?: boolean;
	insuranceClaim?: boolean;
	policeReport?: boolean;
	tags?: string[];
	hasFinancialImpact?: boolean;
	isOverdue?: boolean;
}

// Scheduled Maintenance Types
export interface ScheduledMaintenance {
	id: string;
	resourceId: string;
	maintenanceType: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	title: string;
	description: string;
	scheduledDate: string;
	estimatedDuration: number;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
	assignedTechnician?: string;
	cost?: number;
	notes?: string;
	requirements?: string[];
	isRecurring: boolean;
	recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
	recurringEndDate?: string;
	parentScheduleId?: string;
	nextScheduledDate?: string;
	reminderSent: boolean;
	reminderDate?: string;
	approvalRequired: boolean;
	approvedBy?: string;
	approvedAt?: string;
	completedAt?: string;
	completedBy?: string;
	actualDuration?: number;
	completionNotes?: string;
	qualityRating?: number;
	attachments?: string[];
	maintenanceRecordId?: string;
	postponedReason?: string;
	postponedTo?: string;
	cancellationReason?: string;
	tags?: string[];
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy?: string;
}

export interface CreateScheduledMaintenance {
	resourceId: string;
	maintenanceType: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	title: string;
	description: string;
	scheduledDate: string;
	estimatedDuration: number;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	assignedTechnician?: string;
	cost?: number;
	notes?: string;
	requirements?: string[];
	isRecurring?: boolean;
	recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
	recurringEndDate?: string;
	parentScheduleId?: string;
	approvalRequired?: boolean;
	tags?: string[];
}

export interface UpdateScheduledMaintenance {
	title?: string;
	description?: string;
	scheduledDate?: string;
	estimatedDuration?: number;
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
	assignedTechnician?: string;
	cost?: number;
	notes?: string;
	requirements?: string[];
	actualDuration?: number;
	completionNotes?: string;
	completedBy?: string;
	qualityRating?: number;
	attachments?: string[];
	maintenanceRecordId?: string;
	tags?: string[];
}

export interface ScheduledMaintenanceFilters {
	resourceId?: string;
	maintenanceType?: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
	assignedTechnician?: string;
	isRecurring?: boolean;
	recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
	scheduledDateFrom?: string;
	scheduledDateTo?: string;
	isOverdue?: boolean;
	isDue?: boolean;
	needsApproval?: boolean;
	isApproved?: boolean;
	parentScheduleId?: string;
	tags?: string[];
	createdBy?: string;
}

// Common Types
export interface PaginationParams {
	page?: number;
	limit?: number;
}

export interface SortParams {
	field?: string;
	direction?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
	data: T;
	total?: number;
	page?: number;
	limit?: number;
	totalPages?: number;
}

export interface Statistics {
	totalRecords: number;
	pendingRecords: number;
	inProgressRecords: number;
	completedRecords: number;
	overdueRecords: number;
	averageCompletionTime: number;
	completionRate: number;
	qualityRatingAverage?: number;
	costTotal?: number;
	byMaintenanceType: Record<string, number>;
	byPriority: Record<string, number>;
	byStatus: Record<string, number>;
}

export interface TimeSlot {
	start: string;
	end: string;
}

export interface ConflictCheck {
	hasConflicts: boolean;
	conflicts: ScheduledMaintenance[];
}
