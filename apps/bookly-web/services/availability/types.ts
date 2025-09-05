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

// Enum types
export enum ReassignmentType {
	TRANSFER = 'TRANSFER',
	EXCHANGE = 'EXCHANGE',
	TEMPORARY = 'TEMPORARY',
	PERMANENT = 'PERMANENT',
	RESCHEDULE = 'RESCHEDULE'
}

export enum WaitlistStatus {
	ACTIVE = 'ACTIVE',
	NOTIFIED = 'NOTIFIED',
	EXPIRED = 'EXPIRED',
	CANCELLED = 'CANCELLED',
	FULFILLED = 'FULFILLED'
}

export enum CalendarViewType {
	DAY = 'day',
	WEEK = 'week',
	MONTH = 'month',
	YEAR = 'year',
	AGENDA = 'agenda'
}

export enum EventType {
	RESERVATION = 'RESERVATION',
	MAINTENANCE = 'MAINTENANCE',
	BLOCKED = 'BLOCKED',
	HOLIDAY = 'HOLIDAY',
	SPECIAL = 'SPECIAL'
}

export enum NotificationStatus {
	SENT = 'SENT',
	READ = 'READ',
	UNREAD = 'UNREAD'
}

// Reassignment types
export interface ReassignmentRequest {
	id?: string;
	originalReservationId: string;
	reservationId?: string;
	currentUserId?: string;
	currentUserName?: string;
	currentUserEmail?: string;
	targetUserId?: string;
	targetUserName?: string;
	targetUserEmail?: string;
	reason: string;
	type: ReassignmentType;
	originalStartTime: Date;
	originalEndTime: Date;
	newStartTime: Date;
	newEndTime: Date;
	newResourceId: string;
	newResourceName: string;
	status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
	requestedAt?: Date;
	processedAt?: Date;
	processedBy?: string;
	notes?: string;
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
	resourceName: string;
	userId: string;
	userName: string;
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

// Waitlist types
export interface JoinWaitlistRequest {
	resourceId: string;
	requestedStartDate: Date;
	requestedEndDate: Date;
	title: string;
	description: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH';
	notificationPreferences: {
		email: boolean;
		sms: boolean;
		push: boolean;
	};
}

export interface WaitlistEntry {
	id: string;
	resourceId: string;
	resourceName: string;
	userId: string;
	userName: string;
	userEmail: string;
	title: string;
	description: string;
	requestedStartDate: Date;
	requestedEndDate: Date;
	priority: 'LOW' | 'MEDIUM' | 'HIGH';
	status: WaitlistStatus;
	position: number;
	estimatedWaitTime?: number;
	notificationPreferences: {
		email: boolean;
		sms: boolean;
		push: boolean;
	};
	createdAt: Date;
	updatedAt: Date;
	expiresAt?: Date;
	notificationSent?: boolean;
}

export interface WaitlistQuery {
	resourceId?: string;
	status?: WaitlistStatus;
	priority?: 'LOW' | 'MEDIUM' | 'HIGH';
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

export interface WaitlistNotification {
	id: string;
	status: NotificationStatus;
	waitlistEntryId: string;
	userId: string;
	type: 'RESOURCE_AVAILABLE' | 'POSITION_UPDATED' | 'EXPIRING_SOON' | 'CANCELLED';
	title: string;
	message: string;
	resourceId: string;
	resourceName: string;
	availableStartDate?: Date;
	availableEndDate?: Date;
	newPosition?: number;
	expiresAt: Date;
	isRead: boolean;
	createdAt: Date;
	actionRequired?: boolean;
	actionData?: {
		reservationId?: string;
		confirmationDeadline?: Date;
	};
}

// Calendar types
export interface CalendarEventDisplay {
	id: string;
	title: string;
	start: Date;
	end: Date;
	type: 'RESERVATION' | 'SCHEDULE' | 'AVAILABILITY' | 'EXTERNAL' | 'BLOCKED';
	color?: string;
	resourceId?: string;
	resourceName?: string;
	userId?: string;
	userName?: string;
	description?: string;
	allDay?: boolean;
	recurring?: boolean;
	status?: string;
}

export interface AvailabilitySlot {
	id: string;
	resourceId: string;
	start: Date;
	end: Date;
	isAvailable: boolean;
	reason?: string;
	type?: 'REGULAR' | 'EXCEPTION' | 'MAINTENANCE' | 'BLOCKED';
	capacity?: number;
	bookedCount?: number;
}

// Additional availability management types
export interface Schedule {
	id: string;
	resourceId: string;
	type: ScheduleType;
	name: string;
	description?: string;
	startDate: Date;
	endDate?: Date;
	isRecurring: boolean;
	recurrencePattern?: {
		frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
		interval: number;
		daysOfWeek?: number[];
		dayOfMonth?: number;
		monthOfYear?: number;
	};
	timeSlots: {
		startTime: string;
		endTime: string;
		dayOfWeek?: number;
	}[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CalendarIntegration {
	id: string;
	resourceId: string;
	provider: CalendarProvider;
	calendarId: string;
	name: string;
	isActive: boolean;
	syncSettings: {
		syncInterval: number;
		lastSyncAt?: Date;
		autoSync: boolean;
		conflictResolution: 'IGNORE' | 'OVERRIDE' | 'MERGE';
	};
	credentials?: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

export interface CalendarViewData {
	events: CalendarEventDisplay[];
	availabilitySlots: AvailabilitySlot[];
	schedules: Schedule[];
	dateRange: {
		start: Date;
		end: Date;
	};
	viewType: CalendarViewType;
	metadata: {
		totalEvents: number;
		conflictsCount: number;
		availableSlots: number;
	};
}

export interface ReservationHistory {
	id: string;
	reservationId: string;
	action: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'APPROVED' | 'REJECTED';
	changedBy: string;
	changedAt: Date;
	previousData?: Record<string, unknown>;
	newData?: Record<string, unknown>;
	reason?: string;
	ipAddress?: string;
	userAgent?: string;
}

export interface AvailabilityQuery {
	resourceIds?: string[];
	startDate: Date;
	endDate: Date;
	includeUnavailable?: boolean;
	includeConflicts?: boolean;
	timeZone?: string;
}

export interface CreateReservationRequest {
	resourceId: string;
	startDate: Date;
	endDate: Date;
	purpose: string;
	attendees?: number;
	notes?: string;
	recurrence?: {
		frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
		interval: number;
		endDate: Date;
		daysOfWeek?: number[];
	};
	notificationPreferences?: {
		email: boolean;
		sms: boolean;
		push: boolean;
	};
}

export interface UpdateReservationRequest {
	startDate?: Date;
	endDate?: Date;
	purpose?: string;
	attendees?: number;
	notes?: string;
	status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
	notificationPreferences?: {
		email: boolean;
		sms: boolean;
		push: boolean;
	};
}

export interface CalendarViewQuery {
	resourceIds?: string[];
	startDate: Date;
	endDate: Date;
	viewType: CalendarViewType;
	includeSchedules?: boolean;
	includeAvailability?: boolean;
	includeReservations?: boolean;
	timeZone?: string;
}

export interface ReservationHistoryQuery {
	reservationId?: string;
	resourceId?: string;
	userId?: string;
	action?: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'APPROVED' | 'REJECTED';
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

export interface AvailabilityCheckResult {
	resourceId: string;
	resourceName: string;
	isAvailable: boolean;
	availableSlots: {
		start: Date;
		end: Date;
		capacity: number;
		bookedCount: number;
	}[];
	conflicts: {
		reservationId: string;
		startDate: Date;
		endDate: Date;
		conflictType: 'OVERLAP' | 'MAINTENANCE' | 'BLOCKED';
	}[];
	suggestions: {
		start: Date;
		end: Date;
		reason: string;
	}[];
}

export enum CalendarProvider {
	GOOGLE = 'GOOGLE',
	OUTLOOK = 'OUTLOOK',
	ICAL = 'ICAL',
	INTERNAL = 'INTERNAL'
}

export enum ScheduleType {
	REGULAR = 'REGULAR',
	EXCEPTION = 'EXCEPTION',
	MAINTENANCE = 'MAINTENANCE',
	HOLIDAY = 'HOLIDAY',
	BLOCKED = 'BLOCKED'
}

// Reassignment management types (updated to match existing usage)
export interface ReassignmentRequest {
	id?: string;
	originalReservationId: string;
	targetUserId?: string;
	targetUserName?: string;
	targetUserEmail?: string;
	reason: string;
	type: ReassignmentType;
	originalStartTime: Date;
	originalEndTime: Date;
	newStartTime: Date;
	newEndTime: Date;
	newResourceId: string;
	newResourceName: string;
	status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
	requestedAt?: Date;
	processedAt?: Date;
	processedBy?: string;
	priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	notifyOriginalUser?: boolean;
	notifyTargetResourceOwner?: boolean;
}

export interface ReassignmentValidation {
	isValid: boolean;
	conflicts: {
		reservationId: string;
		conflictType: 'TIME_OVERLAP' | 'RESOURCE_UNAVAILABLE' | 'CAPACITY_EXCEEDED';
		startDate: Date;
		endDate: Date;
		details: string;
	}[];
	warnings: {
		type: 'APPROVAL_REQUIRED' | 'NOTIFICATION_PENDING' | 'RESOURCE_DIFFERENT_TYPE';
		message: string;
		severity: 'LOW' | 'MEDIUM' | 'HIGH';
	}[];
	alternatives: {
		resourceId: string;
		resourceName: string;
		startDate: Date;
		endDate: Date;
		score: number;
		reason: string;
	}[];
	requiredApprovals: string[];
	estimatedProcessingTime: number;
}

export interface ReassignmentHistory {
	id: string;
	originalReservationId: string;
	originalResourceId: string;
	originalResourceName: string;
	targetResourceId: string;
	targetResourceName: string;
	originalStartDate: Date;
	originalEndDate: Date;
	newStartDate: Date;
	newEndDate: Date;
	reason: string;
	requestedBy: string;
	requestedByName?: string;
	requestedAt: Date;
	status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
	approvedBy?: string;
	approvedByName?: string;
	approvedAt?: Date;
	rejectedBy?: string;
	rejectedByName?: string;
	rejectedAt?: Date;
	rejectionReason?: string;
	cancelledBy?: string;
	cancelledByName?: string;
	cancelledAt?: Date;
	cancellationReason?: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	notificationsSent: {
		type: 'EMAIL' | 'SMS' | 'PUSH' | 'SYSTEM';
		recipient: string;
		sentAt: Date;
		status: 'sent' | 'delivered' | 'failed';
	}[];
	auditLog: {
		action: string;
		performedBy: string;
		performedAt: Date;
		details?: Record<string, unknown>;
	}[];
}

// Reassignment response types
export interface ReassignmentApiResponse extends ApiResponse<ReassignmentRequest> {}

export interface ReassignmentListResponse extends ApiResponse<ReassignmentHistory[]> {
	pagination?: PaginationResponse;
}

export interface ReassignmentHistoryResponse extends ApiResponse<ReassignmentHistory[]> {
	pagination?: PaginationResponse;
}
