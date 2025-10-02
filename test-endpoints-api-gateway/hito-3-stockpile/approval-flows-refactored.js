#!/usr/bin/env node

/**
 * HITO 3 - STOCKPILE CORE: APPROVAL FLOWS (REFACTORIZADO)
 * 
 * Flujo completo de testing para flujos de aprobación:
 * - RF-20: Validar solicitudes de reserva por parte de un responsable
 * - RF-24: Configuración de flujos de aprobación diferenciados
 * - RF-25: Registro y trazabilidad de todas las aprobaciones
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class ApprovalFlowsFlow {
  constructor() {
    this.logger = new TestLogger('Approval-Flows');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-3-Stockpile', 'Approval-Flows');
    this.testData = {
      createdFlows: [],
      createdRequests: [],
      adminUser: TEST_DATA.USERS.ADMIN_GENERAL,
      adminProgUser: TEST_DATA.USERS.ADMIN_PROGRAMA,
      docenteUser: TEST_DATA.USERS.DOCENTE,
      estudianteUser: TEST_DATA.USERS.ESTUDIANTE
    };
  }

  async run() {
    this.logger.header('HITO 3 - APPROVAL FLOWS TESTING');
    this.logger.info('Iniciando testing completo de flujos de aprobación...');

    try {
      await this.setup();
      await this.testCreateApprovalFlow();
      await this.testListApprovalFlows();
      await this.testUpdateApprovalFlow();
      await this.testSubmitApprovalRequest();
      await this.testProcessApprovalRequest();
      await this.testRejectApprovalRequest();
      await this.testApprovalHistory();
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
      await this.httpClient.authenticate(this.testData.adminProgUser);
      await this.httpClient.authenticate(this.testData.docenteUser);
      await this.httpClient.authenticate(this.testData.estudianteUser);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testCreateApprovalFlow() {
    this.logger.subheader('Test: Crear flujo de aprobación');
    const startTime = Date.now();

    try {
      const flowData = this.dataGenerator.getTestData(3, 'approvalFlow', {
        name: `Test Approval Flow ${Date.now()}`,
        description: 'Flujo de aprobación para auditorios',
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
        isActive: true
      });

      const endpoint = getEndpointUrl('stockpile-service', 'approval-flows', 'create');
      const response = await this.httpClient.authPost(endpoint, flowData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Approval flow creation validation failed: ${validation.errors.join(', ')}`);
      }

      const createdFlow = response.data.data;
      this.testData.createdFlows.push(createdFlow);

      // Validar estructura del flujo creado
      const flowValidation = this.validator.validateApprovalFlow(createdFlow);
      if (!flowValidation.isValid) {
        this.logger.warn('Created flow structure issues:', flowValidation.errors);
      }

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Created approval flow: ${createdFlow.name}`,
        flowId: createdFlow.id,
        stepsCount: createdFlow.steps.length
      });

      this.logger.success(`✅ Flujo de aprobación creado: ${createdFlow.name} (ID: ${createdFlow.id}) (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'approval-flows', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created approval flow'
      });
      this.logger.error(`❌ Error creando flujo de aprobación: ${error.message}`);
    }
  }

  async testListApprovalFlows() {
    this.logger.subheader('Test: Listar flujos de aprobación');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('stockpile-service', 'approval-flows', 'list');
      const response = await this.httpClient.authGet(endpoint, this.testData.adminUser, {
        params: { page: 1, limit: 10 }
      });

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Approval flows list validation failed: ${validation.errors.join(', ')}`);
      }

      const flows = response.data.data;
      if (flows.length > 0) {
        for (const flow of flows) {
          const flowValidation = this.validator.validateApprovalFlow(flow);
          if (!flowValidation.isValid) {
            this.logger.warn(`Flow ${flow.id} validation issues:`, flowValidation.errors);
          }
        }
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved ${flows.length} approval flows`,
        flowsCount: flows.length
      });

      this.logger.success(`✅ Flujos de aprobación listados: ${flows.length} encontrados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'approval-flows', 'list');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with paginated flows list'
      });
      this.logger.error(`❌ Error listando flujos de aprobación: ${error.message}`);
    }
  }

  async testUpdateApprovalFlow() {
    this.logger.subheader('Test: Actualizar flujo de aprobación');
    
    if (this.testData.createdFlows.length === 0) {
      this.logger.warn('No hay flujos creados para actualizar');
      return;
    }

    const startTime = Date.now();

    try {
      const flow = this.testData.createdFlows[0];
      const updateData = {
        name: `${flow.name} - Actualizado`,
        description: 'Flujo actualizado durante testing',
        requiredApprovals: 1, // Reducir requerimientos
        steps: [
          {
            order: 1,
            approverRole: 'ADMIN_PROGRAMA',
            isRequired: true,
            timeoutHours: 72 // Más tiempo
          }
        ]
      };

      const endpoint = getEndpointUrl('stockpile-service', 'approval-flows', 'update').replace(':id', flow.id);
      const response = await this.httpClient.authPut(endpoint, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Flow update validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedFlow = response.data.data;

      this.reporter.addResult(endpoint, 'PUT', 'PASS', {
        duration,
        message: `Updated approval flow: ${updatedFlow.name}`,
        flowId: updatedFlow.id
      });

      this.logger.success(`✅ Flujo actualizado: ${updatedFlow.name} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'approval-flows', 'update');
      this.reporter.addResult(endpoint, 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated flow'
      });
      this.logger.error(`❌ Error actualizando flujo: ${error.message}`);
    }
  }

  async testSubmitApprovalRequest() {
    this.logger.subheader('Test: Enviar solicitud de aprobación');
    const startTime = Date.now();

    try {
      const requestData = {
        resourceId: '1', // Usar recurso de semillas
        userId: this.testData.docenteUser.id,
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // +48 horas
        endTime: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(), // +50 horas
        purpose: 'Conferencia académica importante',
        description: 'Solicitud que requiere aprobación especial',
        attendees: 150,
        requestType: 'RESERVATION_APPROVAL'
      };

      const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'submit');
      const response = await this.httpClient.authPost(endpoint, requestData, this.testData.docenteUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Approval request submission validation failed: ${validation.errors.join(', ')}`);
      }

      const createdRequest = response.data.data;
      this.testData.createdRequests.push(createdRequest);

      // Validar estructura de la solicitud
      const requestValidation = this.validator.validateEntity(createdRequest,
        ['id', 'resourceId', 'userId', 'startTime', 'endTime', 'purpose', 'status'],
        ['description', 'attendees', 'requestType', 'flowId', 'currentStep', 'createdAt']
      );

      if (!requestValidation.isValid) {
        this.logger.warn('Created request structure issues:', requestValidation.errors);
      }

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Submitted approval request for resource ${requestData.resourceId}`,
        requestId: createdRequest.id,
        status: createdRequest.status
      });

      this.logger.success(`✅ Solicitud enviada: ${createdRequest.purpose} (ID: ${createdRequest.id}) (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'submit');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created approval request'
      });
      this.logger.error(`❌ Error enviando solicitud: ${error.message}`);
    }
  }

  async testProcessApprovalRequest() {
    this.logger.subheader('Test: Procesar solicitud de aprobación');
    
    if (this.testData.createdRequests.length === 0) {
      this.logger.warn('No hay solicitudes creadas para procesar');
      return;
    }

    const startTime = Date.now();

    try {
      const request = this.testData.createdRequests[0];
      const approvalData = {
        requestId: request.id,
        action: 'APPROVE',
        comments: 'Solicitud aprobada tras revisión',
        approverId: this.testData.adminProgUser.id
      };

      const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'process');
      const response = await this.httpClient.authPost(endpoint, approvalData, this.testData.adminProgUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Approval processing validation failed: ${validation.errors.join(', ')}`);
      }

      const processedRequest = response.data.data;

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Processed approval request: ${approvalData.action}`,
        requestId: processedRequest.id,
        newStatus: processedRequest.status
      });

      this.logger.success(`✅ Solicitud procesada: ${approvalData.action} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'process');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with processed request'
      });
      this.logger.error(`❌ Error procesando solicitud: ${error.message}`);
    }
  }

  async testRejectApprovalRequest() {
    this.logger.subheader('Test: Rechazar solicitud de aprobación');
    const startTime = Date.now();

    try {
      // Crear nueva solicitud para rechazar
      const requestData = {
        resourceId: '2',
        userId: this.testData.estudianteUser.id,
        startTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 74 * 60 * 60 * 1000).toISOString(),
        purpose: 'Solicitud a rechazar',
        requestType: 'RESERVATION_APPROVAL'
      };

      const submitEndpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'submit');
      const submitResponse = await this.httpClient.authPost(submitEndpoint, requestData, this.testData.estudianteUser);

      if (submitResponse.data.success) {
        const rejectionData = {
          requestId: submitResponse.data.data.id,
          action: 'REJECT',
          comments: 'Solicitud rechazada por no cumplir criterios',
          approverId: this.testData.adminProgUser.id
        };

        const processEndpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'process');
        const response = await this.httpClient.authPost(processEndpoint, rejectionData, this.testData.adminProgUser);

        const duration = Date.now() - startTime;
        const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
        
        if (!validation.isValid) {
          throw new Error(`Rejection processing validation failed: ${validation.errors.join(', ')}`);
        }

        const rejectedRequest = response.data.data;

        this.reporter.addResult(processEndpoint, 'POST', 'PASS', {
          duration,
          message: `Rejected approval request with comments`,
          requestId: rejectedRequest.id,
          status: rejectedRequest.status
        });

        this.logger.success(`✅ Solicitud rechazada correctamente (${duration}ms)`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'process');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with rejected request'
      });
      this.logger.error(`❌ Error rechazando solicitud: ${error.message}`);
    }
  }

  async testApprovalHistory() {
    this.logger.subheader('Test: Historial de aprobaciones');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'history');
      const params = {
        userId: this.testData.docenteUser.id,
        status: 'ALL',
        page: 1,
        limit: 10
      };

      const response = await this.httpClient.authGet(endpoint, this.testData.docenteUser, { params });

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Approval history validation failed: ${validation.errors.join(', ')}`);
      }

      const history = response.data.data;

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved approval history: ${history.length} records`,
        recordsCount: history.length
      });

      this.logger.success(`✅ Historial de aprobaciones: ${history.length} registros (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'history');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with approval history'
      });
      this.logger.error(`❌ Error obteniendo historial: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar solicitudes creadas
    for (const request of this.testData.createdRequests) {
      try {
        const endpoint = getEndpointUrl('stockpile-service', 'approval-requests', 'delete').replace(':id', request.id);
        await this.httpClient.authDelete(endpoint, this.testData.adminUser);
        this.logger.debug(`Cleaned up request: ${request.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup request ${request.id}:`, error.message);
      }
    }

    // Limpiar flujos creados
    for (const flow of this.testData.createdFlows) {
      try {
        const endpoint = getEndpointUrl('stockpile-service', 'approval-flows', 'delete').replace(':id', flow.id);
        await this.httpClient.authDelete(endpoint, this.testData.adminUser);
        this.logger.debug(`Cleaned up flow: ${flow.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup flow ${flow.id}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 3: APPROVAL FLOWS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-3-stockpile-approval-flows.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new ApprovalFlowsFlow();
  flow.run().catch(console.error);
}

module.exports = { ApprovalFlowsFlow };
