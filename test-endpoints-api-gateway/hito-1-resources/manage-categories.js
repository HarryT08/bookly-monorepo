#!/usr/bin/env node

/**
 * HITO 1 - RESOURCES CORE: MANAGE CATEGORIES
 * 
 * Flujo completo de testing para gestión de categorías de recursos:
 * - RF-02: Asociar recursos a categoría y programas
 * - Categorías mínimas no eliminables: Salón, Laboratorio, Auditorio, Equipo Multimedia
 * 
 * Endpoints probados:
 * - GET /api/v1/resource-categories
 * - GET /api/v1/resource-categories/:id
 * - POST /api/v1/resource-categories
 * - PUT /api/v1/resource-categories/:id
 * - DELETE /api/v1/resource-categories/:id
 */

const { httpClient } = require('../shared/http-client');
const { TestValidator, TestUtils } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_USERS, TEST_DATA, CONFIG } = require('../shared/config');
const { TestLogger } = require('../shared/logger');

class CategoriesManagementFlow {
  constructor() {
    this.logger = new TestLogger('Categories-Management');
    this.validator = new TestValidator();
    this.reporter = new TestReporter('Hito-1-Resources', 'Manage-Categories');
    this.testData = {
      createdCategories: [],
      adminUser: TEST_USERS.ADMIN_GENERAL,
      adminProgramaUser: TEST_USERS.ADMIN_PROGRAMA,
      docenteUser: TEST_USERS.DOCENTE,
      defaultCategories: TEST_DATA.CATEGORIES.filter(cat => cat.isDefault)
    };
  }

  async run() {
    this.logger.header('HITO 1 - CATEGORIES MANAGEMENT FLOW');
    this.logger.info('Iniciando testing completo de gestión de categorías...');

    try {
      // 1. Setup inicial
      await this.setup();
      
      // 2. Tests de lectura
      await this.testListCategories();
      await this.testGetCategoryById();
      
      // 3. Tests de creación de categorías personalizadas
      await this.testCreateCustomCategory();
      await this.testCreateCategoryWithMetadata();
      
      // 4. Tests de actualización
      await this.testUpdateCustomCategory();
      await this.testUpdateDefaultCategory();
      
      // 5. Tests de eliminación
      await this.testDeleteCustomCategory();
      await this.testDeleteDefaultCategory();
      
      // 6. Tests de validación
      await this.testValidationErrors();
      await this.testDuplicateCodeError();
      
      // 7. Tests de asociación con recursos
      await this.testCategoryResourceAssociation();
      
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
      await httpClient.authenticate(this.testData.adminUser);
      await httpClient.authenticate(this.testData.adminProgramaUser);
      await httpClient.authenticate(this.testData.docenteUser);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testListCategories() {
    this.logger.subheader('Test: Listar categorías de recursos');
    const startTime = Date.now();

    try {
      const response = await httpClient.get('/api/v1/resource-categories');

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      // Validar estructura de categorías
      const categories = response.data.data;
      if (categories.length > 0) {
        const categoryValidation = this.validator.validateEntityArray(
          categories, 
          ['id', 'name', 'code', 'isActive'], // required
          ['description', 'color', 'isDefault', 'sortOrder', 'service'] // optional
        );
        
        if (!categoryValidation.isValid) {
          this.logger.warn('Category structure issues:', categoryValidation.errors);
        }
      }

      // Verificar que las categorías por defecto existen
      const defaultCategoryCodes = ['SALON', 'LABORATORIO', 'AUDITORIO', 'EQUIPO_MULTIMEDIA'];
      const foundDefaults = categories.filter(cat => 
        defaultCategoryCodes.includes(cat.code) && cat.isDefault
      );

      if (foundDefaults.length < 4) {
        this.logger.warn(`Solo se encontraron ${foundDefaults.length}/4 categorías por defecto`);
      }

      this.reporter.addResult('/api/v1/resource-categories', 'GET', 'PASS', {
        duration,
        message: `Retrieved ${categories.length} categories (${foundDefaults.length} defaults)`,
        response: {
          total: categories.length,
          defaults: foundDefaults.length,
          defaultCodes: foundDefaults.map(c => c.code)
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resource-categories', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with categories list including defaults'
      });
    }
  }

  async testGetCategoryById() {
    this.logger.subheader('Test: Obtener categoría por ID');
    const startTime = Date.now();

    try {
      // Usar ID de categoría por defecto (Salón)
      const categoryId = '1';
      const response = await httpClient.get(`/api/v1/resource-categories/${categoryId}`);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const category = response.data.data;
      
      // Validar estructura de la categoría
      const categoryValidation = this.validator.validateEntity(
        category,
        ['id', 'name', 'code', 'isActive'],
        ['description', 'color', 'isDefault', 'sortOrder', 'service']
      );
      
      if (!categoryValidation.isValid) {
        this.logger.warn('Category structure issues:', categoryValidation.errors);
      }

      // Verificar que es una categoría por defecto
      if (category.code === 'SALON' && !category.isDefault) {
        this.logger.warn('Salón category should be marked as default');
      }

      this.reporter.addResult(`/api/v1/resource-categories/${categoryId}`, 'GET', 'PASS', {
        duration,
        message: `Retrieved category: ${category.name}`,
        response: { 
          categoryName: category.name, 
          code: category.code,
          isDefault: category.isDefault
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resource-categories/:id', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with category details'
      });
    }
  }

  async testCreateCustomCategory() {
    this.logger.subheader('Test: Crear categoría personalizada');
    const startTime = Date.now();

    try {
      const newCategory = {
        name: 'Espacios Deportivos',
        code: `DEPORTIVO_${Date.now()}`,
        description: 'Categoría para canchas y espacios deportivos',
        color: '#4CAF50',
        isActive: true,
        isDefault: false,
        sortOrder: 10,
        service: 'RESOURCES'
      };

      const response = await httpClient.authPost('/api/v1/resource-categories', newCategory, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const createdCategory = response.data.data;
      
      // Verificar que los datos coinciden
      if (createdCategory.name !== newCategory.name) {
        throw new Error(`Name mismatch: expected ${newCategory.name}, got ${createdCategory.name}`);
      }

      // Verificar que NO es categoría por defecto
      if (createdCategory.isDefault === true) {
        throw new Error('Custom category should not be marked as default');
      }

      // Guardar para cleanup
      this.testData.createdCategories.push(createdCategory);

      this.reporter.addResult('/api/v1/resource-categories', 'POST', 'PASS', {
        duration,
        message: `Created custom category: ${createdCategory.name}`,
        response: { 
          categoryId: createdCategory.id,
          name: createdCategory.name,
          code: createdCategory.code,
          isDefault: createdCategory.isDefault
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resource-categories', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created custom category'
      });
    }
  }

  async testCreateCategoryWithMetadata() {
    this.logger.subheader('Test: Crear categoría con metadata completo');
    const startTime = Date.now();

    try {
      const newCategory = {
        name: 'Laboratorios Especializados',
        code: `LAB_ESPEC_${Date.now()}`,
        description: 'Laboratorios con equipamiento especializado para investigación',
        color: '#9C27B0',
        isActive: true,
        isDefault: false,
        sortOrder: 15,
        service: 'RESOURCES'
      };

      const response = await httpClient.authPost('/api/v1/resource-categories', newCategory, this.testData.adminProgramaUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const createdCategory = response.data.data;
      
      // Verificar metadata
      const expectedFields = ['color', 'sortOrder', 'service'];
      expectedFields.forEach(field => {
        if (createdCategory[field] !== newCategory[field]) {
          this.logger.warn(`Field ${field} mismatch: expected ${newCategory[field]}, got ${createdCategory[field]}`);
        }
      });

      // Guardar para cleanup
      this.testData.createdCategories.push(createdCategory);

      this.reporter.addResult('/api/v1/resource-categories [with metadata]', 'POST', 'PASS', {
        duration,
        message: `Created category with metadata: ${createdCategory.name}`,
        response: { 
          categoryId: createdCategory.id,
          hasColor: !!createdCategory.color,
          hasSortOrder: typeof createdCategory.sortOrder === 'number'
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resource-categories [with metadata]', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created category including metadata'
      });
    }
  }

  async testUpdateCustomCategory() {
    this.logger.subheader('Test: Actualizar categoría personalizada');
    
    if (this.testData.createdCategories.length === 0) {
      this.reporter.addResult('/api/v1/resource-categories/:id', 'PUT', 'SKIP', {
        reason: 'No custom categories created to update'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const category = this.testData.createdCategories[0];
      const updateData = {
        name: category.name + ' - Actualizado',
        description: 'Categoría actualizada durante testing',
        color: '#FF5722'
      };

      const response = await httpClient.authPut(`/api/v1/resource-categories/${category.id}`, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedCategory = response.data.data;
      
      // Verificar que los cambios se aplicaron
      if (updatedCategory.name !== updateData.name) {
        throw new Error(`Name update failed: expected ${updateData.name}, got ${updatedCategory.name}`);
      }

      this.reporter.addResult(`/api/v1/resource-categories/${category.id}`, 'PUT', 'PASS', {
        duration,
        message: `Updated custom category: ${updatedCategory.name}`,
        response: { 
          categoryId: updatedCategory.id,
          changes: Object.keys(updateData),
          newColor: updatedCategory.color
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resource-categories/:id', 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated custom category'
      });
    }
  }

  async testUpdateDefaultCategory() {
    this.logger.subheader('Test: Intentar actualizar categoría por defecto');
    const startTime = Date.now();

    try {
      // Intentar actualizar categoría Salón (por defecto)
      const defaultCategoryId = '1';
      const updateData = {
        name: 'Salón Modificado',
        isDefault: false // Intentar cambiar isDefault
      };

      const response = await httpClient.authPut(`/api/v1/resource-categories/${defaultCategoryId}`, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Si permite la actualización, verificar que isDefault no cambió
      if (response.status === 200) {
        const updatedCategory = response.data.data;
        
        if (updatedCategory.isDefault === false) {
          this.reporter.addResult(`/api/v1/resource-categories/${defaultCategoryId} [default]`, 'PUT', 'WARN', {
            duration,
            message: `Default category allowed to lose default status - potential issue`,
            response: { 
              categoryId: updatedCategory.id,
              wasDefault: true,
              nowDefault: updatedCategory.isDefault
            }
          });
        } else {
          this.reporter.addResult(`/api/v1/resource-categories/${defaultCategoryId} [default]`, 'PUT', 'PASS', {
            duration,
            message: `Default category updated but preserved default status`,
            response: { 
              categoryId: updatedCategory.id,
              stillDefault: updatedCategory.isDefault
            }
          });
        }
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Verificar si es error esperado (prohibir modificar defaults)
      const isExpectedError = error.status === 403 || error.status === 400;
      
      if (isExpectedError) {
        this.reporter.addResult('/api/v1/resource-categories/:id [default]', 'PUT', 'PASS', {
          duration,
          message: `Default category modification correctly prevented`,
          response: { 
            protectionLevel: 'Default categories protected',
            errorStatus: error.status
          }
        });
      } else {
        this.reporter.addResult('/api/v1/resource-categories/:id [default]', 'PUT', 'FAIL', {
          duration,
          error: error.message,
          expected: 'Either allow update preserving defaults or return 403'
        });
      }
    }
  }

  async testDeleteCustomCategory() {
    this.logger.subheader('Test: Eliminar categoría personalizada');
    
    if (this.testData.createdCategories.length === 0) {
      this.reporter.addResult('/api/v1/resource-categories/:id', 'DELETE', 'SKIP', {
        reason: 'No custom categories created to delete'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const category = this.testData.createdCategories.pop(); // Tomar el último
      
      const response = await httpClient.authDelete(`/api/v1/resource-categories/${category.id}`, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar código de respuesta
      if (![200, 204].includes(response.status)) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }

      // Verificar que la categoría ya no existe
      try {
        await httpClient.get(`/api/v1/resource-categories/${category.id}`);
        throw new Error('Category still accessible after deletion');
      } catch (notFoundError) {
        if (!notFoundError.message.includes('404')) {
          throw notFoundError;
        }
      }

      this.reporter.addResult(`/api/v1/resource-categories/${category.id}`, 'DELETE', 'PASS', {
        duration,
        message: `Custom category deleted successfully: ${category.name}`,
        response: { 
          deletedCategoryId: category.id,
          wasCustom: !category.isDefault,
          verified: true
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resource-categories/:id', 'DELETE', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 204 and category not accessible afterward'
      });
    }
  }

  async testDeleteDefaultCategory() {
    this.logger.subheader('Test: Intentar eliminar categoría por defecto');
    const startTime = Date.now();

    try {
      // Intentar eliminar categoría Salón (por defecto)
      const defaultCategoryId = '1';
      
      const response = await httpClient.authDelete(`/api/v1/resource-categories/${defaultCategoryId}`, this.testData.adminUser);

      // Si permite la eliminación, es un problema
      const duration = Date.now() - startTime;
      this.reporter.addResult(`/api/v1/resource-categories/${defaultCategoryId} [default]`, 'DELETE', 'WARN', {
        duration,
        message: `Default category deletion was allowed - potential data integrity issue`,
        response: { 
          defaultCategoryId,
          shouldBeProtected: true
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Verificar si es error esperado (prohibir eliminar defaults)
      const isExpectedError = error.status === 403 || error.status === 400;
      
      if (isExpectedError) {
        this.reporter.addResult('/api/v1/resource-categories/:id [default]', 'DELETE', 'PASS', {
          duration,
          message: `Default category deletion correctly prevented`,
          response: { 
            protection: 'Default categories cannot be deleted',
            errorStatus: error.status
          }
        });
      } else {
        this.reporter.addResult('/api/v1/resource-categories/:id [default]', 'DELETE', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 403 - Default categories should be protected from deletion'
        });
      }
    }
  }

  async testValidationErrors() {
    this.logger.subheader('Test: Errores de validación');
    
    const tests = [
      {
        name: 'Create category without name',
        data: { code: 'TEST-NO-NAME' },
        expectedError: 'name'
      },
      {
        name: 'Create category without code',
        data: { name: 'Test Category No Code' },
        expectedError: 'code'
      },
      {
        name: 'Create category with invalid color',
        data: { name: 'Test Invalid Color', code: 'TEST-INV-COLOR', color: 'invalid-color' },
        expectedError: 'color'
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      
      try {
        const response = await httpClient.authPost('/api/v1/resource-categories', test.data, this.testData.adminUser);
        
        const duration = Date.now() - startTime;
        this.reporter.addResult(`/api/v1/resource-categories [${test.name}]`, 'POST', 'WARN', {
          duration,
          message: `Expected validation error but request succeeded`,
          response: { testCase: test.name }
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        const isExpectedError = error.message.toLowerCase().includes(test.expectedError) ||
                               error.status === 400 ||
                               error.status === 422;
        
        if (isExpectedError) {
          this.reporter.addResult(`/api/v1/resource-categories [${test.name}]`, 'POST', 'PASS', {
            duration,
            message: `Validation error correctly caught`,
            response: { testCase: test.name, errorType: test.expectedError }
          });
        } else {
          this.reporter.addResult(`/api/v1/resource-categories [${test.name}]`, 'POST', 'FAIL', {
            duration,
            error: `Unexpected error: ${error.message}`,
            expected: `Validation error containing '${test.expectedError}'`
          });
        }
      }
    }
  }

  async testDuplicateCodeError() {
    this.logger.subheader('Test: Error de código duplicado');
    const startTime = Date.now();

    try {
      // Intentar crear categoría con código de una por defecto
      const duplicateCategory = {
        name: 'Salón Duplicado',
        code: 'SALON', // Código que ya existe
        description: 'Esta categoría debería fallar por código duplicado'
      };

      const response = await httpClient.authPost('/api/v1/resource-categories', duplicateCategory, this.testData.adminUser);
      
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resource-categories [duplicate code]', 'POST', 'WARN', {
        duration,
        message: `Expected duplicate code error but request succeeded`,
        response: { duplicateCode: 'SALON' }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const isDuplicateError = error.message.toLowerCase().includes('duplicate') ||
                              error.message.toLowerCase().includes('already exists') ||
                              error.status === 409;
      
      if (isDuplicateError) {
        this.reporter.addResult('/api/v1/resource-categories [duplicate code]', 'POST', 'PASS', {
          duration,
          message: `Duplicate code error correctly caught`,
          response: { duplicateCode: 'SALON', errorStatus: error.status }
        });
      } else {
        this.reporter.addResult('/api/v1/resource-categories [duplicate code]', 'POST', 'FAIL', {
          duration,
          error: `Unexpected error: ${error.message}`,
          expected: 'HTTP 409 or similar duplicate error'
        });
      }
    }
  }

  async testCategoryResourceAssociation() {
    this.logger.subheader('Test: Asociación categoría-recurso');
    const startTime = Date.now();

    try {
      // Crear un recurso asociado a una categoría personalizada
      if (this.testData.createdCategories.length === 0) {
        this.reporter.addResult('/api/v1/resources [category association]', 'POST', 'SKIP', {
          reason: 'No custom categories available for association test'
        });
        return;
      }

      const category = this.testData.createdCategories[0];
      const newResource = TestUtils.generateTestData('resource', {
        name: `Recurso para ${category.name}`,
        code: `REC-${category.code}-${Date.now()}`,
        categoryId: category.id
      });

      const response = await httpClient.authPost('/api/v1/resources', newResource, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      if (response.status === 201 || response.status === 200) {
        const createdResource = response.data.data;
        
        // Verificar que la asociación se guardó
        if (createdResource.categoryId !== category.id) {
          this.logger.warn(`Category association not saved: expected ${category.id}, got ${createdResource.categoryId}`);
        }

        this.reporter.addResult('/api/v1/resources [category association]', 'POST', 'PASS', {
          duration,
          message: `Resource created with category association`,
          response: { 
            resourceId: createdResource.id,
            categoryId: createdResource.categoryId,
            categoryName: category.name
          }
        });

        // Limpiar el recurso creado
        try {
          await httpClient.authDelete(`/api/v1/resources/${createdResource.id}`, this.testData.adminUser);
        } catch (cleanupError) {
          this.logger.warn('Failed to cleanup test resource:', cleanupError.message);
        }

      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources [category association]', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with resource associated to custom category'
      });
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de categorías personalizadas');
    
    for (const category of this.testData.createdCategories) {
      try {
        await httpClient.authDelete(`/api/v1/resource-categories/${category.id}`, this.testData.adminUser);
        this.logger.debug(`Cleaned up category: ${category.id} - ${category.name}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup category ${category.id}:`, error.message);
      }
    }
    
    this.logger.success(`Cleanup completed - ${this.testData.createdCategories.length} categories cleaned`);
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
  const flow = new CategoriesManagementFlow();
  flow.run().catch(console.error);
}

module.exports = { CategoriesManagementFlow };
