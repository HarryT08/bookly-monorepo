/**
 * Configuraciu00f3n para el servicio de autenticaciu00f3n
 */
export default () => ({
  // Servidor
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // MongoDB
  database: {
    uri: process.env.MONGODB_URI ?? 'mongodb://user:pass@localhost:27017/',
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'bookly-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'bookly-refresh-secret',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION ?? '1h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
  },

  // RabbitMQ
  rabbitmq: {
    uri: process.env.RABBITMQ_URI ?? 'amqp://localhost:5672',
    authExchange: 'auth_events',
  },
});
