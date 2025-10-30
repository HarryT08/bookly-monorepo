#!/usr/bin/env node

/**
 * HITO 2 - AVAILABILITY CORE
 * Test Flow: Usage Tracking and Analytics
 * 
 * Valida seguimiento y historial de uso:
 * - Registrar uso efectivo de recursos
 * - Generar historial de reservas
 * - Calcular métricas de utilización
 * - Detectar patrones de uso
 * - Reportes de ocupación
 */

const path = require('path');
const { HttpClient } = require('../shared/http-client');
const { Logger } = require('../shared/logger');
const { TestValidator } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const config = require('../shared/config');

class UsageTrackingTester {
    constructor() {
        this.httpClient = new HttpClient();
        this.logger = new Logger('UsageTracking');
        this.reporter = new TestReporter('Hito 2 - Usage Tracking');
        this.validator = new TestValidator();
        this.testData = {
            testResourceId: null,
            testReservationId: null,
            trackingEntries: [],
            usageSessionIds: []
        };
    }

    async runAllTests() {
        this.logger.info('=== INICIANDO TESTS DE SEGUIMIENTO DE USO ===');
        
        try {
            await this.authenticateUsers();
            await this.setupTestData();
            
            await this.testUsageHistoryQuery();
            await this.testCheckInCheckOut();
            await this.testUsageSessionTracking();
            await this.testUtilizationAnalytics();
            await this.testUsagePatternAnalysis();
            await this.testOccupancyReports();
            await this.testResourceEfficiencyMetrics();
            await this.testUsageAnomalies();
            await this.testRealTimeOccupancy();
            
            await this.cleanup();
            
        } catch (error) {
            this.logger.error('Error durante ejecución:', error);
            this.reporter.addResult({
                test: 'Test Suite Execution',
                success: false,
                error: error.message
            });
        } finally {
            await this.generateReport();
        }
    }

    async authenticateUsers() {
        const users = [
            { role: 'student', ...config.testUsers.student },
            { role: 'teacher', ...config.testUsers.teacher },
            { role: 'admin', ...config.testUsers.adminGeneral },
            { role: 'security', ...config.testUsers.security }
        ];

        for (const user of users) {
            await this.httpClient.login(user.email, user.password);
            this.logger.success(`✓ Usuario ${user.role} autenticado`);
        }
    }

    async setupTestData() {
        try {
            // Obtener recurso para pruebas
            const response = await this.httpClient.get('/api/v1/resources/resources', {}, config.testUsers.teacher);
            
            if (response.success && response.data?.length > 0) {
                this.testData.testResourceId = response.data[0].id;
                this.logger.success(`✓ Recurso para pruebas: ${response.data[0].name}`);
                
                // Crear reserva de prueba para tracking
                await this.createTestReservation();
            } else {
                throw new Error('No se encontraron recursos para pruebas');
            }
        } catch (error) {
            this.logger.error('Error configurando datos:', error.message);
            throw error;
        }
    }

    async createTestReservation() {
        try {
            const reservationData = {
                resourceId: this.testData.testResourceId,
                title: 'Reserva para Usage Tracking',
                description: 'Reserva para probar seguimiento de uso',
                startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
                endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 horas
                attendees: 20,
                purpose: 'ACADEMIC'
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reservations',
                reservationData,
                config.testUsers.teacher
            );

            if (response.success && response.data) {
                this.testData.testReservationId = response.data.id;
                this.logger.success(`✓ Reserva de prueba creada: ${this.testData.testReservationId}`);
            }
        } catch (error) {
            this.logger.error('Error creando reserva de prueba:', error.message);
        }
    }

    async testUsageHistoryQuery() {
        this.logger.info('TEST: Consultando historial de uso');
        
        try {
            const historyParams = {
                resourceId: this.testData.testResourceId,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
                endDate: new Date().toISOString(),
                includeDetails: true,
                groupBy: 'DAY',
                page: 1,
                limit: 50
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/usage-history',
                historyParams,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const history = response.data || [];
                
                this.logger.success(`✓ Historial consultado: ${history.length} entradas`);
                
                this.reporter.addResult({
                    test: 'Usage History Query',
                    success: true,
                    endpoint: '/api/v1/availability/usage-history',
                    responseTime: response.responseTime,
                    data: {
                        resourceId: this.testData.testResourceId,
                        entriesFound: history.length,
                        dateRange: '30 días',
                        groupBy: historyParams.groupBy
                    }
                });
            } else {
                throw new Error(`Error consultando historial: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error consultando historial:', error.message);
            this.reporter.addResult({
                test: 'Usage History Query',
                success: false,
                error: error.message
            });
        }
    }

    async testCheckInCheckOut() {
        this.logger.info('TEST: Proceso de check-in y check-out');
        
        if (!this.testData.testReservationId) {
            this.logger.warn('No hay reserva para check-in/out');
            return;
        }

        try {
            // Check-in
            const checkinData = {
                reservationId: this.testData.testReservationId,
                actualStartTime: new Date().toISOString(),
                actualAttendees: 18,
                checkedInBy: config.testUsers.security.email,
                location: {
                    latitude: 7.8939,
                    longitude: -72.5078
                },
                notes: 'Check-in realizado durante testing automatizado'
            };

            const checkinResponse = await this.httpClient.post(
                '/api/v1/availability/usage-tracking/checkin',
                checkinData,
                config.testUsers.security
            );

            if (this.validator.validateBooklyResponse(checkinResponse) && checkinResponse.success) {
                const sessionId = checkinResponse.data?.sessionId;
                if (sessionId) this.testData.usageSessionIds.push(sessionId);
                
                this.logger.success(`✓ Check-in exitoso: ${sessionId || 'N/A'}`);

                // Esperar un momento y hacer check-out
                await new Promise(resolve => setTimeout(resolve, 2000));

                const checkoutData = {
                    sessionId: sessionId,
                    actualEndTime: new Date().toISOString(),
                    finalAttendees: 18,
                    resourceCondition: 'GOOD',
                    issues: [],
                    checkedOutBy: config.testUsers.security.email,
                    notes: 'Check-out realizado durante testing'
                };

                const checkoutResponse = await this.httpClient.post(
                    '/api/v1/availability/usage-tracking/checkout',
                    checkoutData,
                    config.testUsers.security
                );

                if (this.validator.validateBooklyResponse(checkoutResponse) && checkoutResponse.success) {
                    this.logger.success(`✓ Check-out exitoso: ${sessionId || 'N/A'}`);
                    
                    this.reporter.addResult({
                        test: 'Check-in/Check-out Process',
                        success: true,
                        endpoint: '/api/v1/availability/usage-tracking/checkin|checkout',
                        method: 'POST',
                        responseTime: checkoutResponse.responseTime,
                        data: {
                            reservationId: this.testData.testReservationId,
                            sessionId: sessionId || 'N/A',
                            actualAttendees: checkinData.actualAttendees,
                            finalAttendees: checkoutData.finalAttendees,
                            resourceCondition: checkoutData.resourceCondition
                        }
                    });
                } else {
                    throw new Error(`Error en check-out: ${JSON.stringify(checkoutResponse)}`);
                }
            } else {
                throw new Error(`Error en check-in: ${JSON.stringify(checkinResponse)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en check-in/out:', error.message);
            this.reporter.addResult({
                test: 'Check-in/Check-out Process',
                success: false,
                error: error.message
            });
        }
    }

    async testUsageSessionTracking() {
        this.logger.info('TEST: Seguimiento de sesiones de uso');
        
        try {
            const sessionParams = {
                resourceId: this.testData.testResourceId,
                startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 horas
                endDate: new Date().toISOString(),
                includeActive: true,
                includeCompleted: true
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/usage-tracking/sessions',
                sessionParams,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const sessions = response.data || [];
                const activeSessions = sessions.filter(s => s.status === 'ACTIVE').length;
                const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
                
                this.logger.success(`✓ Sesiones encontradas: ${sessions.length} (${activeSessions} activas, ${completedSessions} completadas)`);
                
                this.reporter.addResult({
                    test: 'Usage Session Tracking',
                    success: true,
                    endpoint: '/api/v1/availability/usage-tracking/sessions',
                    responseTime: response.responseTime,
                    data: {
                        resourceId: this.testData.testResourceId,
                        totalSessions: sessions.length,
                        activeSessions: activeSessions,
                        completedSessions: completedSessions,
                        timeFrame: '24 horas'
                    }
                });
            } else {
                throw new Error(`Error consultando sesiones: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error consultando sesiones:', error.message);
            this.reporter.addResult({
                test: 'Usage Session Tracking',
                success: false,
                error: error.message
            });
        }
    }

    async testUtilizationAnalytics() {
        this.logger.info('TEST: Análisis de utilización de recursos');
        
        try {
            const analyticsParams = {
                resourceIds: [this.testData.testResourceId],
                period: 'LAST_30_DAYS',
                granularity: 'WEEKLY',
                metrics: ['USAGE_RATE', 'OCCUPANCY_RATE', 'AVERAGE_DURATION', 'NO_SHOW_RATE'],
                includeComparisons: true,
                includeTrends: true
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/analytics/utilization',
                analyticsParams,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const analytics = response.data;
                
                this.logger.success(`✓ Analytics generados para ${analyticsParams.resourceIds.length} recurso(s)`);
                
                this.reporter.addResult({
                    test: 'Utilization Analytics',
                    success: true,
                    endpoint: '/api/v1/availability/analytics/utilization',
                    responseTime: response.responseTime,
                    data: {
                        resourcesAnalyzed: analyticsParams.resourceIds.length,
                        period: analyticsParams.period,
                        granularity: analyticsParams.granularity,
                        metricsCalculated: analyticsParams.metrics.length,
                        usageRate: analytics?.metrics?.USAGE_RATE || 'N/A',
                        occupancyRate: analytics?.metrics?.OCCUPANCY_RATE || 'N/A'
                    }
                });
            } else {
                throw new Error(`Error en analytics: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en analytics de utilización:', error.message);
            this.reporter.addResult({
                test: 'Utilization Analytics',
                success: false,
                error: error.message
            });
        }
    }

    async testUsagePatternAnalysis() {
        this.logger.info('TEST: Análisis de patrones de uso');
        
        try {
            const patternsParams = {
                resourceId: this.testData.testResourceId,
                analysisType: 'COMPREHENSIVE',
                timeFrame: {
                    start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días
                    end: new Date().toISOString()
                },
                patterns: [
                    'PEAK_HOURS',
                    'DAY_OF_WEEK',
                    'SEASONAL_TRENDS',
                    'USER_BEHAVIOR',
                    'DURATION_PATTERNS'
                ],
                includeCorrelations: true,
                includePredictions: true
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/analytics/patterns',
                patternsParams,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const patterns = response.data;
                
                this.logger.success(`✓ Patrones analizados: ${patternsParams.patterns.length} tipos`);
                
                this.reporter.addResult({
                    test: 'Usage Pattern Analysis',
                    success: true,
                    endpoint: '/api/v1/availability/analytics/patterns',
                    responseTime: response.responseTime,
                    data: {
                        resourceId: this.testData.testResourceId,
                        analysisType: patternsParams.analysisType,
                        patternsAnalyzed: patternsParams.patterns.length,
                        timeFrameDays: 60,
                        peakHours: patterns?.peakHours || 'N/A',
                        mostUsedDay: patterns?.mostUsedDay || 'N/A'
                    }
                });
            } else {
                throw new Error(`Error analizando patrones: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error analizando patrones:', error.message);
            this.reporter.addResult({
                test: 'Usage Pattern Analysis',
                success: false,
                error: error.message
            });
        }
    }

    async testOccupancyReports() {
        this.logger.info('TEST: Reportes de ocupación');
        
        try {
            const reportParams = {
                resources: [this.testData.testResourceId],
                reportType: 'OCCUPANCY_SUMMARY',
                period: {
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
                    end: new Date().toISOString()
                },
                groupBy: ['RESOURCE', 'DAY'],
                metrics: [
                    'TOTAL_HOURS_BOOKED',
                    'TOTAL_HOURS_USED',
                    'OCCUPANCY_PERCENTAGE',
                    'AVERAGE_SESSION_DURATION',
                    'NO_SHOW_COUNT'
                ],
                format: 'JSON',
                includeCharts: false
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reports/occupancy',
                reportParams,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const report = response.data;
                
                this.logger.success(`✓ Reporte de ocupación generado`);
                
                this.reporter.addResult({
                    test: 'Occupancy Reports',
                    success: true,
                    endpoint: '/api/v1/availability/reports/occupancy',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        resourcesIncluded: reportParams.resources.length,
                        reportType: reportParams.reportType,
                        periodDays: 7,
                        metricsCalculated: reportParams.metrics.length,
                        groupingCriteria: reportParams.groupBy.length,
                        totalHoursBooked: report?.summary?.totalHoursBooked || 'N/A'
                    }
                });
            } else {
                throw new Error(`Error generando reporte: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error generando reporte de ocupación:', error.message);
            this.reporter.addResult({
                test: 'Occupancy Reports',
                success: false,
                error: error.message
            });
        }
    }

    async testResourceEfficiencyMetrics() {
        this.logger.info('TEST: Métricas de eficiencia de recursos');
        
        try {
            const efficiencyParams = {
                resourceId: this.testData.testResourceId,
                calculationType: 'COMPREHENSIVE',
                benchmarkPeriod: 'LAST_QUARTER',
                metrics: [
                    'UTILIZATION_EFFICIENCY',
                    'BOOKING_ACCURACY',
                    'SPACE_OPTIMIZATION',
                    'TIME_OPTIMIZATION',
                    'COST_EFFECTIVENESS'
                ],
                includeRecommendations: true,
                includeComparisons: true
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/analytics/efficiency',
                efficiencyParams,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const efficiency = response.data;
                
                this.logger.success(`✓ Métricas de eficiencia calculadas`);
                
                this.reporter.addResult({
                    test: 'Resource Efficiency Metrics',
                    success: true,
                    endpoint: '/api/v1/availability/analytics/efficiency',
                    responseTime: response.responseTime,
                    data: {
                        resourceId: this.testData.testResourceId,
                        calculationType: efficiencyParams.calculationType,
                        metricsCalculated: efficiencyParams.metrics.length,
                        utilizationEfficiency: efficiency?.metrics?.UTILIZATION_EFFICIENCY || 'N/A',
                        bookingAccuracy: efficiency?.metrics?.BOOKING_ACCURACY || 'N/A',
                        recommendationsCount: efficiency?.recommendations?.length || 0
                    }
                });
            } else {
                throw new Error(`Error calculando eficiencia: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error calculando métricas de eficiencia:', error.message);
            this.reporter.addResult({
                test: 'Resource Efficiency Metrics',
                success: false,
                error: error.message
            });
        }
    }

    async testUsageAnomalies() {
        this.logger.info('TEST: Detección de anomalías de uso');
        
        try {
            const anomaliesParams = {
                resourceIds: [this.testData.testResourceId],
                detectionPeriod: 'LAST_30_DAYS',
                anomalyTypes: [
                    'UNUSUAL_USAGE_PATTERNS',
                    'CAPACITY_VIOLATIONS',
                    'TIME_ANOMALIES',
                    'FREQUENCY_ANOMALIES'
                ],
                sensitivity: 'MEDIUM',
                includeContext: true,
                includeRecommendations: true
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/analytics/anomalies',
                anomaliesParams,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const anomalies = response.data?.anomalies || [];
                
                this.logger.success(`✓ Análisis de anomalías completado: ${anomalies.length} detectadas`);
                
                this.reporter.addResult({
                    test: 'Usage Anomalies Detection',
                    success: true,
                    endpoint: '/api/v1/availability/analytics/anomalies',
                    responseTime: response.responseTime,
                    data: {
                        resourcesAnalyzed: anomaliesParams.resourceIds.length,
                        detectionPeriod: anomaliesParams.detectionPeriod,
                        anomalyTypes: anomaliesParams.anomalyTypes.length,
                        sensitivity: anomaliesParams.sensitivity,
                        anomaliesDetected: anomalies.length
                    }
                });
            } else {
                throw new Error(`Error detectando anomalías: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error detectando anomalías:', error.message);
            this.reporter.addResult({
                test: 'Usage Anomalies Detection',
                success: false,
                error: error.message
            });
        }
    }

    async testRealTimeOccupancy() {
        this.logger.info('TEST: Ocupación en tiempo real');
        
        try {
            const realTimeParams = {
                resourceIds: [this.testData.testResourceId],
                includeDetails: true,
                includeUpcomingReservations: true,
                includeCurrentSessions: true,
                refreshInterval: 30 // segundos
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/real-time/occupancy',
                realTimeParams,
                config.testUsers.security
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const occupancy = response.data;
                
                this.logger.success(`✓ Ocupación en tiempo real consultada`);
                
                this.reporter.addResult({
                    test: 'Real-time Occupancy',
                    success: true,
                    endpoint: '/api/v1/availability/real-time/occupancy',
                    responseTime: response.responseTime,
                    data: {
                        resourcesMonitored: realTimeParams.resourceIds.length,
                        currentOccupancy: occupancy?.current?.status || 'UNKNOWN',
                        activeSessions: occupancy?.current?.activeSessions || 0,
                        upcomingReservations: occupancy?.upcoming?.count || 0,
                        refreshInterval: realTimeParams.refreshInterval
                    }
                });
            } else {
                throw new Error(`Error consultando ocupación en tiempo real: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error consultando ocupación en tiempo real:', error.message);
            this.reporter.addResult({
                test: 'Real-time Occupancy',
                success: false,
                error: error.message
            });
        }
    }

    async cleanup() {
        this.logger.info('Limpiando datos de prueba...');
        
        // Limpiar sesiones de uso
        for (const sessionId of this.testData.usageSessionIds) {
            try {
                // Si la sesión aún está activa, hacer checkout
                await this.httpClient.post(
                    '/api/v1/availability/usage-tracking/checkout',
                    {
                        sessionId: sessionId,
                        actualEndTime: new Date().toISOString(),
                        resourceCondition: 'GOOD',
                        checkedOutBy: config.testUsers.admin.email,
                        notes: 'Cleanup automático de testing'
                    },
                    config.testUsers.admin
                );
                this.logger.success(`✓ Sesión cerrada: ${sessionId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error cerrando sesión ${sessionId}: ${error.message}`);
            }
        }

        // Limpiar reserva de prueba
        if (this.testData.testReservationId) {
            try {
                await this.httpClient.delete(
                    `/api/v1/availability/reservations/${this.testData.testReservationId}`,
                    config.testUsers.admin
                );
                this.logger.success(`✓ Reserva eliminada: ${this.testData.testReservationId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error eliminando reserva: ${error.message}`);
            }
        }
        
        this.logger.success('✓ Limpieza completada');
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'results', 'usage-tracking.md');
        await this.reporter.generateReport(reportPath, {
            testSuite: 'Hito 2 - Usage Tracking',
            description: 'Validación del sistema de seguimiento de uso, analytics y reportes de ocupación',
            endpoints: [
                '/api/v1/availability/usage-history',
                '/api/v1/availability/usage-tracking/checkin',
                '/api/v1/availability/usage-tracking/checkout',
                '/api/v1/availability/analytics/utilization',
                '/api/v1/availability/analytics/patterns',
                '/api/v1/availability/reports/occupancy',
                '/api/v1/availability/analytics/efficiency',
                '/api/v1/availability/analytics/anomalies',
                '/api/v1/availability/real-time/occupancy'
            ],
            coverage: {
                'Historial de uso': '✅ Implementado',
                'Check-in/Check-out': '✅ Implementado',
                'Seguimiento de sesiones': '✅ Implementado',
                'Analytics de utilización': '✅ Implementado',
                'Análisis de patrones': '✅ Implementado',
                'Reportes de ocupación': '✅ Implementado',
                'Métricas de eficiencia': '✅ Implementado',
                'Detección de anomalías': '✅ Implementado',
                'Ocupación tiempo real': '✅ Implementado'
            }
        });
        
        this.logger.success(`📋 Reporte generado: ${reportPath}`);
    }
}

if (require.main === module) {
    const tester = new UsageTrackingTester();
    tester.runAllTests()
        .then(() => {
            console.log('✅ Tests de seguimiento de uso completados');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en tests de seguimiento:', error);
            process.exit(1);
        });
}

module.exports = UsageTrackingTester;
