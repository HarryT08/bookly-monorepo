import ky from 'ky';
import type { ApiResponse, ApiError } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

// Create base client
const client = ky.create({
  prefixUrl: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Add auth token if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('bookly_token');
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }

        // Add common headers
        request.headers.set('Content-Type', 'application/json');
        request.headers.set('Accept', 'application/json');
        
        // Add language header
        const language = typeof window !== 'undefined' 
          ? localStorage.getItem('bookly_language') || 'es'
          : 'es';
        request.headers.set('Accept-Language', language);
      },
    ],
    beforeError: [
      async (error) => {
        const { response } = error;
        
        if (response && response.body) {
          try {
            const errorBody = await response.json() as ApiError;
            error.name = 'APIError';
            error.message = errorBody.message || `HTTP ${response.status}`;
            (error as any).code = errorBody.code;
            (error as any).type = errorBody.type;
            (error as any).httpCode = response.status;
          } catch {
            // If parsing fails, use default error message
            error.message = `HTTP ${response.status}: ${response.statusText}`;
          }
        }

        return error;
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('bookly_refresh_token');
            
            if (refreshToken) {
              try {
                // Try to refresh the token
                const refreshResponse = await ky.post('auth/refresh', {
                  prefixUrl: `${API_BASE_URL}/${API_VERSION}`,
                  json: { refreshToken },
                });
                
                const { accessToken, refreshToken: newRefreshToken } = await refreshResponse.json() as any;
                
                // Update tokens in localStorage
                localStorage.setItem('bookly_token', accessToken);
                localStorage.setItem('bookly_refresh_token', newRefreshToken);
                
                // Retry original request with new token
                const retryResponse = await ky(request, {
                  ...options,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
                
                return retryResponse;
              } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('bookly_token');
                localStorage.removeItem('bookly_refresh_token');
                localStorage.removeItem('bookly_user');
                
                if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                  window.location.href = '/auth/login';
                }
              }
            } else {
              // No refresh token, redirect to login
              if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login';
              }
            }
          }
        }

        return response;
      },
    ],
  },
});

// Helper function to build service URLs
export const buildServiceUrl = (service: string, endpoint: string): string => {
  return `${service}/${endpoint}`;
};

// Typed API client methods
export const api = {
  // GET request
  get: async <T = any>(url: string, options?: any): Promise<ApiResponse<T>> => {
    const response = await client.get(url, options);
    return response.json() as Promise<ApiResponse<T>>;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>> => {
    const response = await client.post(url, {
      json: data,
      ...options,
    });
    return response.json() as Promise<ApiResponse<T>>;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>> => {
    const response = await client.put(url, {
      json: data,
      ...options,
    });
    return response.json() as Promise<ApiResponse<T>>;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>> => {
    const response = await client.patch(url, {
      json: data,
      ...options,
    });
    return response.json() as Promise<ApiResponse<T>>;
  },

  // DELETE request
  delete: async <T = any>(url: string, options?: any): Promise<ApiResponse<T>> => {
    const response = await client.delete(url, options);
    return response.json() as Promise<ApiResponse<T>>;
  },
};

export default client;
