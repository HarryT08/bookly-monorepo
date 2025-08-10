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
