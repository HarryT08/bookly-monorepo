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

// Feature Module
import { ResourcesModule } from './resources.module';

// Health
import { HealthModule } from '@/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CqrsModule,
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
    CommonModule,
    EventBusModule,
    LoggingModule,
    MonitoringModule,
    I18nConfigModule,
    ResourcesModule,
    HealthModule,
  ],
})
export class ResourcesAloneModule {}
