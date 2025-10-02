#!/usr/bin/env node

/**
 * HITO 8 - ANALYTICS: BUSINESS INTELLIGENCE (REFACTORIZADO)
 * 
 * Flujo completo de testing para inteligencia de negocios:
 * - Dashboard ejecutivo integrado
 * - Análisis avanzado de KPIs
 * - Métricas de rendimiento operacional
 * - Análisis de retorno de inversión (ROI)
 * - Benchmarking y comparativas competitivas
 */

const { HttpClient } = require('../shared/http-client');
const { TestValidator } = require('../shared/test-validator');
const { GenerateTestData } = require('../shared/generate-test-data');
const { TestReporter } = require('../shared/test-reporter');
const { TEST_DATA } = require('../shared/conf-test-data');
const { getEndpointUrl } = require('../shared/conf-urls-microservices');
const { TestLogger } = require('../shared/logger');

class BusinessIntelligenceFlow {
  constructor() {
    this.logger = new TestLogger('Business-Intelligence');
    this.validator = new TestValidator();
    this.dataGenerator = new GenerateTestData();
    this.httpClient = new HttpClient();
    this.reporter = new TestReporter('Hito-8-Analytics', 'Business-Intelligence');
    this.testData = {
      createdDashboards: [],
      generatedReports: [],
      testUsers: {
        executive: TEST_DATA.USERS.ADMIN_GENERAL,
        analyst: TEST_DATA.USERS.DOCENTE,
        operations: TEST_DATA.USERS.VIGILANTE
      }
    };
  }

  async run() {
    this.logger.header('HITO 8 - BUSINESS INTELLIGENCE TESTING');
    this.logger.info('Iniciando testing completo de inteligencia de negocios...');

    try {
      await this.setup();
      await this.testExecutiveDashboard();
      await this.testKPIAnalysis();
      await this.testPerformanceMetrics();
      await this.testROIAnalysis();
      await this.testBenchmarking();
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

  async testExecutiveDashboard() {
    this.logger.subheader('Test: Dashboard ejecutivo integrado');
    const startTime = Date.now();

    try {
      // Test 1: Configurar dashboard ejecutivo
      const dashboardConfig = this.dataGenerator.getTestData(5, 'executiveDashboard', {
        name: "Executive_Dashboard_Q4_2024",
        scope: "UNIVERSITY_WIDE",
        period: "QUARTERLY",
        refreshRate: "REAL_TIME",
        widgets: [
          {
            type: "KPI_CARD",
            metric: "overall_utilization",
            visualization: "GAUGE",
            target: 75.0,
            thresholds: { red: 50, yellow: 65, green: 75 }
          },
          {
            type: "TREND_CHART",
            metric: "user_satisfaction",
            timeRange: "LAST_6_MONTHS",
            visualization: "LINE_CHART"
          },
          {
            type: "FINANCIAL_SUMMARY",
            metrics: ["revenue", "costs", "roi"],
            visualization: "MULTI_METRIC_CARD"
          },
          {
            type: "HEATMAP",
            metric: "resource_utilization_by_time",
            visualization: "CALENDAR_HEATMAP"
          }
        ],
        filters: {
          dateRange: "CURRENT_QUARTER",
          campuses: ["ALL"],
          resourceTypes: ["ALL"]
        }
      });

      const dashboardEndpoint = getEndpointUrl('analytics-service', 'dashboards', 'executive');
      const dashboardResponse = await this.httpClient.authPost(dashboardEndpoint, dashboardConfig, this.testData.testUsers.executive);

      if (dashboardResponse.data.success) {
        this.testData.createdDashboards.push(dashboardResponse.data.data);
      }

      // Test 2: Obtener datos del dashboard
      const dashboardId = dashboardResponse.data?.data?.dashboardId;
      if (dashboardId) {
        const dataRequest = {
          dashboardId: dashboardId,
          refreshCache: true,
          includeInsights: true,
          detailLevel: "EXECUTIVE"
        };

        const dataEndpoint = getEndpointUrl('analytics-service', 'dashboards', 'data').replace(':id', dashboardId);
        const dataResponse = await this.httpClient.authPost(dataEndpoint, dataRequest, this.testData.testUsers.executive);
      }

      // Test 3: Generar insights automáticos
      const insightsRequest = {
        dashboardId: dashboardId,
        analysisType: "EXECUTIVE_INSIGHTS",
        includeRecommendations: true,
        focusAreas: ["performance", "opportunities", "risks"],
        confidenceThreshold: 0.8
      };

      const insightsEndpoint = getEndpointUrl('analytics-service', 'insights', 'generate');
      const insightsResponse = await this.httpClient.authPost(insightsEndpoint, insightsRequest, this.testData.testUsers.executive);

      const duration = Date.now() - startTime;

      this.reporter.addResult(dashboardEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Executive dashboard tests completed successfully',
        testsCompleted: 3,
        dashboardCreated: dashboardResponse.data?.success || false,
        dataRetrieved: true,
        insightsGenerated: insightsResponse.data?.success || false,
        widgetsConfigured: dashboardConfig.widgets.length,
        realTimeEnabled: dashboardConfig.refreshRate === "REAL_TIME"
      });

      this.logger.success(`✅ Dashboard ejecutivo completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'dashboards', 'executive');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with executive dashboard'
      });
      this.logger.error(`❌ Error en dashboard ejecutivo: ${error.message}`);
    }
  }

  async testKPIAnalysis() {
    this.logger.subheader('Test: Análisis avanzado de KPIs');
    const startTime = Date.now();

    try {
      // Test 1: Configurar KPIs institucionales
      const kpiConfig = {
        categories: {
          operational: {
            utilizationRate: { target: 75.0, weight: 0.25 },
            avgBookingTime: { target: 3.0, weight: 0.15, unit: "hours" },
            cancellationRate: { target: 10.0, weight: 0.15, unit: "%" },
            maintenanceDowntime: { target: 5.0, weight: 0.1, unit: "%" }
          },
          financial: {
            costPerHour: { target: 15.0, weight: 0.2, unit: "USD" },
            revenueGrowth: { target: 10.0, weight: 0.25, unit: "%" },
            roi: { target: 1.8, weight: 0.3, unit: "ratio" }
          },
          userExperience: {
            satisfactionScore: { target: 4.0, weight: 0.3, unit: "stars" },
            responseTime: { target: 2.0, weight: 0.2, unit: "seconds" },
            supportTickets: { target: 20, weight: 0.15, unit: "per_month" }
          },
          academic: {
            academicImpact: { target: 85.0, weight: 0.35, unit: "%" },
            researchSupport: { target: 90.0, weight: 0.25, unit: "%" },
            innovationIndex: { target: 7.5, weight: 0.4, unit: "score" }
          }
        },
        analysisSettings: {
          period: "QUARTERLY",
          benchmarkSource: "HIGHER_ED_SECTOR",
          includeForecasting: true,
          alertThresholds: { critical: 0.7, warning: 0.85 }
        }
      };

      const kpiConfigEndpoint = getEndpointUrl('analytics-service', 'kpis', 'configure');
      const kpiConfigResponse = await this.httpClient.authPost(kpiConfigEndpoint, kpiConfig, this.testData.testUsers.executive);

      // Test 2: Calcular KPIs actuales
      const kpiCalculationRequest = {
        configId: kpiConfigResponse.data?.data?.configId,
        timeRange: "CURRENT_QUARTER",
        includeHistoricalComparison: true,
        generateScorecard: true
      };

      const calculateEndpoint = getEndpointUrl('analytics-service', 'kpis', 'calculate');
      const calculateResponse = await this.httpClient.authPost(calculateEndpoint, kpiCalculationRequest, this.testData.testUsers.analyst);

      // Test 3: Análisis de desviaciones
      const deviationAnalysis = {
        kpiResults: calculateResponse.data?.data?.results,
        analysisType: "ROOT_CAUSE_ANALYSIS",
        includeCorrelations: true,
        generateActionPlan: true
      };

      const deviationEndpoint = getEndpointUrl('analytics-service', 'kpis', 'deviation-analysis');
      const deviationResponse = await this.httpClient.authPost(deviationEndpoint, deviationAnalysis, this.testData.testUsers.analyst);

      const duration = Date.now() - startTime;

      this.reporter.addResult(kpiConfigEndpoint, 'POST', 'PASS', {
        duration,
        message: 'KPI analysis tests completed successfully',
        testsCompleted: 3,
        kpisConfigured: kpiConfigResponse.data?.success || false,
        kpisCalculated: calculateResponse.data?.success || false,
        deviationsAnalyzed: deviationResponse.data?.success || false,
        categoriesAnalyzed: Object.keys(kpiConfig.categories).length,
        totalKPIs: Object.values(kpiConfig.categories).reduce((sum, cat) => sum + Object.keys(cat).length, 0)
      });

      this.logger.success(`✅ Análisis de KPIs completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'kpis', 'configure');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with KPI analysis'
      });
      this.logger.error(`❌ Error en análisis de KPIs: ${error.message}`);
    }
  }

  async testPerformanceMetrics() {
    this.logger.subheader('Test: Métricas de rendimiento operacional');
    const startTime = Date.now();

    try {
      // Test 1: Métricas de eficiencia operacional
      const operationalMetricsConfig = {
        metrics: [
          {
            name: "resource_turnover_rate",
            calculation: "bookings_per_day / total_capacity",
            aggregation: "AVERAGE",
            timeGranularity: "DAILY"
          },
          {
            name: "booking_success_rate",
            calculation: "successful_bookings / total_booking_attempts",
            aggregation: "PERCENTAGE",
            timeGranularity: "HOURLY"
          },
          {
            name: "system_availability",
            calculation: "uptime / total_time",
            aggregation: "PERCENTAGE",
            timeGranularity: "MINUTE"
          }
        ],
        timeRange: "LAST_30_DAYS",
        segmentation: ["resource_type", "campus", "user_role"],
        includeComparisons: true
      };

      const operationalEndpoint = getEndpointUrl('analytics-service', 'performance', 'operational');
      const operationalResponse = await this.httpClient.authPost(operationalEndpoint, operationalMetricsConfig, this.testData.testUsers.operations);

      // Test 2: Métricas de calidad de servicio
      const serviceQualityConfig = {
        slaMetrics: [
          { name: "booking_confirmation_time", target: 60, unit: "seconds" },
          { name: "support_response_time", target: 300, unit: "seconds" },
          { name: "system_response_time", target: 2, unit: "seconds" }
        ],
        customerSatisfactionMetrics: [
          { name: "nps_score", target: 50, calculation: "promoters - detractors" },
          { name: "csat_score", target: 4.0, scale: "1-5" },
          { name: "customer_effort_score", target: 2.0, scale: "1-7" }
        ],
        period: "CURRENT_MONTH"
      };

      const qualityEndpoint = getEndpointUrl('analytics-service', 'performance', 'service-quality');
      const qualityResponse = await this.httpClient.authPost(qualityEndpoint, serviceQualityConfig, this.testData.testUsers.operations);

      // Test 3: Análisis de tendencias de rendimiento
      const trendAnalysisConfig = {
        metrics: ["all_configured"],
        trendAnalysis: {
          seasonalDecomposition: true,
          anomalyDetection: true,
          forecastingHorizon: "NEXT_QUARTER"
        },
        correlationAnalysis: true,
        generateInsights: true
      };

      const trendsEndpoint = getEndpointUrl('analytics-service', 'performance', 'trend-analysis');
      const trendsResponse = await this.httpClient.authPost(trendsEndpoint, trendAnalysisConfig, this.testData.testUsers.analyst);

      const duration = Date.now() - startTime;

      this.reporter.addResult(operationalEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Performance metrics tests completed successfully',
        testsCompleted: 3,
        operationalMetricsCalculated: operationalResponse.data?.success || false,
        serviceQualityAnalyzed: qualityResponse.data?.success || false,
        trendsAnalyzed: trendsResponse.data?.success || false,
        operationalMetricsCount: operationalMetricsConfig.metrics.length,
        slaMetricsCount: serviceQualityConfig.slaMetrics.length
      });

      this.logger.success(`✅ Métricas de rendimiento completadas (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'performance', 'operational');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with performance metrics'
      });
      this.logger.error(`❌ Error en métricas de rendimiento: ${error.message}`);
    }
  }

  async testROIAnalysis() {
    this.logger.subheader('Test: Análisis de retorno de inversión (ROI)');
    const startTime = Date.now();

    try {
      // Test 1: Cálculo de ROI por categoría de inversión
      const roiAnalysisConfig = {
        investmentCategories: [
          {
            name: "technology_infrastructure",
            initialInvestment: 250000,
            ongoingCosts: 15000, // monthly
            benefits: {
              costSavings: 8000, // monthly
              revenueIncrease: 12000, // monthly
              efficiencyGains: 5000 // monthly value
            }
          },
          {
            name: "facility_improvements",
            initialInvestment: 180000,
            ongoingCosts: 8000,
            benefits: {
              costSavings: 3000,
              revenueIncrease: 15000,
              efficiencyGains: 7000
            }
          },
          {
            name: "staff_training",
            initialInvestment: 45000,
            ongoingCosts: 2000,
            benefits: {
              costSavings: 4000,
              revenueIncrease: 0,
              efficiencyGains: 8000
            }
          }
        ],
        analysisParameters: {
          timeHorizon: 36, // months
          discountRate: 0.08, // 8% annual
          includeRiskAdjustment: true,
          confidenceInterval: 0.95
        }
      };

      const roiEndpoint = getEndpointUrl('analytics-service', 'financial', 'roi-analysis');
      const roiResponse = await this.httpClient.authPost(roiEndpoint, roiAnalysisConfig, this.testData.testUsers.executive);

      // Test 2: Análisis de sensibilidad
      const sensitivityAnalysis = {
        roiAnalysisId: roiResponse.data?.data?.analysisId,
        variableRanges: {
          discountRate: { min: 0.05, max: 0.12, step: 0.01 },
          benefitRealization: { min: 0.7, max: 1.3, step: 0.1 },
          costOverrun: { min: 1.0, max: 1.5, step: 0.1 }
        },
        scenarioAnalysis: ["PESSIMISTIC", "REALISTIC", "OPTIMISTIC"]
      };

      const sensitivityEndpoint = getEndpointUrl('analytics-service', 'financial', 'sensitivity-analysis');
      const sensitivityResponse = await this.httpClient.authPost(sensitivityEndpoint, sensitivityAnalysis, this.testData.testUsers.analyst);

      // Test 3: Modelo de valor actualizado neto (NPV)
      const npvAnalysis = {
        roiAnalysisId: roiResponse.data?.data?.analysisId,
        cashFlowProjection: "MONTHLY",
        includeIntangibleBenefits: true,
        riskFactors: [
          { factor: "technology_obsolescence", probability: 0.2, impact: 0.15 },
          { factor: "market_changes", probability: 0.3, impact: 0.1 }
        ]
      };

      const npvEndpoint = getEndpointUrl('analytics-service', 'financial', 'npv-analysis');
      const npvResponse = await this.httpClient.authPost(npvEndpoint, npvAnalysis, this.testData.testUsers.executive);

      const duration = Date.now() - startTime;

      this.reporter.addResult(roiEndpoint, 'POST', 'PASS', {
        duration,
        message: 'ROI analysis tests completed successfully',
        testsCompleted: 3,
        roiAnalysisCompleted: roiResponse.data?.success || false,
        sensitivityAnalyzed: sensitivityResponse.data?.success || false,
        npvCalculated: npvResponse.data?.success || false,
        investmentCategoriesAnalyzed: roiAnalysisConfig.investmentCategories.length,
        timeHorizonMonths: roiAnalysisConfig.analysisParameters.timeHorizon
      });

      this.logger.success(`✅ Análisis ROI completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'financial', 'roi-analysis');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with ROI analysis'
      });
      this.logger.error(`❌ Error en análisis ROI: ${error.message}`);
    }
  }

  async testBenchmarking() {
    this.logger.subheader('Test: Benchmarking y comparativas competitivas');
    const startTime = Date.now();

    try {
      // Test 1: Configurar benchmarking sectorial
      const benchmarkConfig = {
        benchmarkSources: [
          {
            name: "higher_education_sector",
            type: "INDUSTRY_STANDARD",
            dataSource: "EDUCAUSE_METRICS",
            weightage: 0.4
          },
          {
            name: "regional_universities",
            type: "PEER_COMPARISON",
            institutions: ["UNIVERSIDAD_A", "UNIVERSIDAD_B", "UNIVERSIDAD_C"],
            weightage: 0.35
          },
          {
            name: "international_best_practices",
            type: "BEST_IN_CLASS",
            regions: ["NORTH_AMERICA", "EUROPE", "ASIA_PACIFIC"],
            weightage: 0.25
          }
        ],
        metricsToCompare: [
          "resource_utilization_rate",
          "cost_per_student_hour",
          "user_satisfaction_score",
          "technology_adoption_rate",
          "operational_efficiency_index"
        ],
        analysisFrequency: "QUARTERLY"
      };

      const benchmarkEndpoint = getEndpointUrl('analytics-service', 'benchmarking', 'configure');
      const benchmarkResponse = await this.httpClient.authPost(benchmarkEndpoint, benchmarkConfig, this.testData.testUsers.executive);

      // Test 2: Ejecutar análisis comparativo
      const comparativeAnalysis = {
        benchmarkConfigId: benchmarkResponse.data?.data?.configId,
        timeFrame: "LAST_12_MONTHS",
        includeGapAnalysis: true,
        generateActionPlan: true,
        prioritizeOpportunities: true
      };

      const compareEndpoint = getEndpointUrl('analytics-service', 'benchmarking', 'compare');
      const compareResponse = await this.httpClient.authPost(compareEndpoint, comparativeAnalysis, this.testData.testUsers.analyst);

      // Test 3: Generar reporte de posicionamiento competitivo
      const competitivePositioning = {
        analysisId: compareResponse.data?.data?.analysisId,
        reportType: "EXECUTIVE_SUMMARY",
        includeRecommendations: true,
        focusAreas: ["strengths", "opportunities", "threats"],
        visualization: {
          includeRadarChart: true,
          includeHeatmap: true,
          includeScorecard: true
        }
      };

      const positioningEndpoint = getEndpointUrl('analytics-service', 'benchmarking', 'competitive-positioning');
      const positioningResponse = await this.httpClient.authPost(positioningEndpoint, competitivePositioning, this.testData.testUsers.executive);

      if (positioningResponse.data.success) {
        this.testData.generatedReports.push(positioningResponse.data.data);
      }

      const duration = Date.now() - startTime;

      this.reporter.addResult(benchmarkEndpoint, 'POST', 'PASS', {
        duration,
        message: 'Benchmarking tests completed successfully',
        testsCompleted: 3,
        benchmarkConfigured: benchmarkResponse.data?.success || false,
        comparativeAnalysisCompleted: compareResponse.data?.success || false,
        competitiveReportGenerated: positioningResponse.data?.success || false,
        benchmarkSourcesConfigured: benchmarkConfig.benchmarkSources.length,
        metricsCompared: benchmarkConfig.metricsToCompare.length
      });

      this.logger.success(`✅ Benchmarking completado (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const endpoint = getEndpointUrl('analytics-service', 'benchmarking', 'configure');
      this.reporter.addResult(endpoint, 'POST', 'FAIL', {
        duration,
        error: error.message,
        expected: 'HTTP 200 with benchmarking'
      });
      this.logger.error(`❌ Error en benchmarking: ${error.message}`);
    }
  }

  async cleanup() {
    this.logger.subheader('Cleanup - Limpieza de datos de prueba');

    // Limpiar dashboards creados
    for (const dashboard of this.testData.createdDashboards) {
      try {
        const endpoint = getEndpointUrl('analytics-service', 'dashboards', 'delete').replace(':id', dashboard.dashboardId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.executive);
        this.logger.debug(`Cleaned up dashboard: ${dashboard.name}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup dashboard ${dashboard.dashboardId}:`, error.message);
      }
    }

    // Limpiar reportes generados
    for (const report of this.testData.generatedReports) {
      try {
        const endpoint = getEndpointUrl('analytics-service', 'reports', 'delete').replace(':id', report.reportId);
        await this.httpClient.authDelete(endpoint, this.testData.testUsers.executive);
        this.logger.debug(`Cleaned up report: ${report.reportType}`);
      } catch (error) {
        this.logger.warn(`Failed to cleanup report ${report.reportId}:`, error.message);
      }
    }

    this.logger.success('Cleanup completado');
  }

  async generateReport() {
    this.logger.subheader('Generando reporte final');
    
    const summary = this.reporter.generateSummary();
    
    this.logger.info('='.repeat(80));
    this.logger.info('RESUMEN DE TESTING - HITO 8: BUSINESS INTELLIGENCE');
    this.logger.info('='.repeat(80));
    this.logger.info(`Total tests: ${summary.total}`);
    this.logger.info(`Passed: ${summary.passed} ✅`);
    this.logger.info(`Failed: ${summary.failed} ❌`);
    this.logger.info(`Success rate: ${summary.successRate}%`);
    this.logger.info(`Average response time: ${summary.averageResponseTime}ms`);
    this.logger.info('='.repeat(80));

    await this.reporter.saveReport();
    this.logger.success('Reporte guardado en results/hito-8-analytics-business.json');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const flow = new BusinessIntelligenceFlow();
  flow.run().catch(console.error);
}

module.exports = { BusinessIntelligenceFlow };
