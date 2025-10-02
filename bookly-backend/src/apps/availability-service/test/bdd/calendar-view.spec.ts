import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AvailabilityController } from '../../infrastructure/controllers/availability.controller';
import { GetCalendarViewQuery } from '../../application/queries/get-calendar-view.query';
import { CalendarViewType, EventType, EventStatus } from '../../../../libs/dto/availability/calendar-view.dto';

/**
 * BDD Tests for RF-10: Calendar View
 * Tests calendar visualization functionality using Given-When-Then pattern
 */
describe('RF-10: Calendar View Management (BDD)', () => {
  let controller: AvailabilityController;
  let queryBus: jest.Mocked<QueryBus>;
  let commandBus: jest.Mocked<CommandBus>;

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

  describe('Scenario: Monthly Calendar View', () => {
    it('should display monthly calendar view with all event types', async () => {
      // GIVEN: A resource with various events in January 2024
      const resourceId = 'classroom-a101';
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';

      const expectedCalendarView = {
        events: [
          {
            id: 'reservation-123',
            title: 'Mathematics Class',
            description: 'Advanced calculus session',
            startDate: new Date('2024-01-15T10:00:00Z'),
            endDate: new Date('2024-01-15T12:00:00Z'),
            type: EventType.RESERVATION,
            status: EventStatus.CONFIRMED,
            resourceId: 'classroom-a101',
            userId: 'prof-martinez',
            isAllDay: false,
            color: '#3498db',
            editable: false
          },
          {
            id: 'schedule-456',
            title: 'Regular Class Schedule',
            description: 'Daily class schedule',
            startDate: new Date('2024-01-16T08:00:00Z'),
            endDate: new Date('2024-01-16T18:00:00Z'),
            type: EventType.SCHEDULE,
            status: EventStatus.CONFIRMED,
            resourceId: 'classroom-a101',
            isAllDay: false,
            color: '#2ecc71',
            editable: false
          },
          {
            id: 'maintenance-789',
            title: 'Equipment Maintenance',
            description: 'Scheduled maintenance of projector',
            startDate: new Date('2024-01-20T07:00:00Z'),
            endDate: new Date('2024-01-20T09:00:00Z'),
            type: EventType.MAINTENANCE,
            status: EventStatus.CONFIRMED,
            resourceId: 'classroom-a101',
            isAllDay: false,
            color: '#e74c3c',
            editable: false
          },
          {
            id: 'external-101112',
            title: 'External Meeting',
            description: 'Meeting from Google Calendar',
            startDate: new Date('2024-01-18T14:00:00Z'),
            endDate: new Date('2024-01-18T16:00:00Z'),
            type: EventType.EXTERNAL_CALENDAR,
            status: EventStatus.CONFIRMED,
            resourceId: 'classroom-a101',
            isAllDay: false,
            color: '#9b59b6',
            editable: false
          }
        ],
        view: {
          type: CalendarViewType.MONTH,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          resourceId: 'classroom-a101'
        },
        summary: {
          totalEvents: 4,
          reservations: 1,
          availableSlots: 0,
          conflicts: 0,
          eventsByType: {
            [EventType.RESERVATION]: 1,
            [EventType.SCHEDULE]: 1,
            [EventType.MAINTENANCE]: 1,
            [EventType.EXTERNAL_CALENDAR]: 1,
            [EventType.AVAILABILITY]: 0
          }
        },
        resource: {
          id: 'classroom-a101',
          name: 'Classroom A101',
          type: 'CLASSROOM',
          capacity: 30
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedCalendarView);

      // WHEN: Requesting monthly calendar view
      const result = await controller.getCalendarView(
        resourceId,
        startDate,
        endDate,
        CalendarViewType.MONTH
      );

      // THEN: Should return complete calendar view with all event types
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarViewQuery)
      );
      expect(result.data.view.type).toBe(CalendarViewType.MONTH);
      expect(result.data.summary.totalEvents).toBeGreaterThan(0);
      expect(result.data.events).toHaveLength(result.data.summary.totalEvents);
      expect(result.data.events.every(e => 
        e.resourceId === resourceId
      )).toBe(true);
      // Verify event types are present
      const eventTypes = result.data.events.map(e => e.type);
      expect(eventTypes).toContain(EventType.RESERVATION);
      expect(eventTypes).toContain(EventType.SCHEDULE);
      expect(eventTypes).toContain(EventType.MAINTENANCE);
      expect(eventTypes).toContain(EventType.EXTERNAL_CALENDAR);
    });

    it('should display weekly calendar view with filtered events', async () => {
      // GIVEN: A weekly view request with only reservations and schedules
      const resourceId = 'auditorium-main';
      const startDate = '2024-01-15T00:00:00Z';
      const endDate = '2024-01-21T23:59:59Z';
      const eventTypes = [EventType.RESERVATION, EventType.SCHEDULE];

      const expectedCalendarView = {
        events: [
          {
            id: 'reservation-456',
            title: 'Conference Presentation',
            startDate: new Date('2024-01-16T14:00:00Z'),
            endDate: new Date('2024-01-16T16:00:00Z'),
            type: EventType.RESERVATION,
            status: EventStatus.CONFIRMED,
            resourceId: 'auditorium-main',
            color: '#3498db'
          },
          {
            id: 'schedule-789',
            title: 'Regular Events Schedule',
            startDate: new Date('2024-01-17T09:00:00Z'),
            endDate: new Date('2024-01-17T17:00:00Z'),
            type: EventType.SCHEDULE,
            status: EventStatus.CONFIRMED,
            resourceId: 'auditorium-main',
            color: '#2ecc71'
          }
        ],
        view: {
          type: CalendarViewType.WEEK,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          resourceId: 'auditorium-main'
        },
        summary: {
          totalEvents: 2,
          reservations: 1,
          availableSlots: 0,
          conflicts: 0,
          eventsByType: {
            [EventType.RESERVATION]: 1,
            [EventType.SCHEDULE]: 1,
            [EventType.MAINTENANCE]: 0,
            [EventType.EXTERNAL_CALENDAR]: 0,
            [EventType.AVAILABILITY]: 0
          }
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedCalendarView);

      // WHEN: Requesting weekly view with filtered event types
      const result = await controller.getCalendarView(
        resourceId,
        startDate,
        endDate,
        CalendarViewType.WEEK,
        eventTypes
      );

      // THEN: Should return filtered calendar view
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarViewQuery)
      );
      expect(result.data.view.type).toBe(CalendarViewType.WEEK);
      expect(result.data.events).toHaveLength(2);
      expect(result.data.events.every(e => 
        e.type === EventType.RESERVATION || e.type === EventType.SCHEDULE
      )).toBe(true);
    });

    it('should display daily calendar view with availability slots', async () => {
      // GIVEN: A daily view request including availability
      const resourceId = 'meeting-room-b205';
      const startDate = '2024-01-15T00:00:00Z';
      const endDate = '2024-01-15T23:59:59Z';

      const expectedCalendarView = {
        events: [
          {
            id: 'reservation-321',
            title: 'Team Meeting',
            startDate: new Date('2024-01-15T10:00:00Z'),
            endDate: new Date('2024-01-15T11:00:00Z'),
            type: EventType.RESERVATION,
            status: EventStatus.CONFIRMED,
            resourceId: 'meeting-room-b205',
            color: '#3498db'
          },
          {
            id: 'availability-morning',
            title: 'Available',
            startDate: new Date('2024-01-15T08:00:00Z'),
            endDate: new Date('2024-01-15T10:00:00Z'),
            type: EventType.AVAILABILITY,
            status: EventStatus.CONFIRMED,
            resourceId: 'meeting-room-b205',
            color: '#95a5a6',
            editable: true
          },
          {
            id: 'availability-afternoon',
            title: 'Available',
            startDate: new Date('2024-01-15T11:00:00Z'),
            endDate: new Date('2024-01-15T18:00:00Z'),
            type: EventType.AVAILABILITY,
            status: EventStatus.CONFIRMED,
            resourceId: 'meeting-room-b205',
            color: '#95a5a6',
            editable: true
          }
        ],
        view: {
          type: CalendarViewType.DAY,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          resourceId: 'meeting-room-b205'
        },
        summary: {
          totalEvents: 3,
          reservations: 1,
          availableSlots: 2,
          conflicts: 0,
          eventsByType: {
            [EventType.RESERVATION]: 1,
            [EventType.SCHEDULE]: 0,
            [EventType.MAINTENANCE]: 0,
            [EventType.EXTERNAL_CALENDAR]: 0,
            [EventType.AVAILABILITY]: 2
          }
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedCalendarView);

      // WHEN: Requesting daily view with availability
      const result = await controller.getCalendarView(
        resourceId,
        startDate,
        endDate,
        CalendarViewType.DAY,
        undefined, // All event types
        true // Include availability
      );

      // THEN: Should return daily view with availability slots
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarViewQuery)
      );
      expect(result.data.view.type).toBe(CalendarViewType.DAY);
      expect(result.data.summary.availableSlots).toBe(2);
      expect(result.data.events.filter(e => e.type === EventType.AVAILABILITY)).toHaveLength(2);
      expect(result.data.events.filter(e => e.editable)).toHaveLength(2); // Availability slots are editable
    });
  });

  describe('Scenario: Multi-Resource Calendar View', () => {
    it('should display calendar view for all resources', async () => {
      // GIVEN: A calendar view request without specific resource
      const startDate = '2024-01-15T00:00:00Z';
      const endDate = '2024-01-15T23:59:59Z';

      const expectedCalendarView = {
        events: [
          {
            id: 'reservation-multi-1',
            title: 'Physics Lab',
            resourceId: 'lab-physics-01',
            type: EventType.RESERVATION,
            startDate: new Date('2024-01-15T10:00:00Z'),
            endDate: new Date('2024-01-15T12:00:00Z')
          },
          {
            id: 'reservation-multi-2',
            title: 'Chemistry Lab',
            resourceId: 'lab-chemistry-02',
            type: EventType.RESERVATION,
            startDate: new Date('2024-01-15T14:00:00Z'),
            endDate: new Date('2024-01-15T16:00:00Z')
          },
          {
            id: 'maintenance-multi-1',
            title: 'Equipment Check',
            resourceId: 'auditorium-main',
            type: EventType.MAINTENANCE,
            startDate: new Date('2024-01-15T08:00:00Z'),
            endDate: new Date('2024-01-15T09:00:00Z')
          }
        ],
        view: {
          type: CalendarViewType.DAY,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          resourceId: undefined
        },
        summary: {
          totalEvents: 3,
          reservations: 2,
          availableSlots: 0,
          conflicts: 0,
          eventsByType: {
            [EventType.RESERVATION]: 2,
            [EventType.SCHEDULE]: 0,
            [EventType.MAINTENANCE]: 1,
            [EventType.EXTERNAL_CALENDAR]: 0,
            [EventType.AVAILABILITY]: 0
          }
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedCalendarView);

      // WHEN: Requesting calendar view for all resources
      const result = await controller.getCalendarView(
        undefined, // No specific resource
        startDate,
        endDate,
        CalendarViewType.DAY
      );

      // THEN: Should return events from multiple resources
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarViewQuery)
      );
      expect(result.data.view.resourceId).toBeUndefined();
      expect(result.data.events).toHaveLength(3);
      
      // Verify events from different resources
      const resourceIds = [...new Set(result.data.events.map(e => e.resourceId))];
      expect(resourceIds).toHaveLength(3);
      expect(resourceIds).toContain('lab-physics-01');
      expect(resourceIds).toContain('lab-chemistry-02');
      expect(resourceIds).toContain('auditorium-main');
    });
  });

  describe('Scenario: Personalized Calendar View', () => {
    it('should display personalized calendar view for specific user', async () => {
      // GIVEN: A calendar view request for specific user
      const userId = 'prof-martinez';
      const startDate = '2024-01-15T00:00:00Z';
      const endDate = '2024-01-21T23:59:59Z';

      const expectedCalendarView = {
        events: [
          {
            id: 'reservation-user-1',
            title: 'My Mathematics Class',
            userId: 'prof-martinez',
            resourceId: 'classroom-a101',
            type: EventType.RESERVATION,
            status: EventStatus.CONFIRMED,
            editable: true, // User can edit their own reservations
            startDate: new Date('2024-01-16T10:00:00Z'),
            endDate: new Date('2024-01-16T12:00:00Z')
          },
          {
            id: 'reservation-user-2',
            title: 'Office Hours',
            userId: 'prof-martinez',
            resourceId: 'office-martinez',
            type: EventType.RESERVATION,
            status: EventStatus.CONFIRMED,
            editable: true,
            startDate: new Date('2024-01-17T14:00:00Z'),
            endDate: new Date('2024-01-17T16:00:00Z')
          },
          {
            id: 'reservation-other',
            title: 'Another Professor Class',
            userId: 'prof-garcia',
            resourceId: 'classroom-a101',
            type: EventType.RESERVATION,
            status: EventStatus.CONFIRMED,
            editable: false, // User cannot edit others' reservations
            startDate: new Date('2024-01-18T10:00:00Z'),
            endDate: new Date('2024-01-18T12:00:00Z')
          }
        ],
        view: {
          type: CalendarViewType.WEEK,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        summary: {
          totalEvents: 3,
          reservations: 3,
          availableSlots: 0,
          conflicts: 0,
          eventsByType: {
            [EventType.RESERVATION]: 3,
            [EventType.SCHEDULE]: 0,
            [EventType.MAINTENANCE]: 0,
            [EventType.EXTERNAL_CALENDAR]: 0,
            [EventType.AVAILABILITY]: 0
          }
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedCalendarView);

      // WHEN: Requesting personalized calendar view
      const result = await controller.getCalendarView(
        undefined, // All resources
        startDate,
        endDate,
        CalendarViewType.WEEK,
        undefined, // All event types
        true, // Include availability
        true, // Include external events
        userId
      );

      // THEN: Should return personalized view with editable permissions
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarViewQuery)
      );
      expect(result.data.events).toHaveLength(3);
      
      // User's own events should be editable
      const userEvents = result.data.events.filter(e => e.userId === userId);
      expect(userEvents).toHaveLength(2);
      expect(userEvents.every(e => e.editable)).toBe(true);
      
      // Other users' events should not be editable
      const otherEvents = result.data.events.filter(e => e.userId !== userId && e.userId);
      expect(otherEvents).toHaveLength(1);
      expect(otherEvents.every(e => !e.editable)).toBe(true);
    });
  });

  describe('Scenario: Calendar View with Conflicts', () => {
    it('should detect and report conflicts in calendar view', async () => {
      // GIVEN: A calendar view with conflicting events
      const resourceId = 'classroom-a101';
      const startDate = '2024-01-15T00:00:00Z';
      const endDate = '2024-01-15T23:59:59Z';

      const expectedCalendarView = {
        events: [
          {
            id: 'reservation-conflict-1',
            title: 'Mathematics Class',
            resourceId: 'classroom-a101',
            type: EventType.RESERVATION,
            startDate: new Date('2024-01-15T10:00:00Z'),
            endDate: new Date('2024-01-15T12:00:00Z')
          },
          {
            id: 'reservation-conflict-2',
            title: 'Physics Class',
            resourceId: 'classroom-a101',
            type: EventType.RESERVATION,
            startDate: new Date('2024-01-15T11:00:00Z'),
            endDate: new Date('2024-01-15T13:00:00Z')
          },
          {
            id: 'external-conflict',
            title: 'External Meeting',
            resourceId: 'classroom-a101',
            type: EventType.EXTERNAL_CALENDAR,
            startDate: new Date('2024-01-15T11:30:00Z'),
            endDate: new Date('2024-01-15T12:30:00Z')
          }
        ],
        view: {
          type: CalendarViewType.DAY,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          resourceId: 'classroom-a101'
        },
        summary: {
          totalEvents: 3,
          reservations: 2,
          availableSlots: 0,
          conflicts: 2, // Two overlapping pairs
          eventsByType: {
            [EventType.RESERVATION]: 2,
            [EventType.SCHEDULE]: 0,
            [EventType.MAINTENANCE]: 0,
            [EventType.EXTERNAL_CALENDAR]: 1,
            [EventType.AVAILABILITY]: 0
          }
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedCalendarView);

      // WHEN: Requesting calendar view with conflicting events
      const result = await controller.getCalendarView(
        resourceId,
        startDate,
        endDate,
        CalendarViewType.DAY
      );

      // THEN: Should detect and report conflicts
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetCalendarViewQuery)
      );
      expect(result.data.summary.conflicts).toBe(2);
      expect(result.data.events).toHaveLength(3);
      
      // All events should be for the same resource
      expect(result.data.events.every(e => e.resourceId === resourceId)).toBe(true);
    });
  });

  describe('Scenario: Error Handling', () => {
    it('should handle missing required parameters', async () => {
      // GIVEN: Missing required startDate parameter
      // WHEN: Attempting to get calendar view without startDate
      // THEN: Should throw an error
      await expect(controller.getCalendarView(
        'classroom-a101',
        undefined, // Missing startDate
        '2024-01-31T23:59:59Z'
      )).rejects.toThrow('startDate and endDate are required');
    });

    it('should handle missing required endDate parameter', async () => {
      // GIVEN: Missing required endDate parameter
      // WHEN: Attempting to get calendar view without endDate
      // THEN: Should throw an error
      await expect(controller.getCalendarView(
        'classroom-a101',
        '2024-01-01T00:00:00Z',
        undefined // Missing endDate
      )).rejects.toThrow('startDate and endDate are required');
    });
  });
});
