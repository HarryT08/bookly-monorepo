#!/usr/bin/env node

/**
 * HITO 1 - RESOURCES CORE: CRUD RESOURCES
 * 
 * Flujo completo de testing para operaciones CRUD de recursos:
 * - RF-01: Crear, editar y eliminar recursos
 * - RF-03: Definir atributos clave del recurso
 * 
 * Endpoints probados:
 * - GET /api/v1/resources/resources (paginated)
 * - GET /api/v1/resources/resources/search
 * - GET /api/v1/resources/resources/:id
 * - GET /api/v1/resources/resources/code/:code
 * - POST /api/v1/resources/resources
 * - PUT /api/v1/resources/resources/:id
 * - DELETE /api/v1/resources/resources/:id
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
      // 1. Setup inicial
      await this.setup();
      
      // 2. Tests de lectura (sin autenticación)
      await this.testListResources();
      await this.testSearchResources();
      
      // 3. Tests de lectura con autenticación
      await this.testGetResourceById();
      await this.testGetResourceByCode();
      
      // 4. Tests de creación (requiere admin)
      await this.testCreateResource();
      await this.testCreateResourceWithAttributes();
      
      // 5. Tests de actualización
      await this.testUpdateResource();
      await this.testPartialUpdateResource();
      
      // 6. Tests de eliminación
      await this.testDeleteResource();
      
      // 7. Tests de validación y errores
      await this.testValidationErrors();
      await this.testPermissionErrors();
      
      // 8. Cleanup
      await this.cleanup();

    } catch (error) {
      this.logger.error('Flow failed with critical error:', error.message);
    } finally {
      // Generar reporte
      await this.generateReport();
    }
  }

  async setup() {
    this.logger.subheader('Setup - Preparación del entorno');
    
    try {
      // Autenticar usuarios para obtener tokens
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
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      // Validar estructura de recursos usando el validador específico
      const resources = response.data.data;
      if (resources.length > 0) {
        const resourceValidation = this.validator.validateEntityArray(
          resources.map(r => this.validator.validateResource(r).entity),
          [], [] // El validador específico ya maneja los campos
        );
        
        if (!resourceValidation.isValid) {
          this.logger.warn('Resource structure issues:', resourceValidation.errors);
        }
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved ${resources.length} resources`,
        response: {
          total: response.data.meta.total,
          pages: response.data.meta.totalPages
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'list');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with paginated resource list'
      });
    }
  }

  async testSearchResources() {
    this.logger.subheader('Test: Buscar recursos');
    const startTime = Date.now();

    try {
      const response = await httpClient.get('/api/v1/resources/search', {
        params: { q: 'Salón', limit: 5 }
      });

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const results = response.data.data;
      
      // Verificar que los resultados contienen el término de búsqueda
      const relevantResults = results.filter(resource => 
        resource.name.toLowerCase().includes('salón') ||
        resource.description?.toLowerCase().includes('salón')
      );

      this.reporter.addResult('/api/v1/resources/search', 'GET', 'PASS', {
        duration,
        message: `Found ${results.length} resources, ${relevantResults.length} relevant`,
        response: { searchTerm: 'Salón', results: results.length }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/search', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with search results'
      });
    }
  }

  async testGetResourceById() {
    this.logger.subheader('Test: Obtener recurso por ID');
    const startTime = Date.now();

    try {
      // Usar ID de recurso de semillas (Salón A-101)
      const resourceId = '1';
      const response = await httpClient.authGet(`/api/v1/resources/${resourceId}`, this.testData.docenteUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const resource = response.data.data;
      
      // Validar estructura del recurso
      const resourceValidation = this.validator.validateEntity(
        resource,
        ['id', 'name', 'code', 'capacity', 'isActive'],
        ['description', 'categoryId', 'programId', 'attributes', 'availability']
      );
      
      if (!resourceValidation.isValid) {
        this.logger.warn('Resource structure issues:', resourceValidation.errors);
      }

      this.reporter.addResult(`/api/v1/resources/${resourceId}`, 'GET', 'PASS', {
        duration,
        message: `Retrieved resource: ${resource.name}`,
        response: { resourceName: resource.name, code: resource.code }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/:id', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with resource details'
      });
    }
  }

  async testGetResourceByCode() {
    this.logger.subheader('Test: Obtener recurso por código');
    const startTime = Date.now();

    try {
      // Usar código de recurso de semillas
      const resourceCode = 'SA-101';
      const response = await httpClient.authGet(`/api/v1/resources/code/${resourceCode}`, this.testData.docenteUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const resource = response.data.data;
      
      // Verificar que el código coincide
      if (resource.code !== resourceCode) {
        throw new Error(`Code mismatch: expected ${resourceCode}, got ${resource.code}`);
      }

      this.reporter.addResult(`/api/v1/resources/code/${resourceCode}`, 'GET', 'PASS', {
        duration,
        message: `Retrieved resource by code: ${resource.name}`,
        response: { resourceName: resource.name, code: resource.code }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/code/:code', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with resource by code'
      });
    }
  }

  async testCreateResource() {
    this.logger.subheader('Test: Crear recurso básico');
    const startTime = Date.now();

    try {
      const newResource = TestUtils.generateTestData('resource', {
        name: 'Test Resource Basic',
        code: `TEST-BASIC-${Date.now()}`,
        description: 'Recurso de prueba para testing CRUD',
        capacity: 25
      });

      const response = await httpClient.authPost('/api/v1/resources', newResource, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const createdResource = response.data.data;
      
      // Verificar que los datos coinciden
      if (createdResource.name !== newResource.name) {
        throw new Error(`Name mismatch: expected ${newResource.name}, got ${createdResource.name}`);
      }

      // Guardar para cleanup
      this.testData.createdResources.push(createdResource);

      this.reporter.addResult('/api/v1/resources', 'POST', 'PASS', {
        duration,
        message: `Created resource: ${createdResource.name}`,
        response: { 
          resourceId: createdResource.id,
          name: createdResource.name,
          code: createdResource.code
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created resource'
      });
    }
  }

  async testCreateResourceWithAttributes() {
    this.logger.subheader('Test: Crear recurso con atributos');
    const startTime = Date.now();

    try {
      const newResource = TestUtils.generateTestData('resource', {
        name: 'Test Resource Advanced',
        code: `TEST-ADV-${Date.now()}`,
        description: 'Recurso con atributos técnicos',
        capacity: 40,
        attributes: {
          equipment: ['projector', 'computer', 'speakers'],
          accessibility: ['wheelchair_accessible', 'hearing_loop'],
          specialConditions: ['air_conditioning', 'natural_light'],
          technicalSpecs: {
            powerOutlets: 20,
            networkPorts: 15,
            audioSystem: true,
            videoSystem: true
          }
        }
      });

      const response = await httpClient.authPost('/api/v1/resources', newResource, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const createdResource = response.data.data;
      
      // Verificar que los atributos se guardaron
      if (!createdResource.attributes) {
        this.logger.warn('Attributes not saved in created resource');
      }

      // Guardar para cleanup
      this.testData.createdResources.push(createdResource);

      this.reporter.addResult('/api/v1/resources', 'POST', 'PASS', {
        duration,
        message: `Created resource with attributes: ${createdResource.name}`,
        response: { 
          resourceId: createdResource.id,
          hasAttributes: !!createdResource.attributes
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources [with attributes]', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created resource including attributes'
      });
    }
  }

  async testUpdateResource() {
    this.logger.subheader('Test: Actualizar recurso completo');
    
    if (this.testData.createdResources.length === 0) {
      this.reporter.addResult('/api/v1/resources/:id', 'PUT', 'SKIP', {
        reason: 'No resources created to update'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const resource = this.testData.createdResources[0];
      const updateData = {
        name: resource.name + ' - Updated',
        description: 'Recurso actualizado durante testing',
        capacity: resource.capacity + 5
      };

      const response = await httpClient.authPut(`/api/v1/resources/${resource.id}`, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedResource = response.data.data;
      
      // Verificar que los cambios se aplicaron
      if (updatedResource.name !== updateData.name) {
        throw new Error(`Name update failed: expected ${updateData.name}, got ${updatedResource.name}`);
      }

      this.reporter.addResult(`/api/v1/resources/${resource.id}`, 'PUT', 'PASS', {
        duration,
        message: `Updated resource: ${updatedResource.name}`,
        response: { 
          resourceId: updatedResource.id,
          changes: Object.keys(updateData)
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/:id', 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated resource'
      });
    }
  }

  async testPartialUpdateResource() {
    this.logger.subheader('Test: Actualización parcial de recurso');
    
    if (this.testData.createdResources.length < 2) {
      this.reporter.addResult('/api/v1/resources/:id [partial]', 'PUT', 'SKIP', {
        reason: 'Insufficient resources for partial update test'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const resource = this.testData.createdResources[1];
      const updateData = {
        capacity: 99 // Solo actualizar capacidad
      };

      const response = await httpClient.authPut(`/api/v1/resources/${resource.id}`, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedResource = response.data.data;
      
      // Verificar que solo la capacidad cambió
      if (updatedResource.capacity !== updateData.capacity) {
        throw new Error(`Capacity update failed: expected ${updateData.capacity}, got ${updatedResource.capacity}`);
      }

      this.reporter.addResult(`/api/v1/resources/${resource.id} [partial]`, 'PUT', 'PASS', {
        duration,
        message: `Partial update successful: capacity = ${updatedResource.capacity}`,
        response: { 
          resourceId: updatedResource.id,
          newCapacity: updatedResource.capacity
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/:id [partial]', 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with partially updated resource'
      });
    }
  }

  async testDeleteResource() {
    this.logger.subheader('Test: Eliminar recurso');
    
    if (this.testData.createdResources.length === 0) {
      this.reporter.addResult('/api/v1/resources/:id', 'DELETE', 'SKIP', {
        reason: 'No resources created to delete'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const resource = this.testData.createdResources.pop(); // Tomar el último
      
      const response = await httpClient.authDelete(`/api/v1/resources/${resource.id}`, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar código de respuesta (puede ser 204 o 200)
      if (![200, 204].includes(response.status)) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }

      // Verificar que el recurso ya no existe
      try {
        await httpClient.authGet(`/api/v1/resources/${resource.id}`, this.testData.docenteUser);
        throw new Error('Resource still accessible after deletion');
      } catch (notFoundError) {
        // Esto es lo esperado - el recurso debe devolver 404
        if (!notFoundError.message.includes('404')) {
          throw notFoundError;
        }
      }

      this.reporter.addResult(`/api/v1/resources/${resource.id}`, 'DELETE', 'PASS', {
        duration,
        message: `Resource deleted successfully: ${resource.name}`,
        response: { 
          deletedResourceId: resource.id,
          verified: true
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/:id', 'DELETE', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 204 and resource not accessible afterward'
      });
    }
  }

  async testValidationErrors() {
    this.logger.subheader('Test: Errores de validación');
    
    const tests = [
      {
        name: 'Create resource without name',
        data: { code: 'TEST-NO-NAME', capacity: 10 },
        expectedError: 'name'
      },
      {
        name: 'Create resource without code',
        data: { name: 'Test Resource No Code', capacity: 10 },
        expectedError: 'code'
      },
      {
        name: 'Create resource with invalid capacity',
        data: { name: 'Test Invalid Capacity', code: 'TEST-INV-CAP', capacity: -5 },
        expectedError: 'capacity'
      },
      {
        name: 'Create resource with duplicate code',
        data: { name: 'Test Duplicate', code: 'SA-101', capacity: 10 },
        expectedError: 'duplicate'
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      
      try {
        const response = await httpClient.authPost('/api/v1/resources', test.data, this.testData.adminUser);
        
        // Si llegamos aquí, la validación falló (debería haber dado error)
        const duration = Date.now() - startTime;
        this.reporter.addResult(`/api/v1/resources [${test.name}]`, 'POST', 'WARN', {
          duration,
          message: `Expected validation error but request succeeded`,
          response: { testCase: test.name }
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Verificar que es el error esperado
        const isExpectedError = error.message.toLowerCase().includes(test.expectedError) ||
                               error.status === 400 ||
                               error.status === 422;
        
        if (isExpectedError) {
          this.reporter.addResult(`/api/v1/resources [${test.name}]`, 'POST', 'PASS', {
            duration,
            message: `Validation error correctly caught`,
            response: { testCase: test.name, errorType: test.expectedError }
          });
        } else {
          this.reporter.addResult(`/api/v1/resources [${test.name}]`, 'POST', 'FAIL', {
            duration,
            error: `Unexpected error: ${error.message}`,
            expected: `Validation error containing '${test.expectedError}'`
          });
        }
      }
    }
  }

  async testPermissionErrors() {
    this.logger.subheader('Test: Errores de permisos');
    const startTime = Date.now();

    try {
      // Intentar crear recurso como estudiante (sin permisos)
      const newResource = TestUtils.generateTestData('resource', {
        name: 'Unauthorized Resource',
        code: `UNAUTH-${Date.now()}`
      });

      const response = await httpClient.authPost('/api/v1/resources', newResource, this.testData.estudianteUser);
      
      // Si llegamos aquí, la autorización falló
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources [unauthorized]', 'POST', 'WARN', {
        duration,
        message: `Expected permission error but request succeeded`,
        response: { userRole: this.testData.estudianteUser.role }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Verificar que es error de autorización
      const isAuthError = error.status === 401 || error.status === 403;
      
      if (isAuthError) {
        this.reporter.addResult('/api/v1/resources [unauthorized]', 'POST', 'PASS', {
          duration,
          message: `Permission correctly denied for ${this.testData.estudianteUser.role}`,
          response: { expectedError: 'Authorization', status: error.status }
        });
      } else {
        this.reporter.addResult('/api/v1/resources [unauthorized]', 'POST', 'FAIL', {
          duration,
          error: `Unexpected error: ${error.message}`,
          expected: 'HTTP 401 or 403 authorization error'
        });
      }
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');
    
    await TestUtils.cleanup(httpClient, this.testData.adminUser, this.testData.createdResources);
    
    this.logger.success(`Cleanup completed - ${this.testData.createdResources.length} resources cleaned`);
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final...');
    
    const reportPath = await this.reporter.saveReport();
    
    this.logger.finish(this.reporter.stats);
    this.logger.success(`Reporte guardado en: ${reportPath}`);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new ResourcesCrudFlow();
  flow.run().catch(console.error);
}

module.exports = { ResourcesCrudFlow };
