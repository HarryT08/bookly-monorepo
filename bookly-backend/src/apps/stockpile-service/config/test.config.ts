import { registerAs } from '@nestjs/config';

export default registerAs('test', () => ({
  // Test-specific overrides
  service: {
    port: 3004,
    host: 'localhost',
  },

  // Test Database
  database: {
    url: 'mongodb://localhost:27017/bookly-stockpile-test',
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
    exchange: 'bookly.stockpile.test',
    queue: 'stockpile-service-test',
  },

  // Test Approval Flow (fast for testing)
  approvalFlow: {
    defaultTimeout: 60000, // 1 minute for tests
    maxApprovalLevels: 3,
    enableAutoApproval: true,
    autoApprovalThreshold: 1, // 1 minute
    reminderInterval: 5000, // 5 seconds
    maxReminders: 1,
  },

  // Test Document Generation
  documents: {
    templatePath: './test-templates/documents',
    outputPath: './test-generated/documents',
    defaultFormat: 'pdf',
    supportedFormats: ['pdf', 'txt'],
    maxFileSize: 1048576, // 1MB for tests
    enableDigitalSignature: false,
    signatureProvider: 'mock',
  },

  // Test Notifications (disabled)
  notifications: {
    enabled: false,
    channels: {
      email: {
        enabled: false,
        provider: 'mock',
        from: 'test-noreply@bookly.ufps.edu.co',
      },
      sms: {
        enabled: false,
        provider: 'mock',
      },
      whatsapp: {
        enabled: false,
        provider: 'mock',
      },
      push: {
        enabled: false,
        provider: 'mock',
      },
    },
    templates: {
      path: './test-templates/notifications',
      defaultLanguage: 'es',
      supportedLanguages: ['es'],
    },
    retryPolicy: {
      maxRetries: 0, // No retries in tests
      retryDelay: 100,
      backoffMultiplier: 1,
    },
  },

  // Test Validation (permissive)
  validation: {
    enableStrictValidation: false,
    requireJustification: false,
    minJustificationLength: 1,
    maxJustificationLength: 100,
    enableConflictDetection: false, // Disable for simpler tests
  },

  // Test Security (permissive)
  security: {
    enableDoubleConfirmation: false,
    confirmationKeyword: 'DELETE',
    enableAuditTrail: false, // Disable for faster tests
    auditRetentionDays: 1,
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
  },
}));
