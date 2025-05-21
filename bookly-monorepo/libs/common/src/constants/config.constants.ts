/**
 * Constantes comunes para la configuraciu00f3n de los servicios
 */

// Estados de la aplicaciu00f3n
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// Idiomas disponibles
export enum Language {
  SPANISH = 'es',
  ENGLISH = 'en',
}

// Valores por defecto para MongoDB
export const DEFAULT_MONGODB_URI = 'mongodb://user:pass@localhost:27017/';

// Nombres de bases de datos
export enum DatabaseName {
  AUTH = 'bookly-auth',
  USERS = 'bookly-users',
  ROLES = 'bookly-roles',
}

// Valores por defecto para JWT
export const DEFAULT_JWT_ACCESS_EXPIRATION = '1h';
export const DEFAULT_JWT_REFRESH_EXPIRATION = '7d';
export const DEFAULT_JWT_ACCESS_SECRET = 'bookly-access-secret';
export const DEFAULT_JWT_REFRESH_SECRET = 'bookly-refresh-secret';

// Valores por defecto para los servicios
export enum ServicePort {
  AUTH = 3000,
  USERS = 3001,
  ROLES = 3002,
}

// URLs por defecto para los servicios
export enum ServiceUrl {
  AUTH = 'http://localhost:3000',
  USERS = 'http://localhost:3001',
  ROLES = 'http://localhost:3002',
}

// Nombres de variables de entorno
export enum EnvVariable {
  // General
  NODE_ENV = 'NODE_ENV',
  DEFAULT_LANGUAGE = 'DEFAULT_LANGUAGE',
  
  // Database
  MONGODB_URI = 'MONGODB_URI',
  
  // JWT
  JWT_ACCESS_SECRET = 'JWT_ACCESS_SECRET',
  JWT_ACCESS_EXPIRATION = 'JWT_ACCESS_EXPIRATION',
  JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET',
  JWT_REFRESH_EXPIRATION = 'JWT_REFRESH_EXPIRATION',
  
  // RabbitMQ
  RABBITMQ_URI = 'RABBITMQ_URI',
  RABBITMQ_AUTH_EXCHANGE = 'RABBITMQ_AUTH_EXCHANGE',
  RABBITMQ_USERS_EXCHANGE = 'RABBITMQ_USERS_EXCHANGE',
  RABBITMQ_ROLES_EXCHANGE = 'RABBITMQ_ROLES_EXCHANGE',
  
  // Service ports
  PORT = 'PORT',
  AUTH_SERVICE_PORT = 'AUTH_SERVICE_PORT',
  USERS_SERVICE_PORT = 'USERS_SERVICE_PORT',
  ROLES_SERVICE_PORT = 'ROLES_SERVICE_PORT',
  
  // Service URLs
  AUTH_SERVICE_URL = 'AUTH_SERVICE_URL',
  USERS_SERVICE_URL = 'USERS_SERVICE_URL',
  ROLES_SERVICE_URL = 'ROLES_SERVICE_URL',
}
