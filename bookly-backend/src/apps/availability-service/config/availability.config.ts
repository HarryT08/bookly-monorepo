import { registerAs } from '@nestjs/config';

export default registerAs('availability', () => ({
  // Service Configuration
  service: {
    name: 'availability-service',
    port: parseInt(process.env.AVAILABILITY_SERVICE_PORT, 10) || 3002,
    host: process.env.AVAILABILITY_SERVICE_HOST || 'localhost',
    version: process.env.AVAILABILITY_SERVICE_VERSION || '1.0.0',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/bookly-availability',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 1,
  },

  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.availability',
    queue: process.env.RABBITMQ_QUEUE || 'availability-service',
  },

  // Calendar Integration Configuration
  calendar: {
    google: {
      clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    },
    outlook: {
      clientId: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      redirectUri: process.env.OUTLOOK_REDIRECT_URI,
      scopes: ['https://graph.microsoft.com/calendars.read'],
    },
    ical: {
      defaultTimeout: parseInt(process.env.ICAL_TIMEOUT, 10) || 30000,
      maxRetries: parseInt(process.env.ICAL_MAX_RETRIES, 10) || 3,
    },
    sync: {
      interval: parseInt(process.env.CALENDAR_SYNC_INTERVAL, 10) || 1800000, // 30 minutes
      batchSize: parseInt(process.env.CALENDAR_SYNC_BATCH_SIZE, 10) || 100,
      lookAheadDays: parseInt(process.env.CALENDAR_LOOK_AHEAD_DAYS, 10) || 90,
    },
  },

  // Schedule Configuration
  schedule: {
    defaultTimeZone: process.env.DEFAULT_TIMEZONE || 'America/Bogota',
    workingHours: {
      start: process.env.WORKING_HOURS_START || '07:00',
      end: process.env.WORKING_HOURS_END || '22:00',
    },
    reservationLimits: {
      minDuration: parseInt(process.env.MIN_RESERVATION_DURATION, 10) || 30, // minutes
      maxDuration: parseInt(process.env.MAX_RESERVATION_DURATION, 10) || 480, // 8 hours
      maxAdvanceBooking: parseInt(process.env.MAX_ADVANCE_BOOKING_DAYS, 10) || 90, // days
      preparationTime: parseInt(process.env.PREPARATION_TIME, 10) || 15, // minutes between reservations
    },
  },

  // Availability Configuration
  availability: {
    cacheTimeout: parseInt(process.env.AVAILABILITY_CACHE_TIMEOUT, 10) || 300000, // 5 minutes
    conflictCheckEnabled: process.env.CONFLICT_CHECK_ENABLED !== 'false',
    realTimeUpdates: process.env.REAL_TIME_UPDATES !== 'false',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/availability-service.log',
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

  // Notification Configuration
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
    reminderTime: parseInt(process.env.REMINDER_TIME, 10) || 3600000, // 1 hour before
    channels: {
      email: process.env.EMAIL_NOTIFICATIONS !== 'false',
      sms: process.env.SMS_NOTIFICATIONS === 'true',
      push: process.env.PUSH_NOTIFICATIONS !== 'false',
    },
  },
}));
