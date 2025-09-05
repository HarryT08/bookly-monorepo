import { resourcesClient } from '../http';
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
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/templates`);
		return response.data as ImportTemplate[];
	},

	/**
	 * Get import template by type
	 */
	async getTemplateByType(type: ImportType): Promise<ImportTemplate> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/templates/${type}`);
		return response.data as ImportTemplate;
	},

	/**
	 * Upload and preview CSV file
	 */
	async uploadAndPreview(file: File, type: ImportType): Promise<ImportPreviewResponse> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		const response = await resourcesClient.post(`${IMPORT_BASE_URL}/preview`, formData);
		return response.data as ImportPreviewResponse;
	},

	/**
	 * Create import job
	 */
	async createJob(request: CreateImportJobRequest, file: File): Promise<ImportJobResponse> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('config', JSON.stringify(request));

		const response = await resourcesClient.post(`${IMPORT_BASE_URL}/jobs`, formData);
		return response.data as ImportJobResponse;
	},

	/**
	 * Get import job details
	 */
	async getJob(jobId: string): Promise<ImportJob> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/jobs/${jobId}`);
		return response.data as ImportJob;
	},

	/**
	 * Update import job configuration
	 */
	async updateJob(jobId: string, request: UpdateImportJobRequest): Promise<ImportJob> {
		const response = await resourcesClient.put(`${IMPORT_BASE_URL}/jobs/${jobId}`, request);
		return response.data as ImportJob;
	},

	/**
	 * Validate import data
	 */
	async validateJob(jobId: string): Promise<ImportValidationResult> {
		const response = await resourcesClient.post(`${IMPORT_BASE_URL}/jobs/${jobId}/validate`);
		return response.data as ImportValidationResult;
	},

	/**
	 * Process import job
	 */
	async processJob(request: ProcessImportRequest): Promise<ImportJob> {
		const response = await resourcesClient.post(`${IMPORT_BASE_URL}/jobs/${request.jobId}/process`, request);
		return response.data as ImportJob;
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

		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/history?${params}`);
		return response.data as { data: ImportHistory[]; total: number };
	},

	/**
	 * Download import template
	 */
	async downloadTemplate(type: ImportType): Promise<Blob> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/templates/${type}/download`);
		return response.data as Blob;
	},

	/**
	 * Download import results
	 */
	async downloadResults(jobId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/jobs/${jobId}/download?format=${format}`);
		return response.data as Blob;
	},

	/**
	 * Get job progress
	 */
	async getJobProgress(jobId: string): Promise<{ progress: number; status: string; message?: string }> {
		const response = await resourcesClient.get(`${IMPORT_BASE_URL}/jobs/${jobId}/progress`);
		return response.data as { progress: number; status: string; message?: string };
	}
};
