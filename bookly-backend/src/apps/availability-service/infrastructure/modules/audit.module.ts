/**
 * Audit Module
 * Integrates all auditing components for the availability-service
 * Provides comprehensive audit capabilities for tracking operations
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingService } from '@logging/logging.service';
import { EventBusService } from '@event-bus/services/event-bus.service';
import { AuditService } from '../services/audit.service';
import { AuditMiddleware } from '../middleware/audit.middleware';
import { AuditInterceptor } from '../interceptors/audit.interceptor';
import { AuditRepository } from '../repositories/audit.repository';
import { AuditController } from '../controllers/audit.controller';

@Module({
  imports: [],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditRepository,
    AuditMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    LoggingService,
    EventBusService,
  ],
  exports: [
    AuditService,
    AuditRepository,
    AuditMiddleware,
  ],
})
export class AuditModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply audit middleware to all routes
    consumer
      .apply(AuditMiddleware)
      .forRoutes('*');
  }
}
