import { availabilityClient } from '../http';
import type { ApiResponse } from '../http/types';

/**
 * Reservations Service - Hito 2: Disponibilidad y Reservas Core
 * Implements RF-07 to RF-19
 */

export interface Reservation {
	id: string;
	resourceId: string;
	userId: string;
	startTime: string;
	endTime: string;
	status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
	purpose: string;
	attendeesCount: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateReservationRequest {
	resourceId: string;
	startTime: string;
	endTime: string;
	purpose: string;
	attendeesCount: number;
	notes?: string;
	isRecurring?: boolean;
	recurrencePattern?: RecurrencePattern;
}

export interface RecurrencePattern {
	type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
	interval: number;
	endDate: string;
	daysOfWeek?: number[];
}

export interface WaitingListEntry {
	id: string;
	resourceId: string;
	userId: string;
	requestedStartTime: string;
	requestedEndTime: string;
	priority: number;
	status: 'ACTIVE' | 'NOTIFIED' | 'EXPIRED';
	createdAt: string;
}

export interface AdvancedSearchFilters {
	resourceTypes?: string[];
	categories?: string[];
	capacity?: { min?: number; max?: number };
	equipment?: string[];
	accessibility?: string[];
	location?: string;
	startTime: string;
	endTime: string;
	duration?: number;
}

export const reservationsService = {
	/**
	 * Create a new reservation - RF-12
	 */
	async createReservation(data: CreateReservationRequest): Promise<ApiResponse<Reservation>> {
		return availabilityClient.post('reservations', { json: data }).json();
	},

	/**
	 * Get reservations with filters - RF-11
	 */
	async getReservations(params?: {
		resourceId?: string;
		userId?: string;
		status?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<Reservation[]>> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.userId) searchParams.append('userId', params.userId);

		if (params?.status) searchParams.append('status', params.status);

		if (params?.startDate) searchParams.append('startDate', params.startDate);

		if (params?.endDate) searchParams.append('endDate', params.endDate);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return availabilityClient.get(`reservations?${searchParams}`).json();
	},

	/**
	 * Get single reservation by ID
	 */
	async getReservationById(id: string): Promise<ApiResponse<Reservation>> {
		return availabilityClient.get(`reservations/${id}`).json();
	},

	/**
	 * Update reservation - RF-13
	 */
	async updateReservation(id: string, data: Partial<CreateReservationRequest>): Promise<ApiResponse<Reservation>> {
		return availabilityClient.put(`reservations/${id}`, { json: data }).json();
	},

	/**
	 * Cancel reservation - RF-13
	 */
	async cancelReservation(id: string, reason?: string): Promise<ApiResponse<void>> {
		return availabilityClient
			.delete(`reservations/${id}`, {
				json: reason ? { reason } : undefined
			})
			.json();
	},

	/**
	 * Create recurring reservations - RF-12
	 */
	async createRecurringReservation(data: CreateReservationRequest): Promise<ApiResponse<Reservation[]>> {
		return availabilityClient.post('recurring-reservations', { json: data }).json();
	},

	/**
	 * Advanced search with filters - RF-09
	 */
	async advancedSearch(filters: AdvancedSearchFilters): Promise<ApiResponse<any>> {
		return availabilityClient.post('search/advanced', { json: filters }).json();
	}
};

export const waitingListService = {
	/**
	 * Join waiting list - RF-14
	 */
	async joinWaitingList(data: {
		resourceId: string;
		requestedStartTime: string;
		requestedEndTime: string;
	}): Promise<ApiResponse<WaitingListEntry>> {
		return availabilityClient.post('waiting-list', { json: data }).json();
	},

	/**
	 * Get waiting list entries
	 */
	async getWaitingList(resourceId?: string): Promise<ApiResponse<WaitingListEntry[]>> {
		const params = resourceId ? `?resourceId=${resourceId}` : '';
		return availabilityClient.get(`waiting-list${params}`).json();
	},

	/**
	 * Remove from waiting list
	 */
	async removeFromWaitingList(id: string): Promise<ApiResponse<void>> {
		return availabilityClient.delete(`waiting-list/${id}`).json();
	}
};

export const calendarService = {
	/**
	 * Get calendar view for resource - RF-10
	 */
	async getResourceCalendar(
		resourceId: string,
		params?: {
			startDate?: string;
			endDate?: string;
			view?: 'day' | 'week' | 'month';
		}
	): Promise<ApiResponse<any>> {
		const searchParams = new URLSearchParams();

		if (params?.startDate) searchParams.append('startDate', params.startDate);

		if (params?.endDate) searchParams.append('endDate', params.endDate);

		if (params?.view) searchParams.append('view', params.view);

		return availabilityClient.get(`availability/${resourceId}/calendar?${searchParams}`).json();
	},

	/**
	 * Check for conflicts - RF-16
	 */
	async checkConflicts(data: {
		resourceId: string;
		startTime: string;
		endTime: string;
		excludeReservationId?: string;
	}): Promise<ApiResponse<{ hasConflicts: boolean; conflicts: any[] }>> {
		return availabilityClient.post('/calendar/conflicts', { json: data }).json();
	}
};
