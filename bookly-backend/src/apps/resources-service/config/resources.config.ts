import { registerAs } from '@nestjs/config';

export default registerAs('resources', () => ({
  // Service Configuration
  service: {
    name: 'resources-service',
    port: parseInt(process.env.RESOURCES_SERVICE_PORT, 10) || 3003,
    host: process.env.RESOURCES_SERVICE_HOST || 'localhost',
    version: process.env.RESOURCES_SERVICE_VERSION || '1.0.0',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/bookly-resources',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 2,
  },

  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.resources',
    queue: process.env.RABBITMQ_QUEUE || 'resources-service',
  },

  // Resource Management Configuration
  resources: {
    defaultCapacity: parseInt(process.env.DEFAULT_RESOURCE_CAPACITY, 10) || 1,
    maxCapacity: parseInt(process.env.MAX_RESOURCE_CAPACITY, 10) || 1000,
    codePrefix: process.env.RESOURCE_CODE_PREFIX || 'RES',
    autoGenerateCode: process.env.AUTO_GENERATE_CODE !== 'false',
    enableVersioning: process.env.ENABLE_VERSIONING !== 'false',
  },

  // Availability Rules Configuration
  availability: {
    defaultMinReservationTime: parseInt(process.env.DEFAULT_MIN_RESERVATION_TIME, 10) || 30, // minutes
    defaultMaxReservationTime: parseInt(process.env.DEFAULT_MAX_RESERVATION_TIME, 10) || 480, // 8 hours
    defaultPreparationTime: parseInt(process.env.DEFAULT_PREPARATION_TIME, 10) || 15, // minutes
    maxAdvanceBookingDays: parseInt(process.env.MAX_ADVANCE_BOOKING_DAYS, 10) || 90,
    enableConflictValidation: process.env.ENABLE_CONFLICT_VALIDATION !== 'false',
  },

  // Categories Configuration
  categories: {
    defaultCategories: [
      'Salón',
      'Auditorio',
      'Laboratorio',
      'Equipo de Cómputo',
      'Equipo Audiovisual',
      'Herramientas',
      'Vehículo',
      'Espacio Deportivo'
    ],
    allowCustomCategories: process.env.ALLOW_CUSTOM_CATEGORIES !== 'false',
    maxCategoryNameLength: parseInt(process.env.MAX_CATEGORY_NAME_LENGTH, 10) || 50,
  },

  // Attributes Configuration
  attributes: {
    requiredAttributes: ['name', 'location', 'category'],
    optionalAttributes: ['description', 'capacity', 'specifications', 'requirements'],
    maxAttributeValueLength: parseInt(process.env.MAX_ATTRIBUTE_VALUE_LENGTH, 10) || 1000,
    enableCustomAttributes: process.env.ENABLE_CUSTOM_ATTRIBUTES !== 'false',
  },

  // File Upload Configuration
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    uploadPath: process.env.UPLOAD_PATH || './uploads/resources',
    enableImageProcessing: process.env.ENABLE_IMAGE_PROCESSING !== 'false',
  },

  // Import/Export Configuration
  importExport: {
    maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE, 10) || 1000,
    enableBulkOperations: process.env.ENABLE_BULK_OPERATIONS !== 'false',
    supportedFormats: ['csv', 'xlsx', 'json'],
    templatePath: process.env.TEMPLATE_PATH || './templates',
  },

  // Maintenance Configuration
  maintenance: {
    enableMaintenanceTracking: process.env.ENABLE_MAINTENANCE_TRACKING !== 'false',
    defaultMaintenanceInterval: parseInt(process.env.DEFAULT_MAINTENANCE_INTERVAL, 10) || 90, // days
    maintenanceReminderDays: parseInt(process.env.MAINTENANCE_REMINDER_DAYS, 10) || 7,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/resources-service.log',
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

  // Search Configuration
  search: {
    enableFullTextSearch: process.env.ENABLE_FULL_TEXT_SEARCH !== 'false',
    maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS, 10) || 100,
    searchTimeout: parseInt(process.env.SEARCH_TIMEOUT, 10) || 5000,
  },
}));
