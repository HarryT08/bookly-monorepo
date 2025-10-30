#!/usr/bin/env node

/**
 * HITO 3 - STOCKPILE CORE: DOCUMENT TEMPLATES (REFACTORIZADO)
 * 
 * Flujo completo de testing para plantillas de documentos:
 * - RF-21: Generación automática de documentos de aprobación o rechazo
 * - Gestión completa de plantillas (CRUD)
 * - Generación dinámica de documentos
 * - Versionado y exportación de plantillas
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class DocumentTemplatesFlow {
  constructor() {
    this.logger = new TestLogger('Document-Templates');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-3-Stockpile', 'Document-Templates');
    this.testData = {
      createdTemplates: [],
      generatedDocuments: [],
      adminUser: TEST_DATA.USERS.ADMIN_GENERAL,
      coordUser: TEST_DATA.USERS.ADMIN_PROGRAMA
    };
  }

  async run() {
    this.logger.header('HITO 3 - DOCUMENT TEMPLATES TESTING');
    this.logger.info('Iniciando testing completo de plantillas de documentos...');

    try {
      await this.setup();
      await this.testCreateDocumentTemplate();
      await this.testListDocumentTemplates();
      await this.testGetDocumentTemplate();
      await this.testUpdateDocumentTemplate();
      await this.testGenerateDocument();
      await this.testExportTemplateFormats();
      await this.testTemplateVersioning();
      await this.testValidateTemplate();
      await this.testDeleteDocumentTemplate();
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
      await this.httpClient.authenticate(this.testData.coordUser);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testCreateDocumentTemplate() {
    this.logger.subheader('Test: Crear plantilla de documento');
    const startTime = Date.now();

    try {
      const templateData = this.dataGenerator.getTestData(3, 'documentTemplate', {
        name: `Autorización Uso Auditorio ${Date.now()}`,
        description: 'Plantilla para generar cartas de autorización de uso de auditorios',
        type: 'AUTHORIZATION_LETTER',
        category: 'RESOURCE_BOOKING',
        content: `
          <h1>UNIVERSIDAD FRANCISCO DE PAULA SANTANDER</h1>
          <h2>AUTORIZACIÓN DE USO DE AUDITORIO</h2>
          
          <p>Por medio de la presente se autoriza a:</p>
          <p><strong>Nombre:</strong> {{requesterName}}</p>
          <p><strong>Identificación:</strong> {{requesterId}}</p>
          <p><strong>Programa:</strong> {{academicProgram}}</p>
          
          <p>Para el uso del recurso:</p>
          <p><strong>Recurso:</strong> {{resourceName}}</p>
          <p><strong>Ubicación:</strong> {{resourceLocation}}</p>
          <p><strong>Fecha:</strong> {{reservationDate}}</p>
          <p><strong>Horario:</strong> {{startTime}} - {{endTime}}</p>
          
          <p><strong>Propósito:</strong> {{purpose}}</p>
          
          <h3>Condiciones de Uso:</h3>
          <ul>
            {{#each conditions}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          
          <p>Código de Autorización: {{approvalCode}}</p>
          <p>Válida hasta: {{validUntil}}</p>
          
          <p>Atentamente,</p>
          <p>{{approverName}}<br/>{{approverTitle}}</p>
        `,
        variables: [
          { name: 'requesterName', type: 'string', required: true },
          { name: 'requesterId', type: 'string', required: true },
          { name: 'academicProgram', type: 'string', required: false },
          { name: 'resourceName', type: 'string', required: true },
          { name: 'resourceLocation', type: 'string', required: false },
          { name: 'reservationDate', type: 'date', required: true },
          { name: 'startTime', type: 'time', required: true },
          { name: 'endTime', type: 'time', required: true },
          { name: 'purpose', type: 'text', required: true },
          { name: 'conditions', type: 'array', required: false },
          { name: 'approvalCode', type: 'string', required: true },
          { name: 'validUntil', type: 'date', required: true },
          { name: 'approverName', type: 'string', required: true },
          { name: 'approverTitle', type: 'string', required: true }
        ],
        outputFormats: ['PDF', 'HTML', 'DOCX'],
        isActive: true,
        version: '1.0'
      });

      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'create');
      const response = await this.httpClient.authPost(endpoint, templateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Template creation validation failed: ${validation.errors.join(', ')}`);
      }

      const createdTemplate = response.data.data;
      this.testData.createdTemplates.push(createdTemplate);

      // Validar estructura de la plantilla creada
      const templateValidation = this.validator.validateEntity(createdTemplate,
        ['id', 'name', 'type', 'content'],
        ['description', 'category', 'variables', 'outputFormats', 'isActive', 'version']
      );

      if (!templateValidation.isValid) {
        this.logger.warn('Created template structure issues:', templateValidation.errors);
      }

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Created document template: ${createdTemplate.name}`,
        templateId: createdTemplate.id,
        outputFormats: createdTemplate.outputFormats?.length || 0
      });

      this.logger.success(`✅ Plantilla creada: ${createdTemplate.name} (ID: ${createdTemplate.id}) (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'create');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 201 with created document template'
      });
      this.logger.error(`❌ Error creando plantilla: ${error.message}`);
    }
  }

  async testListDocumentTemplates() {
    this.logger.subheader('Test: Listar plantillas de documentos');
    const startTime = Date.now();

    try {
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'list');
      const response = await this.httpClient.authGet(endpoint, this.testData.adminUser, {
        params: { page: 1, limit: 10, type: 'AUTHORIZATION_LETTER' }
      });

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'PAGINATED');
      
      if (!validation.isValid) {
        throw new Error(`Templates list validation failed: ${validation.errors.join(', ')}`);
      }

      const templates = response.data.data;
      if (templates.length > 0) {
        for (const template of templates) {
          const templateValidation = this.validator.validateEntity(template,
            ['id', 'name', 'type'], ['description', 'isActive', 'version']
          );
          if (!templateValidation.isValid) {
            this.logger.warn(`Template ${template.id} validation issues:`, templateValidation.errors);
          }
        }
      }

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved ${templates.length} document templates`,
        templatesCount: templates.length
      });

      this.logger.success(`✅ Plantillas listadas: ${templates.length} encontradas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'list');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with paginated templates list'
      });
      this.logger.error(`❌ Error listando plantillas: ${error.message}`);
    }
  }

  async testGetDocumentTemplate() {
    this.logger.subheader('Test: Obtener plantilla específica');
    
    if (this.testData.createdTemplates.length === 0) {
      this.logger.warn('No hay plantillas creadas para obtener');
      return;
    }

    const startTime = Date.now();

    try {
      const template = this.testData.createdTemplates[0];
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'getById').replace(':id', template.id);
      const response = await this.httpClient.authGet(endpoint, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Template get validation failed: ${validation.errors.join(', ')}`);
      }

      const retrievedTemplate = response.data.data;

      this.reporter.addResult(endpoint, 'GET', 'PASS', {
        duration,
        message: `Retrieved template: ${retrievedTemplate.name}`,
        templateId: retrievedTemplate.id
      });

      this.logger.success(`✅ Plantilla obtenida: ${retrievedTemplate.name} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'getById');
      this.reporter.addResult(endpoint, 'GET', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with template details'
      });
      this.logger.error(`❌ Error obteniendo plantilla: ${error.message}`);
    }
  }

  async testUpdateDocumentTemplate() {
    this.logger.subheader('Test: Actualizar plantilla de documento');
    
    if (this.testData.createdTemplates.length === 0) {
      this.logger.warn('No hay plantillas creadas para actualizar');
      return;
    }

    const startTime = Date.now();

    try {
      const template = this.testData.createdTemplates[0];
      const updateData = {
        name: `${template.name} - Actualizada`,
        description: 'Plantilla actualizada durante testing',
        content: template.content + '\n<p>ACTUALIZADA</p>',
        version: '1.1'
      };

      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'update').replace(':id', template.id);
      const response = await this.httpClient.authPut(endpoint, updateData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Template update validation failed: ${validation.errors.join(', ')}`);
      }

      const updatedTemplate = response.data.data;

      this.reporter.addResult(endpoint, 'PUT', 'PASS', {
        duration,
        message: `Updated template: ${updatedTemplate.name}`,
        templateId: updatedTemplate.id,
        newVersion: updatedTemplate.version
      });

      this.logger.success(`✅ Plantilla actualizada: ${updatedTemplate.name} v${updatedTemplate.version} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'update');
      this.reporter.addResult(endpoint, 'PUT', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with updated template'
      });
      this.logger.error(`❌ Error actualizando plantilla: ${error.message}`);
    }
  }

  async testGenerateDocument() {
    this.logger.subheader('Test: Generar documento desde plantilla');
    
    if (this.testData.createdTemplates.length === 0) {
      this.logger.warn('No hay plantillas creadas para generar documento');
      return;
    }

    const startTime = Date.now();

    try {
      const template = this.testData.createdTemplates[0];
      const generationData = {
        templateId: template.id,
        format: 'PDF',
        data: {
          requesterName: 'Juan Carlos Pérez',
          requesterId: '1094123456',
          academicProgram: 'Ingeniería de Sistemas',
          resourceName: 'Auditorio Central - Bloque A',
          resourceLocation: 'Piso 1, Bloque A',
          reservationDate: '2024-01-15',
          startTime: '14:00',
          endTime: '16:00',
          purpose: 'Presentación de proyecto de grado - Desarrollo de aplicación web',
          conditions: [
            'Mantener el orden y aseo del auditorio',
            'No consumir alimentos ni bebidas',
            'Reportar cualquier daño a los equipos'
          ],
          approvalCode: 'AUTH-2024-001',
          validUntil: '2024-01-15',
          approverName: 'María González',
          approverTitle: 'Coordinadora de Programa'
        },
        metadata: {
          generatedBy: this.testData.coordUser.id,
          purpose: 'APPROVAL_DOCUMENT',
          relatedEntity: 'reservation_001'
        }
      };

      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'generate').replace(':id', template.id);
      const response = await this.httpClient.authPost(endpoint, generationData, this.testData.coordUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Document generation validation failed: ${validation.errors.join(', ')}`);
      }

      const generatedDocument = response.data.data;
      this.testData.generatedDocuments.push(generatedDocument);

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Generated document from template: ${template.name}`,
        documentId: generatedDocument.id,
        format: generatedDocument.format
      });

      this.logger.success(`✅ Documento generado: ${generatedDocument.id} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'generate');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with generated document'
      });
      this.logger.error(`❌ Error generando documento: ${error.message}`);
    }
  }

  async testExportTemplateFormats() {
    this.logger.subheader('Test: Exportar plantilla en múltiples formatos');
    
    if (this.testData.createdTemplates.length === 0) {
      this.logger.warn('No hay plantillas creadas para exportar');
      return;
    }

    const startTime = Date.now();

    try {
      const template = this.testData.createdTemplates[0];
      const formats = ['PDF', 'HTML', 'DOCX'];
      const exportResults = [];

      for (const format of formats) {
        const exportData = {
          format: format,
          includeMetadata: true,
          compression: format !== 'HTML'
        };

        const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'export').replace(':id', template.id);
        const response = await this.httpClient.authPost(endpoint, exportData, this.testData.adminUser);

        if (response.data.success) {
          exportResults.push({
            format: format,
            downloadUrl: response.data.data.downloadUrl,
            fileSize: response.data.data.fileSize
          });
        }
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(getEndpointUrl('stockpile-service', 'document-templates', 'export'), 'POST', 'PASS', {
        duration,
        message: `Exported template in ${exportResults.length} formats`,
        exportedFormats: exportResults.length
      });

      this.logger.success(`✅ Plantilla exportada en ${exportResults.length} formatos (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'export');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with exported files'
      });
      this.logger.error(`❌ Error exportando plantilla: ${error.message}`);
    }
  }

  async testTemplateVersioning() {
    this.logger.subheader('Test: Versionado de plantillas');
    
    if (this.testData.createdTemplates.length === 0) {
      this.logger.warn('No hay plantillas creadas para versionado');
      return;
    }

    const startTime = Date.now();

    try {
      const template = this.testData.createdTemplates[0];
      const versionData = {
        content: `
          <h1>UNIVERSIDAD FRANCISCO DE PAULA SANTANDER - VERSIÓN 2.0</h1>
          <h2>AUTORIZACIÓN DE USO DE AUDITORIO</h2>
          <p>Documento actualizado con nuevo formato institucional</p>
          <p><strong>Nombre:</strong> {{requesterName}}</p>
        `,
        changeLog: 'Actualización de formato institucional y mejora de diseño',
        version: '2.0'
      };

      const versionEndpoint = getEndpointUrl('stockpile-service', 'document-templates', 'versions').replace(':id', template.id);
      const versionResponse = await this.httpClient.authPost(versionEndpoint, versionData, this.testData.adminUser);

      const versionsEndpoint = getEndpointUrl('stockpile-service', 'document-templates', 'getVersions').replace(':id', template.id);
      const versionsResponse = await this.httpClient.authGet(versionsEndpoint, this.testData.adminUser);

      const duration = Date.now() - startTime;
      
      if (versionResponse.data.success && versionsResponse.data.success) {
        const versions = versionsResponse.data.data;
        
        this.reporter.addResult(versionEndpoint, 'POST', 'PASS', {
          duration,
          message: `Template versioning successful: ${versions.length} versions`,
          versionsCount: versions.length
        });

        this.logger.success(`✅ Versionado completado: ${versions.length} versiones (${duration}ms)`);
      } else {
        throw new Error('Versioning failed');
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'versions');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with version created'
      });
      this.logger.error(`❌ Error en versionado: ${error.message}`);
    }
  }

  async testValidateTemplate() {
    this.logger.subheader('Test: Validar plantilla');
    
    if (this.testData.createdTemplates.length === 0) {
      this.logger.warn('No hay plantillas creadas para validar');
      return;
    }

    const startTime = Date.now();

    try {
      const template = this.testData.createdTemplates[0];
      const validationData = {
        content: template.content,
        variables: template.variables
      };

      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'validate');
      const response = await this.httpClient.authPost(endpoint, validationData, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      const validationResult = response.data.data;

      this.reporter.addResult(endpoint, 'POST', 'PASS', {
        duration,
        message: `Template validation completed`,
        isValid: validationResult.isValid,
        errorsCount: validationResult.errors?.length || 0
      });

      this.logger.success(`✅ Validación completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'validate');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with validation result'
      });
      this.logger.error(`❌ Error validando plantilla: ${error.message}`);
    }
  }

  async testDeleteDocumentTemplate() {
    this.logger.subheader('Test: Eliminar plantilla de documento');
    
    if (this.testData.createdTemplates.length === 0) {
      this.logger.warn('No hay plantillas creadas para eliminar');
      return;
    }

    const startTime = Date.now();

    try {
      const template = this.testData.createdTemplates[this.testData.createdTemplates.length - 1];
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'delete').replace(':id', template.id);
      const response = await this.httpClient.authDelete(endpoint, this.testData.adminUser);

      const duration = Date.now() - startTime;
      const validation = this.validator.validateBooklyResponse(response, 'SUCCESS');
      
      if (!validation.isValid) {
        throw new Error(`Template deletion validation failed: ${validation.errors.join(', ')}`);
      }

      // Remover de la lista para evitar cleanup duplicado
      this.testData.createdTemplates.pop();

      this.reporter.addResult(endpoint, 'DELETE', 'PASS', {
        duration,
        message: `Deleted template: ${template.id}`,
        templateId: template.id
      });

      this.logger.success(`✅ Plantilla eliminada: ${template.id} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'delete');
      this.reporter.addResult(endpoint, 'DELETE', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with deletion confirmation'
      });
      this.logger.error(`❌ Error eliminando plantilla: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar documentos generados
    for (const document of this.testData.generatedDocuments) {
      try {
        const endpoint = getEndpointUrl('stockpile-service', 'generated-documents', 'delete').replace(':id', document.id);
        await this.httpClient.authDelete(endpoint, this.testData.adminUser);
        this.logger.debug(`Cleaned up document: ${document.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup document ${document.id}:`, error.message);
      }
    }

    // Limpiar plantillas restantes
    for (const template of this.testData.createdTemplates) {
      try {
        const endpoint = getEndpointUrl('stockpile-service', 'document-templates', 'delete').replace(':id', template.id);
        await this.httpClient.authDelete(endpoint, this.testData.adminUser);
        this.logger.debug(`Cleaned up template: ${template.id}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup template ${template.id}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 3: DOCUMENT TEMPLATES');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-3-stockpile-document-templates.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new DocumentTemplatesFlow();
  flow.run().catch(console.error);
}

module.exports = { DocumentTemplatesFlow };
