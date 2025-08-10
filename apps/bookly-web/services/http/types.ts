/**
 * Common HTTP types and interfaces for Bookly API
 */

export interface ApiResponse<T = unknown> {
	data: T;
	message?: string;
	success: boolean;
}

export interface ApiError {
	code: string;
	message: string;
	type: 'error' | 'warning' | 'info';
	exception_code?: string;
	http_code: number;
	http_exception: string;
}

export interface PaginatedResponse<T = unknown> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface QueryParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	[key: string]: unknown;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
