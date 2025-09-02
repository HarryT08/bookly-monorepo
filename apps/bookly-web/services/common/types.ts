/**
 * Common types shared across services
 */

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	error: ApiError | null;
}

export interface ApiError {
	code: string;
	message: string;
	details?: unknown;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	role?: string;
}

export interface QueryParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	search?: string;
}
