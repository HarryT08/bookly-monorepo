import { availabilityClient } from '../http';
import type { ApiResponse } from '../http/types';

/**
 * Advanced Features Service - Hito 7: Advanced Features
 * Implements 2FA, Advanced Session Management, Bulk Operations, Calendar Optimization
 */

export interface SessionInfo {
	id: string;
	userId: string;
	deviceInfo: {
		browser: string;
		os: string;
		ip: string;
		location?: string;
	};
	createdAt: string;
	lastActivity: string;
	isActive: boolean;
}

export interface TwoFactorSetup {
	secret: string;
	qrCode: string;
	backupCodes: string[];
}

export interface BulkOperation {
	id: string;
	type: 'APPROVE' | 'REJECT' | 'UPDATE' | 'DELETE';
	entityType: 'RESERVATIONS' | 'RESOURCES' | 'USERS';
	entityIds: string[];
	parameters: Record<string, unknown>;
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
	progress: number;
	results: BulkOperationResult[];
	createdBy: string;
	createdAt: string;
	completedAt?: string;
}

export interface BulkOperationResult {
	entityId: string;
	success: boolean;
	error?: string;
}

export interface CalendarOptimization {
	resourceId: string;
	period: {
		startDate: string;
		endDate: string;
	};
	constraints: {
		maxConsecutiveHours?: number;
		minBreakBetweenReservations?: number;
		preferredTimeSlots?: string[];
		blackoutPeriods?: { start: string; end: string }[];
	};
	optimization: {
		utilization: number;
		conflicts: number;
		suggestions: OptimizationSuggestion[];
	};
}

export interface OptimizationSuggestion {
	type: 'MOVE' | 'MERGE' | 'SPLIT' | 'CANCEL';
	reservationId: string;
	description: string;
	estimatedImprovement: number;
	priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Advanced Session Management Service
export const advancedSessionService = {
	/**
	 * Get active sessions for current user
	 */
	async getActiveSessions(): Promise<ApiResponse<SessionInfo[]>> {
		return availabilityClient.get('/auth/sessions/active');
	},

	/**
	 * Terminate specific session
	 */
	async terminateSession(sessionId: string): Promise<ApiResponse<void>> {
		return availabilityClient.delete(`/auth/sessions/${sessionId}`);
	},

	/**
	 * Terminate all other sessions (keep current)
	 */
	async terminateAllOtherSessions(): Promise<ApiResponse<void>> {
		return availabilityClient.post('/auth/sessions/terminate-others');
	},

	/**
	 * Get session audit logs
	 */
	async getSessionAuditLogs(params?: {
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<unknown[]>> {
		const searchParams = new URLSearchParams();

		if (params?.startDate) searchParams.append('startDate', params.startDate);

		if (params?.endDate) searchParams.append('endDate', params.endDate);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return availabilityClient.get(`/auth/audit-logs?${searchParams}`);
	}
};

// Two-Factor Authentication Service
export const twoFactorService = {
	/**
	 * Enable 2FA for current user
	 */
	async enable2FA(): Promise<ApiResponse<TwoFactorSetup>> {
		return availabilityClient.post('/auth/2fa/enable');
	},

	/**
	 * Verify 2FA setup with code
	 */
	async verify2FA(code: string): Promise<ApiResponse<{ success: boolean; backupCodes: string[] }>> {
		return availabilityClient.post('/auth/2fa/verify', { code });
	},

	/**
	 * Disable 2FA
	 */
	async disable2FA(password: string): Promise<ApiResponse<void>> {
		return availabilityClient.post('/auth/2fa/disable', { password });
	},

	/**
	 * Generate new backup codes
	 */
	async generateBackupCodes(): Promise<ApiResponse<{ backupCodes: string[] }>> {
		return availabilityClient.post('/auth/2fa/backup-codes/generate');
	},

	/**
	 * Verify backup code
	 */
	async verifyBackupCode(code: string): Promise<ApiResponse<{ success: boolean }>> {
		return availabilityClient.post('/auth/2fa/backup-codes/verify', { code });
	}
};

// Bulk Operations Service
export const bulkOperationsService = {
	/**
	 * Start bulk approval operation
	 */
	async bulkApprove(
		entityType: 'RESERVATIONS' | 'RESOURCES' | 'USERS',
		entityIds: string[],
		parameters?: Record<string, unknown>
	): Promise<ApiResponse<BulkOperation>> {
		return availabilityClient.post('/bulk-operations/approve', { entityType, entityIds, parameters });
	},

	/**
	 * Start bulk rejection operation
	 */
	async bulkReject(
		entityType: 'RESERVATIONS' | 'RESOURCES' | 'USERS',
		entityIds: string[],
		reason?: string
	): Promise<ApiResponse<BulkOperation>> {
		return availabilityClient.post('/bulk-operations/reject', { entityType, entityIds, parameters: { reason } });
	},

	/**
	 * Start bulk update operation
	 */
	async bulkUpdate(
		entityType: 'RESERVATIONS' | 'RESOURCES' | 'USERS',
		entityIds: string[],
		updates: Record<string, unknown>
	): Promise<ApiResponse<BulkOperation>> {
		return availabilityClient.post('/bulk-operations/update', { entityType, entityIds, parameters: updates });
	},

	/**
	 * Start bulk delete operation
	 */
	async bulkDelete(
		entityType: 'RESERVATIONS' | 'RESOURCES' | 'USERS',
		entityIds: string[]
	): Promise<ApiResponse<BulkOperation>> {
		return availabilityClient.post('/bulk-operations/delete', { entityType, entityIds });
	},

	/**
	 * Get bulk operation status
	 */
	async getBulkOperationStatus(operationId: string): Promise<ApiResponse<BulkOperation>> {
		return availabilityClient.get(`/bulk-operations/${operationId}/status`);
	},

	/**
	 * Get bulk operations history
	 */
	async getBulkOperationsHistory(params?: {
		type?: string;
		entityType?: string;
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<BulkOperation[]>> {
		const searchParams = new URLSearchParams();

		if (params?.type) searchParams.append('type', params.type);

		if (params?.entityType) searchParams.append('entityType', params.entityType);

		if (params?.status) searchParams.append('status', params.status);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return availabilityClient.get(`/bulk-operations/history?${searchParams}`);
	},

	/**
	 * Cancel bulk operation
	 */
	async cancelBulkOperation(operationId: string): Promise<ApiResponse<void>> {
		return availabilityClient.post(`/bulk-operations/${operationId}/cancel`);
	}
};

// Calendar Optimization Service
export const calendarOptimizationService = {
	/**
	 * Analyze calendar for optimization opportunities
	 */
	async analyzeCalendarOptimization(
		resourceId: string,
		period: {
			startDate: string;
			endDate: string;
		},
		constraints?: {
			maxConsecutiveHours?: number;
			minBreakBetweenReservations?: number;
			preferredTimeSlots?: string[];
			blackoutPeriods?: { start: string; end: string }[];
		}
	): Promise<ApiResponse<CalendarOptimization>> {
		return availabilityClient.post('/calendar/optimize', { resourceId, period, constraints });
	},

	/**
	 * Apply optimization suggestions
	 */
	async applyOptimizationSuggestions(
		resourceId: string,
		suggestionIds: string[]
	): Promise<
		ApiResponse<{
			applied: number;
			failed: number;
			results: { suggestionId: string; success: boolean; error?: string }[];
		}>
	> {
		return availabilityClient.post('/calendar/optimize/apply', { resourceId, suggestionIds });
	},

	/**
	 * Get optimization history
	 */
	async getOptimizationHistory(resourceId?: string): Promise<ApiResponse<CalendarOptimization[]>> {
		const params = resourceId ? `?resourceId=${resourceId}` : '';
		return availabilityClient.get(`/calendar/optimize/history${params}`);
	},

	/**
	 * Schedule automatic optimization
	 */
	async scheduleAutoOptimization(
		resourceId: string,
		schedule: {
			frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
			time: string; // HH:MM format
			constraints?: unknown;
			autoApply: boolean;
		}
	): Promise<ApiResponse<{ scheduleId: string }>> {
		return availabilityClient.post('/calendar/optimize/schedule', { resourceId, schedule });
	}
};

// User Management Advanced Features
export const advancedUserService = {
	/**
	 * Get blocked users list
	 */
	async getBlockedUsers(params?: {
		reason?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<unknown[]>> {
		const searchParams = new URLSearchParams();

		if (params?.reason) searchParams.append('reason', params.reason);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return availabilityClient.get(`/users/blocked?${searchParams}`);
	},

	/**
	 * Unblock user
	 */
	async unblockUser(userId: string, reason?: string): Promise<ApiResponse<void>> {
		return availabilityClient.post(`/users/${userId}/unblock`, reason ? { reason } : {});
	},

	/**
	 * Block user
	 */
	async blockUser(userId: string, reason: string, duration?: string): Promise<ApiResponse<void>> {
		return availabilityClient.post(`/users/${userId}/block`, { reason, duration });
	}
};
