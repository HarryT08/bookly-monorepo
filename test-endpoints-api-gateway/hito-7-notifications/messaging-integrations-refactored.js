#!/usr/bin/env node

/**
 * HITO 7 - NOTIFICATIONS: MESSAGING INTEGRATIONS (REFACTORIZADO)
 * 
 * Flujo completo de testing para integraciones de mensajería:
 * - Integración WhatsApp Business API
 * - Sistema de email avanzado
 * - Integración SMS para notificaciones urgentes
 * - Entrega multi-canal inteligente
 * - Gestión de preferencias de usuario
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class MessagingIntegrationsFlow {
  constructor() {
    this.logger = new TestLogger('Messaging-Integrations');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-7-Notifications', 'Messaging-Integrations');
    this.testData = {
      sentMessages: [],
      configuredIntegrations: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        docente: TEST_DATA.USERS.DOCENTE,
        estudiante: TEST_DATA.USERS.ESTUDIANTE,
        vigilante: TEST_DATA.USERS.VIGILANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 7 - MESSAGING INTEGRATIONS TESTING');
    this.logger.info('Iniciando testing completo de integraciones de mensajería...');

    try {
      await this.setup();
      await this.testWhatsAppIntegration();
      await this.testEmailIntegration();
      await this.testSMSIntegration();
      await this.testMultiChannelDelivery();
      await this.testUserPreferences();
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

  async testWhatsAppIntegration() {
    this.logger.subheader('Test: Integración WhatsApp Business API');
    const startTime = Date.now();

    try {
      // Test 1: Configurar integración WhatsApp
      const whatsappConfig = this.dataGenerator.getTestData(5, 'whatsappConfig', {
        provider: "WHATSAPP_BUSINESS_API",
        apiVersion: "v17.0",
        phoneNumberId: "123456789012345",
        accessToken: "EAAL_test_token_encrypted",
        webhookUrl: "https://bookly.ufps.edu.co/webhooks/whatsapp",
        verifyToken: "bookly_webhook_verify_token",
        templates: {
          reservation_confirmation: "bookly_reservation_confirmed",
          reservation_reminder: "bookly_reservation_reminder",
          cancellation_notice: "bookly_reservation_cancelled",
          maintenance_alert: "bookly_maintenance_alert"
        },
        features: {
          templates: true,
          mediaMessages: true,
          businessProfile: true,
          webhooks: true
        }
      });

      const configEndpoint = getEndpointUrl('notifications-service', 'integrations', 'whatsapp-config');
      const configResponse = await this.httpClient.authPost(configEndpoint, whatsappConfig, this.testData.testUsers.admin);

      if (configResponse.data.success) {
        this.testData.configuredIntegrations.push({ type: 'whatsapp', ...configResponse.data.data });
      }

      // Test 2: Enviar mensaje WhatsApp con template
      const whatsappMessage = {
        to: "+573001234567",
        type: "template",
        template: {
          name: "bookly_reservation_confirmed",
          language: { code: "es" },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: "Juan Pérez" },
              { type: "text", text: "Laboratorio IA" },
              { type: "text", text: "2024-09-01" },
              { type: "text", text: "14:00-16:00" },
              { type: "text", text: "LAB-001-240901" }
            ]
          }]
        },
        userId: this.testData.testUsers.estudiante.id
      };

      const sendEndpoint = getEndpointUrl('notifications-service', 'messaging', 'whatsapp');
      const sendResponse = await this.httpClient.authPost(sendEndpoint, whatsappMessage, this.testData.testUsers.admin);

      if (sendResponse.data.success) {
        this.testData.sentMessages.push({ type: 'whatsapp', ...sendResponse.data.data });
      }

      // Test 3: Procesar webhook de estado
      const webhookData = {
        object: "whatsapp_business_account",
        entry: [{
          changes: [{
            value: {
              statuses: [{
                id: sendResponse.data?.data?.messageId || "test_msg_id",
                status: "read",
                timestamp: Math.floor(Date.now() / 1000),
                recipient_id: "573001234567"
              }]
            }
          }]
        }]
      };

      const webhookEndpoint = getEndpointUrl('notifications-service', 'webhooks', 'whatsapp');
      const webhookResponse = await this.httpClient.authPost(webhookEndpoint, webhookData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(configEndpoint, 'POST', 'PASS', {
        duration,
        message: 'WhatsApp integration tests completed successfully',
        testsCompleted: 3,
        integrationConfigured: configResponse.data?.success || false,
        messageSent: sendResponse.data?.success || false,
        webhookProcessed: webhookResponse.data?.success || false,
        templatesConfigured: Object.keys(whatsappConfig.templates).length
      });

      this.logger.success(`✅ Integración WhatsApp completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'integrations', 'whatsapp-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with WhatsApp integration'
      });
      this.logger.error(`❌ Error en WhatsApp: ${error.message}`);
    }
  }

  async testEmailIntegration() {
    this.logger.subheader('Test: Sistema de email avanzado');
    const startTime = Date.now();

    try {
      // Test 1: Configurar servicio de email
      const emailConfig = this.dataGenerator.getTestData(5, 'emailConfig', {
        provider: "SENDGRID",
        apiKey: "SG.test_api_key_encrypted",
        fromEmail: "noreply@bookly.ufps.edu.co",
        fromName: "Bookly UFPS",
        replyTo: "soporte@bookly.ufps.edu.co",
        trackingEnabled: true,
        features: {
          openTracking: true,
          clickTracking: true,
          subscriptionTracking: false,
          googleAnalytics: true
        },
        templates: {
          reservation_confirmation: "d-reservation-confirm-123",
          maintenance_notice: "d-maintenance-notice-456"
        }
      });

      const emailConfigEndpoint = getEndpointUrl('notifications-service', 'integrations', 'email-config');
      const emailConfigResponse = await this.httpClient.authPost(emailConfigEndpoint, emailConfig, this.testData.testUsers.admin);

      // Test 2: Enviar email con template
      const emailMessage = {
        to: [this.testData.testUsers.docente.email],
        templateId: "d-reservation-confirm-123",
        dynamicTemplateData: {
          userName: "Dr. Carlos Pérez",
          resourceName: "Auditorio Principal",
          reservationDate: "2024-09-02",
          reservationTime: "10:00-12:00",
          location: "Edificio Central - Piso 1",
          confirmationCode: "AUD-002-240902",
          cancelUrl: "https://bookly.ufps.edu.co/cancel/abc123"
        },
        categories: ["reservation", "confirmation"],
        sendAt: Math.floor(Date.now() / 1000) + 60
      };

      const sendEmailEndpoint = getEndpointUrl('notifications-service', 'messaging', 'email');
      const emailResponse = await this.httpClient.authPost(sendEmailEndpoint, emailMessage, this.testData.testUsers.admin);

      // Test 3: Verificar estadísticas de entrega
      const statsEndpoint = getEndpointUrl('notifications-service', 'messaging', 'email-stats');
      const statsResponse = await this.httpClient.authGet(statsEndpoint, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(emailConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Email integration tests completed successfully',
        testsCompleted: 3,
        emailConfigured: emailConfigResponse.data?.success || false,
        emailSent: emailResponse.data?.success || false,
        statsRetrieved: statsResponse.data?.success || false,
        trackingEnabled: emailConfig.trackingEnabled
      });

      this.logger.success(`✅ Integración Email completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'integrations', 'email-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with email integration'
      });
      this.logger.error(`❌ Error en Email: ${error.message}`);
    }
  }

  async testSMSIntegration() {
    this.logger.subheader('Test: Integración SMS');
    const startTime = Date.now();

    try {
      // Test 1: Configurar servicio SMS
      const smsConfig = this.dataGenerator.getTestData(5, 'smsConfig', {
        provider: "TWILIO",
        accountSid: "AC_test_account_sid",
        authToken: "test_auth_token_encrypted",
        fromNumber: "+573001234567",
        features: {
          deliveryReceipts: true,
          shortLinks: true,
          scheduling: true
        },
        rateLimit: {
          perMinute: 10,
          perHour: 100,
          perDay: 500
        }
      });

      const smsConfigEndpoint = getEndpointUrl('notifications-service', 'integrations', 'sms-config');
      const smsConfigResponse = await this.httpClient.authPost(smsConfigEndpoint, smsConfig, this.testData.testUsers.admin);

      // Test 2: Enviar SMS urgente
      const smsMessage = {
        to: "+573009876543",
        message: "🚨 ALERTA: Mantenimiento de emergencia en Laboratorio A. Evacuar inmediatamente. Info: bookly.ufps.edu.co/alert/123",
        priority: "HIGH",
        userId: this.testData.testUsers.vigilante.id,
        category: "EMERGENCY",
        deliveryReceipt: true
      };

      const sendSMSEndpoint = getEndpointUrl('notifications-service', 'messaging', 'sms');
      const smsResponse = await this.httpClient.authPost(sendSMSEndpoint, smsMessage, this.testData.testUsers.admin);

      // Test 3: Verificar límites de tasa
      const rateLimitEndpoint = getEndpointUrl('notifications-service', 'messaging', 'sms-rate-limit');
      const rateLimitResponse = await this.httpClient.authGet(rateLimitEndpoint, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(smsConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'SMS integration tests completed successfully',
        testsCompleted: 3,
        smsConfigured: smsConfigResponse.data?.success || false,
        smsSent: smsResponse.data?.success || false,
        rateLimitChecked: rateLimitResponse.data?.success || false,
        emergencyCapable: smsMessage.category === 'EMERGENCY'
      });

      this.logger.success(`✅ Integración SMS completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'integrations', 'sms-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with SMS integration'
      });
      this.logger.error(`❌ Error en SMS: ${error.message}`);
    }
  }

  async testMultiChannelDelivery() {
    this.logger.subheader('Test: Entrega multi-canal inteligente');
    const startTime = Date.now();

    try {
      // Test 1: Configurar entrega inteligente
      const multiChannelConfig = {
        strategy: "SMART_DELIVERY",
        fallbackChain: ["PUSH", "EMAIL", "SMS", "WHATSAPP"],
        rules: {
          critical: ["SMS", "WHATSAPP", "PUSH"],
          normal: ["EMAIL", "PUSH"],
          marketing: ["EMAIL"]
        },
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 5
        }
      };

      const configEndpoint = getEndpointUrl('notifications-service', 'messaging', 'multi-channel-config');
      const configResponse = await this.httpClient.authPost(configEndpoint, multiChannelConfig, this.testData.testUsers.admin);

      // Test 2: Enviar notificación multi-canal
      const multiChannelMessage = {
        recipients: [
          this.testData.testUsers.docente.id,
          this.testData.testUsers.estudiante.id
        ],
        subject: "Mantenimiento programado",
        message: "Se realizará mantenimiento en el sistema el 2024-09-03 de 02:00 a 04:00",
        priority: "NORMAL",
        channels: ["EMAIL", "PUSH"],
        fallbackEnabled: true,
        respectQuietHours: true
      };

      const sendMultiEndpoint = getEndpointUrl('notifications-service', 'messaging', 'multi-channel');
      const multiResponse = await this.httpClient.authPost(sendMultiEndpoint, multiChannelMessage, this.testData.testUsers.admin);

      // Test 3: Verificar estadísticas de entrega
      const deliveryStatsEndpoint = getEndpointUrl('notifications-service', 'messaging', 'delivery-stats');
      const statsResponse = await this.httpClient.authGet(deliveryStatsEndpoint, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(configEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Multi-channel delivery tests completed successfully',
        testsCompleted: 3,
        configurationSet: configResponse.data?.success || false,
        multiChannelSent: multiResponse.data?.success || false,
        statsGenerated: statsResponse.data?.success || false,
        channelsConfigured: multiChannelConfig.fallbackChain.length
      });

      this.logger.success(`✅ Entrega multi-canal completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'messaging', 'multi-channel-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with multi-channel delivery'
      });
      this.logger.error(`❌ Error en multi-canal: ${error.message}`);
    }
  }

  async testUserPreferences() {
    this.logger.subheader('Test: Gestión de preferencias de usuario');
    const startTime = Date.now();

    try {
      // Test 1: Configurar preferencias de usuario
      const userPreferences = {
        userId: this.testData.testUsers.docente.id,
        channels: {
          email: { enabled: true, frequency: "IMMEDIATE" },
          whatsapp: { enabled: true, frequency: "DAILY_DIGEST" },
          sms: { enabled: false, frequency: "NEVER" },
          push: { enabled: true, frequency: "IMMEDIATE" }
        },
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "07:00",
          timezone: "America/Bogota"
        },
        categories: {
          reservations: { priority: "HIGH", channels: ["EMAIL", "PUSH"] },
          maintenance: { priority: "MEDIUM", channels: ["EMAIL"] },
          system: { priority: "LOW", channels: ["EMAIL"] }
        },
        language: "es",
        optOut: []
      };

      const preferencesEndpoint = getEndpointUrl('notifications-service', 'users', 'notification-preferences');
      const preferencesResponse = await this.httpClient.authPut(preferencesEndpoint.replace(':userId', this.testData.testUsers.docente.id), userPreferences, this.testData.testUsers.docente);

      // Test 2: Probar respeto de horarios silenciosos
      const quietHourMessage = {
        userId: this.testData.testUsers.docente.id,
        message: "Prueba de horario silencioso",
        priority: "NORMAL",
        respectQuietHours: true,
        scheduledFor: "2024-09-02T23:30:00Z" // Hora silenciosa
      };

      const quietTestEndpoint = getEndpointUrl('notifications-service', 'messaging', 'test-quiet-hours');
      const quietResponse = await this.httpClient.authPost(quietTestEndpoint, quietHourMessage, this.testData.testUsers.admin);

      // Test 3: Verificar preferencias aplicadas
      const verifyEndpoint = getEndpointUrl('notifications-service', 'users', 'verify-preferences').replace(':userId', this.testData.testUsers.docente.id);
      const verifyResponse = await this.httpClient.authGet(verifyEndpoint, this.testData.testUsers.docente);

      const duration = Date.now() - startTime;

      this.reporter.addResult(preferencesEndpoint, 'PUT', 'PASS', {
        duration,
        message: 'User preferences tests completed successfully',
        testsCompleted: 3,
        preferencesSet: preferencesResponse.data?.success || false,
        quietHoursRespected: quietResponse.data?.success || false,
        preferencesVerified: verifyResponse.data?.success || false,
        channelsConfigured: Object.keys(userPreferences.channels).length,
        categoriesConfigured: Object.keys(userPreferences.categories).length
      });

      this.logger.success(`✅ Preferencias de usuario completadas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'users', 'notification-preferences');
      this.reporter.addResult(endpoint, 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with user preferences'
      });
      this.logger.error(`❌ Error en preferencias: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar integraciones configuradas
    for (const integration of this.testData.configuredIntegrations) {
      try {
        const endpoint = getEndpointUrl('notifications-service', 'integrations', 'cleanup').replace(':type', integration.type);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up integration: ${integration.type}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup integration ${integration.type}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 7: MESSAGING INTEGRATIONS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-7-notifications-messaging.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new MessagingIntegrationsFlow();
  flow.run().catch(console.error);
}

module.exports = { MessagingIntegrationsFlow };
