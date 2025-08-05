/**
 * Logging Helper Utility
 * Standardizes logging parameters across the stockpile service
 */

export class LoggingHelper {
  /**
   * Safely stringify any object for logging
   * @param data - Data to stringify
   * @returns Stringified data or string representation
   */
  static stringify(data: any): string {
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'number' || typeof data === 'boolean') {
      return String(data);
    }
    
    if (data === null || data === undefined) {
      return String(data);
    }
    
    try {
      return JSON.stringify(data);
    } catch (error) {
      return String(data);
    }
  }

  /**
   * Create a standardized log context object
   * @param context - Context data
   * @returns Stringified context
   */
  static createContext(context: Record<string, any>): string {
    return this.stringify(context);
  }

  /**
   * Create a simple log message with ID
   * @param id - ID value
   * @returns Stringified ID
   */
  static logId(id: string): string {
    return this.stringify({ id });
  }

  /**
   * Create a log message with filters
   * @param filters - Filter object
   * @returns Stringified filters
   */
  static logFilters(filters: Record<string, any>): string {
    return this.stringify({ filters });
  }

  /**
   * Create a log message with reservation ID
   * @param reservationId - Reservation ID
   * @returns Stringified reservation ID
   */
  static logReservationId(reservationId: string): string {
    return this.stringify({ reservationId });
  }

  /**
   * Create a log message with notification ID
   * @param notificationId - Notification ID
   * @returns Stringified notification ID
   */
  static logNotificationId(notificationId: string): string {
    return this.stringify({ notificationId });
  }

  /**
   * Create a log message with channel ID
   * @param channelId - Channel ID
   * @returns Stringified channel ID
   */
  static logChannelId(channelId: string): string {
    return this.stringify({ channelId });
  }

  /**
   * Create a log message with template ID
   * @param templateId - Template ID
   * @returns Stringified template ID
   */
  static logTemplateId(templateId: string): string {
    return this.stringify({ templateId });
  }

  /**
   * Create a log message with multiple parameters
   * @param params - Parameters object
   * @returns Stringified parameters
   */
  static logParams(params: Record<string, any>): string {
    return this.stringify(params);
  }

  /**
   * Create a log message with batch information
   * @param channelId - Channel ID
   * @param batchIntervalMs - Batch interval in milliseconds
   * @returns Stringified batch info
   */
  static logBatchInfo(channelId: string, batchIntervalMs: number): string {
    return this.stringify({ channelId, batchIntervalMs });
  }

  /**
   * Create a log message with event type and resource type
   * @param eventType - Event type
   * @param resourceType - Resource type
   * @returns Stringified event and resource info
   */
  static logEventResource(eventType: string, resourceType?: string): string {
    return this.stringify({ eventType, resourceType });
  }
}
