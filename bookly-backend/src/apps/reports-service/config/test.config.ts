import { registerAs } from '@nestjs/config';

export default registerAs('test', () => ({
  // Test-specific overrides
  service: {
    port: 3005,
    host: 'localhost',
  },

  // Test Database
  database: {
    url: 'mongodb://localhost:27017/bookly-reports-test',
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
    exchange: 'bookly.reports.test',
    queue: 'reports-service-test',
  },

  // Test Report Generation (minimal)
  reports: {
    outputPath: './test-generated/reports',
    templatePath: './test-templates/reports',
    defaultFormat: 'json',
    supportedFormats: ['json', 'csv'],
    maxFileSize: 1048576, // 1MB for tests
    cacheTimeout: 1000, // 1 second
    enableCaching: false, // Disable for predictable tests
  },

  // Test Dashboard (minimal)
  dashboard: {
    refreshInterval: 1000, // 1 second
    maxDataPoints: 10,
    enableRealTime: false,
    defaultTimeRange: '1d',
  },

  // Test Analytics (disabled)
  analytics: {
    enableAdvancedAnalytics: false,
    aggregationInterval: 1000, // 1 second
    retentionPeriod: 86400000, // 1 day
    enablePredictiveAnalytics: false,
  },

  // Test Export (minimal)
  export: {
    maxBatchSize: 10,
    enableScheduledExports: false,
    defaultSchedule: '0 0 * * *',
    compressionEnabled: false,
  },

  // Test Data Sources (disabled)
  dataSources: {
    reservations: {
      enabled: false,
      refreshInterval: 1000,
    },
    resources: {
      enabled: false,
      refreshInterval: 1000,
    },
    users: {
      enabled: false,
      refreshInterval: 1000,
    },
    approvals: {
      enabled: false,
      refreshInterval: 1000,
    },
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

  // Test External Services (mock)
  externalServices: {
    authService: {
      url: 'http://localhost:3001',
      timeout: 1000,
    },
    resourcesService: {
      url: 'http://localhost:3003',
      timeout: 1000,
    },
    availabilityService: {
      url: 'http://localhost:3002',
      timeout: 1000,
    },
    stockpileService: {
      url: 'http://localhost:3004',
      timeout: 1000,
    },
  },

  // Test Security (disabled)
  security: {
    enableDataMasking: false,
    enableAuditTrail: false,
    auditRetentionDays: 1,
  },
}));
