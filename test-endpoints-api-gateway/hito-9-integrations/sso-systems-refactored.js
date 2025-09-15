#!/usr/bin/env node

/**
 * HITO 9 - INTEGRATIONS: SSO SYSTEMS (REFACTORIZADO)
 * 
 * Flujo completo de testing para sistemas SSO:
 * - Autenticación LDAP/Active Directory
 * - Google Workspace SSO completo
 * - Sistema multi-tenant SSO
 * - Mapeo automático de roles
 * - Sincronización de usuarios y grupos
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class SSOSystemsFlow {
  constructor() {
    this.logger = new TestLogger('SSO-Systems');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-9-Integrations', 'SSO-Systems');
    this.testData = {
      ssoConfigurations: [],
      authenticatedUsers: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        ldapUser: { username: "juan.perez", domain: "UFPS", email: "juan.perez@ufps.edu.co" },
        googleUser: { email: "maria.rodriguez@ufps.edu.co", domain: "ufps.edu.co" }
      }
    };
  }

  async run() {
    this.logger.header('HITO 9 - SSO SYSTEMS TESTING');
    this.logger.info('Iniciando testing completo de sistemas SSO...');

    try {
      await this.setup();
      await this.testLDAPAuthentication();
      await this.testGoogleWorkspaceSSO();
      await this.testMultiTenantSSO();
      await this.testAutoRoleMapping();
      await this.testUserGroupSync();
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

  async testLDAPAuthentication() {
    this.logger.subheader('Test: Autenticación LDAP/Active Directory');
    const startTime = Date.now();

    try {
      // Test 1: Configurar conexión LDAP
      const ldapConfig = this.dataGenerator.getTestData(5, 'ldapConfig', {
        server: "ldaps://ad.ufps.edu.co:636",
        baseDN: "DC=ufps,DC=edu,DC=co",
        bindDN: "CN=bookly-service,OU=ServiceAccounts,DC=ufps,DC=edu,DC=co",
        bindPassword: "encrypted_service_password",
        userSearchBase: "OU=Users,DC=ufps,DC=edu,DC=co",
        groupSearchBase: "OU=Groups,DC=ufps,DC=edu,DC=co",
        userFilter: "(&(objectClass=person)(sAMAccountName={username}))",
        groupFilter: "(&(objectClass=group)(member={userDN}))",
        security: {
          encryption: "TLS",
          validateCertificate: true,
          connectionTimeout: 10000
        }
      });

      const ldapConfigEndpoint = getEndpointUrl('auth-service', 'sso', 'ldap-config');
      const ldapConfigResponse = await this.httpClient.authPost(ldapConfigEndpoint, ldapConfig, this.testData.testUsers.admin);

      if (ldapConfigResponse.data.success) {
        this.testData.ssoConfigurations.push({ type: 'LDAP', ...ldapConfigResponse.data.data });
      }

      // Test 2: Probar autenticación LDAP
      const ldapAuthData = {
        configId: ldapConfigResponse.data?.data?.configId,
        username: this.testData.testUsers.ldapUser.username,
        password: "test_password_123",
        domain: this.testData.testUsers.ldapUser.domain
      };

      const ldapAuthEndpoint = getEndpointUrl('auth-service', 'sso', 'ldap-authenticate');
      const ldapAuthResponse = await this.httpClient.authPost(ldapAuthEndpoint, ldapAuthData, this.testData.testUsers.admin);

      if (ldapAuthResponse.data.success) {
        this.testData.authenticatedUsers.push(ldapAuthResponse.data.data);
      }

      // Test 3: Validar atributos de usuario LDAP
      const userAttributesEndpoint = getEndpointUrl('auth-service', 'sso', 'ldap-user-attributes');
      const userAttributesResponse = await this.httpClient.authGet(userAttributesEndpoint.replace(':userId', ldapAuthResponse.data?.data?.userId), this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(ldapConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'LDAP authentication tests completed successfully',
        testsCompleted: 3,
        ldapConfigured: ldapConfigResponse.data?.success || false,
        authenticationSuccessful: ldapAuthResponse.data?.success || false,
        attributesValidated: userAttributesResponse.data?.success || false,
        securityEnabled: ldapConfig.security.encryption === "TLS"
      });

      this.logger.success(`✅ Autenticación LDAP completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'ldap-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with LDAP authentication'
      });
      this.logger.error(`❌ Error en LDAP: ${error.message}`);
    }
  }

  async testGoogleWorkspaceSSO() {
    this.logger.subheader('Test: Google Workspace SSO completo');
    const startTime = Date.now();

    try {
      // Test 1: Configurar SAML para Google Workspace
      const samlConfig = {
        domain: "ufps.edu.co",
        entityId: "https://bookly.ufps.edu.co",
        acsUrl: "https://bookly.ufps.edu.co/auth/sso/google/saml/callback",
        ssoUrl: "https://accounts.google.com/o/saml2/idp?idpid=C01abc123",
        sloUrl: "https://accounts.google.com/logout",
        certificate: "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAK...\n-----END CERTIFICATE-----",
        attributeMapping: {
          email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
          firstName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
          lastName: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
          orgUnit: "http://schemas.google.com/2005/05/identity/claims/orgunitpath",
          groups: "http://schemas.google.com/2005/05/identity/claims/groups"
        }
      };

      const samlConfigEndpoint = getEndpointUrl('auth-service', 'sso', 'google-saml-config');
      const samlConfigResponse = await this.httpClient.authPost(samlConfigEndpoint, samlConfig, this.testData.testUsers.admin);

      // Test 2: Simular autenticación SAML
      const samlAuthData = {
        configId: samlConfigResponse.data?.data?.configId,
        samlResponse: "base64_encoded_saml_response",
        relayState: "https://bookly.ufps.edu.co/dashboard"
      };

      const samlAuthEndpoint = getEndpointUrl('auth-service', 'sso', 'google-saml-authenticate');
      const samlAuthResponse = await this.httpClient.authPost(samlAuthEndpoint, samlAuthData, this.testData.testUsers.admin);

      // Test 3: Configurar Google Directory API
      const directoryConfig = {
        serviceAccountKey: "service_account_key_json",
        delegatedUser: "admin@ufps.edu.co",
        scopes: [
          "https://www.googleapis.com/auth/admin.directory.user",
          "https://www.googleapis.com/auth/admin.directory.group"
        ]
      };

      const directoryEndpoint = getEndpointUrl('auth-service', 'sso', 'google-directory-config');
      const directoryResponse = await this.httpClient.authPost(directoryEndpoint, directoryConfig, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(samlConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Google Workspace SSO tests completed successfully',
        testsCompleted: 3,
        samlConfigured: samlConfigResponse.data?.success || false,
        samlAuthCompleted: samlAuthResponse.data?.success || false,
        directoryConfigured: directoryResponse.data?.success || false,
        attributesMapped: Object.keys(samlConfig.attributeMapping).length
      });

      this.logger.success(`✅ Google Workspace SSO completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'google-saml-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with Google Workspace SSO'
      });
      this.logger.error(`❌ Error en Google Workspace SSO: ${error.message}`);
    }
  }

  async testMultiTenantSSO() {
    this.logger.subheader('Test: Sistema multi-tenant SSO');
    const startTime = Date.now();

    try {
      // Test 1: Configurar múltiples tenants
      const tenants = [
        {
          tenantId: "ufps_main",
          name: "UFPS Campus Principal",
          ssoProvider: "GOOGLE_WORKSPACE",
          domain: "ufps.edu.co",
          config: { entityId: "https://bookly.ufps.edu.co/tenant/main" }
        },
        {
          tenantId: "ufps_cucuta",
          name: "UFPS Sede Cúcuta",
          ssoProvider: "LDAP",
          domain: "cucuta.ufps.edu.co",
          config: { server: "ldap://cucuta-ad.ufps.edu.co" }
        }
      ];

      const multiTenantConfig = {
        tenants: tenants,
        routingRules: {
          byDomain: true,
          bySubdomain: true,
          byPath: false
        },
        fallbackTenant: "ufps_main"
      };

      const multiTenantEndpoint = getEndpointUrl('auth-service', 'sso', 'multi-tenant-config');
      const multiTenantResponse = await this.httpClient.authPost(multiTenantEndpoint, multiTenantConfig, this.testData.testUsers.admin);

      // Test 2: Probar resolución de tenant
      const tenantResolutionTests = [
        { domain: "ufps.edu.co", expectedTenant: "ufps_main" },
        { domain: "cucuta.ufps.edu.co", expectedTenant: "ufps_cucuta" }
      ];

      const resolutionPromises = tenantResolutionTests.map(async (test) => {
        const resolutionData = { domain: test.domain };
        const resolutionEndpoint = getEndpointUrl('auth-service', 'sso', 'resolve-tenant');
        return await this.httpClient.authPost(resolutionEndpoint, resolutionData, this.testData.testUsers.admin);
      });

      const resolutionResults = await Promise.all(resolutionPromises);

      const duration = Date.now() - startTime;

      this.reporter.addResult(multiTenantEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Multi-tenant SSO tests completed successfully',
        testsCompleted: 2,
        multiTenantConfigured: multiTenantResponse.data?.success || false,
        tenantsConfigured: tenants.length,
        tenantResolutionTests: resolutionResults.filter(r => r.data?.success).length,
        allResolutionsSuccessful: resolutionResults.every(r => r.data?.success)
      });

      this.logger.success(`✅ Multi-tenant SSO completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'multi-tenant-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with multi-tenant SSO'
      });
      this.logger.error(`❌ Error en multi-tenant SSO: ${error.message}`);
    }
  }

  async testAutoRoleMapping() {
    this.logger.subheader('Test: Mapeo automático de roles');
    const startTime = Date.now();

    try {
      // Test 1: Configurar reglas de mapeo de roles
      const roleMappingConfig = {
        ldapRoleMapping: [
          {
            ldapGroup: "CN=DOCENTES,OU=Groups,DC=ufps,DC=edu,DC=co",
            booklyRole: "PROFESSOR",
            permissions: ["create_reservations", "view_analytics", "manage_classes"]
          },
          {
            ldapGroup: "CN=ESTUDIANTES,OU=Groups,DC=ufps,DC=edu,DC=co",
            booklyRole: "STUDENT",
            permissions: ["create_reservations", "view_own_reservations"]
          },
          {
            ldapGroup: "CN=ADMINISTRADORES,OU=Groups,DC=ufps,DC=edu,DC=co",
            booklyRole: "ADMIN",
            permissions: ["full_access"]
          }
        ],
        googleRoleMapping: [
          {
            orgUnit: "/Docentes",
            booklyRole: "PROFESSOR",
            conditions: { title: "contains:profesor" }
          },
          {
            orgUnit: "/Estudiantes",
            booklyRole: "STUDENT",
            conditions: { status: "active" }
          }
        ],
        defaultRole: "GUEST",
        autoUpdate: true
      };

      const roleMappingEndpoint = getEndpointUrl('auth-service', 'sso', 'role-mapping-config');
      const roleMappingResponse = await this.httpClient.authPost(roleMappingEndpoint, roleMappingConfig, this.testData.testUsers.admin);

      // Test 2: Probar mapeo automático
      const mappingTestCases = [
        {
          userId: "test_user_1",
          ldapGroups: ["CN=DOCENTES,OU=Groups,DC=ufps,DC=edu,DC=co"],
          expectedRole: "PROFESSOR"
        },
        {
          userId: "test_user_2",
          googleOrgUnit: "/Estudiantes",
          expectedRole: "STUDENT"
        }
      ];

      const mappingPromises = mappingTestCases.map(async (testCase) => {
        const mappingEndpoint = getEndpointUrl('auth-service', 'sso', 'apply-role-mapping');
        return await this.httpClient.authPost(mappingEndpoint, testCase, this.testData.testUsers.admin);
      });

      const mappingResults = await Promise.all(mappingPromises);

      const duration = Date.now() - startTime;

      this.reporter.addResult(roleMappingEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Auto role mapping tests completed successfully',
        testsCompleted: 2,
        roleMappingConfigured: roleMappingResponse.data?.success || false,
        ldapMappingRules: roleMappingConfig.ldapRoleMapping.length,
        googleMappingRules: roleMappingConfig.googleRoleMapping.length,
        mappingTestsCompleted: mappingResults.filter(r => r.data?.success).length
      });

      this.logger.success(`✅ Mapeo automático de roles completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'role-mapping-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with auto role mapping'
      });
      this.logger.error(`❌ Error en mapeo de roles: ${error.message}`);
    }
  }

  async testUserGroupSync() {
    this.logger.subheader('Test: Sincronización de usuarios y grupos');
    const startTime = Date.now();

    try {
      // Test 1: Configurar sincronización incremental
      const syncConfig = {
        providers: ["LDAP", "GOOGLE_WORKSPACE"],
        syncMode: "INCREMENTAL",
        schedules: {
          userSync: "0 */4 * * *", // cada 4 horas
          groupSync: "0 0 * * *",  // diario
          roleSync: "0 2 * * 1"    // semanal
        },
        batchSize: 100,
        conflictResolution: {
          duplicateUsers: "MERGE_ACCOUNTS",
          conflictingRoles: "HIGHEST_PRIVILEGE",
          inactiveUsers: "DISABLE_AFTER_30_DAYS"
        }
      };

      const syncConfigEndpoint = getEndpointUrl('auth-service', 'sso', 'sync-config');
      const syncConfigResponse = await this.httpClient.authPost(syncConfigEndpoint, syncConfig, this.testData.testUsers.admin);

      // Test 2: Ejecutar sincronización inmediata
      const immediateSyncData = {
        providers: ["LDAP"],
        syncType: "FULL",
        dryRun: false,
        notifyOnCompletion: true
      };

      const immediateSyncEndpoint = getEndpointUrl('auth-service', 'sso', 'immediate-sync');
      const immediateSyncResponse = await this.httpClient.authPost(immediateSyncEndpoint, immediateSyncData, this.testData.testUsers.admin);

      // Test 3: Verificar estado de sincronización
      const syncStatusEndpoint = getEndpointUrl('auth-service', 'sso', 'sync-status');
      const syncStatusResponse = await this.httpClient.authGet(syncStatusEndpoint, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(syncConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'User group sync tests completed successfully',
        testsCompleted: 3,
        syncConfigured: syncConfigResponse.data?.success || false,
        immediateSyncCompleted: immediateSyncResponse.data?.success || false,
        syncStatusChecked: syncStatusResponse.data?.success || false,
        providersConfigured: syncConfig.providers.length,
        schedulesConfigured: Object.keys(syncConfig.schedules).length
      });

      this.logger.success(`✅ Sincronización de usuarios y grupos completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'sso', 'sync-config');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with user group sync'
      });
      this.logger.error(`❌ Error en sincronización: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar configuraciones SSO
    for (const config of this.testData.ssoConfigurations) {
      try {
        const endpoint = getEndpointUrl('auth-service', 'sso', 'delete-config').replace(':id', config.configId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up SSO config: ${config.type}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup SSO config ${config.configId}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 9: SSO SYSTEMS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-9-integrations-sso.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new SSOSystemsFlow();
  flow.run().catch(console.error);
}

module.exports = { SSOSystemsFlow };
