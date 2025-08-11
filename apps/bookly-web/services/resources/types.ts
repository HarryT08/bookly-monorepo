// Resources service types aligned with backend DTOs
// Source backend DTOs:
// - bookly-backend/src/libs/dto/resources/create-resource.dto.ts
// - bookly-backend/src/libs/dto/resources/update-resource.dto.ts
// - bookly-backend/src/libs/dto/resources/resource-response.dto.ts

export type ResourceType = 'ROOM' | 'EQUIPMENT' | 'AUDITORIUM' | 'LABORATORY' | 'COMPUTER';
export type ResourceStatus = 'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RESERVED';

export interface ResourceLocation {
	// Adjust once backend location exact shape is confirmed
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

export interface AvailableSchedules {
	operatingHours?: {
		weekly?: WeeklySlot[];
		[key: string]: unknown;
	};
	restrictions?: Record<string, unknown>[];
	priorities?: Record<string, unknown>[];
	[key: string]: unknown;
}

export interface CreateResourceDto {
	name: string;
	description?: string;
	type: ResourceType;
	capacity?: number; // >= 1 when provided
	location?: ResourceLocation;
	attributes?: Record<string, unknown>;
	availableSchedules?: AvailableSchedules;
	categoryId?: string;
}

export interface UpdateResourceDto {
	name?: string;
	description?: string;
	type?: ResourceType;
	capacity?: number;
	location?: ResourceLocation;
	status?: ResourceStatus;
	attributes?: Record<string, unknown>;
	availableSchedules?: AvailableSchedules;
	categoryId?: string;
	isActive?: boolean;
}

export interface ResourceResponseDto {
	id: string;
	name: string;
	code: string;
	description?: string;
	type: ResourceType;
	capacity?: number;
	location?: ResourceLocation;
	status: ResourceStatus;
	attributes?: Record<string, unknown>;
	availableSchedules?: AvailableSchedules;
	categoryId?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
