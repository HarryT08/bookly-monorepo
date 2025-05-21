import {
  DatabaseName,
  DEFAULT_JWT_ACCESS_EXPIRATION,
  DEFAULT_JWT_ACCESS_SECRET,
  DEFAULT_JWT_REFRESH_EXPIRATION,
  DEFAULT_JWT_REFRESH_SECRET,
  DEFAULT_MONGODB_URI,
  EnvVariable,
  Environment,
  ServicePort
} from '@bookly-monorepo/common';
import {
  DEFAULT_RABBITMQ_URL,
  EventExchange,
  ServiceName
} from '@bookly-monorepo/event-bus';

/**
 * Configuraciu00f3n para el servicio de autenticaciu00f3n
 */
export default () => ({
  // Servidor
  port: parseInt(process.env[EnvVariable.PORT] ?? process.env[EnvVariable.AUTH_SERVICE_PORT] ?? ServicePort.AUTH.toString(), 10),
  nodeEnv: process.env[EnvVariable.NODE_ENV] ?? Environment.DEVELOPMENT,

  // MongoDB
  database: {
    uri: process.env[EnvVariable.MONGODB_URI] ?? DEFAULT_MONGODB_URI,
    dbName: DatabaseName.AUTH,
  },

  // JWT
  jwt: {
    accessSecret: process.env[EnvVariable.JWT_ACCESS_SECRET] ?? DEFAULT_JWT_ACCESS_SECRET,
    refreshSecret: process.env[EnvVariable.JWT_REFRESH_SECRET] ?? DEFAULT_JWT_REFRESH_SECRET,
    accessExpiration: process.env[EnvVariable.JWT_ACCESS_EXPIRATION] ?? DEFAULT_JWT_ACCESS_EXPIRATION,
    refreshExpiration: process.env[EnvVariable.JWT_REFRESH_EXPIRATION] ?? DEFAULT_JWT_REFRESH_EXPIRATION,
  },

  // RabbitMQ
  rabbitmq: {
    url: process.env[EnvVariable.RABBITMQ_URI] ?? DEFAULT_RABBITMQ_URL,
    serviceName: ServiceName.AUTH,
    authExchange: process.env[EnvVariable.RABBITMQ_AUTH_EXCHANGE] ?? EventExchange.AUTH,
  },
});
