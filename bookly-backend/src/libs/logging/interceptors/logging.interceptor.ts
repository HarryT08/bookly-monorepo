/**
 * Logging Interceptor
 * Provides structured logging for all HTTP requests and responses
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress;
    const startTime = Date.now();

    // Log incoming request
    this.logger.log({
      message: 'Incoming Request',
      method,
      url,
      query,
      params,
      body: this.sanitizeBody(body),
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        
        // Log successful response
        this.logger.log({
          message: 'Request Completed',
          method,
          url,
          statusCode: response.statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data).length,
          timestamp: new Date().toISOString(),
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        // Log error response
        this.logger.error({
          message: 'Request Failed',
          method,
          url,
          statusCode: error.status || 500,
          duration: `${duration}ms`,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          timestamp: new Date().toISOString(),
        });

        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'secret',
      'key',
      'credential',
    ];

    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
