/**
 * Import Service Types - RF04
 * Mass import of resources, users, and other entities
 */

// Import Status Types
export type ImportStatus = 'pending' | 'success' | 'error' | 'warning';

export type ImportType = 'resources' | 'users' | 'schedules' | 'categories' | 'programs';

// Import Record Interface
export interface ImportRecord {
	row: number;
	data: Record<string, string>;
	status: ImportStatus;
	errors: string[];
	warnings: string[];
}

// Import Summary Interface
export interface ImportSummary {
	total: number;
	success: number;
	errors: number;
	warnings: number;
	pending: number;
}

// Import Configuration Interface
export interface ImportConfig {
	type: ImportType;
	hasHeaders: boolean;
	delimiter: string;
	encoding: 'utf-8' | 'latin1' | 'ascii';
	skipEmptyRows: boolean;
	validateOnly: boolean;
}

// Column Mapping Interface
export interface ColumnMapping {
	csvColumn: string;
	systemField: string;
	required: boolean;
	transform?: string;
	defaultValue?: string;
}

// Import Template Interface
export interface ImportTemplate {
	id: string;
	name: string;
	description: string;
	type: ImportType;
	columns: {
		name: string;
		required: boolean;
		type: 'string' | 'number' | 'date' | 'boolean';
		description: string;
		example?: string;
	}[];
	rules: {
		field: string;
		rule: string;
		message: string;
	}[];
	createdAt: Date;
	updatedAt: Date;
}

// Import Job Interface
export interface ImportJob {
	id: string;
	type: ImportType;
	filename: string;
	originalFilename: string;
	status: 'uploading' | 'validating' | 'processing' | 'completed' | 'failed';
	config: ImportConfig;
	mapping: ColumnMapping[];
	summary: ImportSummary;
	records: ImportRecord[];
	errors: string[];
	warnings: string[];
	progress: number;
	startedAt: Date;
	completedAt?: Date;
	createdBy: string;
}

// Import Request Interfaces
export interface CreateImportJobRequest {
	type: ImportType;
	config: ImportConfig;
	mapping: ColumnMapping[];
}

export interface UpdateImportJobRequest {
	mapping?: ColumnMapping[];
	config?: Partial<ImportConfig>;
}

export interface ProcessImportRequest {
	jobId: string;
	skipValidation?: boolean;
}

// Import Response Interfaces
export interface ImportJobResponse {
	success: boolean;
	data: ImportJob;
	message?: string;
}

export interface ImportTemplateResponse {
	success: boolean;
	data: ImportTemplate[];
	message?: string;
}

export interface ImportPreviewResponse {
	success: boolean;
	data: {
		headers: string[];
		preview: string[][];
		totalRows: number;
		detectedDelimiter: string;
		detectedEncoding: string;
	};
	message?: string;
}

// Import Validation Result
export interface ImportValidationResult {
	isValid: boolean;
	errors: {
		row: number;
		field: string;
		message: string;
		value: string;
	}[];
	warnings: {
		row: number;
		field: string;
		message: string;
		value: string;
	}[];
	summary: ImportSummary;
}

// Import History Interface
export interface ImportHistory {
	id: string;
	type: ImportType;
	filename: string;
	status: ImportJob['status'];
	summary: ImportSummary;
	createdBy: string;
	createdAt: Date;
	completedAt?: Date;
	isAvailable: boolean;
}

// Field Validation Rules
export interface FieldValidationRule {
	field: string;
	type: 'required' | 'unique' | 'format' | 'range' | 'custom';
	message: string;
	params?: Record<string, unknown>;
}

// API Response wrapper
export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}
