import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { LoggingService } from '@logging/logging.service';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly i18n: I18nService,
    private readonly loggingService: LoggingService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL-500';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        code = responseObj.code || `HTTP-${status}`;
      } else {
        message = exceptionResponse as string;
      }
    }

    const errorResponse = {
      code,
      message: this.i18n.t(`errors.${code}`, { 
        lang: (request.headers['x-lang'] || 'es').toString(),
        defaultValue: message 
      }),
      type: 'error',
      exception_code: code,
      http_code: status,
      http_exception: exception.constructor.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log the error
    this.loggingService.error(
      `HTTP ${status} Error: ${message}`,
      {
        exception: exception.constructor.name,
        path: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      'ExceptionFilter',
    );

    response.status(status).json(errorResponse);
  }
}
