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
import { auditClient, permissionsClient, rolesClient, usersClient } from '@services/http/client';

/**
 * Authentication API services
 */
export const authServices = {
	/**
	 * Login user
	 */
	async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		return authClient.post('login', credentials);
	},

	/**
	 * Register new user
	 */
	async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
		return authClient.post('register', userData);
	},

	/**
	 * Logout user
	 */
	async logout(): Promise<ApiResponse<void>> {
		return authClient.post('logout');
	},

	/**
	 * Get current user profile
	 */
	async getProfile(): Promise<ApiResponse<User>> {
		return authClient.get('profile');
	},

	/**
	 * Refresh token
	 */
	async refreshToken(): Promise<ApiResponse<LoginResponse>> {
		return authClient.post('refresh');
	},

	/**
	 * Update user profile
	 */
	async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
		return authClient.put('profile', userData);
	},

	/**
	 * Forgot password
	 */
	async forgotPassword(email: string): Promise<ApiResponse<void>> {
		return authClient.post('forgot-password', { email });
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
		return authClient.post('reset-password', { token, password });
	},

	/**
	 * SSO Google Login
	 */
	async ssoGoogleLogin(): Promise<void> {
		window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/oauth/google`;
	},

	/**
	 * SSO Google Callback
	 */
	async ssoCallback(token: string): Promise<ApiResponse<SSOLoginResponse>> {
		return authClient.get(`oauth/google/callback?token=${token}`);
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

		return rolesClient.get(`?${searchParams.toString()}`);
	},

	/**
	 * Get active roles
	 */
	async getActiveRoles(): Promise<ApiResponse<RoleWithPermissions[]>> {
		return rolesClient.get('roles/active');
	},

	/**
	 * Get role by ID
	 */
	async getRoleById(id: string): Promise<ApiResponse<RoleWithPermissions>> {
		return rolesClient.get(`/${id}`);
	},

	/**
	 * Create role
	 */
	async createRole(data: CreateRoleRequest): Promise<ApiResponse<RoleWithPermissions>> {
		return rolesClient.post('', data);
	},

	/**
	 * Update role
	 */
	async updateRole(id: string, data: UpdateRoleRequest): Promise<ApiResponse<RoleWithPermissions>> {
		return rolesClient.put(`/${id}`, data);
	},

	/**
	 * Delete role
	 */
	async deleteRole(id: string): Promise<ApiResponse<void>> {
		return rolesClient.delete(`/${id}`);
	},

	/**
	 * Assign role to user
	 */
	async assignRole(data: AssignRoleRequest): Promise<ApiResponse<UserRoleAssignment>> {
		return usersClient.post('/assign', data);
	},

	/**
	 * Remove role from user
	 */
	async removeRole(userId: string, roleId: string): Promise<ApiResponse<void>> {
		return usersClient.delete(`/${userId}/roles/${roleId}`);
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

		return permissionsClient.get(`?${searchParams.toString()}`);
	},

	/**
	 * Get active permissions
	 */
	async getActivePermissions(): Promise<ApiResponse<PermissionWithDetails[]>> {
		return permissionsClient.get('active');
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

		return permissionsClient.get(`resource/${resource}?${searchParams.toString()}`);
	},

	/**
	 * Get permission by ID
	 */
	async getPermissionById(id: string): Promise<ApiResponse<PermissionWithDetails>> {
		return permissionsClient.get(`/${id}`);
	},

	/**
	 * Create permission
	 */
	async createPermission(data: CreatePermissionRequest): Promise<ApiResponse<PermissionWithDetails>> {
		return permissionsClient.post('', data);
	},

	/**
	 * Update permission
	 */
	async updatePermission(id: string, data: UpdatePermissionRequest): Promise<ApiResponse<PermissionWithDetails>> {
		return permissionsClient.put(`/${id}`, data);
	},

	/**
	 * Activate permission
	 */
	async activatePermission(id: string): Promise<ApiResponse<PermissionWithDetails>> {
		return permissionsClient.put(`/${id}/activate`);
	},

	/**
	 * Deactivate permission
	 */
	async deactivatePermission(id: string): Promise<ApiResponse<PermissionWithDetails>> {
		return permissionsClient.put(`/${id}/deactivate`);
	},

	/**
	 * Delete permission
	 */
	async deletePermission(id: string): Promise<ApiResponse<void>> {
		return permissionsClient.delete(`/${id}`);
	},

	/**
	 * Create default system permissions
	 */
	async seedDefaultPermissions(): Promise<ApiResponse<PermissionWithDetails[]>> {
		return permissionsClient.post('seed-defaults');
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

		return usersClient.get(`?${searchParams.toString()}`);
	},

	/**
	 * Get user by ID
	 */
	async getUserById(id: string): Promise<ApiResponse<User>> {
		return usersClient.get(`/${id}`);
	},

	/**
	 * Update user
	 */
	async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
		return usersClient.put(`/${id}`, data);
	},

	/**
	 * Get user roles
	 */
	async getUserRoles(userId: string): Promise<ApiResponse<UserRoleAssignment[]>> {
		return usersClient.get(`/${userId}/roles`);
	},

	/**
	 * Activate user
	 */
	async activateUser(id: string): Promise<ApiResponse<User>> {
		return usersClient.put(`/${id}/activate`);
	},

	/**
	 * Deactivate user
	 */
	async deactivateUser(id: string): Promise<ApiResponse<User>> {
		return usersClient.put(`/${id}/deactivate`);
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

		return auditClient.get(`logs?${searchParams.toString()}`);
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
