import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ScheduleRepository } from '@apps/availability-service/domain/repositories/schedule.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { ScheduleEntity } from '@apps/availability-service/domain/entities/schedule.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

/*describe('ScheduleService - Schedule Configuration BDD Tests', () => {
  let service: ScheduleService;
  let scheduleRepository: jest.Mocked<ScheduleRepository>;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: ScheduleRepository,
          useValue: {
            findByResourceId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findConflicting: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    scheduleRepository = module.get(ScheduleRepository);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    loggingService = module.get(LoggingService);
  });

  describe('Given configuring resource schedules - RF-07', () => {
    const resourceId = 'resource-123';
    const scheduleConfig = {
      resourceId,
      type: 'regular',
      rules: {
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '18:00',
        recurrence: 'weekly',
      },
      isActive: true,
    };

    describe('When creating a regular schedule', () => {
      beforeEach(() => {
        scheduleRepository.findConflicting.mockResolvedValue([]);
        const newSchedule = new ScheduleEntity(
          'schedule-new',
          resourceId,
          'regular',
          scheduleConfig.rules,
          true,
          new Date(),
          new Date(),
        );
        commandBus.execute.mockResolvedValue(newSchedule);
      });

      it('Then should create schedule and enable availability tracking', async () => {
        // When
        const result = await service.createSchedule(scheduleConfig);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'schedule-new',
            resourceId,
            type: 'regular',
            isActive: true,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Schedule created successfully',
          expect.stringContaining(resourceId),
        );
      });
    });
  });
});*/
