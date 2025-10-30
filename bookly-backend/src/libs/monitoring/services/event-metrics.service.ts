/**
 * Event Metrics Service
 * Tracks and aggregates event metrics across all microservices
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '@libs/event-bus/services/redis.service';
import { LoggingService } from '@libs/logging/logging.service';
import { getCorrelationContext } from '@libs/common/middleware/correlation-id.middleware';

export interface EventMetrics {
  eventType: string;
  service: string;
  count: number;
  lastOccurred: Date;
  averageProcessingTime: number;
  successRate: number;
  errorCount: number;
}

export interface ServiceMetrics {
  serviceName: string;
  totalEvents: number;
  eventsPerHour: number;
  averageProcessingTime: number;
  successRate: number;
  topEvents: EventMetrics[];
  errorRate: number;
  lastActivity: Date;
}

interface HourlyMetrics {
  service: string;
  hour: number;
  totalEvents: number;
  totalProcessingTime: number;
  successCount: number;
  errorCount: number;
  events: { [eventType: string]: EventTypeMetrics };
}

interface EventTypeMetrics {
  count: number;
  totalProcessingTime: number;
  successCount: number;
  errorCount: number;
}

interface ServiceSummary {
  service: string;
  lastUpdated: Date;
  totalEvents: number;
}

@Injectable()
export class EventMetricsService {
  private readonly METRICS_TTL = 86400 * 7; // 7 days

  constructor(
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Record event metrics
   */
  async recordEventMetric(
    eventType: string,
    service: string,
    processingTime: number,
    success: boolean = true,
  ): Promise<void> {
    try {
      const timestamp = Date.now();
      const hour = Math.floor(timestamp / (1000 * 60 * 60));
      
      // Record individual event
      const eventKey = `metrics:event:${service}:${eventType}`;
      const eventData = {
        eventType,
        service,
        timestamp,
        processingTime,
        success,
        correlationId: getCorrelationContext()?.correlationId,
      };
      
      await this.redisService.lPush(eventKey, JSON.stringify(eventData));
      await this.redisService.expire(eventKey, this.METRICS_TTL);

      // Update hourly aggregates
      const hourlyKey = `metrics:hourly:${service}:${hour}`;
      const existingData = await this.redisService.get(hourlyKey);
      const hourlyData: HourlyMetrics = (existingData as HourlyMetrics) || {
        service,
        hour,
        totalEvents: 0,
        totalProcessingTime: 0,
        successCount: 0,
        errorCount: 0,
        events: {},
      };

      hourlyData.totalEvents++;
      hourlyData.totalProcessingTime += processingTime;
      
      if (success) {
        hourlyData.successCount++;
      } else {
        hourlyData.errorCount++;
      }

      if (!hourlyData.events[eventType]) {
        hourlyData.events[eventType] = {
          count: 0,
          totalProcessingTime: 0,
          successCount: 0,
          errorCount: 0,
        };
      }

      hourlyData.events[eventType].count++;
      hourlyData.events[eventType].totalProcessingTime += processingTime;
      
      if (success) {
        hourlyData.events[eventType].successCount++;
      } else {
        hourlyData.events[eventType].errorCount++;
      }

      await this.redisService.set(hourlyKey, hourlyData, this.METRICS_TTL);

      // Update service summary
      await this.updateServiceSummary(service);

    } catch (error) {
      this.loggingService.error(
        'Failed to record event metric',
        error,
        'EventMetricsService',
      );
    }
  }

  /**
   * Get metrics for a specific event type
   */
  async getEventMetrics(service: string, eventType: string, hours: number = 24): Promise<EventMetrics | null> {
    try {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      const startHour = currentHour - hours;

      let totalCount = 0;
      let totalProcessingTime = 0;
      let successCount = 0;
      let errorCount = 0;
      let lastOccurred: Date | null = null;

      for (let hour = startHour; hour <= currentHour; hour++) {
        const hourlyKey = `metrics:hourly:${service}:${hour}`;
        const hourlyData = await this.redisService.get(hourlyKey) as HourlyMetrics;
        
        if (hourlyData && hourlyData.events[eventType]) {
          const eventData = hourlyData.events[eventType];
          totalCount += eventData.count;
          totalProcessingTime += eventData.totalProcessingTime;
          successCount += eventData.successCount;
          errorCount += eventData.errorCount;
          lastOccurred = new Date(hour * 1000 * 60 * 60);
        }
      }

      if (totalCount === 0) {
        return null;
      }

      return {
        eventType,
        service,
        count: totalCount,
        lastOccurred: lastOccurred || new Date(),
        averageProcessingTime: totalProcessingTime / totalCount,
        successRate: (successCount / totalCount) * 100,
        errorCount,
      };
    } catch (error) {
      this.loggingService.error(
        'Failed to get event metrics',
        error,
        'EventMetricsService',
      );
      return null;
    }
  }

  /**
   * Get service metrics summary
   */
  async getServiceMetrics(service: string, hours: number = 24): Promise<ServiceMetrics | null> {
    try {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      const startHour = currentHour - hours;

      let totalEvents = 0;
      let totalProcessingTime = 0;
      let successCount = 0;
      let errorCount = 0;
      let lastActivity: Date | null = null;
      const eventSummary: { [eventType: string]: any } = {};

      for (let hour = startHour; hour <= currentHour; hour++) {
        const hourlyKey = `metrics:hourly:${service}:${hour}`;
        const hourlyData = await this.redisService.get(hourlyKey) as HourlyMetrics;
        
        if (hourlyData) {
          totalEvents += hourlyData.totalEvents;
          totalProcessingTime += hourlyData.totalProcessingTime;
          successCount += hourlyData.successCount;
          errorCount += hourlyData.errorCount;
          lastActivity = new Date(hour * 1000 * 60 * 60);

          // Aggregate event types
          for (const [eventType, eventData] of Object.entries(hourlyData.events)) {
            if (!eventSummary[eventType]) {
              eventSummary[eventType] = {
                count: 0,
                totalProcessingTime: 0,
                successCount: 0,
                errorCount: 0,
              };
            }
            
            eventSummary[eventType].count += eventData.count;
            eventSummary[eventType].totalProcessingTime += eventData.totalProcessingTime;
            eventSummary[eventType].successCount += eventData.successCount;
            eventSummary[eventType].errorCount += eventData.errorCount;
          }
        }
      }

      if (totalEvents === 0) {
        return null;
      }

      // Create top events list
      const topEvents: EventMetrics[] = Object.entries(eventSummary)
        .map(([eventType, data]: [string, any]) => ({
          eventType,
          service,
          count: data.count,
          lastOccurred: lastActivity || new Date(),
          averageProcessingTime: data.totalProcessingTime / data.count,
          successRate: (data.successCount / data.count) * 100,
          errorCount: data.errorCount,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        serviceName: service,
        totalEvents,
        eventsPerHour: totalEvents / hours,
        averageProcessingTime: totalProcessingTime / totalEvents,
        successRate: (successCount / totalEvents) * 100,
        topEvents,
        errorRate: (errorCount / totalEvents) * 100,
        lastActivity: lastActivity || new Date(),
      };
    } catch (error) {
      this.loggingService.error(
        'Failed to get service metrics',
        error,
        'EventMetricsService',
      );
      return null;
    }
  }

  /**
   * Get all services metrics
   */
  async getAllServicesMetrics(hours: number = 24): Promise<ServiceMetrics[]> {
    try {
      const services = ['auth-service', 'resources-service', 'availability-service', 'stockpile-service', 'reports-service'];
      const metrics: ServiceMetrics[] = [];

      for (const service of services) {
        const serviceMetrics = await this.getServiceMetrics(service, hours);
        if (serviceMetrics) {
          metrics.push(serviceMetrics);
        }
      }

      return metrics.sort((a, b) => b.totalEvents - a.totalEvents);
    } catch (error) {
      this.loggingService.error(
        'Failed to get all services metrics',
        error,
        'EventMetricsService',
      );
      return [];
    }
  }

  /**
   * Get real-time event stream metrics
   */
  async getRealTimeMetrics(): Promise<{
    totalEventsLastHour: number;
    eventsPerMinute: number;
    activeServices: number;
    averageProcessingTime: number;
    errorRate: number;
  }> {
    try {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      const services = ['auth-service', 'resources-service', 'availability-service', 'stockpile-service', 'reports-service'];
      
      let totalEvents = 0;
      let totalProcessingTime = 0;
      let totalErrors = 0;
      let activeServices = 0;

      for (const service of services) {
        const hourlyKey = `metrics:hourly:${service}:${currentHour}`;
        const hourlyData = await this.redisService.get(hourlyKey);
        
        if (hourlyData && (hourlyData as HourlyMetrics).totalEvents > 0) {
          const typedData = hourlyData as HourlyMetrics;
          totalEvents += typedData.totalEvents;
          totalProcessingTime += typedData.totalProcessingTime;
          totalErrors += typedData.errorCount;
          activeServices++;
        }
      }

      return {
        totalEventsLastHour: totalEvents,
        eventsPerMinute: totalEvents / 60,
        activeServices,
        averageProcessingTime: totalEvents > 0 ? totalProcessingTime / totalEvents : 0,
        errorRate: totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0,
      };
    } catch (error) {
      this.loggingService.error(
        'Failed to get real-time metrics',
        error,
        'EventMetricsService',
      );
      return {
        totalEventsLastHour: 0,
        eventsPerMinute: 0,
        activeServices: 0,
        averageProcessingTime: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Update service summary
   */
  private async updateServiceSummary(service: string): Promise<void> {
    const summaryKey = `metrics:summary:${service}`;
    const existingSummary = await this.redisService.get(summaryKey);
    const summary: ServiceSummary = (existingSummary as ServiceSummary) || {
      service,
      lastUpdated: new Date(),
      totalEvents: 0,
    };

    summary.lastUpdated = new Date();
    summary.totalEvents++;

    await this.redisService.set(summaryKey, summary, this.METRICS_TTL);
  }

  /**
   * Clear old metrics data
   */
  async cleanupOldMetrics(): Promise<void> {
    try {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      const cutoffHour = currentHour - (24 * 7); // 7 days ago

      const pattern = 'metrics:hourly:*';
      const keys = await this.redisService.getClient().keys(pattern);

      for (const key of keys) {
        const parts = key.split(':');
        if (parts.length >= 4) {
          const hour = parseInt(parts[3]);
          if (hour < cutoffHour) {
            await this.redisService.del(key);
          }
        }
      }

      this.loggingService.log(
        `Cleaned up ${keys.length} old metric keys`,
        { cutoffHour, currentHour },
        'EventMetricsService',
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to cleanup old metrics',
        error,
        'EventMetricsService',
      );
    }
  }
}
