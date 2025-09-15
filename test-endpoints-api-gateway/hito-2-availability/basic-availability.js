#!/usr/bin/env node

/**
 * HITO 2 - AVAILABILITY CORE
 * Test Flow: Basic Availability Configuration
 * 
 * Valida la funcionalidad básica de configuración y consulta de disponibilidad:
 * - Consultar disponibilidad general de recursos
 * - Configurar horarios básicos de disponibilidad  
 * - Validar reglas de disponibilidad por tipo de usuario
 * - Verificar disponibilidad en tiempo real
 */

const path = require('path');
const { HttpClient } = require('../shared/http-client');
const { Logger } = require('../shared/logger');
const { TestValidator } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const config = require('../shared/config');

class BasicAvailabilityTester {
    constructor() {
        this.httpClient = new HttpClient();
        this.logger = new Logger('BasicAvailability');
        this.reporter = new TestReporter('Hito 2 - Basic Availability');
        this.validator = new TestValidator();
        this.testData = {
            createdSchedules: [],
            testResourceId: null
        };
    }

    async runAllTests() {
        this.logger.info('=== INICIANDO TESTS DE DISPONIBILIDAD BÁSICA ===');
        
        try {
            // Autenticación de usuarios necesarios
            await this.authenticateUsers();
            
            // Preparar datos de prueba
            await this.setupTestData();
            
            // Batería de tests
            await this.testResourceAvailabilityQuery();
            await this.testScheduleConfiguration();
            await this.testUserRoleAvailabilityRules();
            await this.testRealTimeAvailability();
            await this.testAvailabilityConflicts();
            await this.testScheduleUpdates();
            await this.testScheduleDeletion();
            await this.testPermissionRestrictions();
            
            // Limpieza
            await this.cleanup();
            
        } catch (error) {
            this.logger.error('Error durante ejecución de tests:', error);
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
        this.logger.info('Autenticando usuarios de prueba...');
        
        const users = [
            { role: 'student', email: config.testUsers.student.email, password: config.testUsers.student.password },
            { role: 'teacher', email: config.testUsers.teacher.email, password: config.testUsers.teacher.password },
            { role: 'admin', email: config.testUsers.adminGeneral.email, password: config.testUsers.adminGeneral.password }
        ];

        for (const user of users) {
            try {
                await this.httpClient.login(user.email, user.password);
                this.logger.success(`✓ Usuario ${user.role} autenticado`);
            } catch (error) {
                this.logger.error(`✗ Error autenticando ${user.role}:`, error.message);
                throw new Error(`Fallo en autenticación de ${user.role}`);
            }
        }
    }

    async setupTestData() {
        this.logger.info('Configurando datos de prueba...');
        
        try {
            // Obtener primer recurso disponible para pruebas
            const response = await this.httpClient.get('/api/v1/resources/resources', {}, config.testUsers.teacher);
            
            if (response.success && response.data && response.data.length > 0) {
                this.testData.testResourceId = response.data[0].id;
                this.logger.success(`✓ Usando recurso para pruebas: ${response.data[0].name} (${this.testData.testResourceId})`);
            } else {
                throw new Error('No se encontraron recursos para pruebas');
            }
        } catch (error) {
            this.logger.error('Error configurando datos de prueba:', error.message);
            throw error;
        }
    }

    async testResourceAvailabilityQuery() {
        this.logger.info('TEST: Consultando disponibilidad general de recursos');
        
        try {
            const resourceId = this.testData.testResourceId;
            const startDate = new Date();
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
            
            const response = await this.httpClient.get(
                `/api/v1/availability/resources/${resourceId}/availability`,
                { 
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                },
                config.testUsers.student
            );

            const isValid = this.validator.validateBooklyResponse(response);
            
            if (isValid && response.success) {
                this.logger.success('✓ Consulta de disponibilidad exitosa');
                this.logger.info(`Slots disponibles encontrados: ${response.data?.availableSlots?.length || 0}`);
                
                this.reporter.addResult({
                    test: 'Resource Availability Query',
                    success: true,
                    endpoint: `/api/v1/availability/resources/${resourceId}/availability`,
                    responseTime: response.responseTime,
                    data: {
                        availableSlots: response.data?.availableSlots?.length || 0,
                        dateRange: `${startDate.toISOString()} - ${endDate.toISOString()}`
                    }
                });
            } else {
                throw new Error(`Respuesta inválida: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en consulta de disponibilidad:', error.message);
            this.reporter.addResult({
                test: 'Resource Availability Query',
                success: false,
                error: error.message
            });
        }
    }

    async testScheduleConfiguration() {
        this.logger.info('TEST: Configurando horarios básicos de disponibilidad');
        
        try {
            const scheduleData = {
                resourceId: this.testData.testResourceId,
                type: 'REGULAR',
                name: 'Horario Test Básico',
                description: 'Horario de prueba para testing automatizado',
                rules: {
                    weekdays: [1, 2, 3, 4, 5], // Lunes a Viernes
                    startTime: '08:00',
                    endTime: '18:00',
                    timezone: 'America/Bogota'
                },
                restrictions: {
                    minDuration: 60, // 1 hora mínimo
                    maxDuration: 480, // 8 horas máximo
                    allowedUserTypes: ['STUDENT', 'TEACHER', 'ADMIN']
                },
                effectiveFrom: new Date().toISOString(),
                effectiveUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/schedules',
                scheduleData,
                config.testUsers.admin
            );

            const isValid = this.validator.validateBooklyResponse(response);
            
            if (isValid && response.success && response.data) {
                const scheduleId = response.data.id;
                this.testData.createdSchedules.push(scheduleId);
                
                this.logger.success(`✓ Horario creado exitosamente: ${scheduleId}`);
                
                this.reporter.addResult({
                    test: 'Schedule Configuration',
                    success: true,
                    endpoint: '/api/v1/availability/schedules',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        scheduleId: scheduleId,
                        resourceId: this.testData.testResourceId,
                        type: scheduleData.type
                    }
                });
                
                // Verificar que el horario se puede consultar
                await this.verifyScheduleCreation(scheduleId);
                
            } else {
                throw new Error(`Error creando horario: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error configurando horario:', error.message);
            this.reporter.addResult({
                test: 'Schedule Configuration',
                success: false,
                error: error.message
            });
        }
    }

    async verifyScheduleCreation(scheduleId) {
        try {
            const response = await this.httpClient.get(
                `/api/v1/availability/schedules/${scheduleId}`,
                {},
                config.testUsers.admin
            );

            if (response.success && response.data) {
                this.logger.success(`✓ Horario verificado: ${response.data.name}`);
                return true;
            } else {
                throw new Error('Horario no encontrado después de creación');
            }
        } catch (error) {
            this.logger.error(`✗ Error verificando horario ${scheduleId}:`, error.message);
            return false;
        }
    }

    async testUserRoleAvailabilityRules() {
        this.logger.info('TEST: Validando reglas de disponibilidad por tipo de usuario');
        
        const users = [
            { type: 'STUDENT', config: config.testUsers.student, name: 'Estudiante' },
            { type: 'TEACHER', config: config.testUsers.teacher, name: 'Docente' },
            { type: 'ADMIN', config: config.testUsers.admin, name: 'Administrador' }
        ];

        for (const user of users) {
            try {
                const response = await this.httpClient.get(
                    `/api/v1/availability/resources/${this.testData.testResourceId}/availability`,
                    { 
                        userType: user.type,
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    },
                    user.config
                );

                if (response.success) {
                    this.logger.success(`✓ ${user.name}: Disponibilidad consultada exitosamente`);
                    
                    this.reporter.addResult({
                        test: `User Role Availability - ${user.name}`,
                        success: true,
                        endpoint: `/api/v1/availability/resources/${this.testData.testResourceId}/availability`,
                        responseTime: response.responseTime,
                        data: {
                            userType: user.type,
                            availableSlots: response.data?.availableSlots?.length || 0
                        }
                    });
                } else {
                    throw new Error(`Error para ${user.name}: ${JSON.stringify(response)}`);
                }
                
            } catch (error) {
                this.logger.error(`✗ Error validando reglas para ${user.name}:`, error.message);
                this.reporter.addResult({
                    test: `User Role Availability - ${user.name}`,
                    success: false,
                    error: error.message
                });
            }
        }
    }

    async testRealTimeAvailability() {
        this.logger.info('TEST: Verificando disponibilidad en tiempo real');
        
        try {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            
            const response = await this.httpClient.get(
                '/api/v1/availability/search',
                {
                    resourceIds: [this.testData.testResourceId],
                    startTime: now.toISOString(),
                    endTime: oneHourLater.toISOString(),
                    realTime: true
                },
                config.testUsers.teacher
            );

            const isValid = this.validator.validateBooklyResponse(response);
            
            if (isValid && response.success) {
                this.logger.success('✓ Consulta de disponibilidad en tiempo real exitosa');
                
                this.reporter.addResult({
                    test: 'Real-time Availability Check',
                    success: true,
                    endpoint: '/api/v1/availability/search',
                    responseTime: response.responseTime,
                    data: {
                        timeSlot: `${now.toISOString()} - ${oneHourLater.toISOString()}`,
                        available: response.data?.available || false,
                        conflictingReservations: response.data?.conflicts?.length || 0
                    }
                });
            } else {
                throw new Error(`Respuesta inválida: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error en disponibilidad tiempo real:', error.message);
            this.reporter.addResult({
                test: 'Real-time Availability Check',
                success: false,
                error: error.message
            });
        }
    }

    async testAvailabilityConflicts() {
        this.logger.info('TEST: Validando detección de conflictos de disponibilidad');
        
        try {
            // Crear una reserva temporal para generar conflicto
            const now = new Date();
            const reservationStart = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas desde ahora
            const reservationEnd = new Date(reservationStart.getTime() + 60 * 60 * 1000); // 1 hora de duración
            
            const reservationData = {
                resourceId: this.testData.testResourceId,
                title: 'Reserva Test para Conflicto',
                description: 'Reserva temporal para probar detección de conflictos',
                startTime: reservationStart.toISOString(),
                endTime: reservationEnd.toISOString(),
                userEmail: config.testUsers.teacher.email
            };

            // Crear reserva
            const createResponse = await this.httpClient.post(
                '/api/v1/availability/reservations',
                reservationData,
                config.testUsers.teacher
            );

            if (createResponse.success) {
                const reservationId = createResponse.data.id;
                this.logger.info(`Reserva temporal creada: ${reservationId}`);
                
                // Ahora verificar conflicto
                const conflictResponse = await this.httpClient.get(
                    '/api/v1/availability/search',
                    {
                        resourceIds: [this.testData.testResourceId],
                        startTime: reservationStart.toISOString(),
                        endTime: reservationEnd.toISOString(),
                        checkConflicts: true
                    },
                    config.testUsers.student
                );
                
                if (conflictResponse.success && conflictResponse.data?.conflicts?.length > 0) {
                    this.logger.success('✓ Conflicto detectado correctamente');
                    
                    this.reporter.addResult({
                        test: 'Availability Conflict Detection',
                        success: true,
                        endpoint: '/api/v1/availability/search',
                        responseTime: conflictResponse.responseTime,
                        data: {
                            conflictsDetected: conflictResponse.data.conflicts.length,
                            reservationId: reservationId
                        }
                    });
                } else {
                    throw new Error('No se detectó el conflicto esperado');
                }
                
                // Limpiar reserva temporal
                await this.httpClient.delete(
                    `/api/v1/availability/reservations/${reservationId}`,
                    config.testUsers.teacher
                );
                
            } else {
                throw new Error('No se pudo crear reserva temporal para test de conflicto');
            }
            
        } catch (error) {
            this.logger.error('✗ Error validando conflictos:', error.message);
            this.reporter.addResult({
                test: 'Availability Conflict Detection',
                success: false,
                error: error.message
            });
        }
    }

    async testScheduleUpdates() {
        this.logger.info('TEST: Actualizando configuración de horarios');
        
        if (this.testData.createdSchedules.length === 0) {
            this.logger.warn('No hay horarios creados para actualizar');
            return;
        }

        try {
            const scheduleId = this.testData.createdSchedules[0];
            const updateData = {
                name: 'Horario Test Actualizado',
                description: 'Horario actualizado durante testing automatizado',
                rules: {
                    weekdays: [1, 2, 3, 4, 5, 6], // Agregar sábado
                    startTime: '07:00', // Empezar más temprano
                    endTime: '19:00',   // Terminar más tarde
                    timezone: 'America/Bogota'
                },
                restrictions: {
                    minDuration: 30, // Reducir duración mínima
                    maxDuration: 600, // Aumentar duración máxima
                    allowedUserTypes: ['STUDENT', 'TEACHER', 'ADMIN']
                }
            };

            const response = await this.httpClient.put(
                `/api/v1/availability/schedules/${scheduleId}`,
                updateData,
                config.testUsers.admin
            );

            const isValid = this.validator.validateBooklyResponse(response);
            
            if (isValid && response.success) {
                this.logger.success(`✓ Horario actualizado exitosamente: ${scheduleId}`);
                
                this.reporter.addResult({
                    test: 'Schedule Update',
                    success: true,
                    endpoint: `/api/v1/availability/schedules/${scheduleId}`,
                    method: 'PUT',
                    responseTime: response.responseTime,
                    data: {
                        scheduleId: scheduleId,
                        updatedFields: Object.keys(updateData)
                    }
                });
            } else {
                throw new Error(`Error actualizando horario: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error actualizando horario:', error.message);
            this.reporter.addResult({
                test: 'Schedule Update',
                success: false,
                error: error.message
            });
        }
    }

    async testScheduleDeletion() {
        this.logger.info('TEST: Eliminando horarios de prueba');
        
        if (this.testData.createdSchedules.length === 0) {
            this.logger.warn('No hay horarios para eliminar');
            return;
        }

        try {
            const scheduleId = this.testData.createdSchedules[0];
            
            const response = await this.httpClient.delete(
                `/api/v1/availability/schedules/${scheduleId}`,
                config.testUsers.admin
            );

            const isValid = this.validator.validateBooklyResponse(response);
            
            if (isValid && response.success) {
                this.logger.success(`✓ Horario eliminado exitosamente: ${scheduleId}`);
                
                // Remover de la lista de creados
                this.testData.createdSchedules = this.testData.createdSchedules.filter(id => id !== scheduleId);
                
                this.reporter.addResult({
                    test: 'Schedule Deletion',
                    success: true,
                    endpoint: `/api/v1/availability/schedules/${scheduleId}`,
                    method: 'DELETE',
                    responseTime: response.responseTime,
                    data: {
                        deletedScheduleId: scheduleId
                    }
                });
                
                // Verificar que no se puede consultar después de eliminación
                await this.verifyScheduleDeletion(scheduleId);
                
            } else {
                throw new Error(`Error eliminando horario: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error eliminando horario:', error.message);
            this.reporter.addResult({
                test: 'Schedule Deletion',
                success: false,
                error: error.message
            });
        }
    }

    async verifyScheduleDeletion(scheduleId) {
        try {
            const response = await this.httpClient.get(
                `/api/v1/availability/schedules/${scheduleId}`,
                {},
                config.testUsers.admin
            );

            if (response.success) {
                this.logger.warn(`⚠️ Horario aún existe después de eliminación: ${scheduleId}`);
                return false;
            } else if (response.status === 404) {
                this.logger.success(`✓ Horario correctamente eliminado: ${scheduleId}`);
                return true;
            }
        } catch (error) {
            if (error.message.includes('404')) {
                this.logger.success(`✓ Horario correctamente eliminado: ${scheduleId}`);
                return true;
            } else {
                this.logger.error(`Error verificando eliminación: ${error.message}`);
                return false;
            }
        }
    }

    async testPermissionRestrictions() {
        this.logger.info('TEST: Validando restricciones de permisos');
        
        try {
            // Estudiante intentando crear horario (debería fallar)
            const scheduleData = {
                resourceId: this.testData.testResourceId,
                type: 'REGULAR',
                name: 'Horario No Autorizado',
                rules: {
                    weekdays: [1, 2, 3, 4, 5],
                    startTime: '08:00',
                    endTime: '18:00'
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/schedules',
                scheduleData,
                config.testUsers.student
            );

            if (!response.success && (response.status === 403 || response.status === 401)) {
                this.logger.success('✓ Restricción de permisos funcionando correctamente');
                
                this.reporter.addResult({
                    test: 'Permission Restrictions',
                    success: true,
                    endpoint: '/api/v1/availability/schedules',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        expectedStatus: 403,
                        actualStatus: response.status,
                        userRole: 'STUDENT'
                    }
                });
            } else {
                throw new Error(`Estudiante pudo crear horario cuando no debería: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error validando permisos:', error.message);
            this.reporter.addResult({
                test: 'Permission Restrictions',
                success: false,
                error: error.message
            });
        }
    }

    async cleanup() {
        this.logger.info('Limpiando datos de prueba...');
        
        // Eliminar horarios creados durante las pruebas
        for (const scheduleId of this.testData.createdSchedules) {
            try {
                await this.httpClient.delete(
                    `/api/v1/availability/schedules/${scheduleId}`,
                    config.testUsers.admin
                );
                this.logger.success(`✓ Horario eliminado: ${scheduleId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error eliminando horario ${scheduleId}: ${error.message}`);
            }
        }
        
        this.logger.success('✓ Limpieza completada');
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'results', 'basic-availability.md');
        await this.reporter.generateReport(reportPath, {
            testSuite: 'Hito 2 - Basic Availability',
            description: 'Validación de funcionalidades básicas de configuración y consulta de disponibilidad',
            endpoints: [
                '/api/v1/availability/resources/{id}/availability',
                '/api/v1/availability/schedules',
                '/api/v1/availability/search'
            ],
            coverage: {
                'Consulta de disponibilidad': '✅ Implementado',
                'Configuración de horarios': '✅ Implementado',
                'Reglas por tipo de usuario': '✅ Implementado',
                'Disponibilidad tiempo real': '✅ Implementado',
                'Detección de conflictos': '✅ Implementado',
                'Actualizaciones de horario': '✅ Implementado',
                'Eliminación de horarios': '✅ Implementado',
                'Restricciones de permisos': '✅ Implementado'
            }
        });
        
        this.logger.success(`📋 Reporte generado: ${reportPath}`);
    }
}

// Ejecución del test si se llama directamente
if (require.main === module) {
    const tester = new BasicAvailabilityTester();
    tester.runAllTests()
        .then(() => {
            console.log('✅ Tests de disponibilidad básica completados');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en tests de disponibilidad básica:', error);
            process.exit(1);
        });
}

module.exports = BasicAvailabilityTester;
