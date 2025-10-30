/**
 * Advanced Search Query Handlers - RF-09
 * CQRS Query Handlers for advanced resource search functionality
 * Following Clean Architecture and Event-Driven patterns
 */

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus/services/event-bus.service';
import { EventAction, EventSource } from '@libs/event-bus/interfaces/standardized-domain-event.interface';
import {
  AdvancedResourceSearchQuery,
  RealTimeAvailabilitySearchQuery,
  SearchHistoryQuery,
  PopularResourcesQuery,
  QuickSearchQuery
} from '../queries/advanced-search.queries';
import { AdvancedSearchService } from '../services/advanced-search.service';
import { LoggingService } from '@libs/logging/logging.service';
import {
  AdvancedSearchPerformedEvent,
  SearchResultViewedEvent,
  QuickSearchPerformedEvent
} from '../../domain/events/advanced-search.events';

// ========================================
// Advanced Resource Search Handler
// ========================================

@QueryHandler(AdvancedResourceSearchQuery)
@Injectable()
export class AdvancedResourceSearchHandler 
  implements IQueryHandler<AdvancedResourceSearchQuery> {
  
  constructor(
    private readonly advancedSearchService: AdvancedSearchService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: AdvancedResourceSearchQuery) {
    try {
      this.logger.log('Executing advanced resource search', {
        searchTerm: query.searchTerm,
        filters: {
          resourceTypes: query.resourceTypes,
          locations: query.locations,
          categories: query.categories,
          capacity: `${query.capacityMin || 0}-${query.capacityMax || 'unlimited'}`,
          availability: query.availabilityStart && query.availabilityEnd
        },
        userId: query.userId
      });

      const result = await this.advancedSearchService.advancedSearch({
        searchTerm: query.searchTerm,
        resourceTypes: query.resourceTypes,
        locations: query.locations,
        categories: query.categories,
        capacityMin: query.capacityMin,
        capacityMax: query.capacityMax,
        availabilityWindow: query.availabilityStart && query.availabilityEnd ? {
          start: query.availabilityStart,
          end: query.availabilityEnd
        } : undefined,
        features: query.features,
        academicPrograms: query.academicPrograms,
        includeUnavailable: query.includeUnavailable || false,
        sortBy: query.sortBy || 'name',
        sortOrder: query.sortOrder || 'asc',
        page: query.page || 1,
        limit: query.limit || 20
      });

      const now = new Date();
      const searchEventData = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType: 'AdvancedSearchPerformed',
        eventVersion: '1.0.0',
        aggregateId: query.userId || 'anonymous',
        aggregateType: 'User',
        aggregateVersion: 1,
        timestamp: now,
        occurredAt: now,
        correlationId: `cor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: query.userId,
        eventData: {
          action: EventAction.CREATED,
          entityId: query.userId || 'anonymous',
          entityType: 'SearchQuery',
          userId: query.userId || 'anonymous',
          searchTerm: query.searchTerm || '',
          filters: {
            resourceTypes: query.resourceTypes,
            locations: query.locations,
            categories: query.categories,
            capacityRange: { min: query.capacityMin, max: query.capacityMax },
            availabilityWindow: query.availabilityStart && query.availabilityEnd 
              ? { start: query.availabilityStart, end: query.availabilityEnd }
              : undefined,
            features: query.features,
            academicPrograms: query.academicPrograms
          },
          resultsCount: result.data.length,
          totalFound: result.pagination.total
        },
        metadata: {
          source: query.userId ? EventSource.USER_ACTION : EventSource.SYSTEM_ACTION,
          service: 'availability-service',
          environment: process.env.NODE_ENV || 'development',
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        schemaVersion: '1.0.0',
        publishedAt: now
      };

      await this.eventBus.publishEvent(searchEventData);

      this.logger.log('Advanced search completed successfully', {
        resultsCount: result.data.length,
        totalFound: result.pagination.total,
        searchTerm: query.searchTerm
      });

      return result;
    } catch (error) {
      this.logger.error('Error executing advanced resource search', {
        error: error.message,
        stack: error.stack,
        query: {
          searchTerm: query.searchTerm,
        }
      });

      throw error;
    }
  }
}

// ========================================
// Real-time Availability Search Handler
// ========================================

@QueryHandler(RealTimeAvailabilitySearchQuery)
@Injectable()
export class RealTimeAvailabilitySearchHandler 
  implements IQueryHandler<RealTimeAvailabilitySearchQuery> {
  
  constructor(
    private readonly advancedSearchService: AdvancedSearchService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: RealTimeAvailabilitySearchQuery) {
    try {
      this.logger.log('Executing real-time availability check', {
        resourceIds: query.resourceIds,
        timeWindow: {
          start: query.startDate,
          end: query.endDate
        },
        userId: query.userId
      });

      const result = await this.advancedSearchService.checkRealTimeAvailability({
        resourceIds: query.resourceIds,
        startDate: query.startDate,
        endDate: query.endDate,
        includeConflicts: query.includeConflicts || true,
        includeAlternatives: query.includeAlternatives || true
      });

      this.logger.log('Real-time availability check completed', {
        availableCount: result.available.length,
        conflictsFound: result.conflicts.length,
        alternativesFound: result.alternatives.length
      });

      return result;
    } catch (error) {
      this.logger.error('Error checking real-time availability', {
        error: error.message,
        stack: error.stack,
        resourceIds: query.resourceIds
      });

      throw error;
    }
  }
}

// ========================================
// Search History Handler
// ========================================

@QueryHandler(SearchHistoryQuery)
@Injectable()
export class SearchHistoryHandler implements IQueryHandler<SearchHistoryQuery> {
  
  constructor(
    private readonly advancedSearchService: AdvancedSearchService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: SearchHistoryQuery) {
    try {
      this.logger.log('Fetching search history', {
        userId: query.userId,
        page: query.page,
        limit: query.limit
      });

      const result = await this.advancedSearchService.getSearchHistory({
        page: query.page || 1,
        limit: query.limit || 20,
        startDate: query.startDate,
        endDate: query.endDate
      });

      return result;
    } catch (error) {
      this.logger.error('Error fetching search history', {
        error: error.message,
        userId: query.userId
      });

      throw error;
    }
  }
}

// ========================================
// Popular Resources Handler
// ========================================

@QueryHandler(PopularResourcesQuery)
@Injectable()
export class PopularResourcesHandler implements IQueryHandler<PopularResourcesQuery> {
  
  constructor(
    private readonly advancedSearchService: AdvancedSearchService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: PopularResourcesQuery) {
    try {
      this.logger.log('Fetching popular resources', {
        timeRange: query.timeRange,
        categories: query.categories,
        limit: query.limit
      });

      const result = await this.advancedSearchService.getPopularResources({
        timeRange: query.timeRange || 'month',
        limit: query.limit || 10,
        categories: query.categories,
        academicPrograms: query.academicPrograms
      });

      return result;
    } catch (error) {
      this.logger.error('Error fetching popular resources', {
        error: error.message,
        timeRange: query.timeRange
      });

      throw error;
    }
  }
}

// ========================================
// Quick Search Handler (Autocomplete)
// ========================================

@QueryHandler(QuickSearchQuery)
@Injectable()
export class QuickSearchHandler implements IQueryHandler<QuickSearchQuery> {
  
  constructor(
    private readonly advancedSearchService: AdvancedSearchService,
    private readonly eventBus: EventBusService,
    private readonly logger: LoggingService
  ) {}

  async execute(query: QuickSearchQuery) {
    try {
      const result = await this.advancedSearchService.quickSearch({
        searchTerm: query.searchTerm,
        searchTypes: query.searchTypes || ['resources', 'locations', 'categories'],
        limit: query.limit || 10
      });

      const searchEvent = new QuickSearchPerformedEvent(
        query.userId || 'anonymous',
        query.searchTerm,
        result.results.resources.length + result.results.locations.length + result.results.categories.length,
        new Date()
      );

      // await this.eventBus.publishEvent(searchEvent);

      return result;
    } catch (error) {
      this.logger.error('Error executing quick search', {
        error: error.message,
        searchTerm: query.searchTerm
      });

      throw error;
    }
  }
}
