/**
 * Correlation ID Middleware
 * Implements distributed tracing across microservices
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export interface CorrelationContext {
  correlationId: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  userId?: string;
  userEmail?: string;
  service: string;
  operation?: string;
  startTime: number;
}

// Global async local storage for correlation context
export const correlationStorage = new AsyncLocalStorage<CorrelationContext>();

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly serviceName: string = 'unknown-service') {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract or generate correlation ID
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    const traceId = req.headers['x-trace-id'] as string || uuidv4();
    const parentSpanId = req.headers['x-parent-span-id'] as string;
    const spanId = uuidv4();

    // Extract user information from JWT if available
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    let userEmail: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.sub;
        userEmail = payload.email;
      } catch (error) {
        // Ignore JWT parsing errors
      }
    }

    // Create correlation context
    const context: CorrelationContext = {
      correlationId,
      traceId,
      spanId,
      parentSpanId,
      userId,
      userEmail,
      service: this.serviceName,
      operation: `${req.method} ${req.path}`,
      startTime: Date.now(),
    };

    // Set response headers for downstream services
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-span-id', spanId);

    // Store context in async local storage
    correlationStorage.run(context, () => {
      next();
    });
  }
}

/**
 * Get current correlation context
 */
export function getCorrelationContext(): CorrelationContext | undefined {
  return correlationStorage.getStore();
}

/**
 * Get correlation ID from current context
 */
export function getCorrelationId(): string | undefined {
  return getCorrelationContext()?.correlationId;
}

/**
 * Get trace ID from current context
 */
export function getTraceId(): string | undefined {
  return getCorrelationContext()?.traceId;
}

/**
 * Get span ID from current context
 */
export function getSpanId(): string | undefined {
  return getCorrelationContext()?.spanId;
}

/**
 * Create child span context
 */
export function createChildSpan(operation: string): CorrelationContext {
  const parentContext = getCorrelationContext();
  
  if (!parentContext) {
    throw new Error('No parent correlation context found');
  }

  return {
    ...parentContext,
    spanId: uuidv4(),
    parentSpanId: parentContext.spanId,
    operation,
    startTime: Date.now(),
  };
}

/**
 * Execute function with child span context
 */
export function withChildSpan<T>(operation: string, fn: () => T): T {
  const childContext = createChildSpan(operation);
  return correlationStorage.run(childContext, fn);
}

/**
 * Execute async function with child span context
 */
export async function withChildSpanAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const childContext = createChildSpan(operation);
  return correlationStorage.run(childContext, fn);
}

/**
 * Get headers for outgoing HTTP requests
 */
export function getTracingHeaders(): Record<string, string> {
  const context = getCorrelationContext();
  
  if (!context) {
    return {};
  }

  return {
    'x-correlation-id': context.correlationId,
    'x-trace-id': context.traceId,
    'x-parent-span-id': context.spanId,
  };
}

/**
 * Create correlation context from headers (for event handlers)
 */
export function createContextFromHeaders(headers: Record<string, string>, serviceName: string): CorrelationContext {
  return {
    correlationId: headers['x-correlation-id'] || uuidv4(),
    traceId: headers['x-trace-id'] || uuidv4(),
    spanId: uuidv4(),
    parentSpanId: headers['x-parent-span-id'],
    service: serviceName,
    startTime: Date.now(),
  };
}
