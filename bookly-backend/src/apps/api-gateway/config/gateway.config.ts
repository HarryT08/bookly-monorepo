import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
  // Service Configuration
  service: {
    name: 'api-gateway',
    port: parseInt(process.env.API_GATEWAY_PORT, 10) || 3000,
    host: process.env.API_GATEWAY_HOST || 'localhost',
    version: process.env.API_GATEWAY_VERSION || '1.0.0',
    globalPrefix: process.env.API_GLOBAL_PREFIX || 'api/v1',
  },

  // Database Configuration (for gateway-specific data)
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/bookly-gateway',
  },

  // Redis Configuration (for caching and rate limiting)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 5,
  },

  // RabbitMQ Configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'bookly.gateway',
    queue: process.env.RABBITMQ_QUEUE || 'api-gateway',
  },

  // Microservices Configuration
  microservices: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      docsPath: 'api/docs-json',
      timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT, 10) || 3000,
      retries: parseInt(process.env.AUTH_SERVICE_RETRIES, 10) || 3,
      circuitBreaker: {
        enabled: process.env.AUTH_CIRCUIT_BREAKER_ENABLED !== 'false',
        threshold: parseInt(process.env.AUTH_CIRCUIT_BREAKER_THRESHOLD, 10) || 5,
        timeout: parseInt(process.env.AUTH_CIRCUIT_BREAKER_TIMEOUT, 10) || 60000,
      }
    },
    availability: {
      url: process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3003',
      docsPath: 'api/docs-json',
      timeout: parseInt(process.env.AVAILABILITY_SERVICE_TIMEOUT, 10) || 3000,
      retries: parseInt(process.env.AVAILABILITY_SERVICE_RETRIES, 10) || 3,
      circuitBreaker: {
        enabled: process.env.AVAILABILITY_CIRCUIT_BREAKER_ENABLED !== 'false',
        threshold: parseInt(process.env.AVAILABILITY_CIRCUIT_BREAKER_THRESHOLD, 10) || 5,
        timeout: parseInt(process.env.AVAILABILITY_CIRCUIT_BREAKER_TIMEOUT, 10) || 60000,
      },
    },
    resources: {
      url: process.env.RESOURCES_SERVICE_URL || 'http://localhost:3002',
      docsPath: 'api/docs-json',
      timeout: parseInt(process.env.RESOURCES_SERVICE_TIMEOUT, 10) || 3000,
      retries: parseInt(process.env.RESOURCES_SERVICE_RETRIES, 10) || 3,
      circuitBreaker: {
        enabled: process.env.RESOURCES_CIRCUIT_BREAKER_ENABLED !== 'false',
        threshold: parseInt(process.env.RESOURCES_CIRCUIT_BREAKER_THRESHOLD, 10) || 5,
        timeout: parseInt(process.env.RESOURCES_CIRCUIT_BREAKER_TIMEOUT, 10) || 60000,
      },
    },
    stockpile: {
      url: process.env.STOCKPILE_SERVICE_URL || 'http://localhost:3004',
      docsPath: 'api/docs-json',
      timeout: parseInt(process.env.STOCKPILE_SERVICE_TIMEOUT, 10) || 3000,
      retries: parseInt(process.env.STOCKPILE_SERVICE_RETRIES, 10) || 3,
      circuitBreaker: {
        enabled: process.env.STOCKPILE_CIRCUIT_BREAKER_ENABLED !== 'false',
        threshold: parseInt(process.env.STOCKPILE_CIRCUIT_BREAKER_THRESHOLD, 10) || 5,
        timeout: parseInt(process.env.STOCKPILE_CIRCUIT_BREAKER_TIMEOUT, 10) || 60000,
      },
    },
    reports: {
      url: process.env.REPORTS_SERVICE_URL || 'http://localhost:3005',
      docsPath: 'api/docs-json',
      timeout: parseInt(process.env.REPORTS_SERVICE_TIMEOUT, 10) || 3000,
      retries: parseInt(process.env.REPORTS_SERVICE_RETRIES, 10) || 3,
      circuitBreaker: {
        enabled: process.env.REPORTS_CIRCUIT_BREAKER_ENABLED !== 'false',
        threshold: parseInt(process.env.REPORTS_CIRCUIT_BREAKER_THRESHOLD, 10) || 5,
        timeout: parseInt(process.env.REPORTS_CIRCUIT_BREAKER_TIMEOUT, 10) || 60000,
      },
    },
  },

  // Load Balancing Configuration
  loadBalancing: {
    strategy: process.env.LOAD_BALANCING_STRATEGY || 'round-robin', // round-robin, least-connections, weighted
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || 30000, // 30 seconds
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT, 10) || 3000,
      retries: parseInt(process.env.HEALTH_CHECK_RETRIES, 10) || 3,
    },
  },

  // Rate Limiting Configuration
  rateLimit: {
    global: {
      ttl: parseInt(process.env.GLOBAL_RATE_LIMIT_TTL, 10) || 60,
      limit: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX, 10) || 1000,
    },
    perUser: {
      ttl: parseInt(process.env.USER_RATE_LIMIT_TTL, 10) || 60,
      limit: parseInt(process.env.USER_RATE_LIMIT_MAX, 10) || 100,
    },
    perEndpoint: {
      '/auth/login': {
        ttl: parseInt(process.env.LOGIN_RATE_LIMIT_TTL, 10) || 900, // 15 minutes
        limit: parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 5,
      },
      '/auth/register': {
        ttl: parseInt(process.env.REGISTER_RATE_LIMIT_TTL, 10) || 3600, // 1 hour
        limit: parseInt(process.env.REGISTER_RATE_LIMIT_MAX, 10) || 3,
      },
    },
  },

  // Caching Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL, 10) || 300000, // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE, 10) || 1000,
    strategies: {
      resources: {
        ttl: parseInt(process.env.RESOURCES_CACHE_TTL, 10) || 600000, // 10 minutes
        enabled: process.env.RESOURCES_CACHE_ENABLED !== 'false',
      },
      availability: {
        ttl: parseInt(process.env.AVAILABILITY_CACHE_TTL, 10) || 60000, // 1 minute
        enabled: process.env.AVAILABILITY_CACHE_ENABLED !== 'false',
      },
    },
  },

  // Security Configuration
  security: {
    helmet: {
      enabled: process.env.HELMET_ENABLED !== 'false',
      contentSecurityPolicy: process.env.CSP_ENABLED !== 'false',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:4200',
        'https://localhost:4200',
        'http://127.0.0.1:4200',
        'https://127.0.0.1:4200'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    },
  },

  // Swagger/OpenAPI Configuration
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    title: process.env.SWAGGER_TITLE || 'Bookly API Gateway',
    description: process.env.SWAGGER_DESCRIPTION || 'API Gateway for Bookly reservation system',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    path: process.env.SWAGGER_PATH || 'api/docs',
    aggregate: process.env.SWAGGER_AGGREGATE || false
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    enableConsole: process.env.LOG_ENABLE_CONSOLE === 'true',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/api-gateway.log',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
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
    metrics: {
      enabled: process.env.METRICS_ENABLED !== 'false',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics',
    },
  },

  // Proxy Configuration
  proxy: {
    timeout: parseInt(process.env.PROXY_TIMEOUT, 10) || 30000,
    retries: parseInt(process.env.PROXY_RETRIES, 10) || 3,
    keepAlive: process.env.PROXY_KEEP_ALIVE !== 'false',
    maxSockets: parseInt(process.env.PROXY_MAX_SOCKETS, 10) || 100,
  },
}));
