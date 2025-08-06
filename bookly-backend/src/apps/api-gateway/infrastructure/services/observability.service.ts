import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@libs/logging/logging.service';
import { MonitoringService } from '@libs/monitoring/monitoring.service';

export interface RequestMetrics {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userAgent: string;
  ip: string;
  userId?: string;
  service?: string;
  timestamp: Date;
  headers: Record<string, string>;
  responseSize: number;
  requestSize: number;
}

export interface ErrorMetrics {
  requestId: string;
  error: string;
  stack?: string;
  service?: string;
  method: string;
  path: string;
  userId?: string;
  ip: string;
  timestamp: Date;
  statusCode: number;
}

export interface ServiceMetrics {
  service: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  success: boolean;
}

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);
  private readonly requestMetrics: RequestMetrics[] = [];
  private readonly errorMetrics: ErrorMetrics[] = [];
  private readonly serviceMetrics: ServiceMetrics[] = [];
  private readonly maxMetricsHistory = 10000;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly monitoringService: MonitoringService,
  ) {}

  public logRequest(metrics: RequestMetrics): void {
    // Add to in-memory storage
    this.requestMetrics.push(metrics);
    this.trimMetricsHistory(this.requestMetrics);

    // Log to structured logging
    this.loggingService.log('API Gateway Request', {
      requestId: metrics.requestId,
      method: metrics.method,
      path: metrics.path,
      statusCode: metrics.statusCode,
      duration: metrics.duration,
      userAgent: metrics.userAgent,
      ip: metrics.ip,
      userId: metrics.userId,
      service: metrics.service,
      responseSize: metrics.responseSize,
      requestSize: metrics.requestSize,
    });

    // Send to monitoring service (if methods exist)
    try {
      if (typeof this.monitoringService.recordMetric === 'function') {
        this.monitoringService.recordMetric('gateway.request.duration', metrics.duration, {
          method: metrics.method,
          path: metrics.path,
          statusCode: metrics.statusCode.toString(),
          service: metrics.service || 'unknown',
        });

        this.monitoringService.recordMetric('gateway.request.count', 1, {
          method: metrics.method,
          path: metrics.path,
          statusCode: metrics.statusCode.toString(),
          service: metrics.service || 'unknown',
        });

        // Record response size metrics
        this.monitoringService.recordMetric('gateway.response.size', metrics.responseSize, {
          method: metrics.method,
          path: metrics.path,
          service: metrics.service || 'unknown',
        });
      }
    } catch (error) {
      this.logger.debug('Monitoring service recordMetric not available:', error.message);
    }
  }

  public logError(errorMetrics: ErrorMetrics): void {
    // Add to in-memory storage
    this.errorMetrics.push(errorMetrics);
    this.trimMetricsHistory(this.errorMetrics);

    // Log error with structured logging
    this.loggingService.error('API Gateway Error', {
      error: errorMetrics.error,
      requestId: errorMetrics.requestId,
      method: errorMetrics.method,
      path: errorMetrics.path,
      userId: errorMetrics.userId,
      ip: errorMetrics.ip,
      service: errorMetrics.service,
      statusCode: errorMetrics.statusCode,
      stack: errorMetrics.stack,
    });

    // Send to monitoring service (if methods exist)
    try {
      if (typeof this.monitoringService.recordMetric === 'function') {
        this.monitoringService.recordMetric('gateway.error.count', 1, {
          method: errorMetrics.method,
          path: errorMetrics.path,
          statusCode: errorMetrics.statusCode.toString(),
          service: errorMetrics.service || 'unknown',
        });
      }

      // Send to Sentry if configured
      if (typeof this.monitoringService.captureException === 'function') {
        this.monitoringService.captureException(new Error(errorMetrics.error), {
          tags: {
            component: 'api-gateway',
            service: errorMetrics.service,
            method: errorMetrics.method,
            path: errorMetrics.path,
          },
          extra: {
            requestId: errorMetrics.requestId,
            userId: errorMetrics.userId,
            ip: errorMetrics.ip,
            statusCode: errorMetrics.statusCode,
          },
        });
      }
    } catch (error) {
      this.logger.debug('Monitoring service methods not available:', error.message);
    }
  }

  public logServiceCall(metrics: ServiceMetrics): void {
    // Add to in-memory storage
    this.serviceMetrics.push(metrics);
    this.trimMetricsHistory(this.serviceMetrics);

    // Log service call
    this.loggingService.log('Service Call', {
      service: metrics.service,
      endpoint: metrics.endpoint,
      method: metrics.method,
      responseTime: metrics.responseTime,
      statusCode: metrics.statusCode,
      success: metrics.success,
    });

    // Record service-specific metrics (if methods exist)
    try {
      if (typeof this.monitoringService.recordMetric === 'function') {
        this.monitoringService.recordMetric('gateway.service.response_time', metrics.responseTime, {
          service: metrics.service,
          endpoint: metrics.endpoint,
          method: metrics.method,
          statusCode: metrics.statusCode.toString(),
        });

        this.monitoringService.recordMetric('gateway.service.call_count', 1, {
          service: metrics.service,
          endpoint: metrics.endpoint,
          method: metrics.method,
          success: metrics.success.toString(),
        });
      }
    } catch (error) {
      this.logger.debug('Monitoring service recordMetric not available:', error.message);
    }
  }

  public getRequestMetrics(limit: number = 100): RequestMetrics[] {
    return this.requestMetrics.slice(-limit);
  }

  public getErrorMetrics(limit: number = 100): ErrorMetrics[] {
    return this.errorMetrics.slice(-limit);
  }

  public getServiceMetrics(limit: number = 100): ServiceMetrics[] {
    return this.serviceMetrics.slice(-limit);
  }

  public getMetricsSummary(): any {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter metrics by time periods
    const lastHourRequests = this.requestMetrics.filter(m => m.timestamp >= oneHourAgo);
    const lastDayRequests = this.requestMetrics.filter(m => m.timestamp >= oneDayAgo);
    const lastHourErrors = this.errorMetrics.filter(m => m.timestamp >= oneHourAgo);
    const lastDayErrors = this.errorMetrics.filter(m => m.timestamp >= oneDayAgo);

    // Calculate statistics
    const avgResponseTime = lastHourRequests.length > 0 
      ? lastHourRequests.reduce((sum, m) => sum + m.duration, 0) / lastHourRequests.length 
      : 0;

    const errorRate = lastHourRequests.length > 0 
      ? (lastHourErrors.length / lastHourRequests.length) * 100 
      : 0;

    // Status code distribution
    const statusCodes = lastHourRequests.reduce((acc, m) => {
      const code = Math.floor(m.statusCode / 100) * 100;
      acc[`${code}xx`] = (acc[`${code}xx`] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Service distribution
    const serviceDistribution = lastHourRequests.reduce((acc, m) => {
      const service = m.service || 'unknown';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top endpoints
    const endpointCounts = lastHourRequests.reduce((acc, m) => {
      const key = `${m.method} ${m.path}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEndpoints = Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    return {
      summary: {
        totalRequests: this.requestMetrics.length,
        totalErrors: this.errorMetrics.length,
        lastHourRequests: lastHourRequests.length,
        lastDayRequests: lastDayRequests.length,
        lastHourErrors: lastHourErrors.length,
        lastDayErrors: lastDayErrors.length,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
      },
      statusCodes,
      serviceDistribution,
      topEndpoints,
      timestamp: now,
    };
  }

  public getHealthMetrics(): any {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Recent requests and errors
    const recentRequests = this.requestMetrics.filter(m => m.timestamp >= fiveMinutesAgo);
    const recentErrors = this.errorMetrics.filter(m => m.timestamp >= fiveMinutesAgo);

    // Service health
    const serviceHealth = this.serviceMetrics
      .filter(m => m.timestamp >= fiveMinutesAgo)
      .reduce((acc, m) => {
        if (!acc[m.service]) {
          acc[m.service] = { total: 0, successful: 0, avgResponseTime: 0, responseTimeSum: 0 };
        }
        acc[m.service].total++;
        acc[m.service].responseTimeSum += m.responseTime;
        if (m.success) {
          acc[m.service].successful++;
        }
        return acc;
      }, {} as Record<string, any>);

    // Calculate averages
    Object.values(serviceHealth).forEach((health: any) => {
      health.avgResponseTime = Math.round(health.responseTimeSum / health.total);
      health.successRate = Math.round((health.successful / health.total) * 100);
      delete health.responseTimeSum;
    });

    return {
      status: recentErrors.length === 0 && recentRequests.length > 0 ? 'healthy' : 'degraded',
      recentRequests: recentRequests.length,
      recentErrors: recentErrors.length,
      serviceHealth,
      timestamp: now,
    };
  }

  public clearMetrics(): void {
    this.requestMetrics.length = 0;
    this.errorMetrics.length = 0;
    this.serviceMetrics.length = 0;
    this.logger.log('Cleared all metrics history');
  }

  private trimMetricsHistory(metricsArray: any[]): void {
    if (metricsArray.length > this.maxMetricsHistory) {
      metricsArray.splice(0, metricsArray.length - this.maxMetricsHistory);
    }
  }

  public startTrace(operationName: string, tags?: Record<string, any>): string {
    try {
      if (typeof this.monitoringService.startTrace === 'function') {
        return this.monitoringService.startTrace(operationName, tags);
      }
    } catch (error) {
      this.logger.debug('Monitoring service startTrace not available:', error.message);
    }
    return `trace-${Date.now()}-${Math.random()}`;
  }

  public finishTrace(traceId: string, tags?: Record<string, any>): void {
    try {
      if (typeof this.monitoringService.finishTrace === 'function') {
        this.monitoringService.finishTrace(traceId, tags);
      }
    } catch (error) {
      this.logger.debug('Monitoring service finishTrace not available:', error.message);
    }
  }

  public addTraceTag(traceId: string, key: string, value: any): void {
    try {
      if (typeof this.monitoringService.addTraceTag === 'function') {
        this.monitoringService.addTraceTag(traceId, key, value);
      }
    } catch (error) {
      this.logger.debug('Monitoring service addTraceTag not available:', error.message);
    }
  }

  public recordCustomMetric(name: string, value: number, tags?: Record<string, string>): void {
    try {
      if (typeof this.monitoringService.recordMetric === 'function') {
        this.monitoringService.recordMetric(name, value, tags);
      }
    } catch (error) {
      this.logger.debug('Monitoring service recordMetric not available:', error.message);
    }
  }
}
