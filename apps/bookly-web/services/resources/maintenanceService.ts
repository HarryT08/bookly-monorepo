import { resourcesClient } from '../http';
import type { ApiResponse } from '../http/types';

/**
 * Maintenance Service - Hito 6: Enhanced Resource Management
 * Implements RF-06 (Maintenance Management)
 */

export interface MaintenanceRecord {
	id: string;
	resourceId: string;
	type: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	title: string;
	description: string;
	scheduledDate: string;
	completedDate?: string;
	assignedTo?: string;
	reportedBy: string;
	estimatedDuration: number; // in minutes
	actualDuration?: number;
	cost?: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateMaintenanceRequest {
	resourceId: string;
	type: 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LIMPIEZA';
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
	title: string;
	description: string;
	scheduledDate: string;
	assignedTo?: string;
	estimatedDuration: number;
	cost?: number;
	notes?: string;
}

export interface MaintenanceStats {
	total: number;
	byStatus: Record<string, number>;
	byType: Record<string, number>;
	byPriority: Record<string, number>;
	averageDuration: number;
	totalCost: number;
	upcomingMaintenance: number;
	overdueMaintenance: number;
}

export const maintenanceService = {
	/**
	 * Create maintenance record - RF-06
	 */
	async createMaintenance(data: CreateMaintenanceRequest): Promise<ApiResponse<MaintenanceRecord>> {
		return resourcesClient.post('/resources/maintenance', { json: data }).json();
	},

	/**
	 * Get maintenance records with filters
	 */
	async getMaintenanceRecords(params?: {
		resourceId?: string;
		type?: string;
		status?: string;
		priority?: string;
		startDate?: string;
		endDate?: string;
		assignedTo?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<MaintenanceRecord[]>> {
		const searchParams = new URLSearchParams();

		if (params?.resourceId) searchParams.append('resourceId', params.resourceId);

		if (params?.type) searchParams.append('type', params.type);

		if (params?.status) searchParams.append('status', params.status);

		if (params?.priority) searchParams.append('priority', params.priority);

		if (params?.startDate) searchParams.append('startDate', params.startDate);

		if (params?.endDate) searchParams.append('endDate', params.endDate);

		if (params?.assignedTo) searchParams.append('assignedTo', params.assignedTo);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return resourcesClient.get(`/resources/maintenance?${searchParams}`).json();
	},

	/**
	 * Get maintenance record by ID
	 */
	async getMaintenanceById(id: string): Promise<ApiResponse<MaintenanceRecord>> {
		return resourcesClient.get(`/resources/maintenance/${id}`).json();
	},

	/**
	 * Update maintenance record
	 */
	async updateMaintenance(
		id: string,
		data: Partial<CreateMaintenanceRequest>
	): Promise<ApiResponse<MaintenanceRecord>> {
		return resourcesClient.put(`/resources/maintenance/${id}`, { json: data }).json();
	},

	/**
	 * Delete maintenance record
	 */
	async deleteMaintenance(id: string): Promise<ApiResponse<void>> {
		return resourcesClient.delete(`/resources/maintenance/${id}`).json();
	},

	/**
	 * Get pending maintenance
	 */
	async getPendingMaintenance(resourceId?: string): Promise<ApiResponse<MaintenanceRecord[]>> {
		const params = resourceId ? `?resourceId=${resourceId}&status=SCHEDULED` : '?status=SCHEDULED';
		return resourcesClient.get(`/resources/maintenance/pending${params}`).json();
	},

	/**
	 * Mark maintenance as completed
	 */
	async completeMaintenance(
		id: string,
		data: {
			actualDuration?: number;
			cost?: number;
			notes?: string;
		}
	): Promise<ApiResponse<MaintenanceRecord>> {
		return resourcesClient.put(`/resources/maintenance/${id}/complete`, { json: data }).json();
	},

	/**
	 * Get maintenance statistics
	 */
	async getMaintenanceStats(
		resourceId?: string,
		dateRange?: {
			startDate: string;
			endDate: string;
		}
	): Promise<ApiResponse<MaintenanceStats>> {
		const searchParams = new URLSearchParams();

		if (resourceId) searchParams.append('resourceId', resourceId);

		if (dateRange?.startDate) searchParams.append('startDate', dateRange.startDate);

		if (dateRange?.endDate) searchParams.append('endDate', dateRange.endDate);

		return resourcesClient.get(`/resources/maintenance/stats?${searchParams}`).json();
	}
};

export const incidentService = {
	/**
	 * Report incident/damage - RF-06 (Students and administrative can report)
	 */
	async reportIncident(data: {
		resourceId: string;
		title: string;
		description: string;
		severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
		images?: string[];
	}): Promise<ApiResponse<MaintenanceRecord>> {
		return resourcesClient.post('/resources/incidents/report', { json: data }).json();
	},

	/**
	 * Get incidents reported by current user
	 */
	async getMyIncidents(params?: {
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<MaintenanceRecord[]>> {
		const searchParams = new URLSearchParams();

		if (params?.status) searchParams.append('status', params.status);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return resourcesClient.get(`/resources/incidents/my?${searchParams}`).json();
	}
};
