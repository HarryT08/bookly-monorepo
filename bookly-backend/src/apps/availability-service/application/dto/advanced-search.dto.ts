/**
 * Advanced Search DTOs - RF-09
 * Data Transfer Objects for advanced resource search API
 * Following API-first design with comprehensive validation and documentation
 */

import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsDate,
  IsEnum,
  IsObject,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
  ValidateNested,
  IsDateString
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// Request DTOs
// ========================================

export class AvailabilityWindowDto {
  @ApiProperty({
    description: 'Start date and time for availability check',
    example: '2024-01-15T08:00:00.000Z',
    type: Date
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  start: Date;

  @ApiProperty({
    description: 'End date and time for availability check',
    example: '2024-01-15T18:00:00.000Z',
    type: Date
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  end: Date;
}

export class AdvancedSearchRequestDto {
  @ApiPropertyOptional({
    description: 'Search term to match against resource name, description, or location',
    example: 'Laboratorio de Computación',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Filter by resource types',
    example: ['CLASSROOM', 'LABORATORY', 'AUDITORIUM'],
    type: [String],
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  resourceTypes?: string[];

  @ApiPropertyOptional({
    description: 'Filter by locations or buildings',
    example: ['Edificio A', 'Biblioteca Central'],
    type: [String],
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  locations?: string[];

  @ApiPropertyOptional({
    description: 'Filter by resource categories',
    example: ['SALON', 'LABORATORIO', 'AUDITORIO'],
    type: [String],
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Minimum capacity required',
    example: 20,
    minimum: 1,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  capacityMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum capacity allowed',
    example: 50,
    minimum: 1,
    maximum: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  capacityMax?: number;

  @ApiPropertyOptional({
    description: 'Required features or equipment',
    example: ['PROYECTOR', 'INTERNET', 'AIRE_ACONDICIONADO'],
    type: [String],
    maxItems: 20
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  features?: string[];

  @ApiPropertyOptional({
    description: 'Filter by academic programs',
    example: ['ING-SIS', 'MED-GEN'],
    type: [String],
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  academicPrograms?: string[];

  @ApiPropertyOptional({
    description: 'Include unavailable resources in results',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  includeUnavailable?: boolean;

  @ApiPropertyOptional({
    description: 'Time window for availability check',
    type: AvailabilityWindowDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AvailabilityWindowDto)
  availabilityWindow?: AvailabilityWindowDto;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'name',
    default: 'name',
    enum: ['name', 'capacity', 'location', 'createdAt', 'popularity']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['name', 'capacity', 'location', 'createdAt', 'popularity'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'asc',
    default: 'asc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class AvailabilityCheckRequestDto {
  @ApiProperty({
    description: 'Resource IDs to check availability for',
    example: ['res_123', 'res_456'],
    type: [String],
    minItems: 1,
    maxItems: 50
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  resourceIds: string[];

  @ApiProperty({
    description: 'Start date and time for the reservation',
    example: '2024-01-15T08:00:00.000Z',
    type: Date
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    description: 'End date and time for the reservation',
    example: '2024-01-15T10:00:00.000Z',
    type: Date
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Include detailed conflict information',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  includeConflicts?: boolean;

  @ApiPropertyOptional({
    description: 'Include alternative resource suggestions',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  includeAlternatives?: boolean;
}

export class QuickSearchRequestDto {
  @ApiProperty({
    description: 'Search term for quick search',
    example: 'aula',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  searchTerm: string;

  @ApiPropertyOptional({
    description: 'Types of entities to search',
    example: ['resources', 'locations'],
    type: [String],
    enum: ['resources', 'locations', 'categories']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchTypes?: string[];

  @ApiPropertyOptional({
    description: 'Maximum results per type',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class PopularResourcesRequestDto {
  @ApiPropertyOptional({
    description: 'Time range for popularity analysis',
    example: 'month',
    default: 'month',
    enum: ['day', 'week', 'month', 'year']
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  timeRange?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by categories',
    example: ['SALON', 'LABORATORIO'],
    type: [String],
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Filter by academic programs',
    example: ['ING-SIS', 'MED-GEN'],
    type: [String],
    maxItems: 10
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  academicPrograms?: string[];
}

export class SearchHistoryRequestDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter from date',
    example: '2024-01-01T00:00:00.000Z',
    type: Date
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter to date',
    example: '2024-01-31T23:59:59.999Z',
    type: Date
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;
}

// ========================================
// Response DTOs
// ========================================

export class PaginationResponseDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Results per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total number of results', example: 150 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 8 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrev: boolean;
}

export class ResourceSearchResultDto {
  @ApiProperty({ description: 'Resource ID', example: 'res_123456' })
  id: string;

  @ApiProperty({ description: 'Resource name', example: 'Laboratorio de Computación A-101' })
  name: string;

  @ApiProperty({ description: 'Resource description', example: 'Laboratorio con 30 computadores' })
  description?: string;

  @ApiProperty({ description: 'Resource type', example: 'LABORATORY' })
  type: string;

  @ApiProperty({ description: 'Resource category', example: 'LABORATORIO' })
  category: string;

  @ApiProperty({ description: 'Location or building', example: 'Edificio A, Piso 1' })
  location: string;

  @ApiProperty({ description: 'Seating capacity', example: 30 })
  capacity: number;

  @ApiProperty({ description: 'Academic program association', example: 'ING-SIS' })
  academicProgram?: string;

  @ApiProperty({ description: 'Available features', example: ['PROYECTOR', 'INTERNET'] })
  features: string[];

  @ApiProperty({ description: 'Current availability status', example: 'AVAILABLE' })
  availabilityStatus: string;

  @ApiProperty({ description: 'Next available time slot', example: '2024-01-15T14:00:00.000Z' })
  nextAvailableSlot?: Date;

  @ApiProperty({ description: 'Resource images', example: ['url1.jpg', 'url2.jpg'] })
  images?: string[];

  @ApiProperty({ description: 'Average rating', example: 4.5 })
  averageRating?: number;

  @ApiProperty({ description: 'Total number of reviews', example: 25 })
  reviewCount?: number;
}

export class AvailabilityStatusDto {
  @ApiProperty({ description: 'Resource ID', example: 'res_123456' })
  resourceId: string;

  @ApiProperty({ description: 'Is resource available', example: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Availability status', example: 'AVAILABLE' })
  status: string;

  @ApiProperty({ description: 'Next available time slot if unavailable' })
  nextSlot?: Date;

  @ApiProperty({ description: 'Conflicting reservations or maintenance' })
  conflicts?: any[];

  @ApiProperty({ description: 'Error message if status check failed' })
  error?: string;
}

export class ConflictDto {
  @ApiProperty({ description: 'Conflict type', example: 'RESERVATION_CONFLICT' })
  type: string;

  @ApiProperty({ description: 'Resource ID', example: 'res_123456' })
  resourceId: string;

  @ApiProperty({ description: 'Conflicting reservation ID', required: false })
  reservationId?: string;

  @ApiProperty({ description: 'Conflict start time' })
  startDate: Date;

  @ApiProperty({ description: 'Conflict end time' })
  endDate: Date;

  @ApiProperty({ description: 'User who made the conflicting reservation', required: false })
  userId?: string;

  @ApiProperty({ description: 'Additional conflict details' })
  details?: any;
}

export class AlternativeResourceDto extends ResourceSearchResultDto {
  @ApiProperty({ description: 'Similarity score to original resource', example: 0.85 })
  similarityScore: number;

  @ApiProperty({ description: 'Reason for recommendation', example: 'Similar capacity and features' })
  recommendationReason: string;
}

export class QuickSearchResultDto {
  @ApiProperty({ description: 'Result ID', example: 'res_123456' })
  id: string;

  @ApiProperty({ description: 'Result name', example: 'Aula Magna' })
  name: string;

  @ApiProperty({ description: 'Result type', example: 'resource' })
  type: string;

  @ApiProperty({ description: 'Category or additional info', required: false })
  category?: string;

  @ApiProperty({ description: 'Location info', required: false })
  location?: string;
}

export class PopularResourceDto extends ResourceSearchResultDto {
  @ApiProperty({ description: 'Number of reservations in period', example: 45 })
  reservationCount: number;

  @ApiProperty({ description: 'Number of unique users', example: 23 })
  uniqueUsers: number;

  @ApiProperty({ description: 'Popularity score', example: 87.5 })
  popularityScore: number;
}

export class SearchHistoryItemDto {
  @ApiProperty({ description: 'Search ID', example: 'search_123456' })
  id: string;

  @ApiProperty({ description: 'Search term used', example: 'laboratorio computación' })
  searchTerm: string;

  @ApiProperty({ description: 'Filters applied' })
  filters: any;

  @ApiProperty({ description: 'Number of results found', example: 12 })
  resultsCount: number;

  @ApiProperty({ description: 'When the search was performed' })
  timestamp: Date;

  @ApiProperty({ description: 'Search execution time in milliseconds', example: 245 })
  executionTime: number;
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Error code', example: 'SEARCH_ERROR' })
  code: string;

  @ApiProperty({ description: 'Error message', example: 'Error performing search' })
  message: string;

  @ApiProperty({ description: 'Detailed error information', required: false })
  details?: string;
}

export class MetadataDto {
  @ApiProperty({ description: 'Execution time in milliseconds', example: 156 })
  executionTimeMs: number;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp: Date;
}

// ========================================
// Main Response DTOs
// ========================================

export class AdvancedSearchResponseDto {
  @ApiProperty({ description: 'Request success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Search results', type: [ResourceSearchResultDto] })
  data: ResourceSearchResultDto[];

  @ApiProperty({ description: 'Pagination information', type: PaginationResponseDto })
  pagination: PaginationResponseDto;

  @ApiProperty({ description: 'Applied search filters' })
  filters?: {
    searchTerm?: string;
    activeFiltersCount: number;
    appliedFilters: string[];
  };

  @ApiProperty({ description: 'Response metadata', type: MetadataDto })
  metadata?: MetadataDto;

  @ApiProperty({ description: 'Error information if request failed', type: ErrorResponseDto })
  error?: ErrorResponseDto;
}

export class AvailabilityResponseDto {
  @ApiProperty({ description: 'Request success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Available resources', type: [AvailabilityStatusDto] })
  available: AvailabilityStatusDto[];

  @ApiProperty({ description: 'Unavailable resources', type: [AvailabilityStatusDto] })
  unavailable: AvailabilityStatusDto[];

  @ApiProperty({ description: 'Detailed conflicts', type: [ConflictDto] })
  conflicts?: ConflictDto[];

  @ApiProperty({ description: 'Alternative resource suggestions', type: [AlternativeResourceDto] })
  alternatives?: AlternativeResourceDto[];

  @ApiProperty({ description: 'Availability summary' })
  summary?: {
    totalRequested: number;
    availableCount: number;
    unavailableCount: number;
    availabilityRate: number;
  };

  @ApiProperty({ description: 'Response metadata', type: MetadataDto })
  metadata?: MetadataDto;

  @ApiProperty({ description: 'Error information if request failed', type: ErrorResponseDto })
  error?: ErrorResponseDto;
}

export class QuickSearchResponseDto {
  @ApiProperty({ description: 'Request success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Quick search results' })
  results: {
    resources: QuickSearchResultDto[];
    locations: QuickSearchResultDto[];
    categories: QuickSearchResultDto[];
  };

  @ApiProperty({ description: 'Search metadata' })
  metadata?: {
    searchTerm: string;
    totalResults: number;
    executionTimeMs: number;
    timestamp: Date;
  };

  @ApiProperty({ description: 'Error information if request failed', type: ErrorResponseDto })
  error?: ErrorResponseDto;
}

export class PopularResourcesResponseDto {
  @ApiProperty({ description: 'Request success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Popular resources', type: [PopularResourceDto] })
  data: PopularResourceDto[];

  @ApiProperty({ description: 'Analysis metadata' })
  metadata?: {
    timeRange: string;
    resultsCount: number;
    executionTimeMs: number;
    timestamp: Date;
  };

  @ApiProperty({ description: 'Error information if request failed', type: ErrorResponseDto })
  error?: ErrorResponseDto;
}

export class SearchHistoryResponseDto {
  @ApiProperty({ description: 'Request success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Search history items', type: [SearchHistoryItemDto] })
  data: SearchHistoryItemDto[];

  @ApiProperty({ description: 'Pagination information', type: PaginationResponseDto })
  pagination: PaginationResponseDto;

  @ApiProperty({ description: 'Response metadata', type: MetadataDto })
  metadata?: MetadataDto;

  @ApiProperty({ description: 'Error information if request failed', type: ErrorResponseDto })
  error?: ErrorResponseDto;
}
