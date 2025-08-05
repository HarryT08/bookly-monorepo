/**
 * Logging Helper Utility
 * Standardizes logging parameters across all Bookly services
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
      return JSON.stringify(data, null, 2);
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
   * Create a log message with multiple parameters
   * @param params - Parameters object
   * @returns Stringified parameters
   */
  static logParams(params: Record<string, any>): string {
    return this.stringify(params);
  }

  /**
   * Create a log message with user information
   * @param userId - User ID
   * @param email - User email
   * @param ipAddress - IP address (optional)
   * @returns Stringified user info
   */
  static logUserInfo(userId: string, email?: string, ipAddress?: string): string {
    return this.stringify({ userId, email, ipAddress });
  }

  /**
   * Create a log message with authentication information
   * @param email - User email
   * @param ipAddress - IP address
   * @param provider - Auth provider (local, google, etc.)
   * @returns Stringified auth info
   */
  static logAuthInfo(email: string, ipAddress?: string, provider?: string): string {
    return this.stringify({ email, ipAddress, provider });
  }

  /**
   * Create a log message with role information
   * @param roleId - Role ID
   * @param roleName - Role name
   * @param userId - User ID (optional)
   * @returns Stringified role info
   */
  static logRoleInfo(roleId: string, roleName?: string, userId?: string): string {
    return this.stringify({ roleId, roleName, userId });
  }

  /**
   * Create a log message with permission information
   * @param permissionId - Permission ID
   * @param resource - Resource name
   * @param action - Action name
   * @param scope - Permission scope
   * @returns Stringified permission info
   */
  static logPermissionInfo(permissionId: string, resource?: string, action?: string, scope?: string): string {
    return this.stringify({ permissionId, resource, action, scope });
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
   * Create a log message with template ID
   * @param templateId - Template ID
   * @returns Stringified template ID
   */
  static logTemplateId(templateId: string): string {
    return this.stringify({ templateId });
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

  /**
   * Create a log message with error information
   * @param error - Error object
   * @param context - Additional context
   * @returns Stringified error info
   */
  static logError(error: any, context?: Record<string, any>): string {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      ...context,
    };
    return this.stringify(errorInfo);
  }

  /**
   * Create a log message with SSO information
   * @param provider - SSO provider (google, etc.)
   * @param ssoId - SSO user ID
   * @param email - User email
   * @returns Stringified SSO info
   */
  static logSSOInfo(provider: string, ssoId?: string, email?: string): string {
    return this.stringify({ provider, ssoId, email });
  }
}
