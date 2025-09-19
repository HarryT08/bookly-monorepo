/**
 * HTTP Exception Filter
 * Provides consistent error response format for all API endpoints
 * Implements Bookly standard error response format
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ValidationError } from 'class-validator';
import { ApiResponseBookly } from '@libs/dto/common/response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const langHeader = request.headers['x-lang'] || request.headers['accept-language'];
    const lang = Array.isArray(langHeader) ? langHeader[0] : langHeader || 'es';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: Record<string, string[]> | undefined;
    let code: string | undefined;
    let type = 'error';

    // Handle HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // Handle validation errors
        if (responseObj.message && Array.isArray(responseObj.message)) {
          errors = this.formatValidationErrors(responseObj.message);
          message = this.i18n.t('common.validation_failed', { lang }) || 'Validation failed';
        } else if (responseObj.message) {
          message = responseObj.message;
        }

        code = responseObj.code;
        type = responseObj.type || 'validation_error';
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }

    // Log error for monitoring
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      {
        path: request.url,
        method: request.method,
        statusCode: status,
        error: exception.message,
        stack: exception.stack,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      }
    );

    // Construct error response following Bookly standard
    const errorResponse: ApiResponseBookly<null> = {
      success: false,
      data: null,
      message: message,
      errors: errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
    };

    // Add additional error details for debugging (non-production)
    if (process.env.NODE_ENV !== 'production') {
      (errorResponse as any).debug = {
        exception: exception.constructor.name,
        stack: exception.stack,
      };
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Format class-validator errors into the standard errors format
   */
  private formatValidationErrors(validationErrors: any[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    validationErrors.forEach((error) => {
      if (typeof error === 'string') {
        // Simple string error
        errors.general = errors.general || [];
        errors.general.push(error);
      } else if (error.property && error.constraints) {
        // class-validator ValidationError format
        const field = error.property;
        errors[field] = Object.values(error.constraints) as string[];
      } else if (error.field && error.message) {
        // Custom field error format
        errors[error.field] = errors[error.field] || [];
        errors[error.field].push(error.message);
      }
    });

    return errors;
  }
}
