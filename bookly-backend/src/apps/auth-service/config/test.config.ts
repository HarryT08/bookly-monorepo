import { registerAs } from '@nestjs/config';

export default registerAs('test', () => ({
  // Test-specific overrides
  service: {
    port: 3001,
    host: 'localhost',
  },

  // Test Database (in-memory or test DB)
  database: {
    url: 'mongodb://localhost:27017/bookly-auth-test',
    logging: false,
    synchronize: false,
    dropSchema: true, // Clean slate for each test run
  },

  // Test Redis (separate DB)
  redis: {
    host: 'localhost',
    port: 6379,
    db: 15, // Use a different DB for tests
  },

  // Test RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.auth.test',
    queue: 'auth-service-test',
  },

  // Test Logging (minimal)
  logging: {
    level: 'error', // Only log errors during tests
    enableConsole: false,
    enableFile: false,
  },

  // Test Security (fast for testing)
  security: {
    bcryptRounds: 4, // Minimal for speed
    maxLoginAttempts: 3,
    lockoutDuration: 60000, // 1 minute
  },

  // Test JWT (short-lived)
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '5m',
    refreshSecret: 'test-refresh-secret',
    refreshExpiresIn: '1h',
  },

  // Test CORS (permissive)
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },

  // Test Rate Limiting (disabled)
  rateLimit: {
    ttl: 60,
    limit: 10000, // Very high limit for tests
  },

  // Test Monitoring (disabled)
  monitoring: {
    sentry: {
      dsn: null,
      environment: 'test',
    },
    openTelemetry: {
      enabled: false,
    },
  },

  // Test OAuth (mock values)
  oauth: {
    google: {
      clientId: 'test-google-client-id',
      clientSecret: 'test-google-client-secret',
      callbackUrl: 'http://localhost:3001/auth/oauth/google/callback',
    },
  },
}));
