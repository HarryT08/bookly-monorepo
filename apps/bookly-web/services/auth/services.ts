import { authClient } from '@services/http';
import type { ApiResponse } from '@services/http/types';
import type {
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	User,
	CreateRoleRequest,
	UpdateRoleRequest,
	RoleWithPermissions,
	CreatePermissionRequest,
	UpdatePermissionRequest,
	PermissionWithDetails,
	AssignRoleRequest,
	UserRoleAssignment,
	SSOLoginResponse,
	AuthAuditLog
} from './types';

/**
 * Authentication API services
 */
export const authServices = {
	/**
	 * Login user
	 */
	async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		return authClient.post('auth/login', { json: credentials }).json();
	},

	/**
	 * Register new user
	 */
	async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
		return authClient.post('auth/register', { json: userData }).json();
	},

	/**
	 * Logout user
	 */
	async logout(): Promise<ApiResponse<void>> {
		return authClient.post('auth/logout').json();
	},

	/**
	 * Get current user profile
	 */
	async getProfile(): Promise<ApiResponse<User>> {
		return authClient.get('auth/profile').json();
	},

	/**
	 * Update user profile
	 */
	async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
		return authClient.put('auth/profile', { json: userData }).json();
	},

	/**
	 * Request password reset
	 */
	async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
		return authClient.post('auth/password-reset', { json: { email } }).json();
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
		return authClient
			.post('auth/password-reset/confirm', {
				json: { token, newPassword }
			})
			.json();
	},

	/**
	 * SSO Google Login
	 */
	async ssoGoogleLogin(): Promise<void> {
		window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/oauth/google`;
	},

	/**
	 * SSO Google Callback
	 */
	async ssoCallback(token: string): Promise<ApiResponse<SSOLoginResponse>> {
		return authClient.get(`auth/oauth/google/callback?token=${token}`).json();
	}
};

/**
 * Role management services
 */
export const roleServices = {
	/**
	 * Get all roles
	 */
	async getAllRoles(params?: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<ApiResponse<RoleWithPermissions[]>> {
		const searchParams = new URLSearchParams();

		if (params?.page) searchParams.set('page', params.page.toString());

		if (params?.limit) searchParams.set('limit', params.limit.toString());

		if (params?.search) searchParams.set('search', params.search);

		return authClient.get(`roles?${searchParams.toString()}`).json();
	},

	/**
	 * Get active roles
	 */
	async getActiveRoles(): Promise<ApiResponse<RoleWithPermissions[]>> {
		return authClient.get('roles/active').json();
	},

	/**
	 * Get role by ID
	 */
	async getRoleById(id: string): Promise<ApiResponse<RoleWithPermissions>> {
		return authClient.get(`roles/${id}`).json();
	},

	/**
	 * Create role
	 */
	async createRole(data: CreateRoleRequest): Promise<ApiResponse<RoleWithPermissions>> {
		return authClient.post('roles', { json: data }).json();
	},

	/**
	 * Update role
	 */
	async updateRole(id: string, data: UpdateRoleRequest): Promise<ApiResponse<RoleWithPermissions>> {
		return authClient.put(`roles/${id}`, { json: data }).json();
	},

	/**
	 * Delete role
	 */
	async deleteRole(id: string): Promise<ApiResponse<void>> {
		return authClient.delete(`roles/${id}`).json();
	},

	/**
	 * Assign role to user
	 */
	async assignRole(data: AssignRoleRequest): Promise<ApiResponse<UserRoleAssignment>> {
		return authClient.post('users/roles/assign', { json: data }).json();
	},

	/**
	 * Remove role from user
	 */
	async removeRole(userId: string, roleId: string): Promise<ApiResponse<void>> {
		return authClient.delete(`users/${userId}/roles/${roleId}`).json();
	}
};

/**
 * Permission management services
 */
export const permissionServices = {
	/**
	 * Get all permissions
	 */
	async getAllPermissions(filters?: {
		resource?: string;
		action?: string;
		scope?: string;
		isActive?: boolean;
	}): Promise<ApiResponse<PermissionWithDetails[]>> {
		const searchParams = new URLSearchParams();

		if (filters?.resource) searchParams.set('resource', filters.resource);

		if (filters?.action) searchParams.set('action', filters.action);

		if (filters?.scope) searchParams.set('scope', filters.scope);

		if (filters?.isActive !== undefined) searchParams.set('isActive', filters.isActive.toString());

		return authClient.get(`permissions?${searchParams.toString()}`).json();
	},

	/**
	 * Get active permissions
	 */
	async getActivePermissions(): Promise<ApiResponse<PermissionWithDetails[]>> {
		return authClient.get('permissions/active').json();
	},

	/**
	 * Get permissions by resource
	 */
	async getPermissionsByResource(
		resource: string,
		action?: string,
		scope?: string
	): Promise<ApiResponse<PermissionWithDetails[]>> {
		const searchParams = new URLSearchParams();

		if (action) searchParams.set('action', action);

		if (scope) searchParams.set('scope', scope);

		return authClient.get(`permissions/resource/${resource}?${searchParams.toString()}`).json();
	},

	/**
	 * Get permission by ID
	 */
	async getPermissionById(id: string): Promise<ApiResponse<PermissionWithDetails>> {
		return authClient.get(`permissions/${id}`).json();
	},

	/**
	 * Create permission
	 */
	async createPermission(data: CreatePermissionRequest): Promise<ApiResponse<PermissionWithDetails>> {
		return authClient.post('permissions', { json: data }).json();
	},

	/**
	 * Update permission
	 */
	async updatePermission(id: string, data: UpdatePermissionRequest): Promise<ApiResponse<PermissionWithDetails>> {
		return authClient.put(`permissions/${id}`, { json: data }).json();
	},

	/**
	 * Activate permission
	 */
	async activatePermission(id: string): Promise<ApiResponse<PermissionWithDetails>> {
		return authClient.put(`permissions/${id}/activate`).json();
	},

	/**
	 * Deactivate permission
	 */
	async deactivatePermission(id: string): Promise<ApiResponse<PermissionWithDetails>> {
		return authClient.put(`permissions/${id}/deactivate`).json();
	},

	/**
	 * Delete permission
	 */
	async deletePermission(id: string): Promise<ApiResponse<void>> {
		return authClient.delete(`permissions/${id}`).json();
	},

	/**
	 * Create default system permissions
	 */
	async seedDefaultPermissions(): Promise<ApiResponse<PermissionWithDetails[]>> {
		return authClient.post('permissions/seed-defaults').json();
	}
};

/**
 * User management services
 */
export const userServices = {
	/**
	 * Get all users
	 */
	async getAllUsers(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<User[]>> {
		const searchParams = new URLSearchParams();

		if (params?.page) searchParams.set('page', params.page.toString());

		if (params?.limit) searchParams.set('limit', params.limit.toString());

		if (params?.search) searchParams.set('search', params.search);

		return authClient.get(`users?${searchParams.toString()}`).json();
	},

	/**
	 * Get user by ID
	 */
	async getUserById(id: string): Promise<ApiResponse<User>> {
		return authClient.get(`users/${id}`).json();
	},

	/**
	 * Update user
	 */
	async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
		return authClient.put(`users/${id}`, { json: data }).json();
	},

	/**
	 * Get user roles
	 */
	async getUserRoles(userId: string): Promise<ApiResponse<UserRoleAssignment[]>> {
		return authClient.get(`users/${userId}/roles`).json();
	},

	/**
	 * Activate user
	 */
	async activateUser(id: string): Promise<ApiResponse<User>> {
		return authClient.put(`users/${id}/activate`).json();
	},

	/**
	 * Deactivate user
	 */
	async deactivateUser(id: string): Promise<ApiResponse<User>> {
		return authClient.put(`users/${id}/deactivate`).json();
	}
};

/**
 * Audit services
 */
export const auditServices = {
	/**
	 * Get audit logs
	 */
	async getAuditLogs(params?: {
		page?: number;
		limit?: number;
		userId?: string;
		action?: string;
		resource?: string;
		dateFrom?: string;
		dateTo?: string;
	}): Promise<ApiResponse<AuthAuditLog[]>> {
		const searchParams = new URLSearchParams();

		if (params?.page) searchParams.set('page', params.page.toString());

		if (params?.limit) searchParams.set('limit', params.limit.toString());

		if (params?.userId) searchParams.set('userId', params.userId);

		if (params?.action) searchParams.set('action', params.action);

		if (params?.resource) searchParams.set('resource', params.resource);

		if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);

		if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

		return authClient.get(`audit/logs?${searchParams.toString()}`).json();
	}
};

const authApi = {
	...authServices,
	roles: roleServices,
	permissions: permissionServices,
	users: userServices,
	audit: auditServices
};

export default authApi;
