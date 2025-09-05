import { resourcesClient } from '../http';
import type { ApiResponse } from '../http/types';

/**
 * Import Service - Hito 6: RF-04 - Importación Masiva
 * Handles CSV imports for resources with Google Workspace integration support
 */

export interface ImportJob {
	id: string;
	type: 'RESOURCES' | 'USERS' | 'PROGRAMS';
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
	fileName: string;
	totalRecords: number;
	processedRecords: number;
	successfulRecords: number;
	failedRecords: number;
	errors: ImportError[];
	createdBy: string;
	createdAt: string;
	completedAt?: string;
}

export interface ImportError {
	row: number;
	field: string;
	value: string;
	message: string;
}

export interface ImportPreview {
	headers: string[];
	sample: Record<string, unknown>[];
	totalRows: number;
	validationErrors: ImportError[];
}

export interface ImportTemplate {
	type: 'RESOURCES' | 'USERS' | 'PROGRAMS';
	fields: ImportField[];
	sampleData: Record<string, unknown>[];
}

export interface ImportField {
	name: string;
	label: string;
	type: 'string' | 'number' | 'boolean' | 'date';
	required: boolean;
	validValues?: string[];
	description?: string;
}

export const importService = {
	/**
	 * Upload and validate CSV file - RF-04
	 */
	async uploadCsv(file: File, type: 'RESOURCES' | 'USERS' | 'PROGRAMS'): Promise<ApiResponse<ImportPreview>> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		return resourcesClient.post('/resources/import/validate', formData);
	},

	/**
	 * Start import process after validation
	 */
	async startImport(data: {
		file: File;
		type: 'RESOURCES' | 'USERS' | 'PROGRAMS';
		mapping: Record<string, string>;
		options: {
			skipErrors?: boolean;
			updateExisting?: boolean;
			dryRun?: boolean;
		};
	}): Promise<ApiResponse<ImportJob>> {
		const formData = new FormData();
		formData.append('file', data.file);
		formData.append('type', data.type);
		formData.append('mapping', JSON.stringify(data.mapping));
		formData.append('options', JSON.stringify(data.options));

		return resourcesClient.post('/resources/import/csv', formData);
	},

	/**
	 * Get import job status
	 */
	async getImportStatus(jobId: string): Promise<ApiResponse<ImportJob>> {
		return resourcesClient.get(`/resources/import/status/${jobId}`);
	},

	/**
	 * Get import history
	 */
	async getImportHistory(params?: {
		type?: string;
		status?: string;
		createdBy?: string;
		page?: number;
		limit?: number;
	}): Promise<ApiResponse<ImportJob[]>> {
		const searchParams = new URLSearchParams();

		if (params?.type) searchParams.append('type', params.type);

		if (params?.status) searchParams.append('status', params.status);

		if (params?.createdBy) searchParams.append('createdBy', params.createdBy);

		if (params?.page) searchParams.append('page', params.page.toString());

		if (params?.limit) searchParams.append('limit', params.limit.toString());

		return resourcesClient.get(`/resources/import/history?${searchParams}`);
	},

	/**
	 * Cancel import job
	 */
	async cancelImport(jobId: string): Promise<ApiResponse<void>> {
		return resourcesClient.post(`/resources/import/${jobId}/cancel`);
	},

	/**
	 * Download import template - RF-04
	 */
	async downloadTemplate(type: 'RESOURCES' | 'USERS' | 'PROGRAMS'): Promise<Blob> {
		// Note: This should use a different client method for blob responses
		// For now, we'll cast the response appropriately
		const response = await resourcesClient.get(`/resources/export/template?type=${type}`);
		return response.data as Blob;
	},

	/**
	 * Get import template metadata
	 */
	async getTemplate(type: 'RESOURCES' | 'USERS' | 'PROGRAMS'): Promise<ApiResponse<ImportTemplate>> {
		return resourcesClient.get(`/resources/import/templates/${type}`);
	},

	/**
	 * Download import results
	 */
	async downloadResults(jobId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
		// Note: This should use a different client method for blob responses
		// For now, we'll cast the response appropriately
		const response = await resourcesClient.get(`/resources/import/${jobId}/results?format=${format}`);
		return response.data as Blob;
	}
};

export const googleWorkspaceService = {
	/**
	 * Sync with Google Workspace - RF-04 (Google integration)
	 */
	async syncWithGoogleWorkspace(domain: string = 'ufps.edu.co'): Promise<ApiResponse<ImportJob>> {
		return resourcesClient.post('/resources/import/google-workspace', { domain });
	},

	/**
	 * Get Google Workspace sync status
	 */
	async getGoogleSyncStatus(): Promise<
		ApiResponse<{
			lastSync: string;
			status: 'ENABLED' | 'DISABLED' | 'ERROR';
			syncedUsers: number;
			syncedPrograms: number;
			errors: string[];
		}>
	> {
		return resourcesClient.get('/resources/import/google-workspace/status');
	},

	/**
	 * Configure Google Workspace settings
	 */
	async configureGoogleWorkspace(config: {
		enabled: boolean;
		domain: string;
		autoSync: boolean;
		syncInterval: number; // hours
	}): Promise<ApiResponse<void>> {
		return resourcesClient.put('/resources/import/google-workspace/config', config);
	}
};
