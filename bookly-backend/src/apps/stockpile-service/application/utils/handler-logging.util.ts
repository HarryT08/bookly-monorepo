import { LoggingService } from '@libs/logging/logging.service';
import { LoggingHelper } from '@libs/logging/logging.helper';

/**
 * Utility class to standardize logging patterns across CQRS handlers
 * Eliminates code duplication by providing consistent logging methods
 */
export class HandlerLoggingUtil {
  /**
   * Log the start of a command handler execution
   */
  static logCommandStart(
    loggingService: LoggingService,
    handlerName: string,
    command: any,
    customMessage?: string
  ): void {
    const message = customMessage || `Orchestrating ${this.getOperationName(handlerName)} command`;
    loggingService.log(message, handlerName, LoggingHelper.logParams({ command }));
  }

  /**
   * Log the start of a query handler execution
   */
  static logQueryStart(
    loggingService: LoggingService,
    handlerName: string,
    query: any,
    customMessage?: string
  ): void {
    const message = customMessage || `Orchestrating ${this.getOperationName(handlerName)} query`;
    loggingService.log(message, handlerName, LoggingHelper.logParams(query));
  }

  /**
   * Log the start of an event handler execution
   */
  static logEventStart(
    loggingService: LoggingService,
    handlerName: string,
    event: any,
    customMessage?: string
  ): void {
    const message = customMessage || `Handling ${this.getEventName(handlerName)} event`;
    loggingService.log(message, handlerName, LoggingHelper.logParams(event));
  }

  /**
   * Log the completion of a handler execution
   */
  static logCompletion(
    loggingService: LoggingService,
    handlerName: string,
    data?: any,
    customMessage?: string
  ): void {
    const message = customMessage || `${this.getOperationName(handlerName)} completed`;
    const logData = data ? LoggingHelper.logParams(data) : undefined;
    loggingService.log(message, handlerName, logData);
  }

  /**
   * Log handler completion with ID reference
   */
  static logCompletionWithId(
    loggingService: LoggingService,
    handlerName: string,
    id: string,
    customMessage?: string
  ): void {
    const message = customMessage || `${this.getOperationName(handlerName)} completed`;
    loggingService.log(message, handlerName, LoggingHelper.logId(id));
  }

  /**
   * Extract operation name from handler class name
   * Example: 'CreateDocumentTemplateHandler' -> 'create document template'
   */
  private static getOperationName(handlerName: string): string {
    return handlerName
      .replace('Handler', '')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim();
  }

  /**
   * Extract event name from handler class name
   * Example: 'ReservationSubmittedHandler' -> 'reservation submitted'
   */
  private static getEventName(handlerName: string): string {
    return handlerName
      .replace('Handler', '')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .trim();
  }
}
