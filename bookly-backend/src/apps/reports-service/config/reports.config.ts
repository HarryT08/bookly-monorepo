import { registerAs } from '@nestjs/config';

export default registerAs('reports', () => ({
  // Service Configuration
  service: {
    name: 'reports-service',
    port: parseInt(process.env.REPORTS_SERVICE_PORT, 10) || 3005,
    host: process.env.REPORTS_SERVICE_HOST || 'localhost',
    version: process.env.REPORTS_SERVICE_VERSION || '1.0.0',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/bookly-reports',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 4,
  },

  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.reports',
    queue: process.env.RABBITMQ_QUEUE || 'reports-service',
  },

  // Report Generation Configuration
  reports: {
    outputPath: process.env.REPORT_OUTPUT_PATH || './generated/reports',
    templatePath: process.env.REPORT_TEMPLATE_PATH || './templates/reports',
    defaultFormat: process.env.DEFAULT_REPORT_FORMAT || 'pdf',
    supportedFormats: ['pdf', 'xlsx', 'csv', 'json', 'html'],
    maxFileSize: parseInt(process.env.MAX_REPORT_SIZE, 10) || 52428800, // 50MB
    cacheTimeout: parseInt(process.env.REPORT_CACHE_TIMEOUT, 10) || 3600000, // 1 hour
    enableCaching: process.env.ENABLE_REPORT_CACHING !== 'false',
  },

  // Dashboard Configuration
  dashboard: {
    refreshInterval: parseInt(process.env.DASHBOARD_REFRESH_INTERVAL, 10) || 300000, // 5 minutes
    maxDataPoints: parseInt(process.env.MAX_DASHBOARD_DATA_POINTS, 10) || 1000,
    enableRealTime: process.env.ENABLE_REAL_TIME_DASHBOARD !== 'false',
    defaultTimeRange: process.env.DEFAULT_TIME_RANGE || '30d',
  },

  // Analytics Configuration
  analytics: {
    enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS !== 'false',
    aggregationInterval: parseInt(process.env.AGGREGATION_INTERVAL, 10) || 3600000, // 1 hour
    retentionPeriod: parseInt(process.env.ANALYTICS_RETENTION_PERIOD, 10) || 31536000000, // 1 year
    enablePredictiveAnalytics: process.env.ENABLE_PREDICTIVE_ANALYTICS === 'true',
  },

  // Export Configuration
  export: {
    maxBatchSize: parseInt(process.env.EXPORT_MAX_BATCH_SIZE, 10) || 10000,
    enableScheduledExports: process.env.ENABLE_SCHEDULED_EXPORTS !== 'false',
    defaultSchedule: process.env.DEFAULT_EXPORT_SCHEDULE || '0 0 * * 0', // Weekly on Sunday
    compressionEnabled: process.env.EXPORT_COMPRESSION_ENABLED !== 'false',
  },

  // Data Sources Configuration
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

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/reports-service.log',
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

  // External Services Configuration
  externalServices: {
    authService: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT, 10) || 5000,
    },
    resourcesService: {
      url: process.env.RESOURCES_SERVICE_URL || 'http://localhost:3003',
      timeout: parseInt(process.env.RESOURCES_SERVICE_TIMEOUT, 10) || 5000,
    },
    availabilityService: {
      url: process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.AVAILABILITY_SERVICE_TIMEOUT, 10) || 5000,
    },
    stockpileService: {
      url: process.env.STOCKPILE_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.STOCKPILE_SERVICE_TIMEOUT, 10) || 5000,
    },
  },

  // Security Configuration
  security: {
    enableDataMasking: process.env.ENABLE_DATA_MASKING !== 'false',
    enableAuditTrail: process.env.ENABLE_AUDIT_TRAIL !== 'false',
    auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 2555, // 7 years
  },
}));
