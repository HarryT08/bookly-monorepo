/**
 * Advanced Search Domain Service - RF-09
 * Domain layer service for advanced resource search business logic
 * Following Clean Architecture and Domain-Driven Design patterns
 */

import { Injectable, Inject } from '@nestjs/common';
import { ResourceRepository } from '../../../resources-service/domain/repositories/resource.repository';
import { ReservationRepository } from '../repositories/reservation.repository';
import { LoggingService } from '@libs/logging/logging.service';

export interface SearchCriteria {
  searchTerm?: string;
  resourceTypes?: string[];
  locations?: string[];
  categories?: string[];
  capacityMin?: number;
  capacityMax?: number;
  features?: string[];
  academicPrograms?: string[];
  includeUnavailable?: boolean;
  availabilityWindow?: { start: Date; end: Date };
  userId?: string;
}

export interface SearchOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface AvailabilityOptions {
  includeConflicts?: boolean;
  includeAlternatives?: boolean;
  userId?: string;
}

@Injectable()
export class AdvancedSearchDomainService {
  constructor(
    @Inject('ResourceRepository')
    private readonly resourceRepository: ResourceRepository,
    @Inject('ReservationRepository')
    private readonly reservationRepository: ReservationRepository,
    private readonly logger: LoggingService
  ) {}

  // ========================================
  // Core Search Logic
  // ========================================

  async searchResources(criteria: SearchCriteria, options: SearchOptions) {
    try {
      this.logger.log('Executing domain-level resource search', {
        hasSearchTerm: !!criteria.searchTerm,
        filtersCount: this.countActiveFilters(criteria),
        pagination: { page: options.page, limit: options.limit }
      });

      // Build search filters for existing repository methods
      const filters = this.buildSearchFilters(criteria);
      
      // Execute search using existing repository methods
      const allResources = await this.resourceRepository.findAll(filters);
      
      // Apply text search if needed
      const filteredResources = criteria.searchTerm 
        ? await this.resourceRepository.search(criteria.searchTerm)
        : allResources;
      
      // Apply pagination manually
      const startIndex = (options.page - 1) * options.limit;
      const resources = filteredResources.slice(startIndex, startIndex + options.limit);
      const totalCount = filteredResources.length;

      // Apply post-processing filters if needed
      const processedResources = await this.postProcessResults(resources, criteria);

      return {
        data: processedResources,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / options.limit),
          hasNext: options.page * options.limit < totalCount,
          hasPrev: options.page > 1
        }
      };
    } catch (error) {
      this.logger.error('Error in domain resource search', {
        error: error.message,
        criteria: { searchTerm: criteria.searchTerm }
      });
      throw error;
    }
  }

  // ========================================
  // Availability Checking
  // ========================================

  async checkMultipleResourceAvailability(
    resourceIds: string[],
    startDate: Date,
    endDate: Date,
    options: AvailabilityOptions = {}
  ) {
    const available = [];
    const unavailable = [];
    const conflicts = [];
    const alternatives = [];

    for (const resourceId of resourceIds) {
      try {
        const availability = await this.checkResourceAvailability(
          resourceId,
          startDate,
          endDate
        );

        if (availability.isAvailable) {
          available.push({
            resourceId,
            isAvailable: true,
            status: 'AVAILABLE',
            nextSlot: null
          });
        } else {
          unavailable.push({
            resourceId,
            isAvailable: false,
            status: availability.reason || 'UNAVAILABLE',
            nextSlot: availability.nextSlot || null,
            conflicts: availability.conflicts || []
          });

          if (options.includeConflicts && availability.conflicts) {
            conflicts.push(...availability.conflicts.map(conflict => ({
              ...conflict,
              resourceId
            })));
          }
        }

        // Find alternatives if requested
        if (options.includeAlternatives && !availability.isAvailable) {
          const resourceAlternatives = await this.findResourceAlternatives(
            resourceId,
            startDate,
            endDate
          );
          alternatives.push(...resourceAlternatives);
        }

      } catch (error) {
        this.logger.warn('Error checking availability for resource', {
          resourceId,
          error: error.message
        });

        unavailable.push({
          resourceId,
          isAvailable: false,
          status: 'ERROR',
          error: error.message
        });
      }
    }

    return { available, unavailable, conflicts, alternatives };
  }

  async checkResourceAvailability(resourceId: string, startDate: Date, endDate: Date) {
    // Check existing reservations
    const existingReservations = await this.reservationRepository.findByResourceAndDateRange(
      resourceId,
      startDate,
      endDate
    );

    const activeReservations = existingReservations.filter(
      reservation => ['CONFIRMED', 'PENDING'].includes(reservation.status)
    );

    if (activeReservations.length > 0) {
      // Find next available slot
      const nextSlot = await this.findNextAvailableSlot(resourceId, endDate);
      
      return {
        isAvailable: false,
        reason: 'RESERVED',
        conflicts: activeReservations.map(res => ({
          type: 'RESERVATION_CONFLICT',
          reservationId: res.id,
          startDate: res.startDate,
          endDate: res.endDate,
          userId: res.userId
        })),
        nextSlot
      };
    }

    // Check maintenance schedules
    const maintenanceConflicts = await this.checkMaintenanceConflicts(
      resourceId,
      startDate,
      endDate
    );

    if (maintenanceConflicts.length > 0) {
      return {
        isAvailable: false,
        reason: 'MAINTENANCE',
        conflicts: maintenanceConflicts,
        nextSlot: await this.findNextAvailableSlot(resourceId, endDate)
      };
    }

    // Check schedule restrictions
    const scheduleConflicts = await this.checkScheduleRestrictions(
      resourceId,
      startDate,
      endDate
    );

    if (scheduleConflicts.length > 0) {
      return {
        isAvailable: false,
        reason: 'SCHEDULE_RESTRICTION',
        conflicts: scheduleConflicts,
        nextSlot: await this.findNextAvailableSlot(resourceId, endDate)
      };
    }

    return {
      isAvailable: true,
      reason: null,
      conflicts: [],
      nextSlot: null
    };
  }

  // ========================================
  // Quick Search & Autocomplete
  // ========================================

  async performQuickSearch(searchTerm: string, options: {
    searchTypes?: string[];
    limit?: number;
    userId?: string;
  }) {
    const limit = options.limit || 10;
    const searchTypes = options.searchTypes || ['resources', 'locations', 'categories'];

    const results = {
      resources: [],
      locations: [],
      categories: []
    };

    // Search resources using existing repository methods
    if (searchTypes.includes('resources')) {
      const resourceMatches = await this.resourceRepository.search(searchTerm);
      results.resources = resourceMatches.slice(0, limit).map(resource => ({
        id: resource.id,
        name: resource.name,
        type: 'resource',
        category: resource.categoryId,
        location: resource.location
      }));
    }

    // Search locations - simplified implementation using findAll and extracting unique locations
    if (searchTypes.includes('locations')) {
      const allResources = await this.resourceRepository.findAll();
      const locations = [...new Set(allResources
        .map(r => r.location)
        .filter(loc => loc && loc.toLowerCase().includes(searchTerm.toLowerCase()))
      )].slice(0, limit);
      
      results.locations = locations.map(location => ({
        id: `location_${location}`,
        name: location,
        type: 'location'
      }));
    }

    // Search categories
    if (searchTypes.includes('categories')) {
      // This would search in the Category model once integrated
      results.categories = [];
    }

    return results;
  }

  // ========================================
  // Analytics & Popular Resources
  // ========================================

  async getPopularResources(options: {
    timeRange: string;
    limit: number;
    categories?: string[];
    academicPrograms?: string[];
  }) {
    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, options.timeRange);

    // Get reservation counts per resource - simplified implementation
    // TODO: Implement proper analytics methods in ReservationRepository
    const reservationStats = await this.getReservationStatsSimplified(
      startDate,
      endDate,
      options
    );

    // Enrich with resource details
    const popularResources = [];
    for (const stat of reservationStats) {
      const resource = await this.resourceRepository.findById(stat.resourceId);
      if (resource) {
        popularResources.push({
          resource,
          reservationCount: stat.count,
          uniqueUsers: stat.uniqueUsers,
          averageRating: stat.averageRating || 0,
          popularityScore: this.calculatePopularityScore(stat)
        });
      }
    }

    return popularResources;
  }

  async getTrendingResources(options: { timeRange: string; limit: number }) {
    const currentPeriodEnd = new Date();
    const currentPeriodStart = this.calculateStartDate(currentPeriodEnd, options.timeRange);
    const previousPeriodEnd = currentPeriodStart;
    const previousPeriodStart = this.calculateStartDate(previousPeriodEnd, options.timeRange);

    // Get stats for both periods - simplified implementation
    const currentStats = await this.getReservationStatsSimplified(
      currentPeriodStart,
      currentPeriodEnd,
      { limit: options.limit * 2 }
    );

    const previousStats = await this.getReservationStatsSimplified(
      previousPeriodStart,
      previousPeriodEnd,
      { limit: options.limit * 2 }
    );

    // Calculate trending score (growth rate)
    const trendingResources = currentStats
      .map(current => {
        const previous = previousStats.find(p => p.resourceId === current.resourceId);
        const previousCount = previous?.count || 0;
        const growthRate = previousCount > 0 
          ? ((current.count - previousCount) / previousCount) * 100
          : current.count > 0 ? 100 : 0;

        return {
          resourceId: current.resourceId,
          currentCount: current.count,
          previousCount,
          growthRate,
          trendingScore: growthRate + (current.count * 0.1) // Weighted trending score
        };
      })
      .filter(resource => resource.growthRate > 0)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, options.limit);

    // Enrich with resource details
    const enrichedTrending = [];
    for (const trending of trendingResources) {
      const resource = await this.resourceRepository.findById(trending.resourceId);
      if (resource) {
        enrichedTrending.push({
          resource,
          growthRate: trending.growthRate,
          currentReservations: trending.currentCount,
          previousReservations: trending.previousCount,
          trendingScore: trending.trendingScore
        });
      }
    }

    return enrichedTrending;
  }

  async getUserSearchHistory(userId: string, options: {
    page: number;
    limit: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    // This would query a SearchHistory entity/collection
    // For now, returning placeholder structure
    return {
      data: [],
      pagination: {
        page: options.page,
        limit: options.limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private buildSearchFilters(criteria: SearchCriteria) {
    const filters: any = { isActive: true };

    // Apply basic filters that match ResourceRepository interface
    if (criteria.resourceTypes?.length) {
      filters.type = criteria.resourceTypes[0]; // Repository only supports single type
    }

    if (criteria.categories?.length) {
      filters.categoryId = criteria.categories[0]; // Repository only supports single category
    }

    if (criteria.locations?.length) {
      filters.location = criteria.locations[0]; // Repository only supports single location
    }

    return filters;
  }

  private async postProcessResults(resources: any[], criteria: SearchCriteria) {
    // Apply any additional filtering or enrichment that can't be done in MongoDB
    return resources;
  }

  private countActiveFilters(criteria: SearchCriteria): number {
    let count = 0;
    if (criteria.searchTerm) count++;
    if (criteria.resourceTypes?.length) count++;
    if (criteria.locations?.length) count++;
    if (criteria.categories?.length) count++;
    if (criteria.capacityMin || criteria.capacityMax) count++;
    if (criteria.features?.length) count++;
    if (criteria.academicPrograms?.length) count++;
    if (criteria.availabilityWindow) count++;
    return count;
  }

  private async findNextAvailableSlot(resourceId: string, afterDate: Date) {
    // Implementation would find the next available time slot
    return null;
  }

  private async findResourceAlternatives(resourceId: string, startDate: Date, endDate: Date) {
    // Implementation would find similar available resources
    return [];
  }

  private async checkMaintenanceConflicts(resourceId: string, startDate: Date, endDate: Date) {
    // Implementation would check maintenance schedules
    return [];
  }

  private async checkScheduleRestrictions(resourceId: string, startDate: Date, endDate: Date) {
    // Implementation would check schedule restrictions
    return [];
  }

  private calculateStartDate(endDate: Date, timeRange: string): Date {
    const start = new Date(endDate);
    switch (timeRange) {
      case 'day':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }
    return start;
  }

  private calculatePopularityScore(stats: any): number {
    // Implementation would calculate popularity based on various factors
    return stats.count + (stats.uniqueUsers * 2) + (stats.averageRating * 10);
  }

  private async getReservationStatsSimplified(
    startDate: Date,
    endDate: Date,
    options: any
  ) {
    // Simplified implementation using existing repository methods
    // TODO: Implement proper analytics methods in ReservationRepository
    try {
      const allReservations = await this.reservationRepository.findByDateRange(startDate, endDate);
      
      // Group by resource ID and count
      const statsMap = new Map();
      allReservations.forEach(reservation => {
        const resourceId = reservation.resourceId;
        if (!statsMap.has(resourceId)) {
          statsMap.set(resourceId, {
            resourceId,
            count: 0,
            uniqueUsers: new Set(),
            averageRating: 0
          });
        }
        
        const stats = statsMap.get(resourceId);
        stats.count++;
        stats.uniqueUsers.add(reservation.userId);
      });
      
      // Convert to array and add calculated values
      const results = Array.from(statsMap.values()).map(stats => ({
        resourceId: stats.resourceId,
        count: stats.count,
        uniqueUsers: stats.uniqueUsers.size,
        averageRating: 0 // Placeholder
      }));
      
      // Sort by count and limit
      return results
        .sort((a, b) => b.count - a.count)
        .slice(0, options.limit || 10);
        
    } catch (error) {
      this.logger.error('Error getting reservation stats', { error: error.message });
      return [];
    }
  }
}
