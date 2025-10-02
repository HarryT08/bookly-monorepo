/**
 * Reports Service - URL Map
 * Centralized mapping for all URLs and endpoints used in the reports service
 */

export const REPORTS_URLS = {
  // Base paths
  BASE: '/reports',
  API_VERSION: '/api/v1',
  
  // Usage Reports endpoints
  USAGE_REPORTS: '/usage',
  USAGE_BY_RESOURCE: '/usage/resource/:resourceId',
  USAGE_BY_PROGRAM: '/usage/program/:programId',
  USAGE_BY_PERIOD: '/usage/period',
  USAGE_SUMMARY: '/usage/summary',
  USAGE_REPORT_GENERATE: '/usage/generate',
  
  // User Reports endpoints
  USER_REPORTS: '/reports/user',
  USER_SUMMARY: '/reports/user/summary',
  USER_HISTORY: '/reports/user/history',
  USER_STATS: '/reports/user/stats',
  USER_ACTIVITY: '/reports/user/:userId/activity',
  PROFESSOR_REPORTS: '/reports/user/professors',
  PROFESSOR_ACTIVITY: '/reports/user/professor/:professorId',
  STUDENT_REPORTS: '/reports/user/students',
  USER_BEHAVIOR_ANALYSIS: '/reports/user/behavior-analysis',
  
  // Dashboard endpoints
  DASHBOARD: '/dashboard',
  DASHBOARD_DATA: '/dashboard/data',
  REAL_TIME_METRICS: '/dashboard/real-time-metrics',
  KPI_METRICS: '/dashboard/kpi',
  DASHBOARD_WIDGETS: '/dashboard/widgets',
  
  // Analytics endpoints
  ANALYTICS: '/analytics',
  TREND_ANALYSIS: '/analytics/trends',
  PREDICTIVE_ANALYSIS: '/analytics/predictions',
  COMPARATIVE_ANALYSIS: '/analytics/comparisons',
  UTILIZATION_ANALYSIS: '/analytics/utilization',
  
  // Feedback Reports endpoints
  FEEDBACK_REPORTS: '/feedback-reports',
  SATISFACTION_REPORTS: '/feedback-reports/satisfaction',
  FEEDBACK_TRENDS: '/feedback-reports/trends',
  FEEDBACK_SUMMARY: '/feedback-reports/summary',
  
  // Demand Analysis endpoints
  DEMAND_ANALYSIS: '/demand-analysis',
  UNSATISFIED_DEMAND: '/demand-analysis/unsatisfied',
  CAPACITY_ANALYSIS: '/demand-analysis/capacity',
  PEAK_USAGE_ANALYSIS: '/demand-analysis/peak-usage',
  DEMAND_FORECASTING: '/demand-analysis/forecasting',
  
  // Export endpoints
  EXPORT: '/export',
  EXPORT_CSV: '/export/csv',
  EXPORT_CSV_REPORT: '/reports/export/csv',
  EXPORT_PDF: '/export/pdf',
  EXPORT_EXCEL: '/export/excel',
  EXPORT_JSON: '/export/json',
  EXPORT_STATUS: '/export/:exportId/status',
  EXPORT_DOWNLOAD: '/export/download/:exportId',
  EXPORT_HISTORY: '/export/history',
  EXPORT_CACHED: '/export/cached/:reportId',
  
  // Scheduled Reports endpoints
  SCHEDULED_REPORTS: '/scheduled-reports',
  SCHEDULE_CREATE: '/scheduled-reports/create',
  SCHEDULE_UPDATE: '/scheduled-reports/:id',
  SCHEDULE_DELETE: '/scheduled-reports/:id',
  SCHEDULE_EXECUTE: '/scheduled-reports/:id/execute',
  SCHEDULE_HISTORY: '/scheduled-reports/:id/history',
  
  // Custom Reports endpoints
  CUSTOM_REPORTS: '/custom-reports',
  CUSTOM_REPORT_CREATE: '/custom-reports/create',
  CUSTOM_REPORT_UPDATE: '/custom-reports/:id',
  CUSTOM_REPORT_DELETE: '/custom-reports/:id',
  CUSTOM_REPORT_EXECUTE: '/custom-reports/:id/execute',
  
  // Data Processing endpoints
  DATA_PROCESSING: '/data-processing',
  DATA_AGGREGATION: '/data-processing/aggregation',
  DATA_VALIDATION: '/data-processing/validation',
  DATA_CLEANSING: '/data-processing/cleansing',
  DATA_REFRESH: '/data-processing/refresh',
  DATA_PROCESSING_STATUS: '/data-processing/status',
  
  // Performance Monitoring endpoints
  PERFORMANCE: '/performance',
  QUERY_PERFORMANCE: '/performance/queries',
  CACHE_STATS: '/performance/cache',
  SYSTEM_METRICS: '/performance/system',
  
  // Alert Management endpoints
  ALERTS: '/alerts',
  ALERTS_LIST: '/alerts/list',
  ALERTS_CREATE: '/alerts/create',
  ALERTS_UPDATE: '/alerts/:id',
  ALERTS_DELETE: '/alerts/:id',
  ALERTS_HISTORY: '/alerts/history',
  ALERTS_THRESHOLD_CONFIG: '/alerts/thresholds',
  
  // Report Templates endpoints
  REPORT_TEMPLATES: '/report-templates',
  REPORT_TEMPLATE_CREATE: '/report-templates/create',
  REPORT_TEMPLATE_UPDATE: '/report-templates/:id',
  REPORT_TEMPLATE_DELETE: '/report-templates/:id',
  REPORT_TEMPLATE_PREVIEW: '/report-templates/:id/preview',
  
  // Audit endpoints
  AUDIT_LOGS: '/audit-logs',
  REPORT_ACCESS_LOGS: '/audit-logs/access',
  REPORT_SHARING_LOGS: '/audit-logs/sharing',
  
  // Configuration endpoints
  CONFIGURATION: '/configuration',
  REPORT_CONFIG: '/configuration/reports',
  DASHBOARD_CONFIG: '/configuration/dashboard',
  EXPORT_CONFIG: '/configuration/export',
  
  // Search and Filter endpoints
  SEARCH: '/search',
  FILTER_OPTIONS: '/filter-options',
  ADVANCED_SEARCH: '/search/advanced',
  
  // Categories endpoints
  REPORTS_CATEGORIES_TAG: 'Report Categories',
  REPORTS_CATEGORIES: '/categories',
  REPORTS_CATEGORY_CREATE: '/create',
  REPORTS_CATEGORY_UPDATE: '/:id',
  REPORTS_CATEGORY_DELETE: '/:id',
  REPORTS_CATEGORY_BY_ID: '/:id',
  REPORTS_CATEGORIES_ACTIVE: '/active',
  REPORTS_CATEGORIES_DEFAULTS: '/defaults',
  REPORTS_CATEGORY_REACTIVATE: '/:id/reactivate',

  // Health and monitoring
  HEALTH: '/health',
  METRICS: '/metrics'
} as const;

export const getReportsUrl = (endpoint: keyof typeof REPORTS_URLS, params?: Record<string, string>): string => {
  let url = REPORTS_URLS.BASE + REPORTS_URLS.API_VERSION + REPORTS_URLS[endpoint];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

export type ReportsUrlType = typeof REPORTS_URLS[keyof typeof REPORTS_URLS];
