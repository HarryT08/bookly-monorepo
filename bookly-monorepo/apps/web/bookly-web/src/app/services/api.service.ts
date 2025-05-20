/**
 * Servicio base para realizar peticiones HTTP al API Gateway
 */

import { AuthResponse } from '../types/auth.types';

// URL base del API Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/**
 * Opciones por defecto para las peticiones HTTP
 */
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Obtiene el token de autenticaciu00f3n del localStorage (solo en cliente)
 */
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Au00f1ade el token de autenticaciu00f3n a las cabeceras de una peticiu00f3n
 */
const withAuth = (options: RequestInit = {}): RequestInit => {
  const token = getAuthToken();

  if (!token) {
    return options;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Procesa la respuesta de una peticiu00f3n HTTP
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? 'Ocurriu00f3 un error en la peticiu00f3n');
  }

  // Para respuestas vacu00edas como 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

/**
 * Servicios para realizar peticiones HTTP al API Gateway
 */
export const ApiService = {
  /**
   * Realiza una peticiu00f3n GET
   */
  get: async <T>(endpoint: string, requireAuth = true): Promise<T> => {
    const options = requireAuth ? withAuth(defaultOptions) : defaultOptions;
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: 'GET',
    });

    return handleResponse<T>(response);
  },

  /**
   * Realiza una peticiu00f3n POST
   */
  post: async <T>(endpoint: string, data?: any, requireAuth = true): Promise<T> => {
    const options = requireAuth ? withAuth(defaultOptions) : defaultOptions;
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  /**
   * Realiza una peticiu00f3n PUT
   */
  put: async <T>(endpoint: string, data: any, requireAuth = true): Promise<T> => {
    const options = requireAuth ? withAuth(defaultOptions) : defaultOptions;
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
  },

  /**
   * Realiza una peticiu00f3n DELETE
   */
  delete: async <T>(endpoint: string, requireAuth = true): Promise<T> => {
    const options = requireAuth ? withAuth(defaultOptions) : defaultOptions;
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
    });

    return handleResponse<T>(response);
  },

  /**
   * Configura el token de autenticaciu00f3n en localStorage
   */
  setAuthToken: (authResponse: AuthResponse): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', authResponse.accessToken);
      localStorage.setItem('refresh_token', authResponse.refreshToken);
      localStorage.setItem('token_expiry', (Date.now() + authResponse.expiresIn * 1000).toString());
    }
  },

  /**
   * Elimina el token de autenticaciu00f3n de localStorage
   */
  clearAuthToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expiry');
    }
  },
};
