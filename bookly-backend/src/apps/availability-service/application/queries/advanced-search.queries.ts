/**
 * Advanced Resource Search Queries - RF-09
 * CQRS Query implementations for advanced resource search functionality
 * Following Clean Architecture and Event-Driven patterns
 */

import { IQuery } from '@nestjs/cqrs';

// ========================================
// RF-09: Advanced Search Query
// ========================================

export class AdvancedResourceSearchQuery implements IQuery {
  constructor(
    public readonly searchTerm?: string,
    public readonly resourceTypes?: string[],
    public readonly locations?: string[],
    public readonly categories?: string[],
    public readonly capacityMin?: number,
    public readonly capacityMax?: number,
    public readonly availabilityStart?: Date,
    public readonly availabilityEnd?: Date,
    public readonly features?: string[],
    public readonly academicPrograms?: string[],
    public readonly includeUnavailable?: boolean,
    public readonly sortBy?: 'name' | 'capacity' | 'location' | 'popularity' | 'availability',
    public readonly sortOrder?: 'asc' | 'desc',
    public readonly page?: number,
    public readonly limit?: number,
    public readonly userId?: string // For filtering by user permissions
  ) {}
}

// ========================================
// Real-time Availability Search Query
// ========================================

export class RealTimeAvailabilitySearchQuery implements IQuery {
  constructor(
    public readonly resourceIds: string[],
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly includeConflicts?: boolean,
    public readonly includeAlternatives?: boolean,
    public readonly userId?: string
  ) {}
}

// ========================================
// Search History Query
// ========================================

export class SearchHistoryQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}

// ========================================
// Popular Resources Query
// ========================================

export class PopularResourcesQuery implements IQuery {
  constructor(
    public readonly timeRange?: 'day' | 'week' | 'month' | 'year',
    public readonly limit?: number,
    public readonly categories?: string[],
    public readonly academicPrograms?: string[]
  ) {}
}

// ========================================
// Quick Search Query (autocomplete)
// ========================================

export class QuickSearchQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly searchTypes?: ('resources' | 'locations' | 'categories')[],
    public readonly limit?: number,
    public readonly userId?: string
  ) {}
}
