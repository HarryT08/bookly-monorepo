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

		const response = await apiClient.get(`${BASE_URL}?${params}`);
		return response.json();
	},

	async getById(id: string): Promise<MaintenanceRecord> {
		const response = await apiClient.get(`${BASE_URL}/${id}`);
		return response.json();
	},

	async create(data: CreateMaintenanceRecord): Promise<MaintenanceRecord> {
		const response = await apiClient.post(BASE_URL, { json: data });
		return response.json();
	},

	async update(id: string, data: UpdateMaintenanceRecord): Promise<MaintenanceRecord> {
		const response = await apiClient.put(`${BASE_URL}/${id}`, { json: data });
		return response.json();
	},

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${BASE_URL}/${id}`);
	},

	// Status Management
	async updateStatus(id: string, status: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/status`, {
			json: { status }
		});
		return response.json();
	},

	async updateProgress(id: string, completionPercentage: number, notes?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/progress`, {
			json: { completionPercentage, notes }
		});
		return response.json();
	},

	async assignTechnician(id: string, technicianId: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/assign`, {
			json: { technicianId }
		});
		return response.json();
	},

	async addTechnicianNotes(id: string, notes: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/technician-notes`, {
			json: { notes }
		});
		return response.json();
	},

	async setQualityRating(id: string, rating: number, comments?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/quality-rating`, {
			json: { rating, comments }
		});
		return response.json();
	},

	async scheduleFollowUp(id: string, followUpDate: string, notes?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/follow-up`, {
			json: { followUpDate, notes }
		});
		return response.json();
	},

	async completeFollowUp(id: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/complete-follow-up`);
		return response.json();
	},

	async reschedule(id: string, newScheduledDate: string, reason?: string): Promise<MaintenanceRecord> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/reschedule`, {
			json: { newScheduledDate, reason }
		});
		return response.json();
	},

	// Specific Queries
	async getByResource(resourceId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/resource/${resourceId}`);
		return response.json();
	},

	async getByUser(userId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/user/${userId}`);
		return response.json();
	},

	async getByStatus(status: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/status/${status}`);
		return response.json();
	},

	async getOverdue(): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/overdue`);
		return response.json();
	},

	async getScheduledForDate(date: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/scheduled/${date}`);
		return response.json();
	},

	async getByMaintenanceType(type: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/type/${type}`);
		return response.json();
	},

	async getByTechnician(technicianId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/technician/${technicianId}`);
		return response.json();
	},

	async getRecurring(): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/recurring`);
		return response.json();
	},

	async getRequiringFollowUp(): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/follow-up-required`);
		return response.json();
	},

	async getUpcoming(days?: number): Promise<MaintenanceRecord[]> {
		const url = days ? `${BASE_URL}/upcoming?days=${days}` : `${BASE_URL}/upcoming`;
		const response = await apiClient.get(url);
		return response.json();
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

		const response = await apiClient.get(`${BASE_URL}/statistics?${params}`);
		return response.json();
	},

	async getResourceHistory(resourceId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/resource/${resourceId}/history`);
		return response.json();
	},

	async getTechnicianWorkload(technicianId: string): Promise<MaintenanceRecord[]> {
		const response = await apiClient.get(`${BASE_URL}/technician/${technicianId}/workload`);
		return response.json();
	},

	// Bulk Operations
	async createMany(records: CreateMaintenanceRecord[]): Promise<MaintenanceRecord[]> {
		const response = await apiClient.post(`${BASE_URL}/bulk`, { json: { records } });
		return response.json();
	},

	async updateMany(filters: MaintenanceRecordFilters, updates: UpdateMaintenanceRecord): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk`, {
			json: { filters, updates }
		});
		return response.json();
	},

	async deleteMany(filters: MaintenanceRecordFilters): Promise<{ count: number }> {
		const response = await apiClient.delete(`${BASE_URL}/bulk`, {
			json: { filters }
		});
		return response.json();
	},

	// Recurring Maintenance
	async scheduleRecurring(baseRecordId: string, occurrences: number): Promise<MaintenanceRecord[]> {
		const response = await apiClient.post(`${BASE_URL}/recurring/schedule`, {
			json: { baseRecordId, occurrences }
		});
		return response.json();
	},

	async cancelRecurring(parentRecordId: string): Promise<{ count: number }> {
		const response = await apiClient.delete(`${BASE_URL}/recurring/${parentRecordId}`);
		return response.json();
	},

	async rescheduleOverdue(newDate: string): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/overdue/reschedule`, {
			json: { newDate }
		});
		return response.json();
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

		const response = await apiClient.get(`${BASE_URL}/export/csv?${params}`);
		return response.blob();
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

		const response = await apiClient.get(`${BASE_URL}/export/pdf?${params}`);
		return response.blob();
	}
};
