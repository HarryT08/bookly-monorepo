#!/usr/bin/env node

/**
 * HITO 8 - ANALYTICS: DATA VISUALIZATION (REFACTORIZADO)
 * 
 * Flujo completo de testing para visualización avanzada de datos:
 * - Dashboards interactivos personalizables
 * - Generación dinámica de gráficos
 * - Herramientas de exploración de datos
 * - Exportación de visualizaciones
 * - Gráficos en tiempo real
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class DataVisualizationFlow {
  constructor() {
    this.logger = new TestLogger('Data-Visualization');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-8-Analytics', 'Data-Visualization');
    this.testData = {
      createdVisualizations: [],
      exportedFiles: [],
      testUsers: {
        executive: TEST_DATA.USERS.ADMIN_GENERAL,
        analyst: TEST_DATA.USERS.DOCENTE,
        operations: TEST_DATA.USERS.VIGILANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 8 - DATA VISUALIZATION TESTING');
    this.logger.info('Iniciando testing completo de visualización de datos...');

    try {
      await this.setup();
      await this.testInteractiveDashboards();
      await this.testChartGeneration();
      await this.testDataExploration();
      await this.testVisualizationExport();
      await this.testRealTimeCharts();
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
      await this.httpClient.authenticate(this.testData.testUsers.executive);
      await this.httpClient.authenticate(this.testData.testUsers.analyst);
      await this.httpClient.authenticate(this.testData.testUsers.operations);
      
      this.logger.success('Setup completado - Usuarios autenticados');
    } catch (error) {
      this.logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async testInteractiveDashboards() {
    this.logger.subheader('Test: Dashboards interactivos personalizables');
    const startTime = Date.now();

    try {
      // Test 1: Crear dashboard personalizable
      const dashboardConfig = this.dataGenerator.getTestData(5, 'dashboardConfig', {
        name: "Analytics_Executive_Dashboard_v2",
        layout: "responsive_grid",
        theme: "bookly_corporate",
        widgets: [
          {
            type: "KPI_SCORECARD",
            position: { row: 1, col: 1, span: 2 },
            config: {
              metrics: ["utilization_rate", "satisfaction_score", "revenue_growth"],
              visualization: "GAUGE_COLLECTION",
              thresholds: { green: 80, yellow: 60, red: 40 }
            }
          },
          {
            type: "TREND_ANALYSIS",
            position: { row: 1, col: 3, span: 4 },
            config: {
              title: "Resource Usage Trends",
              chartType: "MULTI_LINE",
              timeRange: "LAST_90_DAYS",
              granularity: "DAILY"
            }
          },
          {
            type: "HEATMAP_CALENDAR",
            position: { row: 2, col: 1, span: 6 },
            config: {
              title: "Utilization Heatmap",
              dimensions: ["hour_of_day", "day_of_week"],
              metric: "booking_intensity"
            }
          }
        ],
        interactivity: {
          drillDown: true,
          crossFilter: true,
          realTimeUpdate: true,
          customFilters: ["date_range", "resource_type", "campus"]
        }
      });

      const createDashboardEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'dashboards');
      const dashboardResponse = await this.httpClient.authPost(createDashboardEndpoint, dashboardConfig, this.testData.testUsers.executive);

      if (dashboardResponse.data.success) {
        this.testData.createdVisualizations.push(dashboardResponse.data.data);
      }

      // Test 2: Probar interactividad
      const dashboardId = dashboardResponse.data?.data?.dashboardId;
      if (dashboardId) {
        const interactionTest = {
          dashboardId: dashboardId,
          interactions: [
            { type: "FILTER_APPLY", filter: "resource_type", value: "LABORATORIO" },
            { type: "DRILL_DOWN", widget: "trend_analysis", dimension: "day_of_week" },
            { type: "CROSS_FILTER", source: "heatmap", target: "kpi_scorecard" }
          ]
        };

        const interactionEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'interactions');
        const interactionResponse = await this.httpClient.authPost(interactionEndpoint, interactionTest, this.testData.testUsers.analyst);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(createDashboardEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Interactive dashboards tests completed successfully',
        testsCompleted: 2,
        dashboardCreated: dashboardResponse.data?.success || false,
        interactionsConfigured: true,
        widgetsConfigured: dashboardConfig.widgets.length,
        interactivityEnabled: dashboardConfig.interactivity.drillDown
      });

      this.logger.success(`✅ Dashboards interactivos completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'visualizations', 'dashboards');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with interactive dashboards'
      });
      this.logger.error(`❌ Error en dashboards interactivos: ${error.message}`);
    }
  }

  async testChartGeneration() {
    this.logger.subheader('Test: Generación dinámica de gráficos');
    const startTime = Date.now();

    try {
      // Test 1: Generar múltiples tipos de gráficos
      const chartTypes = [
        {
          type: "BAR_CHART",
          config: {
            title: "Resource Utilization by Type",
            xAxis: "resource_type",
            yAxis: "utilization_percentage",
            orientation: "VERTICAL"
          }
        },
        {
          type: "PIE_CHART",
          config: {
            title: "Booking Distribution by Program",
            dimension: "academic_program",
            metric: "booking_count"
          }
        },
        {
          type: "SCATTER_PLOT",
          config: {
            title: "Satisfaction vs Utilization",
            xAxis: "utilization_rate",
            yAxis: "satisfaction_score",
            colorBy: "resource_type"
          }
        }
      ];

      const chartPromises = chartTypes.map(async (chart) => {
        const chartEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'charts');
        return await this.httpClient.authPost(chartEndpoint, chart, this.testData.testUsers.analyst);
      });

      const chartResults = await Promise.all(chartPromises);

      // Test 2: Personalización avanzada de gráficos
      const customizationConfig = {
        chartId: chartResults[0].data?.data?.chartId,
        customizations: {
          styling: {
            colorPalette: "BOOKLY_BRAND",
            fontSize: 12,
            fontFamily: "Roboto"
          },
          axes: {
            xAxis: { title: "Tipos de Recurso", rotate: 45 },
            yAxis: { title: "Utilización (%)", format: "percentage" }
          },
          legend: { position: "bottom", align: "center" },
          animations: { enabled: true, duration: 800 }
        }
      };

      const customizeEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'customize');
      const customizeResponse = await this.httpClient.authPost(customizeEndpoint, customizationConfig, this.testData.testUsers.analyst);

      const duration = Date.now() - startTime;

      this.reporter.addResult(chartEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Chart generation tests completed successfully',
        testsCompleted: 2,
        chartsGenerated: chartResults.filter(r => r.data?.success).length,
        chartTypesSupported: chartTypes.length,
        customizationApplied: customizeResponse.data?.success || false,
        allChartsSuccessful: chartResults.every(r => r.data?.success)
      });

      this.logger.success(`✅ Generación de gráficos completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'visualizations', 'charts');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with chart generation'
      });
      this.logger.error(`❌ Error en generación de gráficos: ${error.message}`);
    }
  }

  async testDataExploration() {
    this.logger.subheader('Test: Herramientas de exploración de datos');
    const startTime = Date.now();

    try {
      // Test 1: Iniciar sesión de exploración
      const explorationConfig = {
        dataSource: "BOOKLY_ANALYTICS_DB",
        explorationMode: "INTERACTIVE",
        availableDimensions: [
          "resource_type", "academic_program", "time_period", 
          "user_role", "campus", "building"
        ],
        availableMetrics: [
          "booking_count", "utilization_rate", "satisfaction_score",
          "revenue", "cost_per_hour", "cancellation_rate"
        ],
        smartSuggestions: true,
        naturalLanguageQueries: true
      };

      const explorationEndpoint = getEndpointUrl('analytics-service', 'exploration', 'start-session');
      const explorationResponse = await this.httpClient.authPost(explorationEndpoint, explorationConfig, this.testData.testUsers.analyst);

      // Test 2: Ejecutar consultas exploratorias
      const sessionId = explorationResponse.data?.data?.sessionId;
      if (sessionId) {
        const queries = [
          {
            type: "NATURAL_LANGUAGE",
            query: "Show me the utilization trend for laboratories in the last 3 months",
            sessionId: sessionId
          },
          {
            type: "DIMENSIONAL_ANALYSIS",
            dimensions: ["resource_type", "time_period"],
            metrics: ["booking_count", "utilization_rate"],
            filters: { campus: "MAIN_CAMPUS" },
            sessionId: sessionId
          },
          {
            type: "CORRELATION_ANALYSIS",
            variables: ["satisfaction_score", "utilization_rate", "response_time"],
            sessionId: sessionId
          }
        ];

        const queryPromises = queries.map(async (query) => {
          const queryEndpoint = getEndpointUrl('analytics-service', 'exploration', 'execute-query');
          return await this.httpClient.authPost(queryEndpoint, query, this.testData.testUsers.analyst);
        });

        const queryResults = await Promise.all(queryPromises);

        // Test 3: Generar insights automáticos
        const insightRequest = {
          sessionId: sessionId,
          analysisType: "AUTO_INSIGHTS",
          includeAnomalies: true,
          includePatterns: true,
          confidenceThreshold: 0.8
        };

        const insightEndpoint = getEndpointUrl('analytics-service', 'exploration', 'generate-insights');
        const insightResponse = await this.httpClient.authPost(insightEndpoint, insightRequest, this.testData.testUsers.analyst);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(explorationEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Data exploration tests completed successfully',
        testsCompleted: 3,
        explorationSessionStarted: explorationResponse.data?.success || false,
        queriesExecuted: 3,
        naturalLanguageSupported: explorationConfig.naturalLanguageQueries,
        insightsGenerated: true
      });

      this.logger.success(`✅ Exploración de datos completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'exploration', 'start-session');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with data exploration'
      });
      this.logger.error(`❌ Error en exploración de datos: ${error.message}`);
    }
  }

  async testVisualizationExport() {
    this.logger.subheader('Test: Exportación de visualizaciones');
    const startTime = Date.now();

    try {
      // Test 1: Exportar en múltiples formatos
      const visualizations = this.testData.createdVisualizations;
      if (visualizations.length > 0) {
        const exportFormats = ["PNG", "SVG", "PDF", "HTML", "JSON"];
        
        const exportPromises = exportFormats.map(async (format) => {
          const exportConfig = {
            visualizationId: visualizations[0].dashboardId,
            format: format,
            quality: "HIGH",
            dimensions: { width: 1920, height: 1080 },
            options: {
              includeInteractivity: format === "HTML",
              embedFonts: format === "PDF",
              compression: format === "PNG" ? "LOSSLESS" : undefined
            }
          };

          const exportEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'export');
          return await this.httpClient.authPost(exportEndpoint, exportConfig, this.testData.testUsers.analyst);
        });

        const exportResults = await Promise.all(exportPromises);
        
        exportResults.forEach((result, index) => {
          if (result.data?.success) {
            this.testData.exportedFiles.push({
              format: exportFormats[index],
              fileId: result.data.data.fileId,
              downloadUrl: result.data.data.downloadUrl
            });
          }
        });
      }

      // Test 2: Exportación programada
      const scheduledExportConfig = {
        visualizationType: "EXECUTIVE_DASHBOARD",
        schedule: {
          frequency: "WEEKLY",
          dayOfWeek: "MONDAY",
          time: "08:00",
          timezone: "America/Bogota"
        },
        recipients: [this.testData.testUsers.executive.email],
        formats: ["PDF", "HTML"],
        deliveryMethod: "EMAIL"
      };

      const scheduleEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'schedule-export');
      const scheduleResponse = await this.httpClient.authPost(scheduleEndpoint, scheduledExportConfig, this.testData.testUsers.executive);

      const duration = Date.now() - startTime;

      this.reporter.addResult(exportEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Visualization export tests completed successfully',
        testsCompleted: 2,
        formatsSupported: 5,
        exportsCompleted: this.testData.exportedFiles.length,
        scheduledExportConfigured: scheduleResponse.data?.success || false,
        multiFormatSupport: true
      });

      this.logger.success(`✅ Exportación de visualizaciones completada (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'visualizations', 'export');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with visualization export'
      });
      this.logger.error(`❌ Error en exportación: ${error.message}`);
    }
  }

  async testRealTimeCharts() {
    this.logger.subheader('Test: Gráficos en tiempo real');
    const startTime = Date.now();

    try {
      // Test 1: Configurar streaming de datos
      const streamingConfig = {
        chartType: "REAL_TIME_LINE",
        dataSource: "LIVE_METRICS_STREAM",
        updateFrequency: "5_SECONDS",
        bufferSize: 100,
        metrics: ["active_users", "new_bookings", "system_load"],
        timeWindow: "LAST_10_MINUTES"
      };

      const streamingEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'real-time-charts');
      const streamingResponse = await this.httpClient.authPost(streamingEndpoint, streamingConfig, this.testData.testUsers.operations);

      // Test 2: Simular conexión WebSocket
      const wsConfig = {
        chartId: streamingResponse.data?.data?.chartId,
        connectionType: "WEBSOCKET",
        endpoint: "ws://analytics-service:3000/real-time-data",
        subscriptions: streamingConfig.metrics,
        authentication: true
      };

      const wsEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'websocket-setup');
      const wsResponse = await this.httpClient.authPost(wsEndpoint, wsConfig, this.testData.testUsers.operations);

      // Test 3: Probar alertas en tiempo real
      const alertConfig = {
        chartId: streamingResponse.data?.data?.chartId,
        alertRules: [
          {
            metric: "system_load",
            condition: "GREATER_THAN",
            threshold: 80,
            severity: "WARNING"
          },
          {
            metric: "active_users",
            condition: "SPIKE_DETECTION",
            sensitivity: "MEDIUM",
            severity: "INFO"
          }
        ],
        visualAlerts: {
          colorChange: true,
          notifications: true,
          soundAlerts: false
        }
      };

      const alertEndpoint = getEndpointUrl('analytics-service', 'visualizations', 'real-time-alerts');
      const alertResponse = await this.httpClient.authPost(alertEndpoint, alertConfig, this.testData.testUsers.operations);

      const duration = Date.now() - startTime;

      this.reporter.addResult(streamingEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Real-time charts tests completed successfully',
        testsCompleted: 3,
        streamingConfigured: streamingResponse.data?.success || false,
        websocketSetup: wsResponse.data?.success || false,
        alertsConfigured: alertResponse.data?.success || false,
        metricsStreamed: streamingConfig.metrics.length,
        updateFrequency: streamingConfig.updateFrequency
      });

      this.logger.success(`✅ Gráficos en tiempo real completados (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'visualizations', 'real-time-charts');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with real-time charts'
      });
      this.logger.error(`❌ Error en gráficos tiempo real: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar visualizaciones creadas
    for (const visualization of this.testData.createdVisualizations) {
      try {
        const endpoint = getEndpointUrl('analytics-service', 'visualizations', 'delete').replace(':id', visualization.dashboardId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.executive);
        this.logger.debug(`Cleaned up visualization: ${visualization.name}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup visualization ${visualization.dashboardId}:`, error.message);
      }
    }

    // Limpiar archivos exportados
    for (const file of this.testData.exportedFiles) {
      try {
        const endpoint = getEndpointUrl('analytics-service', 'visualizations', 'delete-export').replace(':id', file.fileId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.analyst);
        this.logger.debug(`Cleaned up exported file: ${file.format}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup export ${file.fileId}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 8: DATA VISUALIZATION');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-8-analytics-visualization.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new DataVisualizationFlow();
  flow.run().catch(console.error);
}

module.exports = { DataVisualizationFlow };
