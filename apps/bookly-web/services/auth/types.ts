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
