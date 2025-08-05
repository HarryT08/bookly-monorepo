import { registerAs } from '@nestjs/config';

export default registerAs('test', () => ({
  // Test-specific overrides
  service: {
    port: 3003,
    host: 'localhost',
  },

  // Test Database
  database: {
    url: 'mongodb://localhost:27017/bookly-resources-test',
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
    exchange: 'bookly.resources.test',
    queue: 'resources-service-test',
  },

  // Test Resource Management (permissive for testing)
  resources: {
    defaultCapacity: 1,
    maxCapacity: 100000,
    codePrefix: 'TEST-RES',
    autoGenerateCode: true,
    enableVersioning: false, // Disable for simpler tests
  },

  // Test Availability Rules (permissive)
  availability: {
    defaultMinReservationTime: 1, // 1 minute
    defaultMaxReservationTime: 1440, // 24 hours
    defaultPreparationTime: 0, // No preparation time for tests
    maxAdvanceBookingDays: 365, // 1 year
    enableConflictValidation: true,
  },

  // Test Categories
  categories: {
    allowCustomCategories: true,
    maxCategoryNameLength: 200,
  },

  // Test Attributes
  attributes: {
    maxAttributeValueLength: 5000,
    enableCustomAttributes: true,
  },

  // Test File Upload (permissive)
  uploads: {
    maxFileSize: 1048576, // 1MB for tests
    allowedTypes: ['jpg', 'jpeg', 'png', 'pdf', 'txt'],
    uploadPath: './test-uploads/resources',
    enableImageProcessing: false, // Disable for faster tests
  },

  // Test Import/Export
  importExport: {
    maxBatchSize: 100,
    enableBulkOperations: true,
    supportedFormats: ['csv', 'json'],
    templatePath: './test-templates',
  },

  // Test Maintenance
  maintenance: {
    enableMaintenanceTracking: false, // Disable for simpler tests
    defaultMaintenanceInterval: 1, // 1 day
    maintenanceReminderDays: 0,
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

  // Test Search
  search: {
    enableFullTextSearch: false, // Disable for faster tests
    maxSearchResults: 50,
    searchTimeout: 1000,
  },
}));
