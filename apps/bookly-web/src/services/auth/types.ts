export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: Role[];
  permissions: Permission[];
  lastLoginAt?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  categoryCode: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope?: string;
  conditions?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  access_token: string;  // Backend sends access_token with underscore
  refreshToken?: string; // Optional since backend might not send it
  expiresIn?: number;    // Optional since backend might not send it
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export interface GoogleSSORequest {
  code: string;
  redirectUri: string;
}

export interface AuthServiceError {
  code: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  httpCode: number;
}
