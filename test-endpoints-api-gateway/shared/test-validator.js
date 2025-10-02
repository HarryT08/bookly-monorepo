/**
 * BOOKLY API GATEWAY - VALIDADOR DE TESTING
 * Funciones de validación estandarizadas para todos los flujos de testing
 */

const { CONFIG } = require('./config');
const { TestLogger } = require('./logger');

class TestValidator {
  constructor() {
    this.logger = new TestLogger('Validator');
  }

  /**
   * Validar estructura de respuesta de Bookly
   */
  validateBooklyResponse(response, expectedPattern = 'SUCCESS') {
    const pattern = CONFIG.RESPONSE_PATTERNS[expectedPattern];
    if (!pattern) {
      throw new Error(`Unknown response pattern: ${expectedPattern}`);
    }

    const data = response.data;
    const errors = [];

    // Validar campos requeridos
    if (expectedPattern === 'SUCCESS') {
      if (data.success !== true) {
        errors.push(`Expected success: true, got: ${data.success}`);
      }
      if (!data.data) {
        errors.push('Missing data field in success response');
      }
      if (!data.message) {
        errors.push('Missing message field in response');
      }
    }

    if (expectedPattern === 'ERROR') {
      if (data.success !== false) {
        errors.push(`Expected success: false, got: ${data.success}`);
      }
      if (!Array.isArray(data.errors) || data.errors.length === 0) {
        errors.push('Missing or empty errors array in error response');
      }
    }

    if (expectedPattern === 'PAGINATED') {
      if (data.success !== true) {
        errors.push(`Expected success: true, got: ${data.success}`);
      }
      if (!Array.isArray(data.data)) {
        errors.push('Expected data to be an array in paginated response');
      }
      if (!data.meta || typeof data.meta !== 'object') {
        errors.push('Missing meta object in paginated response');
      } else {
        const requiredMeta = ['total', 'totalPages', 'page', 'limit'];
        requiredMeta.forEach(field => {
          if (typeof data.meta[field] !== 'number') {
            errors.push(`Missing or invalid meta.${field} in paginated response`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data
    };
  }

  /**
   * Validar código de respuesta HTTP
   */
  validateStatusCode(actual, expected) {
    if (Array.isArray(expected)) {
      return expected.includes(actual);
    }
    return actual === expected;
  }

  /**
   * Validar estructura de entidad
   */
  validateEntity(entity, requiredFields = [], optionalFields = []) {
    const errors = [];
    const allFields = [...requiredFields, ...optionalFields];

    // Verificar campos requeridos
    requiredFields.forEach(field => {
      if (!(field in entity)) {
        errors.push(`Missing required field: ${field}`);
      } else if (entity[field] === null || entity[field] === undefined) {
        errors.push(`Required field is null/undefined: ${field}`);
      }
    });

    // Verificar que no hay campos desconocidos
    Object.keys(entity).forEach(field => {
      if (!allFields.includes(field)) {
        errors.push(`Unknown field: ${field}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      entity
    };
  }

  /**
   * Validar array de entidades
   */
  validateEntityArray(entities, requiredFields = [], optionalFields = []) {
    if (!Array.isArray(entities)) {
      return {
        isValid: false,
        errors: ['Expected array of entities'],
        entities: null
      };
    }

    const allErrors = [];
    entities.forEach((entity, index) => {
      const validation = this.validateEntity(entity, requiredFields, optionalFields);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          allErrors.push(`Entity[${index}]: ${error}`);
        });
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      entities
    };
  }

  /**
   * Validar estructura de recurso (Hito 1)
   */
  validateResource(resource) {
    const requiredFields = ['id', 'name', 'code', 'categoryId', 'programId', 'capacity', 'isActive'];
    const optionalFields = ['description', 'location', 'attributes', 'createdAt', 'updatedAt'];
    
    const validation = this.validateEntity(resource, requiredFields, optionalFields);
    
    // Validaciones específicas de recursos
    if (validation.isValid) {
      if (resource.capacity < 1) {
        validation.errors.push('Capacity must be greater than 0');
        validation.isValid = false;
      }
      if (resource.code && !/^[A-Z0-9_-]+$/.test(resource.code)) {
        validation.errors.push('Code must contain only uppercase letters, numbers, underscores and hyphens');
        validation.isValid = false;
      }
    }
    
    return validation;
  }

  /**
   * Validar estructura de categoría (Hito 1)
   */
  validateCategory(category) {
    const requiredFields = ['id', 'name', 'code', 'type', 'service', 'isActive'];
    const optionalFields = ['description', 'color', 'isDefault', 'sortOrder', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(category, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de programa académico (Hito 1)
   */
  validateProgram(program) {
    const requiredFields = ['id', 'name', 'code', 'isActive'];
    const optionalFields = ['description', 'facultyId', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(program, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de mantenimiento (Hito 1)
   */
  validateMaintenance(maintenance) {
    const requiredFields = ['id', 'resourceId', 'type', 'description', 'status', 'scheduledDate'];
    const optionalFields = ['estimatedDuration', 'actualDuration', 'priority', 'reportedById', 'assignedToId', 'completedAt', 'notes', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(maintenance, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de disponibilidad (Hito 2)
   */
  validateAvailability(availability) {
    const requiredFields = ['id', 'resourceId', 'dayOfWeek', 'startTime', 'endTime', 'isActive'];
    const optionalFields = ['isRecurring', 'exceptions', 'restrictions', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(availability, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de reserva (Hito 2)
   */
  validateReservation(reservation) {
    const requiredFields = ['id', 'resourceId', 'userId', 'startTime', 'endTime', 'purpose', 'status'];
    const optionalFields = ['description', 'attendees', 'approvalStatus', 'rejectionReason', 'createdAt', 'updatedAt'];
    
    const validation = this.validateEntity(reservation, requiredFields, optionalFields);
    
    // Validaciones específicas de reservas
    if (validation.isValid) {
      const startTime = new Date(reservation.startTime);
      const endTime = new Date(reservation.endTime);
      
      if (endTime <= startTime) {
        validation.errors.push('End time must be after start time');
        validation.isValid = false;
      }
      
      if (startTime < new Date()) {
        validation.errors.push('Start time cannot be in the past');
        validation.isValid = false;
      }
    }
    
    return validation;
  }

  /**
   * Validar estructura de flujo de aprobación (Hito 3)
   */
  validateApprovalFlow(flow) {
    const requiredFields = ['id', 'name', 'requiredApprovals', 'steps', 'isActive'];
    const optionalFields = ['description', 'resourceTypes', 'createdAt', 'updatedAt'];
    
    const validation = this.validateEntity(flow, requiredFields, optionalFields);
    
    // Validaciones específicas de flujos de aprobación
    if (validation.isValid && Array.isArray(flow.steps)) {
      flow.steps.forEach((step, index) => {
        const stepRequiredFields = ['order', 'approverRole', 'isRequired'];
        const stepOptionalFields = ['timeoutHours', 'conditions'];
        
        const stepValidation = this.validateEntity(step, stepRequiredFields, stepOptionalFields);
        if (!stepValidation.isValid) {
          stepValidation.errors.forEach(error => {
            validation.errors.push(`Step[${index}]: ${error}`);
          });
          validation.isValid = false;
        }
      });
    }
    
    return validation;
  }

  /**
   * Validar estructura de plantilla de documento (Hito 3)
   */
  validateDocumentTemplate(template) {
    const requiredFields = ['id', 'name', 'type', 'content', 'isActive'];
    const optionalFields = ['description', 'variables', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(template, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de plantilla de notificación (Hito 3)
   */
  validateNotificationTemplate(template) {
    const requiredFields = ['id', 'name', 'type', 'subject', 'content', 'channels', 'isActive'];
    const optionalFields = ['description', 'variables', 'createdAt', 'updatedAt'];
    
    const validation = this.validateEntity(template, requiredFields, optionalFields);
    
    // Validaciones específicas de plantillas de notificación
    if (validation.isValid) {
      const validChannels = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'];
      if (Array.isArray(template.channels)) {
        template.channels.forEach(channel => {
          if (!validChannels.includes(channel)) {
            validation.errors.push(`Invalid notification channel: ${channel}`);
            validation.isValid = false;
          }
        });
      }
    }
    
    return validation;
  }

  /**
   * Validar estructura de usuario (Hito 4)
   */
  validateUser(user) {
    const requiredFields = ['id', 'email', 'name', 'roleId', 'isActive'];
    const optionalFields = ['programId', 'emailVerified', 'lastLoginAt', 'createdAt', 'updatedAt'];
    
    const validation = this.validateEntity(user, requiredFields, optionalFields);
    
    // Validaciones específicas de usuarios
    if (validation.isValid) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        validation.errors.push('Invalid email format');
        validation.isValid = false;
      }
    }
    
    return validation;
  }

  /**
   * Validar estructura de rol (Hito 4)
   */
  validateRole(role) {
    const requiredFields = ['id', 'name', 'code', 'categoryCode', 'isActive'];
    const optionalFields = ['description', 'permissions', 'isCustom', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(role, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de permiso (Hito 4)
   */
  validatePermission(permission) {
    const requiredFields = ['id', 'roleId', 'resource', 'action', 'scope'];
    const optionalFields = ['conditions', 'description', 'isActive', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(permission, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de reporte (Hito 5)
   */
  validateReport(report) {
    const requiredFields = ['id', 'name', 'type', 'parameters', 'format'];
    const optionalFields = ['description', 'schedule', 'isPublic', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(report, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de dashboard (Hito 5)
   */
  validateDashboard(dashboard) {
    const requiredFields = ['id', 'name', 'widgets'];
    const optionalFields = ['description', 'isPublic', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(dashboard, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de integración de calendario (Hito 9)
   */
  validateCalendarIntegration(integration) {
    const requiredFields = ['id', 'name', 'type', 'resourceId', 'externalCalendarId', 'isActive'];
    const optionalFields = ['description', 'credentials', 'syncSettings', 'lastSyncAt', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(integration, requiredFields, optionalFields);
  }

  /**
   * Validar estructura de evento de calendario (Hito 9)
   */
  validateCalendarEvent(event) {
    const requiredFields = ['id', 'externalEventId', 'calendarIntegrationId', 'title', 'startTime', 'endTime', 'status'];
    const optionalFields = ['description', 'location', 'attendees', 'createdAt', 'updatedAt'];
    
    return this.validateEntity(event, requiredFields, optionalFields);
  }

  /**
   * Validar métricas de rendimiento (Hito 10)
   */
  validatePerformanceMetrics(metrics) {
    const requiredFields = ['endpoint', 'method', 'responseTime', 'statusCode', 'timestamp'];
    const optionalFields = ['userAgent', 'ip', 'userId', 'errorMessage'];
    
    const validation = this.validateEntity(metrics, requiredFields, optionalFields);
    
    // Validaciones específicas de métricas
    if (validation.isValid) {
      if (metrics.responseTime < 0) {
        validation.errors.push('Response time must be non-negative');
        validation.isValid = false;
      }
      if (![200, 201, 204, 400, 401, 403, 404, 409, 422, 500].includes(metrics.statusCode)) {
        validation.errors.push(`Unexpected status code: ${metrics.statusCode}`);
        validation.isValid = false;
      }
    }
    
    return validation;
  }

  /**
   * Validar respuesta de importación CSV
   */
  validateCSVImportResponse(response) {
    const validation = this.validateBooklyResponse(response, 'SUCCESS');
    
    if (validation.isValid) {
      const data = response.data.data;
      const requiredFields = ['jobId', 'totalRecords', 'successCount', 'errorCount'];
      const optionalFields = ['errors', 'warnings', 'status'];
      
      const importValidation = this.validateEntity(data, requiredFields, optionalFields);
      if (!importValidation.isValid) {
        validation.errors.push(...importValidation.errors.map(error => `Import data: ${error}`));
        validation.isValid = false;
      }
    }
    
    return validation;
  }

  /**
   * Validar respuesta de exportación CSV
   */
  validateCSVExportResponse(response) {
    if (response.headers && response.headers['content-type'] && 
        response.headers['content-type'].includes('text/csv')) {
      return {
        isValid: true,
        errors: [],
        data: response.data
      };
    }
    
    return {
      isValid: false,
      errors: ['Expected CSV content-type in headers'],
      data: null
    };
  }

  /**
   * Validar respuesta de autenticación
   */
  validateAuthResponse(response) {
    const validation = this.validateBooklyResponse(response, 'SUCCESS');
    
    if (validation.isValid) {
      const data = response.data.data;
      const requiredFields = ['accessToken', 'user'];
      const optionalFields = ['refreshToken', 'expiresIn'];
      
      const authValidation = this.validateEntity(data, requiredFields, optionalFields);
      if (!authValidation.isValid) {
        validation.errors.push(...authValidation.errors.map(error => `Auth data: ${error}`));
        validation.isValid = false;
      } else {
        // Validar estructura del usuario
        const userValidation = this.validateUser(data.user);
        if (!userValidation.isValid) {
          validation.errors.push(...userValidation.errors.map(error => `User: ${error}`));
          validation.isValid = false;
        }
      }
    }
    
    return validation;
  }

  /**
   * Validar tiempos de respuesta según métricas esperadas
   */
  validateResponseTime(responseTime, endpoint, expectedMax = 1000) {
    const errors = [];
    
    // Límites específicos por endpoint
    const endpointLimits = {
      '/api/v1/resources/resources': 500,
      '/api/v1/auth/login': 1000,
      '/api/v1/resources/import-export/import': 5000,
      '/api/v1/resources/import-export/export': 3000
    };
    
    const maxTime = endpointLimits[endpoint] || expectedMax;
    
    if (responseTime > maxTime) {
      errors.push(`Response time ${responseTime}ms exceeds limit ${maxTime}ms for ${endpoint}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      responseTime,
      maxAllowed: maxTime
    };
  }

  /**
   * Validar flujo completo de testing
   */
  validateTestFlow(flowName, steps) {
    const errors = [];
    let totalTime = 0;
    
    steps.forEach((step, index) => {
      if (!step.name) {
        errors.push(`Step ${index + 1}: Missing step name`);
      }
      if (!step.response) {
        errors.push(`Step ${index + 1}: Missing response`);
      } else {
        if (!this.validateStatusCode(step.response.status, step.expectedStatus || [200, 201])) {
          errors.push(`Step ${index + 1}: Invalid status code ${step.response.status}`);
        }
        totalTime += step.responseTime || 0;
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      flowName,
      totalSteps: steps.length,
      totalTime,
      avgTime: steps.length > 0 ? totalTime / steps.length : 0
    };
  }
}

module.exports = {
  TestValidator
};
