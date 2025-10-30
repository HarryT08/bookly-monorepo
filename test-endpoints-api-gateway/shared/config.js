/**
 * BOOKLY API GATEWAY - CONFIGURACIÓN DE TESTING
 * Configuración centralizada para todos los tests de endpoints
 */

// URLs de servicios
const SERVICES = {
  API_GATEWAY: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  RESOURCES: process.env.RESOURCES_SERVICE_URL || 'http://localhost:3003',
  AVAILABILITY: process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3002',
  STOCKPILE: process.env.STOCKPILE_SERVICE_URL || 'http://localhost:3004',
  REPORTS: process.env.REPORTS_SERVICE_URL || 'http://localhost:3005'
};

// Usuarios de prueba (desde semillas)
const TEST_USERS = {
  ADMIN_GENERAL: {
    email: 'admin@ufps.edu.co',
    password: '123456',
    role: 'ADMIN_GENERAL',
    description: 'Administrador General - Acceso completo'
  },
  ADMIN_PROGRAMA: {
    email: 'admin.sistemas@ufps.edu.co',
    password: '123456',
    role: 'ADMIN_PROGRAMA',
    program: 'ING-SIS',
    description: 'Administrador de Programa Sistemas'
  },
  DOCENTE: {
    email: 'docente@ufps.edu.co',
    password: '123456',
    role: 'DOCENTE',
    description: 'Docente - Puede crear reservas'
  },
  ESTUDIANTE: {
    email: 'estudiante@ufps.edu.co',
    password: '123456',
    role: 'ESTUDIANTE',
    description: 'Estudiante - Acceso limitado'
  },
  VIGILANTE: {
    email: 'vigilante@ufps.edu.co',
    password: '123456',
    role: 'VIGILANTE',
    description: 'Personal de vigilancia'
  }
};

// Datos de prueba para recursos (basados en semillas)
const TEST_DATA = {
  PROGRAMS: [
    { id: '1', code: 'ING-SIS', name: 'Ingeniería de Sistemas' },
    { id: '2', code: 'MED-GEN', name: 'Medicina General' },
    { id: '3', code: 'DER-GEN', name: 'Derecho General' },
    { id: '4', code: 'ADM-EMP', name: 'Administración de Empresas' }
  ],
  CATEGORIES: [
    { id: '1', code: 'SALON', name: 'Salón', isDefault: true },
    { id: '2', code: 'LABORATORIO', name: 'Laboratorio', isDefault: true },
    { id: '3', code: 'AUDITORIO', name: 'Auditorio', isDefault: true },
    { id: '4', code: 'EQUIPO_MULTIMEDIA', name: 'Equipo Multimedia', isDefault: true }
  ],
  RESOURCES: [
    { id: '1', name: 'Salón A-101', code: 'SA-101', capacity: 40 },
    { id: '2', name: 'Lab Sistemas A-201', code: 'LS-201', capacity: 25 },
    { id: '3', name: 'Auditorio Principal', code: 'AUD-001', capacity: 200 },
    { id: '4', name: 'Proyector Portátil P-001', code: 'PROJ-001', capacity: 1 }
  ]
};

// Configuración de timeouts y reintentos
const CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  RATE_LIMIT_DELAY: 100, // 100ms entre requests
  
  // Headers estándar
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Bookly-API-Test-Suite/1.0'
  },

  // Códigos de respuesta esperados
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },

  // Patrones de respuesta de Bookly
  RESPONSE_PATTERNS: {
    SUCCESS: {
      success: true,
      data: expect.any(Object),
      message: expect.any(String)
    },
    ERROR: {
      success: false,
      errors: expect.any(Array),
      message: expect.any(String)
    },
    PAGINATED: {
      success: true,
      data: expect.any(Array),
      meta: {
        total: expect.any(Number),
        totalPages: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number)
      }
    }
  }
};

// Importar configuración de microservicios desde archivo centralizado
const { MICROSERVICES_CONFIG } = require('./conf-urls-microservices');

module.exports = {
  SERVICES,
  TEST_USERS,
  TEST_DATA,
  CONFIG,
  MICROSERVICES_CONFIG
};
