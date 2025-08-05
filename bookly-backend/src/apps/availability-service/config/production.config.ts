import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  // Production-specific overrides
  service: {
    port: parseInt(process.env.AVAILABILITY_SERVICE_PORT, 10) || 3002,
    host: process.env.AVAILABILITY_SERVICE_HOST || '0.0.0.0',
  },

  // Production Database
  database: {
    url: process.env.DATABASE_URL,
    logging: false,
    synchronize: false,
    ssl: {
      rejectUnauthorized: false,
    },
  },

  // Production Redis
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 1,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },

  // Production RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.availability',
    queue: process.env.RABBITMQ_QUEUE || 'availability-service',
  },

  // Production Calendar Integration
  calendar: {
    google: {
      clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI,
    },
    outlook: {
      clientId: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      redirectUri: process.env.OUTLOOK_REDIRECT_URI,
    },
    sync: {
      interval: parseInt(process.env.CALENDAR_SYNC_INTERVAL, 10) || 1800000, // 30 minutes
      batchSize: parseInt(process.env.CALENDAR_SYNC_BATCH_SIZE, 10) || 100,
      lookAheadDays: parseInt(process.env.CALENDAR_LOOK_AHEAD_DAYS, 10) || 90,
    },
  },

  // Production Schedule (strict)
  schedule: {
    workingHours: {
      start: process.env.WORKING_HOURS_START || '07:00',
      end: process.env.WORKING_HOURS_END || '22:00',
    },
    reservationLimits: {
      minDuration: parseInt(process.env.MIN_RESERVATION_DURATION, 10) || 30,
      maxDuration: parseInt(process.env.MAX_RESERVATION_DURATION, 10) || 480,
      maxAdvanceBooking: parseInt(process.env.MAX_ADVANCE_BOOKING_DAYS, 10) || 90,
      preparationTime: parseInt(process.env.PREPARATION_TIME, 10) || 15,
    },
  },

  // Production Availability
  availability: {
    cacheTimeout: parseInt(process.env.AVAILABILITY_CACHE_TIMEOUT, 10) || 300000,
    conflictCheckEnabled: process.env.CONFLICT_CHECK_ENABLED !== 'false',
    realTimeUpdates: process.env.REAL_TIME_UPDATES !== 'false',
  },

  // Production Logging
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    enableConsole: false,
    enableFile: true,
    filePath: process.env.LOG_FILE_PATH || '/var/log/availability-service.log',
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

  // Production Notifications
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
    reminderTime: parseInt(process.env.REMINDER_TIME, 10) || 3600000,
    channels: {
      email: process.env.EMAIL_NOTIFICATIONS !== 'false',
      sms: process.env.SMS_NOTIFICATIONS === 'true',
      push: process.env.PUSH_NOTIFICATIONS !== 'false',
    },
  },
}));
