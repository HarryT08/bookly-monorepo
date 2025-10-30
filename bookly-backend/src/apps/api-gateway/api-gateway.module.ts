import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_FILTER } from '@nestjs/core';

// Configuration
import gatewayConfig from './config/gateway.config';
import developmentConfig from './config/development.config';
import productionConfig from './config/production.config';
import testConfig from './config/test.config';

// Shared Libraries
import { CommonModule } from '@libs/common/common.module';
import { EventBusModule } from '@libs/event-bus/event-bus.module';
import { LoggingModule } from '@libs/logging/logging.module';
import { MonitoringModule } from '@libs/monitoring/monitoring.module';
import { HealthModule } from '../../health/health.module';

// Services
import { RoutingService } from './infrastructure/services/routing.service';
import { LoadBalancerService } from './infrastructure/services/load-balancer.service';
import { CircuitBreakerService } from './infrastructure/services/circuit-breaker.service';
import { RateLimitService } from './infrastructure/services/rate-limit.service';
import { AuthService } from './infrastructure/services/auth.service';
import { ResponseAggregationService } from './infrastructure/services/response-aggregation.service';
import { ObservabilityService } from './infrastructure/services/observability.service';
import { ProtocolTranslationService } from './infrastructure/services/protocol-translation.service';

// Middleware
import { GatewayMiddleware } from './infrastructure/middleware/gateway.middleware';
import { PathTraversalGuardMiddleware } from './infrastructure/middleware/path-traversal-guard.middleware';

// Controllers
import { GatewayController, GatewayManagementController } from './infrastructure/controllers/gateway.controller';

// WebSocket Gateway
import { BooklyWebSocketGateway } from './infrastructure/gateways/websocket.gateway';
import { WebSocketTestController } from './infrastructure/controllers/websocket-test.controller';

// Exception Filters
import { ApiGatewayExceptionFilter } from './infrastructure/filters/api-gateway-exception.filter';

// Legacy services (if they exist)
import { ApiGatewayService } from './application/services/api-gateway.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        gatewayConfig,
        process.env.NODE_ENV === 'production' ? productionConfig :
        process.env.NODE_ENV === 'test' ? testConfig : developmentConfig,
      ],
    }),

    // HTTP Client
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('gateway.proxy.timeout', 30000),
        maxRedirects: 5,
        retries: configService.get<number>('gateway.proxy.retries', 3),
      }),
      inject: [ConfigService],
    }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('gateway.security.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('gateway.security.jwt.expiresIn', '24h'),
        },
      }),
      inject: [ConfigService],
    }),

    // Scheduling for health checks
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('gateway.rateLimit.global.ttl', 60),
        limit: configService.get<number>('gateway.rateLimit.global.limit', 1000),
      } as unknown as ThrottlerModuleOptions),
      inject: [ConfigService],
    }),

    // CQRS Module (provides CommandBus and QueryBus)
    CqrsModule,

    // Shared modules
    CommonModule,
    EventBusModule,
    LoggingModule,
    MonitoringModule,
    HealthModule,
  ],

  controllers: [
    GatewayController,
    GatewayManagementController,
    WebSocketTestController,
  ],

  providers: [
    // Core services
    RoutingService,
    LoadBalancerService,
    CircuitBreakerService,
    RateLimitService,
    AuthService,
    ResponseAggregationService,
    ObservabilityService,
    ProtocolTranslationService,

    // Middleware
    PathTraversalGuardMiddleware,
    GatewayMiddleware,

    // WebSocket Gateway
    BooklyWebSocketGateway,

    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: ApiGatewayExceptionFilter,
    },

    // Legacy service (if exists)
    ApiGatewayService,
  ],

  exports: [
    RoutingService,
    LoadBalancerService,
    CircuitBreakerService,
    RateLimitService,
    AuthService,
    ResponseAggregationService,
    ObservabilityService,
    ProtocolTranslationService,
    BooklyWebSocketGateway,
    ApiGatewayService,
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply path traversal guard FIRST to block malicious requests early
    consumer
      .apply(PathTraversalGuardMiddleware)
      .forRoutes('*');

    // Apply gateway middleware to all routes except management endpoints
    consumer
      .apply(GatewayMiddleware)
      .exclude(
        '_gateway/(.*)',
        'health',
        'metrics'
      )
      .forRoutes('*');
  }
}
