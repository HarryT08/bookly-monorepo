import { httpClient as apiClient } from '../http/client';
import type {
	MaintenanceRecord,
	CreateMaintenanceRecord,
	UpdateMaintenanceRecord,
	MaintenanceRecordFilters,
	PaginationParams,
	SortParams,
	ApiResponse,
	Statistics
} from './types';

const BASE_URL = '/api/resources/maintenance-records';

export const maintenanceRecordsApi = {
	// CRUD Operations
	async getAll(
		filters?: MaintenanceRecordFilters,
		pagination?: PaginationParams,
		sort?: SortParams
	): Promise<ApiResponse<MaintenanceRecord[]>> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
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

		const response = await apiClient.get<ApiResponse<MaintenanceRecord[]>>(`${BASE_URL}?${params}`);
		return response.data;
	},

	async getById(id: string): Promise<MaintenanceRecord> {
		const response = await apiClient.get<MaintenanceRecord>(`${BASE_URL}/${id}`);
		return response.data;
	},

	async create(data: CreateMaintenanceRecord): Promise<MaintenanceRecord> {
		const response = await apiClient.post<MaintenanceRecord>(BASE_URL, data);
		return response.data;
	},

	async update(id: string, data: UpdateMaintenanceRecord): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}`, data);
		return response.data;
	},

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${BASE_URL}/${id}`);
	},

	// Status Management
	async updateStatus(id: string, status: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/status`, { status });
		return response.data;
	},

	async updateProgress(id: string, completionPercentage: number, notes?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/progress`, {
			completionPercentage,
			notes
		});
		return response.data;
	},

	async assignTechnician(id: string, technicianId: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/assign`, { technicianId });
		return response.data;
	},

	async addTechnicianNotes(id: string, notes: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/technician-notes`, { notes });
		return response.data;
	},

	async setQualityRating(id: string, rating: number, comments?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/quality-rating`, {
			rating,
			comments
		});
		return response.data;
	},

	async scheduleFollowUp(id: string, followUpDate: string, notes?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/follow-up`, { followUpDate, notes });
		return response.data;
	},

	async completeFollowUp(id: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/complete-follow-up`, {});
		return response.data;
	},

	async reschedule(id: string, newScheduledDate: string, reason?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.put<MaintenanceRecord>(`${BASE_URL}/${id}/reschedule`, {
			newScheduledDate,
			reason
		});
		return response.data;
	},

	// Specific Queries
	async getByResource(resourceId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/resource/${resourceId}`);
		return response.data;
	},

	async getByUser(userId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/user/${userId}`);
		return response.data;
	},

	async getByStatus(status: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/status/${status}`);
		return response.data;
	},

	async getOverdue(): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/overdue`);
		return response.data;
	},

	async getScheduledForDate(date: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/scheduled/${date}`);
		return response.data;
	},

	async getByMaintenanceType(type: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/type/${type}`);
		return response.data;
	},

	async getByTechnician(technicianId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/technician/${technicianId}`);
		return response.data;
	},

	async getRecurring(): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/recurring`);
		return response.data;
	},

	async getRequiringFollowUp(): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/follow-up-required`);
		return response.data;
	},

	async getUpcoming(days?: number): Promise<MaintenanceRecord[]> {
		const url = days ? `${BASE_URL}/upcoming?days=${days}` : `${BASE_URL}/upcoming`;
		const response = await apiClient.get<MaintenanceRecord[]>(url);
		return response.data;
	},

	// Statistics and Reports
	async getStatistics(filters?: MaintenanceRecordFilters, dateFrom?: string, dateTo?: string): Promise<Statistics> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get<Statistics>(`${BASE_URL}/statistics?${params}`);
		return response.data;
	},

	async getResourceHistory(resourceId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/resource/${resourceId}/history`);
		return response.data;
	},

	async getTechnicianWorkload(technicianId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get<MaintenanceRecord[]>(`${BASE_URL}/technician/${technicianId}/workload`);
		return response.data;
	},

	// Bulk Operations
	async createMany(records: CreateMaintenanceRecord[]): Promise<MaintenanceRecord[]> {
		const response = await apiClient.post<MaintenanceRecord[]>(`${BASE_URL}/bulk`, { records });
		return response.data;
	},

	async updateMany(filters: MaintenanceRecordFilters, updates: UpdateMaintenanceRecord): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk`, { filters, updates });
		return response.data;
	},

	async deleteMany(filters: MaintenanceRecordFilters): Promise<{ count: number }> {
		const response = await apiClient.post<{ count: number }>(`${BASE_URL}/bulk/delete`, { filters });
		return response.data;
	},

	// Recurring Maintenance
	async scheduleRecurring(baseRecordId: string, occurrences: number): Promise<MaintenanceRecord[]> {
		const response = await apiClient.post<MaintenanceRecord[]>(`${BASE_URL}/recurring/schedule`, {
			baseRecordId,
			occurrences
		});
		return response.data;
	},

	async cancelRecurring(parentRecordId: string): Promise<{ count: number }> {
		const response = await apiClient.delete<{ count: number }>(`${BASE_URL}/recurring/${parentRecordId}`);
		return response.data;
	},

	async rescheduleOverdue(newDate: string): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/overdue/reschedule`, { newDate });
		return response.data;
	},

	// Export functionality
	async exportToCsv(filters?: MaintenanceRecordFilters, dateFrom?: string, dateTo?: string): Promise<Blob> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get<Blob>(`${BASE_URL}/export/csv?${params}`);
		return response.data;
	},

	async exportToPdf(filters?: MaintenanceRecordFilters, dateFrom?: string, dateTo?: string): Promise<Blob> {
		const params = new URLSearchParams();

		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});
		}

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get<Blob>(`${BASE_URL}/export/pdf?${params}`);
		return response.data;
	}
};
