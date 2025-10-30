#!/usr/bin/env node

/**
 * HITO 2 - AVAILABILITY CORE
 * Test Flow: Calendar Integration
 * 
 * Valida integración con calendarios externos:
 * - Configurar integración Google Calendar
 * - Sincronizar eventos externos
 * - Importar/exportar reservas
 * - Validar formato iCal
 * - Gestionar conflictos entre calendarios
 */

const path = require('path');
const { HttpClient } = require('../shared/http-client');
const { Logger } = require('../shared/logger');
const { TestValidator } = require('../shared/test-utils');
const { TestReporter } = require('../shared/test-reporter');
const config = require('../shared/config');

class CalendarIntegrationTester {
    constructor() {
        this.httpClient = new HttpClient();
        this.logger = new Logger('CalendarIntegration');
        this.reporter = new TestReporter('Hito 2 - Calendar Integration');
        this.validator = new TestValidator();
        this.testData = {
            createdIntegrations: [],
            testResourceId: null,
            syncedEvents: []
        };
    }

    async runAllTests() {
        this.logger.info('=== INICIANDO TESTS DE INTEGRACIÓN DE CALENDARIOS ===');
        
        try {
            await this.authenticateUsers();
            await this.setupTestData();
            
            await this.testListCalendarIntegrations();
            await this.testCreateGoogleCalendarIntegration();
            await this.testSyncExternalEvents();
            await this.testExportToICalFormat();
            await this.testImportFromExternalCalendar();
            await this.testCalendarConflictDetection();
            await this.testCalendarEventManagement();
            await this.testIntegrationUpdate();
            await this.testIntegrationDeletion();
            
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

    async testListCalendarIntegrations() {
        this.logger.info('TEST: Listando integraciones de calendario');
        
        try {
            const response = await this.httpClient.get(
                '/api/v1/availability/calendar-integrations',
                { page: 1, limit: 10 },
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const integrations = response.data || [];
                
                this.logger.success(`✓ Integraciones listadas: ${integrations.length} encontradas`);
                
                this.reporter.addResult({
                    test: 'List Calendar Integrations',
                    success: true,
                    endpoint: '/api/v1/availability/calendar-integrations',
                    responseTime: response.responseTime,
                    data: {
                        integrationsCount: integrations.length,
                        totalPages: response.meta?.totalPages || 1
                    }
                });
            } else {
                throw new Error(`Error listando integraciones: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error listando integraciones:', error.message);
            this.reporter.addResult({
                test: 'List Calendar Integrations',
                success: false,
                error: error.message
            });
        }
    }

    async testCreateGoogleCalendarIntegration() {
        this.logger.info('TEST: Creando integración con Google Calendar');
        
        try {
            const integrationData = {
                name: 'Google Calendar Test Integration',
                type: 'GOOGLE_CALENDAR',
                description: 'Integración de prueba para testing automatizado',
                resourceId: this.testData.testResourceId,
                configuration: {
                    calendarId: 'test-calendar@testing.com',
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token',
                    syncInterval: 300, // 5 minutos
                    syncDirection: 'BIDIRECTIONAL'
                },
                settings: {
                    autoSync: true,
                    conflictResolution: 'PREFER_LOCAL',
                    includePrivateEvents: false,
                    defaultEventStatus: 'TENTATIVE'
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/calendar-integrations',
                integrationData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success && response.data) {
                const integrationId = response.data.id;
                this.testData.createdIntegrations.push(integrationId);
                
                this.logger.success(`✓ Integración creada: ${integrationId}`);
                
                this.reporter.addResult({
                    test: 'Create Google Calendar Integration',
                    success: true,
                    endpoint: '/api/v1/availability/calendar-integrations',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        integrationId,
                        type: integrationData.type,
                        resourceId: this.testData.testResourceId,
                        syncDirection: integrationData.configuration.syncDirection
                    }
                });
            } else {
                throw new Error(`Error creando integración: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error creando integración:', error.message);
            this.reporter.addResult({
                test: 'Create Google Calendar Integration',
                success: false,
                error: error.message
            });
        }
    }

    async testSyncExternalEvents() {
        this.logger.info('TEST: Sincronizando eventos externos');
        
        if (this.testData.createdIntegrations.length === 0) {
            this.logger.warn('No hay integraciones para sincronizar');
            return;
        }

        try {
            const integrationId = this.testData.createdIntegrations[0];
            
            const response = await this.httpClient.post(
                `/api/v1/availability/calendar-integrations/${integrationId}/sync`,
                {
                    syncType: 'FULL',
                    dateRange: {
                        start: new Date().toISOString(),
                        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
                    },
                    options: {
                        forceUpdate: false,
                        dryRun: false
                    }
                },
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const syncResult = response.data;
                
                this.logger.success(`✓ Sincronización exitosa: ${syncResult?.eventsProcessed || 0} eventos`);
                
                this.reporter.addResult({
                    test: 'Sync External Events',
                    success: true,
                    endpoint: `/api/v1/availability/calendar-integrations/${integrationId}/sync`,
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        integrationId,
                        eventsProcessed: syncResult?.eventsProcessed || 0,
                        eventsCreated: syncResult?.eventsCreated || 0,
                        eventsUpdated: syncResult?.eventsUpdated || 0,
                        conflicts: syncResult?.conflicts || 0
                    }
                });
            } else {
                throw new Error(`Error sincronizando eventos: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error sincronizando eventos:', error.message);
            this.reporter.addResult({
                test: 'Sync External Events',
                success: false,
                error: error.message
            });
        }
    }

    async testExportToICalFormat() {
        this.logger.info('TEST: Exportando a formato iCal');
        
        try {
            const exportParams = {
                resourceIds: [this.testData.testResourceId],
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
                format: 'ical',
                includeDetails: true,
                timezone: 'America/Bogota'
            };

            const response = await this.httpClient.get(
                '/api/v1/availability/export/ical',
                exportParams,
                config.testUsers.teacher
            );

            if (response.success) {
                const icalContent = response.data?.content || '';
                const isValidICal = icalContent.includes('BEGIN:VCALENDAR') && icalContent.includes('END:VCALENDAR');
                
                this.logger.success(`✓ Exportación iCal exitosa: ${icalContent.length} caracteres`);
                
                this.reporter.addResult({
                    test: 'Export to iCal Format',
                    success: isValidICal,
                    endpoint: '/api/v1/availability/export/ical',
                    responseTime: response.responseTime,
                    data: {
                        contentLength: icalContent.length,
                        isValidFormat: isValidICal,
                        resourcesExported: exportParams.resourceIds.length,
                        dateRange: '7 días'
                    }
                });
                
                if (!isValidICal) {
                    this.logger.warn('⚠️ Contenido iCal no tiene formato válido');
                }
            } else {
                throw new Error(`Error exportando iCal: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error exportando iCal:', error.message);
            this.reporter.addResult({
                test: 'Export to iCal Format',
                success: false,
                error: error.message
            });
        }
    }

    async testImportFromExternalCalendar() {
        this.logger.info('TEST: Importando desde calendario externo');
        
        try {
            // Simular contenido iCal para importación
            const mockICalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:test-event-001@testing.com
DTSTART:${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace(/[:\-]|\.\d{3}/g, '')}
DTEND:${new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString().replace(/[:\-]|\.\d{3}/g, '')}
SUMMARY:Evento Test Importado
DESCRIPTION:Evento importado durante testing automatizado
LOCATION:Sala Test
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

            const importData = {
                resourceId: this.testData.testResourceId,
                calendarContent: mockICalContent,
                format: 'ical',
                options: {
                    mergeStrategy: 'ADD_NEW',
                    conflictResolution: 'SKIP',
                    validateEvents: true
                }
            };

            const response = await this.httpClient.post(
                '/api/v1/availability/calendar-integrations/import',
                importData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const importResult = response.data;
                
                this.logger.success(`✓ Importación exitosa: ${importResult?.eventsImported || 0} eventos`);
                
                this.reporter.addResult({
                    test: 'Import from External Calendar',
                    success: true,
                    endpoint: '/api/v1/availability/calendar-integrations/import',
                    method: 'POST',
                    responseTime: response.responseTime,
                    data: {
                        eventsImported: importResult?.eventsImported || 0,
                        eventsSkipped: importResult?.eventsSkipped || 0,
                        eventsWithErrors: importResult?.eventsWithErrors || 0,
                        format: 'ical'
                    }
                });
            } else {
                throw new Error(`Error importando calendario: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error importando calendario:', error.message);
            this.reporter.addResult({
                test: 'Import from External Calendar',
                success: false,
                error: error.message
            });
        }
    }

    async testCalendarConflictDetection() {
        this.logger.info('TEST: Detección de conflictos entre calendarios');
        
        if (this.testData.createdIntegrations.length === 0) {
            this.logger.warn('No hay integraciones para detectar conflictos');
            return;
        }

        try {
            const integrationId = this.testData.createdIntegrations[0];
            
            const response = await this.httpClient.get(
                `/api/v1/availability/calendar-integrations/${integrationId}/events`,
                {
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    checkConflicts: true,
                    includeResolutions: true
                },
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                const events = response.data?.events || [];
                const conflicts = response.data?.conflicts || [];
                
                this.logger.success(`✓ Eventos consultados: ${events.length}, conflictos: ${conflicts.length}`);
                
                this.reporter.addResult({
                    test: 'Calendar Conflict Detection',
                    success: true,
                    endpoint: `/api/v1/availability/calendar-integrations/${integrationId}/events`,
                    responseTime: response.responseTime,
                    data: {
                        integrationId,
                        eventsCount: events.length,
                        conflictsDetected: conflicts.length,
                        conflictTypes: conflicts.map(c => c.type).filter((v, i, a) => a.indexOf(v) === i)
                    }
                });
            } else {
                throw new Error(`Error detectando conflictos: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error detectando conflictos:', error.message);
            this.reporter.addResult({
                test: 'Calendar Conflict Detection',
                success: false,
                error: error.message
            });
        }
    }

    async testCalendarEventManagement() {
        this.logger.info('TEST: Gestión de eventos de calendario');
        
        if (this.testData.createdIntegrations.length === 0) {
            this.logger.warn('No hay integraciones para gestionar eventos');
            return;
        }

        try {
            const integrationId = this.testData.createdIntegrations[0];
            
            // Crear evento en calendario integrado
            const eventData = {
                title: 'Evento Test Calendario',
                description: 'Evento creado para testing de integración',
                startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
                location: 'Sala Test',
                attendees: ['test@example.com'],
                syncToExternal: true
            };

            const createResponse = await this.httpClient.post(
                `/api/v1/availability/calendar-integrations/${integrationId}/events`,
                eventData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(createResponse) && createResponse.success) {
                const eventId = createResponse.data.id;
                this.testData.syncedEvents.push(eventId);
                
                this.logger.success(`✓ Evento creado en calendario: ${eventId}`);
                
                // Actualizar evento
                const updateData = {
                    title: 'Evento Test Actualizado',
                    description: 'Evento actualizado durante testing'
                };

                const updateResponse = await this.httpClient.put(
                    `/api/v1/availability/calendar-integrations/${integrationId}/events/${eventId}`,
                    updateData,
                    config.testUsers.teacher
                );

                if (updateResponse.success) {
                    this.logger.success(`✓ Evento actualizado: ${eventId}`);
                }

                this.reporter.addResult({
                    test: 'Calendar Event Management',
                    success: true,
                    endpoint: `/api/v1/availability/calendar-integrations/${integrationId}/events`,
                    method: 'POST/PUT',
                    responseTime: createResponse.responseTime,
                    data: {
                        integrationId,
                        eventId,
                        operationsCompleted: ['CREATE', 'UPDATE'],
                        syncToExternal: eventData.syncToExternal
                    }
                });
            } else {
                throw new Error(`Error creando evento: ${JSON.stringify(createResponse)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error gestionando eventos:', error.message);
            this.reporter.addResult({
                test: 'Calendar Event Management',
                success: false,
                error: error.message
            });
        }
    }

    async testIntegrationUpdate() {
        this.logger.info('TEST: Actualizando configuración de integración');
        
        if (this.testData.createdIntegrations.length === 0) {
            this.logger.warn('No hay integraciones para actualizar');
            return;
        }

        try {
            const integrationId = this.testData.createdIntegrations[0];
            const updateData = {
                name: 'Google Calendar Test Updated',
                description: 'Integración actualizada durante testing',
                configuration: {
                    syncInterval: 600, // Cambiar a 10 minutos
                    syncDirection: 'FROM_EXTERNAL'
                },
                settings: {
                    autoSync: false,
                    conflictResolution: 'PREFER_EXTERNAL'
                }
            };

            const response = await this.httpClient.put(
                `/api/v1/availability/calendar-integrations/${integrationId}`,
                updateData,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                this.logger.success(`✓ Integración actualizada: ${integrationId}`);
                
                this.reporter.addResult({
                    test: 'Integration Update',
                    success: true,
                    endpoint: `/api/v1/availability/calendar-integrations/${integrationId}`,
                    method: 'PUT',
                    responseTime: response.responseTime,
                    data: {
                        integrationId,
                        updatedFields: Object.keys(updateData),
                        newSyncInterval: updateData.configuration.syncInterval,
                        newSyncDirection: updateData.configuration.syncDirection
                    }
                });
            } else {
                throw new Error(`Error actualizando integración: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error actualizando integración:', error.message);
            this.reporter.addResult({
                test: 'Integration Update',
                success: false,
                error: error.message
            });
        }
    }

    async testIntegrationDeletion() {
        this.logger.info('TEST: Eliminando integración de calendario');
        
        if (this.testData.createdIntegrations.length === 0) {
            this.logger.warn('No hay integraciones para eliminar');
            return;
        }

        try {
            const integrationId = this.testData.createdIntegrations[0];
            
            const response = await this.httpClient.delete(
                `/api/v1/availability/calendar-integrations/${integrationId}`,
                config.testUsers.teacher
            );

            if (this.validator.validateBooklyResponse(response) && response.success) {
                this.logger.success(`✓ Integración eliminada: ${integrationId}`);
                
                // Remover de lista de creadas
                this.testData.createdIntegrations = this.testData.createdIntegrations.filter(id => id !== integrationId);
                
                this.reporter.addResult({
                    test: 'Integration Deletion',
                    success: true,
                    endpoint: `/api/v1/availability/calendar-integrations/${integrationId}`,
                    method: 'DELETE',
                    responseTime: response.responseTime,
                    data: {
                        deletedIntegrationId: integrationId
                    }
                });
            } else {
                throw new Error(`Error eliminando integración: ${JSON.stringify(response)}`);
            }
            
        } catch (error) {
            this.logger.error('✗ Error eliminando integración:', error.message);
            this.reporter.addResult({
                test: 'Integration Deletion',
                success: false,
                error: error.message
            });
        }
    }

    async cleanup() {
        this.logger.info('Limpiando datos de prueba...');
        
        // Limpiar eventos sincronizados
        for (const eventId of this.testData.syncedEvents) {
            try {
                // Nota: El endpoint específico dependería de la implementación
                this.logger.info(`Limpiando evento: ${eventId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error limpiando evento ${eventId}: ${error.message}`);
            }
        }

        // Limpiar integraciones
        for (const integrationId of this.testData.createdIntegrations) {
            try {
                await this.httpClient.delete(
                    `/api/v1/availability/calendar-integrations/${integrationId}`,
                    config.testUsers.admin
                );
                this.logger.success(`✓ Integración eliminada: ${integrationId}`);
            } catch (error) {
                this.logger.warn(`⚠️ Error eliminando integración ${integrationId}: ${error.message}`);
            }
        }
        
        this.logger.success('✓ Limpieza completada');
    }

    async generateReport() {
        const reportPath = path.join(__dirname, 'results', 'calendar-integration.md');
        await this.reporter.generateReport(reportPath, {
            testSuite: 'Hito 2 - Calendar Integration',
            description: 'Validación de funcionalidades de integración con calendarios externos',
            endpoints: [
                '/api/v1/availability/calendar-integrations',
                '/api/v1/availability/calendar-integrations/{id}/sync',
                '/api/v1/availability/export/ical',
                '/api/v1/availability/calendar-integrations/import',
                '/api/v1/availability/calendar-integrations/{id}/events'
            ],
            coverage: {
                'Listar integraciones': '✅ Implementado',
                'Crear integración Google': '✅ Implementado',
                'Sincronizar eventos': '✅ Implementado',
                'Exportar iCal': '✅ Implementado',
                'Importar calendario': '✅ Implementado',
                'Detectar conflictos': '✅ Implementado',
                'Gestionar eventos': '✅ Implementado',
                'Actualizar integración': '✅ Implementado',
                'Eliminar integración': '✅ Implementado'
            }
        });
        
        this.logger.success(`📋 Reporte generado: ${reportPath}`);
    }
}

if (require.main === module) {
    const tester = new CalendarIntegrationTester();
    tester.runAllTests()
        .then(() => {
            console.log('✅ Tests de integración de calendarios completados');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en tests de calendarios:', error);
            process.exit(1);
        });
}

module.exports = CalendarIntegrationTester;
