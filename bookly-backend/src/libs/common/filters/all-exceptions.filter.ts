/**
 * All Exceptions Filter
 * Global exception filter for handling all types of exceptions
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    exception_code?: string;
    http_code: number;
    http_exception: string;
    details?: any;
  };
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  protected readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: string;
    let exceptionName: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse as string;
      }
      
      exceptionName = exception.constructor.name;
      code = this.generateErrorCode(status, request.url);
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
      exceptionName = exception.constructor.name;
      code = this.generateErrorCode(status, request.url);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error occurred';
      exceptionName = 'UnknownException';
      code = this.generateErrorCode(status, request.url);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        type: this.getErrorType(status),
        exception_code: this.generateExceptionCode(status),
        http_code: status,
        http_exception: exceptionName,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    // Log the error
    this.logger.error({
      message: 'Exception caught',
      error: {
        name: exceptionName,
        message,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
        query: request.query,
        params: request.params,
      },
      user: (request as any).user?.id,
      timestamp: new Date().toISOString(),
    });

    response.status(status).json(errorResponse);
  }

  protected generateErrorCode(status: number, path: string): string {
    const serviceCode = this.getServiceCode(path);
    const statusCode = status.toString().padStart(3, '0');
    return `${serviceCode}-${statusCode}`;
  }

  protected getServiceCode(path: string): string {
    if (path.includes('/auth')) return 'AUTH';
    if (path.includes('/resources')) return 'RSRC';
    if (path.includes('/availability')) return 'AVLB';
    if (path.includes('/stockpile')) return 'STCK';
    if (path.includes('/reports')) return 'RPTS';
    if (path.includes('/waiting-list')) return 'WAIT';
    if (path.includes('/reassignment')) return 'RSGN';
    if (path.includes('/recurring')) return 'RECR';
    return 'GNRL';
  }

  protected generateExceptionCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'E-01',
      401: 'E-02',
      403: 'E-03',
      404: 'E-04',
      409: 'E-05',
      422: 'E-06',
      429: 'E-07',
      500: 'E-08',
      502: 'E-09',
      503: 'E-10',
    };
    return codeMap[status] || 'E-99';
  }

  protected getErrorType(status: number): 'error' | 'warning' | 'info' {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warning';
    return 'info';
  }
}
