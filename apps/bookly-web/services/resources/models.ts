import { PaginatedResponse } from '../http/types';
import { ResourceResponseDto } from './types';

export function mapPaginatedResources(backend: {
	success: boolean;
	data: ResourceResponseDto[];
	meta?: { page: number; limit: number; total: number; totalPages: number };
}): PaginatedResponse<ResourceResponseDto> {
	return {
		data: backend.data ?? [],
		pagination: {
			page: backend.meta?.page ?? 1,
			limit: backend.meta?.limit ?? 10,
			total: backend.meta?.total ?? backend.data?.length ?? 0,
			totalPages: backend.meta?.totalPages ?? 1
		}
	};
}

export function mapSingleResource<T = ResourceResponseDto>(backend: { success: boolean; data: T }): T {
	return backend.data;
}
