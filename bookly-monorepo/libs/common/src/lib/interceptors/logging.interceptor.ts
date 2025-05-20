import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    const userAgent = request.get('user-agent') || '';
    const requestId = request.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    const requestInfo = {
      method,
      url,
      body,
      params,
      query,
      userAgent,
      requestId,
    };

    // Log request details at debug level to avoid cluttering logs in production
    this.logger.debug(`Request: ${JSON.stringify(requestInfo)}`);
    
    const now = Date.now();
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = typeof data === 'object' ? '*** Response data ***' : data;
          this.logger.log(`Response [${requestId}] (${Date.now() - now}ms): ${response}`);
        },
        error: (error) => {
          this.logger.error(
            `Error [${requestId}] (${Date.now() - now}ms): ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
