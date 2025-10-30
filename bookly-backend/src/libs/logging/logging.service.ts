import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggingService {
  private readonly logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const logLevel = this.configService.get('LOG_LEVEL') || 'info';
    const logPath = this.configService.get('LOG_FILE_PATH') || './logs';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            context,
            message,
            trace,
            ...meta,
          });
        }),
      ),
      defaultMeta: {
        service: 'bookly-backend',
        environment: this.configService.get('NODE_ENV'),
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
            }),
          ),
        }),

        // File transport for all logs
        new DailyRotateFile({
          filename: `${logPath}/application-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),

        // Separate file for errors
        new DailyRotateFile({
          filename: `${logPath}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
        }),
      ],
    });
  }

  log(message: string, context?: string): void;
  log(message: string, meta?: any, context?: string, p0?: { categoryId: string; userId: string; }): void;
  log(message: string, metaOrContext?: any, context?: string, p0?: { categoryId: string; userId: string; }): void {
    if (typeof metaOrContext === 'string') {
      this.logger.info(message, { context: metaOrContext });
    } else {
      this.logger.info(message, { ...metaOrContext, context });
    }
  }

  error(message: string, trace?: string, context?: string): void;
  error(message: string, error?: any, context?: string): void;
  error(message: string, traceOrError?: any, context?: string): void {
    if (traceOrError instanceof Error) {
      this.logger.error(message, {
        context,
        trace: traceOrError.stack,
        error: {
          name: traceOrError.name,
          message: traceOrError.message,
        },
      });
    } else {
      this.logger.error(message, { context, trace: traceOrError });
    }
  }

  warn(message: string, context?: string): void;
  warn(message: string, meta?: any, context?: string): void;
  warn(message: string, metaOrContext?: any, context?: string): void {
    if (typeof metaOrContext === 'string') {
      this.logger.warn(message, { context: metaOrContext });
    } else {
      this.logger.warn(message, { ...metaOrContext, context });
    }
  }

  debug(message: string, context?: string): void;
  debug(message: string, meta?: any, context?: string): void;
  debug(message: string, metaOrContext?: any, context?: string): void {
    if (typeof metaOrContext === 'string') {
      this.logger.debug(message, { context: metaOrContext });
    } else {
      this.logger.debug(message, { ...metaOrContext, context });
    }
  }

  verbose(message: string, context?: string): void;
  verbose(message: string, meta?: any, context?: string): void;
  verbose(message: string, metaOrContext?: any, context?: string): void {
    if (typeof metaOrContext === 'string') {
      this.logger.verbose(message, { context: metaOrContext });
    } else {
      this.logger.verbose(message, { ...metaOrContext, context });
    }
  }
}
