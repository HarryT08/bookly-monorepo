/**
 * Error handling utilities for Bookly API responses
 * Handles backend ResponseUtil error format and provides user-friendly messages
 */

import type { ApiError } from './types';
import { HTTP_STATUS, ERROR_TYPES } from '@/services/config/services';

// Error message translations (can be extended with i18n)
const ERROR_MESSAGES: Record<string | number, string> = {
  // HTTP Status based messages
  [HTTP_STATUS.BAD_REQUEST]: 'Solicitud inválida. Por favor, revisa los datos enviados.',
  [HTTP_STATUS.UNAUTHORIZED]: 'No autorizado. Por favor, inicia sesión nuevamente.',
  [HTTP_STATUS.FORBIDDEN]: 'Acceso prohibido. No tienes permisos para realizar esta acción.',
  [HTTP_STATUS.NOT_FOUND]: 'Recurso no encontrado.',
  [HTTP_STATUS.CONFLICT]: 'Conflicto en la operación. El recurso ya existe o hay datos duplicados.',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Los datos proporcionados no son válidos.',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Error interno del servidor. Por favor, intenta más tarde.',
  
  // Error type based messages
  [ERROR_TYPES.VALIDATION]: 'Error de validación en los datos enviados.',
  [ERROR_TYPES.AUTHENTICATION]: 'Error de autenticación. Por favor, verifica tus credenciales.',
  [ERROR_TYPES.AUTHORIZATION]: 'No tienes permisos suficientes para realizar esta acción.',
  [ERROR_TYPES.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ERROR_TYPES.CONFLICT]: 'Conflicto con el estado actual del recurso.',
  [ERROR_TYPES.SERVER_ERROR]: 'Error interno del servidor.',

  // Default messages
  default: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
  network: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  timeout: 'La operación ha tardado demasiado. Por favor, intenta nuevamente.',
};

// Resource-specific error messages
const RESOURCE_ERROR_MESSAGES = {
  resources: {
    not_found: 'El recurso solicitado no existe o ha sido eliminado.',
    creation_failed: 'No se pudo crear el recurso. Verifica que todos los datos sean correctos.',
    update_failed: 'No se pudo actualizar el recurso. Por favor, intenta nuevamente.',
    delete_failed: 'No se pudo eliminar el recurso. Puede que esté siendo utilizado.',
    import_failed: 'Error al importar recursos. Verifica el formato del archivo.',
  },
  auth: {
    invalid_credentials: 'Credenciales inválidas. Por favor, verifica tu email y contraseña.',
    account_locked: 'Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos.',
    token_expired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    email_not_verified: 'Tu email no ha sido verificado. Por favor, revisa tu bandeja de entrada.',
  },
  availability: {
    resource_not_available: 'El recurso no está disponible en el horario seleccionado.',
    reservation_conflict: 'Ya existe una reserva para este recurso en el horario solicitado.',
    invalid_time_range: 'El rango de tiempo seleccionado no es válido.',
  },
  stockpile: {
    approval_required: 'Esta operación requiere aprobación previa.',
    document_generation_failed: 'No se pudo generar el documento solicitado.',
    notification_failed: 'No se pudo enviar la notificación.',
  },
  reports: {
    generation_failed: 'No se pudo generar el reporte solicitado.',
    export_failed: 'No se pudo exportar los datos. Por favor, intenta nuevamente.',
    insufficient_data: 'No hay suficientes datos para generar el reporte.',
  }
} as const;

/**
 * Bookly API Error class
 */
export class BooklyApiError extends Error {
  public readonly code: string;
  public readonly type: string;
  public readonly httpCode: number;
  public readonly httpException: string;
  public readonly errors?: Record<string, string[]>;
  public readonly timestamp: string;
  public readonly path?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'BooklyApiError';
    this.code = error.code || 'UNKNOWN_ERROR';
    this.type = error.type || 'error';
    this.httpCode = error.http_code || error.statusCode || 500;
    this.httpException = error.http_exception || 'InternalServerError';
    this.errors = error.errors;
    this.timestamp = error.timestamp || new Date().toISOString();
    this.path = error.path;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    // Check for specific resource error messages
    const resourceType = this.getResourceTypeFromPath();
    if (resourceType && RESOURCE_ERROR_MESSAGES[resourceType]) {
      const resourceErrors = RESOURCE_ERROR_MESSAGES[resourceType] as Record<string, string>;
      
      // Check for specific error codes
      const errorKey = this.code.toLowerCase().replace(/[^a-z_]/g, '_');
      if (resourceErrors[errorKey]) {
        return resourceErrors[errorKey];
      }
    }

    // Check for HTTP status message
    if (this.httpCode && ERROR_MESSAGES[this.httpCode]) {
      return ERROR_MESSAGES[this.httpCode];
    }

    // Check for error type message
    if (this.type && ERROR_MESSAGES[this.type]) {
      return ERROR_MESSAGES[this.type];
    }

    // Return original message or default
    return this.message || ERROR_MESSAGES.default;
  }

  /**
   * Get validation error messages
   */
  getValidationErrors(): Record<string, string[]> {
    return this.errors || {};
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    const retryableCodes = [
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      408, // Request Timeout
      429, // Too Many Requests
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ];
    
    return retryableCodes.includes(this.httpCode);
  }

  /**
   * Check if error requires authentication
   */
  requiresAuth(): boolean {
    return this.httpCode === HTTP_STATUS.UNAUTHORIZED;
  }

  /**
   * Check if error is authorization related
   */
  isForbidden(): boolean {
    return this.httpCode === HTTP_STATUS.FORBIDDEN;
  }

  private getResourceTypeFromPath(): keyof typeof RESOURCE_ERROR_MESSAGES | null {
    if (!this.path) return null;
    
    if (this.path.includes('/resources')) return 'resources';
    if (this.path.includes('/auth')) return 'auth';
    if (this.path.includes('/availability')) return 'availability';
    if (this.path.includes('/stockpile')) return 'stockpile';
    if (this.path.includes('/reports')) return 'reports';
    
    return null;
  }
}

/**
 * Error handler utility functions
 */
export const errorHandler = {
  /**
   * Create BooklyApiError from various error types
   */
  createError(error: any): BooklyApiError {
    // If it's already a BooklyApiError, return as is
    if (error instanceof BooklyApiError) {
      return error;
    }

    // If it's an API error response
    if (error && typeof error === 'object' && 'message' in error) {
      return new BooklyApiError(error as ApiError);
    }

    // If it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new BooklyApiError({
        success: false,
        message: ERROR_MESSAGES.network,
        type: 'network_error',
        http_code: 0,
        http_exception: 'NetworkError'
      });
    }

    // If it's a timeout error
    if (error instanceof Error && error.message.includes('timeout')) {
      return new BooklyApiError({
        success: false,
        message: ERROR_MESSAGES.timeout,
        type: 'timeout_error',
        http_code: 408,
        http_exception: 'TimeoutError'
      });
    }

    // Generic error
    return new BooklyApiError({
      success: false,
      message: error?.message || ERROR_MESSAGES.default,
      type: 'unknown_error',
      http_code: 500,
      http_exception: 'InternalServerError'
    });
  },

  /**
   * Handle error and return user-friendly message
   */
  getErrorMessage(error: any): string {
    const apiError = this.createError(error);
    return apiError.getUserMessage();
  },

  /**
   * Handle error and return validation errors
   */
  getValidationErrors(error: any): Record<string, string[]> {
    const apiError = this.createError(error);
    return apiError.getValidationErrors();
  },

  /**
   * Check if error should trigger logout
   */
  shouldLogout(error: any): boolean {
    const apiError = this.createError(error);
    return apiError.requiresAuth() && 
           (apiError.code === 'TOKEN_EXPIRED' || apiError.code === 'INVALID_TOKEN');
  },

  /**
   * Check if operation should be retried
   */
  shouldRetry(error: any): boolean {
    const apiError = this.createError(error);
    return apiError.isRetryable();
  },

  /**
   * Log error for debugging (development only)
   */
  logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      const apiError = this.createError(error);
      console.group(`🚨 Bookly API Error ${context ? `(${context})` : ''}`);
      console.error('Message:', apiError.message);
      console.error('Code:', apiError.code);
      console.error('Type:', apiError.type);
      console.error('HTTP Status:', apiError.httpCode);
      console.error('Path:', apiError.path);
      if (apiError.errors) {
        console.error('Validation Errors:', apiError.errors);
      }
      console.error('Full Error:', error);
      console.groupEnd();
    }
  }
};

export default errorHandler;
