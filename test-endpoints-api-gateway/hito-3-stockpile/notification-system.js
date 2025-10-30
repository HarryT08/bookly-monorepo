#!/usr/bin/env node

/**
 * Hito 3 - Stockpile Core: Notification System Tests
 * Tests para CRUD de plantillas de notificación y envío automatizado
 */

const { httpClient } = require('../shared/http-client');
const { logger } = require('../shared/logger');
const { CONFIG } = require('../shared/config');
const { TestReporter } = require('../shared/test-reporter');

const STOCKPILE_BASE_URL = `${CONFIG.SERVICES.STOCKPILE}/stockpile`;

const TEST_USERS = {
  admin: { email: 'admin@ufps.edu.co', password: 'Admin123!' },
  coordinator: { email: 'coord.sistemas@ufps.edu.co', password: 'Coord123!' },
  teacher: { email: 'docente@ufps.edu.co', password: 'Teacher123!' },
  student: { email: 'estudiante@ufps.edu.co', password: 'Student123!' }
};

let testData = {
  notificationTemplates: [],
  sentNotifications: [],
  subscriptions: []
};

async function testNotificationSystem() {
  logger.info('🚀 Iniciando Hito 3 - Stockpile Core: Notification System Tests');
  
  const startTime = Date.now();
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: [],
    performance: {},
    coverage: []
  };

  try {
    await authenticateUsers();
    
    await testCreateNotificationTemplate(results);
    await testListNotificationTemplates(results);
    await testUpdateNotificationTemplate(results);
    await testSendSingleNotification(results);
    await testSendBulkNotifications(results);
    await testNotificationChannels(results);
    await testScheduleNotifications(results);
    await testNotificationTracking(results);
    await testUserSubscriptions(results);
    await testNotificationPreferences(results);
    
    await cleanupTestData(results);

  } catch (error) {
    logger.error('❌ Error general en notification system:', error.message);
    results.errors.push({ test: 'general', error: error.message });
  }

  const endTime = Date.now();
  results.executionTime = endTime - startTime;
  results.successRate = results.totalTests > 0 ? (results.passed / results.totalTests * 100).toFixed(2) : 0;

  await generateTestReport(results);
  
  logger.info(`✅ Notification System Tests completados: ${results.passed}/${results.totalTests} exitosos (${results.successRate}%)`);
  
  return results;
}

async function authenticateUsers() {
  logger.info('🔐 Autenticando usuarios de prueba...');
  
  for (const [role, credentials] of Object.entries(TEST_USERS)) {
    try {
      await httpClient.authenticate(credentials.email, credentials.password);
      logger.info(`✅ Usuario ${role} autenticado`);
    } catch (error) {
      logger.warn(`⚠️ Error autenticando ${role}: ${error.message}`);
    }
  }
}

async function testCreateNotificationTemplate(results) {
  logger.info('📧 Testing: Create Notification Template');
  const testName = 'Create Notification Template';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    const templateData = {
      name: 'Confirmación de Reserva',
      description: 'Plantilla para confirmar reservas de recursos',
      type: 'RESERVATION_CONFIRMATION',
      category: 'BOOKING',
      channels: ['EMAIL', 'SMS', 'PUSH_NOTIFICATION'],
      content: {
        email: {
          subject: 'Confirmación de Reserva - {{resourceName}}',
          body: `
            <h2>Confirmación de Reserva</h2>
            <p>Hola {{userName}},</p>
            <p>Tu reserva ha sido confirmada exitosamente:</p>
            <ul>
              <li><strong>Recurso:</strong> {{resourceName}}</li>
              <li><strong>Fecha:</strong> {{reservationDate}}</li>
              <li><strong>Hora:</strong> {{startTime}} - {{endTime}}</li>
              <li><strong>Ubicación:</strong> {{location}}</li>
            </ul>
            <p><strong>Código de Reserva:</strong> {{reservationCode}}</p>
            <p>Recuerda presentarte con tu identificación.</p>
          `,
          footer: 'Universidad Francisco de Paula Santander'
        },
        sms: {
          body: 'UFPS: Reserva confirmada. {{resourceName}} - {{reservationDate}} {{startTime}}. Código: {{reservationCode}}'
        },
        push: {
          title: 'Reserva Confirmada',
          body: '{{resourceName}} - {{reservationDate}} {{startTime}}',
          icon: 'confirmation'
        }
      },
      variables: [
        { name: 'userName', type: 'string', required: true },
        { name: 'resourceName', type: 'string', required: true },
        { name: 'reservationDate', type: 'date', required: true },
        { name: 'startTime', type: 'time', required: true },
        { name: 'endTime', type: 'time', required: true },
        { name: 'location', type: 'string', required: false },
        { name: 'reservationCode', type: 'string', required: true }
      ],
      triggers: ['RESERVATION_CREATED', 'RESERVATION_APPROVED'],
      isActive: true,
      priority: 'NORMAL'
    };

    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);
    const response = await httpClient.post(`${STOCKPILE_BASE_URL}/notification-templates`, templateData);

    if (!response.success) {
      throw new Error(`API returned success: false - ${response.message}`);
    }

    const template = response.data;
    if (!template.id || !template.name || template.type !== 'RESERVATION_CONFIRMATION') {
      throw new Error('Invalid notification template structure');
    }

    testData.notificationTemplates.push(template.id);
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/notification-templates');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testSendSingleNotification(results) {
  logger.info('📤 Testing: Send Single Notification');
  const testName = 'Send Single Notification';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.notificationTemplates.length === 0) {
      throw new Error('No notification templates available');
    }

    const templateId = testData.notificationTemplates[0];
    await httpClient.authenticate(TEST_USERS.coordinator.email, TEST_USERS.coordinator.password);

    const notificationData = {
      templateId: templateId,
      recipient: {
        userId: 'user_teacher_001',
        email: 'docente@ufps.edu.co',
        phone: '+573001234567',
        pushToken: 'push_token_123'
      },
      channels: ['EMAIL', 'PUSH_NOTIFICATION'],
      data: {
        userName: 'Juan Carlos Pérez',
        resourceName: 'Auditorio Central - Bloque A',
        reservationDate: '2024-01-15',
        startTime: '14:00',
        endTime: '16:00',
        location: 'Piso 1, Bloque A',
        reservationCode: 'RES-2024-001'
      },
      priority: 'HIGH',
      scheduleFor: null, // Send immediately
      metadata: {
        source: 'reservation_system',
        entityId: 'reservation_001'
      }
    };

    const response = await httpClient.post(`${STOCKPILE_BASE_URL}/notifications/send`, notificationData);

    if (!response.success) {
      throw new Error(`Notification send failed - ${response.message}`);
    }

    const notification = response.data;
    if (!notification.id || !notification.status || notification.channels.length === 0) {
      throw new Error('Invalid notification response structure');
    }

    testData.sentNotifications.push(notification.id);
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/notifications/send');
    
    logger.info(`✅ ${testName} exitoso - ID: ${notification.id} (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testSendBulkNotifications(results) {
  logger.info('📢 Testing: Send Bulk Notifications');
  const testName = 'Send Bulk Notifications';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.notificationTemplates.length === 0) {
      throw new Error('No notification templates available');
    }

    const templateId = testData.notificationTemplates[0];
    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);

    const bulkData = {
      templateId: templateId,
      recipients: [
        {
          userId: 'user_teacher_001',
          email: 'docente1@ufps.edu.co',
          data: {
            userName: 'Juan Carlos Pérez',
            resourceName: 'Laboratorio A',
            reservationDate: '2024-01-16',
            startTime: '08:00',
            endTime: '10:00',
            reservationCode: 'RES-2024-002'
          }
        },
        {
          userId: 'user_teacher_002',
          email: 'docente2@ufps.edu.co',
          data: {
            userName: 'María González',
            resourceName: 'Laboratorio B',
            reservationDate: '2024-01-16',
            startTime: '10:00',
            endTime: '12:00',
            reservationCode: 'RES-2024-003'
          }
        }
      ],
      channels: ['EMAIL'],
      batchSize: 10,
      delayBetweenBatches: 1000, // 1 second
      priority: 'NORMAL'
    };

    const response = await httpClient.post(`${STOCKPILE_BASE_URL}/notifications/send-bulk`, bulkData);

    if (!response.success) {
      throw new Error(`Bulk notification send failed - ${response.message}`);
    }

    const bulkResult = response.data;
    if (!bulkResult.batchId || !bulkResult.totalRecipients || bulkResult.totalRecipients !== 2) {
      throw new Error('Invalid bulk notification response');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/notifications/send-bulk');
    
    logger.info(`✅ ${testName} exitoso - ${bulkResult.totalRecipients} notificaciones (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testNotificationChannels(results) {
  logger.info('📱 Testing: Notification Channels');
  const testName = 'Notification Channels';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Test available channels
    const channelsResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/notification-channels`);

    if (!channelsResponse.success || !Array.isArray(channelsResponse.data)) {
      throw new Error('Failed to retrieve notification channels');
    }

    const requiredChannels = ['EMAIL', 'SMS', 'PUSH_NOTIFICATION', 'WHATSAPP'];
    const availableChannels = channelsResponse.data.map(ch => ch.type);

    for (const channel of requiredChannels) {
      if (!availableChannels.includes(channel)) {
        throw new Error(`Required channel ${channel} not available`);
      }
    }

    // Test channel configuration
    const configResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/notification-channels/EMAIL/config`);

    if (!configResponse.success) {
      throw new Error('Failed to retrieve channel configuration');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('GET /stockpile/notification-channels');
    results.coverage.push('GET /stockpile/notification-channels/:type/config');
    
    logger.info(`✅ ${testName} exitoso - ${availableChannels.length} canales disponibles (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testScheduleNotifications(results) {
  logger.info('⏰ Testing: Schedule Notifications');
  const testName = 'Schedule Notifications';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.notificationTemplates.length === 0) {
      throw new Error('No notification templates available');
    }

    const templateId = testData.notificationTemplates[0];
    await httpClient.authenticate(TEST_USERS.coordinator.email, TEST_USERS.coordinator.password);

    // Schedule notification for future
    const scheduleData = {
      templateId: templateId,
      recipient: {
        userId: 'user_student_001',
        email: 'estudiante@ufps.edu.co'
      },
      channels: ['EMAIL'],
      data: {
        userName: 'Ana María López',
        resourceName: 'Sala de Estudio 1',
        reservationDate: '2024-01-20',
        startTime: '09:00',
        endTime: '11:00',
        reservationCode: 'RES-2024-004'
      },
      scheduleFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      recurrence: {
        type: 'NONE'
      }
    };

    const response = await httpClient.post(`${STOCKPILE_BASE_URL}/notifications/schedule`, scheduleData);

    if (!response.success) {
      throw new Error(`Notification scheduling failed - ${response.message}`);
    }

    const scheduled = response.data;
    if (!scheduled.id || scheduled.status !== 'SCHEDULED') {
      throw new Error('Invalid scheduled notification response');
    }

    // Test recurring notification
    const recurringData = {
      ...scheduleData,
      recurrence: {
        type: 'DAILY',
        interval: 1,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    const recurringResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/notifications/schedule`, recurringData);

    if (!recurringResponse.success) {
      throw new Error('Recurring notification scheduling failed');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/notifications/schedule');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testNotificationTracking(results) {
  logger.info('📊 Testing: Notification Tracking');
  const testName = 'Notification Tracking';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.sentNotifications.length === 0) {
      throw new Error('No sent notifications available for tracking');
    }

    const notificationId = testData.sentNotifications[0];
    await httpClient.authenticate(TEST_USERS.coordinator.email, TEST_USERS.coordinator.password);

    // Get notification status
    const statusResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/notifications/${notificationId}/status`);

    if (!statusResponse.success) {
      throw new Error(`Failed to retrieve notification status - ${statusResponse.message}`);
    }

    const status = statusResponse.data;
    if (!status.id || !status.deliveryStatus) {
      throw new Error('Invalid notification status structure');
    }

    // Get delivery logs
    const logsResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/notifications/${notificationId}/logs`);

    if (!logsResponse.success || !Array.isArray(logsResponse.data)) {
      throw new Error('Failed to retrieve delivery logs');
    }

    // Get analytics for all notifications
    const analyticsResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/notifications/analytics`, {
      params: {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        groupBy: 'channel'
      }
    });

    if (!analyticsResponse.success) {
      throw new Error('Failed to retrieve notification analytics');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('GET /stockpile/notifications/:id/status');
    results.coverage.push('GET /stockpile/notifications/:id/logs');
    results.coverage.push('GET /stockpile/notifications/analytics');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testUserSubscriptions(results) {
  logger.info('🔔 Testing: User Subscriptions');
  const testName = 'User Subscriptions';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.teacher.email, TEST_USERS.teacher.password);

    // Create subscription
    const subscriptionData = {
      userId: 'user_teacher_001',
      topicType: 'RESOURCE_UPDATES',
      resourceIds: ['resource_001', 'resource_002'],
      channels: ['EMAIL', 'PUSH_NOTIFICATION'],
      frequency: 'IMMEDIATE',
      isActive: true
    };

    const createResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/subscriptions`, subscriptionData);

    if (!createResponse.success) {
      throw new Error(`Subscription creation failed - ${createResponse.message}`);
    }

    const subscription = createResponse.data;
    testData.subscriptions.push(subscription.id);

    // List user subscriptions
    const listResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/subscriptions/user/user_teacher_001`);

    if (!listResponse.success || !Array.isArray(listResponse.data)) {
      throw new Error('Failed to retrieve user subscriptions');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/subscriptions');
    results.coverage.push('GET /stockpile/subscriptions/user/:userId');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testNotificationPreferences(results) {
  logger.info('⚙️ Testing: Notification Preferences');
  const testName = 'Notification Preferences';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.student.email, TEST_USERS.student.password);

    // Update user preferences
    const preferencesData = {
      userId: 'user_student_001',
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      whatsappEnabled: true,
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '07:00'
      },
      topicPreferences: {
        RESERVATION_REMINDERS: { enabled: true, channels: ['PUSH_NOTIFICATION'] },
        SYSTEM_UPDATES: { enabled: false, channels: [] },
        MAINTENANCE_ALERTS: { enabled: true, channels: ['EMAIL', 'PUSH_NOTIFICATION'] }
      }
    };

    const updateResponse = await httpClient.put(`${STOCKPILE_BASE_URL}/notification-preferences/user_student_001`, preferencesData);

    if (!updateResponse.success) {
      throw new Error(`Preferences update failed - ${updateResponse.message}`);
    }

    // Get user preferences
    const getResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/notification-preferences/user_student_001`);

    if (!getResponse.success) {
      throw new Error('Failed to retrieve user preferences');
    }

    const preferences = getResponse.data;
    if (preferences.emailEnabled !== true || preferences.smsEnabled !== false) {
      throw new Error('Preferences not updated correctly');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('PUT /stockpile/notification-preferences/:userId');
    results.coverage.push('GET /stockpile/notification-preferences/:userId');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function cleanupTestData(results) {
  logger.info('🧹 Limpiando datos de prueba...');
  
  try {
    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Cleanup subscriptions
    for (const subId of testData.subscriptions) {
      try {
        await httpClient.delete(`${STOCKPILE_BASE_URL}/subscriptions/${subId}`);
        logger.info(`🗑️ Suscripción ${subId} eliminada`);
      } catch (error) {
        logger.warn(`⚠️ Error eliminando suscripción ${subId}: ${error.message}`);
      }
    }
    
    // Cleanup notification templates
    for (const templateId of testData.notificationTemplates) {
      try {
        await httpClient.delete(`${STOCKPILE_BASE_URL}/notification-templates/${templateId}`);
        logger.info(`🗑️ Plantilla ${templateId} eliminada`);
      } catch (error) {
        logger.warn(`⚠️ Error eliminando plantilla ${templateId}: ${error.message}`);
      }
    }

    logger.info('✅ Limpieza completada');
    
  } catch (error) {
    logger.error('❌ Error durante limpieza:', error.message);
    results.errors.push({ test: 'cleanup', error: error.message });
  }
}

async function generateTestReport(results) {
  const report = `# Hito 3 - Stockpile Core: Notification System Test Report

## 📊 Resumen de Resultados
- **Tests Ejecutados**: ${results.totalTests}
- **Exitosos**: ${results.passed}
- **Fallidos**: ${results.failed}
- **Tasa de Éxito**: ${results.successRate}%
- **Tiempo Total**: ${results.executionTime}ms

## ⚡ Métricas de Rendimiento
${Object.entries(results.performance).map(([test, time]) => `- **${test}**: ${time}ms`).join('\n')}

## 🎯 Cobertura de Endpoints
${results.coverage.map(endpoint => `- ✅ ${endpoint}`).join('\n')}

## ❌ Errores Encontrados
${results.errors.length > 0 ? results.errors.map(error => `- **${error.test}**: ${error.error}`).join('\n') : '- ✅ No se encontraron errores'}

---
*Reporte generado: ${new Date().toISOString()}*
`;

  const fs = require('fs').promises;
  await fs.writeFile(`${__dirname}/results/notification-system-report.md`, report);
  logger.info('📄 Reporte generado: notification-system-report.md');
}

if (require.main === module) {
  testNotificationSystem().catch(console.error);
}

module.exports = { testNotificationSystem };
