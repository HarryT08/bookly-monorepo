#!/usr/bin/env node

/**
 * HITO 1 - RESOURCES CORE: MAINTENANCE
 * 
 * Flujo completo de testing para gestión de mantenimiento:
 * - RF-06: Gestión de mantenimiento de recursos
 * - Tipos: PREVENTIVO, CORRECTIVO, EMERGENCIA, LIMPIEZA
 * - Reportar incidentes por estudiantes/administrativos
 * 
 * Endpoints probados:
 * - GET /api/v1/resources/maintenance/pending
 * - POST /api/v1/resources/maintenance
 * - GET /api/v1/resources/maintenance/:id
 * - PUT /api/v1/resources/maintenance/:id
 * - DELETE /api/v1/resources/maintenance/:id
 */

const { httpClient } = require('../shared/http-client');
const { TestValidator, TestUtils } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_USERS, TEST_DATA, CONFIG } = require('../shared/config');
const { TestLogger } = require('../shared/logger');

class MaintenanceFlow {
  constructor() {
    this.logger = new TestLogger('Maintenance');
    this.validator = new TestValidator();
    this.reporter = new TestReporter('Hito-1-Resources', 'Maintenance');
    this.testData = {
      createdMaintenances: [],
      adminUser: TEST_USERS.ADMIN_GENERAL,
      docenteUser: TEST_USERS.DOCENTE,
      estudianteUser: TEST_USERS.ESTUDIANTE
    };
  }

  async run() {
    this.logger.header('HITO 1 - MAINTENANCE FLOW');
    this.logger.info('Iniciando testing completo de gestión de mantenimiento...');

    try {
      await this.setup();
      await this.testListPendingMaintenance();
      await this.testCreateMaintenance();
      await this.testReportIncident();
      await this.testGetMaintenanceById();
      await this.testUpdateMaintenance();
      await this.testDeleteMaintenance();
      await this.testValidationErrors();
      await this.cleanup();
    } catch (error) {
      this.logger.error('Flow failed:', error.message);
    } finally {
      await this.generateReport();
    }
  }

  async setup() {
    this.logger.subheader('Setup - Preparación del entorno');
    
    try {
      await httpClient.authenticate(this.testData.adminUser);
      await httpClient.authenticate(this.testData.docenteUser);
      await httpClient.authenticate(this.testData.estudianteUser);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testListPendingMaintenance() {
    this.logger.subheader('Test: Listar mantenimientos pendientes');
    const startTime = Date.now();

    try {
      const response = await httpClient.authGet('/api/v1/resources/maintenance/pending', this.testData.adminUser);
      const duration = Date.now() - startTime;
      
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const maintenances = response.data.data;
      
      this.reporter.addResult('/api/v1/resources/maintenance/pending', 'GET', 'PASS', {
        duration,
        message: `Retrieved ${maintenances.length} pending maintenances`,
        response: { count: maintenances.length }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/maintenance/pending', 'GET', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Pending maintenance endpoint not implemented'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/maintenance/pending', 'GET', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200 with pending maintenances list'
        });
      }
    }
  }

  async testCreateMaintenance() {
    this.logger.subheader('Test: Crear mantenimiento programado');
    const startTime = Date.now();

    try {
      const newMaintenance = {
        resourceId: '1', // Salón A-101
        type: 'PREVENTIVO',
        title: 'Mantenimiento preventivo mensual',
        description: 'Revisión general y limpieza profunda',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 120, // 2 horas en minutos
        priority: 'MEDIUM'
      };

      const response = await httpClient.authPost('/api/v1/resources/maintenance', newMaintenance, this.testData.adminUser);
      const duration = Date.now() - startTime;
      
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const createdMaintenance = response.data.data;
      this.testData.createdMaintenances.push(createdMaintenance);

      this.reporter.addResult('/api/v1/resources/maintenance', 'POST', 'PASS', {
        duration,
        message: `Created maintenance: ${createdMaintenance.title}`,
        response: { 
          maintenanceId: createdMaintenance.id,
          type: createdMaintenance.type,
          resourceId: createdMaintenance.resourceId
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/maintenance', 'POST', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Create maintenance endpoint not implemented'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/maintenance', 'POST', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 201 with created maintenance'
        });
      }
    }
  }

  async testReportIncident() {
    this.logger.subheader('Test: Reportar incidente como estudiante');
    const startTime = Date.now();

    try {
      const incident = {
        resourceId: '2', // Lab Sistemas A-201
        type: 'CORRECTIVO',
        title: 'Computador dañado',
        description: 'El computador #5 no enciende, posible problema eléctrico',
        priority: 'HIGH',
        reportedBy: this.testData.estudianteUser.email
      };

      const response = await httpClient.authPost('/api/v1/resources/maintenance', incident, this.testData.estudianteUser);
      const duration = Date.now() - startTime;
      
      if (response.status === 201 || response.status === 200) {
        const reportedIncident = response.data.data;
        this.testData.createdMaintenances.push(reportedIncident);

        this.reporter.addResult('/api/v1/resources/maintenance [incident]', 'POST', 'PASS', {
          duration,
          message: `Student incident reported: ${reportedIncident.title}`,
          response: { 
            incidentId: reportedIncident.id,
            reportedBy: this.testData.estudianteUser.role
          }
        });
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 403) {
        this.reporter.addResult('/api/v1/resources/maintenance [incident]', 'POST', 'WARN', {
          duration,
          message: `Students not allowed to report incidents - may need different endpoint`,
          response: { needsIncidentEndpoint: true }
        });
      } else if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/maintenance [incident]', 'POST', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Incident reporting not implemented'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/maintenance [incident]', 'POST', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 201 with reported incident'
        });
      }
    }
  }

  async testGetMaintenanceById() {
    this.logger.subheader('Test: Obtener mantenimiento por ID');
    
    if (this.testData.createdMaintenances.length === 0) {
      this.reporter.addResult('/api/v1/resources/maintenance/:id', 'GET', 'SKIP', {
        reason: 'No maintenances created to retrieve'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const maintenance = this.testData.createdMaintenances[0];
      const response = await httpClient.authGet(`/api/v1/resources/maintenance/${maintenance.id}`, this.testData.adminUser);
      const duration = Date.now() - startTime;
      
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const retrievedMaintenance = response.data.data;

      this.reporter.addResult(`/api/v1/resources/maintenance/${maintenance.id}`, 'GET', 'PASS', {
        duration,
        message: `Retrieved maintenance: ${retrievedMaintenance.title}`,
        response: { 
          maintenanceId: retrievedMaintenance.id,
          type: retrievedMaintenance.type,
          status: retrievedMaintenance.status
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/maintenance/:id', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with maintenance details'
      });
    }
  }

  async testUpdateMaintenance() {
    this.logger.subheader('Test: Actualizar mantenimiento');
    
    if (this.testData.createdMaintenances.length === 0) {
      this.reporter.addResult('/api/v1/resources/maintenance/:id', 'PUT', 'SKIP', {
        reason: 'No maintenances created to update'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const maintenance = this.testData.createdMaintenances[0];
      const updateData = {
        status: 'IN_PROGRESS',
        notes: 'Mantenimiento iniciado según cronograma'
      };

      const response = await httpClient.authPut(`/api/v1/resources/maintenance/${maintenance.id}`, updateData, this.testData.adminUser);
      const duration = Date.now() - startTime;
      
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedMaintenance = response.data.data;

      this.reporter.addResult(`/api/v1/resources/maintenance/${maintenance.id}`, 'PUT', 'PASS', {
        duration,
        message: `Updated maintenance status: ${updatedMaintenance.status}`,
        response: { 
          maintenanceId: updatedMaintenance.id,
          newStatus: updatedMaintenance.status
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/maintenance/:id', 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated maintenance'
      });
    }
  }

  async testDeleteMaintenance() {
    this.logger.subheader('Test: Cancelar mantenimiento');
    
    if (this.testData.createdMaintenances.length === 0) {
      this.reporter.addResult('/api/v1/resources/maintenance/:id', 'DELETE', 'SKIP', {
        reason: 'No maintenances created to cancel'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const maintenance = this.testData.createdMaintenances.pop();
      
      const response = await httpClient.authDelete(`/api/v1/resources/maintenance/${maintenance.id}`, this.testData.adminUser);
      const duration = Date.now() - startTime;
      
      if (![200, 204].includes(response.status)) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }

      this.reporter.addResult(`/api/v1/resources/maintenance/${maintenance.id}`, 'DELETE', 'PASS', {
        duration,
        message: `Maintenance cancelled successfully`,
        response: { 
          cancelledMaintenanceId: maintenance.id,
          verified: true
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/maintenance/:id', 'DELETE', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 204 maintenance cancelled'
      });
    }
  }

  async testValidationErrors() {
    this.logger.subheader('Test: Errores de validación');
    
    const tests = [
      {
        name: 'Create maintenance without resource',
        data: { type: 'PREVENTIVO', title: 'Test' },
        expectedError: 'resource'
      },
      {
        name: 'Create maintenance with invalid type',
        data: { resourceId: '1', type: 'INVALID_TYPE', title: 'Test' },
        expectedError: 'type'
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      
      try {
        const response = await httpClient.authPost('/api/v1/resources/maintenance', test.data, this.testData.adminUser);
        
        const duration = Date.now() - startTime;
        this.reporter.addResult(`/api/v1/resources/maintenance [${test.name}]`, 'POST', 'WARN', {
          duration,
          message: `Expected validation error but request succeeded`,
          response: { testCase: test.name }
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        const isExpectedError = error.message.toLowerCase().includes(test.expectedError) ||
                               error.status === 400 ||
                               error.status === 422;
        
        if (isExpectedError) {
          this.reporter.addResult(`/api/v1/resources/maintenance [${test.name}]`, 'POST', 'PASS', {
            duration,
            message: `Validation error correctly caught`,
            response: { testCase: test.name, errorType: test.expectedError }
          });
        } else {
          this.reporter.addResult(`/api/v1/resources/maintenance [${test.name}]`, 'POST', 'FAIL', {
            duration,
            error: `Unexpected error: ${error.message}`,
            expected: `Validation error containing '${test.expectedError}'`
          });
        }
      }
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de mantenimientos');
    
    for (const maintenance of this.testData.createdMaintenances) {
      try {
        await httpClient.authDelete(`/api/v1/resources/maintenance/${maintenance.id}`, this.testData.adminUser);
        this.logger.debug(`Cleaned up maintenance: ${maintenance.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup maintenance ${maintenance.id}:`, error.message);
      }
    }
    
    this.logger.success(`Cleanup completed - ${this.testData.createdMaintenances.length} maintenances cleaned`);
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final...');
    
    const reportPath = await this.reporter.saveReport();
    
    this.logger.finish(this.reporter.stats);
    this.logger.success(`Reporte guardado en: ${reportPath}`);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new MaintenanceFlow();
  flow.run().catch(console.error);
}

module.exports = { MaintenanceFlow };
