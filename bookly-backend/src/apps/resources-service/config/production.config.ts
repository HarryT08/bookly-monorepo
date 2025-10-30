import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  // Production-specific overrides
  service: {
    port: parseInt(process.env.RESOURCES_SERVICE_PORT, 10) || 3003,
    host: process.env.RESOURCES_SERVICE_HOST || '0.0.0.0',
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
    db: parseInt(process.env.REDIS_DB, 10) || 2,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },

  // Production RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.resources',
    queue: process.env.RABBITMQ_QUEUE || 'resources-service',
  },

  // Production Resource Management (strict)
  resources: {
    defaultCapacity: parseInt(process.env.DEFAULT_RESOURCE_CAPACITY, 10) || 1,
    maxCapacity: parseInt(process.env.MAX_RESOURCE_CAPACITY, 10) || 1000,
    codePrefix: process.env.RESOURCE_CODE_PREFIX || 'RES',
    autoGenerateCode: process.env.AUTO_GENERATE_CODE !== 'false',
    enableVersioning: process.env.ENABLE_VERSIONING !== 'false',
  },

  // Production Availability Rules (strict)
  availability: {
    defaultMinReservationTime: parseInt(process.env.DEFAULT_MIN_RESERVATION_TIME, 10) || 30,
    defaultMaxReservationTime: parseInt(process.env.DEFAULT_MAX_RESERVATION_TIME, 10) || 480,
    defaultPreparationTime: parseInt(process.env.DEFAULT_PREPARATION_TIME, 10) || 15,
    maxAdvanceBookingDays: parseInt(process.env.MAX_ADVANCE_BOOKING_DAYS, 10) || 90,
    enableConflictValidation: process.env.ENABLE_CONFLICT_VALIDATION !== 'false',
  },

  // Production Categories
  categories: {
    allowCustomCategories: process.env.ALLOW_CUSTOM_CATEGORIES !== 'false',
    maxCategoryNameLength: parseInt(process.env.MAX_CATEGORY_NAME_LENGTH, 10) || 50,
  },

  // Production Attributes
  attributes: {
    maxAttributeValueLength: parseInt(process.env.MAX_ATTRIBUTE_VALUE_LENGTH, 10) || 1000,
    enableCustomAttributes: process.env.ENABLE_CUSTOM_ATTRIBUTES !== 'false',
  },

  // Production File Upload (strict limits)
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    uploadPath: process.env.UPLOAD_PATH || '/var/uploads/resources',
    enableImageProcessing: process.env.ENABLE_IMAGE_PROCESSING !== 'false',
  },

  // Production Import/Export
  importExport: {
    maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE, 10) || 1000,
    enableBulkOperations: process.env.ENABLE_BULK_OPERATIONS !== 'false',
    supportedFormats: ['csv', 'xlsx', 'json'],
    templatePath: process.env.TEMPLATE_PATH || '/var/templates',
  },

  // Production Maintenance
  maintenance: {
    enableMaintenanceTracking: process.env.ENABLE_MAINTENANCE_TRACKING !== 'false',
    defaultMaintenanceInterval: parseInt(process.env.DEFAULT_MAINTENANCE_INTERVAL, 10) || 90,
    maintenanceReminderDays: parseInt(process.env.MAINTENANCE_REMINDER_DAYS, 10) || 7,
  },

  // Production Logging
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    enableConsole: false,
    enableFile: true,
    filePath: process.env.LOG_FILE_PATH || '/var/log/resources-service.log',
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

  // Production Search
  search: {
    enableFullTextSearch: process.env.ENABLE_FULL_TEXT_SEARCH !== 'false',
    maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS, 10) || 100,
    searchTimeout: parseInt(process.env.SEARCH_TIMEOUT, 10) || 5000,
  },
}));
