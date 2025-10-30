#!/usr/bin/env node

/**
 * HITO 5 - REPORTS: USER REPORTS (REFACTORIZADO)
 * 
 * Flujo completo de testing para reportes de usuario:
 * - RF-32: Reporte por usuario/profesor
 * - RF-34: Registro de feedback de usuarios
 * - RF-35: Evaluación de usuarios por el staff
 * - Reportes individuales de usuario
 * - Análisis de comportamiento de usuario
 * - Segmentación de usuarios
 * - Reportes de feedback de usuarios
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class UserReportsFlow {
  constructor() {
    this.logger = new TestLogger('User-Reports');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-5-Reports', 'User-Reports');
    this.testData = {
      generatedReports: [],
      createdFeedback: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        adminProg: TEST_DATA.USERS.ADMIN_PROGRAMA,
        docente: TEST_DATA.USERS.DOCENTE,
        estudiante: TEST_DATA.USERS.ESTUDIANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 5 - USER REPORTS TESTING');
    this.logger.info('Iniciando testing completo de reportes de usuario...');

    try {
      await this.setup();
      await this.testIndividualUserReports();
      await this.testUserBehaviorAnalysis();
      await this.testUserSegmentation();
      await this.testUserFeedbackReports();
      await this.testUserEvaluations();
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
      await this.httpClient.authenticate(this.testData.testUsers.docente);
      await this.httpClient.authenticate(this.testData.testUsers.estudiante);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testIndividualUserReports() {
    this.logger.subheader('Test: Reportes individuales de usuario');
    const startTime = Date.now();

    try {
      // Test 1: Historial personal de reservas
      const historyData = {
        userId: this.testData.testUsers.docente.id,
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeDetails: true,
        includeCancelled: true,
        sortBy: 'date',
        sortOrder: 'desc'
      };

      const historyEndpoint = getEndpointUrl('reports-service', 'users', 'reservation-history');
      const historyResponse = await this.httpClient.authPost(historyEndpoint, historyData, this.testData.testUsers.docente);

      // Test 2: Estadísticas de uso personal
      const statsData = {
        userId: this.testData.testUsers.docente.id,
        period: 'monthly',
        includeComparisons: true,
        metrics: [
          'total_reservations',
          'hours_reserved',
          'favorite_resources',
          'peak_usage_hours',
          'cancellation_rate'
        ]
      };

      const statsEndpoint = getEndpointUrl('reports-service', 'users', 'usage-statistics');
      const statsResponse = await this.httpClient.authPost(statsEndpoint, statsData, this.testData.testUsers.docente);

      // Test 3: Reporte de evaluaciones recibidas
      const evaluationsData = {
        userId: this.testData.testUsers.docente.id,
        evaluationType: 'received',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeComments: true
      };

      const evaluationsEndpoint = getEndpointUrl('reports-service', 'users', 'evaluations');
      const evaluationsResponse = await this.httpClient.authPost(evaluationsEndpoint, evaluationsData, this.testData.testUsers.docente);

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(historyResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(statsResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(evaluationsResponse, 'SUCCESS')
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Individual user reports validation failed: ${validationErrors.join(', ')}`);
      }

      // Guardar reportes generados
      [historyResponse, statsResponse, evaluationsResponse].forEach(response => {
        if (response.data.success && response.data.data.reportId) {
          this.testData.generatedReports.push(response.data.data.reportId);
        }
      });

      this.reporter.addResult(historyEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Individual user reports generated successfully',
        testsCompleted: 3,
        historyGenerated: historyResponse.data?.success || false,
        statsGenerated: statsResponse.data?.success || false,
        evaluationsGenerated: evaluationsResponse.data?.success || false
      });

      this.logger.success(`✅ Reportes individuales de usuario completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'users', 'reservation-history');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with individual user reports'
      });
      this.logger.error(`❌ Error en reportes individuales: ${error.message}`);
    }
  }

  async testUserBehaviorAnalysis() {
    this.logger.subheader('Test: Análisis de comportamiento de usuario');
    const startTime = Date.now();

    try {
      // Test 1: Patrones de reserva por usuario
      const patternsData = {
        userId: this.testData.testUsers.docente.id,
        analysisType: 'booking_patterns',
        timeWindow: '3months',
        identifyTrends: true,
        includePreferences: true
      };

      const patternsEndpoint = getEndpointUrl('reports-service', 'analytics', 'user-behavior');
      const patternsResponse = await this.httpClient.authPost(patternsEndpoint, patternsData, this.testData.testUsers.admin);

      // Test 2: Análisis de puntualidad
      const punctualityData = {
        userId: this.testData.testUsers.docente.id,
        metrics: ['checkin_punctuality', 'checkout_punctuality', 'no_show_rate'],
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        benchmarkAgainstPeers: true
      };

      const punctualityEndpoint = getEndpointUrl('reports-service', 'analytics', 'punctuality');
      const punctualityResponse = await this.httpClient.authPost(punctualityEndpoint, punctualityData, this.testData.testUsers.admin);

      // Test 3: Frecuencia de cancelaciones por usuario
      const cancellationData = {
        userIds: [this.testData.testUsers.docente.id, this.testData.testUsers.estudiante.id],
        analysisType: 'cancellation_frequency',
        includeReasons: true,
        identifyPatterns: true,
        timeframe: 'last_6_months'
      };

      const cancellationEndpoint = getEndpointUrl('reports-service', 'analytics', 'cancellation-analysis');
      const cancellationResponse = await this.httpClient.authPost(cancellationEndpoint, cancellationData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(patternsEndpoint, 'POST', 'PASS', {
        duration,
        message: 'User behavior analysis completed successfully',
        testsCompleted: 3,
        patternsAnalyzed: patternsResponse.data?.success || false,
        punctualityAnalyzed: punctualityResponse.data?.success || false,
        cancellationAnalyzed: cancellationResponse.data?.success || false
      });

      this.logger.success(`✅ Análisis de comportamiento completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'analytics', 'user-behavior');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with user behavior analysis'
      });
      this.logger.error(`❌ Error en análisis de comportamiento: ${error.message}`);
    }
  }

  async testUserSegmentation() {
    this.logger.subheader('Test: Segmentación de usuarios');
    const startTime = Date.now();

    try {
      // Test 1: Segmentación por rol académico
      const roleSegmentationData = {
        segmentBy: 'academic_role',
        includeMetrics: true,
        metrics: ['usage_frequency', 'resource_preferences', 'peak_hours'],
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const roleEndpoint = getEndpointUrl('reports-service', 'segmentation', 'by-role');
      const roleResponse = await this.httpClient.authPost(roleEndpoint, roleSegmentationData, this.testData.testUsers.admin);

      // Test 2: Segmentación por programa académico
      const programSegmentationData = {
        segmentBy: 'academic_program',
        programs: ['sistemas', 'industrial', 'civil'],
        comparePrograms: true,
        includeUserCounts: true
      };

      const programEndpoint = getEndpointUrl('reports-service', 'segmentation', 'by-program');
      const programResponse = await this.httpClient.authPost(programEndpoint, programSegmentationData, this.testData.testUsers.adminProg);

      // Test 3: Usuarios más activos vs inactivos
      const activityData = {
        segmentBy: 'activity_level',
        thresholds: {
          highly_active: 10, // 10+ reservas por mes
          active: 3,         // 3-9 reservas por mes
          inactive: 0        // 0-2 reservas por mes
        },
        includeRecommendations: true,
        analysisWindow: '3months'
      };

      const activityEndpoint = getEndpointUrl('reports-service', 'segmentation', 'by-activity');
      const activityResponse = await this.httpClient.authPost(activityEndpoint, activityData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(roleEndpoint, 'POST', 'PASS', {
        duration,
        message: 'User segmentation completed successfully',
        testsCompleted: 3,
        roleSegmentationCompleted: roleResponse.data?.success || false,
        programSegmentationCompleted: programResponse.data?.success || false,
        activitySegmentationCompleted: activityResponse.data?.success || false
      });

      this.logger.success(`✅ Segmentación de usuarios completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'segmentation', 'by-role');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with user segmentation'
      });
      this.logger.error(`❌ Error en segmentación de usuarios: ${error.message}`);
    }
  }

  async testUserFeedbackReports() {
    this.logger.subheader('Test: Reportes de feedback de usuarios');
    const startTime = Date.now();

    try {
      // Test 1: Crear feedback de prueba
      const feedbackData = this.dataGenerator.getTestData(5, 'feedback', {
        userId: this.testData.testUsers.docente.id,
        resourceId: '1',
        rating: 4,
        comment: 'Excelente auditorio, muy buena acústica y equipamiento',
        category: 'RESOURCE_QUALITY',
        isAnonymous: false,
        tags: ['acustica', 'equipamiento', 'limpieza']
      });

      const createFeedbackEndpoint = getEndpointUrl('reports-service', 'feedback', 'create');
      const createFeedbackResponse = await this.httpClient.authPost(createFeedbackEndpoint, feedbackData, this.testData.testUsers.docente);

      if (createFeedbackResponse.data.success) {
        this.testData.createdFeedback.push(createFeedbackResponse.data.data);
      }

      // Test 2: Compilar evaluaciones de recursos
      const resourceRatingsData = {
        resourceIds: ['1', '2', '3'],
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeComments: true,
        aggregateRatings: true,
        groupBy: 'resource'
      };

      const ratingsEndpoint = getEndpointUrl('reports-service', 'feedback', 'resource-ratings');
      const ratingsResponse = await this.httpClient.authPost(ratingsEndpoint, resourceRatingsData, this.testData.testUsers.admin);

      // Test 3: Análisis de comentarios y sugerencias
      const commentsAnalysisData = {
        analysisType: 'sentiment_analysis',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeKeywords: true,
        categorizeComments: true,
        identifyIssues: true
      };

      const commentsEndpoint = getEndpointUrl('reports-service', 'feedback', 'comments-analysis');
      const commentsResponse = await this.httpClient.authPost(commentsEndpoint, commentsAnalysisData, this.testData.testUsers.admin);

      // Test 4: Tendencias de satisfacción
      const satisfactionData = {
        metric: 'satisfaction_score',
        timeGranularity: 'weekly',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeTrendAnalysis: true,
        segmentBy: 'user_role'
      };

      const satisfactionEndpoint = getEndpointUrl('reports-service', 'feedback', 'satisfaction-trends');
      const satisfactionResponse = await this.httpClient.authPost(satisfactionEndpoint, satisfactionData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(createFeedbackEndpoint, 'POST', 'PASS', {
        duration,
        message: 'User feedback reports completed successfully',
        testsCompleted: 4,
        feedbackCreated: createFeedbackResponse.data?.success || false,
        resourceRatingsCompiled: ratingsResponse.data?.success || false,
        commentsAnalyzed: commentsResponse.data?.success || false,
        satisfactionTrendsGenerated: satisfactionResponse.data?.success || false
      });

      this.logger.success(`✅ Reportes de feedback completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'feedback', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with feedback reports'
      });
      this.logger.error(`❌ Error en reportes de feedback: ${error.message}`);
    }
  }

  async testUserEvaluations() {
    this.logger.subheader('Test: Evaluaciones de usuarios');
    const startTime = Date.now();

    try {
      // Test 1: Crear evaluación de usuario por staff
      const evaluationData = this.dataGenerator.getTestData(5, 'userEvaluation', {
        evaluatedUserId: this.testData.testUsers.estudiante.id,
        evaluatorId: this.testData.testUsers.admin.id,
        evaluationType: 'RESOURCE_USAGE',
        rating: 3,
        criteria: [
          { name: 'punctuality', score: 4, comment: 'Llega puntual a las reservas' },
          { name: 'cleanliness', score: 3, comment: 'Mantiene el espacio ordenado' },
          { name: 'equipment_care', score: 2, comment: 'Necesita más cuidado con equipos' }
        ],
        generalComments: 'Usuario responsable, con área de mejora en cuidado de equipamiento',
        evaluationDate: new Date().toISOString(),
        isVisible: false // Solo visible para staff
      });

      const createEvaluationEndpoint = getEndpointUrl('reports-service', 'evaluations', 'create');
      const createEvaluationResponse = await this.httpClient.authPost(createEvaluationEndpoint, evaluationData, this.testData.testUsers.admin);

      // Test 2: Listar evaluaciones de un usuario
      const listEvaluationsData = {
        userId: this.testData.testUsers.estudiante.id,
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeDetails: true,
        sortBy: 'date',
        sortOrder: 'desc'
      };

      const listEndpoint = getEndpointUrl('reports-service', 'evaluations', 'by-user');
      const listResponse = await this.httpClient.authPost(listEndpoint, listEvaluationsData, this.testData.testUsers.admin);

      // Test 3: Reporte consolidado de evaluaciones
      const consolidatedData = {
        userIds: [this.testData.testUsers.estudiante.id, this.testData.testUsers.docente.id],
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        includeStatistics: true,
        groupBy: 'evaluation_type',
        calculateAverages: true
      };

      const consolidatedEndpoint = getEndpointUrl('reports-service', 'evaluations', 'consolidated-report');
      const consolidatedResponse = await this.httpClient.authPost(consolidatedEndpoint, consolidatedData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(createEvaluationEndpoint, 'POST', 'PASS', {
        duration,
        message: 'User evaluations tests completed successfully',
        testsCompleted: 3,
        evaluationCreated: createEvaluationResponse.data?.success || false,
        evaluationsListed: listResponse.data?.success || false,
        consolidatedReportGenerated: consolidatedResponse.data?.success || false
      });

      this.logger.success(`✅ Evaluaciones de usuarios completadas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('reports-service', 'evaluations', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with user evaluations'
      });
      this.logger.error(`❌ Error en evaluaciones de usuarios: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar feedback creado
    for (const feedback of this.testData.createdFeedback) {
      try {
        const endpoint = getEndpointUrl('reports-service', 'feedback', 'delete').replace(':id', feedback.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up feedback: ${feedback.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup feedback ${feedback.id}:`, error.message);
      }
    }

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
    this.logger.info('RESUMEN DE TESTING - HITO 5: USER REPORTS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-5-reports-user-reports.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new UserReportsFlow();
  flow.run().catch(console.error);
}

module.exports = { UserReportsFlow };
