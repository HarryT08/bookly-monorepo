/**
 * Prisma Exception Filter
 * Handles Prisma-specific database exceptions and converts them to HTTP responses
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ErrorResponse } from './all-exceptions.filter';

@Catch(PrismaClientKnownRequestError, PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError | PrismaClientValidationError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: string;

    if (exception instanceof PrismaClientKnownRequestError) {
      const { code: prismaCode, meta } = exception;
      
      switch (prismaCode) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = this.getUniqueConstraintMessage(meta);
          code = 'DUPLICATE_ENTRY';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found or has been deleted';
          code = 'RECORD_NOT_FOUND';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          code = 'FOREIGN_KEY_CONSTRAINT';
          break;
        case 'P2014':
          status = HttpStatus.BAD_REQUEST;
          message = 'The change would violate a required relation';
          code = 'REQUIRED_RELATION_VIOLATION';
          break;
        case 'P2015':
          status = HttpStatus.NOT_FOUND;
          message = 'A related record could not be found';
          code = 'RELATED_RECORD_NOT_FOUND';
          break;
        case 'P2016':
          status = HttpStatus.BAD_REQUEST;
          message = 'Query interpretation error';
          code = 'QUERY_INTERPRETATION_ERROR';
          break;
        case 'P2017':
          status = HttpStatus.BAD_REQUEST;
          message = 'The records for relation are not connected';
          code = 'RECORDS_NOT_CONNECTED';
          break;
        case 'P2018':
          status = HttpStatus.BAD_REQUEST;
          message = 'The required connected records were not found';
          code = 'REQUIRED_CONNECTED_RECORDS_NOT_FOUND';
          break;
        case 'P2019':
          status = HttpStatus.BAD_REQUEST;
          message = 'Input error';
          code = 'INPUT_ERROR';
          break;
        case 'P2020':
          status = HttpStatus.BAD_REQUEST;
          message = 'Value out of range for the type';
          code = 'VALUE_OUT_OF_RANGE';
          break;
        case 'P2021':
          status = HttpStatus.NOT_FOUND;
          message = 'The table does not exist in the current database';
          code = 'TABLE_NOT_EXISTS';
          break;
        case 'P2022':
          status = HttpStatus.NOT_FOUND;
          message = 'The column does not exist in the current database';
          code = 'COLUMN_NOT_EXISTS';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database operation failed';
          code = 'DATABASE_ERROR';
          break;
      }
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      code = 'VALIDATION_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database error occurred';
      code = 'DATABASE_ERROR';
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: this.generateErrorCode(status, request.url),
        message,
        type: 'error',
        exception_code: code,
        http_code: status,
        http_exception: 'PrismaException',
        details: {
          prismaCode: exception instanceof PrismaClientKnownRequestError ? exception.code : 'VALIDATION',
          meta: exception instanceof PrismaClientKnownRequestError ? exception.meta : undefined,
        },
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    // Log the error
    this.logger.error({
      message: 'Prisma exception caught',
      error: {
        name: exception.constructor.name,
        message: exception.message,
        code: exception instanceof PrismaClientKnownRequestError ? exception.code : 'VALIDATION',
        meta: exception instanceof PrismaClientKnownRequestError ? exception.meta : undefined,
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

  private generateErrorCode(status: number, path: string): string {
    const serviceCode = this.getServiceCode(path);
    const statusCode = status.toString().padStart(3, '0');
    return `${serviceCode}-${statusCode}`;
  }

  private getServiceCode(path: string): string {
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

  private getUniqueConstraintMessage(meta: any): string {
    if (meta?.target) {
      const fields = Array.isArray(meta.target) ? meta.target.join(', ') : meta.target;
      return `A record with the same ${fields} already exists`;
    }
    return 'A record with the same unique field already exists';
  }
}
