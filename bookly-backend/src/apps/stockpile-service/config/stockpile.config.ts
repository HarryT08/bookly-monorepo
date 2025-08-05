import { registerAs } from '@nestjs/config';

export default registerAs('stockpile', () => ({
  // Service Configuration
  service: {
    name: 'stockpile-service',
    port: parseInt(process.env.STOCKPILE_SERVICE_PORT, 10) || 3004,
    host: process.env.STOCKPILE_SERVICE_HOST || 'localhost',
    version: process.env.STOCKPILE_SERVICE_VERSION || '1.0.0',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/bookly-stockpile',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 3,
  },

  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.stockpile',
    queue: process.env.RABBITMQ_QUEUE || 'stockpile-service',
  },

  // Approval Flow Configuration
  approvalFlow: {
    defaultTimeout: parseInt(process.env.APPROVAL_TIMEOUT, 10) || 86400000, // 24 hours
    maxApprovalLevels: parseInt(process.env.MAX_APPROVAL_LEVELS, 10) || 5,
    enableAutoApproval: process.env.ENABLE_AUTO_APPROVAL === 'true',
    autoApprovalThreshold: parseInt(process.env.AUTO_APPROVAL_THRESHOLD, 10) || 100, // minutes
    reminderInterval: parseInt(process.env.REMINDER_INTERVAL, 10) || 3600000, // 1 hour
    maxReminders: parseInt(process.env.MAX_REMINDERS, 10) || 3,
  },

  // Document Generation Configuration
  documents: {
    templatePath: process.env.DOCUMENT_TEMPLATE_PATH || './templates/documents',
    outputPath: process.env.DOCUMENT_OUTPUT_PATH || './generated/documents',
    defaultFormat: process.env.DEFAULT_DOCUMENT_FORMAT || 'pdf',
    supportedFormats: ['pdf', 'docx', 'html'],
    maxFileSize: parseInt(process.env.MAX_DOCUMENT_SIZE, 10) || 10485760, // 10MB
    enableDigitalSignature: process.env.ENABLE_DIGITAL_SIGNATURE === 'true',
    signatureProvider: process.env.SIGNATURE_PROVIDER || 'internal',
  },

  // Notification Configuration
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
    channels: {
      email: {
        enabled: process.env.EMAIL_NOTIFICATIONS !== 'false',
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        from: process.env.EMAIL_FROM || 'noreply@bookly.ufps.edu.co',
        replyTo: process.env.EMAIL_REPLY_TO,
      },
      sms: {
        enabled: process.env.SMS_NOTIFICATIONS === 'true',
        provider: process.env.SMS_PROVIDER || 'twilio',
        from: process.env.SMS_FROM,
      },
      whatsapp: {
        enabled: process.env.WHATSAPP_NOTIFICATIONS === 'true',
        provider: process.env.WHATSAPP_PROVIDER || 'twilio',
        from: process.env.WHATSAPP_FROM,
      },
      push: {
        enabled: process.env.PUSH_NOTIFICATIONS !== 'false',
        provider: process.env.PUSH_PROVIDER || 'firebase',
      },
    },
    templates: {
      path: process.env.NOTIFICATION_TEMPLATE_PATH || './templates/notifications',
      defaultLanguage: process.env.DEFAULT_LANGUAGE || 'es',
      supportedLanguages: ['es', 'en'],
    },
    retryPolicy: {
      maxRetries: parseInt(process.env.NOTIFICATION_MAX_RETRIES, 10) || 3,
      retryDelay: parseInt(process.env.NOTIFICATION_RETRY_DELAY, 10) || 5000,
      backoffMultiplier: parseFloat(process.env.NOTIFICATION_BACKOFF_MULTIPLIER) || 2,
    },
  },

  // Validation Configuration
  validation: {
    enableStrictValidation: process.env.ENABLE_STRICT_VALIDATION !== 'false',
    requireJustification: process.env.REQUIRE_JUSTIFICATION !== 'false',
    minJustificationLength: parseInt(process.env.MIN_JUSTIFICATION_LENGTH, 10) || 10,
    maxJustificationLength: parseInt(process.env.MAX_JUSTIFICATION_LENGTH, 10) || 500,
    enableConflictDetection: process.env.ENABLE_CONFLICT_DETECTION !== 'false',
  },

  // Security Configuration
  security: {
    enableDoubleConfirmation: process.env.ENABLE_DOUBLE_CONFIRMATION !== 'false',
    confirmationKeyword: process.env.CONFIRMATION_KEYWORD || 'DELETE',
    enableAuditTrail: process.env.ENABLE_AUDIT_TRAIL !== 'false',
    auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 2555, // 7 years
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/stockpile-service.log',
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
  },
}));
