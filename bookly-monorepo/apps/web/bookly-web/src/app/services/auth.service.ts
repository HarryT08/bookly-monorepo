/**
 * Servicios para la autenticaciu00f3n
 */

import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth.types';

export const AuthService = {
  /**
   * Registra un nuevo usuario
   */
  register: async (userData: RegisterRequest): Promise<User> => {
    return ApiService.post<User>('/auth/register', userData, false);
  },

  /**
   * Inicia sesiu00f3n de un usuario
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await ApiService.post<AuthResponse>('/auth/login', credentials, false);
    ApiService.setAuthToken(response);
    return response;
  },

  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile: async (): Promise<User> => {
    return ApiService.get<User>('/auth/profile');
  },

  /**
   * Actualiza el perfil del usuario actual
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return ApiService.put<User>('/auth/profile', userData);
  },

  /**
   * Refresca el token de acceso usando el token de refresco
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No hay token de refresco disponible');
    }

    const response = await ApiService.post<AuthResponse>(
      '/auth/refresh-token',
      { refreshToken },
      false
    );
    ApiService.setAuthToken(response);
    return response;
  },

  /**
   * Cierra la sesiu00f3n del usuario actual
   */
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await ApiService.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Error al cerrar sesiu00f3n en el servidor:', error);
      }
    }
    ApiService.clearAuthToken();
  },

  /**
   * Comprueba si hay un usuario autenticado actualmente
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('token_expiry');

    if (!token || !expiry) {
      return false;
    }

    return Date.now() < parseInt(expiry, 10);
  },
};
