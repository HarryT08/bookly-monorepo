#!/usr/bin/env node

/**
 * HITO 2 - AVAILABILITY CORE
 * Test Flow: Reservations CRUD Operations
 * 
 * Valida operaciones CRUD completas de reservas:
 * - Crear reservas simples y recurrentes
 * - Consultar reservas por usuario y recurso
 * - Modificar reservas existentes
 * - Cancelar reservas con diferentes estados
 * - Validar conflictos de horarios
 */

const path = require('path');
const { HttpClient } = require('../shared/http-client');
const { Logger } = require('../shared/logger');
const { TestValidator } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const config = require('../shared/config');

class ReservationsCrudTester {
    constructor() {
        this.httpClient = new HttpClient();
        this.logger = new Logger('ReservationsCRUD');
        this.reporter = new TestReporter('Hito 2 - Reservations CRUD');
        this.validator = new TestValidator();
        this.testData = {
            createdReservations: [],
            testResourceId: null,
            testUserId: null
        };
    }

    async runAllTests() {
        this.logger.info('=== INICIANDO TESTS DE RESERVAS CRUD ===');
        
        try {
            await this.authenticateUsers();
            await this.setupTestData();
            
            // Tests principales
            await this.testCreateSimpleReservation();
            await this.testCreateRecurringReservation();
            await this.testListReservations();
            await this.testGetReservationById();
            await this.testUpdateReservation();
            await this.testReservationConflicts();
            await this.testCancelReservation();
            await this.testDeleteReservation();
            await this.testPermissionValidation();
            
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
                this.testData.testResourceId = response.data[0].id;
                this.logger.success(`✓ Recurso para pruebas: ${response.data[0].name}`);
            } else {
                throw new Error('No se encontraron recursos para pruebas');
            }
        } catch (error) {
            this.logger.error('Error configurando datos:', error.message);
            throw error;
        }
    }

    async testCreateSimpleReservation() {
        this.logger.info('TEST: Creando reserva simple');
        
        try {
            const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas desde ahora
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora duración
            
            const reservationData = {
                resourceId: this.testData.testResourceId,
                title: 'Reserva Simple Test',
                description: 'Reserva creada durante testing automatizado',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                attendees: 15,
                purpose: 'ACADEMIC',
                recurrent: false
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reservations',
                reservationData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const reservationId = response.data.id;
                this.testData.createdReservations.push(reservationId);
                
                this.logger.success(`✓ Reserva creada: ${reservationId}`);
                
                this.reporter.addResult({
                    test: 'Create Simple Reservation',
                    success: true,
                    endpoint: '/api/v1/availability/reservations',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: { reservationId, resourceId: this.testData.testResourceId }
                });
            } else {
                throw new Error(`Error creando reserva: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error creando reserva simple:', error.message);
            this.reporter.addResult({
                test: 'Create Simple Reservation',
                success: false,
                error: error.message
            });
        }
    }

    async testCreateRecurringReservation() {
        this.logger.info('TEST: Creando reserva recurrente');
        
        try {
            const startTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 semana desde ahora
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 horas duración
            
            const reservationData = {
                resourceId: this.testData.testResourceId,
                title: 'Clase Semanal de Sistemas',
                description: 'Clase recurrente todos los martes',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                attendees: 25,
                purpose: 'ACADEMIC',
                recurrent: true,
                recurrencePattern: {
                    type: 'WEEKLY',
                    interval: 1,
                    daysOfWeek: [2], // Martes
                    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 2 meses
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reservations',
                reservationData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const reservationId = response.data.id;
                this.testData.createdReservations.push(reservationId);
                
                this.logger.success(`✓ Reserva recurrente creada: ${reservationId}`);
                
                this.reporter.addResult({
                    test: 'Create Recurring Reservation',
                    success: true,
                    endpoint: '/api/v1/availability/reservations',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: { 
                        reservationId, 
                        type: 'RECURRING',
                        pattern: reservationData.recurrencePattern.type
                    }
                });
            } else {
                throw new Error(`Error creando reserva recurrente: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error creando reserva recurrente:', error.message);
            this.reporter.addResult({
                test: 'Create Recurring Reservation',
                success: false,
                error: error.message
            });
        }
    }

    async testListReservations() {
        this.logger.info('TEST: Listando reservas');
        
        try {
            const response = await this.httpClient.get(
                '/api/v1/availability/reservations',
                { 
                    page: 1,
                    limit: 10,
                    status: 'CONFIRMED'
                },
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const reservations = response.data || [];
                
                this.logger.success(`✓ Reservas listadas: ${reservations.length} encontradas`);
                
                this.reporter.addResult({
                    test: 'List Reservations',
                    success: true,
                    endpoint: '/api/v1/availability/reservations',
                    method: 'GET',
                    responseTime: response.responseTime,
                    data: { 
                        reservationsCount: reservations.length,
                        totalPages: response.meta?.totalPages || 1
                    }
                });
            } else {
                throw new Error(`Error listando reservas: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error listando reservas:', error.message);
            this.reporter.addResult({
                test: 'List Reservations',
                success: false,
                error: error.message
            });
        }
    }

    async testGetReservationById() {
        this.logger.info('TEST: Consultando reserva por ID');
        
        if (this.testData.createdReservations.length === 0) {
            this.logger.warn('No hay reservas creadas para consultar');
            return;
        }

        try {
            const reservationId = this.testData.createdReservations[0];
            
            const response = await this.httpClient.get(
                `/api/v1/availability/reservations/${reservationId}`,
                {},
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success && response.data) {
                this.logger.success(`✓ Reserva consultada: ${response.data.title}`);
                
                this.reporter.addResult({
                    test: 'Get Reservation By ID',
                    success: true,
                    endpoint: `/api/v1/availability/reservations/${reservationId}`,
                    method: 'GET',
                    responseTime: response.responseTime,
                    data: { 
                        reservationId,
                        title: response.data.title,
                        status: response.data.status
                    }
                });
            } else {
                throw new Error(`Error consultando reserva: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error consultando reserva:', error.message);
            this.reporter.addResult({
                test: 'Get Reservation By ID',
                success: false,
                error: error.message
            });
        }
    }

    async testUpdateReservation() {
        this.logger.info('TEST: Actualizando reserva');
        
        if (this.testData.createdReservations.length === 0) {
            this.logger.warn('No hay reservas para actualizar');
            return;
        }

        try {
            const reservationId = this.testData.createdReservations[0];
            const updateData = {
                title: 'Reserva Actualizada Test',
                description: 'Descripción actualizada durante testing',
                attendees: 20
            };

            const response = await this.httpClient.put(
                `/api/v1/availability/reservations/${reservationId}`,
                updateData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                this.logger.success(`✓ Reserva actualizada: ${reservationId}`);
                
                this.reporter.addResult({
                    test: 'Update Reservation',
                    success: true,
                    endpoint: `/api/v1/availability/reservations/${reservationId}`,
                    method: 'PUT',
                    responseTime: response.responseTime,
                    data: { 
                        reservationId,
                        updatedFields: Object.keys(updateData)
                    }
                });
            } else {
                throw new Error(`Error actualizando reserva: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error actualizando reserva:', error.message);
            this.reporter.addResult({
                test: 'Update Reservation',
                success: false,
                error: error.message
            });
        }
    }

    async testReservationConflicts() {
        this.logger.info('TEST: Validando conflictos de reservas');
        
        try {
            // Intentar crear reserva en horario ocupado
            const existingStart = new Date(Date.now() + 3 * 60 * 60 * 1000);
            const existingEnd = new Date(existingStart.getTime() + 60 * 60 * 1000);
            
            const conflictData = {
                resourceId: this.testData.testResourceId,
                title: 'Reserva Conflictiva',
                startTime: existingStart.toISOString(),
                endTime: existingEnd.toISOString(),
                attendees: 10
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reservations',
                conflictData,
                config.testUsers.student
            );

            // Esperamos que falle por conflicto o que se detecte el conflicto
            if (!response.success && response.errors?.some(e => e.includes('conflict'))) {
                this.logger.success('✓ Conflicto de reserva detectado correctamente');
                
                this.reporter.addResult({
                    test: 'Reservation Conflict Validation',
                    success: true,
                    endpoint: '/api/v1/availability/reservations',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: { 
                        conflictDetected: true,
                        errorType: 'TIME_CONFLICT'
                    }
                });
            } else if (response.success) {
                // Si se creó, verificar que el sistema detecte conflictos
                this.testData.createdReservations.push(response.data.id);
                this.logger.warn('⚠️ Reserva conflictiva fue creada - verificar lógica de conflictos');
                
                this.reporter.addResult({
                    test: 'Reservation Conflict Validation',
                    success: false,
                    error: 'Reserva conflictiva fue permitida cuando no debería'
                });
            } else {
                throw new Error(`Respuesta inesperada: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error validando conflictos:', error.message);
            this.reporter.addResult({
                test: 'Reservation Conflict Validation',
                success: false,
                error: error.message
            });
        }
    }

    async testCancelReservation() {
        this.logger.info('TEST: Cancelando reserva');
        
        if (this.testData.createdReservations.length === 0) {
            this.logger.warn('No hay reservas para cancelar');
            return;
        }

        try {
            const reservationId = this.testData.createdReservations[0];
            
            const response = await this.httpClient.post(
                `/api/v1/availability/reservations/${reservationId}/cancel`,
                { reason: 'Cancelación por testing automatizado' },
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                this.logger.success(`✓ Reserva cancelada: ${reservationId}`);
                
                this.reporter.addResult({
                    test: 'Cancel Reservation',
                    success: true,
                    endpoint: `/api/v1/availability/reservations/${reservationId}/cancel`,
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: { 
                        reservationId,
                        newStatus: 'CANCELLED'
                    }
                });
            } else {
                throw new Error(`Error cancelando reserva: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error cancelando reserva:', error.message);
            this.reporter.addResult({
                test: 'Cancel Reservation',
                success: false,
                error: error.message
            });
        }
    }

    async testDeleteReservation() {
        this.logger.info('TEST: Eliminando reserva');
        
        if (this.testData.createdReservations.length < 2) {
            this.logger.warn('Necesitas al menos 2 reservas para test de eliminación');
            return;
        }

        try {
            const reservationId = this.testData.createdReservations[1];
            
            const response = await this.httpClient.delete(
                `/api/v1/availability/reservations/${reservationId}`,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                this.logger.success(`✓ Reserva eliminada: ${reservationId}`);
                
                // Remover de lista de creadas
                this.testData.createdReservations = this.testData.createdReservations.filter(id => id !== reservationId);
                
                this.reporter.addResult({
                    test: 'Delete Reservation',
                    success: true,
                    endpoint: `/api/v1/availability/reservations/${reservationId}`,
                    method: 'DELETE',
                    responseTime: response.responseTime,
                    data: { reservationId }
                });
            } else {
                throw new Error(`Error eliminando reserva: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error eliminando reserva:', error.message);
            this.reporter.addResult({
                test: 'Delete Reservation',
                success: false,
                error: error.message
            });
        }
    }

    async testPermissionValidation() {
        this.logger.info('TEST: Validando permisos de reservas');
        
        try {
            // Estudiante intentando modificar reserva de docente
            if (this.testData.createdReservations.length > 0) {
                const reservationId = this.testData.createdReservations[0];
                
                const response = await this.httpClient.put(
                    `/api/v1/availability/reservations/${reservationId}`,
                    { title: 'Modificación No Autorizada' },
                    config.testUsers.student
                );

                if (!response.success && (response.status === 403 || response.status === 401)) {
                    this.logger.success('✓ Restricción de permisos funcionando');
                    
                    this.reporter.addResult({
                        test: 'Permission Validation',
                        success: true,
                        endpoint: `/api/v1/availability/reservations/${reservationId}`,
                        method: 'PUT',
                        responseTime: response.responseTime,
                        data: { 
                            expectedStatus: 403,
                            actualStatus: response.status,
                            userRole: 'STUDENT'
                        }
                    });
                } else {
                    throw new Error(`Estudiante pudo modificar reserva cuando no debería`);
                }
            }
            
        } catch (error) {
            this.logger.error('✗ Error validando permisos:', error.message);
            this.reporter.addResult({
                test: 'Permission Validation',
                success: false,
                error: error.message
            });
        }
    }

    async cleanup() {
        this.logger.info('Limpiando reservas de prueba...');
        
        for (const reservationId of this.testData.createdReservations) {
            try {
                await this.httpClient.delete(
                    `/api/v1/availability/reservations/${reservationId}`,
                    config.testUsers.admin
                );
                this.logger.success(`✓ Reserva eliminada: ${reservationId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error eliminando reserva ${reservationId}: ${error.message}`);
            }
        }
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'results', 'reservations-crud.md');
        await this.reporter.generateReport(reportPath, {
            testSuite: 'Hito 2 - Reservations CRUD',
            description: 'Validación completa de operaciones CRUD para reservas',
            endpoints: [
                '/api/v1/availability/reservations',
                '/api/v1/availability/reservations/{id}',
                '/api/v1/availability/reservations/{id}/cancel'
            ],
            coverage: {
                'Crear reserva simple': '✅ Implementado',
                'Crear reserva recurrente': '✅ Implementado',
                'Listar reservas': '✅ Implementado',
                'Consultar por ID': '✅ Implementado',
                'Actualizar reserva': '✅ Implementado',
                'Validar conflictos': '✅ Implementado',
                'Cancelar reserva': '✅ Implementado',
                'Eliminar reserva': '✅ Implementado',
                'Validar permisos': '✅ Implementado'
            }
        });
        
        this.logger.success(`📋 Reporte generado: ${reportPath}`);
    }
}

if (require.main === module) {
    const tester = new ReservationsCrudTester();
    tester.runAllTests()
        .then(() => {
            console.log('✅ Tests de reservas CRUD completados');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en tests de reservas:', error);
            process.exit(1);
        });
}

module.exports = ReservationsCrudTester;
