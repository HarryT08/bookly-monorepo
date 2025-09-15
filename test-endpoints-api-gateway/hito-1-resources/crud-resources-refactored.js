#!/usr/bin/env node

/**
 * HITO 1 - RESOURCES CORE: CRUD RESOURCES (REFACTORIZADO)
 * 
 * Flujo completo de testing para operaciones CRUD de recursos:
 * - RF-01: Crear, editar y eliminar recursos
 * - RF-03: Definir atributos clave del recurso
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class ResourcesCrudFlow {
  constructor() {
    this.logger = new TestLogger('Resources-CRUD');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-1-Resources', 'CRUD-Resources');
    this.testData = {
      createdResources: [],
      adminUser: TEST_DATA.USERS.ADMIN_GENERAL,
      docenteUser: TEST_DATA.USERS.DOCENTE,
      estudianteUser: TEST_DATA.USERS.ESTUDIANTE
    };
  }

  async run() {
    this.logger.header('HITO 1 - RESOURCES CRUD FLOW');
    this.logger.info('Iniciando testing completo de operaciones CRUD de recursos...');

    try {
      await this.setup();
      await this.testListResources();
      await this.testSearchResources();
      await this.testGetResourceById();
      await this.testCreateResource();
      await this.testUpdateResource();
      await this.testDeleteResource();
      await this.testValidationErrors();
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
      await this.httpClient.authenticate(this.testData.adminUser);
      await this.httpClient.authenticate(this.testData.docenteUser);
      await this.httpClient.authenticate(this.testData.estudianteUser);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testListResources() {
    this.logger.subheader('Test: Listar recursos paginados');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('resources-service', 'resources', 'list');
      const response = await this.httpClient.get(endpoint, {
        params: { page: 1, limit: 10 }
      });

      const duration = Date.now() - startTime;
      
      // Validar respuesta usando TestValidator
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      // Validar recursos individualmente
      const resources = response.data.data;
      if (resources.length > 0) {
        for (const resource of resources) {
          const resourceValidation = this.validator.validateResource(resource);
          if (!resourceValidation.isValid) {
            this.logger.warn(`Resource ${resource.id} validation issues:`, resourceValidation.errors);
          }
        }
      }

      // Validar tiempo de respuesta
      const timeValidation = this.validator.validateResponseTime(duration, endpoint, 500);
      if (!timeValidation.isValid) {
        this.logger.warn('Performance issue:', timeValidation.errors);
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved ${resources.length} resources`,
        response: {
          total: response.data.meta.total,
          pages: response.data.meta.totalPages
        }
      });

      this.logger.success(`✅ Listado de recursos: ${resources.length} encontrados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'list');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with paginated resource list'
      });
      this.logger.error(`❌ Error listando recursos: ${error.message}`);
    }
  }

  async testSearchResources() {
    this.logger.subheader('Test: Buscar recursos');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('resources-service', 'resources', 'search');
      const searchQuery = 'Salón';
      
      const response = await this.httpClient.get(endpoint, {
        params: { q: searchQuery, page: 1, limit: 5 }
      });

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Search validation failed: ${validation.errors.join(', ')}`);
      }

      const results = response.data.data;
      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Found ${results.length} results for "${searchQuery}"`,
        searchQuery
      });

      this.logger.success(`✅ Búsqueda de recursos: ${results.length} encontrados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'search');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with search results'
      });
      this.logger.error(`❌ Error buscando recursos: ${error.message}`);
    }
  }

  async testGetResourceById() {
    this.logger.subheader('Test: Obtener recurso por ID');
    const startTime = Date.now();

    try {
      const resourceId = '1'; // Usar ID de semillas
      const endpoint = getEndpointUrl('resources-service', 'resources', 'getById').replace(':id', resourceId);
      
      const response = await this.httpClient.authGet(endpoint, this.testData.docenteUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Get by ID validation failed: ${validation.errors.join(', ')}`);
      }

      const resource = response.data.data;
      const resourceValidation = this.validator.validateResource(resource);
      
      if (!resourceValidation.isValid) {
        this.logger.warn('Resource structure issues:', resourceValidation.errors);
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved resource: ${resource.name}`,
        resourceId
      });

      this.logger.success(`✅ Recurso obtenido: ${resource.name} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'getById');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with resource details'
      });
      this.logger.error(`❌ Error obteniendo recurso: ${error.message}`);
    }
  }

  async testCreateResource() {
    this.logger.subheader('Test: Crear nuevo recurso');
    const startTime = Date.now();

    try {
      const resourceData = this.dataGenerator.getTestData(1, 'resource', {
        name: `Test Resource ${Date.now()}`,
        code: `TEST-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        categoryId: TEST_DATA.CATEGORIES.SALON.id,
        programId: TEST_DATA.PROGRAMS.SISTEMAS.id
      });

      const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
      const response = await this.httpClient.authPost(endpoint, resourceData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Create validation failed: ${validation.errors.join(', ')}`);
      }

      const createdResource = response.data.data;
      this.testData.createdResources.push(createdResource);

      // Validar que el recurso creado tiene la estructura correcta
      const resourceValidation = this.validator.validateResource(createdResource);
      if (!resourceValidation.isValid) {
        this.logger.warn('Created resource structure issues:', resourceValidation.errors);
      }

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Created resource: ${createdResource.name}`,
        resourceId: createdResource.id
      });

      this.logger.success(`✅ Recurso creado: ${createdResource.name} (ID: ${createdResource.id}) (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created resource'
      });
      this.logger.error(`❌ Error creando recurso: ${error.message}`);
    }
  }

  async testUpdateResource() {
    this.logger.subheader('Test: Actualizar recurso existente');
    
    if (this.testData.createdResources.length === 0) {
      this.logger.warn('No hay recursos creados para actualizar');
      return;
    }

    const startTime = Date.now();

    try {
      const resource = this.testData.createdResources[0];
      const updateData = {
        name: `${resource.name} - Actualizado`,
        description: 'Recurso actualizado durante testing',
        capacity: resource.capacity + 10
      };

      const endpoint = getEndpointUrl('resources-service', 'resources', 'update').replace(':id', resource.id);
      const response = await this.httpClient.authPut(endpoint, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Update validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedResource = response.data.data;

      this.reporter.addResult(endpoint, 'PUT', 'PASS', {
        duration,
        message: `Updated resource: ${updatedResource.name}`,
        resourceId: updatedResource.id
      });

      this.logger.success(`✅ Recurso actualizado: ${updatedResource.name} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'update');
      this.reporter.addResult(endpoint, 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated resource'
      });
      this.logger.error(`❌ Error actualizando recurso: ${error.message}`);
    }
  }

  async testDeleteResource() {
    this.logger.subheader('Test: Eliminar recurso');
    
    if (this.testData.createdResources.length === 0) {
      this.logger.warn('No hay recursos creados para eliminar');
      return;
    }

    const startTime = Date.now();

    try {
      const resource = this.testData.createdResources[0];
      const endpoint = getEndpointUrl('resources-service', 'resources', 'delete').replace(':id', resource.id);
      
      const response = await this.httpClient.authDelete(endpoint, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Delete validation failed: ${validation.errors.join(', ')}`);
      }

      this.reporter.addResult(endpoint, 'DELETE', 'PASS', {
        duration,
        message: `Deleted resource: ${resource.name}`,
        resourceId: resource.id
      });

      // Remover del array de recursos creados
      this.testData.createdResources = this.testData.createdResources.filter(r => r.id !== resource.id);

      this.logger.success(`✅ Recurso eliminado: ${resource.name} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'delete');
      this.reporter.addResult(endpoint, 'DELETE', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with deletion confirmation'
      });
      this.logger.error(`❌ Error eliminando recurso: ${error.message}`);
    }
  }

  async testValidationErrors() {
    this.logger.subheader('Test: Errores de validación');

    // Test 1: Crear recurso sin datos requeridos
    await this.testCreateResourceValidationError();
    
    // Test 2: Acceso sin permisos
    await this.testUnauthorizedAccess();
  }

  async testCreateResourceValidationError() {
    const startTime = Date.now();

    try {
      const invalidData = { name: '' }; // Datos inválidos
      const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
      
      const response = await this.httpClient.authPost(endpoint, invalidData, this.testData.adminUser);

      // Debería fallar
      const duration = Date.now() - startTime;
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: 'Should have failed with validation errors',
        expected: 'HTTP 400 with validation errors'
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.response && [400, 422].includes(error.response.status)) {
        const validation = this.validator.validateBooklyResponse(error.response, 'ERROR');
        
        const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
        this.reporter.addResult(endpoint, 'POST', 'PASS', {
          duration,
          message: 'Correctly rejected invalid data',
          statusCode: error.response.status
        });

        this.logger.success(`✅ Error de validación manejado correctamente (${duration}ms)`);
      } else {
        this.logger.error(`❌ Error inesperado: ${error.message}`);
      }
    }
  }

  async testUnauthorizedAccess() {
    const startTime = Date.now();

    try {
      const resourceData = this.dataGenerator.getTestData(1, 'resource');
      const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
      
      // Intentar crear con usuario estudiante (sin permisos)
      const response = await this.httpClient.authPost(endpoint, resourceData, this.testData.estudianteUser);

      // Debería fallar
      const duration = Date.now() - startTime;
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: 'Should have failed with authorization error',
        expected: 'HTTP 403 Forbidden'
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.response && [401, 403].includes(error.response.status)) {
        const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
        this.reporter.addResult(endpoint, 'POST', 'PASS', {
          duration,
          message: 'Correctly rejected unauthorized access',
          statusCode: error.response.status
        });

        this.logger.success(`✅ Acceso no autorizado rechazado correctamente (${duration}ms)`);
      } else {
        this.logger.error(`❌ Error inesperado: ${error.message}`);
      }
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    for (const resource of this.testData.createdResources) {
      try {
        const endpoint = getEndpointUrl('resources-service', 'resources', 'delete').replace(':id', resource.id);
        await this.httpClient.authDelete(endpoint, this.testData.adminUser);
        this.logger.debug(`Cleaned up resource: ${resource.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup resource ${resource.id}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 1: RESOURCES CRUD');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    // Guardar reporte detallado
    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-1-resources-crud.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new ResourcesCrudFlow();
  flow.run().catch(console.error);
}

module.exports = { ResourcesCrudFlow };
