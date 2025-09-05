import { resourcesClient as http, PaginatedResponse, QueryParams } from '../http';
import { mapPaginatedResources, mapSingleResource } from './models';
import { CreateResourceDto, ResourceResponseDto, UpdateResourceDto, CategoryDto, ProgramDto } from './types';

export interface ResourceListFilters extends QueryParams {
	type?: string;
	status?: string;
	categoryId?: string;
	isActive?: boolean;
	location?: string;
	q?: string;
}

export async function listResourcesPaginated(
	filters: ResourceListFilters = {}
): Promise<PaginatedResponse<ResourceResponseDto>> {
	const searchParams = new URLSearchParams();
	const { page, limit, sortBy, sortOrder, q, ...rest } = filters;

	if (page) searchParams.set('page', String(page));

	if (limit) searchParams.set('limit', String(limit));

	if (sortBy) searchParams.set('sortBy', sortBy);

	if (sortOrder) searchParams.set('sortOrder', sortOrder);

	if (q) searchParams.set('q', q);

	Object.entries(rest).forEach(([k, v]) => {
		if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
	});

	const res = await http.get<{
		success: boolean;
		data: ResourceResponseDto[];
		meta?: { page: number; limit: number; total: number; totalPages: number };
	}>(`resources/paginated?${searchParams}`);

	return mapPaginatedResources(res.data);
}

export async function searchResources(q: string): Promise<ResourceResponseDto[]> {
	const searchParams = new URLSearchParams({ q });
	const res = await http.get<{ success: boolean; data: ResourceResponseDto[] }>(`resources/search?${searchParams}`);
	return mapSingleResource<ResourceResponseDto[]>(res.data);
}

export async function getResourceById(id: string): Promise<ResourceResponseDto> {
	const res = await http.get<{ success: boolean; data: ResourceResponseDto }>(`resources/${id}`);
	return mapSingleResource<ResourceResponseDto>(res.data);
}

export async function getResourceByCode(code: string): Promise<ResourceResponseDto> {
	const res = await http.get<{ success: boolean; data: ResourceResponseDto }>(`resources/code/${code}`);
	return mapSingleResource<ResourceResponseDto>(res.data);
}

export async function createResource(payload: CreateResourceDto): Promise<ResourceResponseDto> {
	const res = await http.post<{ success: boolean; data: ResourceResponseDto }>('resources', payload);
	return mapSingleResource<ResourceResponseDto>(res.data);
}

export async function updateResource(id: string, payload: UpdateResourceDto): Promise<ResourceResponseDto> {
	const res = await http.put<{ success: boolean; data: ResourceResponseDto }>(`resources/${id}`, payload);
	return mapSingleResource<ResourceResponseDto>(res.data);
}

export async function deleteResource(id: string, force?: boolean): Promise<{ success: boolean } | ResourceResponseDto> {
	const url = force ? `resources/${id}?force=true` : `resources/${id}`;
	const res = await http.delete<{ success: boolean; data?: ResourceResponseDto }>(url);
	return res.data.data ?? { success: true };
}

// Categories API services
export async function listCategories(
	filters: { isDefault?: boolean; isActive?: boolean } = {}
): Promise<CategoryDto[]> {
	const searchParams = new URLSearchParams();

	if (filters.isDefault !== undefined) searchParams.set('isDefault', String(filters.isDefault));

	if (filters.isActive !== undefined) searchParams.set('isActive', String(filters.isActive));

	const res = await http.get<{ success: boolean; data: CategoryDto[] }>(`resource-categories?${searchParams}`);
	return mapSingleResource<CategoryDto[]>(res.data);
}

export async function getCategoryById(id: string): Promise<CategoryDto> {
	const res = await http.get<{ success: boolean; data: CategoryDto }>(`resource-categories/${id}`);
	return mapSingleResource<CategoryDto>(res.data);
}

// Programs API services
export async function listPrograms(): Promise<ProgramDto[]> {
	const res = await http.get<{ success: boolean; data: ProgramDto[] }>('programs');
	return mapSingleResource<ProgramDto[]>(res.data);
}

export async function listActivePrograms(): Promise<ProgramDto[]> {
	const res = await http.get<{ success: boolean; data: ProgramDto[] }>('programs/active');
	return mapSingleResource<ProgramDto[]>(res.data);
}

export async function getProgramById(id: string): Promise<ProgramDto> {
	const res = await http.get<{ success: boolean; data: ProgramDto }>(`programs/${id}`);
	return mapSingleResource<ProgramDto>(res.data);
}
