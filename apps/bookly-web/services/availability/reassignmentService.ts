import {
	ReassignmentRequest,
	ReassignmentValidation,
	ReassignmentHistory,
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
		originalResourceId: 'resource-1',
		originalResourceName: 'Conference Room A',
		targetResourceId: 'resource-1',
		targetResourceName: 'Conference Room A',
		originalStartDate: new Date('2024-01-20T14:00:00Z'),
		originalEndDate: new Date('2024-01-20T16:00:00Z'),
		newStartDate: new Date('2024-01-21T14:00:00Z'),
		newEndDate: new Date('2024-01-21T16:00:00Z'),
		reason: 'Schedule conflict - urgent meeting',
		requestedBy: 'user-1',
		requestedByName: 'John Doe',
		requestedAt: new Date('2024-01-15T10:00:00Z'),
		status: 'PENDING',
		priority: 'MEDIUM',
		notificationsSent: [],
		auditLog: []
	},
	{
		id: 'reassign-2',
		originalReservationId: 'res-3',
		originalResourceId: 'resource-2',
		originalResourceName: 'Projector Room B',
		targetResourceId: 'resource-3',
		targetResourceName: 'Lab Equipment C',
		originalStartDate: new Date('2024-01-18T10:00:00Z'),
		originalEndDate: new Date('2024-01-18T12:00:00Z'),
		newStartDate: new Date('2024-01-18T10:00:00Z'),
		newEndDate: new Date('2024-01-18T12:00:00Z'),
		reason: 'Equipment needed elsewhere',
		requestedBy: 'user-3',
		requestedByName: 'Mike Johnson',
		requestedAt: new Date('2024-01-10T09:30:00Z'),
		status: 'APPROVED',
		approvedBy: 'admin-1',
		approvedByName: 'Admin User',
		approvedAt: new Date('2024-01-11T11:00:00Z'),
		priority: 'MEDIUM',
		notificationsSent: [],
		auditLog: []
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
								reservationId: 'res-123',
								conflictType: 'TIME_OVERLAP',
								startDate: new Date(),
								endDate: new Date(Date.now() + 7200000),
								details: 'The target time slot conflicts with an existing reservation'
							}
						]
					: [],
				warnings: needsApproval
					? [
							{
								type: 'APPROVAL_REQUIRED',
								message: 'This reassignment requires administrative approval',
								severity: 'MEDIUM'
							}
						]
					: [],
				requiredApprovals: needsApproval ? ['admin-approval'] : [],
				estimatedProcessingTime: needsApproval ? 172800 : 0,
				alternatives: hasConflicts
					? [
							{
								resourceId: 'resource-alt-1',
								resourceName: 'Alternative Room A',
								startDate: new Date(Date.now() + 3600000),
								endDate: new Date(Date.now() + 7200000),
								score: 0.85,
								reason: 'Similar capacity and features'
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
				originalResourceId: 'resource-1',
				originalResourceName: 'Original Resource',
				targetResourceId: request.newResourceId || 'resource-1',
				targetResourceName: request.newResourceName || 'New Resource',
				originalStartDate: request.originalStartTime,
				originalEndDate: request.originalEndTime,
				newStartDate: request.newStartTime || request.originalStartTime,
				newEndDate: request.newEndTime || request.originalEndTime,
				reason: request.reason,
				requestedBy: 'current-user-id',
				requestedByName: 'Current User',
				requestedAt: new Date(),
				status: 'PENDING',
				priority: 'MEDIUM',
				notificationsSent: [],
				auditLog: []
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
				filtered = filtered.filter((r) => r.requestedBy === 'current-user-id');
			} else if (type === 'received') {
				// Note: ReassignmentHistory doesn't have targetUserId, using alternative logic
				filtered = filtered.filter((r) => r.id === 'current-user-id'); // Placeholder logic
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
					approvedAt: response === 'APPROVE' ? new Date() : undefined,
					approvedBy: response === 'APPROVE' ? 'current-user-id' : undefined,
					rejectedAt: response === 'REJECT' ? new Date() : undefined,
					rejectedBy: response === 'REJECT' ? 'current-user-id' : undefined,
					rejectionReason: response === 'REJECT' ? comments : undefined
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
					cancelledAt: new Date(),
					cancelledBy: 'current-user-id',
					cancellationReason: 'User cancelled the request'
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
			return mockReassignments.filter((r) => r.originalReservationId === reservationId);
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
