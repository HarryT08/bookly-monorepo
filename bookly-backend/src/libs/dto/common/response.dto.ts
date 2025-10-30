import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadata for paginated responses
 */
export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Metadata for advanced search paginated responses
 */
export interface AdvancedSearchPaginationMeta {
  pagination: PaginationMeta;
  executionTimeMs: number;
  timestamp: Date;
  filters: any;
}

/**
 * Standard API Response Interface
 * Complies with Bookly response standard
 */
export interface ApiResponseBookly<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta | AdvancedSearchPaginationMeta;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}

/**
 * Base Response DTO for Swagger documentation
 */
export class BaseResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message', required: false })
  message?: string;

  @ApiProperty({ description: 'Timestamp of the response', required: false })
  timestamp?: string;

  @ApiProperty({ description: 'Request path', required: false })
  path?: string;

  @ApiProperty({ description: 'HTTP method', required: false })
  method?: string;

  @ApiProperty({ description: 'HTTP status code', required: false })
  statusCode?: number;
}

/**
 * Success Response DTO
 */
export class SuccessResponseDto<T> extends BaseResponseDto {
  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  @ApiProperty({ 
    description: 'Pagination metadata',
    required: false,
    type: 'object',
    properties: {
      page: { type: 'number' },
      limit: { type: 'number' },
      total: { type: 'number' },
      totalPages: { type: 'number' }
    }
  })
  meta?: PaginationMeta;
}

/**
 * Error Response DTO
 */
export class ErrorResponseDto extends BaseResponseDto {
  @ApiProperty({ description: 'Error code', required: false })
  code?: string;

  @ApiProperty({ description: 'Error type', required: false })
  type?: string;

  @ApiProperty({ description: 'Exception code', required: false })
  exception_code?: string;

  @ApiProperty({ description: 'HTTP status code', required: false })
  http_code?: number;

  @ApiProperty({ description: 'HTTP exception name', required: false })
  http_exception?: string;

  @ApiProperty({ 
    description: 'Granular validation errors',
    required: false,
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'string' }
    }
  })
  errors?: Record<string, string[]>;
}

/**
 * Paginated Response DTO
 */
export class PaginatedResponseDto<T> extends SuccessResponseDto<T[]> {
  @ApiProperty({ 
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      page: { type: 'number' },
      limit: { type: 'number' },
      total: { type: 'number' },
      totalPages: { type: 'number' }
    }
  })
  meta: PaginationMeta;
}
