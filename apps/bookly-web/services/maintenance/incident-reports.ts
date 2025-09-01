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

		const response = await apiClient.get(`${BASE_URL}?${params}`);
		return response.json();
	},

	async getById(id: string): Promise<IncidentReport> {
		const response = await apiClient.get(`${BASE_URL}/${id}`);
		return response.json();
	},

	async create(data: CreateIncidentReport): Promise<IncidentReport> {
		const response = await apiClient.post(BASE_URL, { json: data });
		return response.json();
	},

	async update(id: string, data: UpdateIncidentReport): Promise<IncidentReport> {
		const response = await apiClient.put(`${BASE_URL}/${id}`, { json: data });
		return response.json();
	},

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${BASE_URL}/${id}`);
	},

	// Status and Assignment Management
	async updateStatus(id: string, status: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/status`, {
			json: { status }
		});
		return response.json();
	},

	async assign(id: string, assignedTo: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/assign`, {
			json: { assignedTo }
		});
		return response.json();
	},

	async setPriority(id: string, priority: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/priority`, {
			json: { priority }
		});
		return response.json();
	},

	async setSeverity(id: string, severity: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/severity`, {
			json: { severity }
		});
		return response.json();
	},

	async resolve(
		id: string,
		resolution: string,
		preventiveMeasures?: string,
		actualCost?: number
	): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/resolve`, {
			json: { resolution, preventiveMeasures, actualCost }
		});
		return response.json();
	},

	async close(id: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/close`);
		return response.json();
	},

	async reopen(id: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/reopen`);
		return response.json();
	},

	async escalate(id: string, newPriority: string, newSeverity: string, reason?: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/escalate`, {
			json: { newPriority, newSeverity, reason }
		});
		return response.json();
	},

	// Incident Management
	async linkIncidents(id: string, relatedIncidentIds: string[]): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/link`, {
			json: { relatedIncidentIds }
		});
		return response.json();
	},

	async addWitness(id: string, witnessId: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/witnesses`, {
			json: { witnessId }
		});
		return response.json();
	},

	async addAttachment(id: string, attachmentUrl: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/attachments`, {
			json: { attachmentUrl }
		});
		return response.json();
	},

	async requireMaintenance(id: string, maintenanceRecordId?: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/maintenance`, {
			json: { maintenanceRecordId }
		});
		return response.json();
	},

	async scheduleFollowUp(id: string, followUpDate: string, notes?: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/follow-up`, {
			json: { followUpDate, notes }
		});
		return response.json();
	},

	async completeFollowUp(id: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/complete-follow-up`);
		return response.json();
	},

	async setRootCause(id: string, rootCause: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/root-cause`, {
			json: { rootCause }
		});
		return response.json();
	},

	async addCorrectiveAction(id: string, action: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/corrective-actions`, {
			json: { action }
		});
		return response.json();
	},

	async addTag(id: string, tag: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/tags`, {
			json: { tag }
		});
		return response.json();
	},

	async updateCosts(id: string, estimatedCost?: number, actualCost?: number): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/costs`, {
			json: { estimatedCost, actualCost }
		});
		return response.json();
	},

	// Insurance and Legal
	async createInsuranceClaim(id: string, claimNumber: string, description?: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/insurance-claim`, {
			json: { claimNumber, description }
		});
		return response.json();
	},

	async createPoliceReport(id: string, reportNumber: string, policeStation?: string): Promise<IncidentReport> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/police-report`, {
			json: { reportNumber, policeStation }
		});
		return response.json();
	},

	// Specific Queries
	async getByResource(resourceId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/resource/${resourceId}`);
		return response.json();
	},

	async getByReporter(reportedBy: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/reporter/${reportedBy}`);
		return response.json();
	},

	async getByAssignee(assignedTo: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/assignee/${assignedTo}`);
		return response.json();
	},

	async getByStatus(status: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/status/${status}`);
		return response.json();
	},

	async getBySeverity(severity: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/severity/${severity}`);
		return response.json();
	},

	async getByIncidentType(incidentType: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/type/${incidentType}`);
		return response.json();
	},

	async getOverdue(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/overdue`);
		return response.json();
	},

	async getRequiringAttention(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/attention-required`);
		return response.json();
	},

	async getWithFinancialImpact(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/financial-impact`);
		return response.json();
	},

	async getRequiringFollowUp(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/follow-up-required`);
		return response.json();
	},

	async getRequiringMaintenance(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/maintenance-required`);
		return response.json();
	},

	async getWithInsuranceClaims(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/insurance-claims`);
		return response.json();
	},

	async getWithPoliceReports(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/police-reports`);
		return response.json();
	},

	async getRecurring(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/recurring`);
		return response.json();
	},

	async getByTags(tags: string[]): Promise<IncidentReport[]> {
		const params = new URLSearchParams();
		tags.forEach((tag) => params.append('tags', tag));
		const response = await apiClient.get(`${BASE_URL}/tags?${params}`);
		return response.json();
	},

	async getRelated(incidentId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/${incidentId}/related`);
		return response.json();
	},

	async getRecent(days?: number): Promise<IncidentReport[]> {
		const url = days ? `${BASE_URL}/recent?days=${days}` : `${BASE_URL}/recent`;
		const response = await apiClient.get(url);
		return response.json();
	},

	async getThisMonth(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/this-month`);
		return response.json();
	},

	async getThisWeek(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/this-week`);
		return response.json();
	},

	async getByDateRange(startDate: string, endDate: string): Promise<IncidentReport[]> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);
		const response = await apiClient.get(`${BASE_URL}/date-range?${params}`);
		return response.json();
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

		const response = await apiClient.get(`${BASE_URL}/statistics?${params}`);
		return response.json();
	},

	async getResourceHistory(resourceId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/resource/${resourceId}/history`);
		return response.json();
	},

	async getUserHistory(userId: string): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/user/${userId}/history`);
		return response.json();
	},

	async getTrends(months?: number): Promise<Record<string, number>> {
		const url = months ? `${BASE_URL}/trends?months=${months}` : `${BASE_URL}/trends`;
		const response = await apiClient.get(url);
		return response.json();
	},

	async getTopAffectedResources(limit?: number): Promise<{ resourceId: string; count: number }[]> {
		const url = limit ? `${BASE_URL}/top-affected-resources?limit=${limit}` : `${BASE_URL}/top-affected-resources`;
		const response = await apiClient.get(url);
		return response.json();
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

		const response = await apiClient.get(`${BASE_URL}/cost-analysis?${params}`);
		return response.json();
	},

	async getSimilarIncidents(resourceId: string, incidentType: string, daysBack?: number): Promise<IncidentReport[]> {
		const params = new URLSearchParams();
		params.append('resourceId', resourceId);
		params.append('incidentType', incidentType);

		if (daysBack) params.append('daysBack', String(daysBack));

		const response = await apiClient.get(`${BASE_URL}/similar?${params}`);
		return response.json();
	},

	async getEscalated(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/escalated`);
		return response.json();
	},

	async getUnassigned(): Promise<IncidentReport[]> {
		const response = await apiClient.get(`${BASE_URL}/unassigned`);
		return response.json();
	},

	async getDelayedResolutions(daysThreshold?: number): Promise<IncidentReport[]> {
		const url = daysThreshold
			? `${BASE_URL}/delayed-resolutions?threshold=${daysThreshold}`
			: `${BASE_URL}/delayed-resolutions`;
		const response = await apiClient.get(url);
		return response.json();
	},

	// Bulk Operations
	async createMany(reports: CreateIncidentReport[]): Promise<IncidentReport[]> {
		const response = await apiClient.post(`${BASE_URL}/bulk`, { json: { reports } });
		return response.json();
	},

	async updateMany(filters: IncidentReportFilters, updates: UpdateIncidentReport): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk`, {
			json: { filters, updates }
		});
		return response.json();
	},

	async deleteMany(filters: IncidentReportFilters): Promise<{ count: number }> {
		const response = await apiClient.delete(`${BASE_URL}/bulk`, {
			json: { filters }
		});
		return response.json();
	},

	async bulkAssign(incidentIds: string[], assignedTo: string): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk/assign`, {
			json: { incidentIds, assignedTo }
		});
		return response.json();
	},

	async bulkUpdateStatus(incidentIds: string[], status: string): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk/status`, {
			json: { incidentIds, status }
		});
		return response.json();
	},

	async bulkUpdatePriority(incidentIds: string[], priority: string): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk/priority`, {
			json: { incidentIds, priority }
		});
		return response.json();
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

		const response = await apiClient.get(`${BASE_URL}/generate-report?${params}`);
		return response.json();
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
		return response.blob();
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
		return response.blob();
	}
};
