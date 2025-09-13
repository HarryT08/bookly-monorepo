import { api, buildServiceUrl } from '../http/client';
import type { ApiResponse } from '../http/types';
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

const AUTH_SERVICE = 'auth';

export const authService = {
  // Traditional Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      buildServiceUrl(AUTH_SERVICE, 'login'),
      credentials
    );
    return response as any as LoginResponse;
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post<User>(
      buildServiceUrl(AUTH_SERVICE, 'register'),
      userData
    );
    return response as any as User;
  },

  async logout(): Promise<void> {
    await api.post(buildServiceUrl(AUTH_SERVICE, 'logout'));
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookly_token');
      localStorage.removeItem('bookly_refresh_token');
      localStorage.removeItem('bookly_user');
    }
  },

  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>(
      buildServiceUrl(AUTH_SERVICE, 'refresh'),
      refreshTokenData
    );
    return response as any as RefreshTokenResponse;
  },

  async getUserProfile(): Promise<User> {
    const response = await api.get<User>(
      buildServiceUrl(AUTH_SERVICE, 'profile')
    );
    return response as any as User;
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await api.patch<User>(
      buildServiceUrl(AUTH_SERVICE, 'profile'),
      profileData
    );
    return response as any as User;
  },

  // Password Management
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<void> {
    await api.post(
      buildServiceUrl(AUTH_SERVICE, 'forgot-password'),
      forgotData
    );
  },

  async resetPassword(resetData: ResetPasswordRequest): Promise<void> {
    await api.post(
      buildServiceUrl(AUTH_SERVICE, 'reset-password'),
      resetData
    );
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
      buildServiceUrl('oauth', 'google'),
      googleData
    );
    return response.data!;
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
