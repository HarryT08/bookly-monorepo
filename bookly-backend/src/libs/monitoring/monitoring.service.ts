import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentryService } from './services/sentry.service';
import { OpenTelemetryService } from './services/opentelemetry.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sentryService: SentryService,
    private readonly openTelemetryService: OpenTelemetryService,
  ) {}

  initialize(): void {
    // Initialize Sentry for error tracking
    this.sentryService.initialize();

    // Initialize OpenTelemetry for distributed tracing
    this.openTelemetryService.initialize();
  }

  captureException(error: Error, context?: any): void {
    this.sentryService.captureException(error, context);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: any): void {
    this.sentryService.captureMessage(message, level, context);
  }

  startTransaction(name: string, operation: string): any {
    return this.openTelemetryService.startTransaction(name, operation);
  }

  finishTransaction(transaction: any): void {
    this.openTelemetryService.finishTransaction(transaction);
  }

  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    this.sentryService.addBreadcrumb(message, category, level);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    this.sentryService.setUser(user);
  }

  setTag(key: string, value: string): void {
    this.sentryService.setTag(key, value);
  }

  setContext(key: string, context: any): void {
    this.sentryService.setContext(key, context);
  }
}
