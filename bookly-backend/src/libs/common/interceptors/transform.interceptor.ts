/**
 * Transform Interceptor
 * Provides consistent response transformation for all API endpoints
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  method: string;
  statusCode: number;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Handle paginated responses
        if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
          const { data: items, total, page, limit, ...rest } = data;
          return {
            success: true,
            data: items,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: response.statusCode,
            meta: {
              page: page || 1,
              limit: limit || 20,
              total,
              totalPages: Math.ceil(total / (limit || 20)),
              ...rest,
            },
          };
        }

        // Handle regular responses
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          statusCode: response.statusCode,
        };
      }),
    );
  }
}
