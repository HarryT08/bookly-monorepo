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

class HttpClient {
	private baseURL: string;

	constructor() {
		this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
	}

	async get<T>(endpoint: string): Promise<ApiResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: data ? JSON.stringify(data) : undefined
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: data ? JSON.stringify(data) : undefined
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}

	async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response.json();
	}
}

export const httpClient = new HttpClient();
export const apiClient = httpClient; // Alias for compatibility
export const client = httpClient; // Additional alias for compatibility
export default httpClient;
