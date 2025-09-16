/**
 * Response Utility Functions
 * Helper functions to create standardized responses
 */

import { AdvancedSearchPaginationMeta, ApiResponse, PaginationMeta } from '@libs/dto/common/response.dto';

export class ResponseUtil {
  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    message?: string,
    meta?: PaginationMeta | AdvancedSearchPaginationMeta
  ): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };

    if (message) {
      response.message = message;
    }

    if (meta) {
      response.meta = meta;
    }

    return response;
  }

  /**
   * Create a successful paginated response
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number = 1,
    limit: number = 20,
    message?: string
  ): ApiResponse<T[]> {
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return this.success(data, message, meta);
  }

  /**
   * Create a successful advanced search paginated response
   */
  static advancedSearchPaginated<T>(
    data: T[],
    pagination: PaginationMeta,
    startTime: number,
    filters: any,
    message?: string
  ): ApiResponse<T[]> {
    const meta: AdvancedSearchPaginationMeta = {
      pagination: {
        ...pagination,
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        totalPages: pagination.totalPages || Math.ceil(pagination.total / pagination.limit),
      },
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date(),
      filters
    };

    return this.success(data, message, meta);
  }

  /**
   * Create an error response
   */
  static error(
    message: string,
    errors?: Record<string, string[]>,
    data?: any
  ): ApiResponse<any> {
    const response: ApiResponse<any> = {
      success: false,
      message,
      data: data || null,
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Create validation error response
   */
  static validationError(
    errors: Record<string, string[]>,
    message: string = 'Validation failed'
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
      errors,
    };
  }

  /**
   * Create not found error response
   */
  static notFound(
    resource: string = 'Resource',
    message?: string
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message: message || `${resource} not found`,
    };
  }

  /**
   * Create unauthorized error response
   */
  static unauthorized(
    message: string = 'Unauthorized access'
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
    };
  }

  /**
   * Create forbidden error response
   */
  static forbidden(
    message: string = 'Access forbidden'
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
    };
  }

  /**
   * Transform service response to paginated format
   */
  static fromServiceResponse<T>(serviceResponse: {
    data?: T[] | T;
    items?: T[];
    total?: number;
    page?: number;
    limit?: number;
    message?: string;
  }): ApiResponse<T[] | T> {
    // Handle paginated service responses
    if (serviceResponse.items && serviceResponse.total !== undefined) {
      return this.paginated(
        serviceResponse.items,
        serviceResponse.total,
        serviceResponse.page,
        serviceResponse.limit,
        serviceResponse.message
      );
    }

    // Handle regular service responses
    const data = serviceResponse.data || serviceResponse.items;
    return this.success(data, serviceResponse.message);
  }

  /**
   * Transform array of entities to list response
   */
  static list<T>(
    items: T[],
    message?: string
  ): ApiResponse<T[]> {
    return this.success(items, message || 'List retrieved successfully');
  }
}
