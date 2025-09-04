import { resourcesClient as http, PaginatedResponse, QueryParams } from '../http';
import { mapPaginatedResources, mapSingleResource } from './models';
import { CreateResourceDto, ResourceResponseDto, UpdateResourceDto, CategoryDto, ProgramDto } from './types';

const base = 'resources';

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

	const res = await http.get(`${base}/paginated`, { searchParams }).json<{
		success: boolean;
		data: ResourceResponseDto[];
		meta?: { page: number; limit: number; total: number; totalPages: number };
	}>();

	return mapPaginatedResources(res);
}

export async function searchResources(q: string): Promise<ResourceResponseDto[]> {
	const res = await http
		.get(`${base}/search`, { searchParams: { q } })
		.json<{ success: boolean; data: ResourceResponseDto[] }>();
	return mapSingleResource<ResourceResponseDto[]>(res);
}

export async function getResourceById(id: string): Promise<ResourceResponseDto> {
	const res = await http.get(`${base}/${id}`).json<{ success: boolean; data: ResourceResponseDto }>();
	return mapSingleResource<ResourceResponseDto>(res);
}

export async function getResourceByCode(code: string): Promise<ResourceResponseDto> {
	const res = await http.get(`${base}/code/${code}`).json<{ success: boolean; data: ResourceResponseDto }>();
	return mapSingleResource<ResourceResponseDto>(res);
}

export async function createResource(payload: CreateResourceDto): Promise<ResourceResponseDto> {
	const res = await http.post(base, { json: payload }).json<{ success: boolean; data: ResourceResponseDto }>();
	return mapSingleResource<ResourceResponseDto>(res);
}

export async function updateResource(id: string, payload: UpdateResourceDto): Promise<ResourceResponseDto> {
	const res = await http
		.put(`${base}/${id}`, { json: payload })
		.json<{ success: boolean; data: ResourceResponseDto }>();
	return mapSingleResource<ResourceResponseDto>(res);
}

export async function deleteResource(id: string, force?: boolean): Promise<{ success: boolean } | ResourceResponseDto> {
	const res = await http
		.delete(`${base}/${id}`, {
			searchParams: force ? { force: 'true' } : undefined
		})
		.json<{ success: boolean; data?: ResourceResponseDto }>();
	return res.data ?? { success: true };
}

// Categories API services
export async function listCategories(
	filters: { isDefault?: boolean; isActive?: boolean } = {}
): Promise<CategoryDto[]> {
	const searchParams = new URLSearchParams();

	if (filters.isDefault !== undefined) searchParams.set('isDefault', String(filters.isDefault));

	if (filters.isActive !== undefined) searchParams.set('isActive', String(filters.isActive));

	const res = await http.get('resource-categories', { searchParams }).json<{ success: boolean; data: CategoryDto[] }>();
	return mapSingleResource<CategoryDto[]>(res);
}

export async function getCategoryById(id: string): Promise<CategoryDto> {
	const res = await http.get(`resource-categories/${id}`).json<{ success: boolean; data: CategoryDto }>();
	return mapSingleResource<CategoryDto>(res);
}

// Programs API services
export async function listPrograms(): Promise<ProgramDto[]> {
	const res = await http.get('programs').json<{ success: boolean; data: ProgramDto[] }>();
	return mapSingleResource<ProgramDto[]>(res);
}

export async function listActivePrograms(): Promise<ProgramDto[]> {
	const res = await http.get('programs/active').json<{ success: boolean; data: ProgramDto[] }>();
	return mapSingleResource<ProgramDto[]>(res);
}

export async function getProgramById(id: string): Promise<ProgramDto> {
	const res = await http.get(`programs/${id}`).json<{ success: boolean; data: ProgramDto }>();
	return mapSingleResource<ProgramDto>(res);
}
