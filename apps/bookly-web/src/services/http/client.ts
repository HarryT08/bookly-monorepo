import { API_CONFIG } from "@/services/config/services";
import ky from "ky";
import { errorHandler } from "./errorHandler";
import type { ApiError, ApiResponse } from "./types";

// Function to get current token (can be overridden by store)
let getAuthToken: () => string | null = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bookly_token");
  }
  return null;
};

// Function to set token getter (to be called by auth system)
export const setAuthTokenGetter = (getter: () => string | null) => {
  getAuthToken = getter;
};

const { BASE_URL, VERSION, TIMEOUT } = API_CONFIG;

// Create base client
const client = ky.create({
  prefixUrl: `${BASE_URL}/${VERSION}`,
  timeout: TIMEOUT,
  retry: {
    limit: 2,
    methods: ["get"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Add auth token if available
        const token = getAuthToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }

        // Add common headers
        request.headers.set("Content-Type", "application/json");
        request.headers.set("Accept", "application/json");

        // Add language header
        const language =
          typeof window !== "undefined"
            ? localStorage.getItem("bookly_language") || "es"
            : "es";
        request.headers.set("Accept-Language", language);

        // Debug log for requests (only in development)
        if (process.env.NODE_ENV === "development") {
          console.log(`🚀 API Request: ${request.method} ${request.url}`);
          if (token) {
            console.log(
              `🔐 Authorization: Bearer ${token.substring(0, 20)}...`
            );
          }
        }
        console.log(`🚀 API Request: ${request.method} ${request.url}`);
      },
    ],
    beforeError: [
      async (error) => {
        const { response } = error;

        let apiError: ApiError;

        if (response && response.body) {
          try {
            apiError = (await response.json()) as ApiError;
            // Enhance error with HTTP info
            apiError.http_code = apiError.http_code || response.status;
            apiError.statusCode = response.status;
            apiError.path = apiError.path || response.url;
          } catch {
            // Fallback error structure
            apiError = {
              success: false,
              message: `HTTP ${response.status}: ${response.statusText}`,
              http_code: response.status,
              statusCode: response.status,
              http_exception: response.statusText,
              path: response.url,
            };
          }
        } else {
          // Network or other error
          apiError = {
            success: false,
            message: error.message || "Network error",
            type: "network_error",
            http_code: 0,
            http_exception: "NetworkError",
          };
        }

        // Log error in development
        errorHandler.logError(apiError, "HTTP Client");

        // Create standardized error
        const booklyError = errorHandler.createError(apiError);

        // Copy properties to original error for compatibility
        error.name = "BooklyApiError";
        error.message = booklyError.message;
        (error as any).code = booklyError.code;
        (error as any).type = booklyError.type;
        (error as any).httpCode = booklyError.httpCode;
        (error as any).apiError = apiError;

        return error;
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle 401 Unauthorized - try to refresh token
        if (response && response.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem("bookly_refresh_token");

          if (refreshToken) {
            try {
              const refreshResponse = await ky.post("auth/refresh", {
                prefixUrl: `${BASE_URL}/${VERSION}`,
                json: { refreshToken },
              });

              const { accessToken, refreshToken: newRefreshToken } =
                (await refreshResponse.json()) as any;

              // Update tokens in localStorage
              localStorage.setItem("bookly_token", accessToken);
              localStorage.setItem("bookly_refresh_token", newRefreshToken);

              // Dispatch event to update Redux store
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("auth-token-refreshed", {
                    detail: { accessToken, refreshToken: newRefreshToken },
                  })
                );
              }

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
              localStorage.removeItem("bookly_token");
              localStorage.removeItem("bookly_refresh_token");
              localStorage.removeItem("bookly_user");

              // Dispatch logout event
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("auth-logout"));
                if (window.location.pathname !== "/auth/login") {
                  window.location.href = "/auth/login";
                }
              }
            }
          } else {
            // No refresh token, redirect to login
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("auth-logout"));
              if (window.location.pathname !== "/auth/login") {
                window.location.href = "/auth/login";
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
export const buildServiceUrl = (service: string, endpoint?: string): string => {
  return service + (endpoint ? `/${endpoint}` : "");
};

// Typed API client methods
export const api = {
  // GET request
  get: async <T = any>(url: string, options?: any): Promise<ApiResponse<T>> => {
    const response = await client.get(url, options);
    return response.json() as Promise<ApiResponse<T>>;
  },

  // POST request
  post: async <T = any>(
    url: string,
    data?: any,
    options?: any
  ): Promise<ApiResponse<T>> => {
    const response = await client.post(url, {
      json: data,
      ...options,
    });
    return response.json() as Promise<ApiResponse<T>>;
  },

  // PUT request
  put: async <T = any>(
    url: string,
    data?: any,
    options?: any
  ): Promise<ApiResponse<T>> => {
    const response = await client.put(url, {
      json: data,
      ...options,
    });
    return response.json() as Promise<ApiResponse<T>>;
  },

  // PATCH request
  patch: async <T = any>(
    url: string,
    data?: any,
    options?: any
  ): Promise<ApiResponse<T>> => {
    const response = await client.patch(url, {
      json: data,
      ...options,
    });
    return response.json() as Promise<ApiResponse<T>>;
  },

  // DELETE request
  delete: async <T = any>(
    url: string,
    options?: any
  ): Promise<ApiResponse<T>> => {
    const response = await client.delete(url, options);
    return response.json() as Promise<ApiResponse<T>>;
  },
};

export default client;
