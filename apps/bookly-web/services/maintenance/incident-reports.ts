import { httpClient as apiClient } from '../http/client';
import type {
	IncidentReport,
	CreateIncidentReport,
	UpdateIncidentReport,
	IncidentReportFilters,
	PaginationParams,
	SortParams,
	ApiResponse,
	Statistics
} from './types';

const BASE_URL = '/api/resources/incident-reports';

export const incidentReportsApi = {
	// CRUD Operations
	async getAll(
		filters?: IncidentReportFilters,
		pagination?: PaginationParams,
		sort?: SortParams
	): Promise<ApiResponse<IncidentReport[]>> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, String(v)));
					} else {
						params.append(key, String(value));
					}
				}
			});
		}

		if (pagination) {
			if (pagination.page) params.append('page', String(pagination.page));

			if (pagination.limit) params.append('limit', String(pagination.limit));
		}

		if (sort) {
			if (sort.field) params.append('sortField', sort.field);

			if (sort.direction) params.append('sortDirection', sort.direction);
		}

		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}?${params}`);
		return response;
	},

	async getById(id: string): Promise<IncidentReport> {
		const response = await apiClient.get<IncidentReport>(`${BASE_URL}/${id}`);
		return response.data;
	},

	async create(data: CreateIncidentReport): Promise<IncidentReport> {
		const response = await apiClient.post<IncidentReport>(BASE_URL, data);
		return response.data;
	},

	async update(id: string, data: UpdateIncidentReport): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}`, data);
		return response.data;
	},

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${BASE_URL}/${id}`);
	},

	// Status and Assignment Management
	async updateStatus(id: string, status: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/status`, { status });
		return response.data;
	},

	async assign(id: string, assignedTo: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/assign`, { assignedTo });
		return response.data;
	},

	async setPriority(id: string, priority: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/priority`, { priority });
		return response.data;
	},

	async setSeverity(id: string, severity: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/severity`, { severity });
		return response.data;
	},

	async resolve(
		id: string,
		resolution: string,
		preventiveMeasures?: string,
		actualCost?: number
	): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/resolve`, {
			resolution,
			preventiveMeasures,
			actualCost
		});
		return response.data;
	},

	async close(id: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/close`);
		return response.data;
	},

	async reopen(id: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/reopen`);
		return response.data;
	},

	async escalate(id: string, newPriority: string, newSeverity: string, reason?: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/escalate`, {
			newPriority,
			newSeverity,
			reason
		});
		return response.data;
	},

	// Incident Management
	async linkIncidents(id: string, relatedIncidentIds: string[]): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/link`, { relatedIncidentIds });
		return response.data;
	},

	async addWitness(id: string, witnessId: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/witnesses`, { witnessId });
		return response.data;
	},

	async addAttachment(id: string, attachmentUrl: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/attachments`, { attachmentUrl });
		return response.data;
	},

	async requireMaintenance(id: string, maintenanceRecordId?: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/maintenance`, { maintenanceRecordId });
		return response.data;
	},

	async scheduleFollowUp(id: string, followUpDate: string, notes?: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/follow-up`, { followUpDate, notes });
		return response.data;
	},

	async completeFollowUp(id: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/complete-follow-up`);
		return response.data;
	},

	async setRootCause(id: string, rootCause: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/root-cause`, { rootCause });
		return response.data;
	},

	async addCorrectiveAction(id: string, action: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/corrective-actions`, { action });
		return response.data;
	},

	async addTag(id: string, tag: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/tags`, { tag });
		return response.data;
	},

	async updateCosts(id: string, estimatedCost?: number, actualCost?: number): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/costs`, {
			estimatedCost,
			actualCost
		});
		return response.data;
	},

	// Insurance and Legal
	async createInsuranceClaim(id: string, claimNumber: string, insuranceCompany?: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/insurance-claim`, {
			claimNumber,
			insuranceCompany
		});
		return response.data;
	},

	async createPoliceReport(id: string, reportNumber: string, policeStation?: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/police-report`, {
			reportNumber,
			policeStation
		});
		return response.data;
	},

	async recordAction(id: string, action: string, userId?: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/actions`, {
			action,
			userId
		});
		return response.data;
	},

	async updateProgress(id: string, progressPercentage: number, notes?: string): Promise<IncidentReport> {
		const response = await apiClient.put<IncidentReport>(`${BASE_URL}/${id}/progress`, {
			progressPercentage,
			notes
		});
		return response.data;
	},

	// Specific Queries
	async getByResource(resourceId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/resource/${resourceId}`);
		return response.data;
	},

	async getByReporter(reportedBy: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/reporter/${reportedBy}`);
		return response.data;
	},

	async getByAssignee(assignedTo: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/assignee/${assignedTo}`);
		return response.data;
	},

	async getByStatus(status: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/status/${status}`);
		return response.data;
	},

	async getIncidentsBySeverity(query?: IncidentReportFilters): Promise<Statistics> {
		const params = new URLSearchParams();

		if (query) {
			Object.entries(query).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const url = params.toString() ? `${BASE_URL}/reports/by-severity?${params}` : `${BASE_URL}/reports/by-severity`;
		const response = await apiClient.get<Statistics>(url);
		return response.data;
	},

	async getByIncidentType(incidentType: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/type/${incidentType}`);
		return response.data;
	},

	async getOverdue(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/overdue`);
		return response.data;
	},

	async getRequiringAttention(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/attention-required`);
		return response.data;
	},

	async getWithFinancialImpact(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/financial-impact`);
		return response.data;
	},

	async getRequiringFollowUp(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/follow-up-required`);
		return response.data;
	},

	async getRequiringMaintenance(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/maintenance-required`);
		return response.data;
	},

	async getWithInsuranceClaims(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/insurance-claims`);
		return response.data;
	},

	async getWithPoliceReports(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/police-reports`);
		return response.data;
	},

	async getRecurring(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/recurring`);
		return response.data;
	},

	async getByTags(tags: string[]): Promise<IncidentReport[]> {
		const params = new URLSearchParams();
		tags.forEach((tag) => params.append('tags', tag));
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/tags?${params}`);
		return response.data;
	},

	async getRelated(incidentId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/${incidentId}/related`);
		return response.data;
	},

	async getRecent(days?: number): Promise<IncidentReport[]> {
		const url = days ? `${BASE_URL}/recent?days=${days}` : `${BASE_URL}/recent`;
		const response = await apiClient.get<IncidentReport[]>(url);
		return response.data;
	},

	async getThisMonth(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/this-month`);
		return response.data;
	},

	async getThisWeek(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/this-week`);
		return response.data;
	},

	async getByDateRange(startDate: string, endDate: string): Promise<IncidentReport[]> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/date-range?${params}`);
		return response.data;
	},

	// Reporting and Analytics
	async generateSummaryReport(query?: IncidentReportFilters): Promise<ApiResponse<Statistics>> {
		const params = new URLSearchParams();

		if (query) {
			Object.entries(query).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const url = params.toString() ? `${BASE_URL}/reports/summary?${params}` : `${BASE_URL}/reports/summary`;
		const response = await apiClient.get<ApiResponse<Statistics>>(url);
		return response.data;
	},

	async getIncidentsByType(query?: IncidentReportFilters): Promise<Statistics> {
		const params = new URLSearchParams();

		if (query) {
			Object.entries(query).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		const url = params.toString() ? `${BASE_URL}/reports/by-type?${params}` : `${BASE_URL}/reports/by-type`;
		const response = await apiClient.get<Statistics>(url);
		return response.data;
	},

	// Statistics and Analytics
	async getStatistics(filters?: IncidentReportFilters, dateFrom?: string, dateTo?: string): Promise<Statistics> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, String(v)));
					} else {
						params.append(key, String(value));
					}
				}
			});
		}

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get<Statistics>(`${BASE_URL}/statistics?${params}`);
		return response.data;
	},

	async getResourceHistory(resourceId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/resource/${resourceId}/history`);
		return response.data;
	},

	async getUserHistory(userId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/user/${userId}/history`);
		return response.data;
	},

	async getTrends(months?: number): Promise<Record<string, number>> {
		const url = months ? `${BASE_URL}/trends?months=${months}` : `${BASE_URL}/trends`;
		const response = await apiClient.get<Record<string, number>>(url);
		return response.data;
	},

	async getTopAffectedResources(limit?: number): Promise<{ resourceId: string; count: number }[]> {
		const url = limit ? `${BASE_URL}/top-affected-resources?limit=${limit}` : `${BASE_URL}/top-affected-resources`;
		const response = await apiClient.get<{ resourceId: string; count: number }[]>(url);
		return response.data;
	},

	async getCostAnalysis(
		dateFrom?: string,
		dateTo?: string
	): Promise<{
		totalEstimated: number;
		totalActual: number;
		variance: number;
		byType: Record<string, { estimated: number; actual: number }>;
	}> {
		const params = new URLSearchParams();

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get<{
			totalEstimated: number;
			totalActual: number;
			variance: number;
			byType: Record<string, { estimated: number; actual: number }>;
		}>(`${BASE_URL}/cost-analysis?${params}`);
		return response.data;
	},

	async getSimilarIncidents(resourceId: string, incidentType: string, daysBack?: number): Promise<IncidentReport[]> {
		const params = new URLSearchParams();
		params.append('resourceId', resourceId);
		params.append('incidentType', incidentType);

		if (daysBack) params.append('daysBack', String(daysBack));

		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/similar?${params}`);
		return response.data;
	},

	async getEscalated(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/escalated`);
		return response.data;
	},

	async getUnassigned(): Promise<IncidentReport[]> {
		const response = await apiClient.get<IncidentReport[]>(`${BASE_URL}/unassigned`);
		return response.data;
	},

	async getDelayedResolutions(daysThreshold?: number): Promise<IncidentReport[]> {
		const url = daysThreshold
			? `${BASE_URL}/delayed-resolutions?threshold=${daysThreshold}`
			: `${BASE_URL}/delayed-resolutions`;
		const response = await apiClient.get<IncidentReport[]>(url);
		return response.data;
	},

	// Bulk Operations
	async createMany(reports: CreateIncidentReport[]): Promise<IncidentReport[]> {
		const response = await apiClient.post<IncidentReport[]>(`${BASE_URL}/bulk`, { reports });
		return response.data;
	},

	async updateMany(filters: IncidentReportFilters, updates: UpdateIncidentReport): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk`, {
			filters,
			updates
		});
		return response.data;
	},

	async deleteMany(filters: IncidentReportFilters): Promise<{ count: number }> {
		const response = await apiClient.post<{ count: number }>(`${BASE_URL}/bulk/delete`, { filters });
		return response.data;
	},

	async bulkAssign(incidentIds: string[], assignedTo: string): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk/assign`, {
			incidentIds,
			assignedTo
		});
		return response.data;
	},

	async bulkUpdateStatus(incidentIds: string[], status: string): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk/status`, {
			incidentIds,
			status
		});
		return response.data;
	},

	async bulkUpdatePriority(incidentIds: string[], priority: string): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk/priority`, {
			incidentIds,
			priority
		});
		return response.data;
	},

	// Report Generation
	async generateReport(
		filters?: IncidentReportFilters,
		dateFrom?: string,
		dateTo?: string
	): Promise<{
		summary: Statistics;
		incidents: IncidentReport[];
		recommendations: string[];
	}> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, String(v)));
					} else {
						params.append(key, String(value));
					}
				}
			});
		}

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get<{
			summary: Statistics;
			incidents: IncidentReport[];
			recommendations: string[];
		}>(`${BASE_URL}/generate-report?${params}`);
		return response.data;
	},

	// Export functionality
	async exportToCsv(filters?: IncidentReportFilters, dateFrom?: string, dateTo?: string): Promise<Blob> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, String(v)));
					} else {
						params.append(key, String(value));
					}
				}
			});
		}

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get(`${BASE_URL}/export/csv?${params}`);
		return response.data as Blob;
	},

	async exportToPdf(filters?: IncidentReportFilters, dateFrom?: string, dateTo?: string): Promise<Blob> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, String(v)));
					} else {
						params.append(key, String(value));
					}
				}
			});
		}

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get(`${BASE_URL}/export/pdf?${params}`);
		return response.data as Blob;
	}
};
