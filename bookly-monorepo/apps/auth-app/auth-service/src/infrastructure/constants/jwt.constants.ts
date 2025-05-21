/**
 * Constantes relacionadas con JWT
 * Este archivo contiene constantes para la configuración de JWT
 */

import { JwtConstants } from '@bookly-monorepo/common';

export const JWT_CONSTANTS = {
  // Secretos
  ACCESS_SECRET_ENV: JwtConstants.JWT_ACCESS_SECRET_ENV,
  REFRESH_SECRET_ENV: JwtConstants.JWT_REFRESH_SECRET_ENV,
  
  // Tiempos de expiración
  ACCESS_EXPIRATION_ENV: JwtConstants.JWT_ACCESS_EXPIRATION_ENV,
  REFRESH_EXPIRATION_ENV: JwtConstants.JWT_REFRESH_EXPIRATION_ENV,
  
  // Valores por defecto para tiempos de expiración
  DEFAULT_ACCESS_EXPIRATION: JwtConstants.JWT_DEFAULT_ACCESS_EXPIRATION,
  DEFAULT_REFRESH_EXPIRATION: JwtConstants.JWT_DEFAULT_REFRESH_EXPIRATION,
  
  // Tipos de tokens
  AUTH_TOKEN_TYPE: 'Bearer',
  
  // Claves para los payloads
  PAYLOAD_SUBJECT: 'sub',
  PAYLOAD_EMAIL: 'email',
  PAYLOAD_ROLE: 'role',
};
