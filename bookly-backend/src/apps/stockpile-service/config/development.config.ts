import { registerAs } from '@nestjs/config';

export default registerAs('development', () => ({
  // Development-specific overrides
  service: {
    port: 3004,
    host: 'localhost',
  },

  // Development Database
  database: {
    url: 'mongodb://localhost:27017/bookly-stockpile-dev',
    logging: true,
    synchronize: false,
  },

  // Development Redis
  redis: {
    host: 'localhost',
    port: 6379,
    db: 3,
  },

  // Development RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.stockpile.dev',
    queue: 'stockpile-service-dev',
  },

  // Development Approval Flow (faster for testing)
  approvalFlow: {
    defaultTimeout: 3600000, // 1 hour for development
    maxApprovalLevels: 10,
    enableAutoApproval: true,
    autoApprovalThreshold: 30, // 30 minutes
    reminderInterval: 300000, // 5 minutes
    maxReminders: 5,
  },

  // Development Document Generation
  documents: {
    templatePath: './templates/documents-dev',
    outputPath: './generated/documents-dev',
    defaultFormat: 'pdf',
    supportedFormats: ['pdf', 'docx', 'html', 'txt'],
    maxFileSize: 20971520, // 20MB for development
    enableDigitalSignature: false, // Disable for development
    signatureProvider: 'mock',
  },

  // Development Notifications (more verbose)
  notifications: {
    enabled: true,
    channels: {
      email: {
        enabled: true,
        provider: 'mock', // Use mock provider for development
        from: 'dev-noreply@bookly.ufps.edu.co',
        replyTo: 'dev-support@bookly.ufps.edu.co',
      },
      sms: {
        enabled: false, // Disable SMS in development
        provider: 'mock',
      },
      whatsapp: {
        enabled: false, // Disable WhatsApp in development
        provider: 'mock',
      },
      push: {
        enabled: true,
        provider: 'mock',
      },
    },
    templates: {
      path: './templates/notifications-dev',
      defaultLanguage: 'es',
      supportedLanguages: ['es', 'en'],
    },
    retryPolicy: {
      maxRetries: 1, // Fewer retries in development
      retryDelay: 1000,
      backoffMultiplier: 1.5,
    },
  },

  // Development Validation (more permissive)
  validation: {
    enableStrictValidation: false,
    requireJustification: false,
    minJustificationLength: 5,
    maxJustificationLength: 1000,
    enableConflictDetection: true,
  },

  // Development Security (less strict)
  security: {
    enableDoubleConfirmation: false, // Disable for easier testing
    confirmationKeyword: 'DELETE',
    enableAuditTrail: true,
    auditRetentionDays: 30, // 30 days for development
  },

  // Development Logging
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: true,
    filePath: './logs/stockpile-service-dev.log',
  },

  // Development CORS (permissive)
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3004', 'http://localhost:8080'],
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
  },
}));
