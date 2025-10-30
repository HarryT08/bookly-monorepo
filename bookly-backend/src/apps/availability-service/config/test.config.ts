import { registerAs } from '@nestjs/config';

export default registerAs('test', () => ({
  // Test-specific overrides
  service: {
    port: 3002,
    host: 'localhost',
  },

  // Test Database
  database: {
    url: 'mongodb://localhost:27017/bookly-availability-test',
    logging: false,
    synchronize: false,
    dropSchema: true,
  },

  // Test Redis
  redis: {
    host: 'localhost',
    port: 6379,
    db: 15, // Use different DB for tests
  },

  // Test RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.availability.test',
    queue: 'availability-service-test',
  },

  // Test Calendar Integration (mock)
  calendar: {
    google: {
      clientId: 'test-google-calendar-client-id',
      clientSecret: 'test-google-calendar-client-secret',
      redirectUri: 'http://localhost:3002/calendar/google/callback',
    },
    outlook: {
      clientId: 'test-outlook-client-id',
      clientSecret: 'test-outlook-client-secret',
      redirectUri: 'http://localhost:3002/calendar/outlook/callback',
    },
    sync: {
      interval: 5000, // 5 seconds for testing
      batchSize: 5,
      lookAheadDays: 7,
    },
  },

  // Test Schedule (permissive for testing)
  schedule: {
    workingHours: {
      start: '00:00',
      end: '23:59',
    },
    reservationLimits: {
      minDuration: 1, // 1 minute
      maxDuration: 1440, // 24 hours
      maxAdvanceBooking: 365, // 1 year
      preparationTime: 0, // No preparation time for tests
    },
  },

  // Test Availability
  availability: {
    cacheTimeout: 1000, // 1 second
    conflictCheckEnabled: true,
    realTimeUpdates: false, // Disable for predictable tests
  },

  // Test Logging (minimal)
  logging: {
    level: 'error',
    enableConsole: false,
    enableFile: false,
  },

  // Test CORS (permissive)
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },

  // Test Rate Limiting (disabled)
  rateLimit: {
    ttl: 60,
    limit: 10000,
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

  // Test Notifications (disabled)
  notifications: {
    enabled: false,
    reminderTime: 1000, // 1 second for testing
    channels: {
      email: false,
      sms: false,
      push: false,
    },
  },
}));
