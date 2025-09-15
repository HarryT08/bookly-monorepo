#!/usr/bin/env node

/**
 * Hito 3 - Stockpile Core: Document Templates Tests
 * Tests para CRUD de plantillas de documentos y generación dinámica
 */

const { httpClient } = require('../shared/http-client');
const { logger } = require('../shared/logger');
const { CONFIG } = require('../shared/config');
const { TestReporter } = require('../shared/test-reporter');

const STOCKPILE_BASE_URL = `${CONFIG.SERVICES.STOCKPILE}/stockpile`;

const TEST_USERS = {
  admin: { email: 'admin@ufps.edu.co', password: 'Admin123!' },
  coordinator: { email: 'coord.sistemas@ufps.edu.co', password: 'Coord123!' },
  administrative: { email: 'administrativo@ufps.edu.co', password: 'Admin123!' }
};

let testData = {
  templates: [],
  generatedDocuments: []
};

async function testDocumentTemplates() {
  logger.info('🚀 Iniciando Hito 3 - Stockpile Core: Document Templates Tests');
  
  const startTime = Date.now();
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: [],
    performance: {},
    coverage: []
  };

  try {
    await authenticateUsers();
    
    await testCreateDocumentTemplate(results);
    await testListDocumentTemplates(results);
    await testGetDocumentTemplate(results);
    await testUpdateDocumentTemplate(results);
    await testGenerateDocument(results);
    await testExportTemplateFormats(results);
    await testTemplateVersioning(results);
    await testValidateTemplate(results);
    await testDeleteDocumentTemplate(results);
    
    await cleanupTestData(results);

  } catch (error) {
    logger.error('❌ Error general en document templates:', error.message);
    results.errors.push({ test: 'general', error: error.message });
  }

  const endTime = Date.now();
  results.executionTime = endTime - startTime;
  results.successRate = results.totalTests > 0 ? (results.passed / results.totalTests * 100).toFixed(2) : 0;

  await generateTestReport(results);
  
  logger.info(`✅ Document Templates Tests completados: ${results.passed}/${results.totalTests} exitosos (${results.successRate}%)`);
  
  return results;
}

async function authenticateUsers() {
  logger.info('🔐 Autenticando usuarios de prueba...');
  
  for (const [role, credentials] of Object.entries(TEST_USERS)) {
    try {
      await httpClient.authenticate(credentials.email, credentials.password);
      logger.info(`✅ Usuario ${role} autenticado`);
    } catch (error) {
      logger.warn(`⚠️ Error autenticando ${role}: ${error.message}`);
    }
  }
}

async function testCreateDocumentTemplate(results) {
  logger.info('📝 Testing: Create Document Template');
  const testName = 'Create Document Template';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    const templateData = {
      name: 'Autorización Uso Auditorio',
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
    };

    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);
    const response = await httpClient.post(`${STOCKPILE_BASE_URL}/document-templates`, templateData);

    if (!response.success) {
      throw new Error(`API returned success: false - ${response.message}`);
    }

    const template = response.data;
    if (!template.id || !template.name || template.type !== 'AUTHORIZATION_LETTER') {
      throw new Error('Invalid template structure');
    }

    testData.templates.push(template.id);
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/document-templates');
    
    logger.info(`✅ ${testName} exitoso (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testGenerateDocument(results) {
  logger.info('🏗️ Testing: Generate Document from Template');
  const testName = 'Generate Document from Template';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.templates.length === 0) {
      throw new Error('No templates available for document generation');
    }

    const templateId = testData.templates[0];
    await httpClient.authenticate(TEST_USERS.coordinator.email, TEST_USERS.coordinator.password);

    const generationData = {
      templateId: templateId,
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
        generatedBy: 'user_coordinator_001',
        purpose: 'APPROVAL_DOCUMENT',
        relatedEntity: 'reservation_001'
      }
    };

    const response = await httpClient.post(`${STOCKPILE_BASE_URL}/document-templates/${templateId}/generate`, generationData);

    if (!response.success) {
      throw new Error(`Document generation failed - ${response.message}`);
    }

    const document = response.data;
    if (!document.id || !document.downloadUrl || document.format !== 'PDF') {
      throw new Error('Invalid generated document structure');
    }

    testData.generatedDocuments.push(document.id);
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/document-templates/:id/generate');
    
    logger.info(`✅ ${testName} exitoso - Documento: ${document.id} (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testExportTemplateFormats(results) {
  logger.info('📄 Testing: Export Template in Multiple Formats');
  const testName = 'Export Template Multiple Formats';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.templates.length === 0) {
      throw new Error('No templates available for export');
    }

    const templateId = testData.templates[0];
    const formats = ['PDF', 'HTML', 'DOCX'];
    const exportResults = [];

    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);

    for (const format of formats) {
      const exportData = {
        format: format,
        includeMetadata: true,
        compression: format !== 'HTML'
      };

      const response = await httpClient.post(`${STOCKPILE_BASE_URL}/document-templates/${templateId}/export`, exportData);

      if (!response.success) {
        throw new Error(`Export to ${format} failed - ${response.message}`);
      }

      exportResults.push({
        format: format,
        downloadUrl: response.data.downloadUrl,
        fileSize: response.data.fileSize
      });
    }

    if (exportResults.length !== formats.length) {
      throw new Error('Not all formats were exported successfully');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/document-templates/:id/export');
    
    logger.info(`✅ ${testName} exitoso - ${exportResults.length} formatos exportados (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function testTemplateVersioning(results) {
  logger.info('🔄 Testing: Template Versioning');
  const testName = 'Template Versioning';
  results.totalTests++;

  try {
    const startTime = Date.now();
    
    if (testData.templates.length === 0) {
      throw new Error('No templates available for versioning');
    }

    const templateId = testData.templates[0];
    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);

    // Create new version
    const versionData = {
      content: `
        <h1>UNIVERSIDAD FRANCISCO DE PAULA SANTANDER - VERSIÓN 2.0</h1>
        <h2>AUTORIZACIÓN DE USO DE AUDITORIO</h2>
        <p>Documento actualizado con nuevo formato institucional</p>
        <p><strong>Nombre:</strong> {{requesterName}}</p>
        <!-- Updated template content -->
      `,
      changeLog: 'Actualización de formato institucional y mejora de diseño',
      version: '2.0'
    };

    const response = await httpClient.post(`${STOCKPILE_BASE_URL}/document-templates/${templateId}/versions`, versionData);

    if (!response.success) {
      throw new Error(`Version creation failed - ${response.message}`);
    }

    // List versions
    const versionsResponse = await httpClient.get(`${STOCKPILE_BASE_URL}/document-templates/${templateId}/versions`);

    if (!versionsResponse.success || !Array.isArray(versionsResponse.data)) {
      throw new Error('Failed to retrieve template versions');
    }

    if (versionsResponse.data.length < 2) {
      throw new Error('Version history not properly maintained');
    }
    
    const endTime = Date.now();
    results.performance[testName] = endTime - startTime;
    results.passed++;
    results.coverage.push('POST /stockpile/document-templates/:id/versions');
    results.coverage.push('GET /stockpile/document-templates/:id/versions');
    
    logger.info(`✅ ${testName} exitoso - ${versionsResponse.data.length} versiones (${endTime - startTime}ms)`);

  } catch (error) {
    results.failed++;
    results.errors.push({ test: testName, error: error.message });
    logger.error(`❌ ${testName} falló: ${error.message}`);
  }
}

async function cleanupTestData(results) {
  logger.info('🧹 Limpiando datos de prueba...');
  
  try {
    await httpClient.authenticate(TEST_USERS.admin.email, TEST_USERS.admin.password);
    
    // Cleanup generated documents
    for (const docId of testData.generatedDocuments) {
      try {
        await httpClient.delete(`${STOCKPILE_BASE_URL}/generated-documents/${docId}`);
        logger.info(`🗑️ Documento ${docId} eliminado`);
      } catch (error) {
        logger.warn(`⚠️ Error eliminando documento ${docId}: ${error.message}`);
      }
    }
    
    // Cleanup templates
    for (const templateId of testData.templates) {
      try {
        await httpClient.delete(`${STOCKPILE_BASE_URL}/document-templates/${templateId}`);
        logger.info(`🗑️ Plantilla ${templateId} eliminada`);
      } catch (error) {
        logger.warn(`⚠️ Error eliminando plantilla ${templateId}: ${error.message}`);
      }
    }

    logger.info('✅ Limpieza completada');
    
  } catch (error) {
    logger.error('❌ Error durante limpieza:', error.message);
    results.errors.push({ test: 'cleanup', error: error.message });
  }
}

async function generateTestReport(results) {
  const report = `# Hito 3 - Stockpile Core: Document Templates Test Report

## 📊 Resumen de Resultados
- **Tests Ejecutados**: ${results.totalTests}
- **Exitosos**: ${results.passed}
- **Fallidos**: ${results.failed}
- **Tasa de Éxito**: ${results.successRate}%
- **Tiempo Total**: ${results.executionTime}ms

## ⚡ Métricas de Rendimiento
${Object.entries(results.performance).map(([test, time]) => `- **${test}**: ${time}ms`).join('\n')}

## 🎯 Cobertura de Endpoints
${results.coverage.map(endpoint => `- ✅ ${endpoint}`).join('\n')}

## ❌ Errores Encontrados
${results.errors.length > 0 ? results.errors.map(error => `- **${error.test}**: ${error.error}`).join('\n') : '- ✅ No se encontraron errores'}

---
*Reporte generado: ${new Date().toISOString()}*
`;

  const fs = require('fs').promises;
  await fs.writeFile(`${__dirname}/results/document-templates-report.md`, report);
  logger.info('📄 Reporte generado: document-templates-report.md');
}

if (require.main === module) {
  testDocumentTemplates().catch(console.error);
}

module.exports = { testDocumentTemplates };
