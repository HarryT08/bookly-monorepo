import { httpClient as apiClient } from '../http/client';
import type {
	ScheduledMaintenance,
	CreateScheduledMaintenance,
	UpdateScheduledMaintenance,
	ScheduledMaintenanceFilters,
	PaginationParams,
	SortParams,
	ApiResponse,
	Statistics,
	TimeSlot,
	ConflictCheck
} from './types';

const BASE_URL = '/api/resources/scheduled-maintenance';

export const scheduledMaintenanceApi = {
	// CRUD Operations
	async getAll(
		filters?: ScheduledMaintenanceFilters,
		pagination?: PaginationParams,
		sort?: SortParams
	): Promise<ApiResponse<ScheduledMaintenance[]>> {
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

	async getById(id: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.get(`${BASE_URL}/${id}`);
		return response.json();
	},

	async create(data: CreateScheduledMaintenance): Promise<ScheduledMaintenance> {
		const response = await apiClient.post(BASE_URL, { json: data });
		return response.json();
	},

	async update(id: string, data: UpdateScheduledMaintenance): Promise<ScheduledMaintenance> {
		const response = await apiClient.put(`${BASE_URL}/${id}`, { json: data });
		return response.json();
	},

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${BASE_URL}/${id}`);
	},

	// Status and Assignment Management
	async updateStatus(id: string, status: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/status`, {
			json: { status }
		});
		return response.json();
	},

	async assignTechnician(id: string, technicianId: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/assign`, {
			json: { technicianId }
		});
		return response.json();
	},

	async setPriority(id: string, priority: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/priority`, {
			json: { priority }
		});
		return response.json();
	},

	async reschedule(id: string, newScheduledDate: string, reason?: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/reschedule`, {
			json: { newScheduledDate, reason }
		});
		return response.json();
	},

	async postpone(id: string, postponedTo: string, reason: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/postpone`, {
			json: { postponedTo, reason }
		});
		return response.json();
	},

	async cancel(id: string, reason: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/cancel`, {
			json: { reason }
		});
		return response.json();
	},

	async approve(id: string, comments?: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/approve`, {
			json: { comments }
		});
		return response.json();
	},

	async complete(
		id: string,
		actualDuration: number,
		completionNotes?: string,
		qualityRating?: number,
		maintenanceRecordId?: string
	): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/complete`, {
			json: {
				actualDuration,
				completionNotes,
				qualityRating,
				maintenanceRecordId
			}
		});
		return response.json();
	},

	async markReminderSent(id: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/reminder-sent`);
		return response.json();
	},

	// Requirements Management
	async addRequirement(id: string, requirement: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/requirements`, {
			json: { requirement }
		});
		return response.json();
	},

	async removeRequirement(id: string, requirement: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.delete(`${BASE_URL}/${id}/requirements`, {
			json: { requirement }
		});
		return response.json();
	},

	async addAttachment(id: string, attachmentUrl: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/attachments`, {
			json: { attachmentUrl }
		});
		return response.json();
	},

	async addTag(id: string, tag: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/tags`, {
			json: { tag }
		});
		return response.json();
	},

	async linkMaintenanceRecord(id: string, maintenanceRecordId: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.patch(`${BASE_URL}/${id}/link-record`, {
			json: { maintenanceRecordId }
		});
		return response.json();
	},

	// Specific Queries
	async getByResource(resourceId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/resource/${resourceId}`);
		return response.json();
	},

	async getByTechnician(technicianId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/technician/${technicianId}`);
		return response.json();
	},

	async getByStatus(status: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/status/${status}`);
		return response.json();
	},

	async getByMaintenanceType(type: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/type/${type}`);
		return response.json();
	},

	async getOverdue(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/overdue`);
		return response.json();
	},

	async getDueToday(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/due-today`);
		return response.json();
	},

	async getDueThisWeek(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/due-this-week`);
		return response.json();
	},

	async getDueThisMonth(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/due-this-month`);
		return response.json();
	},

	async getUpcoming(days?: number): Promise<ScheduledMaintenance[]> {
		const url = days ? `${BASE_URL}/upcoming?days=${days}` : `${BASE_URL}/upcoming`;
		const response = await apiClient.get(url);
		return response.json();
	},

	async getRecurring(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/recurring`);
		return response.json();
	},

	async getByParentSchedule(parentScheduleId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/parent/${parentScheduleId}`);
		return response.json();
	},

	async getPendingApproval(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/pending-approval`);
		return response.json();
	},

	async getNeedingReminders(hoursAhead?: number): Promise<ScheduledMaintenance[]> {
		const url = hoursAhead
			? `${BASE_URL}/needing-reminders?hoursAhead=${hoursAhead}`
			: `${BASE_URL}/needing-reminders`;
		const response = await apiClient.get(url);
		return response.json();
	},

	async getByTags(tags: string[]): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();
		tags.forEach((tag) => params.append('tags', tag));
		const response = await apiClient.get(`${BASE_URL}/tags?${params}`);
		return response.json();
	},

	// Date-based queries
	async getByDateRange(startDate: string, endDate: string): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);
		const response = await apiClient.get(`${BASE_URL}/date-range?${params}`);
		return response.json();
	},

	async getScheduledForDate(date: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/scheduled/${date}`);
		return response.json();
	},

	async getCompletedInPeriod(startDate: string, endDate: string): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);
		const response = await apiClient.get(`${BASE_URL}/completed?${params}`);
		return response.json();
	},

	// Statistics and Analytics
	async getStatistics(
		filters?: ScheduledMaintenanceFilters,
		dateFrom?: string,
		dateTo?: string
	): Promise<Statistics> {
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

	async getResourceSchedule(resourceId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get(`${BASE_URL}/resource/${resourceId}/schedule`);
		return response.json();
	},

	async getTechnicianWorkload(
		technicianId: string,
		dateFrom?: string,
		dateTo?: string
	): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get(`${BASE_URL}/technician/${technicianId}/workload?${params}`);
		return response.json();
	},

	async getMaintenanceCalendar(startDate: string, endDate: string): Promise<Record<string, ScheduledMaintenance[]>> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);

		const response = await apiClient.get(`${BASE_URL}/calendar?${params}`);
		return response.json();
	},

	async getRecurringSchedulesSummary(): Promise<
		{
			parentScheduleId: string;
			resourceId: string;
			maintenanceType: string;
			recurringPattern: string;
			nextScheduled: string;
			totalOccurrences: number;
			completedOccurrences: number;
		}[]
	> {
		const response = await apiClient.get(`${BASE_URL}/recurring/summary`);
		return response.json();
	},

	// Recurring Maintenance Management
	async generateRecurringSchedules(baseScheduleId: string, occurrences: number): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.post(`${BASE_URL}/recurring/generate`, {
			json: { baseScheduleId, occurrences }
		});
		return response.json();
	},

	async cancelRecurringSchedules(parentScheduleId: string, reason: string): Promise<{ count: number }> {
		const response = await apiClient.delete(`${BASE_URL}/recurring/${parentScheduleId}`, {
			json: { reason }
		});
		return response.json();
	},

	async rescheduleOverdueSchedules(newBaseDate: string): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/overdue/reschedule`, {
			json: { newBaseDate }
		});
		return response.json();
	},

	// Bulk Operations
	async createMany(schedules: CreateScheduledMaintenance[]): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.post(`${BASE_URL}/bulk`, { json: { schedules } });
		return response.json();
	},

	async updateMany(
		filters: ScheduledMaintenanceFilters,
		updates: UpdateScheduledMaintenance
	): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk`, {
			json: { filters, updates }
		});
		return response.json();
	},

	async deleteMany(filters: ScheduledMaintenanceFilters): Promise<{ count: number }> {
		const response = await apiClient.delete(`${BASE_URL}/bulk`, {
			json: { filters }
		});
		return response.json();
	},

	async bulkApprove(scheduleIds: string[], comments?: string): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk/approve`, {
			json: { scheduleIds, comments }
		});
		return response.json();
	},

	async bulkReschedule(scheduleIds: string[], newDates: string[], reason?: string): Promise<{ count: number }> {
		const response = await apiClient.patch(`${BASE_URL}/bulk/reschedule`, {
			json: { scheduleIds, newDates, reason }
		});
		return response.json();
	},

	// Planning and Optimization
	async findAvailableTimeSlots(
		resourceId: string,
		startDate: string,
		endDate: string,
		durationMinutes: number
	): Promise<TimeSlot[]> {
		const params = new URLSearchParams();
		params.append('resourceId', resourceId);
		params.append('startDate', startDate);
		params.append('endDate', endDate);
		params.append('durationMinutes', String(durationMinutes));

		const response = await apiClient.get(`${BASE_URL}/available-slots?${params}`);
		return response.json();
	},

	async checkScheduleConflicts(
		resourceId: string,
		scheduledDate: string,
		durationMinutes: number,
		excludeScheduleId?: string
	): Promise<ConflictCheck> {
		const params = new URLSearchParams();
		params.append('resourceId', resourceId);
		params.append('scheduledDate', scheduledDate);
		params.append('durationMinutes', String(durationMinutes));

		if (excludeScheduleId) params.append('excludeScheduleId', excludeScheduleId);

		const response = await apiClient.get(`${BASE_URL}/check-conflicts?${params}`);
		return response.json();
	},

	async optimizeSchedules(
		resourceIds: string[],
		startDate: string,
		endDate: string
	): Promise<
		{
			resourceId: string;
			recommendedDate: string;
			reason: string;
		}[]
	> {
		const response = await apiClient.post(`${BASE_URL}/optimize`, {
			json: { resourceIds, startDate, endDate }
		});
		return response.json();
	},

	// Export functionality
	async exportToCsv(filters?: ScheduledMaintenanceFilters, dateFrom?: string, dateTo?: string): Promise<Blob> {
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

	async exportToPdf(filters?: ScheduledMaintenanceFilters, dateFrom?: string, dateTo?: string): Promise<Blob> {
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
