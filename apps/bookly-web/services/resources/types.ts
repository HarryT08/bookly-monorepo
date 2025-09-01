// Resources service types aligned with backend DTOs
// Source backend DTOs:
// - bookly-backend/src/libs/dto/resources/create-resource.dto.ts
// - bookly-backend/src/libs/dto/resources/update-resource.dto.ts
// - bookly-backend/src/libs/dto/resources/resource-response.dto.ts

export type ResourceType = 'CLASSROOM' | 'AUDITORIUM' | 'LABORATORY' | 'OFFICE' | 'EQUIPMENT' | 'VEHICLE' | 'OTHER';
export type ResourceStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RESERVED';
export type UserPriority = 'STUDENT' | 'TEACHER' | 'RESEARCHER' | 'ADMIN' | 'GENERAL';
export type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';

// Backend uses location as a simple string, not an object
// Keeping this interface for potential future use, but backend expects string
export interface ResourceLocation {
	building?: string;
	floor?: string;
	room?: string;
	description?: string;
	[key: string]: unknown;
}

export interface WeeklySlot {
	dayOfWeek: number; // 1-7 (Mon-Sun) or 0-6 depending on backend; frontend treats as number
	start: string; // HH:mm
	end: string; // HH:mm
}

export interface UsageRules {
	// Time restrictions
	minReservationTime?: number; // minutes
	maxReservationTime?: number; // minutes
	advanceBookingMin?: number; // hours
	advanceBookingMax?: number; // hours

	// User restrictions
	userPriorities?: UserPriority[];
	requiredTraining?: string[];
	maxReservationsPerUser?: number;
	maxReservationsPerWeek?: number;

	// Cancellation rules
	cancellationDeadline?: number; // hours before reservation
	noShowPenalty?: boolean;
	penaltyDuration?: number; // days of restriction

	// Special conditions
	requiresApproval?: boolean;
	allowRecurring?: boolean;
	specialRequirements?: string[];
}

export interface TechnicalSpecifications {
	// General specs
	specifications?: Record<string, string>;
	associatedEquipment?: string[];
	softwareInstalled?: string[];

	// Maintenance
	maintenanceFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
	maintenanceNotes?: string;
	estimatedLifespan?: number; // months

	// Capacity details
	physicalCapacity?: number;
	optimalCapacity?: number;
	accessibilityFeatures?: string[];
}

export interface CostConfiguration {
	costPerHour?: number;
	costPerDay?: number;
	costPerReservation?: number;

	// Discounts
	studentDiscount?: number; // percentage
	facultyDiscount?: number; // percentage
	programDiscounts?: Record<string, number>; // program ID -> discount percentage

	// Payment
	paymentMethods?: ('ONLINE' | 'INVOICE' | 'CASH' | 'INTERNAL')[];
	requiresDeposit?: boolean;
	depositAmount?: number;
	refundPolicy?: string;
}

export interface AvailableSchedules {
	operatingHours?: {
		weekly?: WeeklySlot[];
		[key: string]: unknown;
	};
	weekly?: WeeklySlot[];
	restrictions?: Record<string, unknown>[];
	priorities?: Record<string, unknown>[];
	blockedDates?: string[]; // ISO date strings
	preparationTime?: number; // minutes between reservations
	[key: string]: unknown;
}

export interface CreateResourceDto {
	name: string;
	description?: string;
	type: ResourceType;
	categoryId?: string; // Optional in backend
	programId: string; // Required in backend
	location?: string; // Backend expects string, not object
	capacity?: number; // >= 1 when provided
	attributes?: Record<string, unknown>; // Key-value pairs for resource-specific attributes
	availableSchedules?: Record<string, unknown>; // Updated to match backend field name
	isActive?: boolean; // Default true
}

export interface UpdateResourceDto {
	name?: string;
	description?: string;
	location?: string; // Backend expects string, not object
	capacity?: number;
	status?: ResourceStatus;
	attributes?: Record<string, unknown>;
	availableSchedules?: Record<string, unknown>; // Updated to match backend field name
	categoryId?: string;
	isActive?: boolean;
}

export interface ResourceResponseDto {
	id: string;
	name: string;
	code: string; // Added to match backend response
	description?: string;
	type: ResourceType;
	categoryId?: string;
	programId: string; // Required in backend response
	location?: string; // Backend uses string, not object
	capacity?: number;
	status: ResourceStatus;
	attributes?: Record<string, unknown>; // Key-value pairs for resource-specific attributes
	availableSchedules?: Record<string, unknown>; // Updated to match backend field name
	isActive: boolean;
	createdAt: string; // Backend uses Date but serialized as string
	updatedAt: string; // Backend uses Date but serialized as string
	// Related entities from backend
	category?: CategoryDto;
	program?: ProgramDto;
}

// Backend category structure
export interface CategoryDto {
	id: string;
	name: string;
	description?: string;
	color?: string; // Color code for UI display
	icon?: string; // Icon identifier for UI display
	isActive: boolean;
	createdBy?: string;
	createdAt: string;
	updatedAt: string;
}

// Backend program structure
export interface ProgramDto {
	id: string;
	name: string;
	description?: string;
	code: string; // Program code (e.g., "ING-SIS")
	coordinatorId?: string;
	isActive: boolean;
	createdBy?: string;
	createdAt: string;
	updatedAt: string;
}
