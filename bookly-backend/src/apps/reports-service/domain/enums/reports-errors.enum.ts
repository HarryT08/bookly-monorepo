/**
 * Reports Service Error Codes
 * Enumerable de errores específicos del microservicio de reportes y análisis
 */

export enum ReportsErrorCode {
  // Report Generation Errors (RPTS-001 to RPTS-100)
  REPORT_NOT_FOUND = 'RPTS-001',
  REPORT_GENERATION_FAILED = 'RPTS-002',
  REPORT_TYPE_INVALID = 'RPTS-003',
  REPORT_PARAMETERS_INVALID = 'RPTS-004',
  REPORT_DATA_INSUFFICIENT = 'RPTS-005',
  REPORT_TIMEOUT = 'RPTS-006',
  REPORT_SIZE_EXCEEDED = 'RPTS-007',
  REPORT_TEMPLATE_NOT_FOUND = 'RPTS-008',
  REPORT_ALREADY_PROCESSING = 'RPTS-009',
  REPORT_ACCESS_DENIED = 'RPTS-010',

  // Export Errors (RPTS-101 to RPTS-200)
  EXPORT_FORMAT_UNSUPPORTED = 'RPTS-101',
  EXPORT_GENERATION_FAILED = 'RPTS-102',
  EXPORT_FILE_TOO_LARGE = 'RPTS-103',
  EXPORT_QUEUE_FULL = 'RPTS-104',
  EXPORT_NOT_FOUND = 'RPTS-105',
  EXPORT_EXPIRED = 'RPTS-106',
  EXPORT_DOWNLOAD_FAILED = 'RPTS-107',
  EXPORT_PERMISSION_DENIED = 'RPTS-108',
  EXPORT_QUOTA_EXCEEDED = 'RPTS-109',

  // Dashboard Errors (RPTS-201 to RPTS-300)
  DASHBOARD_NOT_FOUND = 'RPTS-201',
  DASHBOARD_CONFIG_INVALID = 'RPTS-202',
  DASHBOARD_WIDGET_ERROR = 'RPTS-203',
  DASHBOARD_DATA_REFRESH_FAILED = 'RPTS-204',
  DASHBOARD_PERMISSION_DENIED = 'RPTS-205',
  DASHBOARD_CUSTOMIZATION_FAILED = 'RPTS-206',
  DASHBOARD_METRICS_UNAVAILABLE = 'RPTS-207',
  REAL_TIME_DATA_ERROR = 'RPTS-208',

  // Feedback System Errors (RPTS-301 to RPTS-400)
  FEEDBACK_NOT_FOUND = 'RPTS-301',
  FEEDBACK_SUBMISSION_FAILED = 'RPTS-302',
  FEEDBACK_RATING_INVALID = 'RPTS-303',
  FEEDBACK_ALREADY_SUBMITTED = 'RPTS-304',
  FEEDBACK_PERMISSION_DENIED = 'RPTS-305',
  FEEDBACK_RESOURCE_NOT_FOUND = 'RPTS-306',
  FEEDBACK_AGGREGATION_ERROR = 'RPTS-307',
  FEEDBACK_MODERATION_REQUIRED = 'RPTS-308',

  // Usage Analytics Errors (RPTS-401 to RPTS-500)
  USAGE_DATA_NOT_FOUND = 'RPTS-401',
  USAGE_ANALYTICS_FAILED = 'RPTS-402',
  DATE_RANGE_INVALID = 'RPTS-403',
  PROGRAM_FILTER_INVALID = 'RPTS-404',
  RESOURCE_FILTER_INVALID = 'RPTS-405',
  ANALYTICS_AGGREGATION_ERROR = 'RPTS-406',
  USAGE_METRICS_UNAVAILABLE = 'RPTS-407',
  HISTORICAL_DATA_INCOMPLETE = 'RPTS-408',

  // User Reports Errors (RPTS-501 to RPTS-600)
  USER_REPORT_NOT_FOUND = 'RPTS-501',
  USER_STATS_UNAVAILABLE = 'RPTS-502',
  USER_PERMISSION_DENIED = 'RPTS-503',
  USER_DATA_PRIVACY_VIOLATION = 'RPTS-504',
  USER_REPORT_GENERATION_FAILED = 'RPTS-505',
  PERSONAL_DATA_ACCESS_DENIED = 'RPTS-506',
  USER_ACTIVITY_NOT_FOUND = 'RPTS-507',

  // Demand Analysis Errors (RPTS-601 to RPTS-700)
  DEMAND_ANALYSIS_FAILED = 'RPTS-601',
  DEMAND_DATA_INSUFFICIENT = 'RPTS-602',
  DEMAND_FORECAST_ERROR = 'RPTS-603',
  CAPACITY_ANALYSIS_FAILED = 'RPTS-604',
  OPTIMIZATION_SUGGESTIONS_FAILED = 'RPTS-605',
  UNSATISFIED_DEMAND_CALCULATION_ERROR = 'RPTS-606',
  DEMAND_TRENDS_UNAVAILABLE = 'RPTS-607',

  // Data Processing Errors (RPTS-701 to RPTS-800)
  DATA_AGGREGATION_FAILED = 'RPTS-701',
  DATA_SOURCE_UNAVAILABLE = 'RPTS-702',
  DATA_INTEGRITY_ERROR = 'RPTS-703',
  DATA_TRANSFORMATION_FAILED = 'RPTS-704',
  DATA_CACHE_ERROR = 'RPTS-705',
  DATA_SYNCHRONIZATION_FAILED = 'RPTS-706',
  DATA_QUERY_TIMEOUT = 'RPTS-707',
  DATA_VOLUME_EXCEEDED = 'RPTS-708',

  // Permissions & Access Errors (RPTS-801 to RPTS-900)
  INSUFFICIENT_PERMISSIONS = 'RPTS-801',
  REPORT_ACCESS_DENIED_ERROR = 'RPTS-802',
  PROGRAM_ACCESS_RESTRICTED = 'RPTS-803',
  USER_DATA_ACCESS_DENIED = 'RPTS-804',
  ADMIN_PRIVILEGES_REQUIRED = 'RPTS-805',
  CROSS_PROGRAM_ACCESS_DENIED = 'RPTS-806',
  SENSITIVE_DATA_ACCESS_DENIED = 'RPTS-807',

  // General Errors (RPTS-900 to RPTS-999)
  SERVICE_UNAVAILABLE = 'RPTS-900',
  RATE_LIMIT_EXCEEDED = 'RPTS-901',
  VALIDATION_ERROR = 'RPTS-902',
  INTERNAL_ERROR = 'RPTS-999',
}

export const ReportsErrorMessages: Record<ReportsErrorCode, string> = {
  // Report Generation
  [ReportsErrorCode.REPORT_NOT_FOUND]: 'Reporte no encontrado.',
  [ReportsErrorCode.REPORT_GENERATION_FAILED]: 'Falló la generación del reporte.',
  [ReportsErrorCode.REPORT_TYPE_INVALID]: 'Tipo de reporte inválido.',
  [ReportsErrorCode.REPORT_PARAMETERS_INVALID]: 'Parámetros del reporte inválidos.',
  [ReportsErrorCode.REPORT_DATA_INSUFFICIENT]: 'Datos insuficientes para generar el reporte.',
  [ReportsErrorCode.REPORT_TIMEOUT]: 'Tiempo de generación del reporte agotado.',
  [ReportsErrorCode.REPORT_SIZE_EXCEEDED]: 'Tamaño del reporte excedido.',
  [ReportsErrorCode.REPORT_TEMPLATE_NOT_FOUND]: 'Plantilla de reporte no encontrada.',
  [ReportsErrorCode.REPORT_ALREADY_PROCESSING]: 'El reporte ya está siendo procesado.',
  [ReportsErrorCode.REPORT_ACCESS_DENIED]: 'Acceso al reporte denegado.',

  // Export
  [ReportsErrorCode.EXPORT_FORMAT_UNSUPPORTED]: 'Formato de exportación no soportado.',
  [ReportsErrorCode.EXPORT_GENERATION_FAILED]: 'Falló la generación de la exportación.',
  [ReportsErrorCode.EXPORT_FILE_TOO_LARGE]: 'Archivo de exportación demasiado grande.',
  [ReportsErrorCode.EXPORT_QUEUE_FULL]: 'Cola de exportación llena.',
  [ReportsErrorCode.EXPORT_NOT_FOUND]: 'Exportación no encontrada.',
  [ReportsErrorCode.EXPORT_EXPIRED]: 'La exportación ha expirado.',
  [ReportsErrorCode.EXPORT_DOWNLOAD_FAILED]: 'Falló la descarga de la exportación.',
  [ReportsErrorCode.EXPORT_PERMISSION_DENIED]: 'Permisos insuficientes para exportar.',
  [ReportsErrorCode.EXPORT_QUOTA_EXCEEDED]: 'Cuota de exportación excedida.',

  // Dashboard
  [ReportsErrorCode.DASHBOARD_NOT_FOUND]: 'Dashboard no encontrado.',
  [ReportsErrorCode.DASHBOARD_CONFIG_INVALID]: 'Configuración de dashboard inválida.',
  [ReportsErrorCode.DASHBOARD_WIDGET_ERROR]: 'Error en widget del dashboard.',
  [ReportsErrorCode.DASHBOARD_DATA_REFRESH_FAILED]: 'Falló la actualización de datos del dashboard.',
  [ReportsErrorCode.DASHBOARD_PERMISSION_DENIED]: 'Permisos insuficientes para acceder al dashboard.',
  [ReportsErrorCode.DASHBOARD_CUSTOMIZATION_FAILED]: 'Falló la personalización del dashboard.',
  [ReportsErrorCode.DASHBOARD_METRICS_UNAVAILABLE]: 'Métricas del dashboard no disponibles.',
  [ReportsErrorCode.REAL_TIME_DATA_ERROR]: 'Error en datos en tiempo real.',

  // Feedback System
  [ReportsErrorCode.FEEDBACK_NOT_FOUND]: 'Feedback no encontrado.',
  [ReportsErrorCode.FEEDBACK_SUBMISSION_FAILED]: 'Falló el envío del feedback.',
  [ReportsErrorCode.FEEDBACK_RATING_INVALID]: 'Calificación de feedback inválida.',
  [ReportsErrorCode.FEEDBACK_ALREADY_SUBMITTED]: 'Ya has enviado feedback para este recurso.',
  [ReportsErrorCode.FEEDBACK_PERMISSION_DENIED]: 'Permisos insuficientes para enviar feedback.',
  [ReportsErrorCode.FEEDBACK_RESOURCE_NOT_FOUND]: 'Recurso para feedback no encontrado.',
  [ReportsErrorCode.FEEDBACK_AGGREGATION_ERROR]: 'Error en la agregación de feedback.',
  [ReportsErrorCode.FEEDBACK_MODERATION_REQUIRED]: 'El feedback requiere moderación.',

  // Usage Analytics
  [ReportsErrorCode.USAGE_DATA_NOT_FOUND]: 'Datos de uso no encontrados.',
  [ReportsErrorCode.USAGE_ANALYTICS_FAILED]: 'Falló el análisis de uso.',
  [ReportsErrorCode.DATE_RANGE_INVALID]: 'Rango de fechas inválido.',
  [ReportsErrorCode.PROGRAM_FILTER_INVALID]: 'Filtro de programa inválido.',
  [ReportsErrorCode.RESOURCE_FILTER_INVALID]: 'Filtro de recurso inválido.',
  [ReportsErrorCode.ANALYTICS_AGGREGATION_ERROR]: 'Error en la agregación de analíticas.',
  [ReportsErrorCode.USAGE_METRICS_UNAVAILABLE]: 'Métricas de uso no disponibles.',
  [ReportsErrorCode.HISTORICAL_DATA_INCOMPLETE]: 'Datos históricos incompletos.',

  // User Reports
  [ReportsErrorCode.USER_REPORT_NOT_FOUND]: 'Reporte de usuario no encontrado.',
  [ReportsErrorCode.USER_STATS_UNAVAILABLE]: 'Estadísticas de usuario no disponibles.',
  [ReportsErrorCode.USER_PERMISSION_DENIED]: 'Permisos insuficientes para acceder a datos de usuario.',
  [ReportsErrorCode.USER_DATA_PRIVACY_VIOLATION]: 'Violación de privacidad de datos de usuario.',
  [ReportsErrorCode.USER_REPORT_GENERATION_FAILED]: 'Falló la generación del reporte de usuario.',
  [ReportsErrorCode.PERSONAL_DATA_ACCESS_DENIED]: 'Acceso a datos personales denegado.',
  [ReportsErrorCode.USER_ACTIVITY_NOT_FOUND]: 'Actividad de usuario no encontrada.',

  // Demand Analysis
  [ReportsErrorCode.DEMAND_ANALYSIS_FAILED]: 'Falló el análisis de demanda.',
  [ReportsErrorCode.DEMAND_DATA_INSUFFICIENT]: 'Datos insuficientes para análisis de demanda.',
  [ReportsErrorCode.DEMAND_FORECAST_ERROR]: 'Error en el pronóstico de demanda.',
  [ReportsErrorCode.CAPACITY_ANALYSIS_FAILED]: 'Falló el análisis de capacidad.',
  [ReportsErrorCode.OPTIMIZATION_SUGGESTIONS_FAILED]: 'Falló la generación de sugerencias de optimización.',
  [ReportsErrorCode.UNSATISFIED_DEMAND_CALCULATION_ERROR]: 'Error calculando demanda insatisfecha.',
  [ReportsErrorCode.DEMAND_TRENDS_UNAVAILABLE]: 'Tendencias de demanda no disponibles.',

  // Data Processing
  [ReportsErrorCode.DATA_AGGREGATION_FAILED]: 'Falló la agregación de datos.',
  [ReportsErrorCode.DATA_SOURCE_UNAVAILABLE]: 'Fuente de datos no disponible.',
  [ReportsErrorCode.DATA_INTEGRITY_ERROR]: 'Error de integridad de datos.',
  [ReportsErrorCode.DATA_TRANSFORMATION_FAILED]: 'Falló la transformación de datos.',
  [ReportsErrorCode.DATA_CACHE_ERROR]: 'Error en caché de datos.',
  [ReportsErrorCode.DATA_SYNCHRONIZATION_FAILED]: 'Falló la sincronización de datos.',
  [ReportsErrorCode.DATA_QUERY_TIMEOUT]: 'Tiempo de consulta de datos agotado.',
  [ReportsErrorCode.DATA_VOLUME_EXCEEDED]: 'Volumen de datos excedido.',

  // Permissions & Access
  [ReportsErrorCode.INSUFFICIENT_PERMISSIONS]: 'Permisos insuficientes.',
  [ReportsErrorCode.REPORT_ACCESS_DENIED_ERROR]: 'Acceso al reporte negado.',
  [ReportsErrorCode.PROGRAM_ACCESS_RESTRICTED]: 'Acceso al programa restringido.',
  [ReportsErrorCode.USER_DATA_ACCESS_DENIED]: 'Acceso a datos de usuario denegado.',
  [ReportsErrorCode.ADMIN_PRIVILEGES_REQUIRED]: 'Se requieren privilegios de administrador.',
  [ReportsErrorCode.CROSS_PROGRAM_ACCESS_DENIED]: 'Acceso entre programas denegado.',
  [ReportsErrorCode.SENSITIVE_DATA_ACCESS_DENIED]: 'Acceso a datos sensibles denegado.',

  // General
  [ReportsErrorCode.SERVICE_UNAVAILABLE]: 'Servicio de reportes no disponible.',
  [ReportsErrorCode.RATE_LIMIT_EXCEEDED]: 'Límite de peticiones excedido. Intenta más tarde.',
  [ReportsErrorCode.VALIDATION_ERROR]: 'Error de validación en los datos enviados.',
  [ReportsErrorCode.INTERNAL_ERROR]: 'Error interno del servicio de reportes.',
};

export interface ReportsError {
  code: ReportsErrorCode;
  message: string;
  details?: any;
}

export class ReportsException extends Error {
  constructor(
    public readonly code: ReportsErrorCode,
    public readonly details?: any,
  ) {
    super(ReportsErrorMessages[code]);
    this.name = 'ReportsException';
  }
}
