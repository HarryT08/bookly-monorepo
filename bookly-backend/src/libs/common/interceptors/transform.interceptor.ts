/**
 * Transform Interceptor
 * Provides consistent response transformation for all API endpoints
 * Implements Bookly standard response format
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
import { I18nService } from 'nestjs-i18n';
import { ApiResponseBookly, PaginationMeta } from '@libs/dto/common/response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponseBookly<T>> {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseBookly<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();
    const lang = request.headers['x-lang'] || request.headers['accept-language'] || 'es';

    return next.handle().pipe(
      map((data) => {
        const baseResponse: ApiResponseBookly<T> = {
          success: true,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          statusCode: response.statusCode,
        };

        // Handle paginated responses with meta
        if (this.isPaginatedResponse(data)) {
          const { data: items, total, page, limit, ...rest } = data;
          const meta: PaginationMeta = {
            page: page || 1,
            limit: limit || 20,
            total,
            totalPages: Math.ceil(total / (limit || 20)),
          };

          return {
            ...baseResponse,
            data: items,
            meta,
            message: this.i18n.t('common.success', { lang }) || 'Operation completed successfully',
          };
        }

        // Handle list responses (array data)
        if (Array.isArray(data)) {
          return {
            ...baseResponse,
            data,
            message: this.i18n.t('common.list_retrieved', { lang }) || 'List retrieved successfully',
          };
        }

        // Handle single item responses
        if (data && typeof data === 'object' && !('data' in data)) {
          return {
            ...baseResponse,
            data,
            message: this.i18n.t('common.success', { lang }) || 'Operation completed successfully',
          };
        }

        // Handle pre-formatted responses (already contain success, data, etc.)
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...baseResponse,
            ...data,
          };
        }

        // Handle regular responses
        return {
          ...baseResponse,
          data,
          message: this.i18n.t('common.success', { lang }) || 'Operation completed successfully',
        };
      }),
    );
  }

  /**
   * Check if response is paginated format
   */
  private isPaginatedResponse(data: any): data is {
    data: any[];
    total: number;
    page?: number;
    limit?: number;
  } {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'total' in data &&
      Array.isArray(data.data) &&
      typeof data.total === 'number'
    );
  }
}
