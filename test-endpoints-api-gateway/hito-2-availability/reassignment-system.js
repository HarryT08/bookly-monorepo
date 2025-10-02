#!/usr/bin/env node

/**
 * HITO 2 - AVAILABILITY CORE
 * Test Flow: Reassignment System
 * 
 * Valida sistema de reasignación de reservas:
 * - Crear solicitudes de reasignación
 * - Procesar reasignaciones automáticas
 * - Gestionar lista de espera
 * - Validar reglas de reasignación
 * - Notificaciones de cambios
 */

const path = require('path');
const { HttpClient } = require('../shared/http-client');
const { Logger } = require('../shared/logger');
const { TestValidator } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const config = require('../shared/config');

class ReassignmentSystemTester {
    constructor() {
        this.httpClient = new HttpClient();
        this.logger = new Logger('ReassignmentSystem');
        this.reporter = new TestReporter('Hito 2 - Reassignment System');
        this.validator = new TestValidator();
        this.testData = {
            createdRequests: [],
            testReservationId: null,
            testResourceId: null,
            waitingListEntries: []
        };
    }

    async runAllTests() {
        this.logger.info('=== INICIANDO TESTS DE SISTEMA DE REASIGNACIÓN ===');
        
        try {
            await this.authenticateUsers();
            await this.setupTestData();
            
            await this.testCreateReassignmentRequest();
            await this.testListReassignmentRequests();
            await this.testRespondToReassignmentRequest();
            await this.testProcessAutomaticReassignment();
            await this.testWaitingListManagement();
            await this.testReassignmentRulesValidation();
            await this.testEquivalentResourcesSearch();
            await this.testReassignmentNotifications();
            await this.testCancelReassignmentRequest();
            
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
            // Obtener recurso para pruebas
            const resourcesResponse = await this.httpClient.get('/api/v1/resources/resources', {}, config.testUsers.teacher);
            
            if (resourcesResponse.success && resourcesResponse.data?.length > 0) {
                this.testData.testResourceId = resourcesResponse.data[0].id;
                this.logger.success(`✓ Recurso para pruebas: ${resourcesResponse.data[0].name}`);
                
                // Crear reserva de prueba para reasignación
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
                title: 'Reserva para Test de Reasignación',
                description: 'Reserva que será reasignada durante testing',
                startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días
                endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
                attendees: 25,
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
            throw error;
        }
    }

    async testCreateReassignmentRequest() {
        this.logger.info('TEST: Creando solicitud de reasignación');
        
        if (!this.testData.testReservationId) {
            this.logger.warn('No hay reserva para reasignar');
            return;
        }

        try {
            const requestData = {
                reservationId: this.testData.testReservationId,
                reason: 'CONFLICT_RESOLUTION',
                description: 'Solicitud de reasignación por conflicto detectado durante testing',
                priority: 'HIGH',
                preferences: {
                    preferredResources: [],
                    timeFlexibility: 60, // 1 hora de flexibilidad
                    acceptEquivalentResources: true,
                    maxDistance: 100 // metros
                },
                requestedBy: config.testUsers.teacher.email,
                urgency: 'MEDIUM'
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reassignment-requests',
                requestData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success && response.data) {
                const requestId = response.data.id;
                this.testData.createdRequests.push(requestId);
                
                this.logger.success(`✓ Solicitud de reasignación creada: ${requestId}`);
                
                this.reporter.addResult({
                    test: 'Create Reassignment Request',
                    success: true,
                    endpoint: '/api/v1/availability/reassignment-requests',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        requestId,
                        reservationId: this.testData.testReservationId,
                        reason: requestData.reason,
                        priority: requestData.priority
                    }
                });
            } else {
                throw new Error(`Error creando solicitud: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error creando solicitud de reasignación:', error.message);
            this.reporter.addResult({
                test: 'Create Reassignment Request',
                success: false,
                error: error.message
            });
        }
    }

    async testListReassignmentRequests() {
        this.logger.info('TEST: Listando solicitudes de reasignación');
        
        try {
            const response = await this.httpClient.get(
                '/api/v1/availability/reassignment-requests',
                {
                    page: 1,
                    limit: 10,
                    status: 'PENDING',
                    priority: 'HIGH'
                },
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const requests = response.data || [];
                
                this.logger.success(`✓ Solicitudes listadas: ${requests.length} encontradas`);
                
                this.reporter.addResult({
                    test: 'List Reassignment Requests',
                    success: true,
                    endpoint: '/api/v1/availability/reassignment-requests',
                    responseTime: response.responseTime,
                    data: {
                        requestsCount: requests.length,
                        totalPages: response.meta?.totalPages || 1,
                        filters: ['status: PENDING', 'priority: HIGH']
                    }
                });
            } else {
                throw new Error(`Error listando solicitudes: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error listando solicitudes:', error.message);
            this.reporter.addResult({
                test: 'List Reassignment Requests',
                success: false,
                error: error.message
            });
        }
    }

    async testRespondToReassignmentRequest() {
        this.logger.info('TEST: Respondiendo a solicitud de reasignación');
        
        if (this.testData.createdRequests.length === 0) {
            this.logger.warn('No hay solicitudes para responder');
            return;
        }

        try {
            const requestId = this.testData.createdRequests[0];
            const responseData = {
                decision: 'APPROVE',
                comments: 'Solicitud aprobada durante testing automatizado',
                suggestedAlternatives: [],
                approvedBy: config.testUsers.admin.email,
                processImmediately: false
            };

            const response = await this.httpClient.put(
                `/api/v1/availability/reassignment-requests/${requestId}/respond`,
                responseData,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                this.logger.success(`✓ Respuesta enviada para solicitud: ${requestId}`);
                
                this.reporter.addResult({
                    test: 'Respond to Reassignment Request',
                    success: true,
                    endpoint: `/api/v1/availability/reassignment-requests/${requestId}/respond`,
                    method: 'PUT',
                    responseTime: response.responseTime,
                    data: {
                        requestId,
                        decision: responseData.decision,
                        approvedBy: responseData.approvedBy,
                        processImmediately: responseData.processImmediately
                    }
                });
            } else {
                throw new Error(`Error respondiendo solicitud: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error respondiendo solicitud:', error.message);
            this.reporter.addResult({
                test: 'Respond to Reassignment Request',
                success: false,
                error: error.message
            });
        }
    }

    async testProcessAutomaticReassignment() {
        this.logger.info('TEST: Procesando reasignación automática');
        
        if (this.testData.createdRequests.length === 0) {
            this.logger.warn('No hay solicitudes para procesar');
            return;
        }

        try {
            const requestId = this.testData.createdRequests[0];
            const processData = {
                strategy: 'AUTO_FIND_EQUIVALENT',
                criteria: {
                    sameType: true,
                    similarCapacity: 0.8,
                    maxTimeDeviation: 30, // 30 minutos
                    sameBuilding: false
                },
                options: {
                    notifyUsers: false, // Evitar notificaciones durante testing
                    updateCalendars: false,
                    createBackup: true
                }
            };

            const response = await this.httpClient.post(
                `/api/v1/availability/reassignment-requests/${requestId}/process`,
                processData,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const result = response.data;
                
                this.logger.success(`✓ Procesamiento automático completado: ${result?.status || 'UNKNOWN'}`);
                
                this.reporter.addResult({
                    test: 'Process Automatic Reassignment',
                    success: true,
                    endpoint: `/api/v1/availability/reassignment-requests/${requestId}/process`,
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        requestId,
                        strategy: processData.strategy,
                        resultStatus: result?.status,
                        alternativesFound: result?.alternativesFound || 0,
                        reassignmentCompleted: result?.completed || false
                    }
                });
            } else {
                throw new Error(`Error procesando reasignación: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error procesando reasignación:', error.message);
            this.reporter.addResult({
                test: 'Process Automatic Reassignment',
                success: false,
                error: error.message
            });
        }
    }

    async testWaitingListManagement() {
        this.logger.info('TEST: Gestionando lista de espera');
        
        try {
            // Agregar a lista de espera
            const waitingListData = {
                resourceId: this.testData.testResourceId,
                userEmail: config.testUsers.student.email,
                desiredStartTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                desiredEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                priority: 'NORMAL',
                flexibilityMinutes: 120,
                acceptAlternatives: true,
                purpose: 'ACADEMIC'
            };

            const addResponse = await this.httpClient.post(
                '/api/v1/availability/waiting-list',
                waitingListData,
                config.testUsers.student
            );

            if (addResponse.success && addResponse.data) {
                const entryId = addResponse.data.id;
                this.testData.waitingListEntries.push(entryId);
                
                this.logger.success(`✓ Entrada agregada a lista de espera: ${entryId}`);
            }

            // Listar lista de espera
            const listResponse = await this.httpClient.get(
                '/api/v1/availability/waiting-list',
                {
                    resourceId: this.testData.testResourceId,
                    status: 'ACTIVE'
                },
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(listResponse) && listResponse.success) {
                const entries = listResponse.data || [];
                
                this.logger.success(`✓ Lista de espera consultada: ${entries.length} entradas`);
                
                this.reporter.addResult({
                    test: 'Waiting List Management',
                    success: true,
                    endpoint: '/api/v1/availability/waiting-list',
                    method: 'POST/GET',
                    responseTime: listResponse.responseTime,
                    data: {
                        entriesAdded: 1,
                        totalEntries: entries.length,
                        resourceId: this.testData.testResourceId,
                        priority: waitingListData.priority
                    }
                });
            } else {
                throw new Error(`Error gestionando lista de espera: ${JSON.stringify(listResponse)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error gestionando lista de espera:', error.message);
            this.reporter.addResult({
                test: 'Waiting List Management',
                success: false,
                error: error.message
            });
        }
    }

    async testReassignmentRulesValidation() {
        this.logger.info('TEST: Validando reglas de reasignación');
        
        try {
            const rulesData = {
                resourceTypes: ['SALON', 'LABORATORIO'],
                timeConstraints: {
                    maxAdvanceBooking: 30, // días
                    minNoticeRequired: 24,  // horas
                    businessHoursOnly: true
                },
                userPermissions: {
                    allowSelfReassignment: true,
                    requireApproval: true,
                    maxReassignmentsPerWeek: 3
                },
                capacityRules: {
                    allowDowngrade: true,
                    maxCapacityReduction: 0.2, // 20%
                    allowUpgrade: true
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reassignment-requests/validate-rules',
                {
                    reservationId: this.testData.testReservationId,
                    rules: rulesData,
                    requestedBy: config.testUsers.teacher.email
                },
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const validation = response.data;
                
                this.logger.success(`✓ Reglas validadas: ${validation?.isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
                
                this.reporter.addResult({
                    test: 'Reassignment Rules Validation',
                    success: true,
                    endpoint: '/api/v1/availability/reassignment-requests/validate-rules',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        reservationId: this.testData.testReservationId,
                        isValid: validation?.isValid || false,
                        violatedRules: validation?.violations?.length || 0,
                        rulesChecked: Object.keys(rulesData).length
                    }
                });
            } else {
                throw new Error(`Error validando reglas: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error validando reglas:', error.message);
            this.reporter.addResult({
                test: 'Reassignment Rules Validation',
                success: false,
                error: error.message
            });
        }
    }

    async testEquivalentResourcesSearch() {
        this.logger.info('TEST: Buscando recursos equivalentes para reasignación');
        
        try {
            const searchParams = {
                baseResourceId: this.testData.testResourceId,
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
                equivalenceCriteria: {
                    sameType: true,
                    minimumCapacity: 20,
                    requiredFeatures: ['PROYECTOR'],
                    locationRadius: 200, // metros
                    timeFlexibility: 30   // minutos
                },
                options: {
                    includeUnavailable: false,
                    sortBy: 'SIMILARITY',
                    maxResults: 10
                }
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/reassignment-requests/find-equivalents',
                searchParams,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const equivalents = response.data?.resources || [];
                
                this.logger.success(`✓ Recursos equivalentes encontrados: ${equivalents.length}`);
                
                this.reporter.addResult({
                    test: 'Equivalent Resources Search',
                    success: true,
                    endpoint: '/api/v1/availability/reassignment-requests/find-equivalents',
                    responseTime: response.responseTime,
                    data: {
                        baseResourceId: this.testData.testResourceId,
                        equivalentsFound: equivalents.length,
                        searchCriteria: Object.keys(searchParams.equivalenceCriteria).length,
                        sortBy: searchParams.options.sortBy
                    }
                });
            } else {
                throw new Error(`Error buscando equivalentes: ${JSON.stringify(response)}`);
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

    async testReassignmentNotifications() {
        this.logger.info('TEST: Validando notificaciones de reasignación');
        
        if (this.testData.createdRequests.length === 0) {
            this.logger.warn('No hay solicitudes para notificar');
            return;
        }

        try {
            const requestId = this.testData.createdRequests[0];
            const notificationData = {
                requestId: requestId,
                notificationType: 'STATUS_UPDATE',
                recipients: [
                    config.testUsers.teacher.email,
                    config.testUsers.student.email
                ],
                message: 'Su solicitud de reasignación ha sido procesada',
                channels: ['EMAIL'],
                priority: 'NORMAL',
                includeDetails: true
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/reassignment-requests/notifications',
                notificationData,
                config.testUsers.admin
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const result = response.data;
                
                this.logger.success(`✓ Notificaciones enviadas: ${result?.sent || 0}/${result?.total || 0}`);
                
                this.reporter.addResult({
                    test: 'Reassignment Notifications',
                    success: true,
                    endpoint: '/api/v1/availability/reassignment-requests/notifications',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        requestId,
                        notificationsSent: result?.sent || 0,
                        notificationsTotal: result?.total || 0,
                        channels: notificationData.channels,
                        recipientsCount: notificationData.recipients.length
                    }
                });
            } else {
                throw new Error(`Error enviando notificaciones: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error enviando notificaciones:', error.message);
            this.reporter.addResult({
                test: 'Reassignment Notifications',
                success: false,
                error: error.message
            });
        }
    }

    async testCancelReassignmentRequest() {
        this.logger.info('TEST: Cancelando solicitud de reasignación');
        
        if (this.testData.createdRequests.length === 0) {
            this.logger.warn('No hay solicitudes para cancelar');
            return;
        }

        try {
            const requestId = this.testData.createdRequests[0];
            const cancelData = {
                reason: 'TESTING_COMPLETED',
                comments: 'Solicitud cancelada al finalizar testing automatizado',
                cancelledBy: config.testUsers.teacher.email,
                notifyUsers: false
            };

            const response = await this.httpClient.post(
                `/api/v1/availability/reassignment-requests/${requestId}/cancel`,
                cancelData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                this.logger.success(`✓ Solicitud cancelada: ${requestId}`);
                
                this.reporter.addResult({
                    test: 'Cancel Reassignment Request',
                    success: true,
                    endpoint: `/api/v1/availability/reassignment-requests/${requestId}/cancel`,
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        requestId,
                        reason: cancelData.reason,
                        cancelledBy: cancelData.cancelledBy,
                        notifyUsers: cancelData.notifyUsers
                    }
                });
            } else {
                throw new Error(`Error cancelando solicitud: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error cancelando solicitud:', error.message);
            this.reporter.addResult({
                test: 'Cancel Reassignment Request',
                success: false,
                error: error.message
            });
        }
    }

    async cleanup() {
        this.logger.info('Limpiando datos de prueba...');
        
        // Limpiar entradas de lista de espera
        for (const entryId of this.testData.waitingListEntries) {
            try {
                await this.httpClient.delete(
                    `/api/v1/availability/waiting-list/${entryId}`,
                    config.testUsers.admin
                );
                this.logger.success(`✓ Entrada de lista eliminada: ${entryId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error eliminando entrada ${entryId}: ${error.message}`);
            }
        }

        // Limpiar solicitudes de reasignación
        for (const requestId of this.testData.createdRequests) {
            try {
                await this.httpClient.delete(
                    `/api/v1/availability/reassignment-requests/${requestId}`,
                    config.testUsers.admin
                );
                this.logger.success(`✓ Solicitud eliminada: ${requestId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error eliminando solicitud ${requestId}: ${error.message}`);
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
        const reportPath = path.join(__dirname, 'results', 'reassignment-system.md');
        await this.reporter.generateReport(reportPath, {
            testSuite: 'Hito 2 - Reassignment System',
            description: 'Validación del sistema completo de reasignación de reservas y gestión de lista de espera',
            endpoints: [
                '/api/v1/availability/reassignment-requests',
                '/api/v1/availability/reassignment-requests/{id}/respond',
                '/api/v1/availability/reassignment-requests/{id}/process',
                '/api/v1/availability/waiting-list',
                '/api/v1/availability/reassignment-requests/find-equivalents',
                '/api/v1/availability/reassignment-requests/notifications'
            ],
            coverage: {
                'Crear solicitudes': '✅ Implementado',
                'Listar solicitudes': '✅ Implementado',
                'Responder solicitudes': '✅ Implementado',
                'Procesar automático': '✅ Implementado',
                'Lista de espera': '✅ Implementado',
                'Validar reglas': '✅ Implementado',
                'Buscar equivalentes': '✅ Implementado',
                'Enviar notificaciones': '✅ Implementado',
                'Cancelar solicitudes': '✅ Implementado'
            }
        });
        
        this.logger.success(`📋 Reporte generado: ${reportPath}`);
    }
}

if (require.main === module) {
    const tester = new ReassignmentSystemTester();
    tester.runAllTests()
        .then(() => {
            console.log('✅ Tests de sistema de reasignación completados');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en tests de reasignación:', error);
            process.exit(1);
        });
}

module.exports = ReassignmentSystemTester;
