import {
	ReassignmentRequest,
	ReassignmentValidation,
	ReassignmentHistory,
	ReassignmentType,
	ReassignmentApiResponse,
	ReassignmentListResponse,
	ReassignmentHistoryResponse
} from './types';
import { ApiResponse } from '../common/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// Mock data for development
const mockReassignments: ReassignmentHistory[] = [
	{
		id: 'reassign-1',
		originalReservationId: 'res-1',
		newReservationId: 'res-2',
		requesterId: 'user-1',
		requesterName: 'John Doe',
		requesterEmail: 'john.doe@university.edu',
		targetUserId: 'user-2',
		targetUserName: 'Jane Smith',
		targetUserEmail: 'jane.smith@university.edu',
		reason: 'Schedule conflict - urgent meeting',
		type: ReassignmentType.TRANSFER,
		status: 'PENDING',
		requestedAt: new Date('2024-01-15T10:00:00Z'),
		processedAt: null,
		processedBy: null,
		comments: null,
		originalResourceId: 'resource-1',
		originalResourceName: 'Conference Room A',
		originalStartTime: new Date('2024-01-20T14:00:00Z'),
		originalEndTime: new Date('2024-01-20T16:00:00Z'),
		newResourceId: 'resource-1',
		newResourceName: 'Conference Room A',
		newStartTime: new Date('2024-01-21T14:00:00Z'),
		newEndTime: new Date('2024-01-21T16:00:00Z')
	},
	{
		id: 'reassign-2',
		originalReservationId: 'res-3',
		newReservationId: 'res-4',
		requesterId: 'user-3',
		requesterName: 'Mike Johnson',
		requesterEmail: 'mike.j@university.edu',
		targetUserId: 'user-1',
		targetUserName: 'John Doe',
		targetUserEmail: 'john.doe@university.edu',
		reason: 'Equipment needed elsewhere',
		type: ReassignmentType.EXCHANGE,
		status: 'APPROVED',
		requestedAt: new Date('2024-01-10T09:30:00Z'),
		processedAt: new Date('2024-01-11T11:00:00Z'),
		processedBy: 'admin-1',
		comments: 'Approved due to urgent project requirements',
		originalResourceId: 'resource-2',
		originalResourceName: 'Projector Room B',
		originalStartTime: new Date('2024-01-18T10:00:00Z'),
		originalEndTime: new Date('2024-01-18T12:00:00Z'),
		newResourceId: 'resource-3',
		newResourceName: 'Lab Equipment C',
		newStartTime: new Date('2024-01-18T10:00:00Z'),
		newEndTime: new Date('2024-01-18T12:00:00Z')
	}
];

export const reassignmentService = {
	/**
	 * Validate a reassignment request before submitting
	 */
	async validateReassignment(
		reservationId: string,
		targetUserId: string,
		newStartTime?: Date,
		newEndTime?: Date,
		newResourceId?: string
	): Promise<ReassignmentValidation> {
		if (USE_MOCK_DATA) {
			// Mock validation logic
			const hasConflicts = Math.random() < 0.3; // 30% chance of conflicts
			const needsApproval = Math.random() < 0.6; // 60% chance needs approval

			return {
				isValid: !hasConflicts,
				conflicts: hasConflicts
					? [
							{
								id: 'conflict-123',
								type: 'DOUBLE_BOOKING',
								severity: 'ERROR',
								message: 'The target time slot conflicts with an existing reservation',
								affectedEvents: ['res-123'],
								suggestedActions: ['Choose a different time slot', 'Contact the conflicting user']
							}
						]
					: [],
				warnings: needsApproval
					? [
							{
								warningType: 'APPROVAL_REQUIRED',
								message: 'This reassignment requires administrative approval'
							}
						]
					: [],
				requiresApproval: needsApproval,
				estimatedProcessingTime: needsApproval ? '1-2 business days' : 'Immediate',
				alternativeSuggestions: hasConflicts
					? [
							{
								resourceId: 'resource-alt-1',
								resourceName: 'Alternative Room A',
								startTime: new Date(Date.now() + 3600000), // 1 hour later
								endTime: new Date(Date.now() + 7200000), // 2 hours later
								availability: 'AVAILABLE'
							}
						]
					: []
			};
		}

		try {
			const response = await fetch(`${API_BASE_URL}/api/availability/reassignment/validate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					// TODO: Add authentication headers
				},
				body: JSON.stringify({
					reservationId,
					targetUserId,
					newStartTime,
					newEndTime,
					newResourceId
				})
			});

			const data: ApiResponse<ReassignmentValidation> = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || 'Validation failed');
			}

			return data.data!;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Failed to validate reassignment');
		}
	},

	/**
	 * Submit a reassignment request
	 */
	async createReassignmentRequest(request: ReassignmentRequest): Promise<string> {
		if (USE_MOCK_DATA) {
			// Mock implementation
			const newId = `reassign-${Date.now()}`;
			const newReassignment: ReassignmentHistory = {
				id: newId,
				originalReservationId: request.originalReservationId,
				newReservationId: `new-res-${Date.now()}`,
				requesterId: 'current-user-id',
				requesterName: 'Current User',
				requesterEmail: 'current.user@university.edu',
				targetUserId: request.targetUserId,
				targetUserName: 'Target User',
				targetUserEmail: 'target.user@university.edu',
				reason: request.reason,
				type: request.type,
				status: 'PENDING',
				requestedAt: new Date(),
				processedAt: null,
				processedBy: null,
				comments: null,
				originalResourceId: 'resource-1',
				originalResourceName: 'Original Resource',
				originalStartTime: request.originalStartTime,
				originalEndTime: request.originalEndTime,
				newResourceId: request.newResourceId || 'resource-1',
				newResourceName: request.newResourceName || 'New Resource',
				newStartTime: request.newStartTime || request.originalStartTime,
				newEndTime: request.newEndTime || request.originalEndTime
			};

			mockReassignments.unshift(newReassignment);
			return newId;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/api/availability/reassignment`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					// TODO: Add authentication headers
				},
				body: JSON.stringify(request)
			});

			const data: ReassignmentApiResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || 'Failed to create reassignment request');
			}

			return data.data!.id;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Failed to create reassignment request');
		}
	},

	/**
	 * Get reassignment requests for a user (sent or received)
	 */
	async getReassignmentRequests(
		type: 'sent' | 'received' | 'all' = 'all',
		status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
	): Promise<ReassignmentHistory[]> {
		if (USE_MOCK_DATA) {
			let filtered = [...mockReassignments];

			if (type === 'sent') {
				filtered = filtered.filter((r) => r.requesterId === 'current-user-id');
			} else if (type === 'received') {
				filtered = filtered.filter((r) => r.targetUserId === 'current-user-id');
			}

			if (status) {
				filtered = filtered.filter((r) => r.status === status);
			}

			return filtered.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
		}

		try {
			const params = new URLSearchParams();

			if (type !== 'all') params.append('type', type);

			if (status) params.append('status', status);

			const response = await fetch(`${API_BASE_URL}/api/availability/reassignment?${params.toString()}`, {
				headers: {
					// TODO: Add authentication headers
				}
			});

			const data: ReassignmentListResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || 'Failed to fetch reassignment requests');
			}

			return data.data!;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Failed to fetch reassignment requests');
		}
	},

	/**
	 * Respond to a reassignment request (approve/reject)
	 */
	async respondToReassignmentRequest(
		reassignmentId: string,
		response: 'APPROVE' | 'REJECT',
		comments?: string
	): Promise<boolean> {
		if (USE_MOCK_DATA) {
			const index = mockReassignments.findIndex((r) => r.id === reassignmentId);

			if (index !== -1) {
				mockReassignments[index] = {
					...mockReassignments[index],
					status: response === 'APPROVE' ? 'APPROVED' : 'REJECTED',
					processedAt: new Date(),
					processedBy: 'current-user-id',
					comments: comments || null
				};
				return true;
			}

			return false;
		}

		try {
			const apiResponse = await fetch(`${API_BASE_URL}/api/availability/reassignment/${reassignmentId}/respond`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					// TODO: Add authentication headers
				},
				body: JSON.stringify({
					response: response.toLowerCase(),
					comments
				})
			});

			const data: ApiResponse<boolean> = await apiResponse.json();

			if (!apiResponse.ok) {
				throw new Error(data.error?.message || 'Failed to respond to reassignment request');
			}

			return data.data!;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Failed to respond to reassignment request');
		}
	},

	/**
	 * Cancel a reassignment request
	 */
	async cancelReassignmentRequest(reassignmentId: string): Promise<boolean> {
		if (USE_MOCK_DATA) {
			const index = mockReassignments.findIndex((r) => r.id === reassignmentId);

			if (index !== -1) {
				mockReassignments[index] = {
					...mockReassignments[index],
					status: 'CANCELLED',
					processedAt: new Date(),
					processedBy: 'current-user-id'
				};
				return true;
			}

			return false;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/api/availability/reassignment/${reassignmentId}/cancel`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
					// TODO: Add authentication headers
				}
			});

			const data: ApiResponse<boolean> = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || 'Failed to cancel reassignment request');
			}

			return data.data!;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Failed to cancel reassignment request');
		}
	},

	/**
	 * Get reassignment history for a specific reservation
	 */
	async getReassignmentHistory(reservationId: string): Promise<ReassignmentHistory[]> {
		if (USE_MOCK_DATA) {
			return mockReassignments.filter(
				(r) => r.originalReservationId === reservationId || r.newReservationId === reservationId
			);
		}

		try {
			const response = await fetch(`${API_BASE_URL}/api/availability/reassignment/history/${reservationId}`, {
				headers: {
					// TODO: Add authentication headers
				}
			});

			const data: ReassignmentHistoryResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || 'Failed to fetch reassignment history');
			}

			return data.data!;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Failed to fetch reassignment history');
		}
	}
};
