/**
 * Reports Services - API integration for report generation and analytics
 * Implements RF-31 to RF-37 requirements for report generation and analytics
 */

import { reportsClient } from '../http';
import type { PaginatedResponse, QueryParams } from '../http/types';

export interface ReportFilter extends QueryParams {
	resourceId?: string;
	userId?: string;
	programId?: string;
	startDate?: string;
	endDate?: string;
	reportType?: 'usage' | 'user' | 'demand' | 'feedback' | 'maintenance';
	format?: 'json' | 'csv' | 'excel' | 'pdf';
}

export interface UsageReport {
	id: string;
	resourceId: string;
	resourceName: string;
	programId?: string;
	programName?: string;
	totalReservations: number;
	totalHours: number;
	utilizationRate: number;
	peakUsageHours: string[];
	period: {
		startDate: string;
		endDate: string;
	};
	generatedAt: string;
}

export interface UserReport {
	id: string;
	userId: string;
	userName: string;
	userEmail: string;
	totalReservations: number;
	totalHours: number;
	frequencyRate: number;
	favoriteResources: {
		resourceId: string;
		resourceName: string;
		usageCount: number;
	}[];
	period: {
		startDate: string;
		endDate: string;
	};
	generatedAt: string;
}

export interface DemandReport {
	id: string;
	resourceId: string;
	resourceName: string;
	totalRequests: number;
	satisfiedRequests: number;
	unsatisfiedRequests: number;
	satisfactionRate: number;
	conflictReasons: {
		reason: string;
		count: number;
	}[];
	period: {
		startDate: string;
		endDate: string;
	};
	generatedAt: string;
}

export interface FeedbackReport {
	id: string;
	averageRating: number;
	totalFeedbacks: number;
	ratingDistribution: Record<string, number>;
	commonComments: {
		category: string;
		sentiment: 'positive' | 'negative' | 'neutral';
		count: number;
	}[];
	improvementSuggestions: string[];
	period: {
		startDate: string;
		endDate: string;
	};
	generatedAt: string;
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
	async generateUsageReport(filter: ReportFilter): Promise<UsageReport> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/usage/generate`, { json: filter });
		return response.json();
	},

	async getUsageReports(filter?: ReportFilter): Promise<PaginatedResponse<UsageReport>> {
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

	async getUsageReport(id: string): Promise<UsageReport> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/usage/${id}`);
		return response.json();
	},

	async deleteUsageReport(id: string): Promise<void> {
		await reportsClient.delete(`${REPORTS_BASE_URL}/usage/${id}`);
	}
};

// RF-32: Report by user/professor
export const userReportsService = {
	async generateUserReport(filter: ReportFilter): Promise<UserReport> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/users/generate`, { json: filter });
		return response.json();
	},

	async getUserReports(filter?: ReportFilter): Promise<PaginatedResponse<UserReport>> {
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

	async getUserReport(id: string): Promise<UserReport> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/users/${id}`);
		return response.json();
	},

	async deleteUserReport(id: string): Promise<void> {
		await reportsClient.delete(`${REPORTS_BASE_URL}/users/${id}`);
	}
};

// RF-33: CSV export
export const exportService = {
	async exportReport(reportId: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/export/${reportId}?format=${format}`);
		return response.blob();
	},

	async exportUsageData(filter: ReportFilter, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
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
		return response.blob();
	},

	async exportUserData(filter: ReportFilter, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
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
		return response.blob();
	}
};

// RF-37: Unsatisfied demand reports
export const demandReportsService = {
	async generateDemandReport(filter: ReportFilter): Promise<DemandReport> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/demand/generate`, { json: filter });
		return response.json();
	},

	async getDemandReports(filter?: ReportFilter): Promise<PaginatedResponse<DemandReport>> {
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

	async getDemandReport(id: string): Promise<DemandReport> {
		const response = await reportsClient.get(`${REPORTS_BASE_URL}/demand/${id}`);
		return response.json();
	}
};

// RF-34 & RF-35: Feedback and evaluation reports
export const feedbackReportsService = {
	async generateFeedbackReport(filter: ReportFilter): Promise<FeedbackReport> {
		const response = await reportsClient.post(`${REPORTS_BASE_URL}/feedback/generate`, { json: filter });
		return response.json();
	},

	async getFeedbackReports(filter?: ReportFilter): Promise<PaginatedResponse<FeedbackReport>> {
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

	async getFeedbackReport(id: string): Promise<FeedbackReport> {
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
