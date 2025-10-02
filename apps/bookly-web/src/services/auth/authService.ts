import { api, buildServiceUrl } from '../http/client';
import type { ApiResponse } from '../http/types';
import { SERVICES, AUTH_ENDPOINTS } from '@/services/config/services';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  GoogleSSORequest,
} from './types';

const AUTH_SERVICE = SERVICES.AUTH;

export const authService = {
  // Traditional Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.LOGIN),
      credentials
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Login failed');
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post<User>(
      buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.REGISTER),
      userData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Registration failed');
  },

  async logout(): Promise<void> {
    const response = await api.post(buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.LOGOUT));
    
    if (!response.success) {
      throw new Error(response.message || 'Logout failed');
    }
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookly_token');
      localStorage.removeItem('bookly_refresh_token');
      localStorage.removeItem('bookly_user');
    }
  },

  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>(
      buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.REFRESH),
      refreshTokenData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Token refresh failed');
  },

  async getUserProfile(): Promise<User> {
    const response = await api.get<User>(
      buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.PROFILE)
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get user profile');
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await api.patch<User>(
      buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.PROFILE),
      profileData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to update profile');
  },

  // Password Management
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<void> {
    const response = await api.post(
      buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.PASSWORD_RESET),
      forgotData
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset request failed');
    }
  },

  async resetPassword(resetData: ResetPasswordRequest): Promise<void> {
    const response = await api.post(
      buildServiceUrl(AUTH_SERVICE, 'reset-password/confirm'),
      resetData
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  },

  async changePassword(changeData: ChangePasswordRequest): Promise<void> {
    await api.post(
      buildServiceUrl(AUTH_SERVICE, 'change-password'),
      changeData
    );
  },

  // Google SSO
  async googleLogin(googleData: GoogleSSORequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      buildServiceUrl(AUTH_SERVICE, AUTH_ENDPOINTS.OAUTH_GOOGLE),
      googleData
    );
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Google login failed');
  },

  // Utility methods
  async verifyToken(): Promise<boolean> {
    try {
      await this.getUserProfile();
      return true;
    } catch (error) {
      return false;
    }
  },

  async resendVerificationEmail(): Promise<void> {
    await api.post(buildServiceUrl(AUTH_SERVICE, 'resend-verification'));
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post(buildServiceUrl(AUTH_SERVICE, 'verify-email'), { token });
  },
};

export default authService;
