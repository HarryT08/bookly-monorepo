import { registerAs } from '@nestjs/config';

export default registerAs('test', () => ({
  // Test-specific overrides
  service: {
    port: 3000,
    host: 'localhost',
    globalPrefix: 'api/v1',
  },

  // Test Database
  database: {
    url: 'mongodb://localhost:27017/bookly-gateway-test',
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
    exchange: 'bookly.gateway.test',
    queue: 'api-gateway-test',
  },

  // Test Microservices (mock)
  microservices: {
    auth: {
      url: 'http://localhost:3001',
      timeout: 1000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 10000,
      },
    },
    availability: {
      url: 'http://localhost:3002',
      timeout: 1000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 10000,
      },
    },
    resources: {
      url: 'http://localhost:3003',
      timeout: 1000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 10000,
      },
    },
    stockpile: {
      url: 'http://localhost:3004',
      timeout: 1000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 10000,
      },
    },
    reports: {
      url: 'http://localhost:3005',
      timeout: 1000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 10000,
      },
    },
  },

  // Test Load Balancing (disabled)
  loadBalancing: {
    strategy: 'round-robin',
    healthCheck: {
      enabled: false,
      interval: 1000,
      timeout: 500,
      retries: 1,
    },
  },

  // Test Rate Limiting (disabled)
  rateLimit: {
    global: {
      ttl: 60,
      limit: 10000,
    },
    perUser: {
      ttl: 60,
      limit: 10000,
    },
    perEndpoint: {
      '/auth/login': {
        ttl: 60,
        limit: 1000,
      },
      '/auth/register': {
        ttl: 60,
        limit: 1000,
      },
    },
  },

  // Test Caching (disabled)
  cache: {
    enabled: false,
    defaultTtl: 1000,
    maxSize: 10,
    strategies: {
      resources: {
        ttl: 1000,
        enabled: false,
      },
      availability: {
        ttl: 1000,
        enabled: false,
      },
    },
  },

  // Test Security (permissive)
  security: {
    helmet: {
      enabled: false,
      contentSecurityPolicy: false,
    },
    jwt: {
      secret: 'test-secret-key',
      expiresIn: '1h',
    },
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
  },

  // Test Swagger (disabled)
  swagger: {
    enabled: false,
    title: 'Bookly API Gateway (Test)',
    description: 'Test API Gateway for Bookly reservation system',
    version: '1.0.0-test',
    path: 'api/docs',
  },

  // Test Logging (minimal)
  logging: {
    level: 'error',
    enableConsole: false,
    enableFile: false,
    enableRequestLogging: false,
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
    metrics: {
      enabled: false,
    },
  },

  // Test Proxy (fast)
  proxy: {
    timeout: 1000,
    retries: 1,
    keepAlive: false,
    maxSockets: 10,
  },
}));
