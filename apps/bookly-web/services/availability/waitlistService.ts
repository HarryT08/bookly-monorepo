/**
 * Waiting List Service for RF-14 Implementation
 * Handles waiting list operations for resource reservations
 */

import { ApiResponse, PaginatedResponse } from '../common/types';
import { WaitlistEntry, WaitlistQuery, JoinWaitlistRequest, WaitlistNotification, WaitlistStatus } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface WaitlistService {
	joinWaitlist(request: JoinWaitlistRequest): Promise<ApiResponse<WaitlistEntry>>;
	getMyWaitlistEntries(query?: WaitlistQuery): Promise<ApiResponse<PaginatedResponse<WaitlistEntry>>>;
	getWaitlistForResource(
		resourceId: string,
		query?: WaitlistQuery
	): Promise<ApiResponse<PaginatedResponse<WaitlistEntry>>>;
	cancelWaitlistEntry(entryId: string): Promise<ApiResponse<void>>;
	updateWaitlistEntry(entryId: string, updates: Partial<WaitlistEntry>): Promise<ApiResponse<WaitlistEntry>>;
	getWaitlistPosition(entryId: string): Promise<ApiResponse<{ position: number; estimatedWaitTime?: number }>>;
	respondToNotification(
		notificationId: string,
		response: 'ACCEPT' | 'DECLINE'
	): Promise<ApiResponse<{ reservationId?: string }>>;
	getWaitlistNotifications(): Promise<ApiResponse<WaitlistNotification[]>>;
}

class WaitlistServiceImpl implements WaitlistService {
	private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
		try {
			const response = await fetch(`${API_BASE_URL}${endpoint}`, {
				headers: {
					'Content-Type': 'application/json',
					// TODO: Add authentication header
					...options.headers
				},
				...options
			});

			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					data: null as T,
					error: {
						code: `WAITLIST-${response.status}`,
						message: data.message || 'An error occurred',
						details: data.details
					}
				};
			}

			return {
				success: true,
				data,
				error: null
			};
		} catch (error) {
			return {
				success: false,
				data: null as T,
				error: {
					code: 'WAITLIST-NETWORK',
					message: error instanceof Error ? error.message : 'Network error occurred',
					details: null
				}
			};
		}
	}

	async joinWaitlist(request: JoinWaitlistRequest): Promise<ApiResponse<WaitlistEntry>> {
		return this.fetchApi<WaitlistEntry>('/api/availability/waitlist/join', {
			method: 'POST',
			body: JSON.stringify(request)
		});
	}

	async getMyWaitlistEntries(query?: WaitlistQuery): Promise<ApiResponse<PaginatedResponse<WaitlistEntry>>> {
		const params = new URLSearchParams();

		if (query) {
			Object.entries(query).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, v.toString()));
					} else if (value instanceof Date) {
						params.append(key, value.toISOString());
					} else {
						params.append(key, value.toString());
					}
				}
			});
		}

		const queryString = params.toString();
		return this.fetchApi<PaginatedResponse<WaitlistEntry>>(
			`/api/availability/waitlist/my-entries${queryString ? `?${queryString}` : ''}`
		);
	}

	async getWaitlistForResource(
		resourceId: string,
		query?: WaitlistQuery
	): Promise<ApiResponse<PaginatedResponse<WaitlistEntry>>> {
		const params = new URLSearchParams({ resourceId });

		if (query) {
			Object.entries(query).forEach(([key, value]) => {
				if (value !== undefined && value !== null && key !== 'resourceId') {
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, v.toString()));
					} else if (value instanceof Date) {
						params.append(key, value.toISOString());
					} else {
						params.append(key, value.toString());
					}
				}
			});
		}

		return this.fetchApi<PaginatedResponse<WaitlistEntry>>(
			`/api/availability/waitlist/resource?${params.toString()}`
		);
	}

	async cancelWaitlistEntry(entryId: string): Promise<ApiResponse<void>> {
		return this.fetchApi<void>(`/api/availability/waitlist/${entryId}/cancel`, {
			method: 'DELETE'
		});
	}

	async updateWaitlistEntry(entryId: string, updates: Partial<WaitlistEntry>): Promise<ApiResponse<WaitlistEntry>> {
		return this.fetchApi<WaitlistEntry>(`/api/availability/waitlist/${entryId}`, {
			method: 'PATCH',
			body: JSON.stringify(updates)
		});
	}

	async getWaitlistPosition(entryId: string): Promise<ApiResponse<{ position: number; estimatedWaitTime?: number }>> {
		return this.fetchApi<{ position: number; estimatedWaitTime?: number }>(
			`/api/availability/waitlist/${entryId}/position`
		);
	}

	async respondToNotification(
		notificationId: string,
		response: 'ACCEPT' | 'DECLINE'
	): Promise<ApiResponse<{ reservationId?: string }>> {
		return this.fetchApi<{ reservationId?: string }>(
			`/api/availability/waitlist/notifications/${notificationId}/respond`,
			{
				method: 'POST',
				body: JSON.stringify({ response })
			}
		);
	}

	async getWaitlistNotifications(): Promise<ApiResponse<WaitlistNotification[]>> {
		return this.fetchApi<WaitlistNotification[]>('/api/availability/waitlist/notifications');
	}
}

// Export singleton instance
export const waitlistService = new WaitlistServiceImpl();

// Export mock data for development
export const mockWaitlistEntries: WaitlistEntry[] = [
	{
		id: 'wait-1',
		resourceId: 'resource-1',
		resourceName: 'Conference Room A',
		userId: 'user-1',
		userName: 'John Doe',
		userEmail: 'john.doe@university.edu',
		requestedStartDate: new Date('2024-01-15T09:00:00'),
		requestedEndDate: new Date('2024-01-15T11:00:00'),
		title: 'Team Meeting',
		description: 'Weekly team standup meeting',
		priority: 'MEDIUM',
		status: WaitlistStatus.ACTIVE,
		position: 1,
		notificationPreferences: {
			email: true,
			sms: false,
			push: true
		},
		createdAt: new Date('2024-01-10T10:00:00'),
		updatedAt: new Date('2024-01-10T10:00:00'),
		notificationSent: false
	},
	{
		id: 'wait-2',
		resourceId: 'resource-1',
		resourceName: 'Conference Room A',
		userId: 'user-2',
		userName: 'Jane Smith',
		userEmail: 'jane.smith@university.edu',
		requestedStartDate: new Date('2024-01-15T14:00:00'),
		requestedEndDate: new Date('2024-01-15T16:00:00'),
		title: 'Project Review',
		description: 'Review presentation for upcoming project milestone',
		priority: 'HIGH',
		status: WaitlistStatus.ACTIVE,
		position: 2,
		notificationPreferences: {
			email: true,
			sms: true,
			push: false
		},
		createdAt: new Date('2024-01-10T11:00:00'),
		updatedAt: new Date('2024-01-10T11:00:00'),
		notificationSent: false
	},
	{
		id: 'wait-3',
		resourceId: 'resource-2',
		resourceName: 'Laboratory B',
		userId: 'user-1',
		userName: 'John Doe',
		userEmail: 'john.doe@university.edu',
		requestedStartDate: new Date('2024-01-16T10:00:00'),
		requestedEndDate: new Date('2024-01-16T12:00:00'),
		title: 'Research Session',
		description: 'Data collection for research project',
		priority: 'LOW',
		status: WaitlistStatus.NOTIFIED,
		position: 3,
		notificationPreferences: {
			email: false,
			sms: false,
			push: true
		},
		createdAt: new Date('2024-01-10T12:00:00'),
		updatedAt: new Date('2024-01-10T12:30:00'),
		notificationSent: true,
		expiresAt: new Date('2024-01-14T18:00:00')
	}
];

export const mockWaitlistNotifications: WaitlistNotification[] = [
	{
		id: 'notif-1',
		waitlistEntryId: 'wait-3',
		userId: 'user-1',
		type: 'RESOURCE_AVAILABLE',
		title: 'Resource Available',
		message: 'Laboratory B is now available for your requested time slot',
		resourceId: 'resource-2',
		resourceName: 'Laboratory B',
		availableStartDate: new Date('2024-01-16T10:00:00'),
		availableEndDate: new Date('2024-01-16T12:00:00'),
		expiresAt: new Date('2024-01-14T18:00:00'),
		isRead: false,
		createdAt: new Date('2024-01-14T12:00:00'),
		actionRequired: true,
		actionData: {
			confirmationDeadline: new Date('2024-01-14T18:00:00')
		}
	}
];
