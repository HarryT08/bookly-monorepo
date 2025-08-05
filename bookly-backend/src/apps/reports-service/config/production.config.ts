import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  // Production-specific overrides
  service: {
    port: parseInt(process.env.REPORTS_SERVICE_PORT, 10) || 3005,
    host: process.env.REPORTS_SERVICE_HOST || '0.0.0.0',
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
    db: parseInt(process.env.REDIS_DB, 10) || 4,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },

  // Production RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.reports',
    queue: process.env.RABBITMQ_QUEUE || 'reports-service',
  },

  // Production Report Generation (strict)
  reports: {
    outputPath: process.env.REPORT_OUTPUT_PATH || '/var/generated/reports',
    templatePath: process.env.REPORT_TEMPLATE_PATH || '/var/templates/reports',
    defaultFormat: process.env.DEFAULT_REPORT_FORMAT || 'pdf',
    supportedFormats: ['pdf', 'xlsx', 'csv', 'json', 'html'],
    maxFileSize: parseInt(process.env.MAX_REPORT_SIZE, 10) || 52428800, // 50MB
    cacheTimeout: parseInt(process.env.REPORT_CACHE_TIMEOUT, 10) || 3600000, // 1 hour
    enableCaching: process.env.ENABLE_REPORT_CACHING !== 'false',
  },

  // Production Dashboard
  dashboard: {
    refreshInterval: parseInt(process.env.DASHBOARD_REFRESH_INTERVAL, 10) || 300000, // 5 minutes
    maxDataPoints: parseInt(process.env.MAX_DASHBOARD_DATA_POINTS, 10) || 1000,
    enableRealTime: process.env.ENABLE_REAL_TIME_DASHBOARD !== 'false',
    defaultTimeRange: process.env.DEFAULT_TIME_RANGE || '30d',
  },

  // Production Analytics
  analytics: {
    enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS !== 'false',
    aggregationInterval: parseInt(process.env.AGGREGATION_INTERVAL, 10) || 3600000, // 1 hour
    retentionPeriod: parseInt(process.env.ANALYTICS_RETENTION_PERIOD, 10) || 31536000000, // 1 year
    enablePredictiveAnalytics: process.env.ENABLE_PREDICTIVE_ANALYTICS === 'true',
  },

  // Production Export
  export: {
    maxBatchSize: parseInt(process.env.EXPORT_MAX_BATCH_SIZE, 10) || 10000,
    enableScheduledExports: process.env.ENABLE_SCHEDULED_EXPORTS !== 'false',
    defaultSchedule: process.env.DEFAULT_EXPORT_SCHEDULE || '0 0 * * 0', // Weekly on Sunday
    compressionEnabled: process.env.EXPORT_COMPRESSION_ENABLED !== 'false',
  },

  // Production Data Sources
  dataSources: {
    reservations: {
      enabled: process.env.RESERVATIONS_DATA_SOURCE !== 'false',
      refreshInterval: parseInt(process.env.RESERVATIONS_REFRESH_INTERVAL, 10) || 300000,
    },
    resources: {
      enabled: process.env.RESOURCES_DATA_SOURCE !== 'false',
      refreshInterval: parseInt(process.env.RESOURCES_REFRESH_INTERVAL, 10) || 600000,
    },
    users: {
      enabled: process.env.USERS_DATA_SOURCE !== 'false',
      refreshInterval: parseInt(process.env.USERS_REFRESH_INTERVAL, 10) || 3600000,
    },
    approvals: {
      enabled: process.env.APPROVALS_DATA_SOURCE !== 'false',
      refreshInterval: parseInt(process.env.APPROVALS_REFRESH_INTERVAL, 10) || 300000,
    },
  },

  // Production Logging
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    enableConsole: false,
    enableFile: true,
    filePath: process.env.LOG_FILE_PATH || '/var/log/reports-service.log',
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

  // Production External Services
  externalServices: {
    authService: {
      url: process.env.AUTH_SERVICE_URL,
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT, 10) || 5000,
    },
    resourcesService: {
      url: process.env.RESOURCES_SERVICE_URL,
      timeout: parseInt(process.env.RESOURCES_SERVICE_TIMEOUT, 10) || 5000,
    },
    availabilityService: {
      url: process.env.AVAILABILITY_SERVICE_URL,
      timeout: parseInt(process.env.AVAILABILITY_SERVICE_TIMEOUT, 10) || 5000,
    },
    stockpileService: {
      url: process.env.STOCKPILE_SERVICE_URL,
      timeout: parseInt(process.env.STOCKPILE_SERVICE_TIMEOUT, 10) || 5000,
    },
  },

  // Production Security (strict)
  security: {
    enableDataMasking: process.env.ENABLE_DATA_MASKING !== 'false',
    enableAuditTrail: process.env.ENABLE_AUDIT_TRAIL !== 'false',
    auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 2555, // 7 years
  },
}));
