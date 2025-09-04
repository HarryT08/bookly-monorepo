import { reportsClient } from '../http';
import type { ApiResponse } from '../http/types';

/**
 * Advanced Reports Service - Hito 5: RF-31 to RF-37
 * Implements missing 87% of Reports Service endpoints
 */

export interface ScheduledReport {
	id: string;
	name: string;
	type: 'USAGE' | 'USER' | 'CUSTOM';
	schedule: 'DAILY' | 'WEEKLY' | 'MONTHLY';
	filters: Record<string, any>;
	recipients: string[];
	format: 'PDF' | 'CSV' | 'EXCEL';
	isActive: boolean;
	lastRun?: string;
	nextRun: string;
	createdBy: string;
	createdAt: string;
}

export interface CustomReport {
	id: string;
	name: string;
	description: string;
	query: string;
	parameters: ReportParameter[];
	isPublic: boolean;
	createdBy: string;
	createdAt: string;
	usageCount: number;
}

export interface ReportTemplate {
	id: string;
	name: string;
	type: 'USAGE' | 'USER' | 'CUSTOM';
	layout: 'STANDARD' | 'COMPACT' | 'DETAILED';
	sections: ReportSection[];
	styling: Record<string, any>;
	isDefault: boolean;
	createdBy: string;
}

export interface ReportSection {
	id: string;
	type: 'HEADER' | 'CHART' | 'TABLE' | 'TEXT' | 'FOOTER';
	title: string;
	content: Record<string, any>;
	order: number;
}

export interface ReportParameter {
	name: string;
	type: 'STRING' | 'NUMBER' | 'DATE' | 'SELECT';
	label: string;
	required: boolean;
	defaultValue?: any;
	options?: string[];
}

export interface AlertRule {
	id: string;
	name: string;
	metric: string;
	condition: 'GREATER' | 'LESS' | 'EQUAL' | 'CONTAINS';
	threshold: number | string;
	frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY';
	recipients: string[];
	isActive: boolean;
	lastTriggered?: string;
}

export interface PerformanceMetrics {
	queryTime: number;
	dataPoints: number;
	cacheHitRate: number;
	systemLoad: number;
	memoryUsage: number;
	activeUsers: number;
}

// Scheduled Reports Service - RF-37
export const scheduledReportsService = {
	async getScheduledReports(params?: {
		type?: string;
		isActive?: boolean;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<ScheduledReport[]>> {
		const searchParams = new URLSearchParams();

		if (params?.type) searchParams.append('type', params.type);

		if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return reportsClient.get(`/scheduled-reports?${searchParams}`).json();
	},

	async createScheduledReport(data: {
		name: string;
		type: 'USAGE' | 'USER' | 'CUSTOM';
		schedule: 'DAILY' | 'WEEKLY' | 'MONTHLY';
		filters: Record<string, any>;
		recipients: string[];
		format: 'PDF' | 'CSV' | 'EXCEL';
	}): Promise<ApiResponse<ScheduledReport>> {
		return reportsClient.post('/scheduled-reports/create', { json: data }).json();
	},

	async updateScheduledReport(id: string, data: Partial<ScheduledReport>): Promise<ApiResponse<ScheduledReport>> {
		return reportsClient.put(`/scheduled-reports/${id}`, { json: data }).json();
	},

	async deleteScheduledReport(id: string): Promise<ApiResponse<void>> {
		return reportsClient.delete(`/scheduled-reports/${id}`).json();
	},

	async executeScheduledReport(id: string): Promise<ApiResponse<{ jobId: string }>> {
		return reportsClient.post(`/scheduled-reports/${id}/execute`).json();
	},

	async getExecutionHistory(id: string): Promise<ApiResponse<any[]>> {
		return reportsClient.get(`/scheduled-reports/${id}/history`).json();
	}
};

// Custom Reports Service
export const customReportsService = {
	async getCustomReports(params?: {
		isPublic?: boolean;
		createdBy?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<CustomReport[]>> {
		const searchParams = new URLSearchParams();

		if (params?.isPublic !== undefined) searchParams.append('isPublic', params.isPublic.toString());

		if (params?.createdBy) searchParams.append('createdBy', params.createdBy);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return reportsClient.get(`/custom-reports?${searchParams}`).json();
	},

	async createCustomReport(data: {
		name: string;
		description: string;
		query: string;
		parameters: ReportParameter[];
		isPublic: boolean;
	}): Promise<ApiResponse<CustomReport>> {
		return reportsClient.post('/custom-reports/create', { json: data }).json();
	},

	async updateCustomReport(id: string, data: Partial<CustomReport>): Promise<ApiResponse<CustomReport>> {
		return reportsClient.put(`/custom-reports/${id}`, { json: data }).json();
	},

	async deleteCustomReport(id: string): Promise<ApiResponse<void>> {
		return reportsClient.delete(`/custom-reports/${id}`).json();
	},

	async executeCustomReport(id: string, parameters: Record<string, any>): Promise<ApiResponse<any>> {
		return reportsClient.post(`/custom-reports/${id}/execute`, { json: { parameters } }).json();
	}
};

// Report Templates Service
export const reportTemplatesService = {
	async getTemplates(type?: string): Promise<ApiResponse<ReportTemplate[]>> {
		const params = type ? `?type=${type}` : '';
		return reportsClient.get(`/report-templates${params}`).json();
	},

	async createTemplate(data: {
		name: string;
		type: 'USAGE' | 'USER' | 'CUSTOM';
		layout: 'STANDARD' | 'COMPACT' | 'DETAILED';
		sections: ReportSection[];
		styling: Record<string, any>;
	}): Promise<ApiResponse<ReportTemplate>> {
		return reportsClient.post('/report-templates/create', { json: data }).json();
	},

	async updateTemplate(id: string, data: Partial<ReportTemplate>): Promise<ApiResponse<ReportTemplate>> {
		return reportsClient.put(`/report-templates/${id}`, { json: data }).json();
	},

	async deleteTemplate(id: string): Promise<ApiResponse<void>> {
		return reportsClient.delete(`/report-templates/${id}`).json();
	},

	async previewTemplate(id: string, sampleData: Record<string, any>): Promise<ApiResponse<{ preview: string }>> {
		return reportsClient.post(`/report-templates/${id}/preview`, { json: { sampleData } }).json();
	}
};

// Alert Management Service
export const alertsService = {
	async getAlerts(params?: {
		isActive?: boolean;
		metric?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<AlertRule[]>> {
		const searchParams = new URLSearchParams();

		if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

		if (params?.metric) searchParams.append('metric', params.metric);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return reportsClient.get(`/alerts/list?${searchParams}`).json();
	},

	async createAlert(data: {
		name: string;
		metric: string;
		condition: 'GREATER' | 'LESS' | 'EQUAL' | 'CONTAINS';
		threshold: number | string;
		frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY';
		recipients: string[];
	}): Promise<ApiResponse<AlertRule>> {
		return reportsClient.post('/alerts/create', { json: data }).json();
	},

	async updateAlert(id: string, data: Partial<AlertRule>): Promise<ApiResponse<AlertRule>> {
		return reportsClient.put(`/alerts/${id}`, { json: data }).json();
	},

	async deleteAlert(id: string): Promise<ApiResponse<void>> {
		return reportsClient.delete(`/alerts/${id}`).json();
	},

	async getAlertHistory(id?: string): Promise<ApiResponse<any[]>> {
		const url = id ? `/alerts/history?alertId=${id}` : '/alerts/history';
		return reportsClient.get(url).json();
	},

	async configureThresholds(data: Record<string, number>): Promise<ApiResponse<void>> {
		return reportsClient.post('/alerts/thresholds', { json: data }).json();
	}
};

// Performance Monitoring Service
export const performanceService = {
	async getPerformanceMetrics(): Promise<ApiResponse<PerformanceMetrics>> {
		return reportsClient.get('/performance').json();
	},

	async getQueryPerformance(params?: {
		startDate?: string;
		endDate?: string;
		limit?: number;
	}): Promise<ApiResponse<any[]>> {
		const searchParams = new URLSearchParams();

		if (params?.startDate) searchParams.append('startDate', params.startDate);

		if (params?.endDate) searchParams.append('endDate', params.endDate);

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return reportsClient.get(`/performance/queries?${searchParams}`).json();
	},

	async getCacheStatistics(): Promise<
		ApiResponse<{
			hitRate: number;
			missRate: number;
			totalRequests: number;
			cacheSize: number;
			evictions: number;
		}>
	> {
		return reportsClient.get('/performance/cache').json();
	},

	async getSystemMetrics(): Promise<
		ApiResponse<{
			cpu: number;
			memory: number;
			disk: number;
			network: number;
			activeConnections: number;
		}>
	> {
		return reportsClient.get('/performance/system').json();
	}
};

// Data Processing Service
export const dataProcessingService = {
	async aggregateData(data: {
		sources: string[];
		metrics: string[];
		dimensions: string[];
		timeRange: { start: string; end: string };
		granularity: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
	}): Promise<ApiResponse<any>> {
		return reportsClient.post('/data-processing/aggregation', { json: data }).json();
	},

	async validateData(
		source: string,
		rules: any[]
	): Promise<
		ApiResponse<{
			valid: boolean;
			errors: any[];
			warnings: any[];
		}>
	> {
		return reportsClient
			.post('/data-processing/validation', {
				json: { source, rules }
			})
			.json();
	},

	async cleanseData(
		source: string,
		operations: any[]
	): Promise<
		ApiResponse<{
			processed: number;
			cleaned: number;
			removed: number;
		}>
	> {
		return reportsClient
			.post('/data-processing/cleansing', {
				json: { source, operations }
			})
			.json();
	},

	async refreshData(sources?: string[]): Promise<ApiResponse<{ jobId: string }>> {
		return reportsClient
			.post('/data-processing/refresh', {
				json: { sources }
			})
			.json();
	},

	async getProcessingStatus(jobId?: string): Promise<ApiResponse<any>> {
		const url = jobId ? `/data-processing/status?jobId=${jobId}` : '/data-processing/status';
		return reportsClient.get(url).json();
	}
};
