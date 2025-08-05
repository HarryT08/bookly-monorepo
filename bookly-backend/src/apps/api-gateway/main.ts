import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const logger = new Logger('ApiGateway');
  
  try {
    // Create NestJS application
    const app = await NestFactory.create(ApiGatewayModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Get configuration service
    const configService = app.get(ConfigService);
    const port = configService.get<number>('gateway.service.port', 3000);
    const host = configService.get<string>('gateway.service.host', 'localhost');
    const environment = configService.get<string>('NODE_ENV', 'development');
    const globalPrefix = configService.get<string>('gateway.service.globalPrefix', 'api/v1');

    // Global prefix
    app.setGlobalPrefix(globalPrefix);

    // Security middleware
    const helmetEnabled = configService.get<boolean>('gateway.security.helmet.enabled', true);
    if (helmetEnabled && environment === 'production') {
      app.use(helmet());
    }

    // Compression
    app.use(compression());

    // CORS configuration
    const corsConfig = configService.get('gateway.security.cors');
    app.enableCors({
      origin: corsConfig?.origin || ['http://localhost:3000'],
      credentials: corsConfig?.credentials ?? true,
      methods: corsConfig?.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: corsConfig?.allowedHeaders || ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Swagger documentation
    const swaggerEnabled = configService.get<boolean>('gateway.swagger.enabled', true);
    if (swaggerEnabled) {
      const swaggerConfig = configService.get('gateway.swagger');
      const config = new DocumentBuilder()
        .setTitle(swaggerConfig?.title || 'Bookly API Gateway')
        .setDescription(swaggerConfig?.description || 'Unified API Gateway for Bookly reservation system')
        .setVersion(swaggerConfig?.version || '1.0.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addServer(`http://${host}:${port}`, 'Local Development Server')
        .addTag('Gateway', 'API Gateway management endpoints')
        .addTag('Authentication', 'Authentication proxy endpoints')
        .addTag('Resources', 'Resource management proxy endpoints')
        .addTag('Availability', 'Availability and reservation proxy endpoints')
        .addTag('Stockpile', 'Approval and validation proxy endpoints')
        .addTag('Reports', 'Reports and analytics proxy endpoints')
        .addTag('Health', 'Service health check endpoints')
        .addTag('Monitoring', 'Monitoring and metrics endpoints')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      const swaggerPath = swaggerConfig?.path || 'api/docs';
      SwaggerModule.setup(swaggerPath, app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
        },
      });

      logger.log(`Swagger documentation available at http://${host}:${port}/${swaggerPath}`);
    }

    // Health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'api-gateway',
        version: configService.get('gateway.service.version', '1.0.0'),
        environment,
      });
    });

    // Metrics endpoint
    const metricsEnabled = configService.get<boolean>('gateway.monitoring.metrics.enabled', true);
    if (metricsEnabled) {
      const metricsEndpoint = configService.get<string>('gateway.monitoring.metrics.endpoint', '/metrics');
      app.getHttpAdapter().get(metricsEndpoint, (req, res) => {
        res.status(200).json({
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        });
      });
    }

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    // Start the server
    await app.listen(port, host);
    
    logger.log(`🚀 API Gateway is running on: http://${host}:${port}`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`📚 API Documentation: http://${host}:${port}/${configService.get('gateway.swagger.path', 'api/docs')}`);
    logger.log(`🔗 Global Prefix: /${globalPrefix}`);
    logger.log(`🛡️ Security: ${helmetEnabled ? 'Enabled' : 'Disabled'}`);
    logger.log(`📊 Metrics: ${metricsEnabled ? 'Enabled' : 'Disabled'}`);
    logger.log(`🔄 Load Balancing: ${configService.get('gateway.loadBalancing.strategy', 'round-robin')}`);
    logger.log(`⚡ Rate Limiting: Enabled`);
    logger.log(`💾 Caching: ${configService.get('gateway.cache.enabled', true) ? 'Enabled' : 'Disabled'}`);

    // Log microservice endpoints
    const microservices = configService.get('gateway.microservices');
    if (microservices) {
      logger.log('🔗 Configured Microservices:');
      Object.entries(microservices).forEach(([name, config]: [string, any]) => {
        logger.log(`  - ${name}: ${config.url}`);
      });
    }

  } catch (error) {
    logger.error('Failed to start API Gateway:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
