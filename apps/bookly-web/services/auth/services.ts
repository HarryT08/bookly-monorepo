import { httpClient } from '@services/http';
import type { ApiResponse } from '@services/http/types';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from './types';

/**
 * Authentication API services
 */
export const authServices = {
	/**
	 * Login user
	 */
	async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		return httpClient.post('auth/login', { json: credentials }).json();
	},

	/**
	 * Register new user
	 */
	async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
		return httpClient.post('auth/register', { json: userData }).json();
	},

	/**
	 * Logout user
	 */
	async logout(): Promise<ApiResponse<void>> {
		return httpClient.post('auth/logout').json();
	},

	/**
	 * Get current user profile
	 */
	async getProfile(): Promise<ApiResponse<User>> {
		return httpClient.get('auth/profile').json();
	},

	/**
	 * Update user profile
	 */
	async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
		return httpClient.put('auth/profile', { json: userData }).json();
	},

	/**
	 * Request password reset
	 */
	async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
		return httpClient.post('auth/password-reset', { json: { email } }).json();
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
		return httpClient
			.post('auth/password-reset/confirm', {
				json: { token, newPassword }
			})
			.json();
	}
};

export default authServices;
