/**
 * Standard API Response Interface
 * Matches Bookly backend ResponseUtil standard
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * API Error interface for error responses
 * Matches Bookly backend error standard
 */
export interface ApiError {
  success: false;
  data?: null;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
  type?: 'error' | 'warning' | 'info' | 'network_error' | 'timeout_error' | 'unknown_error';
  exception_code?: string;
  http_code?: number;
  http_exception?: string;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * Filter parameters for API requests
 */
export interface FilterParams {
  search?: string;
  isActive?: boolean;
  category?: string;
  program?: string;
  type?: string;
  [key: string]: any;
}

/**
 * HTTP request options
 */
export type RequestOptions = {
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  searchParams?: Record<string, any>;
};

/**
 * Service response type for internal use
 */
export interface ServiceResponse<T> {
  data?: T[] | T;
  items?: T[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}
