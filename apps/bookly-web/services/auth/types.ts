/**
 * Authentication service types
 */

export interface LoginRequest {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface RegisterRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	acceptTerms: boolean;
}

export interface LoginResponse {
	access_token: string;
	user: User;
	token: string;
	refreshToken: string;
	expiresIn: number;
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	avatar?: string;
	roles: Role[];
	permissions: Permission[];
	isEmailVerified: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Role {
	id: string;
	name: string;
	displayName: string;
	description?: string;
	permissions: Permission[];
}

export interface Permission {
	id: string;
	resource: string;
	action: string;
	scope?: string;
	conditions?: Record<string, unknown>;
	name?: string;
	description?: string;
}

// API Response types (backend response structure)
export interface ApiUserResponse {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string;
	profilePicture?: string;
	roles?: ApiRoleResponse[];
	permissions?: ApiPermissionResponse[];
	isEmailVerified?: boolean;
	email_verified?: boolean;
	isActive?: boolean;
	active?: boolean;
	createdAt?: string;
	created_at?: string;
	updatedAt?: string;
	updated_at?: string;
}

export interface ApiRoleResponse {
	id: string;
	name: string;
	displayName?: string;
	display_name?: string;
	description?: string;
	permissions?: ApiPermissionResponse[];
}

export interface ApiPermissionResponse {
	id: string;
	resource: string;
	action: string;
	scope?: string;
	conditions?: Record<string, unknown>;
}

export interface ApiLoginResponse {
	user: ApiUserResponse;
	token?: string;
	accessToken?: string;
	refreshToken?: string;
	refresh_token?: string;
	expiresIn?: number;
	expires_in?: number;
}

// Role management types
export interface CreateRoleRequest {
	name: string;
	description?: string;
	category?: string;
	permissions?: string[];
}

export interface UpdateRoleRequest {
	name?: string;
	description?: string;
	category?: string;
	permissions?: string[];
}

export interface RoleWithPermissions extends Role {
	userCount?: number;
	createdAt: string;
	updatedAt: string;
	createdBy?: string;
	isPredefined: boolean;
	isActive: boolean;
}

// Permission management types
export interface CreatePermissionRequest {
	name: string;
	resource: string;
	action: string;
	scope?: string;
	description?: string;
	conditions?: Record<string, unknown>;
}

export interface UpdatePermissionRequest {
	name?: string;
	resource?: string;
	action?: string;
	scope?: string;
	description?: string;
	conditions?: Record<string, unknown>;
}

export interface PermissionWithDetails extends Permission {
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	roleCount?: number;
	scope: string;
}

// User role assignment types
export interface AssignRoleRequest {
	userId: string;
	roleId: string;
	programId?: string;
}

export interface UserRoleAssignment {
	id: string;
	userId: string;
	roleId: string;
	programId?: string;
	assignedAt: string;
	assignedBy?: string;
	isActive: boolean;
	user?: User;
	role?: Role;
}

// SSO types
export interface SSOLoginResponse {
	user: User;
	token: string;
	refreshToken: string;
	expiresIn: number;
	isFirstLogin: boolean;
}

export interface SSOProvider {
	id: string;
	name: string;
	type: 'google' | 'microsoft' | 'saml';
	isEnabled: boolean;
	configuration?: Record<string, unknown>;
}

// Audit types
export interface AuthAuditLog {
	id: string;
	userId?: string;
	action: string;
	resource: string;
	details?: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
	createdAt: string;
}
