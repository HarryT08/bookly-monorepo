/**
 * Health Dashboard Service
 * Provides unified health monitoring across all microservices
 */

import { Injectable } from '@nestjs/common';
import { RedisService } from '@libs/event-bus/services/redis.service';
import { LoggingService } from '@libs/logging/logging.service';
import { EventMetricsService, ServiceMetrics } from './event-metrics.service';

export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  uptime: number;
  lastHeartbeat: Date;
  responseTime: number;
  errorRate: number;
  memoryUsage?: number;
  cpuUsage?: number;
  activeConnections?: number;
  version?: string;
  dependencies: DependencyHealth[];
}

export interface DependencyHealth {
  name: string;
  type: 'database' | 'redis' | 'rabbitmq' | 'external_api';
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: Date;
  errorMessage?: string;
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  lastUpdated: Date;
  alerts: HealthAlert[];
}

export interface HealthAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  message: string;
  timestamp: Date;
  resolved?: boolean;
  acknowledgedBy?: string;
}

export interface UptimeData {
  startTime: Date;
  totalDowntime: number;
  lastStatusChange: Date;
  previousStatus: string;
}

@Injectable()
export class HealthDashboardService {
  private readonly HEALTH_TTL = 300; // 5 minutes
  private readonly ALERT_TTL = 86400 * 7; // 7 days

  constructor(
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
    private readonly eventMetricsService: EventMetricsService,
  ) {}

  /**
   * Register service heartbeat
   */
  async registerHeartbeat(
    serviceName: string,
    healthData: Partial<ServiceHealth>,
  ): Promise<void> {
    try {
      const heartbeatKey = `health:heartbeat:${serviceName}`;
      const heartbeat = {
        serviceName,
        timestamp: new Date(),
        status: healthData.status || 'healthy',
        responseTime: healthData.responseTime || 0,
        errorRate: healthData.errorRate || 0,
        memoryUsage: healthData.memoryUsage,
        cpuUsage: healthData.cpuUsage,
        activeConnections: healthData.activeConnections,
        version: healthData.version,
        dependencies: healthData.dependencies || [],
        ...healthData,
      };

      await this.redisService.set(heartbeatKey, heartbeat, this.HEALTH_TTL);

      // Update service uptime
      const uptimeKey = `health:uptime:${serviceName}`;
      const uptimeData = await this.redisService.get(uptimeKey) as UptimeData | null || {
        serviceName,
        startTime: new Date(),
        totalDowntime: 0,
        lastStatusChange: new Date(),
        previousStatus: 'unknown',
      };

      // Calculate downtime if status changed to unhealthy
      if (uptimeData.previousStatus !== heartbeat.status) {
        if (heartbeat.status === 'unhealthy' && uptimeData.previousStatus === 'healthy') {
          uptimeData.lastStatusChange = new Date();
        } else if (heartbeat.status === 'healthy' && uptimeData.previousStatus === 'unhealthy') {
          const downtime = Date.now() - new Date(uptimeData.lastStatusChange).getTime();
          uptimeData.totalDowntime += downtime;
        }
        uptimeData.previousStatus = heartbeat.status;
      }

      await this.redisService.set(uptimeKey, uptimeData, this.HEALTH_TTL * 12); // Keep uptime longer

      // Check for alerts
      await this.checkHealthAlerts(serviceName, heartbeat);

    } catch (error) {
      this.loggingService.error(
        'Failed to register heartbeat',
        error,
        'HealthDashboardService',
      );
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(serviceName: string): Promise<ServiceHealth | null> {
    try {
      const heartbeatKey = `health:heartbeat:${serviceName}`;
      const uptimeKey = `health:uptime:${serviceName}`;

      const [heartbeat, uptimeData] = await Promise.all([
        this.redisService.get(heartbeatKey),
        this.redisService.get(uptimeKey),
      ]);

      if (!heartbeat) {
        return {
          serviceName,
          status: 'unknown',
          uptime: 0,
          lastHeartbeat: new Date(0),
          responseTime: 0,
          errorRate: 0,
          dependencies: [],
        };
      }

      const uptime = uptimeData 
        ? Date.now() - new Date((uptimeData as any).startTime).getTime() - (uptimeData as any).totalDowntime
        : 0;

      return {
        ...(heartbeat as any),
        uptime: Math.max(0, uptime),
        lastHeartbeat: new Date((heartbeat as any).timestamp),
      };
    } catch (error) {
      this.loggingService.error(
        'Failed to get service health',
        error,
        'HealthDashboardService',
      );
      return null;
    }
  }

  /**
   * Get system-wide health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const services = ['auth-service', 'resources-service', 'availability-service', 'stockpile-service', 'reports-service', 'api-gateway'];
      const serviceHealthPromises = services.map(service => this.getServiceHealth(service));
      const serviceHealthResults = await Promise.all(serviceHealthPromises);

      const validServices = serviceHealthResults.filter(Boolean) as ServiceHealth[];
      
      let healthyServices = 0;
      let degradedServices = 0;
      let unhealthyServices = 0;

      validServices.forEach(service => {
        switch (service.status) {
          case 'healthy':
            healthyServices++;
            break;
          case 'degraded':
            degradedServices++;
            break;
          case 'unhealthy':
            unhealthyServices++;
            break;
        }
      });

      // Determine overall status
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (unhealthyServices > 0) {
        overallStatus = 'unhealthy';
      } else if (degradedServices > 0) {
        overallStatus = 'degraded';
      }

      // Get active alerts
      const alerts = await this.getActiveAlerts();

      return {
        overallStatus,
        services: validServices,
        totalServices: services.length,
        healthyServices,
        degradedServices,
        unhealthyServices,
        lastUpdated: new Date(),
        alerts,
      };
    } catch (error) {
      this.loggingService.error(
        'Failed to get system health',
        error,
        'HealthDashboardService',
      );
      return {
        overallStatus: 'unhealthy',
        services: [],
        totalServices: 0,
        healthyServices: 0,
        degradedServices: 0,
        unhealthyServices: 0,
        lastUpdated: new Date(),
        alerts: [],
      };
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<{
    systemHealth: SystemHealth;
    serviceMetrics: ServiceMetrics[];
    realTimeMetrics: any;
    recentAlerts: HealthAlert[];
  }> {
    try {
      const [systemHealth, serviceMetrics, realTimeMetrics, recentAlerts] = await Promise.all([
        this.getSystemHealth(),
        this.eventMetricsService.getAllServicesMetrics(24),
        this.eventMetricsService.getRealTimeMetrics(),
        this.getRecentAlerts(50),
      ]);

      return {
        systemHealth,
        serviceMetrics,
        realTimeMetrics,
        recentAlerts,
      };
    } catch (error) {
      this.loggingService.error(
        'Failed to get dashboard data',
        error,
        'HealthDashboardService',
      );
      throw error;
    }
  }

  /**
   * Create health alert
   */
  async createAlert(
    service: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
  ): Promise<string> {
    try {
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const alert: HealthAlert = {
        id: alertId,
        severity,
        service,
        message,
        timestamp: new Date(),
        resolved: false,
      };

      const alertKey = `health:alert:${alertId}`;
      await this.redisService.set(alertKey, alert, this.ALERT_TTL);

      // Add to active alerts list
      const activeAlertsKey = 'health:alerts:active';
      await this.redisService.lPush(activeAlertsKey, alertId);
      await this.redisService.expire(activeAlertsKey, this.ALERT_TTL);

      this.loggingService.warn(
        `Health alert created: ${message}`,
        { alertId, service, severity },
        'HealthDashboardService',
      );

      return alertId;
    } catch (error) {
      this.loggingService.error(
        'Failed to create alert',
        error,
        'HealthDashboardService',
      );
      throw error;
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, acknowledgedBy?: string): Promise<void> {
    try {
      const alertKey = `health:alert:${alertId}`;
      const alert = await this.redisService.get(alertKey);

      if (alert) {
        (alert as any).resolved = true;
        (alert as any).acknowledgedBy = acknowledgedBy;
        await this.redisService.set(alertKey, alert, this.ALERT_TTL);

        this.loggingService.log(
          `Health alert resolved: ${alertId}`,
          { acknowledgedBy },
          'HealthDashboardService',
        );
      }
    } catch (error) {
      this.loggingService.error(
        'Failed to resolve alert',
        error,
        'HealthDashboardService',
      );
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<HealthAlert[]> {
    try {
      const activeAlertsKey = 'health:alerts:active';
      const alertIds = await this.redisService.lRange(activeAlertsKey, 0, -1);

      const alerts: HealthAlert[] = [];
      for (const alertId of alertIds) {
        const alertKey = `health:alert:${alertId}`;
        const alert = await this.redisService.get(alertKey) as HealthAlert | null;
        if (alert && !alert.resolved) {
          alerts.push(alert);
        }
      }

      return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      this.loggingService.error(
        'Failed to get active alerts',
        error,
        'HealthDashboardService',
      );
      return [];
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 100): Promise<HealthAlert[]> {
    try {
      const activeAlertsKey = 'health:alerts:active';
      const alertIds = await this.redisService.lRange(activeAlertsKey, 0, limit - 1);

      const alerts: HealthAlert[] = [];
      for (const alertId of alertIds) {
        const alertKey = `health:alert:${alertId}`;
        const alert = await this.redisService.get(alertKey);
        if (alert) {
          alerts.push(alert as HealthAlert);
        }
      }

      return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      this.loggingService.error(
        'Failed to get recent alerts',
        error,
        'HealthDashboardService',
      );
      return [];
    }
  }

  /**
   * Check for health alerts based on service status
   */
  private async checkHealthAlerts(serviceName: string, healthData: any): Promise<void> {
    try {
      // High error rate alert
      if (healthData.errorRate > 10) {
        await this.createAlert(
          serviceName,
          healthData.errorRate > 25 ? 'critical' : 'high',
          `High error rate detected: ${healthData.errorRate.toFixed(2)}%`,
        );
      }

      // High response time alert
      if (healthData.responseTime > 5000) {
        await this.createAlert(
          serviceName,
          healthData.responseTime > 10000 ? 'critical' : 'medium',
          `High response time detected: ${healthData.responseTime}ms`,
        );
      }

      // Service unhealthy alert
      if (healthData.status === 'unhealthy') {
        await this.createAlert(
          serviceName,
          'critical',
          `Service is unhealthy`,
        );
      }

      // High memory usage alert
      if (healthData.memoryUsage && healthData.memoryUsage > 85) {
        await this.createAlert(
          serviceName,
          healthData.memoryUsage > 95 ? 'critical' : 'medium',
          `High memory usage: ${healthData.memoryUsage.toFixed(2)}%`,
        );
      }

      // Dependency issues
      if (healthData.dependencies) {
        for (const dep of healthData.dependencies) {
          if (dep.status === 'unhealthy') {
            await this.createAlert(
              serviceName,
              'high',
              `Dependency ${dep.name} is unhealthy: ${dep.errorMessage || 'Unknown error'}`,
            );
          }
        }
      }
    } catch (error) {
      this.loggingService.error(
        'Failed to check health alerts',
        error,
        'HealthDashboardService',
      );
    }
  }

  /**
   * Cleanup old alerts and health data
   */
  async cleanupOldData(): Promise<void> {
    try {
      // Clean up resolved alerts older than 7 days
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const activeAlertsKey = 'health:alerts:active';
      const alertIds = await this.redisService.lRange(activeAlertsKey, 0, -1);

      for (const alertId of alertIds) {
        const alertKey = `health:alert:${alertId}`;
        const alert = await this.redisService.get(alertKey) as HealthAlert | null;
        
        if (alert && alert.resolved && new Date(alert.timestamp).getTime() < cutoffTime) {
          await this.redisService.del(alertKey);
        }
      }

      this.loggingService.log(
        'Completed health data cleanup',
        { alertsChecked: alertIds.length },
        'HealthDashboardService',
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to cleanup old health data',
        error,
        'HealthDashboardService',
      );
    }
  }
}
