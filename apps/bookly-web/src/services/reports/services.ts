import { apiClient } from '../http/client';
import {
	UsageReportFilters,
	UserReportFilters,
	ExportCsvConfig,
	UsageReportResponse,
	UserReportResponse,
	ExportResponse,
	ExportHistory,
	ReportFilterOptions,
	ReportStatistics,
	PersonalStats,
	UsageReportSummary,
	UserReportSummary,
	ExportStatus,
	CachedReport
} from './types';

const REPORTS_BASE_URL = process.env.NEXT_PUBLIC_REPORTS_SERVICE_URL || 'http://localhost:3005/api';

/**
 * Usage Reports Service - RF31
 */
export const usageReportsService = {
	/**
	 * Generate usage report by program/period/resource type
	 */
	async generateUsageReport(filters: UsageReportFilters): Promise<UsageReportResponse> {
		const params = new URLSearchParams();

		if (filters.startDate) params.append('startDate', filters.startDate);

		if (filters.endDate) params.append('endDate', filters.endDate);

		if (filters.programIds?.length) {
			filters.programIds.forEach((id) => params.append('programIds', id));
		}

		if (filters.resourceTypes?.length) {
			filters.resourceTypes.forEach((type) => params.append('resourceTypes', type));
		}

		if (filters.categories?.length) {
			filters.categories.forEach((cat) => params.append('categories', cat));
		}

		if (filters.includeDetails !== undefined) {
			params.append('includeDetails', filters.includeDetails.toString());
		}

		if (filters.page) params.append('page', filters.page.toString());

		if (filters.limit) params.append('limit', filters.limit.toString());

		const response = await apiClient.get<UsageReportResponse>(`${REPORTS_BASE_URL}/reports/usage?${params}`);
		return response.data;
	},

	/**
	 * Get usage report summary statistics
	 */
	async getUsageReportSummary(filters: UsageReportFilters): Promise<UsageReportSummary> {
		const params = new URLSearchParams();

		if (filters.startDate) params.append('startDate', filters.startDate);

		if (filters.endDate) params.append('endDate', filters.endDate);

		if (filters.programIds?.length) {
			filters.programIds.forEach((id) => params.append('programIds', id));
		}

		if (filters.resourceTypes?.length) {
			filters.resourceTypes.forEach((type) => params.append('resourceTypes', type));
		}

		const response = await apiClient.get<UsageReportSummary>(`${REPORTS_BASE_URL}/reports/usage/summary?${params}`);
		return response.data;
	},

	/**
	 * Get available filter options for usage reports
	 */
	async getUsageFilterOptions(): Promise<ReportFilterOptions> {
		const response = await apiClient.get<ReportFilterOptions>(`${REPORTS_BASE_URL}/reports/usage/filter-options`);
		return response.data;
	}
};

/**
 * User Reports Service - RF32
 */
export const userReportsService = {
	/**
	 * Generate user reservations report
	 */
	async generateUserReport(filters: UserReportFilters): Promise<UserReportResponse> {
		const params = new URLSearchParams();

		if (filters.userIds?.length) {
			filters.userIds.forEach((id) => params.append('userIds', id));
		}

		if (filters.roles?.length) {
			filters.roles.forEach((role) => params.append('roles', role));
		}

		if (filters.startDate) params.append('startDate', filters.startDate);

		if (filters.endDate) params.append('endDate', filters.endDate);

		if (filters.includeDetails !== undefined) {
			params.append('includeDetails', filters.includeDetails.toString());
		}

		if (filters.page) params.append('page', filters.page.toString());

		if (filters.limit) params.append('limit', filters.limit.toString());

		const response = await apiClient.get<UserReportResponse>(`${REPORTS_BASE_URL}/reports/users?${params}`);
		return response.data;
	},

	/**
	 * Get user report summary statistics
	 */
	async getUserReportSummary(filters: UserReportFilters): Promise<UserReportSummary> {
		const params = new URLSearchParams();

		if (filters.userIds?.length) {
			filters.userIds.forEach((id) => params.append('userIds', id));
		}

		if (filters.roles?.length) {
			filters.roles.forEach((role) => params.append('roles', role));
		}

		if (filters.startDate) params.append('startDate', filters.startDate);

		if (filters.endDate) params.append('endDate', filters.endDate);

		const response = await apiClient.get<UserReportSummary>(`${REPORTS_BASE_URL}/reports/users/summary?${params}`);
		return response.data;
	},

	/**
	 * Get current user's personal statistics
	 */
	async getMyStats(): Promise<PersonalStats> {
		const response = await apiClient.get<PersonalStats>(`${REPORTS_BASE_URL}/reports/users/my-stats`);
		return response.data;
	},

	/**
	 * Get user report history
	 */
	async getReportHistory(reportType?: string, limit?: number): Promise<ExportHistory[]> {
		const params = new URLSearchParams();

		if (reportType) params.append('reportType', reportType);

		if (limit) params.append('limit', limit.toString());

		const response = await apiClient.get<ExportHistory[]>(`${REPORTS_BASE_URL}/reports/users/history?${params}`);
		return response.data;
	}
};

/**
 * Export Reports Service - RF33
 */
export const exportReportsService = {
	/**
	 * Export report to CSV format
	 */
	async exportToCsv(config: ExportCsvConfig): Promise<ExportResponse> {
		const response = await apiClient.post<ExportResponse>(`${REPORTS_BASE_URL}/reports/export/csv`, config);
		return response.data;
	},

	/**
	 * Download exported file
	 */
	async downloadExport(exportId: string): Promise<Blob> {
		const response = await apiClient.get<Blob>(`${REPORTS_BASE_URL}/reports/export/download/${exportId}`);
		return response.data;
	},

	/**
	 * Get export history
	 */
	async getExportHistory(limit?: number, reportType?: string): Promise<ExportHistory[]> {
		const params = new URLSearchParams();

		if (limit) params.append('limit', limit.toString());

		if (reportType) params.append('reportType', reportType);

		const response = await apiClient.get<ExportHistory[]>(`${REPORTS_BASE_URL}/reports/export/history?${params}`);
		return response.data;
	},

	/**
	 * Get export status
	 */
	async getExportStatus(exportId: string): Promise<ExportStatus> {
		const response = await apiClient.get<ExportStatus>(`${REPORTS_BASE_URL}/reports/export/status/${exportId}`);
		return response.data;
	},

	/**
	 * Get cached report data
	 */
	async getCachedReport(reportId: string): Promise<CachedReport> {
		const response = await apiClient.get<CachedReport>(`${REPORTS_BASE_URL}/reports/export/cached/${reportId}`);
		return response.data;
	}
};

/**
 * General Reports Service
 */
export const reportsService = {
	/**
	 * Get dashboard statistics
	 */
	async getStatistics(): Promise<ReportStatistics> {
		const response = await apiClient.get<ReportStatistics>(`${REPORTS_BASE_URL}/reports/statistics`);
		return response.data;
	},

	/**
	 * Get all filter options for reports
	 */
	async getFilterOptions(): Promise<ReportFilterOptions> {
		const response = await apiClient.get<ReportFilterOptions>(`${REPORTS_BASE_URL}/reports/filter-options`);
		return response.data;
	},

	/**
	 * Validate date range for reports
	 */
	validateDateRange(startDate: string, endDate: string): { valid: boolean; error?: string } {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const now = new Date();
		const maxRange = new Date();
		maxRange.setFullYear(maxRange.getFullYear() - 2); // 2 years max range

		if (start > end) {
			return { valid: false, error: 'La fecha de inicio debe ser anterior a la fecha de fin' };
		}

		if (end > now) {
			return { valid: false, error: 'La fecha de fin no puede ser futura' };
		}

		if (start < maxRange) {
			return { valid: false, error: 'No se pueden generar reportes de más de 2 años de antigüedad' };
		}

		const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays > 365) {
			return { valid: false, error: 'El rango de fechas no puede exceder 1 año' };
		}

		return { valid: true };
	},

	/**
	 * Format date for API calls
	 */
	formatDate(date: Date): string {
		return date.toISOString().split('T')[0];
	},

	/**
	 * Get predefined date ranges
	 */
	getPredefinedRanges() {
		const now = new Date();
		const ranges = [
			{
				label: 'Últimos 7 días',
				startDate: this.formatDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
				endDate: this.formatDate(now)
			},
			{
				label: 'Últimos 30 días',
				startDate: this.formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
				endDate: this.formatDate(now)
			},
			{
				label: 'Últimos 90 días',
				startDate: this.formatDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)),
				endDate: this.formatDate(now)
			},
			{
				label: 'Este semestre',
				startDate: this.getStartOfSemester(now),
				endDate: this.formatDate(now)
			},
			{
				label: 'Este año',
				startDate: this.formatDate(new Date(now.getFullYear(), 0, 1)),
				endDate: this.formatDate(now)
			}
		];

		return ranges;
	},

	/**
	 * Get start of academic semester
	 */
	getStartOfSemester(date: Date): string {
		const year = date.getFullYear();
		const month = date.getMonth();

		// First semester: February - June
		// Second semester: August - December
		if (month < 7) {
			return this.formatDate(new Date(year, 1, 1)); // February 1st
		} else {
			return this.formatDate(new Date(year, 7, 1)); // August 1st
		}
	}
};

// Services are already exported above, no need for duplicate exports
