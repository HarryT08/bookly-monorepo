import { resourcesClient } from '../http';
import type { ApiResponse } from '@services/http/types';
import type {
	ImportJob,
	ImportTemplate,
	ImportHistory,
	CreateImportJobRequest,
	UpdateImportJobRequest,
	ProcessImportRequest,
	ImportJobResponse,
	ImportPreviewResponse,
	ImportValidationResult,
	ImportType
} from './types';

const IMPORT_BASE_URL = '/api/v1/import';

/**
 * Import Service - RF04: Mass import of resources
 */
export const importService = {
	/**
	 * Get available import templates
	 */
	async getTemplates(): Promise<ImportTemplate[]> {
		const response = await resourcesClient
			.get(`${IMPORT_BASE_URL}/templates`)
			.json<ApiResponse<ImportTemplate[]>>();
		return response.data;
	},

	/**
	 * Get import template by type
	 */
	async getTemplateByType(type: ImportType): Promise<ImportTemplate> {
		const response = await resourcesClient
			.get(`${IMPORT_BASE_URL}/templates/${type}`)
			.json<ApiResponse<ImportTemplate>>();
		return response.data;
	},

	/**
	 * Upload and preview CSV file
	 */
	async uploadAndPreview(file: File, type: ImportType): Promise<ImportPreviewResponse> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		const response = await resourcesClient
			.post(`${IMPORT_BASE_URL}/preview`, { body: formData })
			.json<ImportPreviewResponse>();
		return response;
	},

	/**
	 * Create import job
	 */
	async createJob(request: CreateImportJobRequest, file: File): Promise<ImportJobResponse> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('config', JSON.stringify(request));

		const response = await resourcesClient
			.post(`${IMPORT_BASE_URL}/jobs`, { body: formData })
			.json<ImportJobResponse>();
		return response;
	},

	/**
	 * Get import job details
	 */
	async getJob(jobId: string): Promise<ImportJob> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/jobs/${jobId}`).json<ApiResponse<ImportJob>>();
		return response.data;
	},

	/**
	 * Update import job configuration
	 */
	async updateJob(jobId: string, request: UpdateImportJobRequest): Promise<ImportJob> {
		const response = await resourcesClient
			.put(`${IMPORT_BASE_URL}/jobs/${jobId}`, { json: request })
			.json<ApiResponse<ImportJob>>();
		return response.data;
	},

	/**
	 * Validate import data
	 */
	async validateJob(jobId: string): Promise<ImportValidationResult> {
		const response = await resourcesClient
			.post(`${IMPORT_BASE_URL}/jobs/${jobId}/validate`)
			.json<ApiResponse<ImportValidationResult>>();
		return response.data;
	},

	/**
	 * Process import job
	 */
	async processJob(request: ProcessImportRequest): Promise<ImportJob> {
		const response = await resourcesClient
			.post(`${IMPORT_BASE_URL}/jobs/${request.jobId}/process`, { json: request })
			.json<ApiResponse<ImportJob>>();
		return response.data;
	},

	/**
	 * Cancel import job
	 */
	async cancelJob(jobId: string): Promise<void> {
		await resourcesClient.delete(`${IMPORT_BASE_URL}/jobs/${jobId}`);
	},

	/**
	 * Get import history
	 */
	async getHistory(limit = 10, offset = 0): Promise<{ data: ImportHistory[]; total: number }> {
		const params = new URLSearchParams({
			limit: limit.toString(),
			offset: offset.toString()
		});

		const response = await resourcesClient
			.get(`${IMPORT_BASE_URL}/history?${params}`)
			.json<ApiResponse<{ data: ImportHistory[]; total: number }>>();
		return response.data;
	},

	/**
	 * Download import template
	 */
	async downloadTemplate(type: ImportType): Promise<Blob> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/templates/${type}/download`);
		return await response.blob();
	},

	/**
	 * Download import results
	 */
	async downloadResults(jobId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/jobs/${jobId}/download?format=${format}`);
		return await response.blob();
	},

	/**
	 * Get job progress
	 */
	async getJobProgress(jobId: string): Promise<{ progress: number; status: string; message?: string }> {
		const response = await resourcesClient
			.get(`${IMPORT_BASE_URL}/jobs/${jobId}/progress`)
			.json<ApiResponse<{ progress: number; status: string; message?: string }>>();
		return response.data;
	}
};
