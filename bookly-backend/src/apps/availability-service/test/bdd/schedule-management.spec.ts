import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AvailabilityController } from '../../infrastructure/controllers/availability.controller';
import { CreateScheduleCommand } from '../../application/commands/create-schedule.command';
import { GetAvailabilityQuery } from '../../application/queries/get-availability.query';
import { ScheduleType } from '../../../../libs/dto/availability/create-schedule.dto';
import { CreateScheduleDto } from '../../../../libs/dto/availability/create-schedule.dto';

/**
 * BDD Tests for RF-07: Schedule Management
 * Following Given-When-Then pattern for availability scheduling features
 */
describe('RF-07: Schedule Management - BDD Tests', () => {
  let controller: AvailabilityController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

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
        {
          provide: CommandBus,
          useValue: mockCommandBus
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus
        }
      ]
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  describe('Scenario: Creating basic availability schedule', () => {
    it('GIVEN a resource without existing schedules WHEN creating basic availability THEN schedule should be created successfully', async () => {
      // GIVEN
      const resourceId = 'resource-123';
      const createScheduleDto: CreateScheduleDto = {
        resourceId,
        name: 'Horario Regular Aula A101',
        type: ScheduleType.REGULAR,
        startDate: '2024-01-15T08:00:00Z',
        endDate: '2024-12-15T18:00:00Z',
        recurrenceRule: {
          frequency: 'WEEKLY',
          daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
          startTime: '08:00',
          endTime: '18:00'
        },
        restrictions: {
          minAdvanceHours: 24,
          maxDurationHours: 4,
          allowedUserTypes: ['PROFESSOR', 'ADMIN']
        },
        isActive: true
      };

      const expectedSchedule = {
        id: 'schedule-456',
        resourceId,
        name: createScheduleDto.name,
        type: createScheduleDto.type,
        isActive: true,
        createdAt: new Date()
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedSchedule);

      // WHEN
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createSchedule(createScheduleDto, mockUser);

      // THEN
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateScheduleCommand)
      );
      expect(result).toEqual(expectedSchedule);
      expect(result.data.resourceId).toBe(resourceId);
      expect(result.data.isActive).toBe(true);
    });
  });

  describe('Scenario: Creating schedule with institutional restrictions', () => {
    it('GIVEN institutional policies WHEN creating schedule with restrictions THEN restrictions should be properly applied', async () => {
      // GIVEN
      const resourceId = 'lab-equipment-789';
      const createScheduleDto: CreateScheduleDto = {
        resourceId,
        name: 'Laboratorio Química - Horario Restringido',
        type: ScheduleType.RESTRICTED,
        startDate: '2024-01-15T09:00:00Z',
        endDate: '2024-12-15T17:00:00Z',
        recurrenceRule: {
          frequency: 'WEEKLY',
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '17:00'
        },
        restrictions: {
          minAdvanceHours: 48, // 2 días de anticipación
          maxDurationHours: 2,  // Máximo 2 horas
          allowedUserTypes: ['PROFESSOR'], // Solo profesores
          requiresApproval: true,
          maxConcurrentReservations: 1
        },
        isActive: true
      };

      const expectedSchedule = {
        id: 'schedule-restricted-123',
        resourceId,
        restrictions: createScheduleDto.restrictions,
        type: ScheduleType.RESTRICTED
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedSchedule);

      // WHEN
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createSchedule(createScheduleDto, mockUser);

      // THEN
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          restrictions: expect.objectContaining({
            minAdvanceHours: 48,
            maxDurationHours: 2,
            allowedUserTypes: ['PROFESSOR'],
            requiresApproval: true
          })
        })
      );
      expect(result.data.type).toBe(ScheduleType.RESTRICTED);
    });
  });

  describe('Scenario: Creating maintenance schedule', () => {
    it('GIVEN a resource needing maintenance WHEN creating maintenance schedule THEN resource should be blocked during maintenance', async () => {
      // GIVEN
      const resourceId = 'auditorium-main';
      const createScheduleDto: CreateScheduleDto = {
        resourceId,
        name: 'Mantenimiento Mensual Auditorio',
        type: ScheduleType.MAINTENANCE,
        startDate: '2024-02-01T00:00:00Z',
        endDate: '2024-02-02T23:59:59Z',
        recurrenceRule: {
          frequency: 'MONTHLY',
          dayOfMonth: 1,
          duration: '2 days'
        },
        restrictions: {
          blockAllReservations: true,
          priority: 'HIGH'
        },
        isActive: true
      };

      const expectedSchedule = {
        id: 'maintenance-schedule-456',
        type: ScheduleType.MAINTENANCE,
        restrictions: {
          blockAllReservations: true,
          priority: 'HIGH'
        }
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedSchedule);

      // WHEN
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createSchedule(createScheduleDto, mockUser);

      // THEN
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ScheduleType.MAINTENANCE,
          restrictions: expect.objectContaining({
            blockAllReservations: true
          })
        })
      );
      expect(result.data.type).toBe(ScheduleType.MAINTENANCE);
    });
  });

  describe('Scenario: Querying availability with complex schedules', () => {
    it('GIVEN multiple overlapping schedules WHEN querying availability THEN should return consolidated availability', async () => {
      // GIVEN
      const resourceId = 'classroom-b201';
      const expectedAvailability = {
        resourceId,
        availableSlots: [
          {
            date: '2024-01-15',
            timeSlots: [
              { startTime: '08:00', endTime: '12:00', available: true },
              { startTime: '14:00', endTime: '18:00', available: true }
            ]
          }
        ],
        restrictions: {
          minAdvanceHours: 24,
          maxDurationHours: 4
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedAvailability);

      // WHEN
      const result = await controller.getAvailability(resourceId);

      // THEN
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetAvailabilityQuery)
      );
      expect(result.data.resourceId).toBe(resourceId);
      expect(result.data.availableSlots).toBeDefined();
      expect(result.data.restrictions).toBeDefined();
    });
  });

  describe('Scenario: Schedule conflict detection', () => {
    it('GIVEN overlapping schedules WHEN creating conflicting schedule THEN should detect and prevent conflicts', async () => {
      // GIVEN
      const resourceId = 'shared-space-101';
      const conflictingScheduleDto: CreateScheduleDto = {
        resourceId,
        name: 'Horario Conflictivo',
        type: ScheduleType.REGULAR,
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T14:00:00Z',
        recurrenceRule: {
          frequency: 'WEEKLY',
          daysOfWeek: [1], // Lunes
          startTime: '10:00',
          endTime: '14:00'
        },
        restrictions: {},
        isActive: true
      };

      const conflictError = new Error('Schedule conflicts with existing schedules');
      (commandBus.execute as jest.Mock).mockRejectedValue(conflictError);

      // WHEN & THEN
      const mockUser = { id: 'user-123' } as any;
      await expect(controller.createSchedule(conflictingScheduleDto, mockUser))
        .rejects.toThrow('Schedule conflicts with existing schedules');
      
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateScheduleCommand)
      );
    });
  });

  describe('Scenario: Schedule validation with institutional rules', () => {
    it('GIVEN institutional operating hours WHEN creating schedule outside hours THEN should validate against institutional policies', async () => {
      // GIVEN
      const resourceId = 'library-study-room';
      const invalidScheduleDto: CreateScheduleDto = {
        resourceId,
        name: 'Horario Fuera de Operación',
        type: ScheduleType.REGULAR,
        startDate: '2024-01-15T22:00:00Z', // Fuera del horario institucional
        endDate: '2024-01-15T06:00:00Z',
        recurrenceRule: {
          frequency: 'DAILY',
          startTime: '22:00',
          endTime: '06:00'
        },
        restrictions: {},
        isActive: true
      };

      const validationError = new Error('Schedule outside institutional operating hours');
      (commandBus.execute as jest.Mock).mockRejectedValue(validationError);

      // WHEN & THEN
      const mockUser = { id: 'user-123' } as any;
      await expect(controller.createSchedule(invalidScheduleDto, mockUser))
        .rejects.toThrow('Schedule outside institutional operating hours');
    });
  });
});
