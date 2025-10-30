import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AvailabilityController } from '../../infrastructure/controllers/availability.controller';
import { CreateCalendarIntegrationCommand } from '../../application/commands/create-calendar-integration.command';
import { SyncCalendarCommand } from '../../application/commands/sync-calendar.command';
import { GetCalendarIntegrationsQuery } from '../../application/queries/get-calendar-integrations.query';
import { GetAvailabilityWithConflictsQuery } from '../../application/queries/get-availability-with-conflicts.query';
import { CalendarProvider } from '../../../../libs/dto/availability/calendar-integration.dto';

/**
 * BDD Tests for RF-08: Calendar Integration
 * Tests calendar integration functionality using Given-When-Then pattern
 */
describe('RF-08: Calendar Integration Management (BDD)', () => {
  let controller: AvailabilityController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const mockCommandBus = {
      execute: jest.fn()
    };

    const mockQueryBus = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus }
      ]
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  describe('Scenario: Creating Google Calendar Integration', () => {
    it('should create Google Calendar integration with valid credentials', async () => {
      // GIVEN: Valid Google Calendar integration data
      const integrationData = {
        resourceId: 'classroom-a101',
        provider: CalendarProvider.GOOGLE,
        name: 'Main Conference Room Calendar',
        credentials: {
          clientId: 'google-client-id',
          clientSecret: 'google-client-secret',
          refreshToken: 'google-refresh-token'
        },
        calendarId: 'primary',
        syncInterval: 30,
        isActive: true
      };

      const expectedIntegration = {
        id: 'integration-123',
        resourceId: 'classroom-a101',
        provider: CalendarProvider.GOOGLE,
        name: 'Main Conference Room Calendar',
        calendarId: 'primary',
        syncInterval: 30,
        isActive: true,
        createdAt: new Date(),
        lastSyncAt: null
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedIntegration);

      // WHEN: Creating the calendar integration
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createCalendarIntegration(integrationData, mockUser);

      // THEN: Integration should be created successfully
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateCalendarIntegrationCommand)
      );
      expect(result).toEqual(expectedIntegration);
      expect(result.data.provider).toBe(CalendarProvider.GOOGLE);
      expect(result.data.isActive).toBe(true);
    });

    it('should create Outlook Calendar integration with valid credentials', async () => {
      // GIVEN: Valid Outlook Calendar integration data
      const integrationData = {
        resourceId: 'auditorium-main',
        provider: CalendarProvider.OUTLOOK,
        name: 'Main Auditorium Calendar',
        credentials: {
          clientId: 'outlook-client-id',
          clientSecret: 'outlook-client-secret',
          refreshToken: 'outlook-refresh-token'
        },
        calendarId: 'calendar-id-123',
        syncInterval: 15,
        isActive: true
      };

      const expectedIntegration = {
        id: 'integration-456',
        resourceId: 'auditorium-main',
        provider: CalendarProvider.OUTLOOK,
        name: 'Main Auditorium Calendar',
        calendarId: 'calendar-id-123',
        syncInterval: 15,
        isActive: true,
        createdAt: new Date(),
        lastSyncAt: null
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedIntegration);

      // WHEN: Creating the calendar integration
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createCalendarIntegration(integrationData, mockUser);

      // THEN: Integration should be created successfully
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateCalendarIntegrationCommand)
      );
      expect(result).toEqual(expectedIntegration);
      expect(result.data.provider).toBe(CalendarProvider.OUTLOOK);
      expect(result.data.syncInterval).toBe(15);
    });

    it('should create iCal feed integration', async () => {
      // GIVEN: Valid iCal feed integration data
      const integrationData = {
        resourceId: 'lab-computer-01',
        provider: CalendarProvider.ICAL,
        name: 'Computer Lab Calendar Feed',
        credentials: {
          url: 'https://university.edu/calendars/computer-lab.ics'
        },
        syncInterval: 60,
        isActive: true
      };

      const expectedIntegration = {
        id: 'integration-789',
        resourceId: 'lab-computer-01',
        provider: CalendarProvider.ICAL,
        name: 'Computer Lab Calendar Feed',
        syncInterval: 60,
        isActive: true,
        createdAt: new Date(),
        lastSyncAt: null
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedIntegration);

      // WHEN: Creating the calendar integration
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createCalendarIntegration(integrationData, mockUser);

      // THEN: Integration should be created successfully
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateCalendarIntegrationCommand)
      );
      expect(result).toEqual(expectedIntegration);
      expect(result.data.provider).toBe(CalendarProvider.ICAL);
    });
  });

  describe('Scenario: Synchronizing Calendar Events', () => {
    it('should sync calendar events successfully', async () => {
      // GIVEN: An existing calendar integration
      const integrationId = 'integration-123';
      const expectedSyncResult = {
        success: true,
        integrationId: 'integration-123',
        syncedAt: new Date(),
        message: 'Calendar synchronization completed successfully'
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedSyncResult);

      // WHEN: Triggering calendar synchronization
      const result = await controller.syncCalendarIntegration(integrationId);

      // THEN: Synchronization should complete successfully
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(SyncCalendarCommand)
      );
      expect(result.success).toBe(true);
      expect(result.integrationId).toBe(integrationId);
      expect(result.message).toContain('successfully');
    });

    it('should handle sync failures gracefully', async () => {
      // GIVEN: An integration that will fail to sync
      const integrationId = 'integration-invalid';
      const syncError = new Error('Failed to authenticate with calendar provider');

      (commandBus.execute as jest.Mock).mockRejectedValue(syncError);

      // WHEN: Attempting to sync the calendar
      // THEN: Should throw the appropriate error
      await expect(controller.syncCalendarIntegration(integrationId))
        .rejects.toThrow('Failed to authenticate with calendar provider');

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(SyncCalendarCommand)
      );
    });
  });

  describe('Scenario: Retrieving Calendar Integrations', () => {
    it('should retrieve all calendar integrations', async () => {
      // GIVEN: Multiple calendar integrations exist
      const expectedIntegrations = {
        integrations: [
          {
            id: 'integration-123',
            resourceId: 'classroom-a101',
            provider: CalendarProvider.GOOGLE,
            name: 'Google Calendar Integration',
            isActive: true,
            hasCredentials: true
          },
          {
            id: 'integration-456',
            resourceId: 'auditorium-main',
            provider: CalendarProvider.OUTLOOK,
            name: 'Outlook Calendar Integration',
            isActive: true,
            hasCredentials: true
          }
        ],
        total: 2,
        filters: {}
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedIntegrations);

      // WHEN: Retrieving all calendar integrations
      const result = await controller.getCalendarIntegrations();

      // THEN: Should return all integrations
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarIntegrationsQuery)
      );
      expect(result.data.integrations).toHaveLength(2);
      expect(result.data.total).toBe(2);
    });

    it('should filter integrations by resource ID', async () => {
      // GIVEN: Integrations filtered by resource ID
      const resourceId = 'classroom-a101';
      const expectedIntegrations = {
        integrations: [
          {
            id: 'integration-123',
            resourceId: 'classroom-a101',
            provider: CalendarProvider.GOOGLE,
            name: 'Google Calendar Integration',
            isActive: true,
            hasCredentials: true
          }
        ],
        total: 1,
        filters: { resourceId: 'classroom-a101' }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedIntegrations);

      // WHEN: Retrieving integrations for specific resource
      const result = await controller.getCalendarIntegrations(resourceId);

      // THEN: Should return filtered integrations
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarIntegrationsQuery)
      );
      expect(result.data.integrations).toHaveLength(1);
      expect(result.data.integrations[0].resourceId).toBe(resourceId);
    });

    it('should filter integrations by provider', async () => {
      // GIVEN: Integrations filtered by provider
      const provider = CalendarProvider.GOOGLE;
      const expectedIntegrations = {
        integrations: [
          {
            id: 'integration-123',
            resourceId: 'classroom-a101',
            provider: CalendarProvider.GOOGLE,
            name: 'Google Calendar Integration',
            isActive: true,
            hasCredentials: true
          }
        ],
        total: 1,
        filters: { provider: CalendarProvider.GOOGLE }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedIntegrations);

      // WHEN: Retrieving integrations for specific provider
      const result = await controller.getCalendarIntegrations(undefined, provider);

      // THEN: Should return filtered integrations
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarIntegrationsQuery)
      );
      expect(result.data.integrations).toHaveLength(1);
      expect(result.data.integrations[0].provider).toBe(provider);
    });
  });

  describe('Scenario: Checking Availability with Calendar Conflicts', () => {
    it('should return availability considering external calendar conflicts', async () => {
      // GIVEN: Resource with external calendar conflicts
      const resourceId = 'classroom-a101';
      const startDate = '2024-01-15T08:00:00Z';
      const endDate = '2024-01-15T18:00:00Z';

      const expectedAvailability = {
        resourceId: 'classroom-a101',
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        availableSlots: [
          {
            start: new Date('2024-01-15T08:00:00Z'),
            end: new Date('2024-01-15T10:00:00Z'),
            available: true
          },
          {
            start: new Date('2024-01-15T14:00:00Z'),
            end: new Date('2024-01-15T18:00:00Z'),
            available: true
          }
        ],
        conflicts: [
          {
            start: new Date('2024-01-15T10:00:00Z'),
            end: new Date('2024-01-15T14:00:00Z'),
            available: false,
            conflicts: [
              {
                type: 'calendar',
                source: 'external',
                title: 'External meeting from Google Calendar'
              }
            ]
          }
        ],
        summary: {
          totalSlots: 3,
          availableSlots: 2,
          conflictingSlots: 1,
          conflictSources: {
            internal: 0,
            external: 1,
            types: { calendar: 1 }
          }
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedAvailability);

      // WHEN: Checking availability with conflicts
      const result = await controller.getAvailabilityWithConflicts(
        resourceId,
        startDate,
        endDate,
        true
      );

      // THEN: Should return availability with conflict information
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAvailabilityWithConflictsQuery)
      );
      expect(result.data.resourceId).toBe(resourceId);
      expect(result.data.availableSlots).toHaveLength(2);
      expect(result.data.conflicts).toHaveLength(1);
      expect(result.data.summary.conflictSources.external).toBe(1);
    });

    it('should return availability without external conflicts when disabled', async () => {
      // GIVEN: Resource availability check without external conflicts
      const resourceId = 'classroom-a101';
      const startDate = '2024-01-15T08:00:00Z';
      const endDate = '2024-01-15T18:00:00Z';

      const expectedAvailability = {
        resourceId: 'classroom-a101',
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        availableSlots: [
          {
            start: new Date('2024-01-15T08:00:00Z'),
            end: new Date('2024-01-15T18:00:00Z'),
            available: true
          }
        ],
        conflicts: [],
        summary: {
          totalSlots: 1,
          availableSlots: 1,
          conflictingSlots: 0,
          conflictSources: {
            internal: 0,
            external: 0,
            types: {}
          }
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedAvailability);

      // WHEN: Checking availability without external conflicts
      const result = await controller.getAvailabilityWithConflicts(
        resourceId,
        startDate,
        endDate,
        false
      );

      // THEN: Should return availability without external conflicts
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAvailabilityWithConflictsQuery)
      );
      expect(result.data.conflicts).toHaveLength(0);
      expect(result.data.summary.conflictSources.external).toBe(0);
    });
  });

  describe('Scenario: Internal Calendar Integration', () => {
    it('should create internal calendar integration', async () => {
      // GIVEN: Internal calendar integration data
      const integrationData = {
        resourceId: 'meeting-room-b205',
        provider: CalendarProvider.INTERNAL,
        name: 'Internal Meeting Room Calendar',
        credentials: {},
        syncInterval: 5,
        isActive: true
      };

      const expectedIntegration = {
        id: 'integration-internal-001',
        resourceId: 'meeting-room-b205',
        provider: CalendarProvider.INTERNAL,
        name: 'Internal Meeting Room Calendar',
        syncInterval: 5,
        isActive: true,
        createdAt: new Date(),
        lastSyncAt: null
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedIntegration);

      // WHEN: Creating internal calendar integration
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createCalendarIntegration(integrationData, mockUser);

      // THEN: Integration should be created successfully
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateCalendarIntegrationCommand)
      );
      expect(result.data.provider).toBe(CalendarProvider.INTERNAL);
      expect(result.data.syncInterval).toBe(5);
    });
  });
});
