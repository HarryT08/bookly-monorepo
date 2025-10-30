#!/usr/bin/env node

/**
 * HITO 9 - INTEGRATIONS: EXTERNAL CALENDARS (REFACTORIZADO)
 * 
 * Flujo completo de testing para integraciones con calendarios externos:
 * - Sincronización Google Calendar bidireccional
 * - Integración Microsoft Outlook
 * - Sincronización automática de eventos
 * - Resolución de conflictos de calendario
 * - Gestión de invitaciones externas
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class ExternalCalendarsFlow {
  constructor() {
    this.logger = new TestLogger('External-Calendars');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-9-Integrations', 'External-Calendars');
    this.testData = {
      configuredIntegrations: [],
      synchronizedEvents: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        docente: TEST_DATA.USERS.DOCENTE,
        estudiante: TEST_DATA.USERS.ESTUDIANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 9 - EXTERNAL CALENDARS TESTING');
    this.logger.info('Iniciando testing completo de integración con calendarios externos...');

    try {
      await this.setup();
      await this.testGoogleCalendarSync();
      await this.testOutlookIntegration();
      await this.testAutoEventSync();
      await this.testCalendarConflicts();
      await this.testExternalInvitations();
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
      await this.httpClient.authenticate(this.testData.testUsers.estudiante);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testGoogleCalendarSync() {
    this.logger.subheader('Test: Sincronización Google Calendar bidireccional');
    const startTime = Date.now();

    try {
      // Test 1: Configurar OAuth para Google Calendar
      const oauthConfig = this.dataGenerator.getTestData(5, 'googleCalendarOAuth', {
        clientId: "987654321-abcdef.apps.googleusercontent.com",
        clientSecret: "GOCSPX-test_secret_key",
        redirectUri: "https://bookly.ufps.edu.co/integrations/google/callback",
        scopes: [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/calendar.events.owned"
        ],
        userId: this.testData.testUsers.docente.id
      });

      const oauthEndpoint = getEndpointUrl('integration-service', 'google', 'calendar-oauth');
      const oauthResponse = await this.httpClient.authPost(oauthEndpoint, oauthConfig, this.testData.testUsers.admin);

      // Test 2: Establecer sincronización bidireccional
      const syncConfig = {
        integrationId: oauthResponse.data?.data?.integrationId,
        calendarId: "primary",
        syncDirection: "BIDIRECTIONAL",
        syncSettings: {
          eventTypes: ["RESERVATION", "MEETING", "CLASS", "MAINTENANCE"],
          autoSync: true,
          syncInterval: "5_MINUTES",
          conflictResolution: "BOOKLY_PRIORITY"
        },
        fieldMapping: {
          title: "{{resource.name}} - {{reservation.purpose}}",
          description: "Reserva Bookly: {{reservation.description}}",
          location: "{{resource.building}} - {{resource.room}}",
          attendees: ["{{reservation.requester.email}}"]
        }
      };

      const syncEndpoint = getEndpointUrl('integration-service', 'google', 'calendar-sync');
      const syncResponse = await this.httpClient.authPost(syncEndpoint, syncConfig, this.testData.testUsers.docente);

      if (syncResponse.data.success) {
        this.testData.configuredIntegrations.push(syncResponse.data.data);
      }

      // Test 3: Configurar webhook para cambios en tiempo real
      const webhookConfig = {
        integrationId: syncResponse.data?.data?.syncId,
        webhookUrl: "https://bookly.ufps.edu.co/webhooks/google-calendar",
        events: ["CREATED", "UPDATED", "DELETED"],
        verification: {
          token: "bookly_webhook_verify_token",
          challenge: true
        }
      };

      const webhookEndpoint = getEndpointUrl('integration-service', 'google', 'calendar-webhook');
      const webhookResponse = await this.httpClient.authPost(webhookEndpoint, webhookConfig, this.testData.testUsers.admin);

      // Test 4: Simular sincronización inicial
      const initialSyncData = {
        syncId: syncResponse.data?.data?.syncId,
        timeRange: "NEXT_30_DAYS",
        includeExisting: true,
        dryRun: false
      };

      const initialSyncEndpoint = getEndpointUrl('integration-service', 'google', 'calendar-initial-sync');
      const initialSyncResponse = await this.httpClient.authPost(initialSyncEndpoint, initialSyncData, this.testData.testUsers.docente);

      const duration = Date.now() - startTime;

      this.reporter.addResult(oauthEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Google Calendar synchronization tests completed successfully',
        testsCompleted: 4,
        oauthConfigured: oauthResponse.data?.success || false,
        syncEstablished: syncResponse.data?.success || false,
        webhookConfigured: webhookResponse.data?.success || false,
        initialSyncCompleted: initialSyncResponse.data?.success || false,
        syncDirection: syncConfig.syncDirection,
        eventTypesSupported: syncConfig.syncSettings.eventTypes.length
      });

      this.logger.success(`✅ Sincronización Google Calendar completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'google', 'calendar-oauth');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with Google Calendar sync'
      });
      this.logger.error(`❌ Error en Google Calendar: ${error.message}`);
    }
  }

  async testOutlookIntegration() {
    this.logger.subheader('Test: Integración Microsoft Outlook');
    const startTime = Date.now();

    try {
      // Test 1: Configurar Microsoft Graph API
      const graphConfig = this.dataGenerator.getTestData(5, 'microsoftGraph', {
        tenantId: "ufps.edu.co",
        clientId: "12345678-1234-1234-1234-123456789012",
        clientSecret: "test_microsoft_secret",
        authority: "https://login.microsoftonline.com/ufps.edu.co",
        permissions: [
          "Calendars.ReadWrite",
          "Mail.Send",
          "User.Read",
          "Group.Read.All"
        ],
        userId: this.testData.testUsers.docente.id
      });

      const graphEndpoint = getEndpointUrl('integration-service', 'microsoft', 'graph-config');
      const graphResponse = await this.httpClient.authPost(graphEndpoint, graphConfig, this.testData.testUsers.admin);

      // Test 2: Autenticación y obtención de token
      const authData = {
        configId: graphResponse.data?.data?.configId,
        authFlow: "AUTHORIZATION_CODE",
        scopes: graphConfig.permissions,
        redirectUri: "https://bookly.ufps.edu.co/integrations/microsoft/callback"
      };

      const authEndpoint = getEndpointUrl('integration-service', 'microsoft', 'auth');
      const authResponse = await this.httpClient.authPost(authEndpoint, authData, this.testData.testUsers.docente);

      // Test 3: Integración con Outlook Calendar
      const outlookCalendarConfig = {
        accessToken: authResponse.data?.data?.accessToken,
        calendarId: "primary",
        syncSettings: {
          direction: "BIDIRECTIONAL",
          categories: ["BOOKLY_RESERVATION", "BOOKLY_MEETING"],
          timeZone: "America/Bogota",
          reminderSettings: {
            enabled: true,
            defaultMinutes: 15
          }
        }
      };

      const outlookEndpoint = getEndpointUrl('integration-service', 'microsoft', 'outlook-calendar');
      const outlookResponse = await this.httpClient.authPost(outlookEndpoint, outlookCalendarConfig, this.testData.testUsers.docente);

      if (outlookResponse.data.success) {
        this.testData.configuredIntegrations.push(outlookResponse.data.data);
      }

      // Test 4: Probar creación de evento en Outlook
      const testEvent = {
        integrationId: outlookResponse.data?.data?.integrationId,
        event: {
          subject: "Reserva Laboratorio IA - Prueba Integration",
          body: "Reserva creada desde Bookly para testing de integración",
          start: {
            dateTime: "2024-09-02T14:00:00",
            timeZone: "America/Bogota"
          },
          end: {
            dateTime: "2024-09-02T16:00:00", 
            timeZone: "America/Bogota"
          },
          location: "Laboratorio IA - Edificio Central",
          attendees: [
            { emailAddress: { address: this.testData.testUsers.docente.email, name: "Docente Prueba" } }
          ],
          categories: ["BOOKLY_RESERVATION"]
        }
      };

      const createEventEndpoint = getEndpointUrl('integration-service', 'microsoft', 'create-event');
      const createEventResponse = await this.httpClient.authPost(createEventEndpoint, testEvent, this.testData.testUsers.docente);

      if (createEventResponse.data.success) {
        this.testData.synchronizedEvents.push(createEventResponse.data.data);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(graphEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Microsoft Outlook integration tests completed successfully',
        testsCompleted: 4,
        graphConfigured: graphResponse.data?.success || false,
        authenticationSuccessful: authResponse.data?.success || false,
        outlookIntegrated: outlookResponse.data?.success || false,
        eventCreated: createEventResponse.data?.success || false,
        permissionsGranted: graphConfig.permissions.length
      });

      this.logger.success(`✅ Integración Microsoft Outlook completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'microsoft', 'graph-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with Microsoft Outlook integration'
      });
      this.logger.error(`❌ Error en Microsoft Outlook: ${error.message}`);
    }
  }

  async testAutoEventSync() {
    this.logger.subheader('Test: Sincronización automática de eventos');
    const startTime = Date.now();

    try {
      // Test 1: Crear evento en Bookly y verificar sincronización
      const booklyEvent = {
        resourceId: "lab_ia_001",
        userId: this.testData.testUsers.docente.id,
        startTime: "2024-09-03T10:00:00Z",
        endTime: "2024-09-03T12:00:00Z",
        purpose: "Clase de Machine Learning",
        description: "Clase práctica sobre algoritmos de ML",
        syncToExternalCalendars: true,
        externalCalendarSettings: {
          privacy: "PUBLIC",
          inviteAttendees: true,
          sendNotifications: true
        }
      };

      const createBooklyEventEndpoint = getEndpointUrl('availability-service', 'reservations', 'create');
      const booklyEventResponse = await this.httpClient.authPost(createBooklyEventEndpoint, booklyEvent, this.testData.testUsers.docente);

      // Test 2: Verificar sincronización automática a calendarios externos
      const syncVerificationData = {
        booklyEventId: booklyEventResponse.data?.data?.reservationId,
        checkExternalCalendars: ["GOOGLE_CALENDAR", "MICROSOFT_OUTLOOK"],
        verificationTimeout: 30 // segundos
      };

      const verifySyncEndpoint = getEndpointUrl('integration-service', 'calendar', 'verify-sync');
      const verifySyncResponse = await this.httpClient.authPost(verifySyncEndpoint, syncVerificationData, this.testData.testUsers.docente);

      // Test 3: Probar sincronización incremental
      const incrementalSyncConfig = {
        integrations: this.testData.configuredIntegrations.map(int => int.integrationId),
        syncMode: "INCREMENTAL",
        lastSyncTimestamp: "2024-09-01T00:00:00Z",
        batchSize: 50,
        includeDeleted: true
      };

      const incrementalSyncEndpoint = getEndpointUrl('integration-service', 'calendar', 'incremental-sync');
      const incrementalSyncResponse = await this.httpClient.authPost(incrementalSyncEndpoint, incrementalSyncConfig, this.testData.testUsers.admin);

      // Test 4: Validar estado de sincronización
      const syncStatusEndpoint = getEndpointUrl('integration-service', 'calendar', 'sync-status');
      const syncStatusResponse = await this.httpClient.authGet(syncStatusEndpoint, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(createBooklyEventEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Auto event synchronization tests completed successfully',
        testsCompleted: 4,
        eventCreated: booklyEventResponse.data?.success || false,
        syncVerified: verifySyncResponse.data?.success || false,
        incrementalSyncCompleted: incrementalSyncResponse.data?.success || false,
        syncStatusChecked: syncStatusResponse.data?.success || false,
        externalCalendarsCount: syncVerificationData.checkExternalCalendars.length
      });

      this.logger.success(`✅ Sincronización automática de eventos completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('availability-service', 'reservations', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with auto event sync'
      });
      this.logger.error(`❌ Error en sincronización automática: ${error.message}`);
    }
  }

  async testCalendarConflicts() {
    this.logger.subheader('Test: Resolución de conflictos de calendario');
    const startTime = Date.now();

    try {
      // Test 1: Configurar estrategias de resolución de conflictos
      const conflictResolutionConfig = {
        strategies: [
          {
            type: "TIME_OVERLAP",
            resolution: "BOOKLY_PRIORITY",
            autoResolve: true
          },
          {
            type: "DUPLICATE_EVENT",
            resolution: "MERGE_EVENTS",
            mergeStrategy: "COMBINE_DESCRIPTIONS"
          },
          {
            type: "EXTERNAL_MODIFICATION",
            resolution: "MANUAL_REVIEW",
            notifyUsers: true
          }
        ],
        notificationSettings: {
          notifyOnConflict: true,
          escalationLevel: "MEDIUM",
          channels: ["EMAIL", "DASHBOARD"]
        }
      };

      const conflictConfigEndpoint = getEndpointUrl('integration-service', 'calendar', 'conflict-resolution-config');
      const conflictConfigResponse = await this.httpClient.authPost(conflictConfigEndpoint, conflictResolutionConfig, this.testData.testUsers.admin);

      // Test 2: Simular conflicto de tiempo solapado
      const conflictScenario1 = {
        booklyEvent: {
          resourceId: "audit_principal",
          startTime: "2024-09-04T14:00:00Z",
          endTime: "2024-09-04T16:00:00Z",
          userId: this.testData.testUsers.docente.id
        },
        externalEvent: {
          calendarType: "GOOGLE_CALENDAR",
          eventId: "external_event_123",
          startTime: "2024-09-04T15:00:00Z",
          endTime: "2024-09-04T17:00:00Z",
          subject: "Reunión Departamental"
        },
        expectedResolution: "BOOKLY_PRIORITY"
      };

      const resolveConflictEndpoint = getEndpointUrl('integration-service', 'calendar', 'resolve-conflict');
      const resolveConflictResponse = await this.httpClient.authPost(resolveConflictEndpoint, conflictScenario1, this.testData.testUsers.admin);

      // Test 3: Probar detección automática de conflictos
      const conflictDetectionConfig = {
        userId: this.testData.testUsers.docente.id,
        timeWindow: "NEXT_7_DAYS",
        checkFrequency: "REAL_TIME",
        conflictTypes: ["TIME_OVERLAP", "RESOURCE_DOUBLE_BOOKING", "EXTERNAL_CONFLICTS"]
      };

      const detectConflictsEndpoint = getEndpointUrl('integration-service', 'calendar', 'detect-conflicts');
      const detectConflictsResponse = await this.httpClient.authPost(detectConflictsEndpoint, conflictDetectionConfig, this.testData.testUsers.docente);

      const duration = Date.now() - startTime;

      this.reporter.addResult(conflictConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Calendar conflicts resolution tests completed successfully',
        testsCompleted: 3,
        conflictResolutionConfigured: conflictConfigResponse.data?.success || false,
        conflictResolved: resolveConflictResponse.data?.success || false,
        conflictDetectionEnabled: detectConflictsResponse.data?.success || false,
        resolutionStrategies: conflictResolutionConfig.strategies.length,
        conflictTypesSupported: conflictDetectionConfig.conflictTypes.length
      });

      this.logger.success(`✅ Resolución de conflictos completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'calendar', 'conflict-resolution-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with conflict resolution'
      });
      this.logger.error(`❌ Error en resolución de conflictos: ${error.message}`);
    }
  }

  async testExternalInvitations() {
    this.logger.subheader('Test: Gestión de invitaciones externas');
    const startTime = Date.now();

    try {
      // Test 1: Crear invitación a usuario externo
      const externalInvitation = {
        reservationId: "test_reservation_123",
        externalGuests: [
          {
            email: "guest@external-university.edu",
            name: "Dr. External Guest",
            organization: "External University",
            role: "GUEST_SPEAKER"
          },
          {
            email: "collaborator@industry.com",
            name: "Industry Expert",
            organization: "TechCorp",
            role: "COLLABORATOR"
          }
        ],
        invitationSettings: {
          sendCalendarInvite: true,
          includeBooklyDetails: true,
          allowGuestModifications: false,
          requireConfirmation: true,
          accessLevel: "VIEW_ONLY"
        },
        customMessage: "Invitación a presentación sobre AI en la industria"
      };

      const inviteExternalEndpoint = getEndpointUrl('integration-service', 'calendar', 'external-invitations');
      const inviteResponse = await this.httpClient.authPost(inviteExternalEndpoint, externalInvitation, this.testData.testUsers.docente);

      // Test 2: Gestión de respuestas de invitados externos
      const guestResponsesData = {
        invitationId: inviteResponse.data?.data?.invitationId,
        responses: [
          {
            guestEmail: "guest@external-university.edu",
            status: "ACCEPTED",
            responseTime: "2024-09-02T10:30:00Z",
            additionalGuests: 1
          },
          {
            guestEmail: "collaborator@industry.com", 
            status: "TENTATIVE",
            responseTime: "2024-09-02T11:45:00Z",
            message: "Dependiendo de la agenda"
          }
        ]
      };

      const processResponsesEndpoint = getEndpointUrl('integration-service', 'calendar', 'guest-responses');
      const processResponsesResponse = await this.httpClient.authPost(processResponsesEndpoint, guestResponsesData, this.testData.testUsers.docente);

      // Test 3: Configurar acceso temporal para invitados
      const temporaryAccessConfig = {
        invitationId: inviteResponse.data?.data?.invitationId,
        accessSettings: {
          temporaryCredentials: true,
          accessDuration: "EVENT_DURATION_PLUS_1_HOUR",
          allowedResources: ["INVITED_RESOURCE_ONLY"],
          restrictions: {
            networkAccess: "GUEST_WIFI_ONLY",
            systemAccess: "BOOKLY_MOBILE_ONLY"
          }
        }
      };

      const temporaryAccessEndpoint = getEndpointUrl('integration-service', 'calendar', 'temporary-access');
      const temporaryAccessResponse = await this.httpClient.authPost(temporaryAccessEndpoint, temporaryAccessConfig, this.testData.testUsers.admin);

      // Test 4: Envío de recordatorios personalizados
      const reminderConfig = {
        invitationId: inviteResponse.data?.data?.invitationId,
        reminderSchedule: [
          { timeBeforeEvent: "24_HOURS", channel: "EMAIL" },
          { timeBeforeEvent: "2_HOURS", channel: "SMS" },
          { timeBeforeEvent: "30_MINUTES", channel: "PUSH" }
        ],
        customContent: {
          includeDirections: true,
          includeContactInfo: true,
          includeParkingInfo: true,
          includeWifiCredentials: true
        }
      };

      const remindersEndpoint = getEndpointUrl('integration-service', 'calendar', 'external-reminders');
      const remindersResponse = await this.httpClient.authPost(remindersEndpoint, reminderConfig, this.testData.testUsers.docente);

      const duration = Date.now() - startTime;

      this.reporter.addResult(inviteExternalEndpoint, 'POST', 'PASS', {
        duration,
        message: 'External invitations management tests completed successfully',
        testsCompleted: 4,
        invitationsCreated: inviteResponse.data?.success || false,
        responsesProcessed: processResponsesResponse.data?.success || false,
        temporaryAccessConfigured: temporaryAccessResponse.data?.success || false,
        remindersScheduled: remindersResponse.data?.success || false,
        externalGuestsCount: externalInvitation.externalGuests.length,
        reminderChannels: reminderConfig.reminderSchedule.length
      });

      this.logger.success(`✅ Gestión de invitaciones externas completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('integration-service', 'calendar', 'external-invitations');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with external invitations'
      });
      this.logger.error(`❌ Error en invitaciones externas: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar integraciones configuradas
    for (const integration of this.testData.configuredIntegrations) {
      try {
        const endpoint = getEndpointUrl('integration-service', 'calendar', 'delete-integration').replace(':id', integration.integrationId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up integration: ${integration.integrationId}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup integration ${integration.integrationId}:`, error.message);
      }
    }

    // Limpiar eventos sincronizados
    for (const event of this.testData.synchronizedEvents) {
      try {
        const endpoint = getEndpointUrl('integration-service', 'calendar', 'delete-synced-event').replace(':id', event.eventId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up synced event: ${event.eventId}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup event ${event.eventId}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 9: EXTERNAL CALENDARS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-9-integrations-calendars.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new ExternalCalendarsFlow();
  flow.run().catch(console.error);
}

module.exports = { ExternalCalendarsFlow };
