import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  // Production-specific overrides
  service: {
    port: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 3001,
    host: process.env.AUTH_SERVICE_HOST || '0.0.0.0',
  },

  // Production Database
  database: {
    url: process.env.DATABASE_URL,
    logging: false,
    synchronize: false, // Never use in production
    ssl: {
      rejectUnauthorized: false,
    },
  },

  // Production Redis
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },

  // Production RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.auth',
    queue: process.env.RABBITMQ_QUEUE || 'auth-service',
  },

  // Production Logging
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    enableConsole: false,
    enableFile: true,
    filePath: process.env.LOG_FILE_PATH || '/var/log/auth-service.log',
  },

  // Production Security (strict)
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 3,
    lockoutDuration: 1800000, // 30 minutes
    sessionTimeout: 3600000, // 1 hour
  },

  // Production JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Production CORS (restrictive)
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [],
    credentials: true,
  },

  // Production Rate Limiting (strict)
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 50,
  },

  // Production Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
    },
    openTelemetry: {
      enabled: process.env.OTEL_ENABLED === 'true',
      endpoint: process.env.OTEL_ENDPOINT,
    },
  },

  // Production OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
  },
}));
