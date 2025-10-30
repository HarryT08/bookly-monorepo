#!/usr/bin/env node

/**
 * HITO 2 - AVAILABILITY CORE
 * Test Flow: Advanced Availability Search
 * 
 * Valida búsqueda avanzada de disponibilidad:
 * - Búsqueda por rango de fechas
 * - Filtros por tipo de recurso y capacidad
 * - Búsqueda por ubicación y características
 * - Disponibilidad de recursos equivalentes
 * - Búsqueda con criterios múltiples
 */

const path = require('path');
const { HttpClient } = require('../shared/http-client');
const { Logger } = require('../shared/logger');
const { TestValidator } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const config = require('../shared/config');

class SearchAvailabilityTester {
    constructor() {
        this.httpClient = new HttpClient();
        this.logger = new Logger('SearchAvailability');
        this.reporter = new TestReporter('Hito 2 - Search Availability');
        this.validator = new TestValidator();
        this.testData = {
            testResources: [],
            searchCriteria: {}
        };
    }

    async runAllTests() {
        this.logger.info('=== INICIANDO TESTS DE BÚSQUEDA DE DISPONIBILIDAD ===');
        
        try {
            await this.authenticateUsers();
            await this.setupTestData();
            
            await this.testBasicAvailabilitySearch();
            await this.testDateRangeSearch();
            await this.testResourceTypeFilters();
            await this.testCapacityFilters();
            await this.testLocationSearch();
            await this.testAdvancedMultiCriteria();
            await this.testEquivalentResources();
            await this.testFreeTimeSlots();
            await this.testPerformanceMetrics();
            
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
            { role: 'admin', ...config.testUsers.adminGeneral }
        ];

        for (const user of users) {
            await this.httpClient.login(user.email, user.password);
            this.logger.success(`✓ Usuario ${user.role} autenticado`);
        }
    }

    async setupTestData() {
        try {
            const response = await this.httpClient.get('/api/v1/resources/resources', {}, config.testUsers.teacher);
            
            if (response.success && response.data?.length > 0) {
                this.testData.testResources = response.data.slice(0, 5); // Primeros 5 recursos
                this.logger.success(`✓ ${this.testData.testResources.length} recursos obtenidos para pruebas`);
                
                // Configurar criterios de búsqueda base
                this.testData.searchCriteria = {
                    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana
                    duration: 120, // 2 horas
                    minCapacity: 10
                };
            } else {
                throw new Error('No se encontraron recursos para pruebas');
            }
        } catch (error) {
            this.logger.error('Error configurando datos:', error.message);
            throw error;
        }
    }

    async testBasicAvailabilitySearch() {
        this.logger.info('TEST: Búsqueda básica de disponibilidad');
        
        try {
            const searchParams = {
                startDate: this.testData.searchCriteria.startDate,
                endDate: this.testData.searchCriteria.endDate,
                duration: this.testData.searchCriteria.duration
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/search',
                searchParams,
                config.testUsers.student
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const results = response.data?.results || [];
                
                this.logger.success(`✓ Búsqueda básica exitosa: ${results.length} resultados`);
                
                this.reporter.addResult({
                    test: 'Basic Availability Search',
                    success: true,
                    endpoint: '/api/v1/availability/search',
                    responseTime: response.responseTime,
                    data: {
                        resultsCount: results.length,
                        searchDuration: searchParams.duration,
                        dateRange: `${searchParams.startDate} - ${searchParams.endDate}`
                    }
                });
            } else {
                throw new Error(`Búsqueda falló: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en búsqueda básica:', error.message);
            this.reporter.addResult({
                test: 'Basic Availability Search',
                success: false,
                error: error.message
            });
        }
    }

    async testDateRangeSearch() {
        this.logger.info('TEST: Búsqueda por rango de fechas específico');
        
        try {
            const searchParams = {
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),   // 3 días
                duration: 60, // 1 hora
                timeSlots: [
                    { start: '08:00', end: '12:00' },
                    { start: '14:00', end: '18:00' }
                ]
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/search',
                searchParams,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const results = response.data?.results || [];
                
                this.logger.success(`✓ Búsqueda por fecha exitosa: ${results.length} resultados`);
                
                this.reporter.addResult({
                    test: 'Date Range Search',
                    success: true,
                    endpoint: '/api/v1/availability/search',
                    responseTime: response.responseTime,
                    data: {
                        resultsCount: results.length,
                        dateRangeHours: 24, // 1 día
                        timeSlots: searchParams.timeSlots.length
                    }
                });
            } else {
                throw new Error(`Búsqueda por fecha falló: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en búsqueda por fecha:', error.message);
            this.reporter.addResult({
                test: 'Date Range Search',
                success: false,
                error: error.message
            });
        }
    }

    async testResourceTypeFilters() {
        this.logger.info('TEST: Búsqueda filtrada por tipo de recurso');
        
        try {
            const resourceTypes = ['SALON', 'LABORATORIO', 'AUDITORIO'];
            
            for (const type of resourceTypes) {
                const searchParams = {
                    startDate: this.testData.searchCriteria.startDate,
                    endDate: this.testData.searchCriteria.endDate,
                    duration: 90,
                    resourceType: type,
                    includeDetails: true
                };

                const response = await this.httpClient.get(
                    '/api/v1/availability/search',
                    searchParams,
                    config.testUsers.teacher
                );

                if (this.validator.validateBooklyResponse(response) && response.success) {
                    const results = response.data?.results || [];
                    const typeMatches = results.filter(r => r.resource?.type === type).length;
                    
                    this.logger.success(`✓ Tipo ${type}: ${results.length} resultados (${typeMatches} coincidencias exactas)`);
                    
                    this.reporter.addResult({
                        test: `Resource Type Filter - ${type}`,
                        success: true,
                        endpoint: '/api/v1/availability/search',
                        responseTime: response.responseTime,
                        data: {
                            resourceType: type,
                            totalResults: results.length,
                            exactMatches: typeMatches
                        }
                    });
                } else {
                    throw new Error(`Filtro por tipo ${type} falló: ${JSON.stringify(response)}`);
                }
            }
            
        } catch (error) {
            this.logger.error('✗ Error en filtros por tipo:', error.message);
            this.reporter.addResult({
                test: 'Resource Type Filters',
                success: false,
                error: error.message
            });
        }
    }

    async testCapacityFilters() {
        this.logger.info('TEST: Búsqueda filtrada por capacidad');
        
        try {
            const capacityTests = [
                { minCapacity: 10, maxCapacity: 30, name: 'Pequeño' },
                { minCapacity: 31, maxCapacity: 100, name: 'Medio' },
                { minCapacity: 101, name: 'Grande' }
            ];

            for (const test of capacityTests) {
                const searchParams = {
                    startDate: this.testData.searchCriteria.startDate,
                    endDate: this.testData.searchCriteria.endDate,
                    duration: 120,
                    minCapacity: test.minCapacity,
                    ...(test.maxCapacity && { maxCapacity: test.maxCapacity })
                };

                const response = await this.httpClient.get(
                    '/api/v1/availability/search',
                    searchParams,
                    config.testUsers.teacher
                );

                if (this.validator.validateBooklyResponse(response) && response.success) {
                    const results = response.data?.results || [];
                    
                    this.logger.success(`✓ Capacidad ${test.name}: ${results.length} resultados`);
                    
                    this.reporter.addResult({
                        test: `Capacity Filter - ${test.name}`,
                        success: true,
                        endpoint: '/api/v1/availability/search',
                        responseTime: response.responseTime,
                        data: {
                            capacityRange: `${test.minCapacity}${test.maxCapacity ? `-${test.maxCapacity}` : '+'}`,
                            resultsCount: results.length
                        }
                    });
                } else {
                    throw new Error(`Filtro capacidad ${test.name} falló: ${JSON.stringify(response)}`);
                }
            }
            
        } catch (error) {
            this.logger.error('✗ Error en filtros por capacidad:', error.message);
            this.reporter.addResult({
                test: 'Capacity Filters',
                success: false,
                error: error.message
            });
        }
    }

    async testLocationSearch() {
        this.logger.info('TEST: Búsqueda por ubicación');
        
        try {
            const locationParams = {
                startDate: this.testData.searchCriteria.startDate,
                endDate: this.testData.searchCriteria.endDate,
                duration: 60,
                location: {
                    building: 'EDIFICIO_A',
                    floor: 1,
                    zone: 'NORTE'
                },
                proximity: {
                    latitude: 7.8939,
                    longitude: -72.5078,
                    radiusKm: 1
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/search/advanced',
                locationParams,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const results = response.data?.results || [];
                
                this.logger.success(`✓ Búsqueda por ubicación: ${results.length} resultados`);
                
                this.reporter.addResult({
                    test: 'Location Search',
                    success: true,
                    endpoint: '/api/v1/availability/search/advanced',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        building: locationParams.location.building,
                        floor: locationParams.location.floor,
                        resultsCount: results.length,
                        proximityRadius: locationParams.proximity.radiusKm
                    }
                });
            } else {
                throw new Error(`Búsqueda por ubicación falló: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en búsqueda por ubicación:', error.message);
            this.reporter.addResult({
                test: 'Location Search',
                success: false,
                error: error.message
            });
        }
    }

    async testAdvancedMultiCriteria() {
        this.logger.info('TEST: Búsqueda avanzada con múltiples criterios');
        
        try {
            const advancedParams = {
                startDate: this.testData.searchCriteria.startDate,
                endDate: this.testData.searchCriteria.endDate,
                duration: 180, // 3 horas
                criteria: {
                    resourceTypes: ['SALON', 'AUDITORIO'],
                    minCapacity: 50,
                    features: ['PROYECTOR', 'AUDIO', 'AIRE_ACONDICIONADO'],
                    accessibility: true,
                    technology: ['WIFI', 'COMPUTADORES']
                },
                preferences: {
                    orderBy: 'capacity',
                    orderDirection: 'desc',
                    includeAlternatives: true,
                    maxResults: 10
                },
                filters: {
                    excludeMaintenanceHours: true,
                    allowPartialMatches: false,
                    requireAllFeatures: true
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/search/advanced',
                advancedParams,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const results = response.data?.results || [];
                const alternatives = response.data?.alternatives || [];
                
                this.logger.success(`✓ Búsqueda avanzada: ${results.length} resultados principales, ${alternatives.length} alternativas`);
                
                this.reporter.addResult({
                    test: 'Advanced Multi-Criteria Search',
                    success: true,
                    endpoint: '/api/v1/availability/search/advanced',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        criteriaCount: Object.keys(advancedParams.criteria).length,
                        mainResults: results.length,
                        alternatives: alternatives.length,
                        duration: advancedParams.duration,
                        featuresRequired: advancedParams.criteria.features.length
                    }
                });
            } else {
                throw new Error(`Búsqueda avanzada falló: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en búsqueda avanzada:', error.message);
            this.reporter.addResult({
                test: 'Advanced Multi-Criteria Search',
                success: false,
                error: error.message
            });
        }
    }

    async testEquivalentResources() {
        this.logger.info('TEST: Búsqueda de recursos equivalentes');
        
        if (this.testData.testResources.length === 0) {
            this.logger.warn('No hay recursos para test de equivalencias');
            return;
        }

        try {
            const baseResourceId = this.testData.testResources[0].id;
            
            const equivalentParams = {
                baseResourceId: baseResourceId,
                startDate: this.testData.searchCriteria.startDate,
                endDate: this.testData.searchCriteria.endDate,
                duration: 90,
                equivalenceCriteria: {
                    sameType: true,
                    similarCapacity: 0.8, // 80% de capacidad similar
                    sameFeatures: 0.6,    // 60% de características similares
                    sameLocation: false
                }
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/resources/equivalent',
                equivalentParams,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const equivalents = response.data?.equivalents || [];
                
                this.logger.success(`✓ Recursos equivalentes encontrados: ${equivalents.length}`);
                
                this.reporter.addResult({
                    test: 'Equivalent Resources Search',
                    success: true,
                    endpoint: '/api/v1/availability/resources/equivalent',
                    responseTime: response.responseTime,
                    data: {
                        baseResourceId: baseResourceId,
                        equivalentsFound: equivalents.length,
                        similarityThresholds: {
                            capacity: equivalentParams.equivalenceCriteria.similarCapacity,
                            features: equivalentParams.equivalenceCriteria.sameFeatures
                        }
                    }
                });
            } else {
                throw new Error(`Búsqueda de equivalentes falló: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error buscando recursos equivalentes:', error.message);
            this.reporter.addResult({
                test: 'Equivalent Resources Search',
                success: false,
                error: error.message
            });
        }
    }

    async testFreeTimeSlots() {
        this.logger.info('TEST: Búsqueda de slots de tiempo libres');
        
        try {
            const slotsParams = {
                resourceIds: this.testData.testResources.slice(0, 3).map(r => r.id),
                date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
                minDuration: 60,  // 1 hora mínimo
                maxDuration: 240, // 4 horas máximo
                timeRange: {
                    start: '08:00',
                    end: '18:00'
                },
                slotSize: 30 // Slots de 30 minutos
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/resources/free-slots',
                slotsParams,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const freeSlots = response.data?.freeSlots || [];
                const totalSlots = freeSlots.reduce((sum, resource) => sum + (resource.slots?.length || 0), 0);
                
                this.logger.success(`✓ Slots libres encontrados: ${totalSlots} en ${freeSlots.length} recursos`);
                
                this.reporter.addResult({
                    test: 'Free Time Slots Search',
                    success: true,
                    endpoint: '/api/v1/availability/resources/free-slots',
                    responseTime: response.responseTime,
                    data: {
                        resourcesChecked: slotsParams.resourceIds.length,
                        resourcesWithSlots: freeSlots.length,
                        totalFreeSlots: totalSlots,
                        slotSize: slotsParams.slotSize,
                        timeRange: `${slotsParams.timeRange.start}-${slotsParams.timeRange.end}`
                    }
                });
            } else {
                throw new Error(`Búsqueda de slots libres falló: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error buscando slots libres:', error.message);
            this.reporter.addResult({
                test: 'Free Time Slots Search',
                success: false,
                error: error.message
            });
        }
    }

    async testPerformanceMetrics() {
        this.logger.info('TEST: Métricas de rendimiento de búsqueda');
        
        try {
            const startTime = Date.now();
            
            // Búsqueda intensiva para medir rendimiento
            const heavySearchParams = {
                startDate: this.testData.searchCriteria.startDate,
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                duration: 60,
                criteria: {
                    resourceTypes: ['SALON', 'LABORATORIO', 'AUDITORIO', 'EQUIPO_MULTIMEDIA'],
                    minCapacity: 1,
                    features: ['PROYECTOR', 'WIFI'],
                    includeAll: true
                },
                preferences: {
                    includeDetails: true,
                    includeAlternatives: true,
                    maxResults: 100
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/search/advanced',
                heavySearchParams,
                config.testUsers.teacher
            );

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const results = response.data?.results || [];
                
                this.logger.success(`✓ Búsqueda intensiva completada en ${totalTime}ms: ${results.length} resultados`);
                
                // Validar tiempos de respuesta aceptables
                const isPerformant = response.responseTime < 2000; // Menos de 2 segundos
                
                this.reporter.addResult({
                    test: 'Performance Metrics',
                    success: isPerformant,
                    endpoint: '/api/v1/availability/search/advanced',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        totalExecutionTime: totalTime,
                        resultsCount: results.length,
                        searchScope: '30 días',
                        performanceTarget: '< 2000ms',
                        actualPerformance: `${response.responseTime}ms`,
                        isPerformant: isPerformant
                    }
                });
                
                if (!isPerformant) {
                    this.logger.warn(`⚠️ Búsqueda tardó ${response.responseTime}ms (objetivo: <2000ms)`);
                }
            } else {
                throw new Error(`Búsqueda de rendimiento falló: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en test de rendimiento:', error.message);
            this.reporter.addResult({
                test: 'Performance Metrics',
                success: false,
                error: error.message
            });
        }
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'results', 'search-availability.md');
        await this.reporter.generateReport(reportPath, {
            testSuite: 'Hito 2 - Search Availability',
            description: 'Validación de funcionalidades de búsqueda avanzada de disponibilidad',
            endpoints: [
                '/api/v1/availability/search',
                '/api/v1/availability/search/advanced',
                '/api/v1/availability/resources/equivalent',
                '/api/v1/availability/resources/free-slots'
            ],
            coverage: {
                'Búsqueda básica': '✅ Implementado',
                'Filtros por fecha': '✅ Implementado',
                'Filtros por tipo': '✅ Implementado',
                'Filtros por capacidad': '✅ Implementado',
                'Búsqueda por ubicación': '✅ Implementado',
                'Criterios múltiples': '✅ Implementado',
                'Recursos equivalentes': '✅ Implementado',
                'Slots de tiempo libres': '✅ Implementado',
                'Métricas de rendimiento': '✅ Implementado'
            }
        });
        
        this.logger.success(`📋 Reporte generado: ${reportPath}`);
    }
}

if (require.main === module) {
    const tester = new SearchAvailabilityTester();
    tester.runAllTests()
        .then(() => {
            console.log('✅ Tests de búsqueda de disponibilidad completados');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en tests de búsqueda:', error);
            process.exit(1);
        });
}

module.exports = SearchAvailabilityTester;
