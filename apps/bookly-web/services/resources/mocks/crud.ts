import { PaginatedResponse, QueryParams } from '../../http/types';
import { CreateResourceDto, ResourceResponseDto, ResourceStatus, UpdateResourceDto } from '../types';
import { MOCK_RESOURCES } from './mockDB';

// In-memory DB seeded from MOCK_RESOURCES
let mockDb: ResourceResponseDto[] = [...MOCK_RESOURCES];

export function resetResourceMocks(): void {
	mockDb = [...MOCK_RESOURCES];
}

type ResourceListMockFilters = QueryParams & {
	type?: string;
	status?: string;
	categoryId?: string;
	isActive?: boolean;
	location?: string;
	q?: string;
};

export function mockListResourcesPaginated(
	filters: ResourceListMockFilters = {}
): PaginatedResponse<ResourceResponseDto> {
	const { page = 1, limit = 10, sortBy, sortOrder, q, ...rest } = filters;
	const normalized = q?.toLowerCase().trim();

	let data = mockDb.filter((r) => {
		// Specific typed filters
		if (rest.type && String(r.type).toLowerCase() !== String(rest.type).toLowerCase()) return false;

		if (rest.status && String(r.status).toLowerCase() !== String(rest.status).toLowerCase()) return false;

		if (typeof rest.isActive === 'boolean' && Boolean(r.isActive) !== Boolean(rest.isActive)) return false;

		if (rest.categoryId && (r.categoryId ?? '') !== String(rest.categoryId)) return false;

		if (rest.location && String(r.location ?? '').toLowerCase() !== String(rest.location).toLowerCase())
			return false;

		if (!normalized) return true;

		return (
			r.name.toLowerCase().includes(normalized) ||
			String(r.type).toLowerCase().includes(normalized) ||
			String(r.status).toLowerCase().includes(normalized) ||
			String(r.location ?? '')
				.toLowerCase()
				.includes(normalized)
		);
	});

	if (sortBy) {
		const dir = (sortOrder ?? 'asc') === 'asc' ? 1 : -1;
		const key = sortBy as keyof ResourceResponseDto;
		data = [...data].sort((a, b) => {
			const av = a[key] as unknown;
			const bv = b[key] as unknown;

			if (typeof av === 'number' && typeof bv === 'number') return av === bv ? 0 : av > bv ? dir : -dir;

			const as = String(av ?? '').toLowerCase();
			const bs = String(bv ?? '').toLowerCase();

			if (as === bs) return 0;

			return as > bs ? dir : -dir;
		});
	}

	const start = (page - 1) * limit;
	const paged = data.slice(start, start + limit);
	const total = data.length;
	const totalPages = Math.max(1, Math.ceil(total / limit));

	return {
		data: paged,
		pagination: { page, limit, total, totalPages }
	};
}

export function mockSearchResources(q: string): ResourceResponseDto[] {
	return mockListResourcesPaginated({ q, page: 1, limit: mockDb.length }).data;
}

export function mockGetResourceById(id: string): ResourceResponseDto | undefined {
	return mockDb.find((r) => r.id === id);
}

function generateId(): string {
	return 'res_' + Math.random().toString(36).slice(2, 10);
}

export function mockCreateResource(dto: CreateResourceDto): ResourceResponseDto {
	const now = new Date().toISOString();
	const newItem: ResourceResponseDto = {
		id: generateId(),
		name: dto.name,
		type: dto.type,
		description: dto.description,
		location: dto.location,
		capacity: dto.capacity,
		status: 'AVAILABLE' as ResourceStatus,
		categoryId: dto.categoryId,
		programId: dto.programId,
		attributes: dto.attributes,
		availabilityRules: dto.availabilityRules,
		isActive: true,
		createdAt: now,
		updatedAt: now
	};

	mockDb.unshift(newItem);
	return newItem;
}

export function mockUpdateResource(id: string, dto: UpdateResourceDto): ResourceResponseDto | undefined {
	const idx = mockDb.findIndex((r) => r.id === id);

	if (idx === -1) return undefined;

	const updated: ResourceResponseDto = {
		...mockDb[idx],
		...dto,
		updatedAt: new Date().toISOString()
	};

	mockDb[idx] = updated;
	return updated;
}

export function mockDeleteResource(
	id: string,
	force?: boolean
): { success: boolean } | ResourceResponseDto | undefined {
	const idx = mockDb.findIndex((r) => r.id === id);

	if (idx === -1) return undefined;

	// If trying to permanently delete a resource with active reservations, block the operation
	// We simulate "active reservations" when the resource status is 'RESERVED'.
	if (force) {
		if (mockDb[idx].status === 'RESERVED') {
			throw new Error(
				'No es posible eliminar permanentemente el recurso porque tiene reservas activas. Deshabilítelo o cancele las reservas antes de eliminar.'
			);
		}

		mockDb.splice(idx, 1);
		return { success: true };
	}

	// Soft disable if not forced
	const updated: ResourceResponseDto = {
		...mockDb[idx],
		isActive: false,
		status: (mockDb[idx].status === 'AVAILABLE' ? 'OUT_OF_SERVICE' : mockDb[idx].status) as ResourceStatus,
		updatedAt: new Date().toISOString()
	};

	mockDb[idx] = updated;
	return updated;
}
