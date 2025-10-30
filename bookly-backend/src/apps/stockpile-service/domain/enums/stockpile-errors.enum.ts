/**
 * Stockpile Service Error Codes
 * Enumerable de errores específicos del microservicio de aprobaciones y validaciones
 */

export enum StockpileErrorCode {
  // Approval Flow Errors (STCK-001 to STCK-100)
  APPROVAL_FLOW_NOT_FOUND = 'STCK-001',
  APPROVAL_FLOW_ALREADY_EXISTS = 'STCK-002',
  APPROVAL_FLOW_INACTIVE = 'STCK-003',
  APPROVAL_STEP_NOT_FOUND = 'STCK-004',
  APPROVAL_STEP_INVALID = 'STCK-005',
  APPROVAL_FLOW_CIRCULAR_DEPENDENCY = 'STCK-006',
  APPROVAL_FLOW_CONFIGURATION_INVALID = 'STCK-007',
  APPROVAL_FLOW_ASSIGNMENT_FAILED = 'STCK-008',
  APPROVAL_FLOW_DELETION_DENIED = 'STCK-009',
  APPROVAL_FLOW_LOCKED = 'STCK-010',

  // Request Validation Errors (STCK-101 to STCK-200)
  REQUEST_NOT_FOUND = 'STCK-101',
  REQUEST_ALREADY_PROCESSED = 'STCK-102',
  REQUEST_VALIDATION_FAILED = 'STCK-103',
  REQUEST_EXPIRED = 'STCK-104',
  REQUEST_CANCELLED = 'STCK-105',
  REQUEST_APPROVAL_PENDING = 'STCK-106',
  REQUEST_REJECTION_REASON_REQUIRED = 'STCK-107',
  REQUEST_MODIFICATION_NOT_ALLOWED = 'STCK-108',
  REQUEST_SUBMISSION_FAILED = 'STCK-109',
  REQUEST_DUPLICATE = 'STCK-110',

  // Approval Decision Errors (STCK-201 to STCK-300)
  APPROVAL_DECISION_NOT_FOUND = 'STCK-201',
  APPROVAL_DECISION_ALREADY_MADE = 'STCK-202',
  APPROVAL_DECISION_INVALID = 'STCK-203',
  APPROVER_NOT_AUTHORIZED = 'STCK-204',
  APPROVER_CONFLICT_OF_INTEREST = 'STCK-205',
  APPROVAL_DEADLINE_EXCEEDED = 'STCK-206',
  APPROVAL_HIERARCHY_VIOLATION = 'STCK-207',
  APPROVAL_CRITERIA_NOT_MET = 'STCK-208',
  CONDITIONAL_APPROVAL_REQUIREMENTS_NOT_MET = 'STCK-209',

  // Document Generation Errors (STCK-301 to STCK-400)
  DOCUMENT_TEMPLATE_NOT_FOUND = 'STCK-301',
  DOCUMENT_GENERATION_FAILED = 'STCK-302',
  DOCUMENT_TEMPLATE_INVALID = 'STCK-303',
  DOCUMENT_DATA_INCOMPLETE = 'STCK-304',
  DOCUMENT_SIZE_EXCEEDED = 'STCK-305',
  DOCUMENT_FORMAT_UNSUPPORTED = 'STCK-306',
  DOCUMENT_SIGNATURE_FAILED = 'STCK-307',
  DOCUMENT_DELIVERY_FAILED = 'STCK-308',
  DOCUMENT_ACCESS_DENIED = 'STCK-309',
  DOCUMENT_ALREADY_GENERATED = 'STCK-310',

  // Notification Errors (STCK-401 to STCK-500)
  NOTIFICATION_TEMPLATE_NOT_FOUND = 'STCK-401',
  NOTIFICATION_SEND_FAILED = 'STCK-402',
  NOTIFICATION_CHANNEL_UNAVAILABLE = 'STCK-403',
  NOTIFICATION_RECIPIENT_INVALID = 'STCK-404',
  NOTIFICATION_QUOTA_EXCEEDED = 'STCK-405',
  NOTIFICATION_CONFIGURATION_INVALID = 'STCK-406',
  EMAIL_SERVICE_UNAVAILABLE = 'STCK-407',
  SMS_SERVICE_UNAVAILABLE = 'STCK-408',
  WHATSAPP_SERVICE_UNAVAILABLE = 'STCK-409',
  NOTIFICATION_DELIVERY_CONFIRMATION_FAILED = 'STCK-410',

  // Security Validation Errors (STCK-501 to STCK-600)
  SECURITY_CHECK_FAILED = 'STCK-501',
  ACCESS_CONTROL_VIOLATION = 'STCK-502',
  VIGILANTE_VERIFICATION_FAILED = 'STCK-503',
  QR_CODE_INVALID = 'STCK-504',
  QR_CODE_EXPIRED = 'STCK-505',
  CHECK_IN_FAILED = 'STCK-506',
  CHECK_OUT_FAILED = 'STCK-507',
  VIGILANTE_NOT_AUTHORIZED = 'STCK-508',
  SECURITY_CLEARANCE_INSUFFICIENT = 'STCK-509',
  BIOMETRIC_VERIFICATION_FAILED = 'STCK-510',

  // Workflow Engine Errors (STCK-601 to STCK-700)
  WORKFLOW_NOT_FOUND = 'STCK-601',
  WORKFLOW_EXECUTION_FAILED = 'STCK-602',
  WORKFLOW_STATE_INVALID = 'STCK-603',
  WORKFLOW_TRANSITION_NOT_ALLOWED = 'STCK-604',
  WORKFLOW_CONDITION_NOT_MET = 'STCK-605',
  WORKFLOW_TIMEOUT = 'STCK-606',
  WORKFLOW_ROLLBACK_FAILED = 'STCK-607',
  WORKFLOW_PARALLEL_EXECUTION_ERROR = 'STCK-608',
  WORKFLOW_COMPENSATION_FAILED = 'STCK-609',

  // Integration Errors (STCK-701 to STCK-800)
  EXTERNAL_SYSTEM_INTEGRATION_FAILED = 'STCK-701',
  API_RATE_LIMIT_EXCEEDED = 'STCK-702',
  THIRD_PARTY_SERVICE_UNAVAILABLE = 'STCK-703',
  DATA_SYNCHRONIZATION_FAILED = 'STCK-704',
  WEBHOOK_DELIVERY_FAILED = 'STCK-705',
  MESSAGE_QUEUE_ERROR = 'STCK-706',
  EVENT_PROCESSING_FAILED = 'STCK-707',
  CALLBACK_URL_INVALID = 'STCK-708',

  // Configuration Errors (STCK-801 to STCK-900)
  CONFIGURATION_NOT_FOUND = 'STCK-801',
  CONFIGURATION_INVALID = 'STCK-802',
  PARAMETER_MISSING = 'STCK-803',
  PARAMETER_INVALID = 'STCK-804',
  ENVIRONMENT_CONFIGURATION_ERROR = 'STCK-805',
  FEATURE_FLAG_DISABLED = 'STCK-806',
  SYSTEM_MAINTENANCE_MODE = 'STCK-807',
  CONFIGURATION_UPDATE_FAILED = 'STCK-808',

  // General Errors (STCK-900 to STCK-999)
  SERVICE_UNAVAILABLE = 'STCK-900',
  RATE_LIMIT_EXCEEDED = 'STCK-901',
  VALIDATION_ERROR = 'STCK-902',
  INTERNAL_ERROR = 'STCK-999',
}

export const StockpileErrorMessages: Record<StockpileErrorCode, string> = {
  // Approval Flow
  [StockpileErrorCode.APPROVAL_FLOW_NOT_FOUND]: 'Flujo de aprobación no encontrado.',
  [StockpileErrorCode.APPROVAL_FLOW_ALREADY_EXISTS]: 'Ya existe un flujo de aprobación con ese nombre.',
  [StockpileErrorCode.APPROVAL_FLOW_INACTIVE]: 'El flujo de aprobación está inactivo.',
  [StockpileErrorCode.APPROVAL_STEP_NOT_FOUND]: 'Paso de aprobación no encontrado.',
  [StockpileErrorCode.APPROVAL_STEP_INVALID]: 'Paso de aprobación inválido.',
  [StockpileErrorCode.APPROVAL_FLOW_CIRCULAR_DEPENDENCY]: 'Dependencia circular detectada en el flujo de aprobación.',
  [StockpileErrorCode.APPROVAL_FLOW_CONFIGURATION_INVALID]: 'Configuración del flujo de aprobación inválida.',
  [StockpileErrorCode.APPROVAL_FLOW_ASSIGNMENT_FAILED]: 'Falló la asignación del flujo de aprobación.',
  [StockpileErrorCode.APPROVAL_FLOW_DELETION_DENIED]: 'No se puede eliminar el flujo de aprobación.',
  [StockpileErrorCode.APPROVAL_FLOW_LOCKED]: 'El flujo de aprobación está bloqueado.',

  // Request Validation
  [StockpileErrorCode.REQUEST_NOT_FOUND]: 'Solicitud no encontrada.',
  [StockpileErrorCode.REQUEST_ALREADY_PROCESSED]: 'La solicitud ya ha sido procesada.',
  [StockpileErrorCode.REQUEST_VALIDATION_FAILED]: 'Falló la validación de la solicitud.',
  [StockpileErrorCode.REQUEST_EXPIRED]: 'La solicitud ha expirado.',
  [StockpileErrorCode.REQUEST_CANCELLED]: 'La solicitud ha sido cancelada.',
  [StockpileErrorCode.REQUEST_APPROVAL_PENDING]: 'La solicitud está pendiente de aprobación.',
  [StockpileErrorCode.REQUEST_REJECTION_REASON_REQUIRED]: 'Se requiere razón para el rechazo.',
  [StockpileErrorCode.REQUEST_MODIFICATION_NOT_ALLOWED]: 'No se permite modificar la solicitud.',
  [StockpileErrorCode.REQUEST_SUBMISSION_FAILED]: 'Falló el envío de la solicitud.',
  [StockpileErrorCode.REQUEST_DUPLICATE]: 'Solicitud duplicada.',

  // Approval Decision
  [StockpileErrorCode.APPROVAL_DECISION_NOT_FOUND]: 'Decisión de aprobación no encontrada.',
  [StockpileErrorCode.APPROVAL_DECISION_ALREADY_MADE]: 'Ya se ha tomado una decisión de aprobación.',
  [StockpileErrorCode.APPROVAL_DECISION_INVALID]: 'Decisión de aprobación inválida.',
  [StockpileErrorCode.APPROVER_NOT_AUTHORIZED]: 'El aprobador no está autorizado.',
  [StockpileErrorCode.APPROVER_CONFLICT_OF_INTEREST]: 'Conflicto de interés del aprobador.',
  [StockpileErrorCode.APPROVAL_DEADLINE_EXCEEDED]: 'Plazo de aprobación excedido.',
  [StockpileErrorCode.APPROVAL_HIERARCHY_VIOLATION]: 'Violación de jerarquía de aprobación.',
  [StockpileErrorCode.APPROVAL_CRITERIA_NOT_MET]: 'Criterios de aprobación no cumplidos.',
  [StockpileErrorCode.CONDITIONAL_APPROVAL_REQUIREMENTS_NOT_MET]: 'Requisitos de aprobación condicional no cumplidos.',

  // Document Generation
  [StockpileErrorCode.DOCUMENT_TEMPLATE_NOT_FOUND]: 'Plantilla de documento no encontrada.',
  [StockpileErrorCode.DOCUMENT_GENERATION_FAILED]: 'Falló la generación del documento.',
  [StockpileErrorCode.DOCUMENT_TEMPLATE_INVALID]: 'Plantilla de documento inválida.',
  [StockpileErrorCode.DOCUMENT_DATA_INCOMPLETE]: 'Datos del documento incompletos.',
  [StockpileErrorCode.DOCUMENT_SIZE_EXCEEDED]: 'Tamaño del documento excedido.',
  [StockpileErrorCode.DOCUMENT_FORMAT_UNSUPPORTED]: 'Formato de documento no soportado.',
  [StockpileErrorCode.DOCUMENT_SIGNATURE_FAILED]: 'Falló la firma del documento.',
  [StockpileErrorCode.DOCUMENT_DELIVERY_FAILED]: 'Falló la entrega del documento.',
  [StockpileErrorCode.DOCUMENT_ACCESS_DENIED]: 'Acceso al documento denegado.',
  [StockpileErrorCode.DOCUMENT_ALREADY_GENERATED]: 'El documento ya ha sido generado.',

  // Notification
  [StockpileErrorCode.NOTIFICATION_TEMPLATE_NOT_FOUND]: 'Plantilla de notificación no encontrada.',
  [StockpileErrorCode.NOTIFICATION_SEND_FAILED]: 'Falló el envío de la notificación.',
  [StockpileErrorCode.NOTIFICATION_CHANNEL_UNAVAILABLE]: 'Canal de notificación no disponible.',
  [StockpileErrorCode.NOTIFICATION_RECIPIENT_INVALID]: 'Destinatario de notificación inválido.',
  [StockpileErrorCode.NOTIFICATION_QUOTA_EXCEEDED]: 'Cuota de notificaciones excedida.',
  [StockpileErrorCode.NOTIFICATION_CONFIGURATION_INVALID]: 'Configuración de notificación inválida.',
  [StockpileErrorCode.EMAIL_SERVICE_UNAVAILABLE]: 'Servicio de email no disponible.',
  [StockpileErrorCode.SMS_SERVICE_UNAVAILABLE]: 'Servicio de SMS no disponible.',
  [StockpileErrorCode.WHATSAPP_SERVICE_UNAVAILABLE]: 'Servicio de WhatsApp no disponible.',
  [StockpileErrorCode.NOTIFICATION_DELIVERY_CONFIRMATION_FAILED]: 'Falló la confirmación de entrega.',

  // Security Validation
  [StockpileErrorCode.SECURITY_CHECK_FAILED]: 'Falló la verificación de seguridad.',
  [StockpileErrorCode.ACCESS_CONTROL_VIOLATION]: 'Violación de control de acceso.',
  [StockpileErrorCode.VIGILANTE_VERIFICATION_FAILED]: 'Falló la verificación del vigilante.',
  [StockpileErrorCode.QR_CODE_INVALID]: 'Código QR inválido.',
  [StockpileErrorCode.QR_CODE_EXPIRED]: 'Código QR expirado.',
  [StockpileErrorCode.CHECK_IN_FAILED]: 'Falló el check-in.',
  [StockpileErrorCode.CHECK_OUT_FAILED]: 'Falló el check-out.',
  [StockpileErrorCode.VIGILANTE_NOT_AUTHORIZED]: 'Vigilante no autorizado.',
  [StockpileErrorCode.SECURITY_CLEARANCE_INSUFFICIENT]: 'Autorización de seguridad insuficiente.',
  [StockpileErrorCode.BIOMETRIC_VERIFICATION_FAILED]: 'Falló la verificación biométrica.',

  // Workflow Engine
  [StockpileErrorCode.WORKFLOW_NOT_FOUND]: 'Flujo de trabajo no encontrado.',
  [StockpileErrorCode.WORKFLOW_EXECUTION_FAILED]: 'Falló la ejecución del flujo de trabajo.',
  [StockpileErrorCode.WORKFLOW_STATE_INVALID]: 'Estado del flujo de trabajo inválido.',
  [StockpileErrorCode.WORKFLOW_TRANSITION_NOT_ALLOWED]: 'Transición del flujo de trabajo no permitida.',
  [StockpileErrorCode.WORKFLOW_CONDITION_NOT_MET]: 'Condición del flujo de trabajo no cumplida.',
  [StockpileErrorCode.WORKFLOW_TIMEOUT]: 'Tiempo del flujo de trabajo agotado.',
  [StockpileErrorCode.WORKFLOW_ROLLBACK_FAILED]: 'Falló el rollback del flujo de trabajo.',
  [StockpileErrorCode.WORKFLOW_PARALLEL_EXECUTION_ERROR]: 'Error en ejecución paralela del flujo.',
  [StockpileErrorCode.WORKFLOW_COMPENSATION_FAILED]: 'Falló la compensación del flujo de trabajo.',

  // Integration
  [StockpileErrorCode.EXTERNAL_SYSTEM_INTEGRATION_FAILED]: 'Falló la integración con sistema externo.',
  [StockpileErrorCode.API_RATE_LIMIT_EXCEEDED]: 'Límite de tasa de API excedido.',
  [StockpileErrorCode.THIRD_PARTY_SERVICE_UNAVAILABLE]: 'Servicio de terceros no disponible.',
  [StockpileErrorCode.DATA_SYNCHRONIZATION_FAILED]: 'Falló la sincronización de datos.',
  [StockpileErrorCode.WEBHOOK_DELIVERY_FAILED]: 'Falló la entrega del webhook.',
  [StockpileErrorCode.MESSAGE_QUEUE_ERROR]: 'Error en cola de mensajes.',
  [StockpileErrorCode.EVENT_PROCESSING_FAILED]: 'Falló el procesamiento de eventos.',
  [StockpileErrorCode.CALLBACK_URL_INVALID]: 'URL de callback inválida.',

  // Configuration
  [StockpileErrorCode.CONFIGURATION_NOT_FOUND]: 'Configuración no encontrada.',
  [StockpileErrorCode.CONFIGURATION_INVALID]: 'Configuración inválida.',
  [StockpileErrorCode.PARAMETER_MISSING]: 'Parámetro faltante.',
  [StockpileErrorCode.PARAMETER_INVALID]: 'Parámetro inválido.',
  [StockpileErrorCode.ENVIRONMENT_CONFIGURATION_ERROR]: 'Error de configuración del entorno.',
  [StockpileErrorCode.FEATURE_FLAG_DISABLED]: 'Feature flag deshabilitado.',
  [StockpileErrorCode.SYSTEM_MAINTENANCE_MODE]: 'Sistema en modo mantenimiento.',
  [StockpileErrorCode.CONFIGURATION_UPDATE_FAILED]: 'Falló la actualización de configuración.',

  // General
  [StockpileErrorCode.SERVICE_UNAVAILABLE]: 'Servicio de aprobaciones no disponible.',
  [StockpileErrorCode.RATE_LIMIT_EXCEEDED]: 'Límite de peticiones excedido. Intenta más tarde.',
  [StockpileErrorCode.VALIDATION_ERROR]: 'Error de validación en los datos enviados.',
  [StockpileErrorCode.INTERNAL_ERROR]: 'Error interno del servicio de aprobaciones.',
};

export interface StockpileError {
  code: StockpileErrorCode;
  message: string;
  details?: any;
}

export class StockpileException extends Error {
  constructor(
    public readonly code: StockpileErrorCode,
    public readonly details?: any,
  ) {
    super(StockpileErrorMessages[code]);
    this.name = 'StockpileException';
  }
}
