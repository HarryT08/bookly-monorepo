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

		const response = await apiClient.get<ApiResponse<ScheduledMaintenance[]>>(`${BASE_URL}?${params}`);
		return response.data;
	},

	async getById(id: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.get<ScheduledMaintenance>(`${BASE_URL}/${id}`);
		return response.data;
	},

	async create(data: CreateScheduledMaintenance): Promise<ScheduledMaintenance> {
		const response = await apiClient.post<ScheduledMaintenance>(BASE_URL, data);
		return response.data;
	},

	async update(id: string, data: UpdateScheduledMaintenance): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}`, data);
		return response.data;
	},

	async delete(id: string): Promise<void> {
		await apiClient.delete(`${BASE_URL}/${id}`);
	},

	// Status and Assignment Management
	async updateStatus(id: string, status: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/status`, { status });
		return response.data;
	},

	async assignTechnician(id: string, technicianId: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/assign`, { technicianId });
		return response.data;
	},

	async setPriority(id: string, priority: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/priority`, { priority });
		return response.data;
	},

	async reschedule(id: string, newScheduledDate: string, reason?: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/reschedule`, {
			newScheduledDate,
			reason
		});
		return response.data;
	},

	async postpone(id: string, postponedTo: string, reason: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/postpone`, {
			postponedTo,
			reason
		});
		return response.data;
	},

	async cancel(id: string, reason: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/cancel`, { reason });
		return response.data;
	},

	async approve(id: string, comments?: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/approve`, { comments });
		return response.data;
	},

	async complete(
		id: string,
		actualDuration: number,
		completionNotes?: string,
		qualityRating?: number,
		maintenanceRecordId?: string
	): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/complete`, {
			actualDuration,
			completionNotes,
			qualityRating,
			maintenanceRecordId
		});
		return response.data;
	},

	async markReminderSent(id: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/reminder-sent`);
		return response.data;
	},

	// Requirements Management
	async addRequirement(id: string, requirement: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/requirements`, { requirement });
		return response.data;
	},

	async removeRequirement(id: string, requirement: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.post<ScheduledMaintenance>(`${BASE_URL}/${id}/requirements/delete`, {
			requirement
		});
		return response.data;
	},

	async addAttachment(id: string, attachmentUrl: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/attachments`, { attachmentUrl });
		return response.data;
	},

	async addTag(id: string, tag: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/tags`, { tag });
		return response.data;
	},

	async linkMaintenanceRecord(id: string, maintenanceRecordId: string): Promise<ScheduledMaintenance> {
		const response = await apiClient.put<ScheduledMaintenance>(`${BASE_URL}/${id}/link-record`, {
			maintenanceRecordId
		});
		return response.data;
	},

	// Specific Queries
	async getByResource(resourceId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/resource/${resourceId}`);
		return response.data;
	},

	async getByTechnician(technicianId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/technician/${technicianId}`);
		return response.data;
	},

	async getByStatus(status: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/status/${status}`);
		return response.data;
	},

	async getByMaintenanceType(type: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/type/${type}`);
		return response.data;
	},

	async getOverdue(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/overdue`);
		return response.data;
	},

	async getDueToday(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/due-today`);
		return response.data;
	},

	async getDueThisWeek(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/due-this-week`);
		return response.data;
	},

	async getDueThisMonth(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/due-this-month`);
		return response.data;
	},

	async getUpcoming(days?: number): Promise<ScheduledMaintenance[]> {
		const url = days ? `${BASE_URL}/upcoming?days=${days}` : `${BASE_URL}/upcoming`;
		const response = await apiClient.get<ScheduledMaintenance[]>(url);
		return response.data;
	},

	async getRecurring(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/recurring`);
		return response.data;
	},

	async getByParentSchedule(parentScheduleId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/parent/${parentScheduleId}`);
		return response.data;
	},

	async getPendingApproval(): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/pending-approval`);
		return response.data;
	},

	async getNeedingReminders(hoursAhead?: number): Promise<ScheduledMaintenance[]> {
		const url = hoursAhead
			? `${BASE_URL}/needing-reminders?hoursAhead=${hoursAhead}`
			: `${BASE_URL}/needing-reminders`;
		const response = await apiClient.get<ScheduledMaintenance[]>(url);
		return response.data;
	},

	async getByTags(tags: string[]): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();
		tags.forEach((tag) => params.append('tags', tag));
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/tags?${params}`);
		return response.data;
	},

	// Date-based queries
	async getByDateRange(startDate: string, endDate: string): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/date-range?${params}`);
		return response.data;
	},

	async getScheduledForDate(date: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/scheduled/${date}`);
		return response.data;
	},

	async getCompletedInPeriod(startDate: string, endDate: string): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/completed?${params}`);
		return response.data;
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

		const response = await apiClient.get<Statistics>(`${BASE_URL}/statistics?${params}`);
		return response.data;
	},

	async getResourceSchedule(resourceId: string): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.get<ScheduledMaintenance[]>(`${BASE_URL}/resource/${resourceId}/schedule`);
		return response.data;
	},

	async getTechnicianWorkload(
		technicianId: string,
		dateFrom?: string,
		dateTo?: string
	): Promise<ScheduledMaintenance[]> {
		const params = new URLSearchParams();

		if (dateFrom) params.append('dateFrom', dateFrom);

		if (dateTo) params.append('dateTo', dateTo);

		const response = await apiClient.get<ScheduledMaintenance[]>(
			`${BASE_URL}/technician/${technicianId}/workload?${params}`
		);
		return response.data;
	},

	async getMaintenanceCalendar(startDate: string, endDate: string): Promise<Record<string, ScheduledMaintenance[]>> {
		const params = new URLSearchParams();
		params.append('startDate', startDate);
		params.append('endDate', endDate);

		const response = await apiClient.get<Record<string, ScheduledMaintenance[]>>(`${BASE_URL}/calendar?${params}`);
		return response.data;
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
		const response = await apiClient.get<
			{
				parentScheduleId: string;
				resourceId: string;
				maintenanceType: string;
				recurringPattern: string;
				nextScheduled: string;
				totalOccurrences: number;
				completedOccurrences: number;
			}[]
		>(`${BASE_URL}/recurring/summary`);
		return response.data;
	},

	// Recurring Maintenance Management
	async generateRecurringSchedules(baseScheduleId: string, occurrences: number): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.post<ScheduledMaintenance[]>(`${BASE_URL}/recurring/generate`, {
			baseScheduleId,
			occurrences
		});
		return response.data;
	},

	async cancelRecurringSchedules(parentScheduleId: string, reason: string): Promise<{ count: number }> {
		const response = await apiClient.post<{ count: number }>(`${BASE_URL}/recurring/${parentScheduleId}/delete`, {
			reason
		});
		return response.data;
	},

	async rescheduleOverdueSchedules(newBaseDate: string): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/overdue/reschedule`, { newBaseDate });
		return response.data;
	},

	// Bulk Operations
	async createMany(schedules: CreateScheduledMaintenance[]): Promise<ScheduledMaintenance[]> {
		const response = await apiClient.post<ScheduledMaintenance[]>(`${BASE_URL}/bulk`, { schedules });
		return response.data;
	},

	async updateMany(
		filters: ScheduledMaintenanceFilters,
		updates: UpdateScheduledMaintenance
	): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk`, { filters, updates });
		return response.data;
	},

	async deleteMany(filters: ScheduledMaintenanceFilters): Promise<{ count: number }> {
		const response = await apiClient.post<{ count: number }>(`${BASE_URL}/bulk/delete`, { filters });
		return response.data;
	},

	async bulkApprove(scheduleIds: string[], comments?: string): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk/approve`, { scheduleIds, comments });
		return response.data;
	},

	async bulkReschedule(scheduleIds: string[], newDates: string[], reason?: string): Promise<{ count: number }> {
		const response = await apiClient.put<{ count: number }>(`${BASE_URL}/bulk/reschedule`, {
			scheduleIds,
			newDates,
			reason
		});
		return response.data;
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

		const response = await apiClient.get<TimeSlot[]>(`${BASE_URL}/available-slots?${params}`);
		return response.data;
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

		const response = await apiClient.get<ConflictCheck>(`${BASE_URL}/check-conflicts?${params}`);
		return response.data;
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
		const response = await apiClient.post<
			{
				resourceId: string;
				recommendedDate: string;
				reason: string;
			}[]
		>(`${BASE_URL}/optimize`, { resourceIds, startDate, endDate });
		return response.data;
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

		const response = await apiClient.get<Blob>(`${BASE_URL}/export/csv?${params}`);
		return response.data;
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

		const response = await apiClient.get<Blob>(`${BASE_URL}/export/pdf?${params}`);
		return response.data;
	}
};
