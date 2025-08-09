import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';


// Shared Libraries
import { CommonModule } from '@common/common.module';
import { EventBusModule } from '@event-bus/event-bus.module';
import { LoggingModule } from '@logging/logging.module';
import { MonitoringModule } from '@monitoring/monitoring.module';
import { I18nConfigModule } from '@i18n/i18n.module';

// Application Services
import { AuthModule } from './apps/auth-service/auth.module';
import { ResourcesModule } from './apps/resources-service/resources.module';
import { AvailabilityModule } from './apps/availability-service/availability.module';
import { StockpileModule } from './apps/stockpile-service/stockpile.module';
import { ReportsModule } from './apps/reports-service/reports.module';
//import { ApiGatewayModule } from './apps/api-gateway/api-gateway.module';

// Health Check
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // CQRS
    CqrsModule,

    // Event System
    EventEmitterModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL) || 60000,
        limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
      },
    ]),

    // Shared Libraries
    CommonModule,
    EventBusModule,
    LoggingModule,
    MonitoringModule,
    I18nConfigModule,

    // Application Services
    AuthModule,
    ResourcesModule,
    AvailabilityModule,
    StockpileModule,
    ReportsModule,
    //ApiGatewayModule,

    // Health Check
    HealthModule,
  ],
})
export class AppModule {}
