/**
 * Advanced Search Controller - RF-09
 * REST API endpoints for advanced resource search functionality
 * Following Clean Architecture and CQRS patterns
 */

import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@libs/common/guards/jwt-auth.guard";
import { CurrentUser } from "@libs/common/decorators/current-user.decorator";
import { LoggingService } from "@libs/logging/logging.service";
import { EventBusService } from "@libs/event-bus/services/event-bus.service";

// Import CQRS queries
import {
  AdvancedResourceSearchQuery,
  RealTimeAvailabilitySearchQuery,
  SearchHistoryQuery,
  PopularResourcesQuery,
  QuickSearchQuery,
} from "../../application/queries/advanced-search.queries";

// Import DTOs for API documentation and validation
import {
  AdvancedSearchRequestDto,
  AvailabilityCheckRequestDto,
  AdvancedSearchResponseDto,
  AvailabilityResponseDto,
  SearchHistoryResponseDto,
  PopularResourcesResponseDto,
  QuickSearchResponseDto,
} from "../../application/dto/advanced-search.dto";
import { AVAILABILITY_URLS } from "../../utils/maps";
import { ResponseUtil } from "@/libs/common/utils/response.util";
import { ApiResponseBookly } from "@/libs/dto";

@ApiTags(AVAILABILITY_URLS.ADVANCED_SEARCH_TAG)
@Controller(AVAILABILITY_URLS.ADVANCED_SEARCH)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdvancedSearchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: LoggingService,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Advanced Resource Search - Core functionality of RF-09
   * Allows complex filtering and real-time availability checking
   */
  @Post(AVAILABILITY_URLS.ADVANCED_SEARCH_CREATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Advanced resource search with multiple filters",
    description:
      "Search resources using multiple criteria including availability, capacity, features, and more",
  })
  @ApiBody({ type: AdvancedSearchRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Search results with pagination and availability status",
    type: AdvancedSearchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid search parameters",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Authentication required",
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async advancedSearch(
    @Body() searchRequest: AdvancedSearchRequestDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<any | any[]>> {
    const startTime = Date.now();

    try {
      this.logger.log("Advanced search request received", {
        userId: user.id,
        searchTerm: searchRequest.searchTerm,
        filtersCount: this.countFilters(searchRequest),
        pagination: { page: searchRequest.page, limit: searchRequest.limit },
      });

      const query = new AdvancedResourceSearchQuery(
        searchRequest.searchTerm,
        searchRequest.resourceTypes,
        searchRequest.locations,
        searchRequest.categories,
        searchRequest.capacityMin,
        searchRequest.capacityMax,
        searchRequest.availabilityWindow?.start,
        searchRequest.availabilityWindow?.end,
        searchRequest.features,
        searchRequest.academicPrograms,
        searchRequest.includeUnavailable,
        (searchRequest.sortBy as
          | "name"
          | "capacity"
          | "location"
          | "popularity"
          | "availability") || "name",
        searchRequest.sortOrder || "asc",
        searchRequest.page || 1,
        searchRequest.limit || 20,
        user.id
      );

      const result = await this.queryBus.execute(query);

      this.logger.log("Advanced search completed successfully", {
        userId: user.id,
        resultsCount: result.data.length,
        totalResults: result.pagination.total,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.advancedSearchPaginated<any>(
        result.data,
        result.pagination,
        startTime,
        {
          searchTerm: searchRequest.searchTerm,
          activeFiltersCount: this.countFilters(searchRequest),
          appliedFilters: this.getAppliedFilters(searchRequest),
        },
        "Advanced search completed successfully"
      );
    } catch (error) {
      this.logger.error("Error in advanced search", {
        userId: user.id,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.error(
        "Error performing advanced search",
        error.message,
        {
          code: "SEARCH_ERROR",
          message: "Error performing advanced search",
          details: error.message,
          data: [],
          pagination: {
            page: searchRequest.page || 1,
            limit: searchRequest.limit || 20,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      );
    }
  }

  /**
   * Real-time Availability Check
   * Check availability for multiple resources in a specific time window
   */
  @Post(AVAILABILITY_URLS.ADVANCED_SEARCH_CHECK)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Check real-time availability for resources",
    description:
      "Verify availability status for one or more resources in a specific time window",
  })
  @ApiBody({ type: AvailabilityCheckRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Availability status for all requested resources",
    type: AvailabilityResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkAvailability(
    @Body() availabilityRequest: AvailabilityCheckRequestDto,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<AvailabilityResponseDto>> {
    const startTime = Date.now();

    try {
      this.logger.log("Availability check request received", {
        userId: user.id,
        resourcesCount: availabilityRequest.resourceIds?.length || 0,
        timeWindow: {
          start: availabilityRequest.startDate,
          end: availabilityRequest.endDate,
        },
      });

      const query = new RealTimeAvailabilitySearchQuery(
        availabilityRequest.resourceIds,
        availabilityRequest.startDate,
        availabilityRequest.endDate,
        availabilityRequest.includeConflicts || false,
        availabilityRequest.includeAlternatives || false,
        user.id
      );

      const result = await this.queryBus.execute(query);

      this.logger.log("Availability check completed", {
        userId: user.id,
        availableCount: result.available.length,
        unavailableCount: result.unavailable.length,
        conflictsCount: result.conflicts?.length || 0,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.success({
        success: true,
        available: result.available,
        unavailable: result.unavailable,
        conflicts: result.conflicts || [],
        alternatives: result.alternatives || [],
        summary: {
          totalRequested: availabilityRequest.resourceIds?.length || 0,
          availableCount: result.available.length,
          unavailableCount: result.unavailable.length,
          availabilityRate:
            (result.available.length /
              (availabilityRequest.resourceIds?.length || 1)) *
            100,
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error("Error checking availability", {
        userId: user.id,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.error("Error checking availability", error.message, {
        code: "AVAILABILITY_CHECK_ERROR",
        message: "Error checking resource availability",
        details: error.message,
        available: [],
        unavailable: [],
        conflicts: [],
        alternatives: [],
      });
    }
  }

  /**
   * Quick Search with Autocomplete
   * Fast search for resources, locations, and categories with suggestions
   */
  @Get(AVAILABILITY_URLS.ADVANCED_SEARCH_QUICK)
  @ApiOperation({
    summary: "Quick search with autocomplete suggestions",
    description:
      "Fast search across resources, locations, and categories for autocomplete functionality",
  })
  @ApiQuery({ name: "q", required: true, description: "Search term" })
  @ApiQuery({
    name: "types",
    required: false,
    description:
      "Search types (comma-separated): resources,locations,categories",
    example: "resources,locations",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Maximum results per type",
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Quick search results with autocomplete suggestions",
    type: QuickSearchResponseDto,
  })
  async quickSearch(
    @Query("q") searchTerm: string,
    @Query("types") searchTypes: string = "resources,locations,categories",
    @Query("limit") limit: number = 10,
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<any | any[]>> {
    const startTime = Date.now();

    try {
      this.logger.log("Quick search request received", {
        userId: user.id,
        searchTerm,
        searchTypes: searchTypes?.split(","),
        limit,
      });

      const query = new QuickSearchQuery(
        searchTerm,
        (searchTypes?.split(",") || [
          "resources",
          "locations",
          "categories",
        ]) as ("resources" | "locations" | "categories")[],
        limit || 10,
        user.id
      );

      const result = await this.queryBus.execute(query);

      this.logger.log("Quick search completed", {
        userId: user.id,
        resultsCount: {
          resources: result.resources?.length || 0,
          locations: result.locations?.length || 0,
          categories: result.categories?.length || 0,
        },
        executionTimeMs: Date.now() - startTime,
      });

      const totalResults =
        (result.resources?.length || 0) +
        (result.locations?.length || 0) +
        (result.categories?.length || 0);

      return ResponseUtil.advancedSearchPaginated(
        result,
        {
          page: 1,
          limit: limit || 10,
          total: totalResults,
          totalPages: Math.ceil(totalResults / (limit || 10)),
        },
        startTime,
        query
      );
    } catch (error) {
      this.logger.error("Error in quick search", {
        userId: user.id,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.error(
        "Error performing quick search",
        error.message,
        {
          code: "QUICK_SEARCH_ERROR",
          message: "Error performing quick search",
          details: error.message,
          results: {
            resources: [],
            locations: [],
            categories: [],
          },
        }
      );
    }
  }

  /**
   * Popular Resources Analytics
   * Get most popular resources based on usage statistics
   */
  @Get(AVAILABILITY_URLS.ADVANCED_SEARCH_POPULAR)
  @ApiOperation({
    summary: "Get popular resources based on usage analytics",
    description: "Retrieve most used resources with statistics and trends",
  })
  @ApiQuery({
    name: "timeRange",
    required: false,
    description: "Time range for analysis",
    example: "month",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Maximum number of results",
    example: 10,
  })
  @ApiQuery({
    name: "categories",
    required: false,
    description: "Filter by categories (comma-separated)",
  })
  @ApiQuery({
    name: "academicPrograms",
    required: false,
    description: "Filter by academic programs (comma-separated)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Popular resources with usage statistics",
    type: PopularResourcesResponseDto,
  })
  async getPopularResources(
    @Query("timeRange") timeRange: string = "month",
    @Query("limit") limit: number = 10,
    @Query("categories") categories: string = "",
    @Query("academicPrograms") academicPrograms: string = "",
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<any | any[]>> {
    const startTime = Date.now();

    try {
      this.logger.log("Popular resources request received", {
        userId: user.id,
        timeRange,
        limit,
        categories: categories?.split(","),
        academicPrograms: academicPrograms?.split(","),
      });

      const query = new PopularResourcesQuery(
        (timeRange as "day" | "week" | "month" | "year") || "month",
        limit || 10,
        categories?.split(","),
        academicPrograms?.split(",")
      );

      const result = await this.queryBus.execute(query);

      this.logger.log("Popular resources retrieved", {
        userId: user.id,
        resultsCount: result.length,
        timeRange,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.advancedSearchPaginated(
        result,
        {
          page: 1,
          limit: limit || 10,
          total: result.length,
          totalPages: Math.ceil(result.length / (limit || 10)),
        },
        startTime,
        query
      );
    } catch (error) {
      this.logger.error("Error retrieving popular resources", {
        userId: user.id,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.error(
        "Error retrieving popular resources",
        error.message,
        {
          code: "POPULAR_RESOURCES_ERROR",
          message: "Error retrieving popular resources",
          details: error.message,
          data: [],
        }
      );
    }
  }

  /**
   * User Search History
   * Get search history for the current user with pagination
   */
  @Get(AVAILABILITY_URLS.ADVANCED_SEARCH_HISTORY)
  @ApiOperation({
    summary: "Get user search history",
    description:
      "Retrieve search history for the current user with pagination and filtering",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Results per page",
    example: 20,
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Filter from date (ISO string)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "Filter to date (ISO string)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User search history with pagination",
    type: SearchHistoryResponseDto,
  })
  async getSearchHistory(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("startDate") startDate: string = "",
    @Query("endDate") endDate: string = "",
    @CurrentUser() user: any
  ): Promise<ApiResponseBookly<any | any[]>> {
    const startTime = Date.now();

    try {
      this.logger.log("Search history request received", {
        userId: user.id,
        pagination: { page, limit },
        dateRange: { startDate, endDate },
      });

      const query = new SearchHistoryQuery(
        user.id,
        page || 1,
        limit || 20,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      const result = await this.queryBus.execute(query);

      this.logger.log("Search history retrieved", {
        userId: user.id,
        resultsCount: result.data.length,
        totalRecords: result.pagination.total,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.advancedSearchPaginated(
        result.data,
        result.pagination,
        startTime,
        query
      );
    } catch (error) {
      this.logger.error("Error retrieving search history", {
        userId: user?.id,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      });

      return ResponseUtil.error(
        "Error retrieving search history",
        error.message,
        {
          code: "SEARCH_HISTORY_ERROR",
          message: "Error retrieving search history",
          details: error.message,
        },
        [],
        {
          page: page || 1,
          limit: limit || 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      );
    }
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private countFilters(searchRequest: AdvancedSearchRequestDto): number {
    let count = 0;
    if (searchRequest.searchTerm) count++;
    if (searchRequest.resourceTypes?.length) count++;
    if (searchRequest.locations?.length) count++;
    if (searchRequest.categories?.length) count++;
    if (searchRequest.capacityMin || searchRequest.capacityMax) count++;
    if (searchRequest.features?.length) count++;
    if (searchRequest.academicPrograms?.length) count++;
    if (searchRequest.availabilityWindow) count++;
    return count;
  }

  private getAppliedFilters(searchRequest: AdvancedSearchRequestDto): string[] {
    const filters = [];
    if (searchRequest.searchTerm) filters.push("searchTerm");
    if (searchRequest.resourceTypes?.length) filters.push("resourceTypes");
    if (searchRequest.locations?.length) filters.push("locations");
    if (searchRequest.categories?.length) filters.push("categories");
    if (searchRequest.capacityMin || searchRequest.capacityMax)
      filters.push("capacity");
    if (searchRequest.features?.length) filters.push("features");
    if (searchRequest.academicPrograms?.length)
      filters.push("academicPrograms");
    if (searchRequest.availabilityWindow) filters.push("availabilityWindow");
    return filters;
  }
}
