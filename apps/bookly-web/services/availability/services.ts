/**
 * Availability and Reservation Services
 * Handles API communication with availability-service backend
 * Implements RF-07, RF-08, RF-10, RF-11 requirements
 */

import { availabilityClient } from '../http';
import { PaginatedResponse } from '../http/types';
import {
	WeeklySchedule,
	Schedule,
	CalendarIntegration,
	CalendarViewData,
	Reservation,
	ReservationHistory,
	AvailabilityQuery,
	CreateReservationRequest,
	UpdateReservationRequest,
	CalendarViewQuery,
	ReservationHistoryQuery,
	AvailabilityCheckResult,
	CalendarProvider
} from './types';

// Base API URL for availability service
const AVAILABILITY_API_BASE = process.env.NEXT_PUBLIC_AVAILABILITY_API_URL || 'http://localhost:3002';

// ========================================
// RF-07: Schedule and Availability Management
// ========================================

export const availabilityService = {
	// Basic Availability Operations
	async createAvailability(data: Omit<WeeklySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklySchedule> {
		const response = await availabilityClient.post(`${AVAILABILITY_API_BASE}/basic`, data);
		return response.data as WeeklySchedule;
	},

	async getAvailability(params?: { resourceId?: string; dayOfWeek?: number }): Promise<WeeklySchedule[]> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.dayOfWeek !== undefined) searchParams.append('dayOfWeek', params.dayOfWeek.toString());

		const response = await availabilityClient.get(`${AVAILABILITY_API_BASE}/basic?${searchParams}`);
		return response.data as WeeklySchedule[];
	},

	async getConflicts(params?: { resourceId?: string; dayOfWeek?: number }): Promise<AvailabilityCheckResult[]> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.dayOfWeek !== undefined) searchParams.append('dayOfWeek', params.dayOfWeek.toString());

		const response = await availabilityClient.get(`${AVAILABILITY_API_BASE}/conflicts?${searchParams}`);
		return response.data as AvailabilityCheckResult[];
	},

	async updateAvailability(id: string, data: Partial<WeeklySchedule>): Promise<WeeklySchedule> {
		const response = await availabilityClient.put(`${AVAILABILITY_API_BASE}/basic/${id}`, data);
		return response.data as WeeklySchedule;
	},

	async deleteAvailability(id: string): Promise<void> {
		await availabilityClient.delete(`${AVAILABILITY_API_BASE}/basic/${id}`);
	},

	// Complex Schedule Operations
	async createSchedule(data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
		const response = await availabilityClient.post(`${AVAILABILITY_API_BASE}/schedule`, data);
		return response.data as Schedule;
	},

	async getSchedules(params?: { resourceId?: string; type?: string }): Promise<Schedule[]> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.type) searchParams.append('type', params.type);

		const response = await availabilityClient.get(`${AVAILABILITY_API_BASE}/schedule?${searchParams}`);
		return response.data as Schedule[];
	},

	async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
		const response = await availabilityClient.put(`${AVAILABILITY_API_BASE}/schedule/${id}`, data);
		return response.data as Schedule;
	},

	async deleteSchedule(id: string): Promise<void> {
		await availabilityClient.delete(`${AVAILABILITY_API_BASE}/schedule/${id}`);
	},

	// Availability Check
	async checkAvailability(query: AvailabilityQuery): Promise<AvailabilityCheckResult> {
		const response = await availabilityClient.post(`${AVAILABILITY_API_BASE}/check`, query);
		return response.data as AvailabilityCheckResult;
	}
};

// ========================================
// RF-08: Calendar Integration Management
// ========================================

export const calendarIntegrationService = {
	async createIntegration(
		data: Omit<CalendarIntegration, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<CalendarIntegration> {
		const response = await availabilityClient.post(`${AVAILABILITY_API_BASE}/calendar-integration`, data);
		return response.data as CalendarIntegration;
	},

	async getIntegrations(params?: {
		resourceId?: string;
		provider?: CalendarProvider;
		isActive?: boolean;
	}): Promise<CalendarIntegration[]> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.provider) searchParams.append('provider', params.provider);

		if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

		const response = await availabilityClient.get(`${AVAILABILITY_API_BASE}/calendar-integration?${searchParams}`);
		return response.data as CalendarIntegration[];
	},

	async updateIntegration(id: string, data: Partial<CalendarIntegration>): Promise<CalendarIntegration> {
		const response = await availabilityClient.put(`${AVAILABILITY_API_BASE}/calendar-integrations/${id}`, data);
		return response.data as CalendarIntegration;
	},

	async deleteIntegration(id: string): Promise<void> {
		await availabilityClient.delete(`${AVAILABILITY_API_BASE}/calendar-integrations/${id}`);
	},

	async syncIntegration(integrationId: string): Promise<{ success: boolean; eventsCount: number }> {
		const response = await availabilityClient.post(
			`${AVAILABILITY_API_BASE}/calendar-integration/${integrationId}/sync-events`
		);
		return response.data as { success: boolean; eventsCount: number };
	},

	async getAvailabilityWithConflicts(params: {
		resourceId: string;
		startDate: Date;
		endDate: Date;
		includeConflicts?: boolean;
	}): Promise<AvailabilityCheckResult> {
		const searchParams = new URLSearchParams({
			resourceId: params.resourceId,
			startDate: params.startDate.toISOString(),
			endDate: params.endDate.toISOString(),
			includeConflicts: (params.includeConflicts ?? true).toString()
		});

		const response = await availabilityClient.get(
			`${AVAILABILITY_API_BASE}/availability-with-conflicts?${searchParams}`
		);
		return response.data as AvailabilityCheckResult;
	}
};

// ========================================
// RF-10: Calendar View Management
// ========================================

export const calendarViewService = {
	async getCalendarView(query: CalendarViewQuery): Promise<CalendarViewData> {
		const searchParams = new URLSearchParams({
			startDate: query.startDate.toISOString(),
			endDate: query.endDate.toISOString()
		});

		if (query.resourceIds) searchParams.append('resourceIds', query.resourceIds.join(','));

		if (query.startDate) searchParams.append('startDate', query.startDate.toISOString());

		if (query.endDate) searchParams.append('endDate', query.endDate.toISOString());

		if (query.includeSchedules !== undefined)
			searchParams.append('includeSchedules', query.includeSchedules.toString());

		if (query.includeAvailability !== undefined)
			searchParams.append('includeAvailability', query.includeAvailability.toString());

		if (query.includeReservations !== undefined)
			searchParams.append('includeReservations', query.includeReservations.toString());

		const response = await availabilityClient.get(`${AVAILABILITY_API_BASE}/calendar?${searchParams}`);
		return response.data as CalendarViewData;
	},

	async getResourceCalendar(params: {
		resourceId: string;
		startDate: Date;
		endDate: Date;
		includeReservations?: boolean;
		includeScheduleRestrictions?: boolean;
	}): Promise<CalendarViewData> {
		const searchParams = new URLSearchParams({
			startDate: params.startDate.toISOString(),
			endDate: params.endDate.toISOString(),
			includeReservations: (params.includeReservations ?? true).toString(),
			includeScheduleRestrictions: (params.includeScheduleRestrictions ?? true).toString()
		});

		const response = await availabilityClient.get(
			`${AVAILABILITY_API_BASE}/calendar/resource/${params.resourceId}?${searchParams}`
		);
		return response.data as CalendarViewData;
	}
};

// ========================================
// Reservation Management
// ========================================

export const reservationService = {
	async createReservation(data: CreateReservationRequest): Promise<Reservation> {
		const response = await availabilityClient.post(`${AVAILABILITY_API_BASE}/reservations`, data);
		return response.data as Reservation;
	},

	async getReservations(params?: {
		resourceId?: string;
		userId?: string;
		status?: string;
		startDate?: Date;
		endDate?: Date;
		page?: number;
		limit?: number;
	}): Promise<PaginatedResponse<Reservation>> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.userId) searchParams.append('userId', params.userId);

		if (params?.status) searchParams.append('status', params.status);

		if (params?.startDate) searchParams.append('startDate', params.startDate.toISOString());

		if (params?.endDate) searchParams.append('endDate', params.endDate.toISOString());

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const response = await availabilityClient.get(`${AVAILABILITY_API_BASE}/reservations?${searchParams}`);
		return response.data as PaginatedResponse<Reservation>;
	},

	async getReservationById(id: string): Promise<Reservation> {
		const response = await availabilityClient.get(`${AVAILABILITY_API_BASE}/reservations/${id}`);
		return response.data as Reservation;
	},

	async updateReservation(id: string, data: UpdateReservationRequest): Promise<Reservation> {
		const response = await availabilityClient.put(`${AVAILABILITY_API_BASE}/reservations/${id}`, data);
		return response.data as Reservation;
	},

	async cancelReservation(id: string, reason?: string): Promise<Reservation> {
		const response = await availabilityClient.put(`${AVAILABILITY_API_BASE}/reservations/${id}/cancel`, { reason });
		return response.data as Reservation;
	},

	async deleteReservation(id: string): Promise<void> {
		await availabilityClient.delete(`${AVAILABILITY_API_BASE}/reservations/${id}`);
	}
};

// ========================================
// RF-11: Reservation History Management
// ========================================

export const reservationHistoryService = {
	async getHistory(query?: ReservationHistoryQuery): Promise<PaginatedResponse<ReservationHistory>> {
		const searchParams = new URLSearchParams();

		if (query?.reservationId) searchParams.append('reservationId', query.reservationId);

		if (query?.userId) searchParams.append('userId', query.userId);

		if (query?.resourceId) searchParams.append('resourceId', query.resourceId);

		if (query?.action) searchParams.append('action', query.action);

		if (query?.startDate) searchParams.append('startDate', query.startDate.toISOString());

		if (query?.endDate) searchParams.append('endDate', query.endDate.toISOString());

		if (query?.page) searchParams.append('page', query.page.toString());

		if (query?.limit) searchParams.append('limit', query.limit.toString());

		const response = await availabilityClient.get(
			`${AVAILABILITY_API_BASE}/reservation-history/detailed?${searchParams}`
		);
		return response.data as PaginatedResponse<ReservationHistory>;
	},

	async createHistoryEntry(data: Omit<ReservationHistory, 'id' | 'createdAt'>): Promise<ReservationHistory> {
		const response = await availabilityClient.post(`${AVAILABILITY_API_BASE}/reservation-history`, data);
		return response.data as ReservationHistory;
	},

	async exportHistory(query?: ReservationHistoryQuery): Promise<Blob> {
		const searchParams = new URLSearchParams();

		if (query?.reservationId) searchParams.append('reservationId', query.reservationId);

		if (query?.userId) searchParams.append('userId', query.userId);

		if (query?.resourceId) searchParams.append('resourceId', query.resourceId);

		if (query?.startDate) searchParams.append('startDate', query.startDate.toISOString());

		if (query?.endDate) searchParams.append('endDate', query.endDate.toISOString());

		const response = await availabilityClient.get(
			`${AVAILABILITY_API_BASE}/reservation-history/export?${searchParams}`
		);
		return response.data as Blob;
	}
};

// ========================================
// Unified Export
// ========================================

const servicesExport = {
	availability: availabilityService,
	calendarIntegration: calendarIntegrationService,
	calendarView: calendarViewService,
	reservation: reservationService,
	history: reservationHistoryService
};

export default servicesExport;
