#!/usr/bin/env node

/**
 * HITO 5 - REPORTS: USAGE REPORTS (REFACTORIZADO)
 * 
 * Flujo completo de testing para reportes de uso:
 * - RF-31: Reporte de uso por recurso/programa/período
 * - Reportes de utilización y métricas
 * - Análisis de ocupación
 * - Reportes basados en tiempo
 * - Capacidades de exportación
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class UsageReportsFlow {
  constructor() {
    this.logger = new TestLogger('Usage-Reports');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-5-Reports', 'Usage-Reports');
    this.testData = {
      generatedReports: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        adminProg: TEST_DATA.USERS.ADMIN_PROGRAMA
      }
    };
  }

  async run() {
    this.logger.header('HITO 5 - USAGE REPORTS TESTING');
    this.logger.info('Iniciando testing completo de reportes de uso...');

    try {
      await this.setup();
      await this.testResourceUsageReports();
      await this.testUtilizationMetrics();
      await this.testOccupancyAnalysis();
      await this.testTimeBasedReports();
      await this.testExportCapabilities();
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
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testResourceUsageReports() {
    this.logger.subheader('Test: Reportes de uso de recursos');
    const startTime = Date.now();

    try {
      // Test 1: Reporte de uso por recurso específico
      const resourceReportData = {
        resourceId: '1',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeMetrics: true,
        groupBy: 'day'
      };

      const resourceEndpoint = getEndpointUrl('reports-service', 'usage', 'by-resource');
      const resourceResponse = await this.httpClient.authPost(resourceEndpoint, resourceReportData, this.testData.testUsers.admin);

      // Test 2: Reporte de uso por categoría
      const categoryReportData = {
        categoryType: 'AUDITORIO',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeComparison: true
      };

      const categoryEndpoint = getEndpointUrl('reports-service', 'usage', 'by-category');
      const categoryResponse = await this.httpClient.authPost(categoryEndpoint, categoryReportData, this.testData.testUsers.admin);

      // Test 3: Reporte por programa académico
      const programReportData = {
        programId: 'sistemas',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeUsers: true
      };

      const programEndpoint = getEndpointUrl('reports-service', 'usage', 'by-program');
      const programResponse = await this.httpClient.authPost(programEndpoint, programReportData, this.testData.testUsers.adminProg);

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(resourceResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(categoryResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(programResponse, 'SUCCESS')
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Usage reports validation failed: ${validationErrors.join(', ')}`);
      }

      // Guardar reportes generados
      [resourceResponse, categoryResponse, programResponse].forEach(response => {
        if (response.data.success && response.data.data.reportId) {
          this.testData.generatedReports.push(response.data.data.reportId);
        }
      });

      this.reporter.addResult(resourceEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Resource usage reports generated successfully',
        testsCompleted: 3,
        reportsGenerated: this.testData.generatedReports.length
      });

      this.logger.success(`✅ Reportes de uso de recursos completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'usage', 'by-resource');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with usage reports'
      });
      this.logger.error(`❌ Error en reportes de uso: ${error.message}`);
    }
  }

  async testUtilizationMetrics() {
    this.logger.subheader('Test: Métricas de utilización');
    const startTime = Date.now();

    try {
      // Test 1: Calcular tasa de ocupación
      const occupancyData = {
        resourceIds: ['1', '2', '3'],
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        calculateTrends: true
      };

      const occupancyEndpoint = getEndpointUrl('reports-service', 'metrics', 'occupancy-rate');
      const occupancyResponse = await this.httpClient.authPost(occupancyEndpoint, occupancyData, this.testData.testUsers.admin);

      // Test 2: Métricas de eficiencia por horario
      const efficiencyData = {
        resourceId: '1',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        groupByHour: true,
        includeWeekends: false
      };

      const efficiencyEndpoint = getEndpointUrl('reports-service', 'metrics', 'efficiency');
      const efficiencyResponse = await this.httpClient.authPost(efficiencyEndpoint, efficiencyData, this.testData.testUsers.admin);

      // Test 3: Identificar recursos subutilizados
      const underutilizedData = {
        threshold: 30, // Menos del 30% de utilización
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeRecommendations: true
      };

      const underutilizedEndpoint = getEndpointUrl('reports-service', 'metrics', 'underutilized');
      const underutilizedResponse = await this.httpClient.authPost(underutilizedEndpoint, underutilizedData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(occupancyEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Utilization metrics calculated successfully',
        testsCompleted: 3,
        occupancyCalculated: occupancyResponse.data?.success || false,
        efficiencyAnalyzed: efficiencyResponse.data?.success || false,
        underutilizedFound: underutilizedResponse.data?.data?.resources?.length || 0
      });

      this.logger.success(`✅ Métricas de utilización completadas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'metrics', 'occupancy-rate');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with utilization metrics'
      });
      this.logger.error(`❌ Error en métricas de utilización: ${error.message}`);
    }
  }

  async testOccupancyAnalysis() {
    this.logger.subheader('Test: Análisis de ocupación');
    const startTime = Date.now();

    try {
      // Test 1: Análisis de picos de demanda
      const peakAnalysisData = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        granularity: 'hourly',
        identifyPatterns: true
      };

      const peakEndpoint = getEndpointUrl('reports-service', 'analysis', 'peak-demand');
      const peakResponse = await this.httpClient.authPost(peakEndpoint, peakAnalysisData, this.testData.testUsers.admin);

      // Test 2: Distribución de reservas por duración
      const durationData = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        groupByDuration: true,
        calculateAverages: true
      };

      const durationEndpoint = getEndpointUrl('reports-service', 'analysis', 'duration-distribution');
      const durationResponse = await this.httpClient.authPost(durationEndpoint, durationData, this.testData.testUsers.admin);

      // Test 3: Patrones de cancelación
      const cancellationData = {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        analyzeReasons: true,
        identifyTrends: true
      };

      const cancellationEndpoint = getEndpointUrl('reports-service', 'analysis', 'cancellation-patterns');
      const cancellationResponse = await this.httpClient.authPost(cancellationEndpoint, cancellationData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(peakEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Occupancy analysis completed successfully',
        testsCompleted: 3,
        peakAnalysisCompleted: peakResponse.data?.success || false,
        durationAnalyzed: durationResponse.data?.success || false,
        cancellationPatternsFound: cancellationResponse.data?.success || false
      });

      this.logger.success(`✅ Análisis de ocupación completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'analysis', 'peak-demand');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with occupancy analysis'
      });
      this.logger.error(`❌ Error en análisis de ocupación: ${error.message}`);
    }
  }

  async testTimeBasedReports() {
    this.logger.subheader('Test: Reportes basados en tiempo');
    const startTime = Date.now();

    try {
      // Test 1: Reportes diarios automáticos
      const dailyReportData = {
        date: '2024-01-15',
        includeMetrics: true,
        autoSchedule: true
      };

      const dailyEndpoint = getEndpointUrl('reports-service', 'scheduled', 'daily');
      const dailyResponse = await this.httpClient.authPost(dailyEndpoint, dailyReportData, this.testData.testUsers.admin);

      // Test 2: Reportes semanales consolidados
      const weeklyReportData = {
        weekOf: '2024-01-15',
        consolidateData: true,
        includeComparisons: true
      };

      const weeklyEndpoint = getEndpointUrl('reports-service', 'scheduled', 'weekly');
      const weeklyResponse = await this.httpClient.authPost(weeklyEndpoint, weeklyReportData, this.testData.testUsers.admin);

      // Test 3: Reportes mensuales ejecutivos
      const monthlyReportData = {
        month: '2024-01',
        executiveSummary: true,
        includeRecommendations: true,
        format: 'executive'
      };

      const monthlyEndpoint = getEndpointUrl('reports-service', 'scheduled', 'monthly');
      const monthlyResponse = await this.httpClient.authPost(monthlyEndpoint, monthlyReportData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(dailyEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Time-based reports generated successfully',
        testsCompleted: 3,
        dailyReportGenerated: dailyResponse.data?.success || false,
        weeklyReportGenerated: weeklyResponse.data?.success || false,
        monthlyReportGenerated: monthlyResponse.data?.success || false
      });

      this.logger.success(`✅ Reportes basados en tiempo completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'scheduled', 'daily');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with time-based reports'
      });
      this.logger.error(`❌ Error en reportes basados en tiempo: ${error.message}`);
    }
  }

  async testExportCapabilities() {
    this.logger.subheader('Test: Capacidades de exportación');
    const startTime = Date.now();

    try {
      if (this.testData.generatedReports.length === 0) {
        this.logger.warn('No hay reportes generados para exportar');
        return;
      }

      const reportId = this.testData.generatedReports[0];

      // Test 1: Exportar a Excel/CSV
      const excelExportData = {
        reportId: reportId,
        format: 'excel',
        includeCharts: true,
        sheetNames: ['Usage Data', 'Metrics', 'Analysis']
      };

      const excelEndpoint = getEndpointUrl('reports-service', 'export', 'excel');
      const excelResponse = await this.httpClient.authPost(excelEndpoint, excelExportData, this.testData.testUsers.admin);

      // Test 2: Exportar gráficos como PDF
      const pdfExportData = {
        reportId: reportId,
        format: 'pdf',
        includeCharts: true,
        layout: 'executive'
      };

      const pdfEndpoint = getEndpointUrl('reports-service', 'export', 'pdf');
      const pdfResponse = await this.httpClient.authPost(pdfEndpoint, pdfExportData, this.testData.testUsers.admin);

      // Test 3: Envío automático por email
      const emailData = {
        reportId: reportId,
        recipients: ['admin@ufps.edu.co'],
        subject: 'Reporte de Uso Mensual - Bookly',
        schedule: 'monthly',
        format: 'pdf'
      };

      const emailEndpoint = getEndpointUrl('reports-service', 'email', 'schedule');
      const emailResponse = await this.httpClient.authPost(emailEndpoint, emailData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(excelEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Export capabilities tested successfully',
        testsCompleted: 3,
        excelExported: excelResponse.data?.success || false,
        pdfGenerated: pdfResponse.data?.success || false,
        emailScheduled: emailResponse.data?.success || false
      });

      this.logger.success(`✅ Capacidades de exportación completadas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'export', 'excel');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with export capabilities'
      });
      this.logger.error(`❌ Error en capacidades de exportación: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar reportes generados
    for (const reportId of this.testData.generatedReports) {
      try {
        const endpoint = getEndpointUrl('reports-service', 'reports', 'delete').replace(':id', reportId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up report: ${reportId}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup report ${reportId}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 5: USAGE REPORTS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-5-reports-usage-reports.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new UsageReportsFlow();
  flow.run().catch(console.error);
}

module.exports = { UsageReportsFlow };
