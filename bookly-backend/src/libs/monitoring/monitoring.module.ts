import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitoringService } from './monitoring.service';
import { SentryService } from './services/sentry.service';
import { OpenTelemetryService } from './services/opentelemetry.service';
import { EventMetricsService } from './services/event-metrics.service';
import { HealthDashboardService } from './services/health-dashboard.service';
import { EventBusModule } from '@libs/event-bus/event-bus.module';
import { LoggingModule } from '@libs/logging/logging.module';

@Global()
@Module({
  imports: [ConfigModule, EventBusModule, LoggingModule],
  providers: [
    MonitoringService, 
    SentryService, 
    OpenTelemetryService,
    EventMetricsService,
    HealthDashboardService,
  ],
  exports: [
    MonitoringService, 
    SentryService, 
    OpenTelemetryService,
    EventMetricsService,
    HealthDashboardService,
  ],
})
export class MonitoringModule {}
