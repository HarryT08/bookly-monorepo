#!/usr/bin/env node

/**
 * Test Reporter - Generador de reportes unificado para todos los hitos
 * 
 * Proporciona funcionalidades de reporte consistentes para el framework de testing
 * de Bookly API Gateway, incluyendo métricas, formato y exportación.
 */

const fs = require('fs');
const path = require('path');

// Colores para salida en consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

class TestReporter {
    constructor(testSuiteName, options = {}) {
        this.testSuiteName = testSuiteName;
        this.startTime = Date.now();
        this.options = {
            showDetails: options.showDetails || true,
            exportToFile: options.exportToFile || false,
            outputDir: options.outputDir || path.join(__dirname, '../results'),
            colorOutput: options.colorOutput !== false,
            includeMetrics: options.includeMetrics !== false,
            ...options
        };
        
        this.summary = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            warnings: 0,
            notImplemented: 0
        };

        this.details = [];
        this.metrics = {
            startTime: this.startTime,
            endTime: null,
            duration: null,
            averageResponseTime: null,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0
        };
    }

    /**
     * Agrega un resultado de test individual
     */
    addTestResult(testCase, status, message, details = {}) {
        const result = {
            testCase,
            status: status.toUpperCase(),
            message,
            timestamp: new Date().toISOString(),
            responseTime: details.responseTime || null,
            endpoint: details.endpoint || null,
            httpStatus: details.httpStatus || null,
            error: details.error || null,
            data: details.data || null
        };

        this.details.push(result);
        this.summary.total++;

        // Actualizar contadores
        switch (status.toUpperCase()) {
            case 'PASS':
            case 'SUCCESS':
                this.summary.passed++;
                this.metrics.successfulRequests++;
                break;
            case 'FAIL':
            case 'ERROR':
                this.summary.failed++;
                this.metrics.failedRequests++;
                break;
            case 'SKIP':
                this.summary.skipped++;
                break;
            case 'WARN':
            case 'WARNING':
                this.summary.warnings++;
                break;
            case 'NOT_IMPLEMENTED':
                this.summary.notImplemented++;
                break;
        }

        this.metrics.totalRequests++;
        
        // Calcular tiempo promedio de respuesta
        if (details.responseTime) {
            const responseTimes = this.details
                .filter(d => d.responseTime)
                .map(d => d.responseTime);
            
            this.metrics.averageResponseTime = 
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        }
    }

    /**
     * Genera el reporte completo
     */
    generateReport(testResults = null) {
        this.metrics.endTime = Date.now();
        this.metrics.duration = this.metrics.endTime - this.metrics.startTime;

        // Si se proporcionan resultados externos, procesarlos
        if (testResults && Array.isArray(testResults)) {
            testResults.forEach(result => {
                if (typeof result === 'object' && result.testCase) {
                    this.addTestResult(
                        result.testCase,
                        result.status || 'UNKNOWN',
                        result.message || 'No message provided',
                        result.details || {}
                    );
                }
            });
        }

        // Generar reporte en consola
        this._generateConsoleReport();

        // Exportar a archivo si está configurado
        if (this.options.exportToFile) {
            this._exportToFile();
        }

        return this._getReportData();
    }

    /**
     * Genera reporte en consola con colores
     */
    _generateConsoleReport() {
        const c = this.options.colorOutput ? colors : {};
        
        console.log('\n' + '='.repeat(80));
        console.log(`${c.bright}${c.cyan}📊 REPORTE DE TESTING: ${this.testSuiteName}${c.reset}`);
        console.log('='.repeat(80));

        // Resumen general
        console.log(`\n${c.bright}📈 RESUMEN GENERAL:${c.reset}`);
        console.log(`   Total de tests: ${c.bright}${this.summary.total}${c.reset}`);
        console.log(`   ${c.green}✅ Exitosos: ${this.summary.passed}${c.reset}`);
        console.log(`   ${c.red}❌ Fallidos: ${this.summary.failed}${c.reset}`);
        console.log(`   ${c.yellow}⚠️  Advertencias: ${this.summary.warnings}${c.reset}`);
        console.log(`   ${c.blue}⏸️  Omitidos: ${this.summary.skipped}${c.reset}`);
        console.log(`   ${c.magenta}🚫 No implementados: ${this.summary.notImplemented}${c.reset}`);

        // Métricas de rendimiento
        if (this.options.includeMetrics) {
            console.log(`\n${c.bright}⚡ MÉTRICAS DE RENDIMIENTO:${c.reset}`);
            console.log(`   Duración total: ${c.bright}${this.metrics.duration}ms${c.reset}`);
            console.log(`   Total de requests: ${c.bright}${this.metrics.totalRequests}${c.reset}`);
            console.log(`   Requests exitosos: ${c.bright}${this.metrics.successfulRequests}${c.reset}`);
            console.log(`   Requests fallidos: ${c.bright}${this.metrics.failedRequests}${c.reset}`);
            
            if (this.metrics.averageResponseTime) {
                console.log(`   Tiempo promedio de respuesta: ${c.bright}${Math.round(this.metrics.averageResponseTime)}ms${c.reset}`);
            }
        }

        // Tasa de éxito
        const successRate = this.summary.total > 0 
            ? ((this.summary.passed / this.summary.total) * 100).toFixed(1)
            : 0;
        
        const rateColor = successRate >= 90 ? c.green : successRate >= 70 ? c.yellow : c.red;
        console.log(`\n${c.bright}🎯 TASA DE ÉXITO: ${rateColor}${successRate}%${c.reset}`);

        // Detalles de tests (si está habilitado)
        if (this.options.showDetails && this.details.length > 0) {
            console.log(`\n${c.bright}📋 DETALLES DE TESTS:${c.reset}`);
            
            this.details.forEach((detail, index) => {
                const statusIcon = this._getStatusIcon(detail.status);
                const statusColor = this._getStatusColor(detail.status, c);
                
                console.log(`\n   ${index + 1}. ${statusIcon} ${detail.testCase}`);
                console.log(`      ${statusColor}Estado: ${detail.status}${c.reset}`);
                console.log(`      Mensaje: ${detail.message}`);
                
                if (detail.endpoint) {
                    console.log(`      Endpoint: ${detail.endpoint}`);
                }
                
                if (detail.responseTime) {
                    console.log(`      Tiempo de respuesta: ${detail.responseTime}ms`);
                }
                
                if (detail.httpStatus) {
                    console.log(`      HTTP Status: ${detail.httpStatus}`);
                }
                
                if (detail.error) {
                    console.log(`      ${c.red}Error: ${detail.error}${c.reset}`);
                }
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log(`${c.bright}${c.green}✨ Reporte generado: ${new Date().toLocaleString()}${c.reset}`);
        console.log('='.repeat(80) + '\n');
    }

    /**
     * Exporta el reporte a archivo markdown
     */
    _exportToFile() {
        try {
            // Crear directorio si no existe
            if (!fs.existsSync(this.options.outputDir)) {
                fs.mkdirSync(this.options.outputDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${this.testSuiteName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.md`;
            const filepath = path.join(this.options.outputDir, filename);

            const markdownReport = this._generateMarkdownReport();
            
            fs.writeFileSync(filepath, markdownReport, 'utf8');
            console.log(`📄 Reporte exportado a: ${filepath}`);
            
        } catch (error) {
            console.error(`❌ Error al exportar reporte: ${error.message}`);
        }
    }

    /**
     * Genera reporte en formato markdown
     */
    _generateMarkdownReport() {
        const successRate = this.summary.total > 0 
            ? ((this.summary.passed / this.summary.total) * 100).toFixed(1)
            : 0;

        let markdown = `# ${this.testSuiteName} - Reporte de Testing\n\n`;
        markdown += `**Generado:** ${new Date().toLocaleString()}\n`;
        markdown += `**Duración:** ${this.metrics.duration}ms\n\n`;

        markdown += `## 📊 Resumen\n\n`;
        markdown += `| Métrica | Valor |\n`;
        markdown += `|---------|-------|\n`;
        markdown += `| Total de tests | ${this.summary.total} |\n`;
        markdown += `| ✅ Exitosos | ${this.summary.passed} |\n`;
        markdown += `| ❌ Fallidos | ${this.summary.failed} |\n`;
        markdown += `| ⚠️ Advertencias | ${this.summary.warnings} |\n`;
        markdown += `| ⏸️ Omitidos | ${this.summary.skipped} |\n`;
        markdown += `| 🚫 No implementados | ${this.summary.notImplemented} |\n`;
        markdown += `| 🎯 **Tasa de éxito** | **${successRate}%** |\n\n`;

        if (this.options.includeMetrics) {
            markdown += `## ⚡ Métricas de Rendimiento\n\n`;
            markdown += `- **Total requests:** ${this.metrics.totalRequests}\n`;
            markdown += `- **Requests exitosos:** ${this.metrics.successfulRequests}\n`;
            markdown += `- **Requests fallidos:** ${this.metrics.failedRequests}\n`;
            
            if (this.metrics.averageResponseTime) {
                markdown += `- **Tiempo promedio de respuesta:** ${Math.round(this.metrics.averageResponseTime)}ms\n`;
            }
            markdown += `\n`;
        }

        if (this.details.length > 0) {
            markdown += `## 📋 Detalles de Tests\n\n`;
            
            this.details.forEach((detail, index) => {
                const statusIcon = this._getStatusIcon(detail.status);
                markdown += `### ${index + 1}. ${statusIcon} ${detail.testCase}\n\n`;
                markdown += `- **Estado:** ${detail.status}\n`;
                markdown += `- **Mensaje:** ${detail.message}\n`;
                
                if (detail.endpoint) {
                    markdown += `- **Endpoint:** \`${detail.endpoint}\`\n`;
                }
                
                if (detail.responseTime) {
                    markdown += `- **Tiempo de respuesta:** ${detail.responseTime}ms\n`;
                }
                
                if (detail.httpStatus) {
                    markdown += `- **HTTP Status:** ${detail.httpStatus}\n`;
                }
                
                if (detail.error) {
                    markdown += `- **Error:** \`${detail.error}\`\n`;
                }
                
                markdown += `\n`;
            });
        }

        markdown += `---\n*Generado automáticamente por Bookly API Gateway Test Reporter*\n`;
        
        return markdown;
    }

    /**
     * Obtiene el icono correspondiente al estado
     */
    _getStatusIcon(status) {
        const icons = {
            'PASS': '✅',
            'SUCCESS': '✅',
            'FAIL': '❌',
            'ERROR': '❌',
            'WARN': '⚠️',
            'WARNING': '⚠️',
            'SKIP': '⏸️',
            'NOT_IMPLEMENTED': '🚫',
            'UNKNOWN': '❓'
        };
        
        return icons[status.toUpperCase()] || '❓';
    }

    /**
     * Obtiene el color correspondiente al estado
     */
    _getStatusColor(status, colorObj) {
        const colorMap = {
            'PASS': colorObj.green,
            'SUCCESS': colorObj.green,
            'FAIL': colorObj.red,
            'ERROR': colorObj.red,
            'WARN': colorObj.yellow,
            'WARNING': colorObj.yellow,
            'SKIP': colorObj.blue,
            'NOT_IMPLEMENTED': colorObj.magenta,
            'UNKNOWN': colorObj.dim
        };
        
        return colorMap[status.toUpperCase()] || colorObj.dim || '';
    }

    /**
     * Obtiene los datos del reporte en formato objeto
     */
    _getReportData() {
        return {
            testSuiteName: this.testSuiteName,
            summary: { ...this.summary },
            metrics: { ...this.metrics },
            details: [...this.details],
            successRate: this.summary.total > 0 
                ? ((this.summary.passed / this.summary.total) * 100).toFixed(1)
                : 0,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Método estático para crear reporte rápido
     */
    static quickReport(testSuiteName, results) {
        const reporter = new TestReporter(testSuiteName);
        return reporter.generateReport(results);
    }

    /**
     * Método para logging rápido durante los tests
     */
    log(level, message, details = {}) {
        const c = this.options.colorOutput ? colors : {};
        const timestamp = new Date().toISOString();
        
        const levelColors = {
            'INFO': c.blue,
            'SUCCESS': c.green,
            'WARNING': c.yellow,
            'ERROR': c.red,
            'DEBUG': c.dim
        };
        
        const color = levelColors[level.toUpperCase()] || '';
        console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${c.reset}`);
        
        if (details && Object.keys(details).length > 0) {
            console.log(`${c.dim}   Details: ${JSON.stringify(details, null, 2)}${c.reset}`);
        }
    }
}

module.exports = {
    TestReporter,
    colors
};
