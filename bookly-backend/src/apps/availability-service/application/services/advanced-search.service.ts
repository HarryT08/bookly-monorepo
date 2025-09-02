/**
 * Advanced Search Service - RF-09
 * Service layer for advanced resource search functionality
 * Following Clean Architecture and CQRS patterns
 */

import { Injectable, Inject } from '@nestjs/common';
import { ResourceRepository } from '../../../resources-service/domain/repositories/resource.repository';
import { ReservationRepository } from '../../domain/repositories/reservation.repository';
import { AdvancedSearchDomainService } from '../../domain/services/advanced-search-domain.service';
import { LoggingService } from '../../../../libs/logging/logging.service';
import {
  AdvancedSearchRequestDto,
  AdvancedSearchResponseDto,
  AvailabilityCheckRequestDto,
  AvailabilityResponseDto,
  SearchHistoryRequestDto,
  SearchHistoryResponseDto,
  PopularResourcesRequestDto,
  PopularResourcesResponseDto,
  QuickSearchRequestDto,
  QuickSearchResponseDto
} from '../dto/advanced-search.dto';

@Injectable()
export class AdvancedSearchService {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    @Inject('ReservationRepository')
    private readonly reservationRepository: ReservationRepository,
    private readonly advancedSearchDomain: AdvancedSearchDomainService,
    private readonly logger: LoggingService
  ) {}

  // ========================================
  // Advanced Resource Search
  // ========================================

  async advancedSearch(request: AdvancedSearchRequestDto): Promise<AdvancedSearchResponseDto> {
    try {
      this.logger.log('Executing advanced resource search', {
        searchTerm: request.searchTerm,
        filtersApplied: Object.keys(request).filter(key => 
          request[key] !== undefined && request[key] !== null
        ).length
      });

      // Build search criteria
      const searchCriteria = this.buildSearchCriteria(request);

      // Execute search with domain service
      const searchResult = await this.advancedSearchDomain.searchResources(
        searchCriteria,
        {
          page: request.page || 1,
          limit: request.limit || 20,
          sortBy: request.sortBy || 'name',
          sortOrder: request.sortOrder || 'asc'
        }
      );

      // Check real-time availability if requested
      let availabilityInfo = {};
      if (request.availabilityWindow?.start && request.availabilityWindow?.end) {
        const resourceIds = searchResult.data.map(resource => resource.id);
        availabilityInfo = await this.checkResourcesAvailability(
          resourceIds,
          request.availabilityWindow.start,
          request.availabilityWindow.end
        );
      }

      // Build response with popularity scores
      const resourcesWithScores = await Promise.all(
        searchResult.data.map(async (resource) => ({
          id: resource.id,
          name: resource.name,
          type: resource.type,
          category: resource.category,
          location: resource.location,
          capacity: resource.capacity,
          description: resource.description,
          features: resource.attributes?.equipment || [],
          academicProgram: resource.academicProgram,
          isAvailable: availabilityInfo[resource.id]?.isAvailable ?? true,
          availabilityStatus: availabilityInfo[resource.id]?.status || 'UNKNOWN',
          nextAvailableSlot: availabilityInfo[resource.id]?.nextSlot,
          popularityScore: await this.calculatePopularityScore(resource.id),
          imageUrl: resource.imageUrl,
          createdAt: resource.createdAt,
          updatedAt: resource.updatedAt
        }))
      );

      const result: AdvancedSearchResponseDto = {
        success: true,
        data: resourcesWithScores,
        pagination: searchResult.pagination,
        filters: {
          searchTerm: request.searchTerm,
          activeFiltersCount: 0,
          appliedFilters: []
        },
        metadata: {
          executionTimeMs: Date.now(),
          timestamp: new Date()
        }
      };

      return result;
    } catch (error) {
      this.logger.error('Error in advanced resource search', {
        error: error.message,
        stack: error.stack,
        request: { searchTerm: request.searchTerm }
      });
      throw error;
    }
  }

  // ========================================
  // Real-time Availability Check
  // ========================================

  async checkRealTimeAvailability(request: AvailabilityCheckRequestDto): Promise<AvailabilityResponseDto> {
    try {
      const availabilityData = await this.advancedSearchDomain.checkMultipleResourceAvailability(
        request.resourceIds,
        request.startDate,
        request.endDate,
        { 
          includeConflicts: request.includeConflicts || true,
          includeAlternatives: request.includeAlternatives || true,
          userId: 'system'
        }
      );

      return {
        success: true,
        available: availabilityData.available,
        unavailable: availabilityData.unavailable,
        conflicts: availabilityData.conflicts,
        alternatives: availabilityData.alternatives,
        metadata: {
          executionTimeMs: Date.now(),
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Error checking real-time availability', {
        error: error.message,
        resourceIds: request.resourceIds
      });
      throw error;
    }
  }

  // ========================================
  // Search History
  // ========================================

  async getSearchHistory(request: SearchHistoryRequestDto): Promise<SearchHistoryResponseDto> {
    try {
      const history = await this.advancedSearchDomain.getUserSearchHistory(
        'system',
        {
          page: request.page || 1,
          limit: request.limit || 20,
          startDate: request.startDate,
          endDate: request.endDate
        }
      );

      return {
        success: true,
        data: history.data,
        pagination: history.pagination
      };
    } catch (error) {
      this.logger.error('Error fetching search history', {
        error: error.message,
        userId: 'system'
      });
      throw error;
    }
  }

  // ========================================
  // Popular Resources
  // ========================================

  async getPopularResources(request: PopularResourcesRequestDto): Promise<PopularResourcesResponseDto> {
    try {
      const popularResources = await this.advancedSearchDomain.getPopularResources({
        timeRange: request.timeRange || 'month',
        limit: request.limit || 10,
        categories: request.categories,
        academicPrograms: request.academicPrograms
      });

      const trending = await this.advancedSearchDomain.getTrendingResources({
        timeRange: 'week',
        limit: 5
      });

      return {
        success: true,
        data: popularResources,
        metadata: {
          timeRange: request.timeRange || 'month',
          resultsCount: popularResources.length,
          executionTimeMs: Date.now(),
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Error fetching popular resources', {
        error: error.message,
        timeRange: request.timeRange
      });
      throw error;
    }
  }

  // ========================================
  // Quick Search (Autocomplete)
  // ========================================

  async quickSearch(request: QuickSearchRequestDto): Promise<QuickSearchResponseDto> {
    try {
      const results = await this.advancedSearchDomain.performQuickSearch(
        request.searchTerm,
        {
          searchTypes: request.searchTypes || ['resources', 'locations', 'categories'],
          limit: request.limit || 10,
          userId: 'system'
        }
      );

      return {
        success: true,
        results: {
          resources: results.resources || [],
          locations: results.locations || [],
          categories: results.categories || []
        }
      };
    } catch (error) {
      this.logger.error('Error executing quick search', {
        error: error.message,
        searchTerm: request.searchTerm
      });
      throw error;
    }
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private buildSearchCriteria(request: AdvancedSearchRequestDto) {
    return {
      searchTerm: request.searchTerm,
      resourceTypes: request.resourceTypes,
      locations: request.locations,
      categories: request.categories,
      capacityMin: request.capacityMin,
      capacityMax: request.capacityMax,
      features: request.features,
      academicPrograms: request.academicPrograms,
      includeUnavailable: request.includeUnavailable || false,
      availabilityWindow: request.availabilityWindow ? {
        start: request.availabilityWindow.start,
        end: request.availabilityWindow.end
      } : undefined,
      // userId not available in DTO
    };
  }

  private async checkResourcesAvailability(
    resourceIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    const availabilityMap = {};
    
    for (const resourceId of resourceIds) {
      try {
        const availability = await this.advancedSearchDomain.checkResourceAvailability(
          resourceId,
          startDate,
          endDate
        );
        availabilityMap[resourceId] = availability;
      } catch (error) {
        this.logger.warn('Error checking availability for resource', {
          resourceId,
          error: error.message
        });
        availabilityMap[resourceId] = { isAvailable: false, status: 'ERROR' };
      }
    }

    return availabilityMap;
  }

  private async calculatePopularityScore(resourceId: string): Promise<number> {
    // Implementation would calculate based on reservation frequency, ratings, etc.
    return 0; // Placeholder
  }

  private getAppliedFilters(request: AdvancedSearchRequestDto) {
    const filters = {};
    if (request.resourceTypes?.length) filters['resourceTypes'] = request.resourceTypes;
    if (request.locations?.length) filters['locations'] = request.locations;
    if (request.categories?.length) filters['categories'] = request.categories;
    if (request.capacityMin || request.capacityMax) {
      filters['capacity'] = { min: request.capacityMin, max: request.capacityMax };
    }
    if (request.features?.length) filters['features'] = request.features;
    if (request.academicPrograms?.length) filters['academicPrograms'] = request.academicPrograms;
    return filters;
  }

  private async getAvailableFilters(request: AdvancedSearchRequestDto) {
    // Would return available filter options based on current search context
    return {
      resourceTypes: [],
      locations: [],
      categories: [],
      features: [],
      academicPrograms: []
    };
  }

  private async getSuggestedSearches(searchTerm?: string): Promise<string[]> {
    // Would return suggested search terms based on popular searches
    return [];
  }

  private async getMostSearchedTerms(userId: string): Promise<string[]> {
    // Implementation would return user's most searched terms
    return [];
  }

  private async getSearchFrequency(userId: string): Promise<any> {
    // Implementation would return search frequency analytics
    return {};
  }

  private async getFavoriteFilters(userId: string): Promise<any> {
    // Implementation would return user's most used filters
    return {};
  }

  private async getTotalReservationsCount(timeRange: string): Promise<number> {
    // Implementation would count reservations in time range
    return 0;
  }

  private async getMostActiveCategories(timeRange: string): Promise<any[]> {
    // Implementation would return most active categories
    return [];
  }

  private async getPeakUsageHours(timeRange: string): Promise<any[]> {
    // Implementation would return peak usage hours
    return [];
  }
}
