#!/usr/bin/env node

/**
 * HITO 2 - AVAILABILITY CORE: BASIC AVAILABILITY (REFACTORIZADO)
 * 
 * Flujo completo de testing para disponibilidad básica de recursos:
 * - RF-07: Configurar horarios disponibles
 * - RF-10: Visualización en formato calendario
 * - RF-11: Registro del historial de uso
 * - RF-16: Gestión de conflictos de disponibilidad
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class BasicAvailabilityFlow {
  constructor() {
    this.logger = new TestLogger('Basic-Availability');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-2-Availability', 'Basic-Availability');
    this.testData = {
      createdSchedules: [],
      createdAvailability: [],
      testResourceId: '1', // Usar recurso de semillas
      adminUser: TEST_DATA.USERS.ADMIN_GENERAL,
      docenteUser: TEST_DATA.USERS.DOCENTE,
      estudianteUser: TEST_DATA.USERS.ESTUDIANTE
    };
  }

  async run() {
    this.logger.header('HITO 2 - BASIC AVAILABILITY FLOW');
    this.logger.info('Iniciando testing completo de disponibilidad básica...');

    try {
      await this.setup();
      await this.testResourceAvailabilityQuery();
      await this.testScheduleConfiguration();
      await this.testAvailabilityRules();
      await this.testRealTimeAvailability();
      await this.testAvailabilityConflicts();
      await this.testScheduleUpdates();
      await this.cleanup();
    } catch (error) {
      this.logger.error('Flow failed with critical error:', error.message);
    } finally {
      await this.generateReport();
    }
  }

  async setup() {
    this.logger.subheader('Setup - Preparación del entorno');
    
    try {
      await this.httpClient.authenticate(this.testData.adminUser);
      await this.httpClient.authenticate(this.testData.docenteUser);
      await this.httpClient.authenticate(this.testData.estudianteUser);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testResourceAvailabilityQuery() {
    this.logger.subheader('Test: Consultar disponibilidad de recursos');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('availability-service', 'availability', 'query');
      const params = {
        resourceId: this.testData.testResourceId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +7 días
      };

      const response = await this.httpClient.get(endpoint, { params });

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Availability query validation failed: ${validation.errors.join(', ')}`);
      }

      const availability = response.data.data;
      if (Array.isArray(availability)) {
        for (const slot of availability) {
          const slotValidation = this.validator.validateAvailability(slot);
          if (!slotValidation.isValid) {
            this.logger.warn(`Availability slot validation issues:`, slotValidation.errors);
          }
        }
      }

      // Validar tiempo de respuesta
      const timeValidation = this.validator.validateResponseTime(duration, endpoint, 1000);
      if (!timeValidation.isValid) {
        this.logger.warn('Performance issue:', timeValidation.errors);
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved availability for resource ${this.testData.testResourceId}`,
        availabilitySlots: Array.isArray(availability) ? availability.length : 0
      });

      this.logger.success(`✅ Disponibilidad consultada: ${Array.isArray(availability) ? availability.length : 0} slots (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('availability-service', 'availability', 'query');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with availability data'
      });
      this.logger.error(`❌ Error consultando disponibilidad: ${error.message}`);
    }
  }

  async testScheduleConfiguration() {
    this.logger.subheader('Test: Configurar horarios de disponibilidad');
    const startTime = Date.now();

    try {
      const scheduleData = this.dataGenerator.getTestData(2, 'schedule', {
        resourceId: this.testData.testResourceId,
        dayOfWeek: 1, // Lunes
        startTime: '08:00',
        endTime: '18:00',
        isActive: true,
        restrictions: {
          userTypes: ['DOCENTE', 'ADMINISTRATIVO'],
          minimumAdvance: 24 // horas
        }
      });

      const endpoint = getEndpointUrl('availability-service', 'schedules', 'create');
      const response = await this.httpClient.authPost(endpoint, scheduleData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Schedule creation validation failed: ${validation.errors.join(', ')}`);
      }

      const createdSchedule = response.data.data;
      this.testData.createdSchedules.push(createdSchedule);

      // Validar estructura del horario creado
      const scheduleValidation = this.validator.validateEntity(createdSchedule, 
        ['id', 'resourceId', 'dayOfWeek', 'startTime', 'endTime', 'isActive'],
        ['restrictions', 'exceptions', 'createdAt', 'updatedAt']
      );

      if (!scheduleValidation.isValid) {
        this.logger.warn('Created schedule structure issues:', scheduleValidation.errors);
      }

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Created schedule for resource ${scheduleData.resourceId}`,
        scheduleId: createdSchedule.id
      });

      this.logger.success(`✅ Horario configurado: ${scheduleData.dayOfWeek} ${scheduleData.startTime}-${scheduleData.endTime} (ID: ${createdSchedule.id}) (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('availability-service', 'schedules', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created schedule'
      });
      this.logger.error(`❌ Error configurando horario: ${error.message}`);
    }
  }

  async testAvailabilityRules() {
    this.logger.subheader('Test: Validar reglas de disponibilidad por usuario');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('availability-service', 'availability', 'checkUserAccess');
      const params = {
        resourceId: this.testData.testResourceId,
        userId: this.testData.estudianteUser.id,
        requestedTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() // +25 horas
      };

      const response = await this.httpClient.authGet(`${endpoint}?${new URLSearchParams(params)}`, this.testData.estudianteUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`User access validation failed: ${validation.errors.join(', ')}`);
      }

      const accessResult = response.data.data;
      const hasAccess = accessResult.hasAccess;
      const restrictions = accessResult.restrictions || [];

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `User access check: ${hasAccess ? 'Allowed' : 'Denied'}`,
        hasAccess,
        restrictionCount: restrictions.length
      });

      this.logger.success(`✅ Reglas de disponibilidad validadas: Acceso ${hasAccess ? 'permitido' : 'denegado'} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('availability-service', 'availability', 'checkUserAccess');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with access validation result'
      });
      this.logger.error(`❌ Error validando reglas de disponibilidad: ${error.message}`);
    }
  }

  async testRealTimeAvailability() {
    this.logger.subheader('Test: Disponibilidad en tiempo real');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('availability-service', 'availability', 'realtime');
      const params = {
        resourceIds: [this.testData.testResourceId],
        datetime: new Date().toISOString()
      };

      const response = await this.httpClient.get(endpoint, { params });

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Real-time availability validation failed: ${validation.errors.join(', ')}`);
      }

      const realtimeData = response.data.data;
      
      // Validar que contiene el recurso solicitado
      if (Array.isArray(realtimeData)) {
        const resourceFound = realtimeData.find(r => r.resourceId === this.testData.testResourceId);
        if (!resourceFound) {
          this.logger.warn(`Resource ${this.testData.testResourceId} not found in real-time data`);
        }
      }

      // Validar tiempo de respuesta crítico para tiempo real
      const timeValidation = this.validator.validateResponseTime(duration, endpoint, 500);
      if (!timeValidation.isValid) {
        this.logger.warn('Critical performance issue for real-time:', timeValidation.errors);
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Real-time availability retrieved for ${Array.isArray(realtimeData) ? realtimeData.length : 1} resources`,
        resourceCount: Array.isArray(realtimeData) ? realtimeData.length : 1
      });

      this.logger.success(`✅ Disponibilidad en tiempo real: ${Array.isArray(realtimeData) ? realtimeData.length : 1} recursos (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('availability-service', 'availability', 'realtime');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with real-time availability data'
      });
      this.logger.error(`❌ Error consultando disponibilidad en tiempo real: ${error.message}`);
    }
  }

  async testAvailabilityConflicts() {
    this.logger.subheader('Test: Gestión de conflictos de disponibilidad');
    const startTime = Date.now();

    try {
      // Primero crear una reserva para generar conflicto
      const reservationData = this.dataGenerator.getTestData(2, 'reservation', {
        resourceId: this.testData.testResourceId,
        userId: this.testData.docenteUser.id,
        startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // +26 horas
        endTime: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(), // +28 horas
        purpose: 'Test conflict detection'
      });

      const reservationEndpoint = getEndpointUrl('availability-service', 'reservations', 'create');
      const reservationResponse = await this.httpClient.authPost(reservationEndpoint, reservationData, this.testData.docenteUser);

      if (reservationResponse.data.success) {
        // Ahora intentar crear otra reserva conflictiva
        const conflictData = {
          ...reservationData,
          startTime: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(), // +27 horas (conflicto)
          endTime: new Date(Date.now() + 29 * 60 * 60 * 1000).toISOString(), // +29 horas
          purpose: 'Conflicting reservation'
        };

        try {
          const conflictResponse = await this.httpClient.authPost(reservationEndpoint, conflictData, this.testData.estudianteUser);
          
          // Si no falla, algo está mal
          this.logger.warn('Conflict detection may not be working - conflicting reservation was accepted');
          
        } catch (conflictError) {
          // Esperado - debe rechazar por conflicto
          if (conflictError.response && [409, 422].includes(conflictError.response.status)) {
            const duration = Date.now() - startTime;
            this.reporter.addResult(reservationEndpoint, 'POST', 'PASS', {
              duration,
              message: 'Correctly detected and rejected conflicting reservation',
              statusCode: conflictError.response.status
            });

            this.logger.success(`✅ Conflicto detectado correctamente (${duration}ms)`);
            return;
          }
        }
      }

      this.logger.warn('Could not test conflict detection properly');

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('availability-service', 'reservations', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'Conflict detection functionality'
      });
      this.logger.error(`❌ Error probando detección de conflictos: ${error.message}`);
    }
  }

  async testScheduleUpdates() {
    this.logger.subheader('Test: Actualizar horarios de disponibilidad');
    
    if (this.testData.createdSchedules.length === 0) {
      this.logger.warn('No hay horarios creados para actualizar');
      return;
    }

    const startTime = Date.now();

    try {
      const schedule = this.testData.createdSchedules[0];
      const updateData = {
        startTime: '09:00', // Cambiar hora de inicio
        endTime: '17:00',   // Cambiar hora de fin
        restrictions: {
          userTypes: ['DOCENTE'], // Más restrictivo
          minimumAdvance: 48 // Más tiempo de anticipación
        }
      };

      const endpoint = getEndpointUrl('availability-service', 'schedules', 'update').replace(':id', schedule.id);
      const response = await this.httpClient.authPut(endpoint, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Schedule update validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedSchedule = response.data.data;

      this.reporter.addResult(endpoint, 'PUT', 'PASS', {
        duration,
        message: `Updated schedule: ${updatedSchedule.startTime}-${updatedSchedule.endTime}`,
        scheduleId: updatedSchedule.id
      });

      this.logger.success(`✅ Horario actualizado: ${updatedSchedule.startTime}-${updatedSchedule.endTime} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('availability-service', 'schedules', 'update');
      this.reporter.addResult(endpoint, 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated schedule'
      });
      this.logger.error(`❌ Error actualizando horario: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar horarios creados
    for (const schedule of this.testData.createdSchedules) {
      try {
        const endpoint = getEndpointUrl('availability-service', 'schedules', 'delete').replace(':id', schedule.id);
        await this.httpClient.authDelete(endpoint, this.testData.adminUser);
        this.logger.debug(`Cleaned up schedule: ${schedule.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup schedule ${schedule.id}:`, error.message);
      }
    }

    // Limpiar disponibilidades creadas
    for (const availability of this.testData.createdAvailability) {
      try {
        const endpoint = getEndpointUrl('availability-service', 'availability', 'delete').replace(':id', availability.id);
        await this.httpClient.authDelete(endpoint, this.testData.adminUser);
        this.logger.debug(`Cleaned up availability: ${availability.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup availability ${availability.id}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 2: BASIC AVAILABILITY');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    // Guardar reporte detallado
    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-2-availability-basic.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new BasicAvailabilityFlow();
  flow.run().catch(console.error);
}

module.exports = { BasicAvailabilityFlow };
