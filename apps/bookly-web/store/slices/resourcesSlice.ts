/**
 * Resources Redux Slice
 * Manages global state for resources management
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	ResourceResponseDto,
	CreateResourceDto,
	UpdateResourceDto,
	CategoryDto,
	ProgramDto
} from '@services/resources/types';
import {
	listResourcesPaginated,
	getResourceById,
	createResource,
	updateResource,
	deleteResource,
	listCategories,
	listActivePrograms
} from '@services/resources/services';

// Async thunks for API calls
export const fetchResourcesPaginated = createAsyncThunk(
	'resources/fetchPaginated',
	async (params: {
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
		q?: string;
		type?: string;
		status?: string;
	}) => {
		const response = await listResourcesPaginated(params);
		return response;
	}
);

export const fetchResourceById = createAsyncThunk('resources/fetchById', async (id: string) => {
	return await getResourceById(id);
});

export const createResourceAsync = createAsyncThunk('resources/create', async (resourceData: CreateResourceDto) => {
	return await createResource(resourceData);
});

export const updateResourceAsync = createAsyncThunk(
	'resources/update',
	async ({ id, data }: { id: string; data: UpdateResourceDto }) => {
		return await updateResource(id, data);
	}
);

export const deleteResourceAsync = createAsyncThunk(
	'resources/delete',
	async ({ id, force }: { id: string; force?: boolean }) => {
		await deleteResource(id, force);
		return id;
	}
);

export const fetchCategories = createAsyncThunk(
	'resources/fetchCategories',
	async (filters?: { isDefault?: boolean; isActive?: boolean }) => {
		return await listCategories(filters);
	}
);

export const fetchPrograms = createAsyncThunk('resources/fetchPrograms', async () => {
	return await listActivePrograms();
});

// State interface
export interface ResourcesState {
	// Resources list
	resources: ResourceResponseDto[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	filters: {
		q?: string;
		type?: string;
		status?: string;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	};

	// Current resource (for details/edit)
	currentResource: ResourceResponseDto | null;

	// Supporting data
	categories: CategoryDto[];
	programs: ProgramDto[];

	// Loading states
	loading: {
		list: boolean;
		detail: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
		categories: boolean;
		programs: boolean;
	};

	// Error states
	errors: {
		list: string | null;
		detail: string | null;
		create: string | null;
		update: string | null;
		delete: string | null;
		categories: string | null;
		programs: string | null;
	};
}

const initialState: ResourcesState = {
	resources: [],
	pagination: {
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0
	},
	filters: {},
	currentResource: null,
	categories: [],
	programs: [],
	loading: {
		list: false,
		detail: false,
		create: false,
		update: false,
		delete: false,
		categories: false,
		programs: false
	},
	errors: {
		list: null,
		detail: null,
		create: null,
		update: null,
		delete: null,
		categories: null,
		programs: null
	}
};

const resourcesSlice = createSlice({
	name: 'resources',
	initialState,
	reducers: {
		// Sync actions
		setFilters: (state, action: PayloadAction<Partial<ResourcesState['filters']>>) => {
			state.filters = { ...state.filters, ...action.payload };
		},
		setPagination: (state, action: PayloadAction<Partial<ResourcesState['pagination']>>) => {
			state.pagination = { ...state.pagination, ...action.payload };
		},
		clearCurrentResource: (state) => {
			state.currentResource = null;
		},
		clearErrors: (state) => {
			state.errors = {
				list: null,
				detail: null,
				create: null,
				update: null,
				delete: null,
				categories: null,
				programs: null
			};
		},
		// Optimistic updates
		addResourceOptimistic: (state, action: PayloadAction<ResourceResponseDto>) => {
			state.resources.unshift(action.payload);
			state.pagination.total += 1;
		},
		updateResourceOptimistic: (state, action: PayloadAction<ResourceResponseDto>) => {
			const index = state.resources.findIndex((r) => r.id === action.payload.id);

			if (index !== -1) {
				state.resources[index] = action.payload;
			}

			if (state.currentResource?.id === action.payload.id) {
				state.currentResource = action.payload;
			}
		},
		removeResourceOptimistic: (state, action: PayloadAction<string>) => {
			state.resources = state.resources.filter((r) => r.id !== action.payload);
			state.pagination.total -= 1;

			if (state.currentResource?.id === action.payload) {
				state.currentResource = null;
			}
		}
	},
	extraReducers: (builder) => {
		// Fetch resources paginated
		builder
			.addCase(fetchResourcesPaginated.pending, (state) => {
				state.loading.list = true;
				state.errors.list = null;
			})
			.addCase(fetchResourcesPaginated.fulfilled, (state, action) => {
				state.loading.list = false;
				state.resources = action.payload.data;
				state.pagination = {
					page: action.payload.pagination.page,
					limit: action.payload.pagination.limit,
					total: action.payload.pagination.total,
					totalPages: action.payload.pagination.totalPages
				};
			})
			.addCase(fetchResourcesPaginated.rejected, (state, action) => {
				state.loading.list = false;
				state.errors.list = action.error.message || 'Failed to fetch resources';
			})

			// Fetch resource by ID
			.addCase(fetchResourceById.pending, (state) => {
				state.loading.detail = true;
				state.errors.detail = null;
			})
			.addCase(fetchResourceById.fulfilled, (state, action) => {
				state.loading.detail = false;
				state.currentResource = action.payload;
			})
			.addCase(fetchResourceById.rejected, (state, action) => {
				state.loading.detail = false;
				state.errors.detail = action.error.message || 'Failed to fetch resource';
			})

			// Create resource
			.addCase(createResourceAsync.pending, (state) => {
				state.loading.create = true;
				state.errors.create = null;
			})
			.addCase(createResourceAsync.fulfilled, (state, action) => {
				state.loading.create = false;
				state.resources.unshift(action.payload);
				state.pagination.total += 1;
			})
			.addCase(createResourceAsync.rejected, (state, action) => {
				state.loading.create = false;
				state.errors.create = action.error.message || 'Failed to create resource';
			})

			// Update resource
			.addCase(updateResourceAsync.pending, (state) => {
				state.loading.update = true;
				state.errors.update = null;
			})
			.addCase(updateResourceAsync.fulfilled, (state, action) => {
				state.loading.update = false;
				const index = state.resources.findIndex((r) => r.id === action.payload.id);

				if (index !== -1) {
					state.resources[index] = action.payload;
				}

				if (state.currentResource?.id === action.payload.id) {
					state.currentResource = action.payload;
				}
			})
			.addCase(updateResourceAsync.rejected, (state, action) => {
				state.loading.update = false;
				state.errors.update = action.error.message || 'Failed to update resource';
			})

			// Delete resource
			.addCase(deleteResourceAsync.pending, (state) => {
				state.loading.delete = true;
				state.errors.delete = null;
			})
			.addCase(deleteResourceAsync.fulfilled, (state, action) => {
				state.loading.delete = false;
				state.resources = state.resources.filter((r) => r.id !== action.payload);
				state.pagination.total -= 1;

				if (state.currentResource?.id === action.payload) {
					state.currentResource = null;
				}
			})
			.addCase(deleteResourceAsync.rejected, (state, action) => {
				state.loading.delete = false;
				state.errors.delete = action.error.message || 'Failed to delete resource';
			})

			// Fetch categories
			.addCase(fetchCategories.pending, (state) => {
				state.loading.categories = true;
				state.errors.categories = null;
			})
			.addCase(fetchCategories.fulfilled, (state, action) => {
				state.loading.categories = false;
				state.categories = action.payload;
			})
			.addCase(fetchCategories.rejected, (state, action) => {
				state.loading.categories = false;
				state.errors.categories = action.error.message || 'Error loading categories';
			})

			// Fetch programs
			.addCase(fetchPrograms.pending, (state) => {
				state.loading.programs = true;
				state.errors.programs = null;
			})
			.addCase(fetchPrograms.fulfilled, (state, action) => {
				state.loading.programs = false;
				state.programs = action.payload;
			})
			.addCase(fetchPrograms.rejected, (state, action) => {
				state.loading.programs = false;
				state.errors.programs = action.error.message || 'Error loading programs';
			});
	}
});

export const {
	setFilters,
	setPagination,
	clearCurrentResource,
	clearErrors,
	addResourceOptimistic,
	updateResourceOptimistic,
	removeResourceOptimistic
} = resourcesSlice.actions;

export default resourcesSlice.reducer;
