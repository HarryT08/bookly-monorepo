import { LoggingService } from '@libs/logging/logging.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingHelper } from '@libs/logging/logging.helper';

/**
 * Stockpile Handler Utility Class
 * Centralizes common handler logic for logging, error handling, and CQRS operations
 * Eliminates code duplication across stockpile handlers and services
 */
export class StockpileHandlerUtil {
  
  /**
   * Standardized logging for service operations
   */
  static logServiceOperation(
    loggingService: LoggingService,
    operation: string,
    serviceName: string,
    data?: any
  ): void {
    loggingService.log(
      operation,
      serviceName,
      data ? LoggingHelper.logParams(data) : undefined
    );
  }

  /**
   * Standardized logging for service operation completion
   */
  static logServiceCompletion(
    loggingService: LoggingService,
    operation: string,
    serviceName: string,
    result?: any
  ): void {
    const completionMessage = `${operation} completed`;
    loggingService.log(
      completionMessage,
      serviceName,
      result ? LoggingHelper.logParams(result) : undefined
    );
  }

  /**
   * Execute command with standardized logging
   */
  static async executeCommand<T>(
    commandBus: CommandBus,
    command: any,
    loggingService: LoggingService,
    operationName: string,
    serviceName: string
  ): Promise<T> {
    this.logServiceOperation(
      loggingService,
      `Executing ${operationName} command`,
      serviceName,
      { commandType: command.constructor.name }
    );
    
    const result = await commandBus.execute<T>(command);
    
    this.logServiceCompletion(
      loggingService,
      `${operationName} command`,
      serviceName,
      { success: true }
    );
    
    return result;
  }

  /**
   * Execute query with standardized logging
   */
  static async executeQuery<T>(
    queryBus: QueryBus,
    query: any,
    loggingService: LoggingService,
    operationName: string,
    serviceName: string
  ): Promise<T> {
    this.logServiceOperation(
      loggingService,
      `Executing ${operationName} query`,
      serviceName,
      { queryType: query.constructor.name }
    );
    
    const result = await queryBus.execute<T>(query);
    
    this.logServiceCompletion(
      loggingService,
      `${operationName} query`,
      serviceName,
      { resultsCount: Array.isArray(result) ? result.length : 1 }
    );
    
    return result;
  }

  /**
   * Standardized handler orchestration logging
   */
  static logHandlerStart(
    loggingService: LoggingService,
    handlerName: string,
    operation: string,
    data?: any
  ): void {
    loggingService.log(
      `Orchestrating ${operation}`,
      handlerName,
      data ? LoggingHelper.logParams(data) : undefined
    );
  }

  /**
   * Standardized handler completion logging
   */
  static logHandlerCompletion(
    loggingService: LoggingService,
    handlerName: string,
    operation: string,
    result?: any
  ): void {
    loggingService.log(
      `${operation} completed`,
      handlerName,
      result ? LoggingHelper.logParams(result) : undefined
    );
  }

  /**
   * Create standardized business validation logging
   */
  static logBusinessValidation(
    loggingService: LoggingService,
    serviceName: string,
    validationType: string,
    validationData?: any
  ): void {
    loggingService.log(
      `Performing business validation: ${validationType}`,
      serviceName,
      validationData ? LoggingHelper.logParams(validationData) : undefined
    );
  }

  /**
   * Create standardized success response logging with context
   */
  static logOperationSuccess(
    loggingService: LoggingService,
    serviceName: string,
    operation: string,
    context?: any
  ): void {
    loggingService.log(
      `${operation} completed successfully`,
      serviceName,
      context ? LoggingHelper.logParams(context) : undefined
    );
  }

  /**
   * Generate consistent operation IDs for tracking
   */
  static generateOperationId(prefix: string = 'op'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Standardized DTO validation logging
   */
  static logDtoValidation(
    loggingService: LoggingService,
    serviceName: string,
    dtoName: string,
    dto: any
  ): void {
    loggingService.log(
      `Validating ${dtoName}`,
      serviceName,
      LoggingHelper.logParams({ 
        dtoType: dtoName,
        hasRequiredFields: Object.keys(dto).length > 0 
      })
    );
  }
}
