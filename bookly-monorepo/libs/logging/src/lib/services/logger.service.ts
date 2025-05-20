import { Injectable, Logger as NestLogger, LoggerService } from '@nestjs/common';

@Injectable()
export class Logger implements LoggerService {
  private readonly context?: string;
  private readonly logger = new NestLogger();

  constructor(context?: string) {
    this.context = context;
  }
  
  private formatContext(context?: unknown): string | undefined {
    if (typeof context === 'string') {
      return context;
    } else if (context && typeof context === 'object') {
      try {
        // Si es un objeto, lo serializa como JSON para contexto adicional
        return `${this.context ?? ''} ${JSON.stringify(context)}`.trim();
      } catch {
        // Si hay error al serializar, solo devolvemos el contexto original
        return this.context;
      }
    }
    return this.context;
  }

  log(message: unknown, context?: unknown): void {
    this.logger.log(message, this.formatContext(context));
  }

  info(message: unknown, context?: unknown): void {
    this.logger.log(message, this.formatContext(context));
  }

  error(message: unknown, trace?: string, context?: unknown): void {
    this.logger.error(message, trace, this.formatContext(context));
  }

  warn(message: unknown, context?: unknown): void {
    this.logger.warn(message, this.formatContext(context));
  }

  debug(message: unknown, context?: unknown): void {
    this.logger.debug(message, this.formatContext(context));
  }

  verbose(message: unknown, context?: unknown): void {
    this.logger.verbose(message, this.formatContext(context));
  }
}
