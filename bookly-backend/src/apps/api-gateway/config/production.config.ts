import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  // Production-specific overrides
  service: {
    port: parseInt(process.env.PORT, 10) || 3000,
    host: '0.0.0.0',
    globalPrefix: 'api/v1',
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
    db: 5,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },

  // Production RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchange: 'bookly.gateway.prod',
    queue: 'api-gateway-prod',
  },

  // Production Microservices
  microservices: {
    auth: {
      url: process.env.AUTH_SERVICE_URL,
      timeout: 3000,
      retries: 3,
      circuitBreaker: {
        enabled: true,
        threshold: 5,
        timeout: 60000,
      },
    },
    availability: {
      url: process.env.AVAILABILITY_SERVICE_URL,
      timeout: 3000,
      retries: 3,
      circuitBreaker: {
        enabled: true,
        threshold: 5,
        timeout: 60000,
      },
    },
    resources: {
      url: process.env.RESOURCES_SERVICE_URL,
      timeout: 3000,
      retries: 3,
      circuitBreaker: {
        enabled: true,
        threshold: 5,
        timeout: 60000,
      },
    },
    stockpile: {
      url: process.env.STOCKPILE_SERVICE_URL,
      timeout: 3000,
      retries: 3,
      circuitBreaker: {
        enabled: true,
        threshold: 5,
        timeout: 60000,
      },
    },
    reports: {
      url: process.env.REPORTS_SERVICE_URL,
      timeout: 3000,
      retries: 3,
      circuitBreaker: {
        enabled: true,
        threshold: 5,
        timeout: 60000,
      },
    },
  },

  // Production Load Balancing
  loadBalancing: {
    strategy: 'least-connections',
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 3000,
      retries: 3,
    },
  },

  // Production Rate Limiting (strict)
  rateLimit: {
    global: {
      ttl: 60,
      limit: 1000,
    },
    perUser: {
      ttl: 60,
      limit: 100,
    },
    perEndpoint: {
      '/auth/login': {
        ttl: 900, // 15 minutes
        limit: 5,
      },
      '/auth/register': {
        ttl: 3600, // 1 hour
        limit: 3,
      },
    },
  },

  // Production Caching
  cache: {
    enabled: true,
    defaultTtl: 300000, // 5 minutes
    maxSize: 1000,
    strategies: {
      resources: {
        ttl: 600000, // 10 minutes
        enabled: true,
      },
      availability: {
        ttl: 60000, // 1 minute
        enabled: true,
      },
    },
  },

  // Production Security (strict)
  security: {
    helmet: {
      enabled: true,
      contentSecurityPolicy: true,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  },

  // Production Swagger (disabled by default)
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: 'Bookly API Gateway',
    description: 'Production API Gateway for Bookly reservation system',
    version: '1.0.0',
    path: 'api/docs',
  },

  // Production Logging
  logging: {
    level: 'warn',
    enableConsole: false,
    enableFile: true,
    filePath: '/var/log/bookly/api-gateway.log',
    enableRequestLogging: false,
  },

  // Production Monitoring
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
    },
    openTelemetry: {
      enabled: true,
      endpoint: process.env.OTEL_ENDPOINT,
    },
    metrics: {
      enabled: true,
      endpoint: '/metrics',
    },
  },

  // Production Proxy (optimized)
  proxy: {
    timeout: 30000,
    retries: 3,
    keepAlive: true,
    maxSockets: 100,
  },
}));
