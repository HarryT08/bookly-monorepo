/**
 * Auth Service Error Codes
 * Enumerable de errores específicos del microservicio de autenticación
 */

export enum AuthErrorCode {
  // Authentication Errors (AUTH-001 to AUTH-100)
  INVALID_CREDENTIALS = 'AUTH-001',
  USER_NOT_FOUND = 'AUTH-002',
  USER_BLOCKED = 'AUTH-003',
  ACCOUNT_LOCKED = 'AUTH-004',
  EMAIL_NOT_VERIFIED = 'AUTH-005',
  INVALID_TOKEN = 'AUTH-006',
  TOKEN_EXPIRED = 'AUTH-007',
  REFRESH_TOKEN_INVALID = 'AUTH-008',
  SESSION_EXPIRED = 'AUTH-009',
  MAX_LOGIN_ATTEMPTS = 'AUTH-010',

  // Registration Errors (AUTH-101 to AUTH-200)
  USER_ALREADY_EXISTS = 'AUTH-101',
  INVALID_EMAIL_FORMAT = 'AUTH-102',
  WEAK_PASSWORD = 'AUTH-103',
  EMAIL_DOMAIN_NOT_ALLOWED = 'AUTH-104',
  REGISTRATION_DISABLED = 'AUTH-105',
  VERIFICATION_CODE_INVALID = 'AUTH-106',
  VERIFICATION_CODE_EXPIRED = 'AUTH-107',

  // Role & Permission Errors (AUTH-201 to AUTH-300)
  INSUFFICIENT_PERMISSIONS = 'AUTH-201',
  ROLE_NOT_FOUND = 'AUTH-202',
  PERMISSION_NOT_FOUND = 'AUTH-203',
  ROLE_ALREADY_EXISTS = 'AUTH-204',
  PERMISSION_ALREADY_EXISTS = 'AUTH-205',
  CANNOT_DELETE_SYSTEM_ROLE = 'AUTH-206',
  CANNOT_MODIFY_OWN_ROLE = 'AUTH-207',
  ROLE_IN_USE = 'AUTH-208',

  // OAuth/SSO Errors (AUTH-301 to AUTH-400)
  OAUTH_PROVIDER_ERROR = 'AUTH-301',
  OAUTH_CODE_INVALID = 'AUTH-302',
  OAUTH_STATE_MISMATCH = 'AUTH-303',
  SSO_NOT_CONFIGURED = 'AUTH-304',
  GOOGLE_SSO_ERROR = 'AUTH-305',
  OAUTH_USER_NOT_FOUND = 'AUTH-306',
  DOMAIN_NOT_ALLOWED_SSO = 'AUTH-307',

  // 2FA Errors (AUTH-401 to AUTH-500)
  TWO_FA_NOT_ENABLED = 'AUTH-401',
  TWO_FA_CODE_INVALID = 'AUTH-402',
  TWO_FA_CODE_EXPIRED = 'AUTH-403',
  TWO_FA_SETUP_REQUIRED = 'AUTH-404',
  TWO_FA_BACKUP_CODE_INVALID = 'AUTH-405',
  TWO_FA_ALREADY_ENABLED = 'AUTH-406',

  // Password Reset Errors (AUTH-501 to AUTH-600)
  RESET_TOKEN_INVALID = 'AUTH-501',
  RESET_TOKEN_EXPIRED = 'AUTH-502',
  RESET_EMAIL_NOT_SENT = 'AUTH-503',
  PASSWORD_SAME_AS_CURRENT = 'AUTH-504',
  RESET_ATTEMPTS_EXCEEDED = 'AUTH-505',

  // General Errors (AUTH-900 to AUTH-999)
  SERVICE_UNAVAILABLE = 'AUTH-900',
  RATE_LIMIT_EXCEEDED = 'AUTH-901',
  VALIDATION_ERROR = 'AUTH-902',
  INTERNAL_ERROR = 'AUTH-999',
}

export const AuthErrorMessages: Record<AuthErrorCode, string> = {
  // Authentication
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Credenciales inválidas. Verifica tu email y contraseña.',
  [AuthErrorCode.USER_NOT_FOUND]: 'Usuario no encontrado en el sistema.',
  [AuthErrorCode.USER_BLOCKED]: 'Tu cuenta ha sido bloqueada. Contacta al administrador.',
  [AuthErrorCode.ACCOUNT_LOCKED]: 'Cuenta bloqueada por múltiples intentos fallidos.',
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Debes verificar tu email antes de iniciar sesión.',
  [AuthErrorCode.INVALID_TOKEN]: 'Token de acceso inválido.',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  [AuthErrorCode.REFRESH_TOKEN_INVALID]: 'Token de renovación inválido.',
  [AuthErrorCode.SESSION_EXPIRED]: 'Tu sesión ha expirado.',
  [AuthErrorCode.MAX_LOGIN_ATTEMPTS]: 'Máximo número de intentos de login alcanzado.',

  // Registration
  [AuthErrorCode.USER_ALREADY_EXISTS]: 'Ya existe un usuario con ese email.',
  [AuthErrorCode.INVALID_EMAIL_FORMAT]: 'Formato de email inválido.',
  [AuthErrorCode.WEAK_PASSWORD]: 'La contraseña no cumple con los requisitos de seguridad.',
  [AuthErrorCode.EMAIL_DOMAIN_NOT_ALLOWED]: 'El dominio del email no está permitido.',
  [AuthErrorCode.REGISTRATION_DISABLED]: 'El registro de usuarios está deshabilitado.',
  [AuthErrorCode.VERIFICATION_CODE_INVALID]: 'Código de verificación inválido.',
  [AuthErrorCode.VERIFICATION_CODE_EXPIRED]: 'Código de verificación expirado.',

  // Roles & Permissions
  [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: 'No tienes permisos suficientes para esta acción.',
  [AuthErrorCode.ROLE_NOT_FOUND]: 'Rol no encontrado.',
  [AuthErrorCode.PERMISSION_NOT_FOUND]: 'Permiso no encontrado.',
  [AuthErrorCode.ROLE_ALREADY_EXISTS]: 'Ya existe un rol con ese nombre.',
  [AuthErrorCode.PERMISSION_ALREADY_EXISTS]: 'Ya existe un permiso con ese nombre.',
  [AuthErrorCode.CANNOT_DELETE_SYSTEM_ROLE]: 'No se puede eliminar un rol del sistema.',
  [AuthErrorCode.CANNOT_MODIFY_OWN_ROLE]: 'No puedes modificar tu propio rol.',
  [AuthErrorCode.ROLE_IN_USE]: 'El rol está siendo utilizado y no puede eliminarse.',

  // OAuth/SSO
  [AuthErrorCode.OAUTH_PROVIDER_ERROR]: 'Error en el proveedor de OAuth.',
  [AuthErrorCode.OAUTH_CODE_INVALID]: 'Código de autorización OAuth inválido.',
  [AuthErrorCode.OAUTH_STATE_MISMATCH]: 'Estado de OAuth no coincide.',
  [AuthErrorCode.SSO_NOT_CONFIGURED]: 'SSO no está configurado correctamente.',
  [AuthErrorCode.GOOGLE_SSO_ERROR]: 'Error en la autenticación con Google.',
  [AuthErrorCode.OAUTH_USER_NOT_FOUND]: 'Usuario OAuth no encontrado.',
  [AuthErrorCode.DOMAIN_NOT_ALLOWED_SSO]: 'Dominio no permitido para SSO.',

  // 2FA
  [AuthErrorCode.TWO_FA_NOT_ENABLED]: 'La autenticación de dos factores no está habilitada.',
  [AuthErrorCode.TWO_FA_CODE_INVALID]: 'Código de verificación 2FA inválido.',
  [AuthErrorCode.TWO_FA_CODE_EXPIRED]: 'Código de verificación 2FA expirado.',
  [AuthErrorCode.TWO_FA_SETUP_REQUIRED]: 'Debes configurar la autenticación de dos factores.',
  [AuthErrorCode.TWO_FA_BACKUP_CODE_INVALID]: 'Código de respaldo 2FA inválido.',
  [AuthErrorCode.TWO_FA_ALREADY_ENABLED]: 'La autenticación de dos factores ya está habilitada.',

  // Password Reset
  [AuthErrorCode.RESET_TOKEN_INVALID]: 'Token de recuperación inválido.',
  [AuthErrorCode.RESET_TOKEN_EXPIRED]: 'Token de recuperación expirado.',
  [AuthErrorCode.RESET_EMAIL_NOT_SENT]: 'No se pudo enviar el email de recuperación.',
  [AuthErrorCode.PASSWORD_SAME_AS_CURRENT]: 'La nueva contraseña debe ser diferente a la actual.',
  [AuthErrorCode.RESET_ATTEMPTS_EXCEEDED]: 'Máximo número de intentos de recuperación excedido.',

  // General
  [AuthErrorCode.SERVICE_UNAVAILABLE]: 'Servicio de autenticación no disponible.',
  [AuthErrorCode.RATE_LIMIT_EXCEEDED]: 'Límite de peticiones excedido. Intenta más tarde.',
  [AuthErrorCode.VALIDATION_ERROR]: 'Error de validación en los datos enviados.',
  [AuthErrorCode.INTERNAL_ERROR]: 'Error interno del servicio de autenticación.',
};

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: any;
}

export class AuthException extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    public readonly details?: any,
  ) {
    super(AuthErrorMessages[code]);
    this.name = 'AuthException';
  }
}
