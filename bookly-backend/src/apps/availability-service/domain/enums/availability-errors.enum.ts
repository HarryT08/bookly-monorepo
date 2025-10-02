/**
 * Availability Service Error Codes
 * Enumerable de errores específicos del microservicio de disponibilidad y reservas
 */

export enum AvailabilityErrorCode {
  // Reservation Errors (AVLB-001 to AVLB-100)
  RESERVATION_NOT_FOUND = 'AVLB-001',
  RESERVATION_CONFLICT = 'AVLB-002',
  RESOURCE_NOT_AVAILABLE = 'AVLB-003',
  RESERVATION_EXPIRED = 'AVLB-004',
  RESERVATION_CANCELLED = 'AVLB-005',
  RESERVATION_ALREADY_CONFIRMED = 'AVLB-006',
  RESERVATION_IN_PAST = 'AVLB-007',
  RESERVATION_TOO_FAR_FUTURE = 'AVLB-008',
  MAX_RESERVATIONS_EXCEEDED = 'AVLB-009',
  RESERVATION_DURATION_INVALID = 'AVLB-010',
  RESERVATION_OUTSIDE_HOURS = 'AVLB-011',
  RESERVATION_MODIFICATION_DENIED = 'AVLB-012',

  // Resource Availability Errors (AVLB-101 to AVLB-200)
  RESOURCE_UNDER_MAINTENANCE = 'AVLB-101',
  RESOURCE_BLOCKED = 'AVLB-102',
  RESOURCE_CAPACITY_EXCEEDED = 'AVLB-103',
  SCHEDULE_NOT_FOUND = 'AVLB-104',
  SCHEDULE_CONFLICT = 'AVLB-105',
  INVALID_TIME_SLOT = 'AVLB-106',
  NO_AVAILABILITY_FOUND = 'AVLB-107',
  RECURRING_SCHEDULE_ERROR = 'AVLB-108',

  // Recurring Reservation Errors (AVLB-201 to AVLB-300)
  RECURRING_PATTERN_INVALID = 'AVLB-201',
  RECURRING_END_DATE_INVALID = 'AVLB-202',
  RECURRING_FREQUENCY_INVALID = 'AVLB-203',
  RECURRING_INSTANCES_EXCEEDED = 'AVLB-204',
  RECURRING_CONFLICT_DETECTED = 'AVLB-205',
  RECURRING_MODIFICATION_DENIED = 'AVLB-206',

  // Waiting List Errors (AVLB-301 to AVLB-400)
  WAITLIST_FULL = 'AVLB-301',
  ALREADY_IN_WAITLIST = 'AVLB-302',
  WAITLIST_ENTRY_NOT_FOUND = 'AVLB-303',
  WAITLIST_EXPIRED = 'AVLB-304',
  WAITLIST_POSITION_INVALID = 'AVLB-305',
  WAITLIST_NOTIFICATION_FAILED = 'AVLB-306',

  // Reassignment Errors (AVLB-401 to AVLB-500)
  REASSIGNMENT_NOT_ALLOWED = 'AVLB-401',
  TARGET_RESOURCE_UNAVAILABLE = 'AVLB-402',
  REASSIGNMENT_DEADLINE_PASSED = 'AVLB-403',
  REASSIGNMENT_REQUEST_NOT_FOUND = 'AVLB-404',
  REASSIGNMENT_ALREADY_PROCESSED = 'AVLB-405',
  INSUFFICIENT_PERMISSIONS_REASSIGN = 'AVLB-406',

  // Calendar Integration Errors (AVLB-501 to AVLB-600)
  CALENDAR_SYNC_FAILED = 'AVLB-501',
  CALENDAR_NOT_CONFIGURED = 'AVLB-502',
  CALENDAR_CREDENTIALS_INVALID = 'AVLB-503',
  CALENDAR_EVENT_NOT_FOUND = 'AVLB-504',
  CALENDAR_QUOTA_EXCEEDED = 'AVLB-505',
  EXTERNAL_CALENDAR_ERROR = 'AVLB-506',

  // Search and Query Errors (AVLB-601 to AVLB-700)
  SEARCH_CRITERIA_INVALID = 'AVLB-601',
  DATE_RANGE_INVALID = 'AVLB-602',
  FILTER_PARAMETERS_INVALID = 'AVLB-603',
  SEARCH_TIMEOUT = 'AVLB-604',
  NO_RESULTS_FOUND = 'AVLB-605',

  // History and Audit Errors (AVLB-701 to AVLB-800)
  HISTORY_NOT_FOUND = 'AVLB-701',
  AUDIT_LOG_ERROR = 'AVLB-702',
  HISTORY_ACCESS_DENIED = 'AVLB-703',
  HISTORY_RETENTION_EXCEEDED = 'AVLB-704',

  // General Errors (AVLB-900 to AVLB-999)
  SERVICE_UNAVAILABLE = 'AVLB-900',
  RATE_LIMIT_EXCEEDED = 'AVLB-901',
  VALIDATION_ERROR = 'AVLB-902',
  INTERNAL_ERROR = 'AVLB-999',
}

export const AvailabilityErrorMessages: Record<AvailabilityErrorCode, string> = {
  // Reservation Errors
  [AvailabilityErrorCode.RESERVATION_NOT_FOUND]: 'Reserva no encontrada.',
  [AvailabilityErrorCode.RESERVATION_CONFLICT]: 'Conflicto de horario con otra reserva existente.',
  [AvailabilityErrorCode.RESOURCE_NOT_AVAILABLE]: 'El recurso no está disponible en el horario solicitado.',
  [AvailabilityErrorCode.RESERVATION_EXPIRED]: 'La reserva ha expirado.',
  [AvailabilityErrorCode.RESERVATION_CANCELLED]: 'La reserva ha sido cancelada.',
  [AvailabilityErrorCode.RESERVATION_ALREADY_CONFIRMED]: 'La reserva ya está confirmada.',
  [AvailabilityErrorCode.RESERVATION_IN_PAST]: 'No se pueden crear reservas en fechas pasadas.',
  [AvailabilityErrorCode.RESERVATION_TOO_FAR_FUTURE]: 'La fecha de reserva está demasiado en el futuro.',
  [AvailabilityErrorCode.MAX_RESERVATIONS_EXCEEDED]: 'Has excedido el límite máximo de reservas.',
  [AvailabilityErrorCode.RESERVATION_DURATION_INVALID]: 'La duración de la reserva es inválida.',
  [AvailabilityErrorCode.RESERVATION_OUTSIDE_HOURS]: 'La reserva está fuera del horario permitido.',
  [AvailabilityErrorCode.RESERVATION_MODIFICATION_DENIED]: 'No se puede modificar esta reserva.',

  // Resource Availability
  [AvailabilityErrorCode.RESOURCE_UNDER_MAINTENANCE]: 'El recurso está en mantenimiento.',
  [AvailabilityErrorCode.RESOURCE_BLOCKED]: 'El recurso está bloqueado.',
  [AvailabilityErrorCode.RESOURCE_CAPACITY_EXCEEDED]: 'Se ha excedido la capacidad del recurso.',
  [AvailabilityErrorCode.SCHEDULE_NOT_FOUND]: 'Horario no encontrado.',
  [AvailabilityErrorCode.SCHEDULE_CONFLICT]: 'Conflicto en la programación de horarios.',
  [AvailabilityErrorCode.INVALID_TIME_SLOT]: 'Franja horaria inválida.',
  [AvailabilityErrorCode.NO_AVAILABILITY_FOUND]: 'No hay disponibilidad en las fechas solicitadas.',
  [AvailabilityErrorCode.RECURRING_SCHEDULE_ERROR]: 'Error en la programación recurrente.',

  // Recurring Reservations
  [AvailabilityErrorCode.RECURRING_PATTERN_INVALID]: 'Patrón de recurrencia inválido.',
  [AvailabilityErrorCode.RECURRING_END_DATE_INVALID]: 'Fecha de fin de recurrencia inválida.',
  [AvailabilityErrorCode.RECURRING_FREQUENCY_INVALID]: 'Frecuencia de recurrencia inválida.',
  [AvailabilityErrorCode.RECURRING_INSTANCES_EXCEEDED]: 'Se excedió el límite de instancias recurrentes.',
  [AvailabilityErrorCode.RECURRING_CONFLICT_DETECTED]: 'Conflicto detectado en reservas recurrentes.',
  [AvailabilityErrorCode.RECURRING_MODIFICATION_DENIED]: 'No se puede modificar la reserva recurrente.',

  // Waiting List
  [AvailabilityErrorCode.WAITLIST_FULL]: 'La lista de espera está llena.',
  [AvailabilityErrorCode.ALREADY_IN_WAITLIST]: 'Ya estás en la lista de espera para este recurso.',
  [AvailabilityErrorCode.WAITLIST_ENTRY_NOT_FOUND]: 'Entrada en lista de espera no encontrada.',
  [AvailabilityErrorCode.WAITLIST_EXPIRED]: 'Tu posición en la lista de espera ha expirado.',
  [AvailabilityErrorCode.WAITLIST_POSITION_INVALID]: 'Posición en lista de espera inválida.',
  [AvailabilityErrorCode.WAITLIST_NOTIFICATION_FAILED]: 'Falló el envío de notificación de lista de espera.',

  // Reassignment
  [AvailabilityErrorCode.REASSIGNMENT_NOT_ALLOWED]: 'La reasignación no está permitida.',
  [AvailabilityErrorCode.TARGET_RESOURCE_UNAVAILABLE]: 'El recurso objetivo no está disponible.',
  [AvailabilityErrorCode.REASSIGNMENT_DEADLINE_PASSED]: 'Ha pasado el plazo límite para reasignación.',
  [AvailabilityErrorCode.REASSIGNMENT_REQUEST_NOT_FOUND]: 'Solicitud de reasignación no encontrada.',
  [AvailabilityErrorCode.REASSIGNMENT_ALREADY_PROCESSED]: 'La reasignación ya ha sido procesada.',
  [AvailabilityErrorCode.INSUFFICIENT_PERMISSIONS_REASSIGN]: 'Permisos insuficientes para reasignar.',

  // Calendar Integration
  [AvailabilityErrorCode.CALENDAR_SYNC_FAILED]: 'Falló la sincronización con el calendario.',
  [AvailabilityErrorCode.CALENDAR_NOT_CONFIGURED]: 'Calendario no configurado.',
  [AvailabilityErrorCode.CALENDAR_CREDENTIALS_INVALID]: 'Credenciales de calendario inválidas.',
  [AvailabilityErrorCode.CALENDAR_EVENT_NOT_FOUND]: 'Evento de calendario no encontrado.',
  [AvailabilityErrorCode.CALENDAR_QUOTA_EXCEEDED]: 'Cuota de calendario excedida.',
  [AvailabilityErrorCode.EXTERNAL_CALENDAR_ERROR]: 'Error en calendario externo.',

  // Search and Query
  [AvailabilityErrorCode.SEARCH_CRITERIA_INVALID]: 'Criterios de búsqueda inválidos.',
  [AvailabilityErrorCode.DATE_RANGE_INVALID]: 'Rango de fechas inválido.',
  [AvailabilityErrorCode.FILTER_PARAMETERS_INVALID]: 'Parámetros de filtro inválidos.',
  [AvailabilityErrorCode.SEARCH_TIMEOUT]: 'Tiempo de búsqueda agotado.',
  [AvailabilityErrorCode.NO_RESULTS_FOUND]: 'No se encontraron resultados.',

  // History and Audit
  [AvailabilityErrorCode.HISTORY_NOT_FOUND]: 'Historial no encontrado.',
  [AvailabilityErrorCode.AUDIT_LOG_ERROR]: 'Error en el registro de auditoría.',
  [AvailabilityErrorCode.HISTORY_ACCESS_DENIED]: 'Acceso al historial denegado.',
  [AvailabilityErrorCode.HISTORY_RETENTION_EXCEEDED]: 'Período de retención del historial excedido.',

  // General
  [AvailabilityErrorCode.SERVICE_UNAVAILABLE]: 'Servicio de disponibilidad no disponible.',
  [AvailabilityErrorCode.RATE_LIMIT_EXCEEDED]: 'Límite de peticiones excedido. Intenta más tarde.',
  [AvailabilityErrorCode.VALIDATION_ERROR]: 'Error de validación en los datos enviados.',
  [AvailabilityErrorCode.INTERNAL_ERROR]: 'Error interno del servicio de disponibilidad.',
};

export interface AvailabilityError {
  code: AvailabilityErrorCode;
  message: string;
  details?: any;
}

export class AvailabilityException extends Error {
  constructor(
    public readonly code: AvailabilityErrorCode,
    public readonly details?: any,
  ) {
    super(AvailabilityErrorMessages[code]);
    this.name = 'AvailabilityException';
  }
}
