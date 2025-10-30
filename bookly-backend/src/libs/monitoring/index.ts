/**
 * Monitoring Module Exports
 * Centralized exports for all monitoring services and utilities
 */

// Services
export { EventMetricsService } from './services/event-metrics.service';
export { HealthDashboardService } from './services/health-dashboard.service';

// Types and Interfaces
export type {
  EventMetrics,
  ServiceMetrics,
} from './services/event-metrics.service';

export type {
  ServiceHealth,
  DependencyHealth,
  SystemHealth,
  HealthAlert,
} from './services/health-dashboard.service';

// Module
export { MonitoringModule } from './monitoring.module';
