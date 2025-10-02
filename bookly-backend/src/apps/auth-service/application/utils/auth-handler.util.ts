import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';

/**
 * Utility class for standardizing handler operations and reducing code duplication
 */
export class AuthHandlerUtil {
  /**
   * Execute a handler operation with standardized logging and error handling
   */
  static async executeWithLogging<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      handlerName: string;
      loggingService: LoggingService;
      monitoringService: MonitoringService;
      entityId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<T> {
    const { operationName, handlerName, loggingService, monitoringService, entityId, metadata } = context;
    
    try {
      // Log operation start
      const logMessage = entityId 
        ? `${operationName} for ${entityId}` 
        : operationName;
      loggingService.log(logMessage, handlerName);
      
      // Execute operation
      const result = await operation();
      
      // Log success
      const successMessage = entityId 
        ? `${operationName} successful for ${entityId}` 
        : `${operationName} successful`;
      loggingService.log(successMessage, handlerName);
      
      // Capture monitoring event
      if (entityId) {
        monitoringService.captureMessage(`${operationName}: ${entityId}`, 'info');
      }
      
      return result;
    } catch (error) {
      // Log error
      const errorMessage = entityId 
        ? `${operationName} failed for ${entityId}: ${error.message}` 
        : `${operationName} failed: ${error.message}`;
      loggingService.error(errorMessage, error, handlerName);
      
      // Capture exception with context
      const exceptionContext = {
        ...metadata,
        entityId,
        operation: operationName,
        handler: handlerName
      };
      monitoringService.captureException(error, exceptionContext);
      
      throw error;
    }
  }

  /**
   * Create standardized success response for command handlers
   */
  static createSuccessResponse(message: string, data?: any): { success: boolean; message: string; data?: any } {
    return {
      success: true,
      message,
      ...(data && { data })
    };
  }

  /**
   * Create event payload with standard fields
   */
  static createEventPayload(basePayload: Record<string, any>): Record<string, any> {
    return {
      ...basePayload,
      timestamp: new Date(),
    };
  }
}
