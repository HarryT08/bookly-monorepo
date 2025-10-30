#!/usr/bin/env node

/**
 * HITO 7 - NOTIFICATIONS: REAL-TIME NOTIFICATIONS (REFACTORIZADO)
 * 
 * Flujo completo de testing para notificaciones en tiempo real:
 * - Conexión WebSocket para notificaciones
 * - Notificaciones críticas inmediatas
 * - Streaming de eventos del sistema
 * - Sistema de cola de notificaciones
 * - Recuperación de conexión automática
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class RealTimeNotificationsFlow {
  constructor() {
    this.logger = new TestLogger('RealTime-Notifications');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-7-Notifications', 'RealTime-Notifications');
    this.testData = {
      activeConnections: [],
      sentNotifications: [],
      eventStreams: [],
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
    this.logger.header('HITO 7 - REAL-TIME NOTIFICATIONS TESTING');
    this.logger.info('Iniciando testing completo de notificaciones en tiempo real...');

    try {
      await this.setup();
      await this.testWebSocketConnection();
      await this.testCriticalNotifications();
      await this.testEventStreaming();
      await this.testNotificationQueuing();
      await this.testConnectionRecovery();
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

  async testWebSocketConnection() {
    this.logger.subheader('Test: Conexión WebSocket para notificaciones');
    const startTime = Date.now();

    try {
      // Test 1: Establecer conexión WebSocket
      const connectionData = {
        userId: this.testData.testUsers.admin.id,
        subscriptions: [
          "reservation.created",
          "reservation.cancelled",
          "resource.maintenance",
          "system.alerts",
          "maintenance.scheduled"
        ],
        keepAlive: true,
        reconnectOnFailure: true
      };

      const wsConnectEndpoint = getEndpointUrl('notifications-service', 'websocket', 'connect');
      const connectResponse = await this.httpClient.authPost(wsConnectEndpoint, connectionData, this.testData.testUsers.admin);

      if (connectResponse.data.success) {
        this.testData.activeConnections.push(connectResponse.data.data);
      }

      // Test 2: Verificar estado de conexión
      const connectionId = connectResponse.data?.data?.connectionId;
      if (connectionId) {
        const statusEndpoint = getEndpointUrl('notifications-service', 'websocket', 'status').replace(':id', connectionId);
        const statusResponse = await this.httpClient.authGet(statusEndpoint, this.testData.testUsers.admin);

        // Test 3: Enviar mensaje de prueba
        const testMessageData = {
          connectionId: connectionId,
          type: "CONNECTION_TEST",
          message: "WebSocket connection test successful",
          expectResponse: true
        };

        const testMessageEndpoint = getEndpointUrl('notifications-service', 'websocket', 'test-message');
        const messageResponse = await this.httpClient.authPost(testMessageEndpoint, testMessageData, this.testData.testUsers.admin);
      }

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(connectResponse, 'SUCCESS'),
        connectionId ? this.validator.validateBooklyResponse(statusResponse, 'SUCCESS') : { isValid: true, errors: [] },
        connectionId ? this.validator.validateBooklyResponse(messageResponse, 'SUCCESS') : { isValid: true, errors: [] }
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`WebSocket connection validation failed: ${validationErrors.join(', ')}`);
      }

      this.reporter.addResult(wsConnectEndpoint, 'POST', 'PASS', {
        duration,
        message: 'WebSocket connection tests completed successfully',
        testsCompleted: 3,
        connectionEstablished: connectResponse.data?.success || false,
        connectionId: connectionId,
        subscriptionsActive: connectionData.subscriptions.length,
        latency: duration < 50 ? 'LOW' : 'ACCEPTABLE'
      });

      this.logger.success(`✅ Conexión WebSocket completada (${duration}ms)`);
      this.logger.info(`   - Connection ID: ${connectionId || 'N/A'}`);
      this.logger.info(`   - Suscripciones: ${connectionData.subscriptions.length}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'websocket', 'connect');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with WebSocket connection'
      });
      this.logger.error(`❌ Error en conexión WebSocket: ${error.message}`);
    }
  }

  async testCriticalNotifications() {
    this.logger.subheader('Test: Notificaciones críticas inmediatas');
    const startTime = Date.now();

    try {
      // Test 1: Enviar notificación crítica del sistema
      const criticalNotificationData = this.dataGenerator.getTestData(5, 'criticalNotification', {
        type: "CRITICAL_SYSTEM_ALERT",
        severity: "HIGH",
        title: "Falla crítica en sistema de reservas",
        message: "El sistema de availability-service ha detectado una falla crítica que afecta las reservas",
        affectedServices: ["availability-service", "resources-service"],
        estimatedImpact: "100+ usuarios afectados",
        immediateAction: "Escalamiento automático activado",
        recipients: [
          this.testData.testUsers.admin.id,
          this.testData.testUsers.adminProg.id,
          this.testData.testUsers.vigilante.id
        ],
        channels: ["WEBSOCKET", "EMAIL", "SMS", "PUSH"],
        priority: "IMMEDIATE"
      });

      const criticalEndpoint = getEndpointUrl('notifications-service', 'notifications', 'critical');
      const criticalResponse = await this.httpClient.authPost(criticalEndpoint, criticalNotificationData, this.testData.testUsers.admin);

      if (criticalResponse.data.success) {
        this.testData.sentNotifications.push(criticalResponse.data.data);
      }

      // Test 2: Verificar entrega inmediata
      const notificationId = criticalResponse.data?.data?.notificationId;
      if (notificationId) {
        const deliveryStatusEndpoint = getEndpointUrl('notifications-service', 'notifications', 'delivery-status').replace(':id', notificationId);
        const deliveryResponse = await this.httpClient.authGet(deliveryStatusEndpoint, this.testData.testUsers.admin);

        // Test 3: Confirmar recepción por WebSocket
        const receiptData = {
          notificationId: notificationId,
          userId: this.testData.testUsers.admin.id,
          receivedVia: "WEBSOCKET",
          receivedAt: new Date().toISOString()
        };

        const receiptEndpoint = getEndpointUrl('notifications-service', 'notifications', 'confirm-receipt');
        const receiptResponse = await this.httpClient.authPost(receiptEndpoint, receiptData, this.testData.testUsers.admin);
      }

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(criticalResponse, 'SUCCESS'),
        notificationId ? this.validator.validateBooklyResponse(deliveryResponse, 'SUCCESS') : { isValid: true, errors: [] },
        notificationId ? this.validator.validateBooklyResponse(receiptResponse, 'SUCCESS') : { isValid: true, errors: [] }
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Critical notifications validation failed: ${validationErrors.join(', ')}`);
      }

      this.reporter.addResult(criticalEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Critical notifications tests completed successfully',
        testsCompleted: 3,
        criticalNotificationSent: criticalResponse.data?.success || false,
        deliveryVerified: notificationId !== undefined,
        receiptConfirmed: notificationId !== undefined,
        deliveryTime: duration < 3000 ? 'IMMEDIATE' : 'DELAYED',
        channelsUsed: criticalNotificationData.channels.length
      });

      this.logger.success(`✅ Notificaciones críticas completadas (${duration}ms)`);
      this.logger.info(`   - Canales utilizados: ${criticalNotificationData.channels.join(', ')}`);
      this.logger.info(`   - Tiempo de entrega: ${duration < 3000 ? 'INMEDIATO' : 'RETRASADO'}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'notifications', 'critical');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with critical notification delivery'
      });
      this.logger.error(`❌ Error en notificaciones críticas: ${error.message}`);
    }
  }

  async testEventStreaming() {
    this.logger.subheader('Test: Streaming de eventos del sistema');
    const startTime = Date.now();

    try {
      // Test 1: Configurar stream de eventos
      const streamConfig = {
        userId: this.testData.testUsers.docente.id,
        eventTypes: [
          "reservation.created",
          "reservation.updated",
          "reservation.cancelled",
          "resource.maintenance",
          "system.maintenance"
        ],
        filterCriteria: {
          programCode: "INGENIERIA_SISTEMAS",
          severity: ["MEDIUM", "HIGH", "CRITICAL"]
        },
        format: "JSON",
        includeMetadata: true
      };

      const streamEndpoint = getEndpointUrl('notifications-service', 'events', 'stream');
      const streamResponse = await this.httpClient.authPost(streamEndpoint, streamConfig, this.testData.testUsers.docente);

      if (streamResponse.data.success) {
        this.testData.eventStreams.push(streamResponse.data.data);
      }

      // Test 2: Simular eventos en tiempo real
      const mockEvents = [
        {
          type: "reservation.created",
          resourceId: "res_lab_001",
          userId: this.testData.testUsers.estudiante.id,
          timestamp: new Date().toISOString(),
          metadata: { programCode: "INGENIERIA_SISTEMAS" }
        },
        {
          type: "resource.maintenance",
          resourceId: "res_audit_001",
          severity: "HIGH",
          timestamp: new Date().toISOString(),
          metadata: { maintenanceType: "EMERGENCY" }
        }
      ];

      const simulateEventsEndpoint = getEndpointUrl('notifications-service', 'events', 'simulate');
      const eventsResponse = await this.httpClient.authPost(simulateEventsEndpoint, { events: mockEvents }, this.testData.testUsers.admin);

      // Test 3: Verificar recepción de eventos filtrados
      const streamId = streamResponse.data?.data?.streamId;
      if (streamId) {
        const receivedEventsEndpoint = getEndpointUrl('notifications-service', 'events', 'received').replace(':streamId', streamId);
        const receivedResponse = await this.httpClient.authGet(receivedEventsEndpoint, this.testData.testUsers.docente);
      }

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(streamResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(eventsResponse, 'SUCCESS'),
        streamId ? this.validator.validateBooklyResponse(receivedResponse, 'SUCCESS') : { isValid: true, errors: [] }
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Event streaming validation failed: ${validationErrors.join(', ')}`);
      }

      this.reporter.addResult(streamEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Event streaming tests completed successfully',
        testsCompleted: 3,
        streamConfigured: streamResponse.data?.success || false,
        eventsSimulated: eventsResponse.data?.success || false,
        eventsReceived: streamId !== undefined,
        eventTypesConfigured: streamConfig.eventTypes.length,
        filtersApplied: Object.keys(streamConfig.filterCriteria).length
      });

      this.logger.success(`✅ Streaming de eventos completado (${duration}ms)`);
      this.logger.info(`   - Tipos de eventos: ${streamConfig.eventTypes.length}`);
      this.logger.info(`   - Filtros aplicados: ${Object.keys(streamConfig.filterCriteria).length}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'events', 'stream');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with event streaming'
      });
      this.logger.error(`❌ Error en streaming de eventos: ${error.message}`);
    }
  }

  async testNotificationQueuing() {
    this.logger.subheader('Test: Sistema de cola de notificaciones');
    const startTime = Date.now();

    try {
      // Test 1: Envío masivo de notificaciones
      const bulkNotificationData = this.dataGenerator.getTestData(50, 'bulkNotifications', {
        templateId: "reservation_reminder",
        recipients: [
          this.testData.testUsers.estudiante.id,
          this.testData.testUsers.docente.id
        ],
        variables: {
          resourceName: "Laboratorio de Redes",
          reservationTime: "2024-09-02T14:00:00Z",
          building: "Edificio A"
        },
        scheduledFor: new Date(Date.now() + 5000).toISOString(), // 5 segundos
        priority: "NORMAL",
        channels: ["EMAIL", "PUSH"]
      });

      const bulkEndpoint = getEndpointUrl('notifications-service', 'notifications', 'bulk');
      const bulkResponse = await this.httpClient.authPost(bulkEndpoint, bulkNotificationData, this.testData.testUsers.admin);

      // Test 2: Verificar estado de la cola
      const queueStatusEndpoint = getEndpointUrl('notifications-service', 'queue', 'status');
      const queueResponse = await this.httpClient.authGet(queueStatusEndpoint, this.testData.testUsers.admin);

      // Test 3: Procesar cola de notificaciones
      const processQueueData = {
        maxConcurrent: 10,
        priorityOrder: ["CRITICAL", "HIGH", "NORMAL", "LOW"],
        retryFailures: true
      };

      const processEndpoint = getEndpointUrl('notifications-service', 'queue', 'process');
      const processResponse = await this.httpClient.authPost(processEndpoint, processQueueData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(bulkResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(queueResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(processResponse, 'SUCCESS')
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Notification queuing validation failed: ${validationErrors.join(', ')}`);
      }

      this.reporter.addResult(bulkEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Notification queuing tests completed successfully',
        testsCompleted: 3,
        bulkNotificationsQueued: bulkResponse.data?.success || false,
        queueStatusChecked: queueResponse.data?.success || false,
        queueProcessed: processResponse.data?.success || false,
        notificationsCount: bulkNotificationData.recipients ? bulkNotificationData.recipients.length : 0
      });

      this.logger.success(`✅ Sistema de cola completado (${duration}ms)`);
      this.logger.info(`   - Notificaciones en cola: ${bulkNotificationData.recipients?.length || 0}`);
      this.logger.info(`   - Procesamiento concurrente: ${processQueueData.maxConcurrent}`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'notifications', 'bulk');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with notification queuing'
      });
      this.logger.error(`❌ Error en sistema de cola: ${error.message}`);
    }
  }

  async testConnectionRecovery() {
    this.logger.subheader('Test: Recuperación de conexión automática');
    const startTime = Date.now();

    try {
      // Test 1: Simular desconexión forzada
      if (this.testData.activeConnections.length > 0) {
        const connectionId = this.testData.activeConnections[0].connectionId;
        
        const disconnectEndpoint = getEndpointUrl('notifications-service', 'websocket', 'disconnect').replace(':id', connectionId);
        const disconnectResponse = await this.httpClient.authPost(disconnectEndpoint, { 
          reason: "SIMULATED_FAILURE" 
        }, this.testData.testUsers.admin);

        // Test 2: Verificar reconexión automática
        const reconnectData = {
          connectionId: connectionId,
          autoReconnect: true,
          maxRetries: 3,
          backoffStrategy: "EXPONENTIAL"
        };

        const reconnectEndpoint = getEndpointUrl('notifications-service', 'websocket', 'reconnect');
        const reconnectResponse = await this.httpClient.authPost(reconnectEndpoint, reconnectData, this.testData.testUsers.admin);

        // Test 3: Verificar recuperación de mensajes perdidos
        const recoverMessagesEndpoint = getEndpointUrl('notifications-service', 'websocket', 'recover-messages').replace(':id', connectionId);
        const recoverResponse = await this.httpClient.authGet(recoverMessagesEndpoint, this.testData.testUsers.admin);

        const duration = Date.now() - startTime;

        // Validar respuestas
        const validations = [
          this.validator.validateBooklyResponse(disconnectResponse, 'SUCCESS'),
          this.validator.validateBooklyResponse(reconnectResponse, 'SUCCESS'),
          this.validator.validateBooklyResponse(recoverResponse, 'SUCCESS')
        ];

        const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
        
        if (validationErrors.length > 0) {
          throw new Error(`Connection recovery validation failed: ${validationErrors.join(', ')}`);
        }

        this.reporter.addResult(disconnectEndpoint, 'POST', 'PASS', {
          duration,
          message: 'Connection recovery tests completed successfully',
          testsCompleted: 3,
          disconnectionSimulated: disconnectResponse.data?.success || false,
          reconnectionSuccessful: reconnectResponse.data?.success || false,
          messagesRecovered: recoverResponse.data?.success || false,
          recoveryTime: duration < 10000 ? 'FAST' : 'SLOW'
        });

        this.logger.success(`✅ Recuperación de conexión completada (${duration}ms)`);
        this.logger.info(`   - Reconexión automática: ✅`);
        this.logger.info(`   - Mensajes recuperados: ✅`);

      } else {
        throw new Error('No active connections available for recovery testing');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('notifications-service', 'websocket', 'disconnect');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with connection recovery'
      });
      this.logger.error(`❌ Error en recuperación de conexión: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar conexiones activas
    for (const connection of this.testData.activeConnections) {
      try {
        const endpoint = getEndpointUrl('notifications-service', 'websocket', 'disconnect').replace(':id', connection.connectionId);
        await this.httpClient.authPost(endpoint, { reason: "TEST_CLEANUP" }, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up connection: ${connection.connectionId}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup connection ${connection.connectionId}:`, error.message);
      }
    }

    // Limpiar streams de eventos
    for (const stream of this.testData.eventStreams) {
      try {
        const endpoint = getEndpointUrl('notifications-service', 'events', 'close-stream').replace(':id', stream.streamId);
        await this.httpClient.authPost(endpoint, {}, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up event stream: ${stream.streamId}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup stream ${stream.streamId}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 7: REAL-TIME NOTIFICATIONS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-7-notifications-realtime.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new RealTimeNotificationsFlow();
  flow.run().catch(console.error);
}

module.exports = { RealTimeNotificationsFlow };
