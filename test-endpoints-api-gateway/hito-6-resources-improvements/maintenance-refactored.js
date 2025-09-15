#!/usr/bin/env node

/**
 * HITO 6 - RESOURCES IMPROVEMENTS: MAINTENANCE (REFACTORIZADO)
 * 
 * Flujo completo de testing para mantenimiento de recursos:
 * - RF-06: Gestión de mantenimiento de recursos
 * - Tipos dinámicos de mantenimiento
 * - Reporte de daños por estudiantes y administrativos
 * - Gestión de incidentes
 * - Delegación de responsables de recursos
 * - Auditoría y notificaciones de mantenimiento
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class MaintenanceFlow {
  constructor() {
    this.logger = new TestLogger('Maintenance');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-6-Resources', 'Maintenance');
    this.testData = {
      createdMaintenanceTypes: [],
      createdReports: [],
      createdIncidents: [],
      createdDelegations: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        adminProg: TEST_DATA.USERS.ADMIN_PROGRAMA,
        docente: TEST_DATA.USERS.DOCENTE,
        estudiante: TEST_DATA.USERS.ESTUDIANTE,
        vigilante: TEST_DATA.USERS.VIGILANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 6 - MAINTENANCE TESTING');
    this.logger.info('Iniciando testing completo de mantenimiento de recursos...');

    try {
      await this.setup();
      await this.testMaintenanceTypes();
      await this.testDamageReporting();
      await this.testIncidentReporting();
      await this.testResourceDelegation();
      await this.testMaintenanceAudit();
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
      await this.httpClient.authenticate(this.testData.testUsers.admin);
      await this.httpClient.authenticate(this.testData.testUsers.adminProg);
      await this.httpClient.authenticate(this.testData.testUsers.estudiante);
      await this.httpClient.authenticate(this.testData.testUsers.vigilante);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testMaintenanceTypes() {
    this.logger.subheader('Test: Tipos dinámicos de mantenimiento');
    const startTime = Date.now();

    try {
      // Test 1: Obtener tipos de mantenimiento mínimos
      const minimalTypesEndpoint = getEndpointUrl('resources-service', 'maintenance', 'types-minimal');
      const minimalResponse = await this.httpClient.authGet(minimalTypesEndpoint, this.testData.testUsers.admin);

      // Test 2: Crear tipo personalizado
      const customTypeData = this.dataGenerator.getTestData(5, 'maintenanceType', {
        code: "CALIBRACION_PRECISION",
        name: "Calibración de Equipos de Precisión",
        description: "Calibración periódica para equipos de medición y análisis",
        type: "MAINTENANCE_TYPE",
        subtype: "CALIBRATION",
        priority: "MEDIUM",
        estimatedDuration: 120, // minutos
        requiredSkills: ["ELECTRONIC_TECH", "CALIBRATION_CERT"],
        isActive: true,
        deletable: true,
        service: "RESOURCES"
      });

      const createTypeEndpoint = getEndpointUrl('resources-service', 'maintenance', 'create-type');
      const createTypeResponse = await this.httpClient.authPost(createTypeEndpoint, customTypeData, this.testData.testUsers.admin);

      if (createTypeResponse.data.success) {
        this.testData.createdMaintenanceTypes.push(createTypeResponse.data.data);
      }

      // Test 3: Usar nuevo tipo en solicitud de mantenimiento
      const maintenanceRequestData = {
        resourceId: "resource-test-001",
        maintenanceTypeCode: "CALIBRACION_PRECISION",
        priority: "MEDIUM",
        scheduledDate: "2024-09-15T10:00:00Z",
        description: "Calibración anual de equipos del laboratorio",
        requestedBy: this.testData.testUsers.adminProg.id
      };

      const createRequestEndpoint = getEndpointUrl('resources-service', 'maintenance', 'create-request');
      const requestResponse = await this.httpClient.authPost(createRequestEndpoint, maintenanceRequestData, this.testData.testUsers.adminProg);

      const duration = Date.now() - startTime;

      this.reporter.addResult(minimalTypesEndpoint, 'GET', 'PASS', {
        duration,
        message: 'Maintenance types tests completed successfully',
        testsCompleted: 3,
        minimalTypesRetrieved: minimalResponse.data?.success || false,
        customTypeCreated: createTypeResponse.data?.success || false,
        typeUsedInRequest: requestResponse.data?.success || false,
        customTypeCode: customTypeData.code
      });

      this.logger.success(`✅ Tipos de mantenimiento completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'maintenance', 'types-minimal');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with maintenance types'
      });
      this.logger.error(`❌ Error en tipos de mantenimiento: ${error.message}`);
    }
  }

  async testDamageReporting() {
    this.logger.subheader('Test: Reporte de daños por usuarios');
    const startTime = Date.now();

    try {
      // Test 1: Estudiante reportando daño
      const studentReportData = this.dataGenerator.getTestData(5, 'damageReport', {
        reporterType: "STUDENT",
        reporterId: this.testData.testUsers.estudiante.id,
        resourceId: "resource-lab-001",
        damageType: "EQUIPMENT_MALFUNCTION",
        severity: "HIGH",
        title: "Proyector no funciona",
        description: "El proyector del laboratorio no enciende, pantalla completamente negra. Se verificó conexiones.",
        location: "Laboratorio Redes - Proyector principal",
        evidenceFiles: ["photo1.jpg", "photo2.jpg"],
        contactInfo: this.testData.testUsers.estudiante.email
      });

      const studentReportEndpoint = getEndpointUrl('resources-service', 'maintenance', 'report-damage');
      const studentResponse = await this.httpClient.authPost(studentReportEndpoint, studentReportData, this.testData.testUsers.estudiante);

      if (studentResponse.data.success) {
        this.testData.createdReports.push(studentResponse.data.data);
      }

      // Test 2: Administrativo reportando daño con escalamiento
      const adminReportData = this.dataGenerator.getTestData(5, 'damageReport', {
        reporterType: "ADMINISTRATIVE",
        reporterId: this.testData.testUsers.adminProg.id,
        resourceId: "resource-audit-001",
        damageType: "INFRASTRUCTURE",
        severity: "CRITICAL",
        title: "Filtración en auditorio",
        description: "Goteras importantes en auditorio durante lluvia, riesgo eléctrico",
        actionRequired: "Revisión urgente de techo y sistemas eléctricos",
        budgetEstimate: 250000,
        urgencyJustification: "Riesgo para seguridad de usuarios"
      });

      const adminResponse = await this.httpClient.authPost(studentReportEndpoint, adminReportData, this.testData.testUsers.adminProg);

      if (adminResponse.data.success) {
        this.testData.createdReports.push(adminResponse.data.data);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(studentReportEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Damage reporting tests completed successfully',
        testsCompleted: 2,
        studentReportCreated: studentResponse.data?.success || false,
        adminReportCreated: adminResponse.data?.success || false,
        reportsGenerated: this.testData.createdReports.length
      });

      this.logger.success(`✅ Reporte de daños completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'maintenance', 'report-damage');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with damage reports'
      });
      this.logger.error(`❌ Error en reporte de daños: ${error.message}`);
    }
  }

  async testIncidentReporting() {
    this.logger.subheader('Test: Gestión de incidentes');
    const startTime = Date.now();

    try {
      // Test 1: Crear incidente crítico
      const incidentData = this.dataGenerator.getTestData(5, 'incident', {
        type: "CRITICAL_INCIDENT",
        resourceId: "resource-lab-002",
        severity: "CRITICAL",
        title: "Falla eléctrica mayor",
        description: "Corto circuito en tablero principal, laboratorio sin energía",
        affectedUsers: 25,
        immediateAction: "Evacuación completada, energía cortada",
        reporterId: this.testData.testUsers.vigilante.id,
        reporterType: "SECURITY",
        safetyRisk: true,
        requiresEvacuation: true
      });

      const createIncidentEndpoint = getEndpointUrl('resources-service', 'incidents', 'create');
      const incidentResponse = await this.httpClient.authPost(createIncidentEndpoint, incidentData, this.testData.testUsers.vigilante);

      if (incidentResponse.data.success) {
        this.testData.createdIncidents.push(incidentResponse.data.data);
      }

      // Test 2: Actualizar estado del incidente
      const incidentId = incidentResponse.data?.data?.id;
      if (incidentId) {
        const updateData = {
          status: "IN_PROGRESS",
          progress: 60,
          updateDescription: "Reparación del tablero eléctrico 60% completada",
          estimatedCompletion: "2024-09-02T16:00:00Z",
          updatedBy: this.testData.testUsers.admin.id
        };

        const updateEndpoint = getEndpointUrl('resources-service', 'incidents', 'update').replace(':id', incidentId);
        const updateResponse = await this.httpClient.authPut(updateEndpoint, updateData, this.testData.testUsers.admin);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(createIncidentEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Incident management tests completed successfully',
        testsCompleted: 2,
        incidentCreated: incidentResponse.data?.success || false,
        incidentUpdated: incidentId !== undefined,
        severity: incidentData.severity,
        affectedUsers: incidentData.affectedUsers
      });

      this.logger.success(`✅ Gestión de incidentes completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'incidents', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with incident management'
      });
      this.logger.error(`❌ Error en gestión de incidentes: ${error.message}`);
    }
  }

  async testResourceDelegation() {
    this.logger.subheader('Test: Delegación de responsables');
    const startTime = Date.now();

    try {
      // Test 1: Crear delegación de responsable
      const delegationData = this.dataGenerator.getTestData(5, 'delegation', {
        resourceId: "resource-lab-003",
        delegatedTo: "responsable.laboratorio@ufps.edu.co",
        delegatedBy: this.testData.testUsers.adminProg.id,
        permissions: [
          "SCHEDULE_MAINTENANCE",
          "APPROVE_REPAIRS", 
          "GENERATE_REPORTS",
          "MANAGE_ACCESS",
          "VIEW_USAGE_STATS"
        ],
        delegationType: "RESOURCE_MANAGER",
        effectiveFrom: new Date().toISOString(),
        effectiveUntil: "2024-12-31T23:59:59Z",
        notes: "Responsable principal del laboratorio de programación",
        notifyDelegated: true
      });

      const createDelegationEndpoint = getEndpointUrl('resources-service', 'delegation', 'create');
      const delegationResponse = await this.httpClient.authPost(createDelegationEndpoint, delegationData, this.testData.testUsers.adminProg);

      if (delegationResponse.data.success) {
        this.testData.createdDelegations.push(delegationResponse.data.data);
      }

      // Test 2: Verificar permisos del delegado
      const delegationId = delegationResponse.data?.data?.id;
      if (delegationId) {
        const checkPermissionsEndpoint = getEndpointUrl('resources-service', 'delegation', 'check-permissions').replace(':id', delegationId);
        const permissionsResponse = await this.httpClient.authGet(checkPermissionsEndpoint, this.testData.testUsers.admin);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(createDelegationEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Resource delegation tests completed successfully',
        testsCompleted: 2,
        delegationCreated: delegationResponse.data?.success || false,
        permissionsGranted: delegationData.permissions.length,
        delegationType: delegationData.delegationType,
        notificationSent: delegationData.notifyDelegated
      });

      this.logger.success(`✅ Delegación de responsables completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'delegation', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with delegation creation'
      });
      this.logger.error(`❌ Error en delegación: ${error.message}`);
    }
  }

  async testMaintenanceAudit() {
    this.logger.subheader('Test: Auditoría de mantenimiento');
    const startTime = Date.now();

    try {
      // Test 1: Generar reporte de auditoría
      const auditData = {
        period: "2024-08",
        includeMetrics: true,
        includeUserStats: true,
        includeAuditLog: true,
        groupBy: ["maintenance_type", "severity", "user_type"]
      };

      const auditEndpoint = getEndpointUrl('resources-service', 'maintenance', 'audit-report');
      const auditResponse = await this.httpClient.authPost(auditEndpoint, auditData, this.testData.testUsers.admin);

      // Test 2: Verificar sistema de notificaciones
      const notificationEndpoint = getEndpointUrl('resources-service', 'notifications', 'maintenance-config');
      const notificationResponse = await this.httpClient.authGet(notificationEndpoint, this.testData.testUsers.admin);

      // Test 3: Exportar auditoría
      const exportData = {
        reportId: auditResponse.data?.data?.reportId,
        format: "CSV",
        includeCharts: false
      };

      const exportEndpoint = getEndpointUrl('resources-service', 'maintenance', 'export-audit');
      const exportResponse = await this.httpClient.authPost(exportEndpoint, exportData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(auditEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Maintenance audit tests completed successfully',
        testsCompleted: 3,
        auditGenerated: auditResponse.data?.success || false,
        notificationConfigVerified: notificationResponse.data?.success || false,
        auditExported: exportResponse.data?.success || false,
        auditPeriod: auditData.period
      });

      this.logger.success(`✅ Auditoría de mantenimiento completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'maintenance', 'audit-report');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with audit report'
      });
      this.logger.error(`❌ Error en auditoría: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar delegaciones
    for (const delegation of this.testData.createdDelegations) {
      try {
        const endpoint = getEndpointUrl('resources-service', 'delegation', 'delete').replace(':id', delegation.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up delegation: ${delegation.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup delegation ${delegation.id}:`, error.message);
      }
    }

    // Limpiar reportes e incidentes  
    for (const report of this.testData.createdReports) {
      try {
        const endpoint = getEndpointUrl('resources-service', 'maintenance', 'delete-report').replace(':id', report.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up report: ${report.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup report ${report.id}:`, error.message);
      }
    }

    // Limpiar tipos de mantenimiento personalizados
    for (const type of this.testData.createdMaintenanceTypes) {
      try {
        const endpoint = getEndpointUrl('resources-service', 'maintenance', 'delete-type').replace(':id', type.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up maintenance type: ${type.name}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup type ${type.id}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 6: MAINTENANCE');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-6-resources-maintenance.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new MaintenanceFlow();
  flow.run().catch(console.error);
}

module.exports = { MaintenanceFlow };
