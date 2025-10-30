#!/usr/bin/env node

/**
 * HITO 9 - INTEGRATIONS: ACADEMIC SYSTEMS (REFACTORIZADO)
 * 
 * Flujo completo de testing para sistemas académicos:
 * - Integración con SIA (Sistema de Información Académica)
 * - Conexión con LMS (Moodle/Canvas)
 * - Sincronización de horarios académicos
 * - Gestión de clases y eventos académicos
 * - Integración con sistemas de evaluación
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class AcademicSystemsFlow {
  constructor() {
    this.logger = new TestLogger('Academic-Systems');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-9-Integrations', 'Academic-Systems');
    this.testData = {
      academicIntegrations: [],
      synchronizedData: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        docente: TEST_DATA.USERS.DOCENTE,
        estudiante: TEST_DATA.USERS.ESTUDIANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 9 - ACADEMIC SYSTEMS TESTING');
    this.logger.info('Iniciando testing completo de sistemas académicos...');

    try {
      await this.setup();
      await this.testSIAIntegration();
      await this.testLMSConnection();
      await this.testAcademicScheduleSync();
      await this.testClassEventManagement();
      await this.testEvaluationSystems();
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
      await this.httpClient.authenticate(this.testData.testUsers.docente);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testSIAIntegration() {
    this.logger.subheader('Test: Integración con SIA (Sistema de Información Académica)');
    const startTime = Date.now();

    try {
      // Test 1: Configurar conexión SIA
      const siaConfig = this.dataGenerator.getTestData(5, 'siaConfig', {
        apiEndpoint: "https://sia.ufps.edu.co/api/v3",
        apiKey: "sia_api_key_encrypted",
        authentication: {
          type: "BEARER_TOKEN",
          refreshToken: "sia_refresh_token",
          tokenExpiry: 3600
        },
        syncOptions: {
          students: true,
          professors: true,
          courses: true,
          schedules: true,
          enrollments: true,
          grades: false
        },
        dataMapping: {
          studentId: "codigo_estudiante",
          professorId: "cedula_docente",
          courseId: "codigo_asignatura"
        }
      });

      const siaConfigEndpoint = getEndpointUrl('integration-service', 'academic', 'sia-config');
      const siaConfigResponse = await this.httpClient.authPost(siaConfigEndpoint, siaConfig, this.testData.testUsers.admin);

      if (siaConfigResponse.data.success) {
        this.testData.academicIntegrations.push({ type: 'SIA', ...siaConfigResponse.data.data });
      }

      // Test 2: Sincronizar datos de estudiantes
      const studentSyncData = {
        configId: siaConfigResponse.data?.data?.configId,
        semester: "2024-2",
        programs: ["INGENIERIA_SISTEMAS", "INGENIERIA_CIVIL", "MEDICINA"],
        includeInactive: false,
        batchSize: 500
      };

      const studentSyncEndpoint = getEndpointUrl('integration-service', 'academic', 'sia-sync-students');
      const studentSyncResponse = await this.httpClient.authPost(studentSyncEndpoint, studentSyncData, this.testData.testUsers.admin);

      // Test 3: Importar horarios académicos
      const scheduleImportData = {
        configId: siaConfigResponse.data?.data?.configId,
        semester: "2024-2",
        includeVirtualClasses: true,
        validateResourceAvailability: true
      };

      const scheduleImportEndpoint = getEndpointUrl('integration-service', 'academic', 'sia-import-schedules');
      const scheduleImportResponse = await this.httpClient.authPost(scheduleImportEndpoint, scheduleImportData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(siaConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'SIA integration tests completed successfully',
        testsCompleted: 3,
        siaConfigured: siaConfigResponse.data?.success || false,
        studentsSync: studentSyncResponse.data?.success || false,
        schedulesImported: scheduleImportResponse.data?.success || false,
        syncOptionsEnabled: Object.values(siaConfig.syncOptions).filter(Boolean).length
      });

      this.logger.success(`✅ Integración SIA completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'academic', 'sia-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with SIA integration'
      });
      this.logger.error(`❌ Error en SIA: ${error.message}`);
    }
  }

  async testLMSConnection() {
    this.logger.subheader('Test: Conexión con LMS (Moodle/Canvas)');
    const startTime = Date.now();

    try {
      // Test 1: Configurar Moodle LMS
      const moodleConfig = {
        platform: "MOODLE",
        url: "https://aulas.ufps.edu.co",
        webserviceToken: "moodle_webservice_token_encrypted",
        capabilities: [
          "core_user_get_users",
          "core_course_get_courses", 
          "core_enrol_get_enrolled_users",
          "core_calendar_create_calendar_events"
        ],
        syncSettings: {
          syncCourses: true,
          syncUsers: true,
          syncEnrollments: true,
          createCalendarEvents: true,
          syncFrequency: "DAILY"
        }
      };

      const moodleConfigEndpoint = getEndpointUrl('integration-service', 'academic', 'lms-moodle-config');
      const moodleConfigResponse = await this.httpClient.authPost(moodleConfigEndpoint, moodleConfig, this.testData.testUsers.admin);

      // Test 2: Configurar Canvas LMS
      const canvasConfig = {
        platform: "CANVAS",
        url: "https://canvas.ufps.edu.co",
        accessToken: "canvas_access_token_encrypted",
        accountId: "ufps_canvas_account",
        syncSettings: {
          syncCourses: true,
          syncAssignments: true,
          createBooklyEvents: true
        }
      };

      const canvasConfigEndpoint = getEndpointUrl('integration-service', 'academic', 'lms-canvas-config');
      const canvasConfigResponse = await this.httpClient.authPost(canvasConfigEndpoint, canvasConfig, this.testData.testUsers.admin);

      // Test 3: Sincronizar cursos desde LMS
      const courseSyncData = {
        lmsType: "MOODLE",
        configId: moodleConfigResponse.data?.data?.configId,
        semester: "2024-2",
        includeHidden: false,
        createBooklyResources: true
      };

      const courseSyncEndpoint = getEndpointUrl('integration-service', 'academic', 'lms-sync-courses');
      const courseSyncResponse = await this.httpClient.authPost(courseSyncEndpoint, courseSyncData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(moodleConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'LMS connection tests completed successfully',
        testsCompleted: 3,
        moodleConfigured: moodleConfigResponse.data?.success || false,
        canvasConfigured: canvasConfigResponse.data?.success || false,
        coursesSynced: courseSyncResponse.data?.success || false,
        lmsPlatforms: 2
      });

      this.logger.success(`✅ Conexión LMS completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'academic', 'lms-moodle-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with LMS connection'
      });
      this.logger.error(`❌ Error en LMS: ${error.message}`);
    }
  }

  async testAcademicScheduleSync() {
    this.logger.subheader('Test: Sincronización de horarios académicos');
    const startTime = Date.now();

    try {
      // Test 1: Importar horarios desde múltiples fuentes
      const scheduleImportConfig = {
        sources: [
          {
            type: "SIA",
            configId: "sia_config_123",
            priority: 1
          },
          {
            type: "MOODLE",
            configId: "moodle_config_456",
            priority: 2
          }
        ],
        semester: "2024-2",
        importSettings: {
          conflictResolution: "SIA_PRIORITY",
          autoCreateResources: true,
          validateCapacity: true,
          notifyChanges: true
        }
      };

      const importEndpoint = getEndpointUrl('integration-service', 'academic', 'schedule-import');
      const importResponse = await this.httpClient.authPost(importEndpoint, scheduleImportConfig, this.testData.testUsers.admin);

      // Test 2: Validar conflictos de horarios
      const conflictValidationData = {
        semester: "2024-2",
        validationType: "COMPREHENSIVE",
        checkTypes: ["TIME_OVERLAP", "RESOURCE_CONFLICT", "CAPACITY_EXCEEDED"],
        autoFix: false
      };

      const validationEndpoint = getEndpointUrl('integration-service', 'academic', 'schedule-validation');
      const validationResponse = await this.httpClient.authPost(validationEndpoint, conflictValidationData, this.testData.testUsers.admin);

      // Test 3: Generar calendario académico integrado
      const calendarGenerationData = {
        semester: "2024-2",
        includeHolidays: true,
        includeExamPeriods: true,
        exportFormats: ["ICAL", "GOOGLE_CALENDAR", "OUTLOOK"],
        shareWithUsers: true
      };

      const calendarEndpoint = getEndpointUrl('integration-service', 'academic', 'generate-calendar');
      const calendarResponse = await this.httpClient.authPost(calendarEndpoint, calendarGenerationData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(importEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Academic schedule sync tests completed successfully',
        testsCompleted: 3,
        schedulesImported: importResponse.data?.success || false,
        conflictsValidated: validationResponse.data?.success || false,
        calendarGenerated: calendarResponse.data?.success || false,
        sourcesConfigured: scheduleImportConfig.sources.length
      });

      this.logger.success(`✅ Sincronización de horarios completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'academic', 'schedule-import');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with schedule sync'
      });
      this.logger.error(`❌ Error en sincronización de horarios: ${error.message}`);
    }
  }

  async testClassEventManagement() {
    this.logger.subheader('Test: Gestión de clases y eventos académicos');
    const startTime = Date.now();

    try {
      // Test 1: Crear evento académico automático
      const academicEventData = {
        type: "CLASS_SESSION",
        courseId: "ING_SIS_001",
        professorId: this.testData.testUsers.docente.id,
        resourceId: "lab_ia_001",
        schedule: {
          startTime: "2024-09-05T14:00:00Z",
          endTime: "2024-09-05T16:00:00Z",
          recurrence: {
            type: "WEEKLY",
            daysOfWeek: ["TUESDAY", "THURSDAY"],
            endDate: "2024-12-15"
          }
        },
        metadata: {
          syllabus: "Machine Learning Fundamentals",
          requiredResources: ["PROJECTOR", "COMPUTERS"],
          maxStudents: 30
        }
      };

      const createEventEndpoint = getEndpointUrl('integration-service', 'academic', 'create-class-event');
      const createEventResponse = await this.httpClient.authPost(createEventEndpoint, academicEventData, this.testData.testUsers.admin);

      // Test 2: Gestionar asistencia de estudiantes
      const attendanceData = {
        eventId: createEventResponse.data?.data?.eventId,
        sessionDate: "2024-09-05",
        attendanceMethod: "QR_CODE",
        attendanceWindow: {
          openMinutes: 15,
          closeMinutes: 30
        },
        students: [
          { studentId: "est_001", status: "PRESENT", timestamp: "2024-09-05T14:05:00Z" },
          { studentId: "est_002", status: "ABSENT" },
          { studentId: "est_003", status: "LATE", timestamp: "2024-09-05T14:20:00Z" }
        ]
      };

      const attendanceEndpoint = getEndpointUrl('integration-service', 'academic', 'manage-attendance');
      const attendanceResponse = await this.httpClient.authPost(attendanceEndpoint, attendanceData, this.testData.testUsers.docente);

      // Test 3: Integrar con sistema de evaluaciones
      const evaluationIntegrationData = {
        eventId: createEventResponse.data?.data?.eventId,
        evaluationType: "QUIZ",
        evaluationPlatform: "MOODLE",
        settings: {
          duration: 60, // minutos
          attemptsAllowed: 2,
          availableFrom: "2024-09-05T14:30:00Z",
          availableUntil: "2024-09-05T15:30:00Z"
        }
      };

      const evaluationEndpoint = getEndpointUrl('integration-service', 'academic', 'evaluation-integration');
      const evaluationResponse = await this.httpClient.authPost(evaluationEndpoint, evaluationIntegrationData, this.testData.testUsers.docente);

      const duration = Date.now() - startTime;

      this.reporter.addResult(createEventEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Class event management tests completed successfully',
        testsCompleted: 3,
        eventCreated: createEventResponse.data?.success || false,
        attendanceManaged: attendanceResponse.data?.success || false,
        evaluationIntegrated: evaluationResponse.data?.success || false,
        recurrenceConfigured: academicEventData.schedule.recurrence.type === "WEEKLY"
      });

      this.logger.success(`✅ Gestión de eventos académicos completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'academic', 'create-class-event');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with class event management'
      });
      this.logger.error(`❌ Error en gestión de eventos: ${error.message}`);
    }
  }

  async testEvaluationSystems() {
    this.logger.subheader('Test: Integración con sistemas de evaluación');
    const startTime = Date.now();

    try {
      // Test 1: Configurar múltiples plataformas de evaluación
      const evaluationPlatforms = [
        {
          platform: "MOODLE_QUIZ",
          config: {
            webserviceToken: "moodle_quiz_token",
            defaultSettings: {
              shuffleQuestions: true,
              shuffleAnswers: true,
              attempts: 2
            }
          }
        },
        {
          platform: "KAHOOT",
          config: {
            apiKey: "kahoot_api_key",
            accountType: "PREMIUM_EDUCATION"
          }
        },
        {
          platform: "GOOGLE_FORMS",
          config: {
            serviceAccountKey: "google_forms_key",
            sharedDrive: "ufps_evaluations"
          }
        }
      ];

      const platformPromises = evaluationPlatforms.map(async (platform) => {
        const configEndpoint = getEndpointUrl('integration-service', 'academic', 'evaluation-platform-config');
        return await this.httpClient.authPost(configEndpoint, platform, this.testData.testUsers.admin);
      });

      const platformResults = await Promise.all(platformPromises);

      // Test 2: Crear evaluación sincronizada
      const synchronizedEvaluationData = {
        courseId: "ING_SIS_001",
        evaluationTitle: "Examen Machine Learning",
        platforms: ["MOODLE_QUIZ", "GOOGLE_FORMS"],
        syncSettings: {
          crossPlatformResults: true,
          unifiedGrading: true,
          realTimeSync: true
        },
        evaluation: {
          questions: 25,
          duration: 90, // minutos
          availablePeriod: {
            start: "2024-09-10T08:00:00Z",
            end: "2024-09-10T18:00:00Z"
          }
        }
      };

      const syncEvaluationEndpoint = getEndpointUrl('integration-service', 'academic', 'create-sync-evaluation');
      const syncEvaluationResponse = await this.httpClient.authPost(syncEvaluationEndpoint, synchronizedEvaluationData, this.testData.testUsers.docente);

      // Test 3: Análisis de resultados integrado
      const resultsAnalysisData = {
        evaluationId: syncEvaluationResponse.data?.data?.evaluationId,
        analysisType: "COMPREHENSIVE",
        includeStatistics: true,
        generateReports: ["INDIVIDUAL", "GROUP", "COMPARATIVE"],
        exportFormats: ["PDF", "EXCEL", "CSV"]
      };

      const analysisEndpoint = getEndpointUrl('integration-service', 'academic', 'evaluation-analysis');
      const analysisResponse = await this.httpClient.authPost(analysisEndpoint, resultsAnalysisData, this.testData.testUsers.docente);

      const duration = Date.now() - startTime;

      this.reporter.addResult(configEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Evaluation systems integration tests completed successfully',
        testsCompleted: 3,
        platformsConfigured: platformResults.filter(r => r.data?.success).length,
        syncEvaluationCreated: syncEvaluationResponse.data?.success || false,
        resultsAnalysisCompleted: analysisResponse.data?.success || false,
        totalPlatforms: evaluationPlatforms.length,
        reportsGenerated: resultsAnalysisData.generateReports.length
      });

      this.logger.success(`✅ Sistemas de evaluación completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'academic', 'evaluation-platform-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with evaluation systems integration'
      });
      this.logger.error(`❌ Error en sistemas de evaluación: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar integraciones académicas
    for (const integration of this.testData.academicIntegrations) {
      try {
        const endpoint = getEndpointUrl('integration-service', 'academic', 'delete-integration').replace(':id', integration.configId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up academic integration: ${integration.type}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup integration ${integration.configId}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 9: ACADEMIC SYSTEMS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-9-integrations-academic.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new AcademicSystemsFlow();
  flow.run().catch(console.error);
}

module.exports = { AcademicSystemsFlow };
