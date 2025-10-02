import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode, Span } from '@opentelemetry/api';

@Injectable()
export class OpenTelemetryService {
  private sdk: NodeSDK;
  private currentSpan: Span | null = null;

  addBreadcrumb(message: string, category: string, level: string): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent('breadcrumb', {
        message,
        category,
        level,
        timestamp: Date.now(),
      });
    }
  }

  setUser(user: { id: string; email?: string; username?: string; }): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttributes({
        'user.id': user.id,
        'user.email': user.email || '',
        'user.username': user.username || '',
      });
    }
  }

  setTag(key: string, value: string): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute(key, value);
    }
  }

  setContext(key: string, context: any): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute(`context.${key}`, JSON.stringify(context));
    }
  }

  constructor(private readonly configService: ConfigService) {}

  initialize(): void {
    const serviceName = this.configService.get('OTEL_SERVICE_NAME') || 'bookly-backend';
    const endpoint = this.configService.get('OTEL_EXPORTER_OTLP_ENDPOINT');

    this.sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.configService.get('NODE_ENV') || 'development',
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });

    try {
      this.sdk.start();
      console.log('✅ OpenTelemetry initialized successfully');
    } catch (error) {
      console.log('⚠️ OpenTelemetry initialization failed:', error.message);
    }
  }

  startTransaction(name: string, operation: string): Span {
    const tracer = trace.getTracer('bookly-backend');
    const span = tracer.startSpan(name, {
      attributes: {
        'operation.type': operation,
        'service.name': 'bookly-backend',
      },
    });
    this.currentSpan = span;
    return span;
  }

  finishTransaction(transaction: Span): void {
    if (transaction) {
      transaction.setStatus({ code: SpanStatusCode.OK });
      transaction.end();
      if (this.currentSpan === transaction) {
        this.currentSpan = null;
      }
    }
  }

  shutdown(): Promise<void> {
    return this.sdk.shutdown();
  }
}
