import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AvailabilityController } from '../../infrastructure/controllers/availability.controller';
import { CreateReservationCommand } from '../../application/commands/create-reservation.command';
import { GetReservationHistoryQuery } from '../../application/queries/get-reservation-history.query';
import { CreateReservationDto } from '../../../../libs/dto/availability/create-reservation.dto';
import { ReservationStatus } from '../../domain/entities/reservation.entity';

/**
 * BDD Tests for RF-07: Reservation Management
 * Following Given-When-Then pattern for reservation features
 */
describe('RF-07: Reservation Management - BDD Tests', () => {
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

  describe('Scenario: Creating a simple reservation', () => {
    it('GIVEN available resource and valid time slot WHEN creating reservation THEN reservation should be created successfully', async () => {
      // GIVEN
      const createReservationDto: CreateReservationDto = {
        title: 'Clase de Matemáticas Avanzadas',
        description: 'Sesión de repaso para examen final',
        startDate: '2024-01-15T10:00:00Z',
        endDate: '2024-01-15T12:00:00Z',
        resourceId: 'classroom-a101',
        userId: 'prof-martinez-123',
        isRecurring: false,
        recurrence: null
      };

      const expectedReservation = {
        id: 'reservation-456',
        title: createReservationDto.title,
        status: ReservationStatus.PENDING,
        resourceId: createReservationDto.resourceId,
        userId: createReservationDto.userId,
        startDate: new Date(createReservationDto.startDate),
        endDate: new Date(createReservationDto.endDate),
        createdAt: new Date()
      };

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedReservation);

      // WHEN
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createReservation(createReservationDto, mockUser);

      // THEN
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateReservationCommand)
      );
      expect(result.data.title).toBe(createReservationDto.title);
      expect(result.data.status).toBe(ReservationStatus.PENDING);
      expect(result.data.resourceId).toBe(createReservationDto.resourceId);
    });
  });

  describe('Scenario: Creating recurring reservation', () => {
    it('GIVEN valid recurring pattern WHEN creating recurring reservation THEN multiple reservation instances should be created', async () => {
      // GIVEN
      const recurringReservationDto: CreateReservationDto = {
        title: 'Seminario Semanal de Investigación',
        description: 'Reunión semanal del grupo de investigación',
        startDate: '2024-01-15T14:00:00Z',
        endDate: '2024-01-15T16:00:00Z',
        resourceId: 'conference-room-b',
        userId: 'prof-garcia-456',
        isRecurring: true,
        recurrence: {
          frequency: 'WEEKLY',
          daysOfWeek: [1], // Lunes
          endRecurrence: '2024-06-15T16:00:00Z',
          occurrences: 20
        }
      };

      const expectedReservations = [
        {
          id: 'reservation-series-1',
          title: recurringReservationDto.title,
          status: ReservationStatus.PENDING,
          isRecurring: true,
          parentReservationId: null,
          instanceNumber: 1
        },
        {
          id: 'reservation-series-2',
          title: recurringReservationDto.title,
          status: ReservationStatus.PENDING,
          isRecurring: true,
          parentReservationId: 'reservation-series-1',
          instanceNumber: 2
        }
      ];

      (commandBus.execute as jest.Mock).mockResolvedValue(expectedReservations);

      // WHEN
      const mockUser = { id: 'user-123' } as any;
      const result = await controller.createReservation(recurringReservationDto, mockUser);

      // THEN
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecurring: true,
          recurrence: expect.objectContaining({
            frequency: 'WEEKLY',
            daysOfWeek: [1]
          })
        })
      );
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Scenario: Reservation conflict detection', () => {
    it('GIVEN existing reservation WHEN creating overlapping reservation THEN should detect conflict and reject', async () => {
      // GIVEN
      const conflictingReservationDto: CreateReservationDto = {
        title: 'Reunión Conflictiva',
        description: 'Esta reserva se solapa con otra existente',
        startDate: '2024-01-15T10:30:00Z', // Se solapa con reserva existente
        endDate: '2024-01-15T11:30:00Z',
        resourceId: 'classroom-a101', // Mismo recurso
        userId: 'prof-lopez-789',
        isRecurring: false,
        recurrence: null
      };

      const conflictError = new Error('Reservation conflicts with existing reservations');
      (commandBus.execute as jest.Mock).mockRejectedValue(conflictError);

      // WHEN & THEN
      const mockUser = { id: 'user-123' } as any;
      await expect(controller.createReservation(conflictingReservationDto, mockUser))
        .rejects.toThrow('Reservation conflicts with existing reservations');
      
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(CreateReservationCommand)
      );
    });
  });

  describe('Scenario: Reservation with schedule restrictions', () => {
    it('GIVEN resource with advance notice requirement WHEN creating last-minute reservation THEN should validate against restrictions', async () => {
      // GIVEN
      const lastMinuteReservationDto: CreateReservationDto = {
        title: 'Reserva de Último Momento',
        description: 'Intentando reservar con poco tiempo de anticipación',
        startDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas desde ahora
        endDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 horas desde ahora
        resourceId: 'lab-equipment-restricted', // Recurso que requiere 24h de anticipación
        userId: 'student-rodriguez-123',
        isRecurring: false,
        recurrence: null
      };

      const restrictionError = new Error('Reservation does not meet minimum advance notice requirement');
      (commandBus.execute as jest.Mock).mockRejectedValue(restrictionError);

      // WHEN & THEN
      const mockUser = { id: 'user-123' } as any;
      await expect(controller.createReservation(lastMinuteReservationDto, mockUser))
        .rejects.toThrow('Reservation does not meet minimum advance notice requirement');
    });
  });

  describe('Scenario: User type restriction validation', () => {
    it('GIVEN resource restricted to professors WHEN student creates reservation THEN should reject based on user type', async () => {
      // GIVEN
      const studentReservationDto: CreateReservationDto = {
        title: 'Intento de Reserva de Estudiante',
        description: 'Estudiante intentando reservar recurso restringido',
        startDate: '2024-01-16T10:00:00Z',
        endDate: '2024-01-16T12:00:00Z',
        resourceId: 'professor-only-room',
        userId: 'student-martinez-456', // Usuario tipo estudiante
        isRecurring: false,
        recurrence: null
      };

      const userTypeError = new Error('User type not allowed for this resource');
      (commandBus.execute as jest.Mock).mockRejectedValue(userTypeError);

      // WHEN & THEN
      const mockUser = { id: 'user-123' } as any;
      await expect(controller.createReservation(studentReservationDto, mockUser))
        .rejects.toThrow('User type not allowed for this resource');
    });
  });

  describe('Scenario: Maximum duration validation', () => {
    it('GIVEN resource with 2-hour limit WHEN creating 4-hour reservation THEN should reject for exceeding duration limit', async () => {
      // GIVEN
      const longReservationDto: CreateReservationDto = {
        title: 'Reserva Muy Larga',
        description: 'Intentando reservar por más tiempo del permitido',
        startDate: '2024-01-16T09:00:00Z',
        endDate: '2024-01-16T13:00:00Z', // 4 horas de duración
        resourceId: 'limited-duration-room', // Recurso con límite de 2 horas
        userId: 'prof-gonzalez-789',
        isRecurring: false,
        recurrence: null
      };

      const durationError = new Error('Reservation exceeds maximum allowed duration');
      (commandBus.execute as jest.Mock).mockRejectedValue(durationError);

      // WHEN & THEN
      const mockUser = { id: 'user-123' } as any;
      await expect(controller.createReservation(longReservationDto, mockUser))
        .rejects.toThrow('Reservation exceeds maximum allowed duration');
    });
  });

  describe('Scenario: Querying reservation history', () => {
    it('GIVEN user with multiple reservations WHEN querying history THEN should return paginated reservation list', async () => {
      // GIVEN
      const userId = 'prof-martinez-123';
      const expectedHistory = {
        reservations: [
          {
            id: 'reservation-1',
            title: 'Clase de Matemáticas',
            status: ReservationStatus.APPROVED,
            startDate: '2024-01-10T10:00:00Z',
            resourceName: 'Aula A101'
          },
          {
            id: 'reservation-2',
            title: 'Reunión de Departamento',
            status: ReservationStatus.COMPLETED,
            startDate: '2024-01-08T14:00:00Z',
            resourceName: 'Sala de Conferencias B'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      };

      (queryBus.execute as jest.Mock).mockResolvedValue(expectedHistory);

      // WHEN
      const queryParams = {
        userId,
        page: 1,
        limit: 10
      };
      const result = await controller.getReservationHistory(queryParams);

      // THEN
      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetReservationHistoryQuery)
      );
      expect(result.data.reservations).toHaveLength(2);
      expect(result.data.pagination.total).toBe(2);
    });
  });
});
