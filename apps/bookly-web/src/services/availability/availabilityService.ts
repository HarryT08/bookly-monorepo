import { httpClient } from '../http/client';
import type {
	AdvancedSearchFilters,
	AdvancedSearchResponse,
	AvailabilityCheckRequest,
	AvailabilityResponse,
	QuickSearchRequest,
	QuickSearchResponse,
	PopularResourcesRequest,
	PopularResourcesResponse,
	SearchHistoryRequest,
	SearchHistoryResponse
} from '../availability/types';

const AVAILABILITY_API_BASE = '';

export const availabilityService = {
	/**
	 * Perform advanced search with comprehensive filters
	 */
	async advancedSearch(filters: AdvancedSearchFilters): Promise<AdvancedSearchResponse> {
		const response = await httpClient.post<AdvancedSearchResponse>('/search/advanced', filters);

		if (!response.success) {
			throw new Error(`Advanced search failed: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	},

	/**
	 * Check real-time availability for specific resources
	 */
	async checkAvailability(request: AvailabilityCheckRequest): Promise<AvailabilityResponse> {
		const response = await httpClient.post<AvailabilityResponse>('/availability/check', request);

		if (!response.success) {
			throw new Error(`Availability check failed: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	},

	/**
	 * Perform quick search for autocomplete suggestions
	 */
	async quickSearch(request: QuickSearchRequest): Promise<QuickSearchResponse> {
		const searchParams = new URLSearchParams({
			searchTerm: request.searchTerm,
			limit: request.limit?.toString() || '10'
		});

		if (request.searchTypes) {
			request.searchTypes.forEach((type) => {
				searchParams.append('searchTypes', type);
			});
		}

		const response = await httpClient.get<QuickSearchResponse>(
			`${AVAILABILITY_API_BASE}/search/quick?${searchParams}`
		);

		if (!response.success) {
			throw new Error(`Quick search failed: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	},

	/**
	 * Get popular resources based on usage analytics
	 */
	async getPopularResources(request: PopularResourcesRequest): Promise<PopularResourcesResponse> {
		const searchParams = new URLSearchParams({
			timeRange: request.timeRange || 'month',
			limit: request.limit?.toString() || '10'
		});

		if (request.categories) {
			request.categories.forEach((category) => {
				searchParams.append('categories', category);
			});
		}

		if (request.academicPrograms) {
			request.academicPrograms.forEach((program) => {
				searchParams.append('academicPrograms', program);
			});
		}

		const response = await httpClient.get<PopularResourcesResponse>(
			`${AVAILABILITY_API_BASE}/search/popular?${searchParams}`
		);

		if (!response.success) {
			throw new Error(`Failed to fetch popular resources: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	},

	/**
	 * Get user's search history
	 */
	async getSearchHistory(request: SearchHistoryRequest): Promise<SearchHistoryResponse> {
		const searchParams = new URLSearchParams({
			page: request.page?.toString() || '1',
			limit: request.limit?.toString() || '20'
		});

		if (request.startDate) {
			searchParams.append('startDate', request.startDate.toISOString());
		}

		if (request.endDate) {
			searchParams.append('endDate', request.endDate.toISOString());
		}

		const response = await httpClient.get<SearchHistoryResponse>(
			`${AVAILABILITY_API_BASE}/search/history?${searchParams}`
		);

		if (!response.success) {
			throw new Error(`Failed to fetch search history: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	},

	// Legacy methods for backward compatibility with existing availability service
	async getAvailability(resourceId: string, date: Date): Promise<Record<string, unknown>> {
		const response = await httpClient.get<Record<string, unknown>>(
			`${AVAILABILITY_API_BASE}/resources/${resourceId}/availability?date=${date.toISOString()}`
		);

		if (!response.success) {
			throw new Error(`Failed to get availability: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	},

	async createReservation(reservationData: Record<string, unknown>): Promise<Record<string, unknown>> {
		const response = await httpClient.post<Record<string, unknown>>('/reservations', reservationData);

		if (!response.success) {
			throw new Error(`Failed to create reservation: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	},

	async getReservations(params?: {
		resourceId?: string;
		userId?: string;
		status?: string;
		startDate?: Date;
		endDate?: Date;
		page?: number;
		limit?: number;
	}): Promise<Record<string, unknown>> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.userId) searchParams.append('userId', params.userId);

		if (params?.status) searchParams.append('status', params.status);

		if (params?.startDate) searchParams.append('startDate', params.startDate.toISOString());

		if (params?.endDate) searchParams.append('endDate', params.endDate.toISOString());

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const response = await httpClient.get<Record<string, unknown>>(`/reservations?${searchParams}`);

		if (!response.success) {
			throw new Error(`Failed to get reservations: ${response.message || 'Unknown error'}`);
		}

		return response.data;
	}
};
