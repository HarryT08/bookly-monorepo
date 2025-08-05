import { registerAs } from '@nestjs/config';

export default registerAs('development', () => ({
  // Development-specific overrides
  service: {
    port: 3005,
    host: 'localhost',
  },

  // Development Database
  database: {
    url: 'mongodb://localhost:27017/bookly-reports-dev',
    logging: true,
    synchronize: false,
  },

  // Development Redis
  redis: {
    host: 'localhost',
    port: 6379,
    db: 4,
  },

  // Development RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.reports.dev',
    queue: 'reports-service-dev',
  },

  // Development Report Generation (faster)
  reports: {
    outputPath: './generated/reports-dev',
    templatePath: './templates/reports-dev',
    defaultFormat: 'pdf',
    supportedFormats: ['pdf', 'xlsx', 'csv', 'json', 'html', 'txt'],
    maxFileSize: 104857600, // 100MB for development
    cacheTimeout: 60000, // 1 minute for development
    enableCaching: true,
  },

  // Development Dashboard (faster refresh)
  dashboard: {
    refreshInterval: 30000, // 30 seconds
    maxDataPoints: 5000,
    enableRealTime: true,
    defaultTimeRange: '7d',
  },

  // Development Analytics (more permissive)
  analytics: {
    enableAdvancedAnalytics: true,
    aggregationInterval: 300000, // 5 minutes
    retentionPeriod: 2592000000, // 30 days
    enablePredictiveAnalytics: false, // Disable for development
  },

  // Development Export (larger batches)
  export: {
    maxBatchSize: 50000,
    enableScheduledExports: true,
    defaultSchedule: '0 */6 * * *', // Every 6 hours for development
    compressionEnabled: false, // Disable for faster processing
  },

  // Development Data Sources (faster refresh)
  dataSources: {
    reservations: {
      enabled: true,
      refreshInterval: 60000, // 1 minute
    },
    resources: {
      enabled: true,
      refreshInterval: 120000, // 2 minutes
    },
    users: {
      enabled: true,
      refreshInterval: 300000, // 5 minutes
    },
    approvals: {
      enabled: true,
      refreshInterval: 60000, // 1 minute
    },
  },

  // Development Logging
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: true,
    filePath: './logs/reports-service-dev.log',
  },

  // Development CORS (permissive)
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3005', 'http://localhost:8080'],
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

  // Development External Services
  externalServices: {
    authService: {
      url: 'http://localhost:3001',
      timeout: 10000,
    },
    resourcesService: {
      url: 'http://localhost:3003',
      timeout: 10000,
    },
    availabilityService: {
      url: 'http://localhost:3002',
      timeout: 10000,
    },
    stockpileService: {
      url: 'http://localhost:3004',
      timeout: 10000,
    },
  },

  // Development Security (less strict)
  security: {
    enableDataMasking: false, // Disable for development
    enableAuditTrail: true,
    auditRetentionDays: 30, // 30 days for development
  },
}));
