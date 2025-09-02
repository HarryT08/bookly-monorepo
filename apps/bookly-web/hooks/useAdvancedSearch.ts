import { useState, useCallback } from 'react';
import { availabilityService } from '../src/services/availability/availabilityService';
import { useSnackbar } from 'notistack';
import type {
	AdvancedSearchFilters,
	AdvancedSearchResponse,
	AvailabilityResponse,
	PopularResourcesResponse,
	SearchHistoryResponse,
	QuickSearchResponse
} from '../src/services/availability/types';

interface UseAdvancedSearchState {
	searchResults: AdvancedSearchResponse | null;
	availabilityResults: AvailabilityResponse | null;
	popularResources: PopularResourcesResponse | null;
	searchHistory: SearchHistoryResponse | null;
	quickSearchResults: QuickSearchResponse | null;
	loading: {
		search: boolean;
		availability: boolean;
		popular: boolean;
		history: boolean;
		quickSearch: boolean;
	};
	error: string | null;
}

interface UseAdvancedSearchActions {
	performAdvancedSearch: (filters: AdvancedSearchFilters) => Promise<void>;
	checkAvailability: (
		resourceIds: string[],
		startDate: Date,
		endDate: Date,
		includeConflicts?: boolean,
		includeAlternatives?: boolean
	) => Promise<void>;
	performQuickSearch: (
		searchTerm: string,
		searchTypes?: ('resources' | 'locations' | 'categories')[],
		limit?: number
	) => Promise<void>;
	getPopularResources: (
		timeRange?: 'day' | 'week' | 'month' | 'year',
		limit?: number,
		categories?: string[],
		academicPrograms?: string[]
	) => Promise<void>;
	getSearchHistory: (page?: number, limit?: number, startDate?: Date, endDate?: Date) => Promise<void>;
	clearResults: () => void;
}

type UseAdvancedSearchReturn = UseAdvancedSearchState & UseAdvancedSearchActions;

export function useAdvancedSearch(): UseAdvancedSearchReturn {
	const { enqueueSnackbar } = useSnackbar();

	const [state, setState] = useState<UseAdvancedSearchState>({
		searchResults: null,
		availabilityResults: null,
		popularResources: null,
		searchHistory: null,
		quickSearchResults: null,
		loading: {
			search: false,
			availability: false,
			popular: false,
			history: false,
			quickSearch: false
		},
		error: null
	});

	const setLoading = useCallback((key: keyof UseAdvancedSearchState['loading'], value: boolean) => {
		setState((prev) => ({
			...prev,
			loading: { ...prev.loading, [key]: value }
		}));
	}, []);

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({ ...prev, error }));
	}, []);

	const performAdvancedSearch = useCallback(
		async (filters: AdvancedSearchFilters) => {
			try {
				setLoading('search', true);
				setError(null);

				const response = await availabilityService.advancedSearch(filters);

				if (response.success) {
					setState((prev) => ({ ...prev, searchResults: response }));
					enqueueSnackbar(`Found ${response.pagination.total} resources`, { variant: 'success' });
				} else {
					throw new Error(response.error?.message || 'Search failed');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'An error occurred during search';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('search', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const checkAvailability = useCallback(
		async (
			resourceIds: string[],
			startDate: Date,
			endDate: Date,
			includeConflicts = true,
			includeAlternatives = true
		) => {
			try {
				setLoading('availability', true);
				setError(null);

				const response = await availabilityService.checkAvailability({
					resourceIds,
					startDate,
					endDate,
					includeConflicts,
					includeAlternatives
				});

				if (response.success) {
					setState((prev) => ({ ...prev, availabilityResults: response }));
					enqueueSnackbar(
						`Availability check complete: ${response.available.length} available, ${response.unavailable.length} unavailable`,
						{ variant: 'info' }
					);
				} else {
					throw new Error(response.error?.message || 'Availability check failed');
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'An error occurred during availability check';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('availability', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const performQuickSearch = useCallback(
		async (
			searchTerm: string,
			searchTypes: ('resources' | 'locations' | 'categories')[] = ['resources', 'locations', 'categories'],
			limit = 10
		) => {
			try {
				setLoading('quickSearch', true);
				setError(null);

				const response = await availabilityService.quickSearch({
					searchTerm,
					searchTypes,
					limit
				});

				if (response.success) {
					setState((prev) => ({ ...prev, quickSearchResults: response }));
					const totalResults =
						response.results.resources.length +
						response.results.locations.length +
						response.results.categories.length;
					enqueueSnackbar(`Quick search found ${totalResults} results`, { variant: 'success' });
				} else {
					throw new Error(response.error?.message || 'Quick search failed');
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'An error occurred during quick search';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('quickSearch', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const getPopularResources = useCallback(
		async (
			timeRange: 'day' | 'week' | 'month' | 'year' = 'month',
			limit = 10,
			categories?: string[],
			academicPrograms?: string[]
		) => {
			try {
				setLoading('popular', true);
				setError(null);

				const response = await availabilityService.getPopularResources({
					timeRange,
					limit,
					categories,
					academicPrograms
				});

				if (response.success) {
					setState((prev) => ({ ...prev, popularResources: response }));
				} else {
					throw new Error(response.error?.message || 'Failed to fetch popular resources');
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'An error occurred while fetching popular resources';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('popular', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const getSearchHistory = useCallback(
		async (page = 1, limit = 20, startDate?: Date, endDate?: Date) => {
			try {
				setLoading('history', true);
				setError(null);

				const response = await availabilityService.getSearchHistory({
					page,
					limit,
					startDate,
					endDate
				});

				if (response.success) {
					setState((prev) => ({ ...prev, searchHistory: response }));
				} else {
					throw new Error(response.error?.message || 'Failed to fetch search history');
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'An error occurred while fetching search history';
				setError(errorMessage);
				enqueueSnackbar(errorMessage, { variant: 'error' });
			} finally {
				setLoading('history', false);
			}
		},
		[setLoading, setError, enqueueSnackbar]
	);

	const clearResults = useCallback(() => {
		setState((prev) => ({
			...prev,
			searchResults: null,
			availabilityResults: null,
			popularResources: null,
			searchHistory: null,
			quickSearchResults: null,
			error: null
		}));
	}, []);

	return {
		...state,
		performAdvancedSearch,
		checkAvailability,
		performQuickSearch,
		getPopularResources,
		getSearchHistory,
		clearResults
	};
}
