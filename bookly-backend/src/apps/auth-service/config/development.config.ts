import { registerAs } from '@nestjs/config';

export default registerAs('development', () => ({
  // Development-specific overrides
  service: {
    port: 3001,
    host: 'localhost',
  },

  // Development Database
  database: {
    url: 'mongodb://localhost:27017/bookly-auth-dev',
    logging: true,
    synchronize: false, // Use migrations instead
  },

  // Development Redis
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
  },

  // Development RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.auth.dev',
    queue: 'auth-service-dev',
  },

  // Development Logging
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: true,
    filePath: './logs/auth-service-dev.log',
  },

  // Development Security (less strict)
  security: {
    bcryptRounds: 8, // Faster for development
    maxLoginAttempts: 10,
    lockoutDuration: 300000, // 5 minutes
  },

  // Development JWT (shorter expiry for testing)
  jwt: {
    secret: 'dev-secret-key-change-in-production',
    expiresIn: '1h',
    refreshExpiresIn: '24h',
  },

  // Development CORS (more permissive)
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
    credentials: true,
  },

  // Development Rate Limiting (more permissive)
  rateLimit: {
    ttl: 60,
    limit: 1000,
  },

  // Development Monitoring
  monitoring: {
    sentry: {
      dsn: null, // Disable in development
      environment: 'development',
    },
    openTelemetry: {
      enabled: false, // Disable in development
    },
  },
}));
