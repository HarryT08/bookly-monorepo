/**
 * Constantes de la API
 * Este archivo contiene constantes relacionadas con la configuraciu00f3n de la API
 */

export const API_CONSTANTS = {
  // Prefijo global para todas las rutas de la API
  GLOBAL_PREFIX: 'api',
  
  // Rutas base para los diferentes recursos
  ROUTES: {
    AUTH: 'auth',
    LOGIN: 'login',
    REGISTER: 'register',
    REFRESH: 'refresh',
    LOGOUT: 'logout',
    PROFILE: 'profile',
    VERIFY: 'verify',
    USERS: 'users',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
  },
  
  // Headers personalizados
  HEADERS: {
    AUTH_TOKEN: 'X-Auth-Token',
    REFRESH_TOKEN: 'X-Refresh-Token',
    LANGUAGE: 'X-Lang',
  },
  
  // Mensajes de estado HTTP personalizados
  STATUS_MESSAGES: {
    UNAUTHORIZED: 'No estás autorizado para realizar esta acciu00f3n',
    FORBIDDEN: 'No tienes permisos para acceder a este recurso',
    NOT_FOUND: 'El recurso solicitado no existe',
    INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  },
};
