/**
 * Tipos para la autenticaciu00f3n
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * Datos para el registro de usuarios
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Datos para el inicio de sesiu00f3n
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Respuesta de la autenticaciu00f3n
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Datos de usuario
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Token decodificado
 */
export interface DecodedToken {
  sub: string; // ID del usuario
  email: string;
  role: UserRole;
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
