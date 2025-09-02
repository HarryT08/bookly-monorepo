// Reports Service Types - RF31, RF32, RF33
export interface UsageReportFilters {
	startDate?: string | Date;
	endDate?: string | Date;
	programIds?: string[];
	resourceTypes?: string[];
	categories?: string[];
	includeDetails?: boolean;
	page?: number;
	limit?: number;
}

export interface UserReportFilters {
	userIds?: string[];
	roles?: string[];
	startDate?: string;
	endDate?: string;
	includeDetails?: boolean;
	page?: number;
	limit?: number;
}

export interface ExportCsvConfig {
	reportType: 'usage' | 'users';
	filters: UsageReportFilters | UserReportFilters;
	format: 'csv' | 'excel';
	columns?: string[];
	title?: string;
	description?: string;
}

// Usage Report Data Types
export interface UsageReportData {
	programId: string;
	programName: string;
	resourceType: string;
	totalReservations: number;
	totalHours: number;
	utilizationRate: number;
	peakHours: string[];
	resourcesUsed: {
		resourceId: string;
		resourceName: string;
		reservations: number;
		hours: number;
	}[];
	monthlyTrends?: {
		month: string;
		reservations: number;
		hours: number;
	}[];
}

export interface UsageReportSummary {
	totalPrograms: number;
	totalResourceTypes: number;
	totalReservations: number;
	totalHours: number;
	averageUtilization: number;
	topProgram: string;
	topResourceType: string;
	periodCovered: {
		startDate: string;
		endDate: string;
	};
}

export interface UsageReportResponse {
	data: UsageReportData[];
	summary: UsageReportSummary;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	metadata: {
		generatedAt: string;
		generatedBy: string;
		filters: UsageReportFilters;
	};
}

// User Report Data Types
export interface UserReportData {
	userId: string;
	userName: string;
	userEmail: string;
	userRole: string;
	totalReservations: number;
	confirmedReservations: number;
	cancelledReservations: number;
	noShowReservations: number;
	totalHours: number;
	utilizationRate: number;
	cancellationRate: number;
	frequentResources: {
		resourceName: string;
		count: number;
	}[];
	monthlyActivity?: {
		month: string;
		reservations: number;
		hours: number;
	}[];
}

export interface UserReportSummary {
	totalUsers: number;
	totalReservations: number;
	averageReservationsPerUser: number;
	topUser: string;
	averageUtilization: number;
	totalCancellations: number;
	averageCancellationRate: number;
}

export interface UserReportResponse {
	data: UserReportData[];
	summary: UserReportSummary;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	metadata: {
		generatedAt: string;
		generatedBy: string;
		filters: UserReportFilters;
	};
}

// Export Types
export interface ExportResponse {
	id: string;
	filename: string;
	downloadUrl: string;
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
	createdAt: string;
	expiresAt: string;
	fileSize?: number;
}

export interface ExportHistory {
	id: string;
	reportType: string;
	format: string;
	filename: string;
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
	createdAt: string;
	completedAt?: string;
	expiresAt: string;
	fileSize?: number;
	downloadCount: number;
	isAvailable: boolean;
}

// Filter Options
export interface ReportFilterOptions {
	programs: {
		id: string;
		name: string;
		code: string;
	}[];
	resourceTypes: {
		type: string;
		count: number;
	}[];
	categories: {
		id: string;
		name: string;
		type: string;
	}[];
	users: {
		id: string;
		name: string;
		email: string;
		role: string;
	}[];
	dateRanges: {
		label: string;
		startDate: string;
		endDate: string;
	}[];
}

// Statistics for Dashboard
export interface ReportStatistics {
	totalReports: number;
	reportsThisMonth: number;
	totalExports: number;
	exportsThisMonth: number;
	topReportType: string;
	averageGenerationTime: number;
	mostActiveUser: string;
	systemUsage: {
		utilizationRate: number;
		totalHoursReserved: number;
		totalReservations: number;
	};
}

// Personal Stats for Users
export interface PersonalStats {
	totalReservations: number;
	confirmedReservations: number;
	cancelledReservations: number;
	noShowReservations: number;
	utilizationRate: number;
	cancellationRate: number;
	totalHours: number;
	frequentResources: {
		resourceName: string;
		count: number;
	}[];
}

// Export status interface
export interface ExportStatus {
	id: string;
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
	progress?: number;
	estimatedTimeRemaining?: number;
	errorMessage?: string;
}

// Cached report interface
export interface CachedReport {
	id: string;
	reportType: string;
	data: unknown;
	createdAt: string;
	expiresAt: string;
	isValid: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}
