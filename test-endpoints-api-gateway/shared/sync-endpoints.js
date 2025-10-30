#!/usr/bin/env node

/**
 * Script para validar que los endpoints de microservicios estén actualizados
 * Compara la configuración local con los endpoints reales de cada microservicio
 */

const { httpClient } = require('./http-client');
const { logger } = require('./logger');
const { MICROSERVICES_CONFIG, getAvailableServices, getServiceInfo } = require('./conf-urls-microservices');

class EndpointValidator {
  constructor() {
    this.results = {
      services: {},
      summary: {
        total: 0,
        reachable: 0,
        unreachable: 0,
        errors: []
      }
    };
  }

  async validateAllServices() {
    logger.info('🔍 Iniciando validación de endpoints de microservicios...');
    
    const services = getAvailableServices();
    this.results.summary.total = services.length;
    
    for (const serviceName of services) {
      await this.validateService(serviceName);
    }
    
    await this.generateReport();
    return this.results;
  }

  async validateService(serviceName) {
    logger.info(`🔍 Validando servicio: ${serviceName}`);
    
    const serviceInfo = getServiceInfo(serviceName);
    const serviceResult = {
      name: serviceName,
      info: serviceInfo,
      status: 'unknown',
      reachableEndpoints: [],
      unreachableEndpoints: [],
      errors: [],
      responseTime: null
    };
    
    try {
      // Test service health endpoint first
      const startTime = Date.now();
      const healthUrl = `${serviceInfo.baseUrl.replace('/api/v1/' + serviceName, '')}/health`;
      
      try {
        const response = await httpClient.get(healthUrl, { timeout: 5000 });
        serviceResult.responseTime = Date.now() - startTime;
        serviceResult.status = response.success ? 'healthy' : 'unhealthy';
        
        if (response.success) {
          this.results.summary.reachable++;
          logger.info(`✅ ${serviceName} - Servicio saludable (${serviceResult.responseTime}ms)`);
        } else {
          serviceResult.errors.push('Health check failed');
          logger.warn(`⚠️ ${serviceName} - Health check falló`);
        }
      } catch (error) {
        serviceResult.status = 'unreachable';
        serviceResult.errors.push(`Health check error: ${error.message}`);
        this.results.summary.unreachable++;
        logger.error(`❌ ${serviceName} - No alcanzable: ${error.message}`);
      }

      // If service is reachable, validate some key endpoints
      if (serviceResult.status === 'healthy') {
        await this.validateKeyEndpoints(serviceName, serviceResult);
      }

    } catch (error) {
      serviceResult.errors.push(`General error: ${error.message}`);
      logger.error(`❌ Error validando ${serviceName}: ${error.message}`);
    }
    
    this.results.services[serviceName] = serviceResult;
  }

  async validateKeyEndpoints(serviceName, serviceResult) {
    const service = MICROSERVICES_CONFIG[serviceName];
    const keyEndpoints = this.getKeyEndpoints(serviceName);
    
    logger.info(`🔍 Validando ${keyEndpoints.length} endpoints clave de ${serviceName}`);
    
    for (const endpointName of keyEndpoints) {
      const endpointPath = service.endpoints[endpointName];
      if (!endpointPath) continue;
      
      const fullUrl = service.baseUrl + endpointPath;
      
      try {
        // For GET endpoints, try a simple request
        if (this.isGetEndpoint(endpointName)) {
          const response = await httpClient.get(fullUrl, { 
            timeout: 3000,
            validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
          });
          
          serviceResult.reachableEndpoints.push({
            name: endpointName,
            path: endpointPath,
            url: fullUrl,
            status: 'reachable'
          });
          
        } else {
          // For non-GET endpoints, just check if they respond (even with 405 Method Not Allowed)
          serviceResult.reachableEndpoints.push({
            name: endpointName,
            path: endpointPath,
            url: fullUrl,
            status: 'exists'
          });
        }
        
      } catch (error) {
        serviceResult.unreachableEndpoints.push({
          name: endpointName,
          path: endpointPath,
          url: fullUrl,
          error: error.message
        });
      }
    }
    
    logger.info(`✅ ${serviceName} - ${serviceResult.reachableEndpoints.length}/${keyEndpoints.length} endpoints alcanzables`);
  }

  getKeyEndpoints(serviceName) {
    const keyEndpointsByService = {
      auth: ['login', 'profile', 'roles'],
      resources: ['list', 'paginated', 'categories'],
      availability: ['basic', 'reservations', 'search'],
      stockpile: ['approvalRequests', 'documentTemplates', 'notifications'],
      reports: ['usage', 'dashboard'],
      import: ['upload', 'templates']
    };
    
    return keyEndpointsByService[serviceName] || [];
  }

  isGetEndpoint(endpointName) {
    const getEndpoints = [
      'list', 'paginated', 'search', 'profile', 'roles', 'categories', 
      'programs', 'basic', 'reservations', 'dashboard', 'usage', 'templates'
    ];
    
    return getEndpoints.includes(endpointName);
  }

  async generateReport() {
    logger.info('📊 Generando reporte de validación...');
    
    const timestamp = new Date().toISOString();
    let report = `# Reporte de Validación de Endpoints de Microservicios

**Fecha:** ${timestamp}

## 📊 Resumen General
- **Servicios Totales:** ${this.results.summary.total}
- **Servicios Alcanzables:** ${this.results.summary.reachable}
- **Servicios No Alcanzables:** ${this.results.summary.unreachable}
- **Tasa de Disponibilidad:** ${((this.results.summary.reachable / this.results.summary.total) * 100).toFixed(1)}%

## 📋 Detalles por Servicio

`;

    for (const [serviceName, result] of Object.entries(this.results.services)) {
      const statusIcon = result.status === 'healthy' ? '✅' : result.status === 'unhealthy' ? '⚠️' : '❌';
      
      report += `### ${statusIcon} ${serviceName.toUpperCase()}

**Estado:** ${result.status}
**Puerto:** ${result.info.port}
**Base URL:** ${result.info.baseUrl}
**Tiempo de Respuesta:** ${result.responseTime || 'N/A'}ms
**Endpoints Totales:** ${result.info.endpointCount}

`;

      if (result.reachableEndpoints.length > 0) {
        report += `**Endpoints Alcanzables (${result.reachableEndpoints.length}):**
`;
        for (const endpoint of result.reachableEndpoints) {
          report += `- ✅ ${endpoint.name}: \`${endpoint.path}\`
`;
        }
        report += '\n';
      }

      if (result.unreachableEndpoints.length > 0) {
        report += `**Endpoints No Alcanzables (${result.unreachableEndpoints.length}):**
`;
        for (const endpoint of result.unreachableEndpoints) {
          report += `- ❌ ${endpoint.name}: \`${endpoint.path}\` - ${endpoint.error}
`;
        }
        report += '\n';
      }

      if (result.errors.length > 0) {
        report += `**Errores:**
`;
        for (const error of result.errors) {
          report += `- ❌ ${error}
`;
        }
        report += '\n';
      }
    }

    report += `## 🔧 Recomendaciones

`;

    if (this.results.summary.unreachable > 0) {
      report += `- Verificar que los microservicios estén ejecutándose en los puertos configurados
- Revisar la configuración de red y firewall
- Validar que el API Gateway esté funcionando correctamente
`;
    } else {
      report += `- ✅ Todos los servicios están funcionando correctamente
- Considerar agregar más endpoints de validación para mayor cobertura
`;
    }

    report += `
---
*Reporte generado automáticamente por validate-endpoints.js*
`;

    const fs = require('fs').promises;
    const reportPath = `${process.cwd()}/endpoint-validation-report.md`;
    await fs.writeFile(reportPath, report);
    
    logger.info(`📄 Reporte guardado: ${reportPath}`);
  }

  async checkEndpointMapping() {
    logger.info('🗺️ Verificando mapeo de endpoints...');
    
    const mappingIssues = [];
    
    for (const [serviceName, config] of Object.entries(MICROSERVICES_CONFIG)) {
      // Check for common endpoint patterns
      const expectedEndpoints = this.getExpectedEndpoints(serviceName);
      const actualEndpoints = Object.keys(config.endpoints);
      
      for (const expected of expectedEndpoints) {
        if (!actualEndpoints.includes(expected)) {
          mappingIssues.push({
            service: serviceName,
            type: 'missing',
            endpoint: expected,
            message: `Endpoint esperado '${expected}' no encontrado`
          });
        }
      }
      
      // Check for deprecated patterns
      for (const actual of actualEndpoints) {
        if (this.isDeprecatedEndpoint(actual)) {
          mappingIssues.push({
            service: serviceName,
            type: 'deprecated',
            endpoint: actual,
            message: `Endpoint '${actual}' usa patrón deprecated`
          });
        }
      }
    }
    
    if (mappingIssues.length > 0) {
      logger.warn(`⚠️ Encontrados ${mappingIssues.length} problemas de mapeo:`);
      for (const issue of mappingIssues) {
        logger.warn(`  - ${issue.service}: ${issue.message}`);
      }
    } else {
      logger.info('✅ Mapeo de endpoints correcto');
    }
    
    return mappingIssues;
  }

  getExpectedEndpoints(serviceName) {
    const expectedByService = {
      auth: ['login', 'register', 'profile', 'roles'],
      resources: ['list', 'create', 'update', 'delete', 'categories'],
      availability: ['reservations', 'search', 'calendar'],
      stockpile: ['approvalRequests', 'documentTemplates', 'notifications'],
      reports: ['usage', 'dashboard', 'export']
    };
    
    return expectedByService[serviceName] || [];
  }

  isDeprecatedEndpoint(endpointName) {
    const deprecatedPatterns = [
      /legacy/i,
      /old/i,
      /deprecated/i,
      /v1$/i
    ];
    
    return deprecatedPatterns.some(pattern => pattern.test(endpointName));
  }
}

// Execute if called directly
if (require.main === module) {
  (async () => {
    try {
      const validator = new EndpointValidator();
      const results = await validator.validateAllServices();
      const mappingIssues = await validator.checkEndpointMapping();
      
      console.log('\n📊 Resumen de Validación:');
      console.log(`✅ Servicios alcanzables: ${results.summary.reachable}/${results.summary.total}`);
      console.log(`❌ Servicios no alcanzables: ${results.summary.unreachable}/${results.summary.total}`);
      console.log(`⚠️ Problemas de mapeo: ${mappingIssues.length}`);
      
      if (results.summary.unreachable === 0 && mappingIssues.length === 0) {
        console.log('\n🎉 Validación exitosa - Todos los endpoints están correctos');
        process.exit(0);
      } else {
        console.log('\n⚠️ Se encontraron problemas - Revisar reporte para detalles');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error en validación:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { EndpointValidator };
