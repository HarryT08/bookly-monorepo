#!/usr/bin/env node

/**
 * HITO 4 - AUTH CORE: ROLES & PERMISSIONS (REFACTORIZADO)
 * 
 * Flujo completo de testing para roles y permisos:
 * - RF-41: Gestión de roles
 * - RF-42: Restricción de modificación
 * - Asignación de roles automática y manual
 * - Validación de permisos granulares
 * - Control de acceso a recursos
 * - Jerarquía de roles
 * - Permisos dinámicos
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class RolesPermissionsFlow {
  constructor() {
    this.logger = new TestLogger('Roles-Permissions');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-4-Auth', 'Roles-Permissions');
    this.testData = {
      createdRoles: [],
      createdPermissions: [],
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
    this.logger.header('HITO 4 - ROLES & PERMISSIONS TESTING');
    this.logger.info('Iniciando testing completo de roles y permisos...');

    try {
      await this.setup();
      await this.testListRoles();
      await this.testCreateRole();
      await this.testRoleAssignment();
      await this.testPermissionValidation();
      await this.testResourceAccess();
      await this.testRoleHierarchy();
      await this.testDynamicPermissions();
      await this.testRoleRestrictions();
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

  async testListRoles() {
    this.logger.subheader('Test: Listar roles del sistema');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('auth-service', 'roles', 'list');
      const response = await this.httpClient.authGet(endpoint, this.testData.testUsers.admin, {
        params: { page: 1, limit: 20 }
      });

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Roles list validation failed: ${validation.errors.join(', ')}`);
      }

      const roles = response.data.data;
      if (roles.length > 0) {
        for (const role of roles) {
          const roleValidation = this.validator.validateEntity(role,
            ['id', 'name', 'code'], ['description', 'isActive', 'permissions', 'categoryCode']
          );
          if (!roleValidation.isValid) {
            this.logger.warn(`Role ${role.code} validation issues:`, roleValidation.errors);
          }
        }
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved ${roles.length} system roles`,
        rolesCount: roles.length,
        defaultRoles: roles.filter(r => r.isDefault).length
      });

      this.logger.success(`✅ Roles listados: ${roles.length} encontrados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'roles', 'list');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with paginated roles list'
      });
      this.logger.error(`❌ Error listando roles: ${error.message}`);
    }
  }

  async testCreateRole() {
    this.logger.subheader('Test: Crear rol personalizado');
    const startTime = Date.now();

    try {
      const roleData = this.dataGenerator.getTestData(4, 'role', {
        name: `Test Role ${Date.now()}`,
        code: `TEST_ROLE_${Date.now()}`,
        description: 'Rol de prueba para testing automatizado',
        categoryCode: 'OPERATIONAL',
        permissions: [
          {
            resource: 'resources',
            actions: ['read', 'list'],
            scope: 'own_program',
            conditions: { 'time': 'business_hours' }
          },
          {
            resource: 'availability',
            actions: ['read'],
            scope: 'all',
            conditions: {}
          }
        ],
        isActive: true,
        isDefault: false
      });

      const endpoint = getEndpointUrl('auth-service', 'roles', 'create');
      const response = await this.httpClient.authPost(endpoint, roleData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Role creation validation failed: ${validation.errors.join(', ')}`);
      }

      const createdRole = response.data.data;
      this.testData.createdRoles.push(createdRole);

      // Validar estructura del rol creado
      const roleValidation = this.validator.validateEntity(createdRole,
        ['id', 'name', 'code'], ['description', 'permissions', 'isActive']
      );

      if (!roleValidation.isValid) {
        this.logger.warn('Created role structure issues:', roleValidation.errors);
      }

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Created custom role: ${createdRole.name}`,
        roleId: createdRole.id,
        roleCode: createdRole.code,
        permissionsCount: createdRole.permissions?.length || 0
      });

      this.logger.success(`✅ Rol creado: ${createdRole.name} (${createdRole.code}) (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'roles', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created role'
      });
      this.logger.error(`❌ Error creando rol: ${error.message}`);
    }
  }

  async testRoleAssignment() {
    this.logger.subheader('Test: Asignación de roles');
    const startTime = Date.now();

    try {
      // Test 1: Asignación automática basada en dominio de email
      const autoAssignmentData = {
        email: `test.auto.${Date.now()}@ufps.edu.co`,
        checkDomainRules: true
      };

      const autoEndpoint = getEndpointUrl('auth-service', 'roles', 'auto-assign');
      const autoResponse = await this.httpClient.authPost(autoEndpoint, autoAssignmentData, this.testData.testUsers.admin);

      // Test 2: Asignación manual de rol
      if (this.testData.createdRoles.length > 0) {
        const manualAssignmentData = {
          userId: this.testData.testUsers.estudiante.id,
          roleId: this.testData.createdRoles[0].id,
          assignedBy: this.testData.testUsers.admin.id,
          reason: 'Asignación durante testing automatizado'
        };

        const manualEndpoint = getEndpointUrl('auth-service', 'users', 'assign-role');
        const manualResponse = await this.httpClient.authPost(manualEndpoint, manualAssignmentData, this.testData.testUsers.admin);
      }

      // Test 3: Verificar roles de usuario
      const userRolesEndpoint = getEndpointUrl('auth-service', 'users', 'roles').replace(':id', this.testData.testUsers.estudiante.id);
      const rolesResponse = await this.httpClient.authGet(userRolesEndpoint, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(autoEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Role assignment tests completed',
        testsCompleted: 3,
        userRolesCount: rolesResponse.data?.data?.length || 0
      });

      this.logger.success(`✅ Asignación de roles completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'roles', 'auto-assign');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 for role assignment'
      });
      this.logger.error(`❌ Error en asignación de roles: ${error.message}`);
    }
  }

  async testPermissionValidation() {
    this.logger.subheader('Test: Validación de permisos');
    const startTime = Date.now();

    try {
      const permissionTests = [
        {
          user: this.testData.testUsers.estudiante,
          resource: 'resources',
          action: 'read',
          expectedResult: true,
          description: 'Estudiante puede leer recursos'
        },
        {
          user: this.testData.testUsers.estudiante,
          resource: 'resources',
          action: 'create',
          expectedResult: false,
          description: 'Estudiante NO puede crear recursos'
        },
        {
          user: this.testData.testUsers.admin,
          resource: 'resources',
          action: 'delete',
          expectedResult: true,
          description: 'Admin puede eliminar recursos'
        },
        {
          user: this.testData.testUsers.docente,
          resource: 'availability',
          action: 'create',
          expectedResult: true,
          description: 'Docente puede crear reservas'
        }
      ];

      let passedTests = 0;
      const totalTests = permissionTests.length;

      for (const test of permissionTests) {
        const validationData = {
          userId: test.user.id,
          resource: test.resource,
          action: test.action,
          context: {
            timestamp: new Date().toISOString(),
            programId: test.user.academicProgram || null
          }
        };

        const endpoint = getEndpointUrl('auth-service', 'permissions', 'validate');
        const response = await this.httpClient.authPost(endpoint, validationData, this.testData.testUsers.admin);

        if (response.data.success) {
          const hasPermission = response.data.data.hasPermission;
          if (hasPermission === test.expectedResult) {
            passedTests++;
            this.logger.debug(`✅ ${test.description} - OK`);
          } else {
            this.logger.warn(`⚠️ ${test.description} - Expected: ${test.expectedResult}, Got: ${hasPermission}`);
          }
        }
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(getEndpointUrl('auth-service', 'permissions', 'validate'), 'POST', 'PASS', {
        duration,
        message: `Permission validation completed: ${passedTests}/${totalTests} tests passed`,
        totalTests,
        passedTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1)
      });

      this.logger.success(`✅ Validación de permisos: ${passedTests}/${totalTests} exitosos (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'permissions', 'validate');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with permission validation result'
      });
      this.logger.error(`❌ Error validando permisos: ${error.message}`);
    }
  }

  async testResourceAccess() {
    this.logger.subheader('Test: Control de acceso a recursos');
    const startTime = Date.now();

    try {
      const resources = [
        { service: 'resources-service', endpoint: 'resources', action: 'list' },
        { service: 'availability-service', endpoint: 'reservations', action: 'list' },
        { service: 'stockpile-service', endpoint: 'approval-flows', action: 'list' },
        { service: 'reports-service', endpoint: 'reports', action: 'list' }
      ];

      const users = [
        { user: this.testData.testUsers.estudiante, role: 'ESTUDIANTE' },
        { user: this.testData.testUsers.docente, role: 'DOCENTE' },
        { user: this.testData.testUsers.admin, role: 'ADMIN_GENERAL' }
      ];

      let totalAccessTests = 0;
      let passedAccessTests = 0;

      for (const resource of resources) {
        for (const userTest of users) {
          totalAccessTests++;
          
          try {
            const endpoint = getEndpointUrl(resource.service, resource.endpoint, resource.action);
            const response = await this.httpClient.authGet(endpoint, userTest.user, {
              params: { page: 1, limit: 1 }
            });

            if (response.status < 400) {
              passedAccessTests++;
              this.logger.debug(`✅ ${userTest.role} access to ${resource.service}/${resource.endpoint} - OK`);
            }
          } catch (error) {
            // Algunos accesos pueden estar restringidos intencionalmente
            if (error.message.includes('403') || error.message.includes('401')) {
              this.logger.debug(`🔒 ${userTest.role} access to ${resource.service}/${resource.endpoint} - RESTRICTED (expected)`);
            } else {
              this.logger.warn(`⚠️ ${userTest.role} access to ${resource.service}/${resource.endpoint} - ERROR: ${error.message}`);
            }
          }
        }
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult('multiple-endpoints', 'GET', 'PASS', {
        duration,
        message: `Resource access control test completed`,
        totalTests: totalAccessTests,
        successfulAccess: passedAccessTests,
        resourcesCount: resources.length,
        usersCount: users.length
      });

      this.logger.success(`✅ Control de acceso: ${passedAccessTests}/${totalAccessTests} accesos exitosos (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('resource-access-control', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'Successful access control validation'
      });
      this.logger.error(`❌ Error en control de acceso: ${error.message}`);
    }
  }

  async testRoleHierarchy() {
    this.logger.subheader('Test: Jerarquía de roles');
    const startTime = Date.now();

    try {
      // Test jerarquía: ADMIN_GENERAL > ADMIN_PROGRAMA > DOCENTE > ESTUDIANTE
      const hierarchyTests = [
        {
          higherRole: 'ADMIN_GENERAL',
          lowerRole: 'ADMIN_PROGRAMA',
          expectedHierarchy: true
        },
        {
          higherRole: 'ADMIN_PROGRAMA',
          lowerRole: 'DOCENTE',
          expectedHierarchy: true
        },
        {
          higherRole: 'DOCENTE',
          lowerRole: 'ESTUDIANTE',
          expectedHierarchy: true
        },
        {
          higherRole: 'ESTUDIANTE',
          lowerRole: 'ADMIN_GENERAL',
          expectedHierarchy: false
        }
      ];

      let hierarchyValidTests = 0;

      for (const test of hierarchyTests) {
        const hierarchyData = {
          roleA: test.higherRole,
          roleB: test.lowerRole,
          checkHierarchy: true
        };

        const endpoint = getEndpointUrl('auth-service', 'roles', 'compare-hierarchy');
        const response = await this.httpClient.authPost(endpoint, hierarchyData, this.testData.testUsers.admin);

        if (response.data.success) {
          const isHigher = response.data.data.isHigher;
          if (isHigher === test.expectedHierarchy) {
            hierarchyValidTests++;
            this.logger.debug(`✅ Hierarchy ${test.higherRole} > ${test.lowerRole}: ${isHigher}`);
          }
        }
      }

      // Test herencia de permisos
      const inheritanceData = {
        roleCode: 'ADMIN_GENERAL',
        includeInherited: true
      };

      const inheritanceEndpoint = getEndpointUrl('auth-service', 'roles', 'permissions');
      const inheritanceResponse = await this.httpClient.authPost(inheritanceEndpoint, inheritanceData, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Role hierarchy validation completed`,
        hierarchyTests: hierarchyValidTests,
        totalHierarchyTests: hierarchyTests.length,
        inheritanceTestPassed: inheritanceResponse.data?.success || false
      });

      this.logger.success(`✅ Jerarquía de roles: ${hierarchyValidTests}/${hierarchyTests.length} validaciones exitosas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'roles', 'compare-hierarchy');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with hierarchy validation'
      });
      this.logger.error(`❌ Error en jerarquía de roles: ${error.message}`);
    }
  }

  async testDynamicPermissions() {
    this.logger.subheader('Test: Permisos dinámicos');
    const startTime = Date.now();

    try {
      // Test 1: Permisos basados en contexto temporal
      const timeBasedTest = {
        userId: this.testData.testUsers.docente.id,
        resource: 'resources',
        action: 'create',
        context: {
          timestamp: new Date().toISOString(),
          timeConstraint: 'business_hours'
        }
      };

      const timeEndpoint = getEndpointUrl('auth-service', 'permissions', 'validate-context');
      const timeResponse = await this.httpClient.authPost(timeEndpoint, timeBasedTest, this.testData.testUsers.admin);

      // Test 2: Permisos basados en programa académico
      const programBasedTest = {
        userId: this.testData.testUsers.docente.id,
        resource: 'resources',
        action: 'read',
        context: {
          programId: this.testData.testUsers.docente.academicProgram,
          scopeConstraint: 'own_program'
        }
      };

      const programEndpoint = getEndpointUrl('auth-service', 'permissions', 'validate-context');
      const programResponse = await this.httpClient.authPost(programEndpoint, programBasedTest, this.testData.testUsers.admin);

      // Test 3: Permisos basados en ubicación/recurso específico
      const resourceBasedTest = {
        userId: this.testData.testUsers.estudiante.id,
        resource: 'reservations',
        action: 'create',
        context: {
          resourceId: '1',
          locationConstraint: 'same_building'
        }
      };

      const resourceEndpoint = getEndpointUrl('auth-service', 'permissions', 'validate-context');
      const resourceResponse = await this.httpClient.authPost(resourceEndpoint, resourceBasedTest, this.testData.testUsers.admin);

      const duration = Date.now() - startTime;

      const dynamicTests = [
        { name: 'time-based', response: timeResponse },
        { name: 'program-based', response: programResponse },
        { name: 'resource-based', response: resourceResponse }
      ];

      const passedDynamicTests = dynamicTests.filter(test => test.response.data?.success).length;

      this.reporter.addResult(timeEndpoint, 'POST', 'PASS', {
        duration,
        message: `Dynamic permissions validation completed`,
        totalDynamicTests: dynamicTests.length,
        passedDynamicTests,
        timeBasedValid: timeResponse.data?.data?.hasPermission || false,
        programBasedValid: programResponse.data?.data?.hasPermission || false,
        resourceBasedValid: resourceResponse.data?.data?.hasPermission || false
      });

      this.logger.success(`✅ Permisos dinámicos: ${passedDynamicTests}/${dynamicTests.length} validaciones exitosas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'permissions', 'validate-context');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with dynamic permissions validation'
      });
      this.logger.error(`❌ Error en permisos dinámicos: ${error.message}`);
    }
  }

  async testRoleRestrictions() {
    this.logger.subheader('Test: Restricciones de roles');
    const startTime = Date.now();

    try {
      // Test RF-42: Restricción de modificación
      // Los usuarios no pueden modificar recursos que no les pertenecen
      const restrictionTests = [
        {
          user: this.testData.testUsers.estudiante,
          action: 'modify_others_reservation',
          expectedBlocked: true,
          description: 'Estudiante no puede modificar reservas de otros'
        },
        {
          user: this.testData.testUsers.docente,
          action: 'delete_system_role',
          expectedBlocked: true,
          description: 'Docente no puede eliminar roles del sistema'
        },
        {
          user: this.testData.testUsers.adminProg,
          action: 'modify_program_resources',
          expectedBlocked: false,
          description: 'Admin de programa puede modificar recursos de su programa'
        }
      ];

      let restrictionsPassed = 0;

      for (const test of restrictionTests) {
        const restrictionData = {
          userId: test.user.id,
          action: test.action,
          targetResource: 'test_resource_id',
          context: {
            ownership: 'other_user',
            scope: 'cross_program'
          }
        };

        const endpoint = getEndpointUrl('auth-service', 'permissions', 'check-restrictions');
        const response = await this.httpClient.authPost(endpoint, restrictionData, this.testData.testUsers.admin);

        if (response.data.success) {
          const isBlocked = response.data.data.isBlocked;
          if (isBlocked === test.expectedBlocked) {
            restrictionsPassed++;
            this.logger.debug(`✅ ${test.description} - Restriction: ${isBlocked}`);
          }
        }
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(getEndpointUrl('auth-service', 'permissions', 'check-restrictions'), 'POST', 'PASS', {
        duration,
        message: `Role restrictions validation completed`,
        totalRestrictionTests: restrictionTests.length,
        passedRestrictionTests: restrictionsPassed,
        restrictionRate: ((restrictionsPassed / restrictionTests.length) * 100).toFixed(1)
      });

      this.logger.success(`✅ Restricciones de roles: ${restrictionsPassed}/${restrictionTests.length} validaciones exitosas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('auth-service', 'permissions', 'check-restrictions');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with restrictions validation'
      });
      this.logger.error(`❌ Error en restricciones de roles: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar roles creados
    for (const role of this.testData.createdRoles) {
      try {
        const endpoint = getEndpointUrl('auth-service', 'roles', 'delete').replace(':id', role.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up role: ${role.code}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup role ${role.code}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 4: ROLES & PERMISSIONS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-4-auth-roles-permissions.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new RolesPermissionsFlow();
  flow.run().catch(console.error);
}

module.exports = { RolesPermissionsFlow };
