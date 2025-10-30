/**
 * Resources Service Error Codes
 * Enumerable de errores específicos del microservicio de gestión de recursos
 */

export enum ResourcesErrorCode {
  // Resource Management Errors (RSRC-001 to RSRC-100)
  RESOURCE_NOT_FOUND = 'RSRC-001',
  RESOURCE_ALREADY_EXISTS = 'RSRC-002',
  RESOURCE_IN_USE = 'RSRC-003',
  RESOURCE_INACTIVE = 'RSRC-004',
  RESOURCE_UNDER_MAINTENANCE = 'RSRC-005',
  RESOURCE_CAPACITY_INVALID = 'RSRC-006',
  RESOURCE_CODE_DUPLICATE = 'RSRC-007',
  RESOURCE_DELETION_DENIED = 'RSRC-008',
  RESOURCE_UPDATE_RESTRICTED = 'RSRC-009',
  RESOURCE_ASSOCIATION_ERROR = 'RSRC-010',

  // Category Management Errors (RSRC-101 to RSRC-200)
  CATEGORY_NOT_FOUND = 'RSRC-101',
  CATEGORY_ALREADY_EXISTS = 'RSRC-102',
  CATEGORY_IN_USE = 'RSRC-103',
  CATEGORY_HIERARCHY_INVALID = 'RSRC-104',
  CATEGORY_ASSIGNMENT_FAILED = 'RSRC-105',
  CATEGORY_DELETION_DENIED = 'RSRC-106',
  PARENT_CATEGORY_NOT_FOUND = 'RSRC-107',
  CIRCULAR_CATEGORY_REFERENCE = 'RSRC-108',

  // Import/Export Errors (RSRC-201 to RSRC-300)
  IMPORT_FILE_INVALID = 'RSRC-201',
  IMPORT_FORMAT_UNSUPPORTED = 'RSRC-202',
  IMPORT_DATA_VALIDATION_FAILED = 'RSRC-203',
  IMPORT_DUPLICATE_ENTRIES = 'RSRC-204',
  IMPORT_SIZE_EXCEEDED = 'RSRC-205',
  IMPORT_PROCESSING_ERROR = 'RSRC-206',
  EXPORT_GENERATION_FAILED = 'RSRC-207',
  EXPORT_FILE_TOO_LARGE = 'RSRC-208',
  IMPORT_TEMPLATE_INVALID = 'RSRC-209',

  // Maintenance Errors (RSRC-301 to RSRC-400)
  MAINTENANCE_NOT_FOUND = 'RSRC-301',
  MAINTENANCE_SCHEDULE_CONFLICT = 'RSRC-302',
  MAINTENANCE_IN_PROGRESS = 'RSRC-303',
  MAINTENANCE_ALREADY_COMPLETED = 'RSRC-304',
  MAINTENANCE_TYPE_INVALID = 'RSRC-305',
  MAINTENANCE_ASSIGNMENT_FAILED = 'RSRC-306',
  MAINTENANCE_DATE_INVALID = 'RSRC-307',
  MAINTENANCE_CANCELLATION_DENIED = 'RSRC-308',
  MAINTENANCE_RECURRING_ERROR = 'RSRC-309',

  // Program Association Errors (RSRC-401 to RSRC-500)
  PROGRAM_NOT_FOUND = 'RSRC-401',
  PROGRAM_ASSOCIATION_EXISTS = 'RSRC-402',
  PROGRAM_ACCESS_DENIED = 'RSRC-403',
  PROGRAM_RESOURCE_LIMIT_EXCEEDED = 'RSRC-404',
  PROGRAM_RESTRICTION_VIOLATION = 'RSRC-405',
  PROGRAM_ASSIGNMENT_FAILED = 'RSRC-406',

  // Equipment & Attributes Errors (RSRC-501 to RSRC-600)
  EQUIPMENT_NOT_FOUND = 'RSRC-501',
  EQUIPMENT_INCOMPATIBLE = 'RSRC-502',
  EQUIPMENT_ASSIGNMENT_FAILED = 'RSRC-503',
  ATTRIBUTE_INVALID = 'RSRC-504',
  ATTRIBUTE_REQUIRED_MISSING = 'RSRC-505',
  ATTRIBUTE_VALUE_INVALID = 'RSRC-506',
  EQUIPMENT_CAPACITY_EXCEEDED = 'RSRC-507',

  // Location & Building Errors (RSRC-601 to RSRC-700)
  BUILDING_NOT_FOUND = 'RSRC-601',
  FLOOR_INVALID = 'RSRC-602',
  ROOM_NOT_FOUND = 'RSRC-603',
  LOCATION_ASSIGNMENT_FAILED = 'RSRC-604',
  BUILDING_CAPACITY_EXCEEDED = 'RSRC-605',
  LOCATION_COORDINATES_INVALID = 'RSRC-606',

  // Permission & Access Errors (RSRC-701 to RSRC-800)
  INSUFFICIENT_PERMISSIONS = 'RSRC-701',
  RESOURCE_ACCESS_DENIED = 'RSRC-702',
  MODIFICATION_NOT_ALLOWED = 'RSRC-703',
  ADMIN_PRIVILEGES_REQUIRED = 'RSRC-704',
  RESOURCE_LOCKED = 'RSRC-705',
  UNAUTHORIZED_OPERATION = 'RSRC-706',

  // Search & Query Errors (RSRC-801 to RSRC-900)
  SEARCH_CRITERIA_INVALID = 'RSRC-801',
  FILTER_PARAMETERS_INVALID = 'RSRC-802',
  SEARCH_TIMEOUT = 'RSRC-803',
  NO_RESULTS_FOUND = 'RSRC-804',
  QUERY_TOO_COMPLEX = 'RSRC-805',
  SEARCH_INDEX_ERROR = 'RSRC-806',

  // General Errors (RSRC-900 to RSRC-999)
  SERVICE_UNAVAILABLE = 'RSRC-900',
  RATE_LIMIT_EXCEEDED = 'RSRC-901',
  VALIDATION_ERROR = 'RSRC-902',
  INTERNAL_ERROR = 'RSRC-999',
}

export const ResourcesErrorMessages: Record<ResourcesErrorCode, string> = {
  // Resource Management
  [ResourcesErrorCode.RESOURCE_NOT_FOUND]: 'Recurso no encontrado.',
  [ResourcesErrorCode.RESOURCE_ALREADY_EXISTS]: 'Ya existe un recurso con ese nombre o código.',
  [ResourcesErrorCode.RESOURCE_IN_USE]: 'El recurso está siendo utilizado y no puede modificarse.',
  [ResourcesErrorCode.RESOURCE_INACTIVE]: 'El recurso está inactivo.',
  [ResourcesErrorCode.RESOURCE_UNDER_MAINTENANCE]: 'El recurso está en mantenimiento.',
  [ResourcesErrorCode.RESOURCE_CAPACITY_INVALID]: 'La capacidad del recurso es inválida.',
  [ResourcesErrorCode.RESOURCE_CODE_DUPLICATE]: 'El código del recurso ya existe.',
  [ResourcesErrorCode.RESOURCE_DELETION_DENIED]: 'No se puede eliminar el recurso.',
  [ResourcesErrorCode.RESOURCE_UPDATE_RESTRICTED]: 'La actualización del recurso está restringida.',
  [ResourcesErrorCode.RESOURCE_ASSOCIATION_ERROR]: 'Error al asociar el recurso.',

  // Category Management
  [ResourcesErrorCode.CATEGORY_NOT_FOUND]: 'Categoría no encontrada.',
  [ResourcesErrorCode.CATEGORY_ALREADY_EXISTS]: 'Ya existe una categoría con ese nombre.',
  [ResourcesErrorCode.CATEGORY_IN_USE]: 'La categoría está siendo utilizada.',
  [ResourcesErrorCode.CATEGORY_HIERARCHY_INVALID]: 'La jerarquía de categorías es inválida.',
  [ResourcesErrorCode.CATEGORY_ASSIGNMENT_FAILED]: 'Falló la asignación de categoría.',
  [ResourcesErrorCode.CATEGORY_DELETION_DENIED]: 'No se puede eliminar la categoría.',
  [ResourcesErrorCode.PARENT_CATEGORY_NOT_FOUND]: 'Categoría padre no encontrada.',
  [ResourcesErrorCode.CIRCULAR_CATEGORY_REFERENCE]: 'Referencia circular en categorías detectada.',

  // Import/Export
  [ResourcesErrorCode.IMPORT_FILE_INVALID]: 'Archivo de importación inválido.',
  [ResourcesErrorCode.IMPORT_FORMAT_UNSUPPORTED]: 'Formato de archivo no soportado.',
  [ResourcesErrorCode.IMPORT_DATA_VALIDATION_FAILED]: 'Falló la validación de datos de importación.',
  [ResourcesErrorCode.IMPORT_DUPLICATE_ENTRIES]: 'Entradas duplicadas en importación.',
  [ResourcesErrorCode.IMPORT_SIZE_EXCEEDED]: 'Tamaño de archivo de importación excedido.',
  [ResourcesErrorCode.IMPORT_PROCESSING_ERROR]: 'Error procesando la importación.',
  [ResourcesErrorCode.EXPORT_GENERATION_FAILED]: 'Falló la generación del archivo de exportación.',
  [ResourcesErrorCode.EXPORT_FILE_TOO_LARGE]: 'Archivo de exportación demasiado grande.',
  [ResourcesErrorCode.IMPORT_TEMPLATE_INVALID]: 'Plantilla de importación inválida.',

  // Maintenance
  [ResourcesErrorCode.MAINTENANCE_NOT_FOUND]: 'Mantenimiento no encontrado.',
  [ResourcesErrorCode.MAINTENANCE_SCHEDULE_CONFLICT]: 'Conflicto en programación de mantenimiento.',
  [ResourcesErrorCode.MAINTENANCE_IN_PROGRESS]: 'Mantenimiento en progreso.',
  [ResourcesErrorCode.MAINTENANCE_ALREADY_COMPLETED]: 'Mantenimiento ya completado.',
  [ResourcesErrorCode.MAINTENANCE_TYPE_INVALID]: 'Tipo de mantenimiento inválido.',
  [ResourcesErrorCode.MAINTENANCE_ASSIGNMENT_FAILED]: 'Falló la asignación de mantenimiento.',
  [ResourcesErrorCode.MAINTENANCE_DATE_INVALID]: 'Fecha de mantenimiento inválida.',
  [ResourcesErrorCode.MAINTENANCE_CANCELLATION_DENIED]: 'Cancelación de mantenimiento denegada.',
  [ResourcesErrorCode.MAINTENANCE_RECURRING_ERROR]: 'Error en mantenimiento recurrente.',

  // Program Association
  [ResourcesErrorCode.PROGRAM_NOT_FOUND]: 'Programa académico no encontrado.',
  [ResourcesErrorCode.PROGRAM_ASSOCIATION_EXISTS]: 'La asociación con el programa ya existe.',
  [ResourcesErrorCode.PROGRAM_ACCESS_DENIED]: 'Acceso al programa denegado.',
  [ResourcesErrorCode.PROGRAM_RESOURCE_LIMIT_EXCEEDED]: 'Límite de recursos del programa excedido.',
  [ResourcesErrorCode.PROGRAM_RESTRICTION_VIOLATION]: 'Violación de restricción del programa.',
  [ResourcesErrorCode.PROGRAM_ASSIGNMENT_FAILED]: 'Falló la asignación al programa.',

  // Equipment & Attributes
  [ResourcesErrorCode.EQUIPMENT_NOT_FOUND]: 'Equipamiento no encontrado.',
  [ResourcesErrorCode.EQUIPMENT_INCOMPATIBLE]: 'Equipamiento incompatible.',
  [ResourcesErrorCode.EQUIPMENT_ASSIGNMENT_FAILED]: 'Falló la asignación de equipamiento.',
  [ResourcesErrorCode.ATTRIBUTE_INVALID]: 'Atributo inválido.',
  [ResourcesErrorCode.ATTRIBUTE_REQUIRED_MISSING]: 'Falta atributo requerido.',
  [ResourcesErrorCode.ATTRIBUTE_VALUE_INVALID]: 'Valor de atributo inválido.',
  [ResourcesErrorCode.EQUIPMENT_CAPACITY_EXCEEDED]: 'Capacidad de equipamiento excedida.',

  // Location & Building
  [ResourcesErrorCode.BUILDING_NOT_FOUND]: 'Edificio no encontrado.',
  [ResourcesErrorCode.FLOOR_INVALID]: 'Piso inválido.',
  [ResourcesErrorCode.ROOM_NOT_FOUND]: 'Salón no encontrado.',
  [ResourcesErrorCode.LOCATION_ASSIGNMENT_FAILED]: 'Falló la asignación de ubicación.',
  [ResourcesErrorCode.BUILDING_CAPACITY_EXCEEDED]: 'Capacidad del edificio excedida.',
  [ResourcesErrorCode.LOCATION_COORDINATES_INVALID]: 'Coordenadas de ubicación inválidas.',

  // Permissions & Access
  [ResourcesErrorCode.INSUFFICIENT_PERMISSIONS]: 'Permisos insuficientes.',
  [ResourcesErrorCode.RESOURCE_ACCESS_DENIED]: 'Acceso al recurso denegado.',
  [ResourcesErrorCode.MODIFICATION_NOT_ALLOWED]: 'Modificación no permitida.',
  [ResourcesErrorCode.ADMIN_PRIVILEGES_REQUIRED]: 'Se requieren privilegios de administrador.',
  [ResourcesErrorCode.RESOURCE_LOCKED]: 'El recurso está bloqueado.',
  [ResourcesErrorCode.UNAUTHORIZED_OPERATION]: 'Operación no autorizada.',

  // Search & Query
  [ResourcesErrorCode.SEARCH_CRITERIA_INVALID]: 'Criterios de búsqueda inválidos.',
  [ResourcesErrorCode.FILTER_PARAMETERS_INVALID]: 'Parámetros de filtro inválidos.',
  [ResourcesErrorCode.SEARCH_TIMEOUT]: 'Tiempo de búsqueda agotado.',
  [ResourcesErrorCode.NO_RESULTS_FOUND]: 'No se encontraron resultados.',
  [ResourcesErrorCode.QUERY_TOO_COMPLEX]: 'Consulta demasiado compleja.',
  [ResourcesErrorCode.SEARCH_INDEX_ERROR]: 'Error en el índice de búsqueda.',

  // General
  [ResourcesErrorCode.SERVICE_UNAVAILABLE]: 'Servicio de recursos no disponible.',
  [ResourcesErrorCode.RATE_LIMIT_EXCEEDED]: 'Límite de peticiones excedido. Intenta más tarde.',
  [ResourcesErrorCode.VALIDATION_ERROR]: 'Error de validación en los datos enviados.',
  [ResourcesErrorCode.INTERNAL_ERROR]: 'Error interno del servicio de recursos.',
};

export interface ResourcesError {
  code: ResourcesErrorCode;
  message: string;
  details?: any;
}

export class ResourcesException extends Error {
  constructor(
    public readonly code: ResourcesErrorCode,
    public readonly details?: any,
  ) {
    super(ResourcesErrorMessages[code]);
    this.name = 'ResourcesException';
  }
}
