import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService {
  constructor(private readonly configService: ConfigService) {}

  initialize(): void {
    const dsn = this.configService.get('SENTRY_DSN');
    const environment = this.configService.get('SENTRY_ENVIRONMENT') || 'development';

    if (dsn) {
      Sentry.init({
        dsn,
        environment,
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: undefined }),
        ],
      });
      console.log('✅ Sentry initialized successfully');
    } else {
      console.log('⚠️ Sentry DSN not provided, skipping initialization');
    }
  }

  captureException(error: Error, context?: any): void {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional', context);
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: any): void {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional', context);
      }
      Sentry.captureMessage(message, level);
    });
  }

  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
  }

  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  setContext(key: string, context: any): void {
    Sentry.setContext(key, context);
  }

  startTransaction(name: string, operation: string): Sentry.Transaction {
    return Sentry.startTransaction({ name, op: operation });
  }

  finishTransaction(transaction: Sentry.Transaction): void {
    transaction.finish();
  }
}
