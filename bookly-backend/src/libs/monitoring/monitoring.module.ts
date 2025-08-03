import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitoringService } from './monitoring.service';
import { SentryService } from './services/sentry.service';
import { OpenTelemetryService } from './services/opentelemetry.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MonitoringService, SentryService, OpenTelemetryService],
  exports: [MonitoringService, SentryService, OpenTelemetryService],
})
export class MonitoringModule {}
