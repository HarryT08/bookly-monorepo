/**
 * Availability and Reservation Types for Frontend
 * Based on backend availability-service DTOs and entities
 * Supports RF-07, RF-08, RF-10, RF-11 requirements
 */

// ========================================
// RF-07: Schedule and Availability Types
// ========================================

export interface WeeklySchedule {
	id?: string;
	resourceId: string;
	dayOfWeek: number; // 0-6 (Sunday to Saturday)
	startTime: string; // HH:mm format
	endTime: string; // HH:mm format
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Schedule {
	id?: string;
	resourceId: string;
	name: string;
	type: ScheduleType;
	startDate: Date;
	endDate?: Date;
	recurrenceRule?: RecurrenceRule;
	restrictions?: ScheduleRestrictions;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export enum ScheduleType {
	REGULAR = 'REGULAR',
	RESTRICTED = 'RESTRICTED',
	EXCEPTION = 'EXCEPTION',
	MAINTENANCE = 'MAINTENANCE',
	ACADEMIC_EVENT = 'ACADEMIC_EVENT'
}

export enum SchedulePriority {
	LOW = 'LOW',
	NORMAL = 'NORMAL',
	HIGH = 'HIGH',
	CRITICAL = 'CRITICAL'
}

export interface ScheduleRestrictions {
	allowedUserTypes?: string[];
	priority?: SchedulePriority;
	minAdvanceNotice?: number; // in hours
	maxReservationDuration?: number; // in hours
	requiresApproval?: boolean;
	blackoutDates?: Date[];
}

export interface RecurrenceRule {
	frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
	interval: number;
	endDate?: Date;
	count?: number;
	byWeekDay?: number[];
	byMonthDay?: number[];
}

// ========================================
// RF-08: Calendar Integration Types
// ========================================

export interface CalendarIntegration {
	id?: string;
	resourceId?: string;
	provider: CalendarProvider;
	name: string;
	credentials: CalendarCredentials;
	calendarId?: string;
	syncInterval: number; // minutes
	lastSync?: Date;
	isActive: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export enum CalendarProvider {
	GOOGLE = 'GOOGLE',
	OUTLOOK = 'OUTLOOK',
	ICAL = 'ICAL',
	INTERNAL = 'INTERNAL'
}

export interface CalendarCredentials {
	clientId?: string;
	clientSecret?: string;
	accessToken?: string;
	refreshToken?: string;
	url?: string; // for iCal
}

export interface CalendarEvent {
	id?: string;
	integrationId: string;
	externalEventId: string;
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	allDay: boolean;
	location?: string;
	organizer?: string;
	lastSync?: Date;
	isActive: boolean;
}

// ========================================
// RF-10: Calendar View Types
// ========================================

export enum CalendarViewType {
	MONTH = 'MONTH',
	WEEK = 'WEEK',
	DAY = 'DAY',
	AGENDA = 'AGENDA'
}

export enum EventType {
	RESERVATION = 'RESERVATION',
	SCHEDULE = 'SCHEDULE',
	AVAILABILITY = 'AVAILABILITY',
	EXTERNAL = 'EXTERNAL',
	BLOCKED = 'BLOCKED'
}

export interface CalendarViewData {
	events: CalendarEventDisplay[];
	availabilitySlots: AvailabilitySlot[];
	conflicts: CalendarConflict[];
	metadata: CalendarMetadata;
}

export interface CalendarEventDisplay {
	id: string;
	title: string;
	start: Date;
	end: Date;
	type: EventType;
	resourceId?: string;
	resourceName?: string;
	userId?: string;
	userName?: string;
	status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'BLOCKED';
	priority: SchedulePriority;
	color?: string;
	isEditable: boolean;
	conflictsWith?: string[];
}

export interface AvailabilitySlot {
	id: string;
	resourceId: string;
	start: Date;
	end: Date;
	isAvailable: boolean;
	restrictions?: string[];
	minimumDuration?: number;
	maximumDuration?: number;
}

export interface CalendarConflict {
	id: string;
	type: 'DOUBLE_BOOKING' | 'RESTRICTION_VIOLATION' | 'EXTERNAL_CONFLICT';
	severity: 'WARNING' | 'ERROR' | 'CRITICAL';
	message: string;
	affectedEvents: string[];
	suggestedActions?: string[];
}

export interface CalendarMetadata {
	totalEvents: number;
	totalConflicts: number;
	lastUpdated: Date;
	nextSync?: Date;
	resourcesIncluded: string[];
}

// ========================================
// Reservation Management Types
// ========================================

export interface Reservation {
	id?: string;
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	resourceId: string;
	resourceName?: string;
	userId: string;
	userName?: string;
	status: ReservationStatus;
	isRecurring: boolean;
	recurrence?: RecurrenceRule;
	approvalRequired: boolean;
	approvedBy?: string;
	approvedAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

export enum ReservationStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	CANCELLED = 'CANCELLED',
	COMPLETED = 'COMPLETED',
	NO_SHOW = 'NO_SHOW'
}

// ========================================
// RF-11: Reservation History Types
// ========================================

export interface ReservationHistory {
	id?: string;
	reservationId: string;
	userId: string;
	action: HistoryAction;
	source: HistorySource;
	previousData?: Record<string, any>;
	newData?: Record<string, any>;
	details?: string;
	ipAddress?: string;
	userAgent?: string;
	createdAt?: Date;
}

export enum HistoryAction {
	CREATED = 'CREATED',
	UPDATED = 'UPDATED',
	CANCELLED = 'CANCELLED',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
	CHECKED_IN = 'CHECKED_IN',
	CHECKED_OUT = 'CHECKED_OUT',
	NO_SHOW = 'NO_SHOW'
}

export enum HistorySource {
	WEB_APP = 'WEB_APP',
	MOBILE_APP = 'MOBILE_APP',
	API = 'API',
	SYSTEM = 'SYSTEM',
	ADMIN = 'ADMIN'
}

// ========================================
// API Request/Response Types
// ========================================

export interface AvailabilityQuery {
	resourceId?: string;
	startDate: Date;
	endDate: Date;
	includeReservations?: boolean;
	includeScheduleRestrictions?: boolean;
	includeConflicts?: boolean;
}

export interface CreateReservationRequest {
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	resourceId: string;
	isRecurring?: boolean;
	recurrence?: RecurrenceRule;
}

export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
	id: string;
	status?: ReservationStatus;
}

export interface CalendarViewQuery {
	resourceId?: string;
	startDate: Date;
	endDate: Date;
	viewType?: CalendarViewType;
	eventTypes?: EventType[];
	includeAvailability?: boolean;
	includeExternalEvents?: boolean;
	userId?: string;
}

export interface ReservationHistoryQuery {
	reservationId?: string;
	userId?: string;
	resourceId?: string;
	actions?: HistoryAction[];
	sources?: HistorySource[];
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

// ========================================
// Availability Check Response
// ========================================

export interface AvailabilityCheckResult {
	isAvailable: boolean;
	reason?: string;
	conflicts?: CalendarConflict[];
	suggestedAlternatives?: AvailabilitySlot[];
	restrictions?: ScheduleRestrictions;
}
