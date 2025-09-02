export interface AdvancedSearchFilters {
	searchTerm?: string;
	resourceTypes?: string[];
	locations?: string[];
	categories?: string[];
	capacityMin?: number;
	capacityMax?: number;
	features?: string[];
	academicPrograms?: string[];
	includeUnavailable?: boolean;
	availabilityWindow?: {
		start: Date;
		end: Date;
	};
	sortBy?: 'name' | 'capacity' | 'location' | 'type' | 'createdAt' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface ResourceSearchResult {
	id: string;
	name: string;
	type: string;
	location: string;
	capacity: number;
	features: string[];
	categories: string[];
	academicPrograms: string[];
	isActive: boolean;
	isAvailable?: boolean;
	unavailabilityReason?: string;
	alternativeSuggestions?: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface AdvancedSearchResponse {
	success: boolean;
	data: ResourceSearchResult[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	metadata: {
		totalMatches: number;
		searchTime: number;
		appliedFilters: Partial<AdvancedSearchFilters>;
	};
	error?: {
		code: string;
		message: string;
		type: string;
	};
}

export interface AvailabilityCheckRequest {
	resourceIds: string[];
	startDate: Date;
	endDate: Date;
	includeConflicts?: boolean;
	includeAlternatives?: boolean;
}

export interface AvailabilityResult {
	resourceId: string;
	resourceName: string;
	isAvailable: boolean;
	conflictingReservations?: {
		id: string;
		startDate: Date;
		endDate: Date;
		reservedBy: string;
	}[];
	alternativeTimeSlots?: {
		start: Date;
		end: Date;
		duration: number;
	}[];
	nextAvailableSlot?: {
		start: Date;
		end: Date;
	};
	reason?: string;
}

export interface AvailabilityResponse {
	success: boolean;
	available: AvailabilityResult[];
	unavailable: AvailabilityResult[];
	conflicts?: {
		resourceId: string;
		conflictDetails: string;
		suggestions: string[];
	}[];
	metadata: {
		checkTime: number;
		totalChecked: number;
		requestedWindow: {
			start: Date;
			end: Date;
		};
	};
	error?: {
		code: string;
		message: string;
		type: string;
	};
}

export interface QuickSearchRequest {
	searchTerm: string;
	searchTypes?: ('resources' | 'locations' | 'categories')[];
	limit?: number;
}

export interface QuickSearchResult {
	id: string;
	name: string;
	type: 'resource' | 'location' | 'category';
	matches: {
		field: string;
		value: string;
		highlighted: string;
	}[];
	score: number;
	metadata?: {
		resourceType?: string;
		location?: string;
		capacity?: number;
	};
}

export interface QuickSearchResponse {
	success: boolean;
	results: {
		resources: QuickSearchResult[];
		locations: QuickSearchResult[];
		categories: QuickSearchResult[];
	};
	metadata: {
		searchTime: number;
		totalResults: number;
		searchTerm: string;
	};
	error?: {
		code: string;
		message: string;
		type: string;
	};
}

export interface PopularResourcesRequest {
	timeRange?: 'day' | 'week' | 'month' | 'year';
	limit?: number;
	categories?: string[];
	academicPrograms?: string[];
}

export interface PopularResource {
	id: string;
	name: string;
	type: string;
	location: string;
	capacity: number;
	reservationCount: number;
	utilizationRate: number;
	averageUsageDuration: number;
	peakUsageHours: string[];
	trendDirection: 'up' | 'down' | 'stable';
	popularityScore: number;
}

export interface PopularResourcesResponse {
	success: boolean;
	data: PopularResource[];
	metadata: {
		timeRange: string;
		generatedAt: Date;
		totalAnalyzed: number;
		trends: {
			mostPopularType: string;
			mostPopularLocation: string;
			peakUsageTime: string;
		};
	};
	error?: {
		code: string;
		message: string;
		type: string;
	};
}

export interface SearchHistoryRequest {
	page?: number;
	limit?: number;
	startDate?: Date;
	endDate?: Date;
}

export interface SearchHistoryEntry {
	id: string;
	searchTerm: string;
	filters: Partial<AdvancedSearchFilters>;
	resultsCount: number;
	executedAt: Date;
	executionTime: number;
	wasSuccessful: boolean;
	userAgent?: string;
	ipAddress?: string;
}

export interface SearchHistoryResponse {
	success: boolean;
	data: SearchHistoryEntry[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	metadata: {
		totalSearches: number;
		averageExecutionTime: number;
		mostSearchedTerms: string[];
		searchPatterns: {
			mostUsedFilters: string[];
			averageResultsPerSearch: number;
			successRate: number;
		};
	};
	error?: {
		code: string;
		message: string;
		type: string;
	};
}

// Utility types for pagination and common responses
export interface PaginationRequest {
	page?: number;
	limit?: number;
}

export interface PaginationResponse {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		type: string;
	};
	metadata?: Record<string, unknown>;
}

// Legacy types for backward compatibility
export interface WeeklySchedule {
	id: string;
	resourceId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface Reservation {
	id: string;
	resourceId: string;
	userId: string;
	startDate: Date;
	endDate: Date;
	status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
	purpose: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationResponse;
}
