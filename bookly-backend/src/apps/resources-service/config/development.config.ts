import { registerAs } from '@nestjs/config';

export default registerAs('development', () => ({
  // Development-specific overrides
  service: {
    port: 3003,
    host: 'localhost',
  },

  // Development Database
  database: {
    url: 'mongodb://localhost:27017/bookly-resources-dev',
    logging: true,
    synchronize: false,
  },

  // Development Redis
  redis: {
    host: 'localhost',
    port: 6379,
    db: 2,
  },

  // Development RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.resources.dev',
    queue: 'resources-service-dev',
  },

  // Development Resource Management (more permissive)
  resources: {
    defaultCapacity: 1,
    maxCapacity: 10000,
    codePrefix: 'DEV-RES',
    autoGenerateCode: true,
    enableVersioning: true,
  },

  // Development Availability Rules (permissive)
  availability: {
    defaultMinReservationTime: 15, // 15 minutes
    defaultMaxReservationTime: 720, // 12 hours
    defaultPreparationTime: 5, // 5 minutes
    maxAdvanceBookingDays: 180, // 6 months
    enableConflictValidation: true,
  },

  // Development Categories
  categories: {
    allowCustomCategories: true,
    maxCategoryNameLength: 100,
  },

  // Development Attributes
  attributes: {
    maxAttributeValueLength: 2000,
    enableCustomAttributes: true,
  },

  // Development File Upload (larger limits)
  uploads: {
    maxFileSize: 10485760, // 10MB
    allowedTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx'],
    uploadPath: './uploads/resources-dev',
    enableImageProcessing: true,
  },

  // Development Import/Export
  importExport: {
    maxBatchSize: 5000,
    enableBulkOperations: true,
    supportedFormats: ['csv', 'xlsx', 'json', 'xml'],
    templatePath: './templates-dev',
  },

  // Development Maintenance
  maintenance: {
    enableMaintenanceTracking: true,
    defaultMaintenanceInterval: 30, // 30 days for testing
    maintenanceReminderDays: 3,
  },

  // Development Logging
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: true,
    filePath: './logs/resources-service-dev.log',
  },

  // Development CORS (permissive)
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:8080'],
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

  // Development Search
  search: {
    enableFullTextSearch: true,
    maxSearchResults: 500,
    searchTimeout: 10000,
  },
}));
