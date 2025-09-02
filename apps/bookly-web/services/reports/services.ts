/**
 * Reports Services - API integration for report generation and analytics
 * Implements RF-31 to RF-37 requirements for report generation and analytics
 */

import { reportsClient } from '../http';
import type { QueryParams } from '../http/types';

export interface ReportFilter extends QueryParams {
	resourceId?: string;
	userId?: string;
	programId?: string;
	startDate?: string;
	endDate?: string;
	reportType?: 'usage' | 'user' | 'demand' | 'feedback' | 'maintenance';
	format?: 'json' | 'csv' | 'excel' | 'pdf';
}

// Aligned with backend DTOs
export interface ReportMetadata {
	generatedAt: string;
	generatedBy: string;
	reportType: string;
	filters?: Record<string, string | number | boolean>;
	totalRecords: number;
	executionTime: number;
}

export interface UsageReportData {
	resource: {
		id: string;
		name: string;
		code: string;
		type: string;
		capacity?: number;
	};
	program?: {
		id: string;
		name: string;
		code: string;
	};
	subject?: string;
	totalReservations: number;
	confirmedReservations: number;
	cancelledReservations: number;
	totalHours: number;
	utilizationRate: number;
	cancellationRate: number;
	peakHours?: string[];
	frequentDays?: string[];
}

export interface UsageReportResponse {
	metadata: ReportMetadata;
	data: UsageReportData[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
	summary: {
		totalResources: number;
		totalReservations: number;
		averageUtilization: number;
		mostUsedResource: string;
		leastUsedResource: string;
	};
}

export interface UserReportData {
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		userType: string;
	};
	totalReservations: number;
	confirmedReservations: number;
	cancelledReservations: number;
	noShowReservations: number;
	utilizationRate: number;
	cancellationRate: number;
	frequentResources: {
		resourceName: string;
		count: number;
	}[];
	totalHours: number;
	reservationDetails?: {
		id: string;
		title: string;
		resourceName: string;
		startDate: string;
		endDate: string;
		status: string;
	}[];
}

export interface UserReportResponse {
	metadata: ReportMetadata;
	data: UserReportData[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
	summary: {
		totalUsers: number;
		totalReservations: number;
		averageReservationsPerUser: number;
		topUser: string;
		averageUtilization: number;
	};
}

export interface DemandReportData {
	resource: {
		id: string;
		name: string;
		code: string;
		type: string;
		capacity?: number;
	};
	totalRequests: number;
	satisfiedRequests: number;
	unsatisfiedRequests: number;
	satisfactionRate: number;
	conflictReasons: {
		reason: string;
		count: number;
	}[];
}

export interface DemandReportResponse {
	metadata: ReportMetadata;
	data: DemandReportData[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
	summary: {
		totalResources: number;
		totalRequests: number;
		averageUtilization: number;
		mostDemandedResource: string;
		leastDemandedResource: string;
	};
}

export interface FeedbackReportData {
	averageRating: number;
	totalFeedbacks: number;
	ratingDistribution: Record<string, number>;
	commonComments: {
		category: string;
		sentiment: 'positive' | 'negative' | 'neutral';
		count: number;
	}[];
	improvementSuggestions: string[];
}

export interface FeedbackReportResponse {
	metadata: ReportMetadata;
	data: FeedbackReportData[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
}

// Export response for CSV/Excel/PDF downloads
export interface ExportResponse {
	status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
	downloadUrl: string;
	filename: string;
	fileSize: number;
	recordCount: number;
	generatedAt: string;
	expiresAt?: string;
	errorMessage?: string;
}

export interface DashboardStats {
	totalResources: number;
	totalUsers: number;
	totalReservations: number;
	utilizationRate: number;
	topResources: {
		resourceId: string;
		resourceName: string;
		usageCount: number;
	}[];
	recentActivity: {
		type: 'reservation' | 'cancellation' | 'approval';
		resourceName: string;
		userName: string;
		timestamp: string;
	}[];
}

const REPORTS_BASE_URL = '/api/reports';

// RF-31: Report generation by resource/program/period
export const usageReportsService = {
	async generateUsageReport(filter: ReportFilter): Promise<UsageReportResponse> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/usage/generate`, { json: filter });
		return response.json();
	},

	async getUsageReports(filter?: ReportFilter): Promise<UsageReportResponse> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/usage?${params}`);
		return response.json();
	},

	async getUsageReport(id: string): Promise<UsageReportResponse> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/usage/${id}`);
		return response.json();
	},

	async deleteUsageReport(id: string): Promise<void> {
		await reportsClient.delete(`${REPORTS_BASE_URL}/usage/${id}`);
	}
};

// RF-32: Report by user/professor
export const userReportsService = {
	async generateUserReport(filter: ReportFilter): Promise<UserReportResponse> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/users/generate`, { json: filter });
		return response.json();
	},

	async getUserReports(filter?: ReportFilter): Promise<UserReportResponse> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/users?${params}`);
		return response.json();
	},

	async getUserReport(id: string): Promise<UserReportResponse> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/users/${id}`);
		return response.json();
	},

	async deleteUserReport(id: string): Promise<void> {
		await reportsClient.delete(`${REPORTS_BASE_URL}/users/${id}`);
	}
};

// RF-33: CSV export
export const exportService = {
	async exportReport(reportId: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<ExportResponse> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/export/${reportId}?format=${format}`);
		return response.json();
	},

	async downloadExport(downloadUrl: string): Promise<Blob> {
		const response = await reportsClient.get(downloadUrl);
		return response.blob();
	},

	async exportUsageData(filter: ReportFilter, format: 'csv' | 'excel' = 'csv'): Promise<ExportResponse> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		params.append('format', format);

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/export/usage?${params}`);
		return response.json();
	},

	async exportUserData(filter: ReportFilter, format: 'csv' | 'excel' = 'csv'): Promise<ExportResponse> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		params.append('format', format);

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/export/users?${params}`);
		return response.json();
	}
};

// RF-37: Unsatisfied demand reports
export const demandReportsService = {
	async generateDemandReport(filter: ReportFilter): Promise<DemandReportResponse> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/demand/generate`, { json: filter });
		return response.json();
	},

	async getDemandReports(filter?: ReportFilter): Promise<DemandReportResponse> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/demand?${params}`);
		return response.json();
	},

	async getDemandReport(id: string): Promise<DemandReportResponse> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/demand/${id}`);
		return response.json();
	}
};

// RF-34 & RF-35: Feedback and evaluation reports
export const feedbackReportsService = {
	async generateFeedbackReport(filter: ReportFilter): Promise<FeedbackReportResponse> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/feedback/generate`, { json: filter });
		return response.json();
	},

	async getFeedbackReports(filter?: ReportFilter): Promise<FeedbackReportResponse> {
		const params = new URLSearchParams();

		if (filter) {
			Object.entries(filter).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/feedback?${params}`);
		return response.json();
	},

	async getFeedbackReport(id: string): Promise<FeedbackReportResponse> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/feedback/${id}`);
		return response.json();
	}
};

// RF-36: Interactive dashboards
export const dashboardService = {
	async getDashboardStats(period?: { startDate: string; endDate: string }): Promise<DashboardStats> {
		const params = new URLSearchParams();

		if (period) {
			params.append('startDate', period.startDate);
			params.append('endDate', period.endDate);
		}

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/dashboard/stats?${params}`);
		return response.json();
	},

	async getResourceUtilization(resourceId?: string): Promise<
		{
			date: string;
			utilizationRate: number;
			totalHours: number;
			reservationCount: number;
		}[]
	> {
		const params = new URLSearchParams();

		if (resourceId) {
			params.append('resourceId', resourceId);
		}

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/dashboard/utilization?${params}`);
		return response.json();
	},

	async getUserActivity(userId?: string): Promise<
		{
			date: string;
			reservationCount: number;
			totalHours: number;
			cancelationCount: number;
		}[]
	> {
		const params = new URLSearchParams();

		if (userId) {
			params.append('userId', userId);
		}

		const response = await reportsClient.get(`${REPORTS_BASE_URL}/dashboard/activity?${params}`);
		return response.json();
	}
};

// Unified export
const ReportsService = {
	usage: usageReportsService,
	user: userReportsService,
	demand: demandReportsService,
	feedback: feedbackReportsService,
	dashboard: dashboardService,
	export: exportService
};

export default ReportsService;
