/**
 * Custom hooks for resource management
 * Provides simplified access to Redux resource state and actions
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'store';
import {
	fetchResourcesPaginated,
	fetchResourceById,
	createResourceAsync,
	updateResourceAsync,
	deleteResourceAsync,
	fetchCategories,
	fetchPrograms,
	setFilters,
	setPagination,
	clearCurrentResource,
	clearErrors
} from '@store/slices/resourcesSlice';
import type {
	CreateResourceDto,
	UpdateResourceDto,
	ResourceResponseDto,
	CategoryDto,
	ProgramDto
} from '@services/resources/types';

// Main resources hook
export function useResources() {
	const dispatch = useAppDispatch();
	const { resources, pagination, filters, currentResource, categories, programs, loading, errors } = useAppSelector(
		(state) => state.resources
	);

	// Fetch resources with pagination and filters
	const fetchResources = useCallback(
		(params?: {
			page?: number;
			limit?: number;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
			q?: string;
			type?: string;
			status?: string;
		}) => {
			return dispatch(fetchResourcesPaginated(params || {}));
		},
		[dispatch]
	);

	// Fetch single resource
	const fetchResource = useCallback(
		(id: string) => {
			return dispatch(fetchResourceById(id));
		},
		[dispatch]
	);

	// Create new resource
	const createResource = useCallback(
		(data: CreateResourceDto) => {
			return dispatch(createResourceAsync(data));
		},
		[dispatch]
	);

	// Update existing resource
	const updateResource = useCallback(
		(id: string, data: UpdateResourceDto) => {
			return dispatch(updateResourceAsync({ id, data }));
		},
		[dispatch]
	);

	// Delete resource
	const deleteResource = useCallback(
		(id: string, force?: boolean) => {
			return dispatch(deleteResourceAsync({ id, force }));
		},
		[dispatch]
	);

	// Update filters
	const updateFilters = useCallback(
		(newFilters: Partial<typeof filters>) => {
			dispatch(setFilters(newFilters));
		},
		[dispatch, filters]
	);

	// Update pagination
	const updatePagination = useCallback(
		(newPagination: Partial<typeof pagination>) => {
			dispatch(setPagination(newPagination));
		},
		[dispatch, pagination]
	);

	// Clear current resource
	const clearResource = useCallback(() => {
		dispatch(clearCurrentResource());
	}, [dispatch]);

	// Clear all errors
	const clearAllErrors = useCallback(() => {
		dispatch(clearErrors());
	}, [dispatch]);

	return {
		// State
		resources,
		pagination,
		filters,
		currentResource,
		loading,
		errors,

		// Actions
		fetchResources,
		fetchResource,
		createResource,
		updateResource,
		deleteResource,
		updateFilters,
		updatePagination,
		clearResource,
		clearAllErrors
	};
}

// Categories hook
export function useResourceCategories() {
	const dispatch = useAppDispatch();
	const { categories, loading, errors } = useAppSelector((state) => state.resources);

	const fetchResourceCategories = useCallback(
		(filters?: { isDefault?: boolean; isActive?: boolean }) => {
			return dispatch(fetchCategories(filters));
		},
		[dispatch]
	);

	return {
		categories,
		loading: loading.categories,
		error: errors.categories,
		fetchCategories: fetchResourceCategories
	};
}

// Programs hook
export function useResourcePrograms() {
	const dispatch = useAppDispatch();
	const { programs, loading, errors } = useAppSelector((state) => state.resources);

	const fetchResourcePrograms = useCallback(() => {
		return dispatch(fetchPrograms());
	}, [dispatch]);

	return {
		programs,
		loading: loading.programs,
		error: errors.programs,
		fetchPrograms: fetchResourcePrograms
	};
}

// Hook for resource form operations
export function useResourceForm() {
	const dispatch = useAppDispatch();
	const { currentResource, loading, errors } = useAppSelector((state) => state.resources);

	const saveResource = useCallback(
		async (data: CreateResourceDto | UpdateResourceDto, id?: string) => {
			if (id) {
				// Update existing resource
				return dispatch(updateResourceAsync({ id, data: data as UpdateResourceDto }));
			} else {
				// Create new resource
				return dispatch(createResourceAsync(data as CreateResourceDto));
			}
		},
		[dispatch]
	);

	const loadResource = useCallback(
		(id: string) => {
			return dispatch(fetchResourceById(id));
		},
		[dispatch]
	);

	const resetForm = useCallback(() => {
		dispatch(clearCurrentResource());
		dispatch(clearErrors());
	}, [dispatch]);

	return {
		currentResource,
		loading: {
			save: loading.create || loading.update,
			load: loading.detail
		},
		errors: {
			save: errors.create || errors.update,
			load: errors.detail
		},
		saveResource,
		loadResource,
		resetForm
	};
}

// Hook for resource list operations
export function useResourceList() {
	const dispatch = useAppDispatch();
	const { resources, pagination, filters, loading, errors } = useAppSelector((state) => state.resources);

	const refreshList = useCallback(() => {
		const params = {
			page: pagination.page,
			limit: pagination.limit,
			...filters
		};
		return dispatch(fetchResourcesPaginated(params));
	}, [dispatch, pagination, filters]);

	const changePage = useCallback(
		(newPage: number) => {
			dispatch(setPagination({ page: newPage }));
			const params = {
				page: newPage,
				limit: pagination.limit,
				...filters
			};
			return dispatch(fetchResourcesPaginated(params));
		},
		[dispatch, pagination.limit, filters]
	);

	const changePageSize = useCallback(
		(newLimit: number) => {
			dispatch(setPagination({ limit: newLimit, page: 1 }));
			const params = {
				page: 1,
				limit: newLimit,
				...filters
			};
			return dispatch(fetchResourcesPaginated(params));
		},
		[dispatch, filters]
	);

	const search = useCallback(
		(query: string) => {
			const newFilters = { ...filters, q: query || undefined };
			dispatch(setFilters(newFilters));
			const params = {
				page: 1,
				limit: pagination.limit,
				...newFilters
			};
			return dispatch(fetchResourcesPaginated(params));
		},
		[dispatch, filters, pagination.limit]
	);

	const filterByType = useCallback(
		(type: string) => {
			const newFilters = { ...filters, type: type || undefined };
			dispatch(setFilters(newFilters));
			const params = {
				page: 1,
				limit: pagination.limit,
				...newFilters
			};
			return dispatch(fetchResourcesPaginated(params));
		},
		[dispatch, filters, pagination.limit]
	);

	const filterByStatus = useCallback(
		(status: string) => {
			const newFilters = { ...filters, status: status || undefined };
			dispatch(setFilters(newFilters));
			const params = {
				page: 1,
				limit: pagination.limit,
				...newFilters
			};
			return dispatch(fetchResourcesPaginated(params));
		},
		[dispatch, filters, pagination.limit]
	);

	return {
		resources,
		pagination,
		filters,
		loading: loading.list,
		error: errors.list,
		refreshList,
		changePage,
		changePageSize,
		search,
		filterByType,
		filterByStatus
	};
}

// Hook for single resource operations
export function useResourceDetail(resourceId?: string) {
	const dispatch = useAppDispatch();
	const { currentResource, loading, errors } = useAppSelector((state) => state.resources);

	const loadResource = useCallback(() => {
		if (resourceId) {
			return dispatch(fetchResourceById(resourceId));
		}
	}, [dispatch, resourceId]);

	const removeResource = useCallback(
		(force?: boolean) => {
			if (resourceId) {
				return dispatch(deleteResourceAsync({ id: resourceId, force }));
			}
		},
		[dispatch, resourceId]
	);

	return {
		resource: currentResource,
		loading: loading.detail,
		error: errors.detail,
		deleteLoading: loading.delete,
		deleteError: errors.delete,
		loadResource,
		removeResource
	};
}
