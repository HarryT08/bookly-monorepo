import type { User, LoginResponse, Role, Permission } from './types';

/**
 * Data transformation models for auth services
 */

/**
 * Transform API user response to frontend User model
 */
export function transformUser(apiUser: any): User {
	return {
		id: apiUser.id,
		email: apiUser.email,
		firstName: apiUser.firstName || apiUser.first_name,
		lastName: apiUser.lastName || apiUser.last_name,
		fullName: `${apiUser.firstName || apiUser.first_name} ${apiUser.lastName || apiUser.last_name}`,
		avatar: apiUser.avatar || apiUser.profilePicture,
		roles: apiUser.roles?.map(transformRole) || [],
		permissions: apiUser.permissions?.map(transformPermission) || [],
		isEmailVerified: apiUser.isEmailVerified || apiUser.email_verified || false,
		isActive: apiUser.isActive || apiUser.active || true,
		createdAt: apiUser.createdAt || apiUser.created_at,
		updatedAt: apiUser.updatedAt || apiUser.updated_at
	};
}

/**
 * Transform API role response to frontend Role model
 */
export function transformRole(apiRole: any): Role {
	return {
		id: apiRole.id,
		name: apiRole.name,
		displayName: apiRole.displayName || apiRole.display_name || apiRole.name,
		description: apiRole.description,
		permissions: apiRole.permissions?.map(transformPermission) || []
	};
}

/**
 * Transform API permission response to frontend Permission model
 */
export function transformPermission(apiPermission: any): Permission {
	return {
		id: apiPermission.id,
		resource: apiPermission.resource,
		action: apiPermission.action,
		scope: apiPermission.scope,
		conditions: apiPermission.conditions
	};
}

/**
 * Transform API login response to frontend LoginResponse model
 */
export function transformLoginResponse(apiResponse: any): LoginResponse {
	return {
		user: transformUser(apiResponse.user),
		token: apiResponse.token || apiResponse.accessToken,
		refreshToken: apiResponse.refreshToken || apiResponse.refresh_token,
		expiresIn: apiResponse.expiresIn || apiResponse.expires_in || 3600
	};
}
