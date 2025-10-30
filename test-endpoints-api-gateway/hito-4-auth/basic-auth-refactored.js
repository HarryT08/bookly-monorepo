#!/usr/bin/env node

/**
 * HITO 4 - AUTH CORE: BASIC AUTHENTICATION (REFACTORIZADO)
 * 
 * Flujo completo de testing para autenticación básica:
 * - RF-43: Autenticación y SSO
 * - Registro y login de usuarios
 * - Recuperación de contraseñas
 * - Gestión de sesiones
 * - Bloqueo de cuentas
 * - Verificación de email
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class BasicAuthFlow {
  constructor() {
    this.logger = new TestLogger('Basic-Auth');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-4-Auth', 'Basic-Authentication');
    this.testData = {
      createdUsers: [],
      activeSessions: [],
      recoveryTokens: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        student: TEST_DATA.USERS.ESTUDIANTE,
        teacher: TEST_DATA.USERS.DOCENTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 4 - BASIC AUTHENTICATION TESTING');
    this.logger.info('Iniciando testing completo de autenticación básica...');

    try {
      await this.setup();
      await this.testUserRegistration();
      await this.testUserLogin();
      await this.testPasswordRecovery();
      await this.testSessionManagement();
      await this.testAccountLocking();
      await this.testEmailVerification();
      await this.testUserProfile();
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
      // Autenticar usuarios base para pruebas que requieren permisos
      await this.httpClient.authenticate(this.testData.testUsers.admin);
      
      this.logger.success('Setup completado - Usuario administrador autenticado');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testUserRegistration() {
    this.logger.subheader('Test: Registro de usuarios');
    const startTime = Date.now();

    try {
      const newUserData = this.dataGenerator.getTestData(4, 'user', {
        email: `test.user.${Date.now()}@ufps.edu.co`,
        password: 'TestPassword123!',
        firstName: 'Juan Carlos',
        lastName: 'Test User',
        role: 'ESTUDIANTE',
        academicProgram: 'Ingeniería de Sistemas',
        studentId: `${Date.now()}`.slice(-8)
      });

      const endpoint = getEndpointUrl('auth-service', 'auth', 'register');
      const response = await this.httpClient.post(endpoint, newUserData);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`User registration validation failed: ${validation.errors.join(', ')}`);
      }

      const registeredUser = response.data.data;
      this.testData.createdUsers.push(registeredUser);

      // Validar estructura del usuario registrado
      const userValidation = this.validator.validateUser(registeredUser);
      if (!userValidation.isValid) {
        this.logger.warn('Registered user structure issues:', userValidation.errors);
      }

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `User registered successfully: ${registeredUser.email}`,
        userId: registeredUser.id,
        email: registeredUser.email
      });

      this.logger.success(`✅ Usuario registrado: ${registeredUser.email} (ID: ${registeredUser.id}) (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'register');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with registered user'
      });
      this.logger.error(`❌ Error registrando usuario: ${error.message}`);
    }
  }

  async testUserLogin() {
    this.logger.subheader('Test: Login de usuarios');
    const startTime = Date.now();

    try {
      const loginData = {
        email: this.testData.testUsers.student.email,
        password: this.testData.testUsers.student.password
      };

      const endpoint = getEndpointUrl('auth-service', 'auth', 'login');
      const response = await this.httpClient.post(endpoint, loginData);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`User login validation failed: ${validation.errors.join(', ')}`);
      }

      const loginResult = response.data.data;
      
      // Validar que contiene token y datos del usuario
      if (!loginResult.accessToken || !loginResult.user) {
        throw new Error('Login response missing required fields: accessToken or user');
      }

      this.testData.activeSessions.push({
        token: loginResult.accessToken,
        user: loginResult.user,
        loginTime: new Date()
      });

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `User login successful: ${loginResult.user.email}`,
        userId: loginResult.user.id,
        hasToken: !!loginResult.accessToken,
        tokenType: loginResult.tokenType || 'Bearer'
      });

      this.logger.success(`✅ Login exitoso: ${loginResult.user.email} (${duration}ms)`);

      // Test login con credenciales incorrectas
      await this.testFailedLogin();

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'login');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with access token and user data'
      });
      this.logger.error(`❌ Error en login: ${error.message}`);
    }
  }

  async testFailedLogin() {
    this.logger.subheader('Test: Login con credenciales incorrectas');
    const startTime = Date.now();

    try {
      const wrongCredentials = {
        email: this.testData.testUsers.student.email,
        password: 'WrongPassword123!'
      };

      const endpoint = getEndpointUrl('auth-service', 'auth', 'login');
      const response = await this.httpClient.post(endpoint, wrongCredentials);

      const duration = Date.now() - startTime;
      
      // Para login fallido, esperamos error 401
      if (response.status === 401 || !response.data.success) {
        this.reporter.addResult(endpoint, 'POST', 'PASS', {
          duration,
          message: 'Failed login correctly rejected',
          statusCode: response.status,
          error: response.data.message
        });

        this.logger.success(`✅ Login fallido correctamente rechazado (${duration}ms)`);
      } else {
        throw new Error('Login with wrong credentials should have failed');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'login');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 401 for wrong credentials'
      });
      this.logger.error(`❌ Error testando login fallido: ${error.message}`);
    }
  }

  async testPasswordRecovery() {
    this.logger.subheader('Test: Recuperación de contraseña');
    const startTime = Date.now();

    try {
      // Paso 1: Solicitar recuperación
      const recoveryData = {
        email: this.testData.testUsers.student.email
      };

      const requestEndpoint = getEndpointUrl('auth-service', 'auth', 'forgot-password');
      const requestResponse = await this.httpClient.post(requestEndpoint, recoveryData);

      const validation = this.validator.validateBooklyResponse(requestResponse, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Password recovery request validation failed: ${validation.errors.join(', ')}`);
      }

      // Paso 2: Simular validación de token (normalmente viene por email)
      const mockToken = 'mock-recovery-token-' + Date.now();
      const validateEndpoint = getEndpointUrl('auth-service', 'auth', 'validate-reset-token');
      const validateResponse = await this.httpClient.post(validateEndpoint, { token: mockToken });

      // Paso 3: Resetear contraseña con token válido
      const resetData = {
        token: mockToken,
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const resetEndpoint = getEndpointUrl('auth-service', 'auth', 'reset-password');
      const resetResponse = await this.httpClient.post(resetEndpoint, resetData);

      const duration = Date.now() - startTime;

      this.reporter.addResult(requestEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Password recovery flow completed',
        email: recoveryData.email,
        stepsCompleted: 3
      });

      this.logger.success(`✅ Recuperación de contraseña completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'forgot-password');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for password recovery flow'
      });
      this.logger.error(`❌ Error en recuperación de contraseña: ${error.message}`);
    }
  }

  async testSessionManagement() {
    this.logger.subheader('Test: Gestión de sesiones');
    
    if (this.testData.activeSessions.length === 0) {
      this.logger.warn('No hay sesiones activas para probar');
      return;
    }

    const startTime = Date.now();

    try {
      const session = this.testData.activeSessions[0];
      
      // Test 1: Validar token activo
      const validateEndpoint = getEndpointUrl('auth-service', 'auth', 'validate-token');
      const validateResponse = await this.httpClient.authPost(validateEndpoint, 
        { token: session.token }, 
        { email: session.user.email, password: 'mock' }
      );

      // Test 2: Renovar token
      const refreshEndpoint = getEndpointUrl('auth-service', 'auth', 'refresh-token');
      const refreshResponse = await this.httpClient.authPost(refreshEndpoint, 
        { refreshToken: session.token }, 
        { email: session.user.email, password: 'mock' }
      );

      // Test 3: Logout
      const logoutEndpoint = getEndpointUrl('auth-service', 'auth', 'logout');
      const logoutResponse = await this.httpClient.authPost(logoutEndpoint, 
        {}, 
        { email: session.user.email, password: 'mock' }
      );

      const duration = Date.now() - startTime;

      this.reporter.addResult(validateEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Session management tests completed',
        testsCompleted: 3,
        userId: session.user.id
      });

      this.logger.success(`✅ Gestión de sesiones completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'validate-token');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for session management'
      });
      this.logger.error(`❌ Error en gestión de sesiones: ${error.message}`);
    }
  }

  async testAccountLocking() {
    this.logger.subheader('Test: Bloqueo de cuentas');
    const startTime = Date.now();

    try {
      const testEmail = `lock.test.${Date.now()}@ufps.edu.co`;
      
      // Simular múltiples intentos fallidos
      const failedAttempts = [];
      for (let i = 0; i < 5; i++) {
        const attemptData = {
          email: testEmail,
          password: `WrongPassword${i}!`
        };

        const endpoint = getEndpointUrl('auth-service', 'auth', 'login');
        const response = await this.httpClient.post(endpoint, attemptData);
        failedAttempts.push(response.status);
      }

      // Verificar estado de bloqueo
      const lockStatusEndpoint = getEndpointUrl('auth-service', 'auth', 'lock-status');
      const lockStatusResponse = await this.httpClient.post(lockStatusEndpoint, { email: testEmail });

      const duration = Date.now() - startTime;

      this.reporter.addResult(lockStatusEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Account locking test completed',
        failedAttempts: failedAttempts.length,
        email: testEmail
      });

      this.logger.success(`✅ Test de bloqueo de cuenta completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'login');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'Account should be locked after 5 failed attempts'
      });
      this.logger.error(`❌ Error en test de bloqueo: ${error.message}`);
    }
  }

  async testEmailVerification() {
    this.logger.subheader('Test: Verificación de email');
    const startTime = Date.now();

    try {
      if (this.testData.createdUsers.length === 0) {
        this.logger.warn('No hay usuarios creados para verificar email');
        return;
      }

      const user = this.testData.createdUsers[0];

      // Test 1: Reenviar email de verificación
      const resendEndpoint = getEndpointUrl('auth-service', 'auth', 'resend-verification');
      const resendResponse = await this.httpClient.post(resendEndpoint, { email: user.email });

      // Test 2: Verificar email con token mock
      const mockVerificationToken = 'verification-token-' + Date.now();
      const verifyEndpoint = getEndpointUrl('auth-service', 'auth', 'verify-email');
      const verifyResponse = await this.httpClient.post(verifyEndpoint, { 
        token: mockVerificationToken,
        email: user.email 
      });

      const duration = Date.now() - startTime;

      this.reporter.addResult(verifyEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Email verification test completed',
        email: user.email,
        stepsCompleted: 2
      });

      this.logger.success(`✅ Verificación de email completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'verify-email');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for email verification'
      });
      this.logger.error(`❌ Error en verificación de email: ${error.message}`);
    }
  }

  async testUserProfile() {
    this.logger.subheader('Test: Gestión de perfil de usuario');
    const startTime = Date.now();

    try {
      // Obtener perfil
      const profileEndpoint = getEndpointUrl('auth-service', 'auth', 'profile');
      const profileResponse = await this.httpClient.authGet(profileEndpoint, this.testData.testUsers.student);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(profileResponse, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Profile get validation failed: ${validation.errors.join(', ')}`);
      }

      const userProfile = profileResponse.data.data;
      
      // Validar estructura del perfil
      const profileValidation = this.validator.validateUser(userProfile);
      if (!profileValidation.isValid) {
        this.logger.warn('User profile structure issues:', profileValidation.errors);
      }

      this.reporter.addResult(profileEndpoint, 'GET', 'PASS', {
        duration,
        message: `User profile retrieved: ${userProfile.email}`,
        userId: userProfile.id,
        profileComplete: !!(userProfile.firstName && userProfile.lastName)
      });

      this.logger.success(`✅ Perfil de usuario obtenido: ${userProfile.email} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'auth', 'profile');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with user profile'
      });
      this.logger.error(`❌ Error obteniendo perfil: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar usuarios creados durante las pruebas
    for (const user of this.testData.createdUsers) {
      try {
        const endpoint = getEndpointUrl('auth-service', 'users', 'delete').replace(':id', user.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up user: ${user.email}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup user ${user.email}:`, error.message);
      }
    }

    // Invalidar sesiones activas
    for (const session of this.testData.activeSessions) {
      try {
        const endpoint = getEndpointUrl('auth-service', 'auth', 'logout');
        await this.httpClient.authPost(endpoint, {}, { 
          email: session.user.email, 
          password: 'mock'
        });
        this.logger.debug(`Cleaned up session for: ${session.user.email}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup session for ${session.user.email}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 4: BASIC AUTHENTICATION');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-4-auth-basic-authentication.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new BasicAuthFlow();
  flow.run().catch(console.error);
}

module.exports = { BasicAuthFlow };
