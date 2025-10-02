import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  // Service Configuration
  service: {
    name: 'auth-service',
    port: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 3001,
    host: process.env.AUTH_SERVICE_HOST || 'localhost',
    version: process.env.AUTH_SERVICE_VERSION || '1.0.0',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/oauth/google/callback',
    },
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 900000, // 15 minutes
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10) || 3600000, // 1 hour
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/bookly-auth',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.auth',
    queue: process.env.RABBITMQ_QUEUE || 'auth-service',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/auth-service.log',
  },

  // Monitoring Configuration
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
    },
    openTelemetry: {
      enabled: process.env.OTEL_ENABLED === 'true',
      endpoint: process.env.OTEL_ENDPOINT || 'http://localhost:4317',
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
}));
