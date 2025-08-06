import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentryService } from './services/sentry.service';
import { OpenTelemetryService } from './services/opentelemetry.service';

@Injectable()
export class MonitoringService {
  recordMetric: any;
  startTrace: any;
  finishTrace: any;
  addTraceTag: any;
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
    this.startTrace = this.openTelemetryService.startTransaction(name, operation);
    return this.openTelemetryService.startTransaction(name, operation);
  }

  finishTransaction(transaction: any): void {
    this.finishTrace = this.openTelemetryService.finishTransaction(transaction);
    this.openTelemetryService.finishTransaction(transaction);
  }

  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    this.sentryService.addBreadcrumb(message, category, level);
    this.openTelemetryService.addBreadcrumb(message, category, level);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    this.sentryService.setUser(user);
    this.openTelemetryService.setUser(user);
  }

  setTag(key: string, value: string): void {
    this.sentryService.setTag(key, value);
    this.openTelemetryService.setTag(key, value);
  }

  setContext(key: string, context: any): void {
    this.sentryService.setContext(key, context);
    this.openTelemetryService.setContext(key, context);
  }
}
