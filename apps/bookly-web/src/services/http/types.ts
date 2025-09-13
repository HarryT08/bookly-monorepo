export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  exception_code?: string;
  http_code: number;
  http_exception: string;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

export type RequestOptions = {
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};
