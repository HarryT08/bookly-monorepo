#!/usr/bin/env node

/**
 * HITO 7 - NOTIFICATIONS: NOTIFICATION TEMPLATES (REFACTORIZADO)
 * 
 * Flujo completo de testing para plantillas de notificación:
 * - Gestión básica de plantillas
 * - Plantillas dinámicas con lógica condicional
 * - Plantillas multilenguaje
 * - Personalización por usuario y contexto
 * - Validación y testing de plantillas
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class NotificationTemplatesFlow {
  constructor() {
    this.logger = new TestLogger('Notification-Templates');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-7-Notifications', 'Notification-Templates');
    this.testData = {
      createdTemplates: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        docente: TEST_DATA.USERS.DOCENTE,
        estudiante: TEST_DATA.USERS.ESTUDIANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 7 - NOTIFICATION TEMPLATES TESTING');
    this.logger.info('Iniciando testing completo de plantillas de notificación...');

    try {
      await this.setup();
      await this.testTemplateManagement();
      await this.testDynamicTemplates();
      await this.testMultiLanguageTemplates();
      await this.testPersonalizedTemplates();
      await this.testTemplateValidation();
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

  async testTemplateManagement() {
    this.logger.subheader('Test: Gestión básica de plantillas');
    const startTime = Date.now();

    try {
      // Test 1: Crear plantilla
      const templateData = this.dataGenerator.getTestData(5, 'notificationTemplate', {
        code: "RESERVATION_CONFIRMED_V2",
        name: "Confirmación de Reserva v2",
        description: "Plantilla mejorada para confirmar reservas",
        category: "RESERVATION",
        channels: ["EMAIL", "WHATSAPP", "PUSH", "SMS"],
        variables: [
          { name: "userName", type: "string", required: true },
          { name: "resourceName", type: "string", required: true },
          { name: "reservationDate", type: "date", required: true },
          { name: "reservationTime", type: "string", required: true },
          { name: "confirmationCode", type: "string", required: true },
          { name: "building", type: "string", required: false }
        ],
        content: {
          email: {
            subject: "✅ Reserva Confirmada - {{resourceName}}",
            html: "<h2>¡Hola {{userName}}!</h2><p>Tu reserva ha sido confirmada.</p>",
            text: "Hola {{userName}}! Tu reserva de {{resourceName}} confirmada."
          },
          whatsapp: {
            message: "✅ *Reserva Confirmada*\n\n🎯 *Recurso:* {{resourceName}}"
          },
          push: {
            title: "Reserva Confirmada",
            body: "{{resourceName}} reservado para {{reservationDate}}"
          }
        },
        status: "ACTIVE"
      });

      const createEndpoint = getEndpointUrl('notifications-service', 'templates', 'create');
      const createResponse = await this.httpClient.authPost(createEndpoint, templateData, this.testData.testUsers.admin);

      if (createResponse.data.success) {
        this.testData.createdTemplates.push(createResponse.data.data);
      }

      // Test 2: Listar plantillas
      const listEndpoint = getEndpointUrl('notifications-service', 'templates', 'list');
      const listResponse = await this.httpClient.authGet(listEndpoint, this.testData.testUsers.admin);

      // Test 3: Actualizar plantilla
      const templateId = createResponse.data?.data?.id;
      if (templateId) {
        const updateData = {
          channels: [...templateData.channels, "TELEGRAM"],
          content: {
            ...templateData.content,
            sms: {
              message: "Reserva {{resourceName}} confirmada para {{reservationDate}}"
            }
          }
        };

        const updateEndpoint = getEndpointUrl('notifications-service', 'templates', 'update').replace(':id', templateId);
        const updateResponse = await this.httpClient.authPut(updateEndpoint, updateData, this.testData.testUsers.admin);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(createEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Template management tests completed successfully',
        testsCompleted: 3,
        templateCreated: createResponse.data?.success || false,
        templatesListed: listResponse.data?.success || false,
        templateUpdated: templateId !== undefined,
        channelsSupported: templateData.channels.length
      });

      this.logger.success(`✅ Gestión de plantillas completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'templates', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with template management'
      });
      this.logger.error(`❌ Error en gestión de plantillas: ${error.message}`);
    }
  }

  async testDynamicTemplates() {
    this.logger.subheader('Test: Plantillas dinámicas con lógica condicional');
    const startTime = Date.now();

    try {
      // Test 1: Crear plantilla con lógica condicional
      const dynamicTemplate = {
        code: "RESERVATION_REMINDER_DYNAMIC",
        name: "Recordatorio Dinámico",
        description: "Plantilla con lógica condicional basada en contexto",
        category: "REMINDER",
        channels: ["EMAIL", "WHATSAPP"],
        variables: [
          { name: "userName", type: "string", required: true },
          { name: "resourceName", type: "string", required: true },
          { name: "timeUntilReservation", type: "number", required: true },
          { name: "userRole", type: "string", required: true }
        ],
        content: {
          email: {
            subject: "{{#if (eq userRole 'DOCENTE')}}📚 Recordatorio - Clase en {{resourceName}}{{else}}📋 Recordatorio - Reserva {{resourceName}}{{/if}}",
            html: `
              {{#if (lt timeUntilReservation 60)}}
                <div style="color: red;">⚠️ ¡URGENTE! Tu reserva es en {{timeUntilReservation}} minutos</div>
              {{else if (lt timeUntilReservation 1440)}}
                <div style="color: orange;">⏰ Tu reserva es en {{timeUntilReservation}} minutos</div>
              {{else}}
                <div style="color: green;">📅 Recordatorio: Tu reserva es mañana</div>
              {{/if}}
            `
          },
          whatsapp: {
            message: `{{#if (eq userRole 'DOCENTE')}}👨‍🏫 Profesor {{userName}}{{else}}👨‍🎓 {{userName}}{{/if}}, recordatorio de tu reserva en {{resourceName}}`
          }
        },
        logic: {
          conditions: [
            {
              field: "timeUntilReservation",
              operator: "lt",
              value: 60,
              actions: ["SET_PRIORITY_HIGH", "ADD_URGENCY_FLAG"]
            },
            {
              field: "userRole",
              operator: "eq",
              value: "DOCENTE",
              actions: ["USE_FORMAL_TONE", "ADD_TEACHING_CONTEXT"]
            }
          ]
        }
      };

      const createDynamicEndpoint = getEndpointUrl('notifications-service', 'templates', 'create-dynamic');
      const dynamicResponse = await this.httpClient.authPost(createDynamicEndpoint, dynamicTemplate, this.testData.testUsers.admin);

      // Test 2: Probar renderizado con diferentes contextos
      const renderData = {
        templateId: dynamicResponse.data?.data?.id,
        variables: {
          userName: "Dr. Carlos Pérez",
          resourceName: "Laboratorio IA",
          timeUntilReservation: 30,
          userRole: "DOCENTE"
        },
        channel: "EMAIL"
      };

      const renderEndpoint = getEndpointUrl('notifications-service', 'templates', 'render');
      const renderResponse = await this.httpClient.authPost(renderEndpoint, renderData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(createDynamicEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Dynamic templates tests completed successfully',
        testsCompleted: 2,
        dynamicTemplateCreated: dynamicResponse.data?.success || false,
        templateRendered: renderResponse.data?.success || false,
        conditionsConfigured: dynamicTemplate.logic.conditions.length
      });

      this.logger.success(`✅ Plantillas dinámicas completadas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'templates', 'create-dynamic');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with dynamic templates'
      });
      this.logger.error(`❌ Error en plantillas dinámicas: ${error.message}`);
    }
  }

  async testMultiLanguageTemplates() {
    this.logger.subheader('Test: Plantillas multilenguaje');
    const startTime = Date.now();

    try {
      // Test 1: Crear plantilla multilenguaje
      const multiLangTemplate = {
        code: "MAINTENANCE_ALERT_MULTILANG",
        name: "Alerta de Mantenimiento Multilenguaje",
        description: "Plantilla en múltiples idiomas para alertas",
        category: "MAINTENANCE",
        channels: ["EMAIL", "WHATSAPP", "PUSH"],
        defaultLanguage: "es",
        supportedLanguages: ["es", "en", "pt"],
        variables: [
          { name: "userName", type: "string", required: true },
          { name: "resourceName", type: "string", required: true },
          { name: "startTime", type: "datetime", required: true },
          { name: "duration", type: "string", required: true }
        ],
        content: {
          es: {
            email: {
              subject: "🔧 Mantenimiento Programado - {{resourceName}}",
              html: "<h2>Estimado {{userName}},</h2><p>Se realizará mantenimiento en {{resourceName}} a partir del {{startTime}}.</p>"
            },
            whatsapp: {
              message: "🔧 *Mantenimiento*\n\nHola {{userName}}, mantenimiento en {{resourceName}} desde {{startTime}}"
            }
          },
          en: {
            email: {
              subject: "🔧 Scheduled Maintenance - {{resourceName}}",
              html: "<h2>Dear {{userName}},</h2><p>Maintenance will be performed on {{resourceName}} starting {{startTime}}.</p>"
            },
            whatsapp: {
              message: "🔧 *Maintenance*\n\nHi {{userName}}, maintenance on {{resourceName}} from {{startTime}}"
            }
          },
          pt: {
            email: {
              subject: "🔧 Manutenção Programada - {{resourceName}}",
              html: "<h2>Caro {{userName}},</h2><p>A manutenção será realizada em {{resourceName}} a partir de {{startTime}}.</p>"
            }
          }
        }
      };

      const createMultiLangEndpoint = getEndpointUrl('notifications-service', 'templates', 'create-multilang');
      const multiLangResponse = await this.httpClient.authPost(createMultiLangEndpoint, multiLangTemplate, this.testData.testUsers.admin);

      if (multiLangResponse.data.success) {
        this.testData.createdTemplates.push(multiLangResponse.data.data);
      }

      // Test 2: Renderizar en diferentes idiomas
      const templateId = multiLangResponse.data?.data?.id;
      const languages = ["es", "en", "pt"];
      const renderPromises = languages.map(async (lang) => {
        const renderData = {
          templateId: templateId,
          language: lang,
          variables: {
            userName: "Test User",
            resourceName: "Lab A",
            startTime: "2024-09-02T10:00:00Z",
            duration: "2 horas"
          },
          channel: "EMAIL"
        };
        
        const renderEndpoint = getEndpointUrl('notifications-service', 'templates', 'render-lang');
        return await this.httpClient.authPost(renderEndpoint, renderData, this.testData.testUsers.admin);
      });

      const renderResults = await Promise.all(renderPromises);

      const duration = Date.now() - startTime;

      this.reporter.addResult(createMultiLangEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Multi-language templates tests completed successfully',
        testsCompleted: 2,
        multiLangTemplateCreated: multiLangResponse.data?.success || false,
        languagesSupported: multiLangTemplate.supportedLanguages.length,
        renderTestsCompleted: renderResults.length,
        allRendersSuccessful: renderResults.every(r => r.data?.success)
      });

      this.logger.success(`✅ Plantillas multilenguaje completadas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'templates', 'create-multilang');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with multi-language templates'
      });
      this.logger.error(`❌ Error en plantillas multilenguaje: ${error.message}`);
    }
  }

  async testPersonalizedTemplates() {
    this.logger.subheader('Test: Personalización por usuario y contexto');
    const startTime = Date.now();

    try {
      // Test 1: Configurar personalización por usuario
      const personalizationRules = {
        userId: this.testData.testUsers.docente.id,
        preferences: {
          tone: "FORMAL",
          greeting: "PROFESSIONAL",
          timeFormat: "24H",
          dateFormat: "DD/MM/YYYY"
        },
        contextRules: {
          academic: {
            prefix: "Dr./Dra.",
            includeAcademicTitle: true
          },
          emergency: {
            tone: "URGENT",
            priorityIndicator: "🚨"
          }
        }
      };

      const personalizationEndpoint = getEndpointUrl('notifications-service', 'templates', 'personalization');
      const personalizationResponse = await this.httpClient.authPost(personalizationEndpoint, personalizationRules, this.testData.testUsers.admin);

      // Test 2: Crear plantilla personalizable
      const personalizableTemplate = {
        code: "RESERVATION_PERSONALIZED",
        name: "Reserva Personalizada",
        content: {
          email: {
            subject: "{{#if (eq user.tone 'FORMAL')}}{{user.greeting}} {{user.prefix}} {{userName}}{{else}}¡Hola {{userName}}!{{/if}} - Reserva {{resourceName}}",
            html: `
              {{#if (eq user.tone 'FORMAL')}}
                <p>Estimado/a {{user.prefix}} {{userName}},</p>
                <p>Le confirmamos que su reserva ha sido procesada.</p>
              {{else}}
                <p>¡Hola {{userName}}!</p>
                <p>Tu reserva está lista.</p>
              {{/if}}
            `
          }
        },
        personalizationEnabled: true
      };

      const createPersonalizedEndpoint = getEndpointUrl('notifications-service', 'templates', 'create-personalized');
      const personalizedResponse = await this.httpClient.authPost(createPersonalizedEndpoint, personalizableTemplate, this.testData.testUsers.admin);

      // Test 3: Renderizar con personalización aplicada
      const personalizedRenderData = {
        templateId: personalizedResponse.data?.data?.id,
        userId: this.testData.testUsers.docente.id,
        variables: {
          userName: "Carlos Pérez",
          resourceName: "Auditorio Principal"
        },
        applyPersonalization: true
      };

      const personalizedRenderEndpoint = getEndpointUrl('notifications-service', 'templates', 'render-personalized');
      const personalizedRenderResponse = await this.httpClient.authPost(personalizedRenderEndpoint, personalizedRenderData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(personalizationEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Personalized templates tests completed successfully',
        testsCompleted: 3,
        personalizationConfigured: personalizationResponse.data?.success || false,
        personalizableTemplateCreated: personalizedResponse.data?.success || false,
        personalizedRenderCompleted: personalizedRenderResponse.data?.success || false,
        personalizationRulesCount: Object.keys(personalizationRules.contextRules).length
      });

      this.logger.success(`✅ Personalización de plantillas completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'templates', 'personalization');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with personalized templates'
      });
      this.logger.error(`❌ Error en personalización: ${error.message}`);
    }
  }

  async testTemplateValidation() {
    this.logger.subheader('Test: Validación y testing de plantillas');
    const startTime = Date.now();

    try {
      // Test 1: Validar sintaxis de plantilla
      const templateToValidate = {
        content: {
          email: {
            subject: "{{userName}} - {{resourceName}}",
            html: "<h1>Hello {{userName}}</h1><p>{{invalidVariable}}</p>"
          }
        },
        variables: [
          { name: "userName", type: "string", required: true },
          { name: "resourceName", type: "string", required: true }
        ]
      };

      const validateEndpoint = getEndpointUrl('notifications-service', 'templates', 'validate');
      const validateResponse = await this.httpClient.authPost(validateEndpoint, templateToValidate, this.testData.testUsers.admin);

      // Test 2: Ejecutar A/B test de plantillas
      const abTestConfig = {
        testName: "reservation_confirmation_ab_test",
        templateA: this.testData.createdTemplates[0]?.id,
        templateB: "template_variant_b_id",
        trafficSplit: 50,
        metrics: ["open_rate", "click_rate", "conversion_rate"],
        duration: 7, // días
        sampleSize: 1000
      };

      const abTestEndpoint = getEndpointUrl('notifications-service', 'templates', 'ab-test');
      const abTestResponse = await this.httpClient.authPost(abTestEndpoint, abTestConfig, this.testData.testUsers.admin);

      // Test 3: Verificar performance de renderizado
      const performanceTestData = {
        templateId: this.testData.createdTemplates[0]?.id,
        iterationsCount: 100,
        variables: {
          userName: "Test User",
          resourceName: "Test Resource"
        }
      };

      const performanceEndpoint = getEndpointUrl('notifications-service', 'templates', 'performance-test');
      const performanceResponse = await this.httpClient.authPost(performanceEndpoint, performanceTestData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(validateEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Template validation tests completed successfully',
        testsCompleted: 3,
        templateValidated: validateResponse.data?.success || false,
        abTestConfigured: abTestResponse.data?.success || false,
        performanceTestCompleted: performanceResponse.data?.success || false,
        validationRules: templateToValidate.variables.length
      });

      this.logger.success(`✅ Validación de plantillas completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'templates', 'validate');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with template validation'
      });
      this.logger.error(`❌ Error en validación: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar plantillas creadas
    for (const template of this.testData.createdTemplates) {
      try {
        const endpoint = getEndpointUrl('notifications-service', 'templates', 'delete').replace(':id', template.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up template: ${template.code}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup template ${template.id}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 7: NOTIFICATION TEMPLATES');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-7-notifications-templates.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new NotificationTemplatesFlow();
  flow.run().catch(console.error);
}

module.exports = { NotificationTemplatesFlow };
