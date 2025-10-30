/**
 * Reports Service - Event Map
 * Centralized mapping for all events used in the reports service
 */

export const REPORTS_EVENTS = {
  // Report Generation Events
  REPORT_GENERATED: 'reports.report.generated',
  REPORT_GENERATION_STARTED: 'reports.report.generation.started',
  REPORT_GENERATION_FAILED: 'reports.report.generation.failed',
  REPORT_GENERATION_CANCELLED: 'reports.report.generation.cancelled',
  REPORT_EXPORTED: 'reports.report.exported',
  
  // Usage Reports Events
  USAGE_REPORT_CREATED: 'reports.usage.report.created',
  RESOURCE_USAGE_CALCULATED: 'reports.resource.usage.calculated',
  PROGRAM_USAGE_ANALYZED: 'reports.program.usage.analyzed',
  PERIOD_USAGE_SUMMARIZED: 'reports.period.usage.summarized',
  
  // User Reports Events
  USER_REPORT_GENERATED: 'reports.user.report.generated',
  PROFESSOR_REPORT_CREATED: 'reports.professor.report.created',
  STUDENT_ACTIVITY_ANALYZED: 'reports.student.activity.analyzed',
  USER_BEHAVIOR_ANALYZED: 'reports.user.behavior.analyzed',
  
  // Dashboard Events
  DASHBOARD_UPDATED: 'reports.dashboard.updated',
  DASHBOARD_DATA_REFRESHED: 'reports.dashboard.data.refreshed',
  REAL_TIME_METRICS_UPDATED: 'reports.realtime.metrics.updated',
  KPI_CALCULATED: 'reports.kpi.calculated',
  
  // Analytics Events
  ANALYTICS_PROCESSED: 'reports.analytics.processed',
  TREND_ANALYSIS_COMPLETED: 'reports.trend.analysis.completed',
  PREDICTIVE_ANALYSIS_GENERATED: 'reports.predictive.analysis.generated',
  COMPARATIVE_ANALYSIS_CREATED: 'reports.comparative.analysis.created',
  
  // Feedback Reports Events
  FEEDBACK_REPORT_GENERATED: 'reports.feedback.report.generated',
  USER_SATISFACTION_ANALYZED: 'reports.user.satisfaction.analyzed',
  FEEDBACK_TRENDS_IDENTIFIED: 'reports.feedback.trends.identified',
  
  // Demand Analysis Events
  DEMAND_ANALYSIS_COMPLETED: 'reports.demand.analysis.completed',
  UNSATISFIED_DEMAND_CALCULATED: 'reports.unsatisfied.demand.calculated',
  CAPACITY_ANALYSIS_GENERATED: 'reports.capacity.analysis.generated',
  PEAK_USAGE_IDENTIFIED: 'reports.peak.usage.identified',
  
  // Export Events
  CSV_EXPORT_COMPLETED: 'reports.csv.export.completed',
  PDF_EXPORT_COMPLETED: 'reports.pdf.export.completed',
  EXCEL_EXPORT_COMPLETED: 'reports.excel.export.completed',
  JSON_EXPORT_COMPLETED: 'reports.json.export.completed',
  
  // Scheduled Reports Events
  SCHEDULED_REPORT_EXECUTED: 'reports.scheduled.report.executed',
  REPORT_SCHEDULE_CREATED: 'reports.report.schedule.created',
  REPORT_SCHEDULE_UPDATED: 'reports.report.schedule.updated',
  REPORT_SCHEDULE_DELETED: 'reports.report.schedule.deleted',
  
  // Data Processing Events
  DATA_AGGREGATION_STARTED: 'reports.data.aggregation.started',
  DATA_AGGREGATION_COMPLETED: 'reports.data.aggregation.completed',
  DATA_VALIDATION_PERFORMED: 'reports.data.validation.performed',
  DATA_CLEANSING_COMPLETED: 'reports.data.cleansing.completed',
  
  // Performance Events
  REPORT_PERFORMANCE_MEASURED: 'reports.report.performance.measured',
  SLOW_QUERY_DETECTED: 'reports.slow.query.detected',
  CACHE_HIT_RECORDED: 'reports.cache.hit.recorded',
  CACHE_MISS_RECORDED: 'reports.cache.miss.recorded',
  
  // Alert Events
  REPORT_ALERT_TRIGGERED: 'reports.report.alert.triggered',
  THRESHOLD_EXCEEDED: 'reports.threshold.exceeded',
  ANOMALY_DETECTED: 'reports.anomaly.detected',
  
  // Audit Events
  REPORT_ACCESSED: 'reports.report.accessed',
  REPORT_SHARED: 'reports.report.shared',
  UNAUTHORIZED_REPORT_ACCESS: 'reports.unauthorized.report.access',
  REPORT_AUDIT_LOG_CREATED: 'reports.report.audit.log.created',
  
  // System Events
  REPORTS_SERVICE_STARTED: 'reports.service.started',
  REPORTS_SERVICE_STOPPED: 'reports.service.stopped',
  DATABASE_CONNECTION_ESTABLISHED: 'reports.database.connection.established',
  CONFIGURATION_UPDATED: 'reports.configuration.updated'
} as const;

export type ReportsEventType = typeof REPORTS_EVENTS[keyof typeof REPORTS_EVENTS];
