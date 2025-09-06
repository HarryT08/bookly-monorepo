import { ErrorHandler, BooklyError } from '../errors/errorHandler';

// HTTP Client for Bookly API
export interface ApiResponse<T = unknown> {
	data: T;
	success: boolean;
	message?: string;
	errors?: string[];
}

export interface ApiError {
	message: string;
	code: string;
	status?: number;
}

export interface HttpClientConfig {
	baseURL?: string;
	versionPath?: string;
	version?: string;
	timeout?: number;
	defaultHeaders?: Record<string, string>;
}

const DEFAULT_CONFIG: Required<HttpClientConfig> = {
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
	versionPath: process.env.NEXT_VERSION_PATH || '/api',
	version: process.env.NEXT_VERSION || 'v1',
	timeout: 10000,
	defaultHeaders: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	}
};

class HttpClient {
	private config: Required<HttpClientConfig>;
	private serviceName: string;

	constructor(serviceName: string, config?: Partial<HttpClientConfig>) {
		this.serviceName = serviceName;
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	private getAuthHeaders(): Record<string, string> {
		const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	private buildUrl(endpoint: string): string {
		const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
		const servicePrefix = this.serviceName ? `${this.serviceName}/` : '';
		return `${this.config.baseURL}/${this.config.version}/${servicePrefix}${cleanEndpoint}`;
	}

	private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
				headers: {
					...this.config.defaultHeaders,
					...this.getAuthHeaders(),
					...options.headers
				}
			});

			clearTimeout(timeoutId);

			// Handle both wrapped ApiResponse and direct backend responses
			const data = await ErrorHandler.handleApiResponse(response);

			// If response is already wrapped in ApiResponse format, return as is
			if (data && typeof data === 'object' && 'success' in data) {
				return data as ApiResponse<T>;
			}

			// If response is direct backend response, wrap it
			return {
				data: data as T,
				success: true,
				message: 'Request successful'
			};
		} catch (error: unknown) {
			clearTimeout(timeoutId);

			if (error instanceof BooklyError) {
				throw error;
			}

			throw ErrorHandler.handle(error, `${this.serviceName || 'http'}.${options.method || 'GET'}`);
		}
	}

	async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
		let url = this.buildUrl(endpoint);

		if (params) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.set(key, value.toString());
				}
			});
			url += `?${searchParams.toString()}`;
		}

		return this.makeRequest<T>(url, { method: 'GET' });
	}

	async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
		const url = this.buildUrl(endpoint);
		return this.makeRequest<T>(url, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
		const url = this.buildUrl(endpoint);
		return this.makeRequest<T>(url, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined
		});
	}

	async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
		const url = this.buildUrl(endpoint);
		return this.makeRequest<T>(url, { method: 'DELETE' });
	}

	// File upload with multipart/form-data
	async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
		const url = this.buildUrl(endpoint);
		return this.makeRequest<T>(url, {
			method: 'POST',
			body: formData,
			headers: {
				// Don't set Content-Type for FormData - browser will set it with boundary
				...this.getAuthHeaders()
			}
		});
	}
}

export const httpClient = new HttpClient('');
export const apiClient = httpClient; // Alias for compatibility
export const client = httpClient; // Additional alias for compatibility

// Service-specific clients
export const authClient = new HttpClient('auth');
export const usersClient = new HttpClient('users');
export const rolesClient = new HttpClient('roles');
export const permissionsClient = new HttpClient('permissions');
export const auditClient = new HttpClient('audit');
export const resourcesClient = new HttpClient('resources');
export const availabilityClient = new HttpClient('availability');
export const stockpileClient = new HttpClient('stockpile');
export const reportsClient = new HttpClient('reports');
export const categoriesClient = new HttpClient('categories');
export const academicProgramsClient = new HttpClient('academic-programs');
export const maintenanceClient = new HttpClient('maintenance');

export default httpClient;
