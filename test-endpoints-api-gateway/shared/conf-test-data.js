/**
 * Configuración centralizada de datos de prueba para todos los hitos
 * Sincronizado automáticamente con las semillas de la base de datos
 */

// Test users for all microservices
const TEST_USERS = {
  // Administrators
  admin: { 
    email: 'admin@ufps.edu.co', 
    password: 'Admin123!',
    id: 'user_admin_001',
    role: 'ADMIN_GENERAL'
  },
  
  // Academic coordinators
  coordinator: { 
    email: 'coord.sistemas@ufps.edu.co', 
    password: 'Coord123!',
    id: 'user_coordinator_001',
    role: 'ADMIN_PROGRAMA'
  },
  
  // Faculty
  teacher: { 
    email: 'docente@ufps.edu.co', 
    password: 'Teacher123!',
    id: 'user_teacher_001',
    role: 'DOCENTE'
  },
  teacher2: { 
    email: 'docente2@ufps.edu.co', 
    password: 'Teacher123!',
    id: 'user_teacher_002',
    role: 'DOCENTE'
  },
  
  // Students
  student: { 
    email: 'estudiante@ufps.edu.co', 
    password: 'Student123!',
    id: 'user_student_001',
    role: 'ESTUDIANTE'
  },
  student2: { 
    email: 'estudiante2@ufps.edu.co', 
    password: 'Student123!',
    id: 'user_student_002',
    role: 'ESTUDIANTE'
  },
  
  // Security and support staff
  security: { 
    email: 'vigilante@ufps.edu.co', 
    password: 'Guard123!',
    id: 'user_security_001',
    role: 'VIGILANTE'
  },
  administrative: { 
    email: 'administrativo@ufps.edu.co', 
    password: 'Admin123!',
    id: 'user_admin_002',
    role: 'ADMINISTRATIVO_GENERAL'
  }
};

// Test resources - synchronized with database seeds
const TEST_RESOURCES = {
  auditorium: {
    id: 'resource_auditorium_001',
    name: 'Auditorio Central - Bloque A',
    type: 'AUDITORIUM',
    capacity: 150,
    location: 'Piso 1, Bloque A',
    category: 'SALON'
  },
  
  laboratory: {
    id: 'resource_lab_001',
    name: 'Laboratorio de Sistemas 1',
    type: 'LABORATORY',
    capacity: 30,
    location: 'Piso 2, Bloque B',
    category: 'LABORATORIO'
  },
  
  classroom: {
    id: 'resource_classroom_001',
    name: 'Aula 101 - Bloque A',
    type: 'CLASSROOM',
    capacity: 40,
    location: 'Piso 1, Bloque A',
    category: 'SALON'
  },
  
  projector: {
    id: 'resource_projector_001',
    name: 'Proyector Epson EB-X41',
    type: 'MULTIMEDIA_EQUIPMENT',
    capacity: 1,
    location: 'Móvil',
    category: 'EQUIPO_MULTIMEDIA'
  },
  
  meetingRoom: {
    id: 'resource_meeting_001',
    name: 'Sala de Reuniones - Decanatura',
    type: 'MEETING_ROOM',
    capacity: 12,
    location: 'Piso 3, Bloque A',
    category: 'SALON'
  }
};

// Test categories - synchronized with database seeds
const TEST_CATEGORIES = {
  resource_types: [
    { id: 'cat_salon', code: 'SALON', name: 'Salón', type: 'RESOURCE_TYPE' },
    { id: 'cat_laboratorio', code: 'LABORATORIO', name: 'Laboratorio', type: 'RESOURCE_TYPE' },
    { id: 'cat_auditorio', code: 'AUDITORIO', name: 'Auditorio', type: 'RESOURCE_TYPE' },
    { id: 'cat_equipo', code: 'EQUIPO_MULTIMEDIA', name: 'Equipo Multimedia', type: 'RESOURCE_TYPE' }
  ],
  
  maintenance_types: [
    { id: 'maint_preventivo', code: 'PREVENTIVO', name: 'Preventivo', type: 'MAINTENANCE_TYPE' },
    { id: 'maint_correctivo', code: 'CORRECTIVO', name: 'Correctivo', type: 'MAINTENANCE_TYPE' },
    { id: 'maint_emergencia', code: 'EMERGENCIA', name: 'Emergencia', type: 'MAINTENANCE_TYPE' }
  ],
  
  approval_statuses: [
    { id: 'status_pending', code: 'PENDING', name: 'Pendiente', type: 'APPROVAL_STATUS' },
    { id: 'status_approved', code: 'APPROVED', name: 'Aprobado', type: 'APPROVAL_STATUS' },
    { id: 'status_rejected', code: 'REJECTED', name: 'Rechazado', type: 'APPROVAL_STATUS' }
  ]
};

// Test academic programs
const TEST_PROGRAMS = {
  sistemas: {
    id: 'program_sistemas_001',
    code: 'SISINFO',
    name: 'Ingeniería de Sistemas',
    faculty: 'Facultad de Ingeniería'
  },
  
  industrial: {
    id: 'program_industrial_001',
    code: 'INDUST',
    name: 'Ingeniería Industrial',
    faculty: 'Facultad de Ingeniería'
  },
  
  civil: {
    id: 'program_civil_001',
    code: 'CIVIL',
    name: 'Ingeniería Civil',
    faculty: 'Facultad de Ingeniería'
  }
};

// Test reservation data templates
const TEST_RESERVATIONS = {
  basic: {
    resourceId: 'resource_auditorium_001',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    purpose: 'Presentación de proyecto de grado',
    attendees: 45,
    requesterId: 'user_teacher_001'
  },
  
  recurring: {
    resourceId: 'resource_classroom_001',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    purpose: 'Clase de Programación Web',
    attendees: 30,
    requesterId: 'user_teacher_001',
    recurrence: {
      type: 'WEEKLY',
      daysOfWeek: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      endRecurrence: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
};

// Test document templates
const TEST_DOCUMENT_TEMPLATES = {
  authorization_letter: {
    name: 'Autorización Uso Auditorio',
    type: 'AUTHORIZATION_LETTER',
    category: 'RESOURCE_BOOKING',
    variables: [
      'requesterName', 'requesterId', 'resourceName', 'reservationDate',
      'startTime', 'endTime', 'purpose', 'approvalCode'
    ]
  },
  
  incident_report: {
    name: 'Reporte de Incidente',
    type: 'INCIDENT_REPORT', 
    category: 'MAINTENANCE',
    variables: [
      'resourceName', 'incidentDate', 'reportedBy', 'description', 'severity'
    ]
  }
};

// Test notification templates
const TEST_NOTIFICATION_TEMPLATES = {
  reservation_confirmation: {
    name: 'Confirmación de Reserva',
    type: 'RESERVATION_CONFIRMATION',
    channels: ['EMAIL', 'SMS', 'PUSH_NOTIFICATION'],
    variables: ['userName', 'resourceName', 'reservationDate', 'reservationCode']
  },
  
  maintenance_alert: {
    name: 'Alerta de Mantenimiento',
    type: 'MAINTENANCE_ALERT',
    channels: ['EMAIL', 'PUSH_NOTIFICATION'],
    variables: ['resourceName', 'maintenanceDate', 'estimatedDuration', 'affectedReservations']
  }
};

// Performance benchmarks for testing
const PERFORMANCE_BENCHMARKS = {
  // Response time expectations (milliseconds)
  response_times: {
    fast_operations: 500,      // CRUD simple operations
    medium_operations: 2000,   // Complex searches, reports
    slow_operations: 5000,     // Document generation, bulk operations
    batch_operations: 10000    // Large data imports/exports
  },
  
  // Concurrency limits for stress testing
  concurrency: {
    light_load: 10,
    medium_load: 50,
    heavy_load: 100
  }
};

// Test scenarios for different flows
const TEST_SCENARIOS = {
  hito1_resources: {
    crud_operations: ['create', 'read', 'update', 'delete'],
    bulk_operations: ['import_csv', 'export_csv'],
    categories: Object.keys(TEST_CATEGORIES.resource_types),
    programs: Object.keys(TEST_PROGRAMS)
  },
  
  hito2_availability: {
    reservation_types: ['basic', 'recurring', 'bulk'],
    search_criteria: ['date_range', 'resource_type', 'capacity', 'location'],
    calendar_integrations: ['google', 'outlook', 'ical']
  },
  
  hito3_stockpile: {
    approval_flows: ['automatic', 'manual', 'escalated'],
    document_formats: ['PDF', 'HTML', 'DOCX'],
    notification_channels: ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP']
  }
};

// Export all test data
module.exports = {
  TEST_USERS,
  TEST_RESOURCES,
  TEST_CATEGORIES,
  TEST_PROGRAMS,
  TEST_RESERVATIONS,
  TEST_DOCUMENT_TEMPLATES,
  TEST_NOTIFICATION_TEMPLATES,
  PERFORMANCE_BENCHMARKS,
  TEST_SCENARIOS
};
