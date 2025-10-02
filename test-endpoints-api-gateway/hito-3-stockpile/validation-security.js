#!/usr/bin/env node

/**
 * Hito 3 - Stockpile Core: Validation & Security Tests
 * Tests para pantalla de vigilancia, check-in/out y validaciones de seguridad
 */

const { httpClient } = require('../shared/http-client');
const { logger } = require('../shared/logger');
const { CONFIG } = require('../shared/config');
const { TestReporter } = require('../shared/test-reporter');

const STOCKPILE_BASE_URL = `${CONFIG.SERVICES.STOCKPILE}/stockpile`;

const TEST_USERS = {
  admin: { email: 'admin@ufps.edu.co', password: 'Admin123!' },
  security: { email: 'vigilante@ufps.edu.co', password: 'Guard123!' },
  teacher: { email: 'docente@ufps.edu.co', password: 'Teacher123!' },
  student: { email: 'estudiante@ufps.edu.co', password: 'Student123!' }
};

let testData = {
  checkInSessions: [],
  securityReports: [],
  accessLogs: []
};

async function testValidationSecurity() {
  logger.info('🚀 Iniciando Hito 3 - Stockpile Core: Validation & Security Tests');
  
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
    
    await testSecurityDashboard(results);
    await testCheckInProcess(results);
    await testCheckOutProcess(results);
    await testIdentityValidation(results);
    await testPermissionVerification(results);
    await testSecurityAlerts(results);
    await testIncidentReporting(results);
    await testAnomalyDetection(results);
    await testAccessControl(results);
    await testRealTimeMonitoring(results);
    
    await cleanupTestData(results);

  } catch (error) {
    logger.error('❌ Error general en validation security:', error.message);
    results.errors.push({ test: 'general', error: error.message });
  }

  const endTime = Date.now();
  results.executionTime = endTime - startTime;
  results.successRate = results.totalTests > 0 ? (results.passed / results.totalTests * 100).toFixed(2) : 0;

  await generateTestReport(results);
  
  logger.info(`✅ Validation Security Tests completados: ${results.passed}/${results.totalTests} exitosos (${results.successRate}%)`);
  
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

async function testSecurityDashboard(results) {
  logger.info('🖥️ Testing: Security Dashboard');
  const testName = 'Security Dashboard';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    // Get dashboard overview
    const dashboardResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/dashboard`);

    if (!dashboardResponse.success) {
      throw new Error(`Dashboard access failed - ${dashboardResponse.message}`);
    }

    const dashboard = dashboardResponse.data;
    if (!dashboard.activeReservations || !dashboard.pendingCheckIns || !dashboard.securityAlerts) {
      throw new Error('Invalid dashboard structure - missing required sections');
    }

    // Get active reservations for today
    const reservationsResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/active-reservations`, {
      params: {
        date: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      }
    });

    if (!reservationsResponse.success || !Array.isArray(reservationsResponse.data)) {
      throw new Error('Failed to retrieve active reservations');
    }

    // Get pending validations
    const pendingResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/pending-validations`);

    if (!pendingResponse.success) {
      throw new Error('Failed to retrieve pending validations');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('GET /stockpile/security/dashboard');
    results.coverage.push('GET /stockpile/security/active-reservations');
    results.coverage.push('GET /stockpile/security/pending-validations');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testCheckInProcess(results) {
  logger.info('📥 Testing: Check-In Process');
  const testName = 'Check-In Process';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    // Simulate check-in with identity validation
    const checkInData = {
      reservationId: 'reservation_test_001',
      userId: 'user_teacher_001',
      identityDocument: {
        type: 'CEDULA',
        number: '1094123456'
      },
      biometricData: {
        fingerprint: 'base64_fingerprint_data',
        photo: 'base64_photo_data'
      },
      location: {
        latitude: 7.8792,
        longitude: -72.4951,
        accuracy: 5
      },
      deviceInfo: {
        deviceId: 'security_tablet_001',
        guardId: 'guard_001'
      },
      timestamp: new Date().toISOString()
    };

    const checkInResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/check-in`, checkInData);

    if (!checkInResponse.success) {
      throw new Error(`Check-in failed - ${checkInResponse.message}`);
    }

    const session = checkInResponse.data;
    if (!session.sessionId || session.status !== 'CHECKED_IN') {
      throw new Error('Invalid check-in session structure');
    }

    testData.checkInSessions.push(session.sessionId);

    // Verify identity match
    if (!session.identityVerified || session.verificationScore < 0.9) {
      throw new Error('Identity verification failed or score too low');
    }

    // Test invalid check-in (duplicate)
    try {
      await httpClient.post(`${STOCKPILE_BASE_URL}/security/check-in`, checkInData);
      throw new Error('Duplicate check-in should have been rejected');
    } catch (error) {
      if (!error.message.includes('already checked in')) {
        throw error;
      }
      logger.info('✅ Duplicate check-in correctly rejected');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/security/check-in');
    
    logger.info(`✅ ${testName} exitoso - Session: ${session.sessionId} (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testCheckOutProcess(results) {
  logger.info('📤 Testing: Check-Out Process');
  const testName = 'Check-Out Process';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.checkInSessions.length === 0) {
      throw new Error('No active check-in sessions available for check-out');
    }

    const sessionId = testData.checkInSessions[0];
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    const checkOutData = {
      sessionId: sessionId,
      resourceCondition: 'GOOD',
      incidentsReported: false,
      equipmentReturned: true,
      cleaningCompleted: true,
      observations: 'Recurso utilizado correctamente, sin novedades',
      finalPhotos: ['base64_photo_1', 'base64_photo_2'],
      location: {
        latitude: 7.8792,
        longitude: -72.4951,
        accuracy: 5
      },
      guardSignature: 'guard_digital_signature',
      timestamp: new Date().toISOString()
    };

    const checkOutResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/check-out`, checkOutData);

    if (!checkOutResponse.success) {
      throw new Error(`Check-out failed - ${checkOutResponse.message}`);
    }

    const completedSession = checkOutResponse.data;
    if (completedSession.status !== 'CHECKED_OUT' || !completedSession.duration) {
      throw new Error('Invalid check-out session structure');
    }

    // Verify session completion
    const sessionResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/sessions/${sessionId}`);
    
    if (!sessionResponse.success) {
      throw new Error('Failed to retrieve completed session');
    }

    const sessionDetails = sessionResponse.data;
    if (sessionDetails.status !== 'COMPLETED') {
      throw new Error('Session not marked as completed');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/security/check-out');
    results.coverage.push('GET /stockpile/security/sessions/:id');
    
    logger.info(`✅ ${testName} exitoso - Duration: ${completedSession.duration}min (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testIdentityValidation(results) {
  logger.info('🆔 Testing: Identity Validation');
  const testName = 'Identity Validation';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    // Test identity verification
    const validationData = {
      userId: 'user_student_001',
      documentType: 'CEDULA',
      documentNumber: '1098765432',
      biometricData: {
        fingerprint: 'base64_fingerprint_sample',
        photo: 'base64_photo_sample'
      },
      verificationLevel: 'HIGH'
    };

    const validationResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/validate-identity`, validationData);

    if (!validationResponse.success) {
      throw new Error(`Identity validation failed - ${validationResponse.message}`);
    }

    const validation = validationResponse.data;
    if (!validation.isValid || !validation.matchScore || validation.matchScore < 0.8) {
      throw new Error('Identity validation returned invalid or low confidence result');
    }

    // Test invalid identity
    const invalidData = {
      ...validationData,
      documentNumber: '9999999999' // Non-existent document
    };

    const invalidResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/validate-identity`, invalidData);

    if (invalidResponse.success && invalidResponse.data.isValid) {
      throw new Error('Invalid identity was incorrectly validated as valid');
    }

    // Get validation history
    const historyResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/validation-history/user_student_001`);

    if (!historyResponse.success || !Array.isArray(historyResponse.data)) {
      throw new Error('Failed to retrieve validation history');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/security/validate-identity');
    results.coverage.push('GET /stockpile/security/validation-history/:userId');
    
    logger.info(`✅ ${testName} exitoso - Score: ${validation.matchScore} (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testPermissionVerification(results) {
  logger.info('🔒 Testing: Permission Verification');
  const testName = 'Permission Verification';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    // Verify user permissions for resource access
    const permissionData = {
      userId: 'user_teacher_001',
      resourceId: 'resource_auditorium_001',
      requestedAction: 'ACCESS',
      timestamp: new Date().toISOString(),
      reservationId: 'reservation_test_001'
    };

    const permissionResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/verify-permissions`, permissionData);

    if (!permissionResponse.success) {
      throw new Error(`Permission verification failed - ${permissionResponse.message}`);
    }

    const permission = permissionResponse.data;
    if (!permission.hasPermission && permission.reason) {
      logger.info(`ℹ️ Permission denied: ${permission.reason}`);
    }

    // Test unauthorized access attempt
    const unauthorizedData = {
      userId: 'user_student_001', // Student trying to access restricted resource
      resourceId: 'resource_server_room_001',
      requestedAction: 'ACCESS',
      timestamp: new Date().toISOString()
    };

    const unauthorizedResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/verify-permissions`, unauthorizedData);

    if (unauthorizedResponse.success && unauthorizedResponse.data.hasPermission) {
      throw new Error('Unauthorized access was incorrectly permitted');
    }

    // Get permission audit log
    const auditResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/permission-audit`, {
      params: {
        userId: 'user_teacher_001',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    });

    if (!auditResponse.success || !Array.isArray(auditResponse.data)) {
      throw new Error('Failed to retrieve permission audit log');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/security/verify-permissions');
    results.coverage.push('GET /stockpile/security/permission-audit');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testSecurityAlerts(results) {
  logger.info('🚨 Testing: Security Alerts');
  const testName = 'Security Alerts';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    // Create security alert
    const alertData = {
      type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: 'HIGH',
      resourceId: 'resource_lab_001',
      userId: 'user_unknown_001',
      description: 'Intento de acceso sin reserva válida detectado',
      location: {
        building: 'Bloque A',
        floor: '1',
        room: 'Lab-101'
      },
      evidence: {
        photos: ['base64_photo_evidence'],
        timestamp: new Date().toISOString(),
        deviceId: 'security_camera_001'
      },
      reportedBy: 'guard_001'
    };

    const alertResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/alerts`, alertData);

    if (!alertResponse.success) {
      throw new Error(`Security alert creation failed - ${alertResponse.message}`);
    }

    const alert = alertResponse.data;
    if (!alert.id || alert.status !== 'ACTIVE') {
      throw new Error('Invalid security alert structure');
    }

    // List active alerts
    const listResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/alerts`, {
      params: {
        status: 'ACTIVE',
        severity: 'HIGH'
      }
    });

    if (!listResponse.success || !Array.isArray(listResponse.data)) {
      throw new Error('Failed to retrieve active alerts');
    }

    // Acknowledge alert
    const ackResponse = await httpClient.patch(`${STOCKPILE_BASE_URL}/security/alerts/${alert.id}/acknowledge`, {
      acknowledgedBy: 'guard_001',
      notes: 'Alert reviewed and investigated'
    });

    if (!ackResponse.success) {
      throw new Error('Failed to acknowledge security alert');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/security/alerts');
    results.coverage.push('GET /stockpile/security/alerts');
    results.coverage.push('PATCH /stockpile/security/alerts/:id/acknowledge');
    
    logger.info(`✅ ${testName} exitoso - Alert: ${alert.id} (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testIncidentReporting(results) {
  logger.info('📋 Testing: Incident Reporting');
  const testName = 'Incident Reporting';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    // Create incident report
    const incidentData = {
      type: 'EQUIPMENT_DAMAGE',
      severity: 'MEDIUM',
      resourceId: 'resource_projector_001',
      sessionId: testData.checkInSessions[0] || 'session_test_001',
      description: 'Proyector presenta fallas en la lámpara, imagen borrosa',
      damageAssessment: {
        component: 'LAMP',
        severity: 'MODERATE',
        estimatedCost: 150000,
        repairRequired: true
      },
      involvedPersons: [
        {
          userId: 'user_teacher_001',
          role: 'USER',
          statement: 'El proyector comenzó a fallar durante la presentación'
        }
      ],
      evidence: {
        photos: ['base64_damage_photo_1', 'base64_damage_photo_2'],
        videos: ['base64_video_evidence'],
        documents: []
      },
      reportedBy: 'guard_001',
      witnessedBy: ['guard_002']
    };

    const incidentResponse = await httpClient.post(`${STOCKPILE_BASE_URL}/security/incidents`, incidentData);

    if (!incidentResponse.success) {
      throw new Error(`Incident report creation failed - ${incidentResponse.message}`);
    }

    const incident = incidentResponse.data;
    if (!incident.id || !incident.reportNumber) {
      throw new Error('Invalid incident report structure');
    }

    testData.securityReports.push(incident.id);

    // Get incident details
    const detailsResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/incidents/${incident.id}`);

    if (!detailsResponse.success) {
      throw new Error('Failed to retrieve incident details');
    }

    // Update incident status
    const updateResponse = await httpClient.patch(`${STOCKPILE_BASE_URL}/security/incidents/${incident.id}/status`, {
      status: 'UNDER_INVESTIGATION',
      assignedTo: 'maintenance_team_001',
      notes: 'Incident escalated to maintenance team for repair assessment'
    });

    if (!updateResponse.success) {
      throw new Error('Failed to update incident status');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/security/incidents');
    results.coverage.push('GET /stockpile/security/incidents/:id');
    results.coverage.push('PATCH /stockpile/security/incidents/:id/status');
    
    logger.info(`✅ ${testName} exitoso - Report: ${incident.reportNumber} (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testRealTimeMonitoring(results) {
  logger.info('📡 Testing: Real-Time Monitoring');
  const testName = 'Real-Time Monitoring';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    await httpClient.authenticate(TEST_USERS.security.email, TEST_USERS.security.password);

    // Get real-time occupancy
    const occupancyResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/real-time/occupancy`);

    if (!occupancyResponse.success) {
      throw new Error(`Real-time occupancy failed - ${occupancyResponse.message}`);
    }

    const occupancy = occupancyResponse.data;
    if (!Array.isArray(occupancy.resources)) {
      throw new Error('Invalid occupancy data structure');
    }

    // Get active sessions
    const sessionsResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/real-time/active-sessions`);

    if (!sessionsResponse.success || !Array.isArray(sessionsResponse.data)) {
      throw new Error('Failed to retrieve active sessions');
    }

    // Get system health
    const healthResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/security/real-time/system-health`);

    if (!healthResponse.success) {
      throw new Error('Failed to retrieve system health status');
    }

    const health = healthResponse.data;
    if (!health.services || !health.lastUpdate) {
      throw new Error('Invalid system health structure');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('GET /stockpile/security/real-time/occupancy');
    results.coverage.push('GET /stockpile/security/real-time/active-sessions');
    results.coverage.push('GET /stockpile/security/real-time/system-health');
    
    logger.info(`✅ ${testName} exitoso - ${occupancy.resources.length} recursos monitoreados (${endTime - startTime}ms)`);

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
    
    // Cleanup incident reports
    for (const reportId of testData.securityReports) {
      try {
        await httpClient.delete(`${STOCKPILE_BASE_URL}/security/incidents/${reportId}`);
        logger.info(`🗑️ Reporte ${reportId} eliminado`);
      } catch (error) {
        logger.warn(`⚠️ Error eliminando reporte ${reportId}: ${error.message}`);
      }
    }

    logger.info('✅ Limpieza completada');
    
  } catch (error) {
    logger.error('❌ Error durante limpieza:', error.message);
    results.errors.push({ test: 'cleanup', error: error.message });
  }
}

async function generateTestReport(results) {
  const report = `# Hito 3 - Stockpile Core: Validation & Security Test Report

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
  await fs.writeFile(`${__dirname}/results/validation-security-report.md`, report);
  logger.info('📄 Reporte generado: validation-security-report.md');
}

if (require.main === module) {
  testValidationSecurity().catch(console.error);
}

module.exports = { testValidationSecurity };
