import { registerAs } from '@nestjs/config';

export default registerAs('development', () => ({
  // Development-specific overrides
  service: {
    port: 3002,
    host: 'localhost',
  },

  // Development Database
  database: {
    url: 'mongodb://localhost:27017/bookly-availability-dev',
    logging: true,
    synchronize: false,
  },

  // Development Redis
  redis: {
    host: 'localhost',
    port: 6379,
    db: 1,
  },

  // Development RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.availability.dev',
    queue: 'availability-service-dev',
  },

  // Development Calendar Integration (mock/test credentials)
  calendar: {
    google: {
      clientId: 'dev-google-calendar-client-id',
      clientSecret: 'dev-google-calendar-client-secret',
      redirectUri: 'http://localhost:3002/calendar/google/callback',
    },
    outlook: {
      clientId: 'dev-outlook-client-id',
      clientSecret: 'dev-outlook-client-secret',
      redirectUri: 'http://localhost:3002/calendar/outlook/callback',
    },
    sync: {
      interval: 60000, // 1 minute for development
      batchSize: 10,
      lookAheadDays: 30,
    },
  },

  // Development Schedule (more permissive)
  schedule: {
    workingHours: {
      start: '06:00',
      end: '23:00',
    },
    reservationLimits: {
      minDuration: 15, // 15 minutes
      maxDuration: 720, // 12 hours
      maxAdvanceBooking: 180, // 6 months
      preparationTime: 5, // 5 minutes
    },
  },

  // Development Availability
  availability: {
    cacheTimeout: 60000, // 1 minute
    conflictCheckEnabled: true,
    realTimeUpdates: true,
  },

  // Development Logging
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: true,
    filePath: './logs/availability-service-dev.log',
  },

  // Development CORS (permissive)
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:8080'],
    credentials: true,
  },

  // Development Rate Limiting (permissive)
  rateLimit: {
    ttl: 60,
    limit: 1000,
  },

  // Development Monitoring
  monitoring: {
    sentry: {
      dsn: null,
      environment: 'development',
    },
    openTelemetry: {
      enabled: false,
    },
  },

  // Development Notifications
  notifications: {
    enabled: true,
    reminderTime: 300000, // 5 minutes for testing
    channels: {
      email: true,
      sms: false, // Disable SMS in development
      push: true,
    },
  },
}));
