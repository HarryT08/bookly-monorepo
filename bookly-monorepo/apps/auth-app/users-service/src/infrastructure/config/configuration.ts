import {
  DatabaseName,
  DEFAULT_JWT_ACCESS_EXPIRATION,
  DEFAULT_JWT_ACCESS_SECRET,
  DEFAULT_JWT_REFRESH_EXPIRATION,
  DEFAULT_JWT_REFRESH_SECRET,
  DEFAULT_MONGODB_URI,
  EnvVariable,
  Environment,
  Language,
  ServicePort,
  ServiceUrl
} from '@bookly-monorepo/common';
import {
  DEFAULT_RABBITMQ_URL,
  EventExchange,
  ServiceName
} from '@bookly-monorepo/event-bus';

/**
 * Configuraciu00f3n para el servicio de usuarios
 */
export default () => ({
  app: {
    name: ServiceName.USERS,
    port: parseInt(process.env[EnvVariable.USERS_SERVICE_PORT] ?? ServicePort.USERS.toString(), 10),
    environment: process.env[EnvVariable.NODE_ENV] ?? Environment.DEVELOPMENT,
    defaultLanguage: process.env[EnvVariable.DEFAULT_LANGUAGE] ?? Language.SPANISH,
  },
  database: {
    uri: process.env[EnvVariable.MONGODB_URI] ?? DEFAULT_MONGODB_URI,
    dbName: DatabaseName.USERS,
  },
  jwt: {
    accessSecret: process.env[EnvVariable.JWT_ACCESS_SECRET] ?? DEFAULT_JWT_ACCESS_SECRET,
    accessExpiration: process.env[EnvVariable.JWT_ACCESS_EXPIRATION] ?? DEFAULT_JWT_ACCESS_EXPIRATION,
    refreshSecret: process.env[EnvVariable.JWT_REFRESH_SECRET] ?? DEFAULT_JWT_REFRESH_SECRET,
    refreshExpiration: process.env[EnvVariable.JWT_REFRESH_EXPIRATION] ?? DEFAULT_JWT_REFRESH_EXPIRATION,
  },
  services: {
    authService: process.env[EnvVariable.AUTH_SERVICE_URL] ?? ServiceUrl.AUTH,
    rolesService: process.env[EnvVariable.ROLES_SERVICE_URL] ?? ServiceUrl.ROLES,
  },
  rabbitmq: {
    url: process.env[EnvVariable.RABBITMQ_URI] ?? DEFAULT_RABBITMQ_URL,
    serviceName: ServiceName.USERS,
    authExchange: process.env[EnvVariable.RABBITMQ_USERS_EXCHANGE] ?? EventExchange.USERS,
  },
});
