#!/usr/bin/env node

/**
 * HITO 1 - RESOURCES CORE: MANAGE PROGRAMS
 * 
 * Flujo completo de testing para gestión de programas académicos:
 * - RF-02: Asociar recursos a programas académicos
 * - Validación de códigos únicos por programa
 * 
 * Endpoints probados:
 * - GET /api/v1/programs
 * - GET /api/v1/programs/active
 * - GET /api/v1/programs/:id
 * - POST /api/v1/programs
 * - PUT /api/v1/programs/:id
 * - DELETE /api/v1/programs/:id
 */

const { httpClient } = require('../shared/http-client');
const { TestValidator, TestUtils } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_USERS, TEST_DATA, CONFIG } = require('../shared/config');
const { TestLogger } = require('../shared/logger');

class ProgramsManagementFlow {
  constructor() {
    this.logger = new TestLogger('Programs-Management');
    this.validator = new TestValidator();
    this.reporter = new TestReporter('Hito-1-Resources', 'Manage-Programs');
    this.testData = {
      createdPrograms: [],
      adminUser: TEST_USERS.ADMIN_GENERAL,
      adminProgramaUser: TEST_USERS.ADMIN_PROGRAMA,
      docenteUser: TEST_USERS.DOCENTE,
      defaultPrograms: TEST_DATA.PROGRAMS
    };
  }

  async run() {
    this.logger.header('HITO 1 - PROGRAMS MANAGEMENT FLOW');
    this.logger.info('Iniciando testing completo de gestión de programas académicos...');

    try {
      // 1. Setup inicial
      await this.setup();
      
      // 2. Tests de lectura
      await this.testListPrograms();
      await this.testListActivePrograms();
      await this.testGetProgramById();
      
      // 3. Tests de creación
      await this.testCreateProgram();
      await this.testCreateProgramWithMetadata();
      
      // 4. Tests de actualización
      await this.testUpdateProgram();
      await this.testDeactivateProgram();
      
      // 5. Tests de eliminación
      await this.testDeleteProgram();
      
      // 6. Tests de validación
      await this.testValidationErrors();
      await this.testUniqueCodeConstraint();
      
      // 7. Tests de asociación con recursos
      await this.testProgramResourceAssociation();
      
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

  async testListPrograms() {
    this.logger.subheader('Test: Listar todos los programas académicos');
    const startTime = Date.now();

    try {
      const response = await httpClient.get('/api/v1/programs');

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      // Validar estructura de programas
      const programs = response.data.data;
      if (programs.length > 0) {
        const programValidation = this.validator.validateEntityArray(
          programs, 
          ['id', 'name', 'code', 'isActive'], // required
          ['description', 'faculty', 'director', 'contact'] // optional
        );
        
        if (!programValidation.isValid) {
          this.logger.warn('Program structure issues:', programValidation.errors);
        }
      }

      // Verificar que los programas por defecto existen
      const expectedCodes = ['ING-SIS', 'MED-GEN', 'DER-GEN', 'ADM-EMP'];
      const foundDefaults = programs.filter(prog => 
        expectedCodes.includes(prog.code)
      );

      if (foundDefaults.length < 4) {
        this.logger.warn(`Solo se encontraron ${foundDefaults.length}/4 programas por defecto`);
      }

      this.reporter.addResult('/api/v1/programs', 'GET', 'PASS', {
        duration,
        message: `Retrieved ${programs.length} programs (${foundDefaults.length} defaults)`,
        response: {
          total: programs.length,
          defaultsFound: foundDefaults.length,
          defaultCodes: foundDefaults.map(p => p.code)
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with programs list including defaults'
      });
    }
  }

  async testListActivePrograms() {
    this.logger.subheader('Test: Listar programas activos');
    const startTime = Date.now();

    try {
      const response = await httpClient.get('/api/v1/programs/active');

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const activePrograms = response.data.data;
      
      // Verificar que todos los programas devueltos están activos
      const inactivePrograms = activePrograms.filter(prog => !prog.isActive);
      if (inactivePrograms.length > 0) {
        this.logger.warn(`Found ${inactivePrograms.length} inactive programs in active list`);
      }

      this.reporter.addResult('/api/v1/programs/active', 'GET', 'PASS', {
        duration,
        message: `Retrieved ${activePrograms.length} active programs`,
        response: {
          activeCount: activePrograms.length,
          inactiveFound: inactivePrograms.length
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs/active', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with active programs only'
      });
    }
  }

  async testGetProgramById() {
    this.logger.subheader('Test: Obtener programa por ID');
    const startTime = Date.now();

    try {
      // Usar ID de programa de semillas (Ingeniería de Sistemas)
      const programId = '1';
      const response = await httpClient.get(`/api/v1/programs/${programId}`);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const program = response.data.data;
      
      // Validar estructura del programa
      const programValidation = this.validator.validateEntity(
        program,
        ['id', 'name', 'code', 'isActive'],
        ['description', 'faculty', 'director', 'contact']
      );
      
      if (!programValidation.isValid) {
        this.logger.warn('Program structure issues:', programValidation.errors);
      }

      this.reporter.addResult(`/api/v1/programs/${programId}`, 'GET', 'PASS', {
        duration,
        message: `Retrieved program: ${program.name}`,
        response: { 
          programName: program.name, 
          code: program.code,
          isActive: program.isActive
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs/:id', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with program details'
      });
    }
  }

  async testCreateProgram() {
    this.logger.subheader('Test: Crear nuevo programa académico');
    const startTime = Date.now();

    try {
      const newProgram = {
        name: 'Ingeniería en Inteligencia Artificial',
        code: `IA-${Date.now()}`,
        description: 'Programa de pregrado en Inteligencia Artificial y Machine Learning',
        faculty: 'Facultad de Ingeniería',
        director: 'Dr. Test Director',
        contact: 'ia@ufps.edu.co',
        isActive: true
      };

      const response = await httpClient.authPost('/api/v1/programs', newProgram, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const createdProgram = response.data.data;
      
      // Verificar que los datos coinciden
      if (createdProgram.name !== newProgram.name) {
        throw new Error(`Name mismatch: expected ${newProgram.name}, got ${createdProgram.name}`);
      }

      // Verificar que el código es único
      if (createdProgram.code !== newProgram.code) {
        throw new Error(`Code mismatch: expected ${newProgram.code}, got ${createdProgram.code}`);
      }

      // Guardar para cleanup
      this.testData.createdPrograms.push(createdProgram);

      this.reporter.addResult('/api/v1/programs', 'POST', 'PASS', {
        duration,
        message: `Created program: ${createdProgram.name}`,
        response: { 
          programId: createdProgram.id,
          name: createdProgram.name,
          code: createdProgram.code,
          faculty: createdProgram.faculty
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created program'
      });
    }
  }

  async testCreateProgramWithMetadata() {
    this.logger.subheader('Test: Crear programa con metadatos completos');
    const startTime = Date.now();

    try {
      const newProgram = {
        name: 'Maestría en Ciencias de Datos',
        code: `MCD-${Date.now()}`,
        description: 'Programa de posgrado especializado en análisis de datos y estadística avanzada',
        faculty: 'Facultad de Ciencias Exactas',
        director: 'Dra. María Estadística',
        contact: 'mcd@ufps.edu.co',
        isActive: true
      };

      const response = await httpClient.authPost('/api/v1/programs', newProgram, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const createdProgram = response.data.data;
      
      // Verificar metadata
      const expectedFields = ['faculty', 'director', 'contact'];
      expectedFields.forEach(field => {
        if (createdProgram[field] !== newProgram[field]) {
          this.logger.warn(`Field ${field} mismatch: expected ${newProgram[field]}, got ${createdProgram[field]}`);
        }
      });

      // Guardar para cleanup
      this.testData.createdPrograms.push(createdProgram);

      this.reporter.addResult('/api/v1/programs [with metadata]', 'POST', 'PASS', {
        duration,
        message: `Created program with metadata: ${createdProgram.name}`,
        response: { 
          programId: createdProgram.id,
          hasFaculty: !!createdProgram.faculty,
          hasDirector: !!createdProgram.director,
          hasContact: !!createdProgram.contact
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs [with metadata]', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created program including metadata'
      });
    }
  }

  async testUpdateProgram() {
    this.logger.subheader('Test: Actualizar programa académico');
    
    if (this.testData.createdPrograms.length === 0) {
      this.reporter.addResult('/api/v1/programs/:id', 'PUT', 'SKIP', {
        reason: 'No programs created to update'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const program = this.testData.createdPrograms[0];
      const updateData = {
        name: program.name + ' - Actualizado',
        description: 'Programa académico actualizado durante testing',
        director: 'Dr. Updated Director'
      };

      const response = await httpClient.authPut(`/api/v1/programs/${program.id}`, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedProgram = response.data.data;
      
      // Verificar que los cambios se aplicaron
      if (updatedProgram.name !== updateData.name) {
        throw new Error(`Name update failed: expected ${updateData.name}, got ${updatedProgram.name}`);
      }

      this.reporter.addResult(`/api/v1/programs/${program.id}`, 'PUT', 'PASS', {
        duration,
        message: `Updated program: ${updatedProgram.name}`,
        response: { 
          programId: updatedProgram.id,
          changes: Object.keys(updateData),
          newDirector: updatedProgram.director
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs/:id', 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated program'
      });
    }
  }

  async testDeactivateProgram() {
    this.logger.subheader('Test: Desactivar programa académico');
    
    if (this.testData.createdPrograms.length < 2) {
      this.reporter.addResult('/api/v1/programs/:id [deactivate]', 'PUT', 'SKIP', {
        reason: 'Insufficient programs for deactivation test'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const program = this.testData.createdPrograms[1];
      const updateData = {
        isActive: false
      };

      const response = await httpClient.authPut(`/api/v1/programs/${program.id}`, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedProgram = response.data.data;
      
      // Verificar que el programa se desactivó
      if (updatedProgram.isActive !== false) {
        throw new Error(`Deactivation failed: expected isActive=false, got ${updatedProgram.isActive}`);
      }

      // Verificar que no aparece en lista de activos
      try {
        const activeResponse = await httpClient.get('/api/v1/programs/active');
        const activePrograms = activeResponse.data.data;
        const stillInActiveList = activePrograms.find(p => p.id === program.id);
        
        if (stillInActiveList) {
          this.logger.warn('Deactivated program still appears in active list');
        }
      } catch (activeCheckError) {
        this.logger.warn('Could not verify active programs list:', activeCheckError.message);
      }

      this.reporter.addResult(`/api/v1/programs/${program.id} [deactivate]`, 'PUT', 'PASS', {
        duration,
        message: `Program deactivated successfully: ${updatedProgram.name}`,
        response: { 
          programId: updatedProgram.id,
          isActive: updatedProgram.isActive
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs/:id [deactivate]', 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with deactivated program'
      });
    }
  }

  async testDeleteProgram() {
    this.logger.subheader('Test: Eliminar programa académico');
    
    if (this.testData.createdPrograms.length === 0) {
      this.reporter.addResult('/api/v1/programs/:id', 'DELETE', 'SKIP', {
        reason: 'No programs created to delete'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const program = this.testData.createdPrograms.pop(); // Tomar el último
      
      const response = await httpClient.authDelete(`/api/v1/programs/${program.id}`, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar código de respuesta
      if (![200, 204].includes(response.status)) {
        throw new Error(`Unexpected status code: ${response.status}`);
      }

      // Verificar que el programa ya no existe
      try {
        await httpClient.get(`/api/v1/programs/${program.id}`);
        throw new Error('Program still accessible after deletion');
      } catch (notFoundError) {
        if (!notFoundError.message.includes('404')) {
          throw notFoundError;
        }
      }

      this.reporter.addResult(`/api/v1/programs/${program.id}`, 'DELETE', 'PASS', {
        duration,
        message: `Program deleted successfully: ${program.name}`,
        response: { 
          deletedProgramId: program.id,
          verified: true
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs/:id', 'DELETE', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 204 and program not accessible afterward'
      });
    }
  }

  async testValidationErrors() {
    this.logger.subheader('Test: Errores de validación');
    
    const tests = [
      {
        name: 'Create program without name',
        data: { code: 'TEST-NO-NAME' },
        expectedError: 'name'
      },
      {
        name: 'Create program without code',
        data: { name: 'Test Program No Code' },
        expectedError: 'code'
      },
      {
        name: 'Create program with invalid email',
        data: { 
          name: 'Test Invalid Email', 
          code: 'TEST-INV-EMAIL', 
          contact: 'invalid-email'
        },
        expectedError: 'email'
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      
      try {
        const response = await httpClient.authPost('/api/v1/programs', test.data, this.testData.adminUser);
        
        const duration = Date.now() - startTime;
        this.reporter.addResult(`/api/v1/programs [${test.name}]`, 'POST', 'WARN', {
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
          this.reporter.addResult(`/api/v1/programs [${test.name}]`, 'POST', 'PASS', {
            duration,
            message: `Validation error correctly caught`,
            response: { testCase: test.name, errorType: test.expectedError }
          });
        } else {
          this.reporter.addResult(`/api/v1/programs [${test.name}]`, 'POST', 'FAIL', {
            duration,
            error: `Unexpected error: ${error.message}`,
            expected: `Validation error containing '${test.expectedError}'`
          });
        }
      }
    }
  }

  async testUniqueCodeConstraint() {
    this.logger.subheader('Test: Restricción de código único');
    const startTime = Date.now();

    try {
      // Intentar crear programa con código de uno existente
      const duplicateProgram = {
        name: 'Ingeniería de Sistemas Duplicada',
        code: 'ING-SIS', // Código que ya existe
        description: 'Este programa debería fallar por código duplicado'
      };

      const response = await httpClient.authPost('/api/v1/programs', duplicateProgram, this.testData.adminUser);
      
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/programs [duplicate code]', 'POST', 'WARN', {
        duration,
        message: `Expected duplicate code error but request succeeded`,
        response: { duplicateCode: 'ING-SIS' }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const isDuplicateError = error.message.toLowerCase().includes('duplicate') ||
                              error.message.toLowerCase().includes('already exists') ||
                              error.status === 409;
      
      if (isDuplicateError) {
        this.reporter.addResult('/api/v1/programs [duplicate code]', 'POST', 'PASS', {
          duration,
          message: `Duplicate code error correctly caught`,
          response: { duplicateCode: 'ING-SIS', errorStatus: error.status }
        });
      } else {
        this.reporter.addResult('/api/v1/programs [duplicate code]', 'POST', 'FAIL', {
          duration,
          error: `Unexpected error: ${error.message}`,
          expected: 'HTTP 409 or similar duplicate error'
        });
      }
    }
  }

  async testProgramResourceAssociation() {
    this.logger.subheader('Test: Asociación programa-recurso');
    const startTime = Date.now();

    try {
      // Crear un recurso asociado a un programa personalizado
      if (this.testData.createdPrograms.length === 0) {
        this.reporter.addResult('/api/v1/resources [program association]', 'POST', 'SKIP', {
          reason: 'No custom programs available for association test'
        });
        return;
      }

      const program = this.testData.createdPrograms[0];
      const newResource = TestUtils.generateTestData('resource', {
        name: `Recurso para ${program.name}`,
        code: `REC-${program.code}-${Date.now()}`,
        programId: program.id
      });

      const response = await httpClient.authPost('/api/v1/resources', newResource, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      if (response.status === 201 || response.status === 200) {
        const createdResource = response.data.data;
        
        // Verificar que la asociación se guardó
        if (createdResource.programId !== program.id) {
          this.logger.warn(`Program association not saved: expected ${program.id}, got ${createdResource.programId}`);
        }

        this.reporter.addResult('/api/v1/resources [program association]', 'POST', 'PASS', {
          duration,
          message: `Resource created with program association`,
          response: { 
            resourceId: createdResource.id,
            programId: createdResource.programId,
            programName: program.name
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
      this.reporter.addResult('/api/v1/resources [program association]', 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with resource associated to custom program'
      });
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de programas creados');
    
    for (const program of this.testData.createdPrograms) {
      try {
        await httpClient.authDelete(`/api/v1/programs/${program.id}`, this.testData.adminUser);
        this.logger.debug(`Cleaned up program: ${program.id} - ${program.name}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup program ${program.id}:`, error.message);
      }
    }
    
    this.logger.success(`Cleanup completed - ${this.testData.createdPrograms.length} programs cleaned`);
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
  const flow = new ProgramsManagementFlow();
  flow.run().catch(console.error);
}

module.exports = { ProgramsManagementFlow };
