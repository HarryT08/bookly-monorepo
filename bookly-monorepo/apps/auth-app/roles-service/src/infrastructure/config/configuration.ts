import {
  DatabaseName,
  DEFAULT_JWT_ACCESS_EXPIRATION,
  DEFAULT_JWT_ACCESS_SECRET,
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
 * Configuraciu00f3n para el servicio de roles
 */
export default () => ({
  app: {
    name: ServiceName.ROLES,
    port: parseInt(process.env[EnvVariable.ROLES_SERVICE_PORT] ?? ServicePort.ROLES.toString(), 10),
    environment: process.env[EnvVariable.NODE_ENV] ?? Environment.DEVELOPMENT,
    defaultLanguage: process.env[EnvVariable.DEFAULT_LANGUAGE] ?? Language.SPANISH,
  },
  database: {
    uri: process.env[EnvVariable.MONGODB_URI] ?? DEFAULT_MONGODB_URI,
    dbName: DatabaseName.ROLES,
  },
  jwt: {
    accessSecret: process.env[EnvVariable.JWT_ACCESS_SECRET] ?? DEFAULT_JWT_ACCESS_SECRET,
    accessExpiration: process.env[EnvVariable.JWT_ACCESS_EXPIRATION] ?? DEFAULT_JWT_ACCESS_EXPIRATION,
  },
  services: {
    authService: process.env[EnvVariable.AUTH_SERVICE_URL] ?? ServiceUrl.AUTH,
    usersService: process.env[EnvVariable.USERS_SERVICE_URL] ?? ServiceUrl.USERS,
  },
  rabbitmq: {
    url: process.env[EnvVariable.RABBITMQ_URI] ?? DEFAULT_RABBITMQ_URL,
    serviceName: ServiceName.ROLES,
    authExchange: process.env[EnvVariable.RABBITMQ_ROLES_EXCHANGE] ?? EventExchange.ROLES,
  },
});
