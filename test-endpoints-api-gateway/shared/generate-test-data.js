/**
 * BOOKLY API GATEWAY - GENERADOR DE DATOS DE PRUEBA
 * Genera datos de prueba únicos para todos los flujos de testing de los 10 hitos
 */

const { TEST_DATA } = require('./conf-test-data');
const { TestLogger } = require('./logger');

class GenerateTestData {
  constructor() {
    this.logger = new TestLogger('GenerateTestData');
  }

  /**
   * Generar datos de prueba únicos para recursos (Hito 1)
   */
  generateResource(overrides = {}) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    return {
      name: `Test Resource ${timestamp}`,
      code: `TEST-${random}`,
      description: `Recurso de prueba generado automáticamente`,
      capacity: 30,
      isActive: true,
      categoryId: TEST_DATA.CATEGORIES.SALON.id,
      programId: TEST_DATA.PROGRAMS.SISTEMAS.id,
      location: `Building A - Floor ${Math.floor(Math.random() * 5) + 1}`,
      attributes: {
        equipment: ['projector', 'whiteboard'],
        accessibility: ['wheelchair-accessible'],
        specialConditions: []
      },
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para categorías (Hito 1)
   */
  generateCategory(overrides = {}) {
    const timestamp = Date.now();

    return {
      name: `Test Category ${timestamp}`,
      code: `TEST-CAT-${Math.floor(Math.random() * 1000)}`,
      description: 'Categoría de prueba generada automáticamente',
      color: '#3B82F6',
      isDefault: false,
      isActive: true,
      type: 'RESOURCE_TYPE',
      service: 'resources-service',
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para programas académicos (Hito 1)
   */
  generateProgram(overrides = {}) {
    const timestamp = Date.now();

    return {
      name: `Test Program ${timestamp}`,
      code: `TEST-PROG-${Math.floor(Math.random() * 1000)}`,
      description: 'Programa académico de prueba',
      facultyId: TEST_DATA.FACULTIES.ENGINEERING.id,
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para mantenimiento (Hito 1)
   */
  generateMaintenance(overrides = {}) {
    const timestamp = Date.now();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return {
      resourceId: '1',
      type: 'PREVENTIVO',
      description: `Mantenimiento de prueba ${timestamp}`,
      scheduledDate: tomorrow.toISOString(),
      estimatedDuration: 60,
      priority: 'MEDIUM',
      status: 'PENDING',
      reportedById: TEST_DATA.USERS.ADMIN_PROGRAMA.id,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para disponibilidad (Hito 2)
   */
  generateAvailability(overrides = {}) {
    const today = new Date();
    const startTime = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Mañana
    startTime.setHours(8, 0, 0, 0); // 8:00 AM
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 horas

    return {
      resourceId: '1',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      dayOfWeek: startTime.getDay(),
      isRecurring: false,
      exceptions: [],
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para reservas (Hito 2)
   */
  generateReservation(overrides = {}) {
    const timestamp = Date.now();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM
    const endTime = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000); // +2 horas

    return {
      resourceId: '1',
      userId: TEST_DATA.USERS.DOCENTE.id,
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      purpose: `Reserva de prueba ${timestamp}`,
      description: 'Reserva generada automáticamente para testing',
      status: 'PENDING',
      attendees: 25,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para horarios (Hito 2)
   */
  generateSchedule(overrides = {}) {
    return {
      resourceId: '1',
      dayOfWeek: 1, // Lunes
      startTime: '08:00',
      endTime: '18:00',
      isActive: true,
      exceptions: [],
      restrictions: {
        userTypes: ['DOCENTE', 'ADMINISTRATIVO'],
        programs: [],
        minimumAdvance: 24 // horas
      },
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para flujos de aprobación (Hito 3)
   */
  generateApprovalFlow(overrides = {}) {
    return {
      name: `Test Approval Flow ${Date.now()}`,
      description: 'Flujo de aprobación de prueba',
      resourceTypes: ['AUDITORIO'],
      requiredApprovals: 2,
      steps: [
        {
          order: 1,
          approverRole: 'ADMIN_PROGRAMA',
          isRequired: true,
          timeoutHours: 24
        },
        {
          order: 2,
          approverRole: 'ADMIN_GENERAL',
          isRequired: true,
          timeoutHours: 48
        }
      ],
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para plantillas de documentos (Hito 3)
   */
  generateDocumentTemplate(overrides = {}) {
    const timestamp = Date.now();

    return {
      name: `Test Template ${timestamp}`,
      type: 'APPROVAL_LETTER',
      description: 'Plantilla de prueba para documentos',
      content: `
        <h1>CARTA DE APROBACIÓN</h1>
        <p>Se aprueba la reserva del recurso {{resourceName}} para {{purpose}}</p>
        <p>Fecha: {{date}}</p>
        <p>Solicitante: {{requesterName}}</p>
      `,
      variables: [
        { name: 'resourceName', description: 'Nombre del recurso' },
        { name: 'purpose', description: 'Propósito de la reserva' },
        { name: 'date', description: 'Fecha de la reserva' },
        { name: 'requesterName', description: 'Nombre del solicitante' }
      ],
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para plantillas de notificaciones (Hito 3)
   */
  generateNotificationTemplate(overrides = {}) {
    const timestamp = Date.now();

    return {
      name: `Test Notification ${timestamp}`,
      type: 'RESERVATION_APPROVED',
      description: 'Plantilla de notificación de prueba',
      subject: 'Su reserva ha sido {{status}}',
      content: `
        Estimado {{userName}},
        
        Su reserva del recurso {{resourceName}} ha sido {{status}}.
        
        Detalles:
        - Fecha: {{date}}
        - Horario: {{startTime}} - {{endTime}}
        - Propósito: {{purpose}}
        
        Saludos cordiales.
      `,
      channels: ['EMAIL', 'WHATSAPP'],
      variables: [
        { name: 'userName', description: 'Nombre del usuario' },
        { name: 'resourceName', description: 'Nombre del recurso' },
        { name: 'status', description: 'Estado de la reserva' },
        { name: 'date', description: 'Fecha de la reserva' },
        { name: 'startTime', description: 'Hora de inicio' },
        { name: 'endTime', description: 'Hora de fin' },
        { name: 'purpose', description: 'Propósito de la reserva' }
      ],
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para usuarios (Hito 4)
   */
  generateUser(overrides = {}) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    return {
      email: `test.user.${timestamp}@ufps.edu.co`,
      name: `Test User ${random}`,
      password: '123456',
      roleId: TEST_DATA.USERS.ESTUDIANTE.roleId,
      programId: TEST_DATA.PROGRAMS.SISTEMAS.id,
      isActive: true,
      emailVerified: false,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para roles (Hito 4)
   */
  generateRole(overrides = {}) {
    const timestamp = Date.now();

    return {
      name: `Test Role ${timestamp}`,
      code: `TEST-ROLE-${Math.floor(Math.random() * 1000)}`,
      description: 'Rol de prueba generado automáticamente',
      categoryCode: 'ACADEMIC',
      permissions: [
        {
          resource: 'resources',
          actions: ['read'],
          scope: 'own',
          conditions: {}
        }
      ],
      isActive: true,
      isCustom: true,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para permisos (Hito 4)
   */
  generatePermission(overrides = {}) {
    const timestamp = Date.now();

    return {
      roleId: '1',
      resource: 'reservations',
      action: 'create',
      scope: 'own',
      conditions: {
        resourceTypes: ['SALON'],
        maxAdvanceDays: 30
      },
      description: `Permiso de prueba ${timestamp}`,
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para reportes (Hito 5)
   */
  generateReport(overrides = {}) {
    const timestamp = Date.now();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás
    const endDate = new Date();

    return {
      name: `Test Report ${timestamp}`,
      type: 'RESOURCE_USAGE',
      description: 'Reporte de prueba generado automáticamente',
      parameters: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        resourceIds: ['1', '2'],
        programIds: [TEST_DATA.PROGRAMS.SISTEMAS.id]
      },
      format: 'PDF',
      schedule: null, // Reporte manual
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para dashboard (Hito 5)
   */
  generateDashboard(overrides = {}) {
    const timestamp = Date.now();

    return {
      name: `Test Dashboard ${timestamp}`,
      description: 'Dashboard de prueba',
      widgets: [
        {
          type: 'RESOURCE_USAGE_CHART',
          title: 'Uso de Recursos',
          config: {
            timeRange: '30d',
            resourceTypes: ['SALON', 'LABORATORIO']
          }
        },
        {
          type: 'RESERVATION_STATUS_PIE',
          title: 'Estado de Reservas',
          config: {
            statuses: ['PENDING', 'APPROVED', 'REJECTED']
          }
        }
      ],
      isPublic: false,
      ...overrides
    };
  }

  /**
   * Generar datos CSV para importación masiva
   */
  generateCSVData(type, count = 5) {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'resources':
          data.push(this.generateResource({
            name: `CSV Resource ${i + 1}`,
            code: `CSV-${Date.now()}-${i}`
          }));
          break;
        case 'users':
          data.push(this.generateUser({
            email: `csv.user${i + 1}.${Date.now()}@ufps.edu.co`,
            name: `CSV User ${i + 1}`
          }));
          break;
        case 'reservations':
          const startTime = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000);
          startTime.setHours(8 + i, 0, 0, 0);
          const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
          
          data.push(this.generateReservation({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            purpose: `CSV Reservation ${i + 1}`
          }));
          break;
      }
    }
    
    return data;
  }

  /**
   * Generar datos de prueba para integración con calendarios externos (Hito 9)
   */
  generateCalendarIntegration(overrides = {}) {
    return {
      name: `Test Calendar Integration ${Date.now()}`,
      type: 'GOOGLE_CALENDAR',
      description: 'Integración de calendario de prueba',
      resourceId: '1',
      externalCalendarId: 'test-calendar@group.calendar.google.com',
      credentials: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token'
      },
      syncSettings: {
        autoSync: true,
        syncInterval: 60, // minutos
        syncDirection: 'BIDIRECTIONAL'
      },
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para eventos de calendario (Hito 9)
   */
  generateCalendarEvent(overrides = {}) {
    const timestamp = Date.now();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM
    const endTime = new Date(tomorrow.getTime() + 60 * 60 * 1000); // +1 hora

    return {
      externalEventId: `test-event-${timestamp}`,
      calendarIntegrationId: '1',
      title: `Test Calendar Event ${timestamp}`,
      description: 'Evento de calendario de prueba',
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      location: 'Salón 101',
      attendees: ['test@ufps.edu.co'],
      status: 'CONFIRMED',
      ...overrides
    };
  }

  /**
   * Generar datos de prueba para métricas de rendimiento (Hito 10)
   */
  generatePerformanceMetrics(overrides = {}) {
    return {
      endpoint: '/api/v1/resources/resources',
      method: 'GET',
      responseTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      statusCode: 200,
      timestamp: new Date().toISOString(),
      userAgent: 'Bookly-Test-Agent/1.0',
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      userId: TEST_DATA.USERS.ESTUDIANTE.id,
      ...overrides
    };
  }

  /**
   * Obtener datos de prueba por tipo y hito
   */
  getTestData(hito, type, overrides = {}) {
    const generators = {
      1: { // Resources Core
        resource: () => this.generateResource(overrides),
        category: () => this.generateCategory(overrides),
        program: () => this.generateProgram(overrides),
        maintenance: () => this.generateMaintenance(overrides)
      },
      2: { // Availability & Reservations
        availability: () => this.generateAvailability(overrides),
        reservation: () => this.generateReservation(overrides),
        schedule: () => this.generateSchedule(overrides)
      },
      3: { // Stockpile & Approvals
        approvalFlow: () => this.generateApprovalFlow(overrides),
        documentTemplate: () => this.generateDocumentTemplate(overrides),
        notificationTemplate: () => this.generateNotificationTemplate(overrides)
      },
      4: { // Auth Core + SSO
        user: () => this.generateUser(overrides),
        role: () => this.generateRole(overrides),
        permission: () => this.generatePermission(overrides)
      },
      5: { // Reports & Analytics
        report: () => this.generateReport(overrides),
        dashboard: () => this.generateDashboard(overrides)
      },
      9: { // Integrations
        calendarIntegration: () => this.generateCalendarIntegration(overrides),
        calendarEvent: () => this.generateCalendarEvent(overrides)
      },
      10: { // Performance
        performanceMetrics: () => this.generatePerformanceMetrics(overrides)
      }
    };

    if (!generators[hito] || !generators[hito][type]) {
      throw new Error(`No generator found for hito ${hito}, type ${type}`);
    }

    const data = generators[hito][type]();
    this.logger.debug(`Generated test data for hito ${hito}, type ${type}:`, data);
    return data;
  }

  /**
   * Utilidad para esperar con timeout
   */
  static async waitFor(conditionFn, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
  }

  /**
   * Limpiar datos de prueba
   */
  static async cleanup(httpClient, user, resources = []) {
    const logger = new TestLogger('Cleanup');
    
    for (const resource of resources) {
      try {
        await httpClient.authDelete(`/api/v1/resources/${resource.id}`, user);
        logger.debug(`Cleaned up resource: ${resource.id}`);
      } catch (error) {
        logger.warn(`Failed to cleanup resource ${resource.id}:`, error.message);
      }
    }
  }
}

module.exports = {
  GenerateTestData
};
