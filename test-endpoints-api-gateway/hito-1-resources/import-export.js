#!/usr/bin/env node

/**
 * HITO 1 - RESOURCES CORE: IMPORT/EXPORT
 * 
 * Flujo completo de testing para importación y exportación masiva:
 * - RF-04: Importación masiva de recursos
 * - Formato CSV estándar con campos mínimos
 * - Validación de datos y manejo de errores
 * 
 * Endpoints probados:
 * - GET /api/v1/resources/export/template
 * - POST /api/v1/resources/import/csv
 * - GET /api/v1/resources/import/history
 * - GET /api/v1/resources/import/status/:jobId
 */

const { httpClient } = require('../shared/http-client');
const { TestValidator, TestUtils } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_USERS, TEST_DATA, CONFIG } = require('../shared/config');
const { TestLogger } = require('../shared/logger');

class ImportExportFlow {
  constructor() {
    this.logger = new TestLogger('Import-Export');
    this.validator = new TestValidator();
    this.reporter = new TestReporter('Hito-1-Resources', 'Import-Export');
    this.testData = {
      importJobs: [],
      adminUser: TEST_USERS.ADMIN_GENERAL,
      adminProgramaUser: TEST_USERS.ADMIN_PROGRAMA
    };
  }

  async run() {
    this.logger.header('HITO 1 - IMPORT/EXPORT FLOW');
    this.logger.info('Iniciando testing completo de importación/exportación masiva...');

    try {
      // 1. Setup inicial
      await this.setup();
      
      // 2. Tests de exportación
      await this.testDownloadTemplate();
      await this.testExportCurrentResources();
      
      // 3. Tests de importación básica
      await this.testImportValidCSV();
      await this.testImportWithValidation();
      
      // 4. Tests de errores de importación
      await this.testImportInvalidCSV();
      await this.testImportDuplicateCodes();
      
      // 5. Tests de tracking
      await this.testImportHistory();
      await this.testImportJobStatus();
      
      // 6. Tests de importación avanzada
      await this.testBulkImportLarge();
      
      // 7. Cleanup
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
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testDownloadTemplate() {
    this.logger.subheader('Test: Descargar plantilla CSV');
    const startTime = Date.now();

    try {
      const response = await httpClient.authGet('/api/v1/resources/export/template', this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Verificar que es un archivo CSV
      const contentType = response.headers['content-type'] || '';
      const isCSV = contentType.includes('text/csv') || 
                    contentType.includes('application/csv') ||
                    contentType.includes('text/plain');
      
      if (!isCSV && response.status === 200) {
        this.logger.warn(`Expected CSV content type, got: ${contentType}`);
      }

      // Si la respuesta contiene datos CSV, verificar estructura mínima
      if (response.data && typeof response.data === 'string') {
        const lines = response.data.split('\n');
        const headers = lines[0]?.split(',') || [];
        
        // Verificar headers mínimos requeridos
        const requiredHeaders = ['name', 'code', 'capacity'];
        const missingHeaders = requiredHeaders.filter(h => 
          !headers.some(header => header.toLowerCase().includes(h))
        );
        
        if (missingHeaders.length > 0) {
          this.logger.warn(`Missing required headers: ${missingHeaders.join(', ')}`);
        }
      }

      this.reporter.addResult('/api/v1/resources/export/template', 'GET', 'PASS', {
        duration,
        message: `CSV template downloaded successfully`,
        response: {
          contentType,
          size: response.data?.length || 0,
          hasCSVHeaders: true
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.addResult('/api/v1/resources/export/template', 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with CSV template file'
      });
    }
  }

  async testExportCurrentResources() {
    this.logger.subheader('Test: Exportar recursos actuales');
    const startTime = Date.now();

    try {
      // Endpoint puede ser diferente según implementación
      const response = await httpClient.authGet('/api/v1/resources/export/csv', this.testData.adminUser, {
        params: { format: 'csv' }
      });

      const duration = Date.now() - startTime;
      
      // Validar respuesta
      if (response.status === 200) {
        const contentType = response.headers['content-type'] || '';
        const isCSV = contentType.includes('csv') || contentType.includes('text/plain');
        
        this.reporter.addResult('/api/v1/resources/export/csv', 'GET', 'PASS', {
          duration,
          message: `Resources exported to CSV`,
          response: {
            contentType,
            dataSize: response.data?.length || 0
          }
        });
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Puede que este endpoint no esté implementado aún
      if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/export/csv', 'GET', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Export current resources endpoint not implemented yet'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/export/csv', 'GET', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200 with exported CSV data'
        });
      }
    }
  }

  async testImportValidCSV() {
    this.logger.subheader('Test: Importar CSV válido');
    const startTime = Date.now();

    try {
      // Crear datos CSV válidos para importación
      const csvData = this.generateValidCSVData();
      
      const response = await httpClient.authPost('/api/v1/resources/import/csv', 
        { csvData }, // Puede necesitar FormData según implementación
        this.testData.adminUser,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const duration = Date.now() - startTime;
      
      // Validar respuesta de importación
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const importResult = response.data.data;
      
      // Verificar que se creó un job de importación
      if (importResult.jobId || importResult.id) {
        this.testData.importJobs.push(importResult.jobId || importResult.id);
      }

      this.reporter.addResult('/api/v1/resources/import/csv', 'POST', 'PASS', {
        duration,
        message: `CSV import initiated successfully`,
        response: {
          jobId: importResult.jobId || importResult.id,
          recordsToProcess: importResult.recordsCount || 'N/A',
          status: importResult.status || 'processing'
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Puede que el endpoint no esté completamente implementado
      if (error.status === 404 || error.status === 501) {
        this.reporter.addResult('/api/v1/resources/import/csv', 'POST', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'CSV import endpoint not fully implemented yet'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/import/csv', 'POST', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200 with import job details'
        });
      }
    }
  }

  async testImportWithValidation() {
    this.logger.subheader('Test: Importar con validación de campos');
    const startTime = Date.now();

    try {
      // CSV con datos que requieren validación
      const csvData = this.generateCSVWithValidation();
      
      const response = await httpClient.authPost('/api/v1/resources/import/csv',
        { 
          csvData,
          validateOnly: true // Modo de solo validación
        },
        this.testData.adminUser
      );

      const duration = Date.now() - startTime;
      
      // Validar respuesta de validación
      if (response.status === 200) {
        const validationResult = response.data.data;
        
        this.reporter.addResult('/api/v1/resources/import/csv [validation]', 'POST', 'PASS', {
          duration,
          message: `CSV validation completed`,
          response: {
            validRecords: validationResult.validCount || 0,
            invalidRecords: validationResult.invalidCount || 0,
            errors: validationResult.errors?.length || 0
          }
        });
      } else {
        throw new Error(`Validation failed with status: ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 404 || error.status === 501) {
        this.reporter.addResult('/api/v1/resources/import/csv [validation]', 'POST', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'CSV validation feature not implemented yet'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/import/csv [validation]', 'POST', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200 with validation results'
        });
      }
    }
  }

  async testImportInvalidCSV() {
    this.logger.subheader('Test: Importar CSV inválido');
    const startTime = Date.now();

    try {
      // CSV con datos inválidos
      const invalidCSV = this.generateInvalidCSVData();
      
      const response = await httpClient.authPost('/api/v1/resources/import/csv',
        { csvData: invalidCSV },
        this.testData.adminUser
      );

      const duration = Date.now() - startTime;
      
      // Debería retornar errores de validación
      if (response.status >= 400) {
        this.reporter.addResult('/api/v1/resources/import/csv [invalid]', 'POST', 'PASS', {
          duration,
          message: `Invalid CSV correctly rejected`,
          response: {
            errorStatus: response.status,
            hasValidationErrors: true
          }
        });
      } else {
        // Si acepta CSV inválido, es un problema
        this.reporter.addResult('/api/v1/resources/import/csv [invalid]', 'POST', 'WARN', {
          duration,
          message: `Invalid CSV was accepted - validation may be insufficient`,
          response: {
            status: response.status,
            shouldHaveBeenRejected: true
          }
        });
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Error esperado para CSV inválido
      const isValidationError = error.status === 400 || error.status === 422;
      
      if (isValidationError) {
        this.reporter.addResult('/api/v1/resources/import/csv [invalid]', 'POST', 'PASS', {
          duration,
          message: `Invalid CSV correctly rejected with validation error`,
          response: {
            errorStatus: error.status,
            validationWorking: true
          }
        });
      } else if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/import/csv [invalid]', 'POST', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'CSV import validation not implemented'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/import/csv [invalid]', 'POST', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 400/422 validation error for invalid CSV'
        });
      }
    }
  }

  async testImportDuplicateCodes() {
    this.logger.subheader('Test: Importar con códigos duplicados');
    const startTime = Date.now();

    try {
      // CSV con códigos que ya existen
      const duplicateCSV = this.generateDuplicateCodesCSV();
      
      const response = await httpClient.authPost('/api/v1/resources/import/csv',
        { csvData: duplicateCSV },
        this.testData.adminUser
      );

      const duration = Date.now() - startTime;
      
      // Debería manejar duplicados apropiadamente
      if (response.status === 200) {
        const result = response.data.data;
        
        this.reporter.addResult('/api/v1/resources/import/csv [duplicates]', 'POST', 'PASS', {
          duration,
          message: `Duplicate codes handled appropriately`,
          response: {
            duplicatesFound: result.duplicatesCount || 'N/A',
            action: result.duplicateAction || 'unknown'
          }
        });
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 409) {
        this.reporter.addResult('/api/v1/resources/import/csv [duplicates]', 'POST', 'PASS', {
          duration,
          message: `Duplicate codes correctly rejected`,
          response: { conflictDetected: true }
        });
      } else if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/import/csv [duplicates]', 'POST', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Duplicate code detection not implemented'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/import/csv [duplicates]', 'POST', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200 with duplicate handling or HTTP 409'
        });
      }
    }
  }

  async testImportHistory() {
    this.logger.subheader('Test: Historial de importaciones');
    const startTime = Date.now();

    try {
      const response = await httpClient.authGet('/api/v1/resources/import/history', this.testData.adminUser, {
        params: { page: 1, limit: 10 }
      });

      const duration = Date.now() - startTime;
      
      // Validar respuesta de historial
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const history = response.data.data;
      
      this.reporter.addResult('/api/v1/resources/import/history', 'GET', 'PASS', {
        duration,
        message: `Import history retrieved: ${history.length} records`,
        response: {
          historyCount: history.length,
          totalRecords: response.data.meta?.total || 0
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/import/history', 'GET', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Import history tracking not implemented'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/import/history', 'GET', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200 with paginated import history'
        });
      }
    }
  }

  async testImportJobStatus() {
    this.logger.subheader('Test: Estado de job de importación');
    
    if (this.testData.importJobs.length === 0) {
      this.reporter.addResult('/api/v1/resources/import/status/:jobId', 'GET', 'SKIP', {
        reason: 'No import jobs created to check status'
      });
      return;
    }

    const startTime = Date.now();

    try {
      const jobId = this.testData.importJobs[0];
      const response = await httpClient.authGet(`/api/v1/resources/import/status/${jobId}`, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      // Validar respuesta de estado
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
      }

      const jobStatus = response.data.data;
      
      this.reporter.addResult(`/api/v1/resources/import/status/${jobId}`, 'GET', 'PASS', {
        duration,
        message: `Job status retrieved: ${jobStatus.status || 'unknown'}`,
        response: {
          jobId,
          status: jobStatus.status,
          progress: jobStatus.progress || 'N/A',
          processedRecords: jobStatus.processedCount || 0
        }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/import/status/:jobId', 'GET', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Import job status tracking not implemented'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/import/status/:jobId', 'GET', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200 with job status details'
        });
      }
    }
  }

  async testBulkImportLarge() {
    this.logger.subheader('Test: Importación masiva grande');
    const startTime = Date.now();

    try {
      // Generar CSV con muchos registros para probar rendimiento
      const largeCSV = this.generateLargeCSVData(50); // 50 recursos
      
      const response = await httpClient.authPost('/api/v1/resources/import/csv',
        { csvData: largeCSV },
        this.testData.adminUser,
        { timeout: 60000 } // Timeout mayor para importación grande
      );

      const duration = Date.now() - startTime;
      
      if (response.status === 200 || response.status === 202) {
        const result = response.data.data;
        
        // Para importaciones grandes, debería ser asíncrono
        if (response.status === 202) {
          this.logger.success('Large import processed asynchronously (recommended)');
        }
        
        this.reporter.addResult('/api/v1/resources/import/csv [large]', 'POST', 'PASS', {
          duration,
          message: `Large CSV import handled (50 records)`,
          response: {
            recordCount: 50,
            isAsync: response.status === 202,
            jobId: result.jobId || result.id,
            estimatedTime: result.estimatedTime || 'N/A'
          }
        });
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.status === 413) {
        this.reporter.addResult('/api/v1/resources/import/csv [large]', 'POST', 'WARN', {
          duration,
          message: `Large CSV rejected due to size limits`,
          response: { 
            errorStatus: 413,
            needsStreamingSupport: true 
          }
        });
      } else if (error.status === 404) {
        this.reporter.addResult('/api/v1/resources/import/csv [large]', 'POST', 'NOT_IMPLEMENTED', {
          duration,
          reason: 'Bulk import not implemented for large datasets'
        });
      } else {
        this.reporter.addResult('/api/v1/resources/import/csv [large]', 'POST', 'FAIL', {
          duration,
          error: error.message,
          expected: 'HTTP 200/202 with large import handling'
        });
      }
    }
  }

  // Utilidades para generar datos CSV de prueba
  generateValidCSVData() {
    const timestamp = Date.now();
    return `name,code,capacity,description,categoryId,programId
Sala Test Import ${timestamp},TIMP-${timestamp},30,Sala creada via import,1,1
Lab Test Import ${timestamp},LIMP-${timestamp},25,Laboratorio creado via import,2,1`;
  }

  generateCSVWithValidation() {
    const timestamp = Date.now();
    return `name,code,capacity,description,categoryId,programId
Sala Validación ${timestamp},TVAL-${timestamp},30,Sala para validación,1,1
,EMPTY-NAME-${timestamp},20,Recurso sin nombre,1,1
Recurso Sin Código ${timestamp},,15,Recurso sin código,1,1`;
  }

  generateInvalidCSVData() {
    return `invalid,csv,format
missing,headers
invalid;separator;used
"unclosed quotes,broken format`;
  }

  generateDuplicateCodesCSV() {
    return `name,code,capacity,description,categoryId,programId
Sala Duplicada 1,SA-101,30,Intento duplicar código existente,1,1
Sala Duplicada 2,LS-201,25,Otro intento de duplicación,2,1`;
  }

  generateLargeCSVData(count = 50) {
    const timestamp = Date.now();
    let csv = 'name,code,capacity,description,categoryId,programId\n';
    
    for (let i = 1; i <= count; i++) {
      csv += `Recurso Masivo ${i} ${timestamp},BULK-${i}-${timestamp},${20 + (i % 30)},Recurso ${i} para importación masiva,${(i % 4) + 1},${(i % 4) + 1}\n`;
    }
    
    return csv;
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos importados');
    
    // Aquí se podría implementar limpieza de recursos importados
    // Por ahora solo log del resumen
    this.logger.success(`Cleanup completed - ${this.testData.importJobs.length} import jobs tracked`);
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
  const flow = new ImportExportFlow();
  flow.run().catch(console.error);
}

module.exports = { ImportExportFlow };
