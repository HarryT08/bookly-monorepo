import { registerAs } from '@nestjs/config';

export default registerAs('development', () => ({
  // Development-specific overrides
  service: {
    port: 3000,
    host: 'localhost',
    globalPrefix: 'api/v1',
  },

  // Development Database
  database: {
    url: 'mongodb://localhost:27017/bookly-gateway-dev',
    logging: true,
    synchronize: false,
  },

  // Development Redis
  redis: {
    host: 'localhost',
    port: 6379,
    db: 5,
  },

  // Development RabbitMQ
  rabbitmq: {
    url: 'amqp://localhost:5672',
    exchange: 'bookly.gateway.dev',
    queue: 'api-gateway-dev',
  },

  // Development Microservices (local)
  microservices: {
    auth: {
      url: 'http://localhost:3001',
      timeout: 10000,
      retries: 1,
      circuitBreaker: {
        enabled: false, // Disable for development
        threshold: 10,
        timeout: 30000,
      },
    },
    availability: {
      url: 'http://localhost:3002',
      timeout: 10000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 30000,
      },
    },
    resources: {
      url: 'http://localhost:3003',
      timeout: 10000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 30000,
      },
    },
    stockpile: {
      url: 'http://localhost:3004',
      timeout: 10000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 30000,
      },
    },
    reports: {
      url: 'http://localhost:3005',
      timeout: 10000,
      retries: 1,
      circuitBreaker: {
        enabled: false,
        threshold: 10,
        timeout: 30000,
      },
    },
  },

  // Development Load Balancing
  loadBalancing: {
    strategy: 'round-robin',
    healthCheck: {
      enabled: true,
      interval: 10000, // 10 seconds
      timeout: 5000,
      retries: 1,
    },
  },

  // Development Rate Limiting (permissive)
  rateLimit: {
    global: {
      ttl: 60,
      limit: 10000,
    },
    perUser: {
      ttl: 60,
      limit: 1000,
    },
    perEndpoint: {
      '/auth/login': {
        ttl: 300, // 5 minutes
        limit: 20,
      },
      '/auth/register': {
        ttl: 3600, // 1 hour
        limit: 10,
      },
    },
  },

  // Development Caching
  cache: {
    enabled: true,
    defaultTtl: 60000, // 1 minute
    maxSize: 100,
    strategies: {
      resources: {
        ttl: 120000, // 2 minutes
        enabled: true,
      },
      availability: {
        ttl: 30000, // 30 seconds
        enabled: true,
      },
    },
  },

  // Development Security (less strict)
  security: {
    helmet: {
      enabled: false, // Disable for development
      contentSecurityPolicy: false,
    },
    jwt: {
      secret: 'dev-secret-key-change-in-production',
      expiresIn: '24h',
    },
    cors: {
      origin: [
        'http://localhost:3000', 
        'http://localhost:8080', 
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

  // Development Swagger (enabled)
  swagger: {
    enabled: true,
    title: 'Bookly API Gateway (Development)',
    description: 'Development API Gateway for Bookly reservation system',
    version: '1.0.0-dev',
    path: 'api/docs',
  },

  // Development Logging
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: true,
    filePath: './logs/api-gateway-dev.log',
    enableRequestLogging: true,
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
    metrics: {
      enabled: true,
      endpoint: '/metrics',
    },
  },

  // Development Proxy (more permissive)
  proxy: {
    timeout: 60000, // 1 minute
    retries: 1,
    keepAlive: true,
    maxSockets: 50,
  },
}));
