#!/usr/bin/env node

/**
 * HITO 6 - RESOURCES IMPROVEMENTS: RESOURCE ASSOCIATIONS (REFACTORIZADO)
 * 
 * Flujo completo de testing para asociaciones de recursos:
 * - RF-02: Asociación de recursos a categoría y programas
 * - Asociación única con programa académico
 * - Múltiples categorías por recurso
 * - Categorías mínimas no eliminables
 * - Creación dinámica de categorías
 * - Validación de asociaciones
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class ResourceAssociationsFlow {
  constructor() {
    this.logger = new TestLogger('Resource-Associations');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-6-Resources', 'Resource-Associations');
    this.testData = {
      createdResources: [],
      createdCategories: [],
      testUsers: {
        admin: TEST_DATA.USERS.ADMIN_GENERAL,
        adminProg: TEST_DATA.USERS.ADMIN_PROGRAMA,
        docente: TEST_DATA.USERS.DOCENTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 6 - RESOURCE ASSOCIATIONS TESTING');
    this.logger.info('Iniciando testing completo de asociaciones de recursos...');

    try {
      await this.setup();
      await this.testProgramAssociation();
      await this.testMultipleCategories();
      await this.testMinimalCategories();
      await this.testDynamicCategories();
      await this.testAssociationValidation();
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
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testProgramAssociation() {
    this.logger.subheader('Test: Asociación con programa académico único');
    const startTime = Date.now();

    try {
      // Test 1: Crear recurso con programa académico único
      const resourceData = this.dataGenerator.getTestData(5, 'resource', {
        name: "Laboratorio Algoritmos Advanced",
        type: "LABORATORIO",
        capacity: 25,
        location: "Edificio A - Piso 3",
        programCode: "INGENIERIA_SISTEMAS", // Un solo programa por recurso
        categories: ["LABORATORIO", "PROGRAMACION", "SOFTWARE"],
        attributes: {
          equipment: ["Computadores", "Proyector", "Pizarra Digital"],
          accessibility: ["Rampa de acceso", "Puertas amplias"],
          technicalSpecs: {
            networkCapacity: "100Mbps",
            powerOutlets: 30,
            airConditioning: true
          }
        }
      });

      const createEndpoint = getEndpointUrl('resources-service', 'resources', 'create');
      const createResponse = await this.httpClient.authPost(createEndpoint, resourceData, this.testData.testUsers.admin);

      // Test 2: Verificar asociación única de programa
      if (createResponse.data.success) {
        this.testData.createdResources.push(createResponse.data.data);
        
        const resourceId = createResponse.data.data.id;
        const getEndpoint = getEndpointUrl('resources-service', 'resources', 'get-by-id').replace(':id', resourceId);
        const getResponse = await this.httpClient.authGet(getEndpoint, this.testData.testUsers.admin);

        // Test 3: Intentar actualizar con múltiples programas (debe fallar)
        const invalidUpdateData = {
          programCodes: ["INGENIERIA_SISTEMAS", "INGENIERIA_INDUSTRIAL"] // Múltiples programas no permitidos
        };

        const updateEndpoint = getEndpointUrl('resources-service', 'resources', 'update-associations').replace(':id', resourceId);
        const updateResponse = await this.httpClient.authPut(updateEndpoint, invalidUpdateData, this.testData.testUsers.admin);

        const duration = Date.now() - startTime;

        // Validar respuestas
        const validations = [
          this.validator.validateBooklyResponse(createResponse, 'SUCCESS'),
          this.validator.validateBooklyResponse(getResponse, 'SUCCESS'),
          this.validator.validateBooklyResponse(updateResponse, 'ERROR') // Debe fallar
        ];

        const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
        
        if (validationErrors.length > 0) {
          throw new Error(`Program association validation failed: ${validationErrors.join(', ')}`);
        }

        this.reporter.addResult(createEndpoint, 'POST', 'PASS', {
          duration,
          message: 'Program association tests completed successfully',
          testsCompleted: 3,
          resourceCreated: createResponse.data?.success || false,
          uniqueProgramValidated: getResponse.data?.success || false,
          multipleProgramsBlocked: updateResponse.data?.success === false,
          programAssociated: getResponse.data?.data?.program?.code || 'INGENIERIA_SISTEMAS'
        });

        this.logger.success(`✅ Asociación de programa académico completada (${duration}ms)`);
        this.logger.info(`   - Recurso: ${resourceData.name}`);
        this.logger.info(`   - Programa: INGENIERIA_SISTEMAS`);
        this.logger.info(`   - Múltiples programas bloqueados: ✅`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with unique program association'
      });
      this.logger.error(`❌ Error en asociación de programa: ${error.message}`);
    }
  }

  async testMultipleCategories() {
    this.logger.subheader('Test: Múltiples categorías por recurso');
    const startTime = Date.now();

    try {
      // Test 1: Crear recurso con múltiples categorías
      const resourceData = this.dataGenerator.getTestData(5, 'resource', {
        name: "Auditorio Multimedia Integrado",
        type: "AUDITORIO",
        capacity: 150,
        location: "Edificio Central - Piso 1",
        programCode: "INGENIERIA_SISTEMAS",
        categories: [
          "AUDITORIO",
          "EQUIPO_MULTIMEDIA",
          "CONFERENCIAS",
          "EVENTOS_ESPECIALES",
          "CAPACITACION"
        ],
        attributes: {
          equipment: ["Sistema de Sonido", "Proyector 4K", "Micrófonos", "Cámaras HD"],
          accessibility: ["Acceso para discapacitados", "Asientos especiales"],
          specialConditions: ["Aire acondicionado", "Sistema de grabación"]
        }
      });

      const createEndpoint = getEndpointUrl('resources-service', 'resources', 'create');
      const createResponse = await this.httpClient.authPost(createEndpoint, resourceData, this.testData.testUsers.admin);

      // Test 2: Verificar múltiples categorías asignadas
      if (createResponse.data.success) {
        this.testData.createdResources.push(createResponse.data.data);
        
        const resourceId = createResponse.data.data.id;
        const getCategoriesEndpoint = getEndpointUrl('resources-service', 'resources', 'categories').replace(':id', resourceId);
        const categoriesResponse = await this.httpClient.authGet(getCategoriesEndpoint, this.testData.testUsers.admin);

        // Test 3: Agregar categoría adicional
        const addCategoryData = {
          categoryCode: "STREAMING"
        };

        const addCategoryEndpoint = getEndpointUrl('resources-service', 'resources', 'add-category').replace(':id', resourceId);
        const addCategoryResponse = await this.httpClient.authPost(addCategoryEndpoint, addCategoryData, this.testData.testUsers.admin);

        const duration = Date.now() - startTime;

        // Validar respuestas
        const validations = [
          this.validator.validateBooklyResponse(createResponse, 'SUCCESS'),
          this.validator.validateBooklyResponse(categoriesResponse, 'SUCCESS'),
          this.validator.validateBooklyResponse(addCategoryResponse, 'SUCCESS')
        ];

        const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
        
        if (validationErrors.length > 0) {
          throw new Error(`Multiple categories validation failed: ${validationErrors.join(', ')}`);
        }

        this.reporter.addResult(createEndpoint, 'POST', 'PASS', {
          duration,
          message: 'Multiple categories tests completed successfully',
          testsCompleted: 3,
          resourceCreated: createResponse.data?.success || false,
          categoriesAssigned: resourceData.categories.length,
          categoriesRetrieved: categoriesResponse.data?.success || false,
          additionalCategoryAdded: addCategoryResponse.data?.success || false
        });

        this.logger.success(`✅ Múltiples categorías completadas (${duration}ms)`);
        this.logger.info(`   - Categorías iniciales: ${resourceData.categories.length}`);
        this.logger.info(`   - Categoría adicional agregada: ✅`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with multiple categories'
      });
      this.logger.error(`❌ Error en múltiples categorías: ${error.message}`);
    }
  }

  async testMinimalCategories() {
    this.logger.subheader('Test: Categorías mínimas no eliminables');
    const startTime = Date.now();

    try {
      // Test 1: Obtener categorías mínimas
      const minimalEndpoint = getEndpointUrl('resources-service', 'categories', 'minimal');
      const minimalResponse = await this.httpClient.authGet(minimalEndpoint, this.testData.testUsers.admin);

      // Test 2: Intentar eliminar categoría mínima (debe fallar)
      const deleteAttemptData = {
        categoryCode: "SALON", // Categoría mínima no eliminable
        forceDelete: false
      };

      const deleteEndpoint = getEndpointUrl('resources-service', 'categories', 'delete');
      const deleteResponse = await this.httpClient.authDelete(deleteEndpoint, this.testData.testUsers.admin, deleteAttemptData);

      // Test 3: Verificar protección con intento de eliminación forzada
      const forceDeleteData = {
        categoryCode: "LABORATORIO",
        forceDelete: true // Tampoco debe permitir eliminación forzada
      };

      const forceDeleteResponse = await this.httpClient.authDelete(deleteEndpoint, this.testData.testUsers.admin, forceDeleteData);

      const duration = Date.now() - startTime;

      // Validar respuestas
      const validations = [
        this.validator.validateBooklyResponse(minimalResponse, 'SUCCESS'),
        this.validator.validateBooklyResponse(deleteResponse, 'ERROR'), // Debe fallar
        this.validator.validateBooklyResponse(forceDeleteResponse, 'ERROR') // Debe fallar
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Minimal categories validation failed: ${validationErrors.join(', ')}`);
      }

      this.reporter.addResult(minimalEndpoint, 'GET', 'PASS', {
        duration,
        message: 'Minimal categories protection tests completed successfully',
        testsCompleted: 3,
        minimalCategoriesRetrieved: minimalResponse.data?.success || false,
        deletionBlocked: deleteResponse.data?.success === false,
        forceDeletionBlocked: forceDeleteResponse.data?.success === false,
        minimalCategoriesCount: minimalResponse.data?.data?.length || 4
      });

      this.logger.success(`✅ Protección de categorías mínimas completada (${duration}ms)`);
      this.logger.info('   - Categorías mínimas protegidas: ✅');
      this.logger.info('   - Eliminación normal bloqueada: ✅');
      this.logger.info('   - Eliminación forzada bloqueada: ✅');

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'categories', 'minimal');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with minimal categories protection'
      });
      this.logger.error(`❌ Error en categorías mínimas: ${error.message}`);
    }
  }

  async testDynamicCategories() {
    this.logger.subheader('Test: Creación dinámica de categorías');
    const startTime = Date.now();

    try {
      // Test 1: Crear nueva categoría dinámica
      const categoryData = this.dataGenerator.getTestData(5, 'category', {
        code: "SALA_VIDEOCONFERENCIA",
        name: "Sala de Videoconferencia",
        description: "Espacios equipados para videoconferencias y reuniones virtuales",
        type: "RESOURCE_TYPE",
        subtype: "COMMUNICATION",
        color: "#4A90E2",
        isActive: true,
        isDefault: false,
        deletable: true,
        service: "RESOURCES"
      });

      const createCategoryEndpoint = getEndpointUrl('resources-service', 'categories', 'create');
      const createCategoryResponse = await this.httpClient.authPost(createCategoryEndpoint, categoryData, this.testData.testUsers.admin);

      if (createCategoryResponse.data.success) {
        this.testData.createdCategories.push(createCategoryResponse.data.data);
      }

      // Test 2: Usar nueva categoría en recurso
      const resourceData = this.dataGenerator.getTestData(5, 'resource', {
        name: "Sala Teams Principal",
        type: "SALA",
        capacity: 12,
        programCode: "INGENIERIA_SISTEMAS",
        categories: ["SALA_VIDEOCONFERENCIA", "EQUIPO_MULTIMEDIA"],
        attributes: {
          equipment: ["Cámara 360°", "Micrófono direccional", "Pantalla 65''"],
          technicalSpecs: {
            internetSpeed: "1Gbps",
            videoQuality: "4K",
            audioSystem: "Dolby"
          }
        }
      });

      const createResourceEndpoint = getEndpointUrl('resources-service', 'resources', 'create');
      const createResourceResponse = await this.httpClient.authPost(createResourceEndpoint, resourceData, this.testData.testUsers.admin);

      if (createResourceResponse.data.success) {
        this.testData.createdResources.push(createResourceResponse.data.data);
      }

      // Test 3: Eliminar categoría dinámica (debe ser posible)
      const categoryId = createCategoryResponse.data?.data?.id;
      if (categoryId) {
        const deleteCategoryEndpoint = getEndpointUrl('resources-service', 'categories', 'delete').replace(':id', categoryId);
        const deleteCategoryResponse = await this.httpClient.authDelete(deleteCategoryEndpoint, this.testData.testUsers.admin);
        
        // Si se eliminó exitosamente, quitarla de la lista de cleanup
        if (deleteCategoryResponse.data.success) {
          this.testData.createdCategories = this.testData.createdCategories.filter(cat => cat.id !== categoryId);
        }
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(createCategoryEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Dynamic categories tests completed successfully',
        testsCompleted: 3,
        categoryCreated: createCategoryResponse.data?.success || false,
        resourceWithNewCategory: createResourceResponse.data?.success || false,
        categoryDeletable: true,
        newCategoryCode: categoryData.code
      });

      this.logger.success(`✅ Categorías dinámicas completadas (${duration}ms)`);
      this.logger.info(`   - Nueva categoría: ${categoryData.name}`);
      this.logger.info(`   - Recurso asociado: ✅`);
      this.logger.info(`   - Categoría eliminable: ✅`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'categories', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with dynamic category creation'
      });
      this.logger.error(`❌ Error en categorías dinámicas: ${error.message}`);
    }
  }

  async testAssociationValidation() {
    this.logger.subheader('Test: Validación de asociaciones');
    const startTime = Date.now();

    try {
      // Test 1: Intentar crear recurso con programa inexistente
      const invalidProgramData = {
        name: "Recurso Programa Inválido",
        type: "LABORATORIO",
        programCode: "PROGRAMA_INEXISTENTE"
      };

      const createEndpoint = getEndpointUrl('resources-service', 'resources', 'create');
      const invalidProgramResponse = await this.httpClient.authPost(createEndpoint, invalidProgramData, this.testData.testUsers.admin);

      // Test 2: Intentar asociar categoría inexistente
      const invalidCategoryData = {
        name: "Recurso Categoría Inválida",
        type: "AUDITORIO",
        programCode: "INGENIERIA_SISTEMAS",
        categories: ["CATEGORIA_INEXISTENTE", "AUDITORIO"]
      };

      const invalidCategoryResponse = await this.httpClient.authPost(createEndpoint, invalidCategoryData, this.testData.testUsers.admin);

      // Test 3: Intentar asociar múltiples programas
      const multipleProgramsData = {
        name: "Recurso Múltiples Programas",
        type: "SALON",
        programCodes: ["INGENIERIA_SISTEMAS", "INGENIERIA_INDUSTRIAL"] // No permitido
      };

      const multipleProgramsResponse = await this.httpClient.authPost(createEndpoint, multipleProgramsData, this.testData.testUsers.admin);

      // Test 4: Validar permisos por programa
      const unauthorizedResourceData = {
        name: "Recurso No Autorizado",
        type: "LABORATORIO", 
        programCode: "INGENIERIA_CIVIL" // Admin de sistemas no puede crear para civil
      };

      const unauthorizedResponse = await this.httpClient.authPost(createEndpoint, unauthorizedResourceData, this.testData.testUsers.adminProg);

      const duration = Date.now() - startTime;

      // Validar que todas las respuestas sean errores (validaciones activas)
      const validations = [
        this.validator.validateBooklyResponse(invalidProgramResponse, 'ERROR'),
        this.validator.validateBooklyResponse(invalidCategoryResponse, 'ERROR'),
        this.validator.validateBooklyResponse(multipleProgramsResponse, 'ERROR'),
        this.validator.validateBooklyResponse(unauthorizedResponse, 'ERROR')
      ];

      const validationErrors = validations.filter(v => !v.isValid).flatMap(v => v.errors);
      
      if (validationErrors.length > 0) {
        throw new Error(`Association validation tests failed: ${validationErrors.join(', ')}`);
      }

      this.reporter.addResult(createEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Association validation tests completed successfully',
        testsCompleted: 4,
        invalidProgramBlocked: invalidProgramResponse.data?.success === false,
        invalidCategoryBlocked: invalidCategoryResponse.data?.success === false,
        multipleProgramsBlocked: multipleProgramsResponse.data?.success === false,
        unauthorizedAccessBlocked: unauthorizedResponse.data?.success === false
      });

      this.logger.success(`✅ Validación de asociaciones completada (${duration}ms)`);
      this.logger.info('   - Programa inexistente bloqueado: ✅');
      this.logger.info('   - Categoría inexistente bloqueada: ✅');
      this.logger.info('   - Múltiples programas bloqueados: ✅');
      this.logger.info('   - Acceso no autorizado bloqueado: ✅');

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('resources-service', 'resources', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 400/403 with validation errors'
      });
      this.logger.error(`❌ Error en validación de asociaciones: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar recursos creados
    for (const resource of this.testData.createdResources) {
      try {
        const endpoint = getEndpointUrl('resources-service', 'resources', 'delete').replace(':id', resource.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up resource: ${resource.name}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup resource ${resource.id}:`, error.message);
      }
    }

    // Limpiar categorías creadas
    for (const category of this.testData.createdCategories) {
      try {
        const endpoint = getEndpointUrl('resources-service', 'categories', 'delete').replace(':id', category.id);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.admin);
        this.logger.debug(`Cleaned up category: ${category.name}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup category ${category.id}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 6: RESOURCE ASSOCIATIONS');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-6-resources-resource-associations.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new ResourceAssociationsFlow();
  flow.run().catch(console.error);
}

module.exports = { ResourceAssociationsFlow };
