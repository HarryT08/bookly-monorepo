/**
 * Advanced Search Domain Events - RF-09
 * Events for tracking and auditing search operations
 * Following Event-Driven Architecture patterns
 */

import { IEvent } from '@nestjs/cqrs';

// ========================================
// Base Search Event
// ========================================

export abstract class BaseSearchEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date
  ) {}
}

// ========================================
// Advanced Search Performed Event
// ========================================

export class AdvancedSearchPerformedEvent extends BaseSearchEvent {
  constructor(
    userId: string,
    public readonly searchTerm: string,
    public readonly filters: {
      resourceTypes?: string[];
      locations?: string[];
      categories?: string[];
      capacityRange?: { min?: number; max?: number };
      availabilityWindow?: { start: Date; end: Date };
      features?: string[];
      academicPrograms?: string[];
    },
    public readonly resultsCount: number,
    public readonly totalFound: number,
    timestamp: Date
  ) {
    super(userId, timestamp);
  }
}

// ========================================
// Quick Search Performed Event
// ========================================

export class QuickSearchPerformedEvent extends BaseSearchEvent {
  constructor(
    userId: string,
    public readonly searchTerm: string,
    public readonly resultsCount: number,
    timestamp: Date
  ) {
    super(userId, timestamp);
  }
}

// ========================================
// Search Result Viewed Event
// ========================================

export class SearchResultViewedEvent extends BaseSearchEvent {
  constructor(
    userId: string,
    public readonly searchTerm: string,
    public readonly resourceId: string,
    public readonly resourceName: string,
    public readonly position: number, // Position in search results
    timestamp: Date
  ) {
    super(userId, timestamp);
  }
}

// ========================================
// Search Result Reserved Event
// ========================================

export class SearchResultReservedEvent extends BaseSearchEvent {
  constructor(
    userId: string,
    public readonly searchTerm: string,
    public readonly resourceId: string,
    public readonly reservationId: string,
    public readonly position: number,
    timestamp: Date
  ) {
    super(userId, timestamp);
  }
}

// ========================================
// Popular Resources Viewed Event
// ========================================

export class PopularResourcesViewedEvent extends BaseSearchEvent {
  constructor(
    userId: string,
    public readonly timeRange: string,
    timestamp: Date,
    public readonly categories?: string[],
    public readonly academicPrograms?: string[]
  ) {
    super(userId, timestamp);
  }
}

// ========================================
// Search History Viewed Event
// ========================================

export class SearchHistoryViewedEvent extends BaseSearchEvent {
  constructor(
    userId: string,
    public readonly page: number,
    public readonly limit: number,
    timestamp: Date
  ) {
    super(userId, timestamp);
  }
}

// ========================================
// Real-time Availability Checked Event
// ========================================

export class RealTimeAvailabilityCheckedEvent extends BaseSearchEvent {
  constructor(
    userId: string,
    public readonly resourceIds: string[],
    public readonly timeWindow: { start: Date; end: Date },
    public readonly availableCount: number,
    public readonly conflictsFound: number,
    timestamp: Date
  ) {
    super(userId, timestamp);
  }
}
