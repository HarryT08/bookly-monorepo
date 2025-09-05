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
		const response = await resourcesClient.post<ApiResponse<MaintenanceRecord>>('/resources/maintenance', data);
		return response.data;
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

		const response = await resourcesClient.get<ApiResponse<MaintenanceRecord[]>>(`/resources/maintenance?${searchParams}`);
		return response.data;
	},

	/**
	 * Get maintenance record by ID
	 */
	async getMaintenanceById(id: string): Promise<ApiResponse<MaintenanceRecord>> {
		const response = await resourcesClient.get<ApiResponse<MaintenanceRecord>>(`/resources/maintenance/${id}`);
		return response.data;
	},

	/**
	 * Update maintenance record
	 */
	async updateMaintenance(
		id: string,
		data: Partial<CreateMaintenanceRequest>
	): Promise<ApiResponse<MaintenanceRecord>> {
		const response = await resourcesClient.put<ApiResponse<MaintenanceRecord>>(`/resources/maintenance/${id}`, data);
		return response.data;
	},

	/**
	 * Delete maintenance record
	 */
	async deleteMaintenance(id: string): Promise<ApiResponse<void>> {
		const response = await resourcesClient.delete<ApiResponse<void>>(`/resources/maintenance/${id}`);
		return response.data;
	},

	/**
	 * Get pending maintenance
	 */
	async getPendingMaintenance(resourceId?: string): Promise<ApiResponse<MaintenanceRecord[]>> {
		const params = resourceId ? `?resourceId=${resourceId}&status=SCHEDULED` : '?status=SCHEDULED';
		const response = await resourcesClient.get<ApiResponse<MaintenanceRecord[]>>(`/resources/maintenance/pending${params}`);
		return response.data;
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
		const response = await resourcesClient.put<ApiResponse<MaintenanceRecord>>(`/resources/maintenance/${id}/complete`, data);
		return response.data;
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

		const response = await resourcesClient.get<ApiResponse<MaintenanceStats>>(`/resources/maintenance/stats?${searchParams}`);
		return response.data;
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
		const response = await resourcesClient.post<ApiResponse<MaintenanceRecord>>('/resources/incidents/report', data);
		return response.data;
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

		const response = await resourcesClient.get<ApiResponse<MaintenanceRecord[]>>(`/resources/incidents/my?${searchParams}`);
		return response.data;
	}
};
