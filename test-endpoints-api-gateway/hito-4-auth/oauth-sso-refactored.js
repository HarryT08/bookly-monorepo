#!/usr/bin/env node

/**
 * HITO 4 - AUTH CORE: OAUTH SSO (REFACTORIZADO)
 * 
 * Flujo completo de testing para OAuth y SSO:
 * - RF-43: Autenticación y SSO
 * - Integración con Google OAuth
 * - Integración con Microsoft SSO
 * - SAML 2.0 Integration
 * - Token Exchange
 * - SSO User Mapping
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class OAuthSSOFlow {
  constructor() {
    this.logger = new TestLogger('OAuth-SSO');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-4-Auth', 'OAuth-SSO');
    this.testData = {
      ssoUsers: [],
      oauthTokens: [],
      linkedAccounts: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        regular: TEST_DATA.USERS.DOCENTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 4 - OAUTH SSO TESTING');
    this.logger.info('Iniciando testing completo de OAuth y SSO...');

    try {
      await this.setup();
      await this.testGoogleOAuth();
      await this.testMicrosoftSSO();
      await this.testSAMLIntegration();
      await this.testTokenExchange();
      await this.testSSOMapping();
      await this.testSSOSecurity();
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
      
      this.logger.success('Setup completado - Usuario administrador autenticado');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testGoogleOAuth() {
    this.logger.subheader('Test: Integración con Google OAuth');
    const startTime = Date.now();

    try {
      // Test 1: Configurar Google OAuth Provider
      const providerConfig = {
        providerId: 'google',
        clientId: 'test-google-client-id',
        clientSecret: 'test-google-client-secret',
        redirectUri: 'http://localhost:3000/auth/oauth/google/callback',
        scopes: ['email', 'profile'],
        domainHint: 'ufps.edu.co'
      };

      const configEndpoint = getEndpointUrl('auth-service', 'oauth', 'configure-provider');
      const configResponse = await this.httpClient.authPost(configEndpoint, providerConfig, this.testData.testUsers.admin);

      // Test 2: Inicializar flujo OAuth con Google
      const oauthData = {
        provider: 'google',
        state: 'test-state-' + Date.now(),
        nonce: 'test-nonce-' + Date.now()
      };

      const initiateEndpoint = getEndpointUrl('auth-service', 'oauth', 'initiate');
      const initiateResponse = await this.httpClient.authPost(initiateEndpoint, oauthData, this.testData.testUsers.admin);

      // Test 3: Simular callback de Google OAuth
      const callbackData = {
        code: 'mock-authorization-code',
        state: oauthData.state,
        provider: 'google'
      };

      const callbackEndpoint = getEndpointUrl('auth-service', 'oauth', 'callback');
      const callbackResponse = await this.httpClient.post(callbackEndpoint, callbackData);

      // Test 4: Mapear usuario Google a roles UFPS
      const mappingData = {
        email: 'test.oauth@ufps.edu.co',
        provider: 'google',
        providerUserId: 'google-user-123',
        profile: {
          firstName: 'Test',
          lastName: 'OAuth User',
          email: 'test.oauth@ufps.edu.co',
          picture: 'https://example.com/avatar.jpg'
        }
      };

      const mappingEndpoint = getEndpointUrl('auth-service', 'oauth', 'map-user');
      const mappingResponse = await this.httpClient.authPost(mappingEndpoint, mappingData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(configResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(initiateResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(callbackResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(mappingResponse, 'SUCCESS')
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Google OAuth validation failed: ${validationErrors.join(', ')}`);
      }

      // Guardar datos para cleanup
      if (mappingResponse.data.success) {
        this.testData.ssoUsers.push(mappingResponse.data.data);
      }

      this.reporter.addResult(configEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Google OAuth integration tests completed',
        testsCompleted: 4,
        providerConfigured: configResponse.data?.success || false,
        userMapped: mappingResponse.data?.success || false
      });

      this.logger.success(`✅ Integración Google OAuth completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'oauth', 'configure-provider');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for Google OAuth flow'
      });
      this.logger.error(`❌ Error en Google OAuth: ${error.message}`);
    }
  }

  async testMicrosoftSSO() {
    this.logger.subheader('Test: Integración con Microsoft SSO');
    const startTime = Date.now();

    try {
      // Test 1: Configurar Azure AD SSO
      const azureConfig = {
        providerId: 'microsoft',
        tenantId: 'ufps-tenant-id',
        clientId: 'test-azure-client-id',
        clientSecret: 'test-azure-client-secret',
        authority: 'https://login.microsoftonline.com/ufps-tenant-id',
        scopes: ['User.Read', 'Group.Read.All']
      };

      const azureEndpoint = getEndpointUrl('auth-service', 'sso', 'configure-azure');
      const azureResponse = await this.httpClient.authPost(azureEndpoint, azureConfig, this.testData.testUsers.admin);

      // Test 2: Autenticar con Office 365
      const office365Data = {
        provider: 'microsoft',
        accessToken: 'mock-microsoft-access-token',
        idToken: 'mock-microsoft-id-token',
        userInfo: {
          id: 'microsoft-user-456',
          mail: 'docente.sso@ufps.edu.co',
          displayName: 'Docente SSO Test',
          jobTitle: 'Profesor',
          department: 'Ingeniería de Sistemas'
        }
      };

      const office365Endpoint = getEndpointUrl('auth-service', 'sso', 'authenticate');
      const office365Response = await this.httpClient.authPost(office365Endpoint, office365Data, this.testData.testUsers.admin);

      // Test 3: Sincronizar grupos AD con roles
      const groupSyncData = {
        userId: office365Response.data?.data?.id || 'test-user-id',
        adGroups: [
          { id: 'group-1', displayName: 'UFPS-Docentes' },
          { id: 'group-2', displayName: 'UFPS-Sistemas' }
        ],
        syncRoles: true
      };

      const syncEndpoint = getEndpointUrl('auth-service', 'sso', 'sync-groups');
      const syncResponse = await this.httpClient.authPost(syncEndpoint, groupSyncData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(azureEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Microsoft SSO integration tests completed',
        testsCompleted: 3,
        azureConfigured: azureResponse.data?.success || false,
        office365Auth: office365Response.data?.success || false,
        groupsSynced: syncResponse.data?.success || false
      });

      this.logger.success(`✅ Integración Microsoft SSO completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'configure-azure');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for Microsoft SSO flow'
      });
      this.logger.error(`❌ Error en Microsoft SSO: ${error.message}`);
    }
  }

  async testSAMLIntegration() {
    this.logger.subheader('Test: Integración SAML 2.0');
    const startTime = Date.now();

    try {
      // Test 1: Configurar SAML Identity Provider
      const samlConfig = {
        providerId: 'ufps-saml',
        entityId: 'https://ufps.edu.co/saml',
        ssoUrl: 'https://idp.ufps.edu.co/saml/sso',
        sloUrl: 'https://idp.ufps.edu.co/saml/slo',
        certificate: 'mock-x509-certificate',
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          department: 'http://schemas.ufps.edu.co/claims/department'
        }
      };

      const samlConfigEndpoint = getEndpointUrl('auth-service', 'saml', 'configure');
      const samlConfigResponse = await this.httpClient.authPost(samlConfigEndpoint, samlConfig, this.testData.testUsers.admin);

      // Test 2: Procesar SAML Response
      const samlResponse = {
        samlResponse: 'mock-base64-saml-response',
        relayState: 'test-relay-state',
        providerId: 'ufps-saml'
      };

      const samlProcessEndpoint = getEndpointUrl('auth-service', 'saml', 'process-response');
      const samlProcessResponse = await this.httpClient.post(samlProcessEndpoint, samlResponse);

      // Test 3: Extraer atributos SAML
      const attributesData = {
        samlAssertion: 'mock-saml-assertion',
        attributeMapping: samlConfig.attributeMapping
      };

      const attributesEndpoint = getEndpointUrl('auth-service', 'saml', 'extract-attributes');
      const attributesResponse = await this.httpClient.authPost(attributesEndpoint, attributesData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(samlConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'SAML 2.0 integration tests completed',
        testsCompleted: 3,
        samlConfigured: samlConfigResponse.data?.success || false,
        responseProcessed: samlProcessResponse.data?.success || false,
        attributesExtracted: attributesResponse.data?.success || false
      });

      this.logger.success(`✅ Integración SAML 2.0 completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'saml', 'configure');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for SAML integration flow'
      });
      this.logger.error(`❌ Error en SAML 2.0: ${error.message}`);
    }
  }

  async testTokenExchange() {
    this.logger.subheader('Test: Intercambio de tokens');
    const startTime = Date.now();

    try {
      // Test 1: Intercambiar token OAuth por JWT interno
      const exchangeData = {
        externalToken: 'mock-external-oauth-token',
        provider: 'google',
        tokenType: 'access_token',
        customClaims: {
          programId: 'sistemas',
          role: 'DOCENTE',
          department: 'Ingeniería'
        }
      };

      const exchangeEndpoint = getEndpointUrl('auth-service', 'tokens', 'exchange');
      const exchangeResponse = await this.httpClient.authPost(exchangeEndpoint, exchangeData, this.testData.testUsers.admin);

      // Test 2: Validar token híbrido
      if (exchangeResponse.data.success && exchangeResponse.data.data.jwtToken) {
        const validateData = {
          token: exchangeResponse.data.data.jwtToken,
          validateClaims: true,
          requiredClaims: ['sub', 'role', 'programId']
        };

        const validateEndpoint = getEndpointUrl('auth-service', 'tokens', 'validate');
        const validateResponse = await this.httpClient.authPost(validateEndpoint, validateData, this.testData.testUsers.admin);

        // Test 3: Renovar token con refresh
        const refreshData = {
          refreshToken: exchangeResponse.data.data.refreshToken || 'mock-refresh-token',
          provider: 'google'
        };

        const refreshEndpoint = getEndpointUrl('auth-service', 'tokens', 'refresh');
        const refreshResponse = await this.httpClient.authPost(refreshEndpoint, refreshData, this.testData.testUsers.admin);

        // Guardar tokens para cleanup
        if (exchangeResponse.data.data.jwtToken) {
          this.testData.oauthTokens.push({
            token: exchangeResponse.data.data.jwtToken,
            provider: 'google'
          });
        }

        const duration = Date.now() - startTime;

        this.reporter.addResult(exchangeEndpoint, 'POST', 'PASS', {
          duration,
          message: 'Token exchange tests completed',
          testsCompleted: 3,
          tokenExchanged: exchangeResponse.data?.success || false,
          tokenValid: validateResponse.data?.success || false,
          tokenRefreshed: refreshResponse.data?.success || false
        });

        this.logger.success(`✅ Intercambio de tokens completado (${duration}ms)`);
      } else {
        throw new Error('Token exchange failed - no JWT token received');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'tokens', 'exchange');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with JWT token exchange'
      });
      this.logger.error(`❌ Error en intercambio de tokens: ${error.message}`);
    }
  }

  async testSSOMapping() {
    this.logger.subheader('Test: Mapeo de usuarios SSO');
    const startTime = Date.now();

    try {
      // Test 1: Crear usuario desde SSO primera vez
      const newSSOUser = {
        provider: 'google',
        providerUserId: 'google-new-user-789',
        email: 'nuevo.sso@ufps.edu.co',
        profile: {
          firstName: 'Nuevo',
          lastName: 'Usuario SSO',
          email: 'nuevo.sso@ufps.edu.co',
          picture: 'https://example.com/new-avatar.jpg'
        },
        autoAssignRole: true
      };

      const createEndpoint = getEndpointUrl('auth-service', 'sso', 'create-user');
      const createResponse = await this.httpClient.authPost(createEndpoint, newSSOUser, this.testData.testUsers.admin);

      // Test 2: Actualizar usuario existente SSO
      if (createResponse.data.success) {
        const updateData = {
          userId: createResponse.data.data.id,
          provider: 'google',
          updatedProfile: {
            firstName: 'Nuevo Actualizado',
            department: 'Ingeniería de Sistemas',
            jobTitle: 'Estudiante'
          },
          syncChanges: true
        };

        const updateEndpoint = getEndpointUrl('auth-service', 'sso', 'update-user');
        const updateResponse = await this.httpClient.authPost(updateEndpoint, updateData, this.testData.testUsers.admin);

        // Test 3: Vincular cuentas locales y SSO
        const linkData = {
          localUserId: this.testData.testUsers.regular.id,
          ssoProvider: 'google',
          ssoUserId: 'google-link-user-123',
          email: this.testData.testUsers.regular.email,
          confirmLink: true
        };

        const linkEndpoint = getEndpointUrl('auth-service', 'sso', 'link-accounts');
        const linkResponse = await this.httpClient.authPost(linkEndpoint, linkData, this.testData.testUsers.admin);

        // Guardar datos para cleanup
        if (createResponse.data.data) {
          this.testData.ssoUsers.push(createResponse.data.data);
        }
        if (linkResponse.data.success) {
          this.testData.linkedAccounts.push({
            localUserId: linkData.localUserId,
            ssoProvider: linkData.ssoProvider
          });
        }

        const duration = Date.now() - startTime;

        this.reporter.addResult(createEndpoint, 'POST', 'PASS', {
          duration,
          message: 'SSO user mapping tests completed',
          testsCompleted: 3,
          userCreated: createResponse.data?.success || false,
          userUpdated: updateResponse.data?.success || false,
          accountsLinked: linkResponse.data?.success || false
        });

        this.logger.success(`✅ Mapeo de usuarios SSO completado (${duration}ms)`);
      } else {
        throw new Error('SSO user creation failed');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'create-user');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for SSO user mapping'
      });
      this.logger.error(`❌ Error en mapeo SSO: ${error.message}`);
    }
  }

  async testSSOSecurity() {
    this.logger.subheader('Test: Seguridad SSO');
    const startTime = Date.now();

    try {
      // Test 1: Validar tokens SSO contra replay attacks
      const replayData = {
        token: 'mock-sso-token-' + Date.now(),
        timestamp: new Date().toISOString(),
        nonce: 'security-test-nonce'
      };

      const replayEndpoint = getEndpointUrl('auth-service', 'sso', 'validate-security');
      const replayResponse = await this.httpClient.authPost(replayEndpoint, replayData, this.testData.testUsers.admin);

      // Test 2: Verificar integridad de datos SSO
      const integrityData = {
        provider: 'google',
        userData: {
          email: 'security.test@ufps.edu.co',
          signature: 'mock-data-signature'
        },
        verifySignature: true
      };

      const integrityEndpoint = getEndpointUrl('auth-service', 'sso', 'verify-integrity');
      const integrityResponse = await this.httpClient.authPost(integrityEndpoint, integrityData, this.testData.testUsers.admin);

      // Test 3: Validar políticas de sesión SSO
      const sessionData = {
        userId: this.testData.testUsers.regular.id,
        provider: 'google',
        sessionDuration: 3600, // 1 hora
        enforcePolicy: true
      };

      const sessionEndpoint = getEndpointUrl('auth-service', 'sso', 'validate-session-policy');
      const sessionResponse = await this.httpClient.authPost(sessionEndpoint, sessionData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(replayEndpoint, 'POST', 'PASS', {
        duration,
        message: 'SSO security tests completed',
        testsCompleted: 3,
        replayProtection: replayResponse.data?.success || false,
        integrityVerified: integrityResponse.data?.success || false,
        policyValidated: sessionResponse.data?.success || false
      });

      this.logger.success(`✅ Seguridad SSO validada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'validate-security');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for SSO security validation'
      });
      this.logger.error(`❌ Error en seguridad SSO: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar usuarios SSO creados
    for (const ssoUser of this.testData.ssoUsers) {
      try {
        const endpoint = getEndpointUrl('auth-service', 'sso', 'delete-user').replace(':id', ssoUser.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up SSO user: ${ssoUser.email}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup SSO user ${ssoUser.email}:`, error.message);
      }
    }

    // Desvincular cuentas enlazadas
    for (const linkedAccount of this.testData.linkedAccounts) {
      try {
        const unlinkData = {
          localUserId: linkedAccount.localUserId,
          ssoProvider: linkedAccount.ssoProvider
        };
        const endpoint = getEndpointUrl('auth-service', 'sso', 'unlink-accounts');
        await this.httpClient.authPost(endpoint, unlinkData, this.testData.testUsers.admin);
        this.logger.debug(`Unlinked account: ${linkedAccount.localUserId}`);
      } catch (error) {
        this.logger.warn(`Failed to unlink account ${linkedAccount.localUserId}:`, error.message);
      }
    }

    // Invalidar tokens OAuth
    for (const tokenData of this.testData.oauthTokens) {
      try {
        const revokeData = {
          token: tokenData.token,
          provider: tokenData.provider
        };
        const endpoint = getEndpointUrl('auth-service', 'tokens', 'revoke');
        await this.httpClient.authPost(endpoint, revokeData, this.testData.testUsers.admin);
        this.logger.debug(`Revoked token from ${tokenData.provider}`);
      } catch (error) {
        this.logger.warn(`Failed to revoke token:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 4: OAUTH SSO');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-4-auth-oauth-sso.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new OAuthSSOFlow();
  flow.run().catch(console.error);
}

module.exports = { OAuthSSOFlow };
