import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ResourcesService } from '@apps/resources-service/application/services/resources.service';
import { ResourceRepository } from '@apps/resources-service/domain/repositories/resource.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { ResourceEntity } from '@apps/resources-service/domain/entities/resource.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

/*describe('ResourcesService - Resource Management BDD Tests', () => {
  let service: ResourcesService;
  let resourceRepository: jest.Mocked<ResourceRepository>;
  // let categoryRepository: jest.Mocked<CategoryRepository>;
  // let attributeRepository: jest.Mocked<AttributeRepository>;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: ResourceRepository,
          useValue: {
            findById: jest.fn(),
            findByName: jest.fn(),
            findByCategory: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
            bulkCreate: jest.fn(),
          },
        },
        {
          provide: CategoryRepository,
          useValue: {
            findById: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AttributeRepository,
          useValue: {
            findByResourceId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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

    service = module.get<ResourcesService>(ResourcesService);
    resourceRepository = module.get(ResourceRepository);
    // categoryRepository = module.get(CategoryRepository);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
    loggingService = module.get(LoggingService);
  });

  describe('Given an administrator creating a new resource - RF-01', () => {
    const createResourceDto = {
      name: 'Sala de Conferencias A',
      description: 'Sala principal para conferencias',
      type: 'room',
      categoryId: 'category-rooms',
      programId: 'program-engineering',
      capacity: 50,
      location: 'Edificio Principal, Piso 2',
      isActive: true,
    };

    describe('When the resource name is unique', () => {
      beforeEach(() => {
        resourceRepository.findByName.mockResolvedValue(null);
        // categoryRepository.findById.mockResolvedValue(
        //   new CategoryEntity(
        //     'category-rooms',
        //     'Salas',
        //     'Salas de reuniones y conferencias',
        //     true,
        //     new Date(),
        //     new Date(),
        //   ),
        // );
        
        const newResource = new ResourceEntity(
          'resource-new',
          createResourceDto.name,
          createResourceDto.description,
          createResourceDto.type,
          createResourceDto.categoryId,
          createResourceDto.programId,
          createResourceDto.capacity,
          createResourceDto.location,
          createResourceDto.isActive,
          new Date(),
          new Date(),
        );
        commandBus.execute.mockResolvedValue(newResource);
      });

      it('Then should create the resource successfully and log the creation', async () => {
        // When
        const result = await service.createResource(createResourceDto);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'resource-new',
            name: createResourceDto.name,
            type: createResourceDto.type,
            categoryId: createResourceDto.categoryId,
            isActive: true,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Resource created successfully',
          expect.stringContaining('resource-new'),
        );
      });
    });

    describe('When the resource name already exists', () => {
      beforeEach(() => {
        const existingResource = new ResourceEntity(
          'resource-existing',
          createResourceDto.name,
          'Existing description',
          'room',
          'category-rooms',
          'program-engineering',
          30,
          'Location',
          true,
          new Date(),
          new Date(),
        );
        resourceRepository.findByName.mockResolvedValue(existingResource);
      });

      it('Then should throw ConflictException and log the conflict', async () => {
        // When & Then
        await expect(service.createResource(createResourceDto))
          .rejects.toThrow(ConflictException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Resource creation failed - name already exists',
          expect.stringContaining(createResourceDto.name),
        );
      });
    });

    describe('When the category does not exist', () => {
      beforeEach(() => {
        resourceRepository.findByName.mockResolvedValue(null);
        // categoryRepository.findById.mockResolvedValue(null);
      });

      it('Then should throw BadRequestException and log the error', async () => {
        // When & Then
        await expect(service.createResource(createResourceDto))
          .rejects.toThrow(BadRequestException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Resource creation failed - invalid category',
          expect.stringContaining(createResourceDto.categoryId),
        );
      });
    });
  });

  describe('Given an administrator defining resource attributes - RF-03', () => {
    const resourceId = 'resource-123';
    const attributeDto = {
      resourceId,
      name: 'Proyector',
      type: 'equipment',
      value: 'HD 1080p',
      isRequired: true,
      description: 'Proyector de alta definición',
    };

    describe('When adding a new attribute to a resource', () => {
      beforeEach(() => {
        const mockResource = new ResourceEntity(
          resourceId,
          'Sala A',
          'Sala de conferencias',
          'room',
          'category-rooms',
          'program-engineering',
          50,
          'Edificio Principal',
          true,
          new Date(),
          new Date(),
        );
        resourceRepository.findById.mockResolvedValue(mockResource);
        
        const newAttribute = new ResourceEntity(
          'attribute-new',
          attributeDto.name,
          attributeDto.description,
          attributeDto.type,
          attributeDto.value,
          attributeDto.isRequired,
          new Date(),
          new Date(),
        );
        commandBus.execute.mockResolvedValue(newAttribute);
      });

      it('Then should create the attribute and associate it with the resource', async () => {
        // When
        const result = await service.addResourceAttribute(attributeDto);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'attribute-new',
            resourceId,
            name: attributeDto.name,
            type: attributeDto.type,
            isRequired: true,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Resource attribute added successfully',
          expect.stringContaining(resourceId),
        );
      });
    });

    describe('When the resource does not exist', () => {
      beforeEach(() => {
        resourceRepository.findById.mockResolvedValue(null);
      });

      it('Then should throw NotFoundException and log the error', async () => {
        // When & Then
        await expect(service.addResourceAttribute(attributeDto))
          .rejects.toThrow(NotFoundException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Attribute creation failed - resource not found',
          expect.stringContaining(resourceId),
        );
      });
    });

    describe('When retrieving all attributes for a resource', () => {
      beforeEach(() => {
        const mockAttributes = [
          new ResourceEntity(
            'attr-1',
            'Proyector',
            'Proyector principal',
            'equipment',
            'HD 1080p',
            true,
            new Date(),
            new Date(),
          ),
          new ResourceEntity(
            'attr-2',
            'Capacidad',
            'Capacidad máxima',
            'specification',
            '50 personas',
            true,
            new Date(),
            new Date(),
          ),
        ];
        // attributeRepository.findByResourceId.mockResolvedValue(mockAttributes);
      });

      it('Then should return all resource attributes with details', async () => {
        // When
        const result = await service.getResourceAttributes(resourceId);

        // Then
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(
          expect.objectContaining({
            name: 'Proyector',
            type: 'equipment',
            isRequired: true,
          }),
        );
        expect(result[1]).toEqual(
          expect.objectContaining({
            name: 'Capacidad',
            type: 'specification',
            value: '50 personas',
          }),
        );
        expect(loggingService.log).toHaveBeenCalledWith(
          'Resource attributes retrieved',
          expect.stringContaining(resourceId),
        );
      });
    });
  });

  describe('Given an administrator configuring availability rules - RF-05', () => {
    const resourceId = 'resource-123';
    const availabilityRules = {
      resourceId,
      defaultSchedule: {
        monday: { start: '08:00', end: '18:00', available: true },
        tuesday: { start: '08:00', end: '18:00', available: true },
        wednesday: { start: '08:00', end: '18:00', available: true },
        thursday: { start: '08:00', end: '18:00', available: true },
        friday: { start: '08:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '14:00', available: false },
        sunday: { start: '09:00', end: '14:00', available: false },
      },
      restrictions: {
        minReservationTime: 30, // minutes
        maxReservationTime: 480, // 8 hours
        advanceBookingDays: 30,
        allowedUserTypes: ['docente', 'administrativo'],
      },
      maintenanceWindows: [
        {
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          reason: 'Mantenimiento preventivo',
          recurring: false,
        },
      ],
    };

    describe('When setting up availability rules for a resource', () => {
      beforeEach(() => {
        const mockResource = new ResourceEntity(
          resourceId,
          'Sala A',
          'Sala de conferencias',
          'room',
          'category-rooms',
          'program-engineering',
          50,
          'Edificio Principal',
          true,
          new Date(),
          new Date(),
        );
        resourceRepository.findById.mockResolvedValue(mockResource);
        commandBus.execute.mockResolvedValue({
          id: 'rules-new',
          resourceId,
          ...availabilityRules,
        });
      });

      it('Then should configure the rules and enable availability management', async () => {
        // When
        const result = await service.configureAvailabilityRules(availabilityRules);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: 'rules-new',
            resourceId,
            defaultSchedule: expect.objectContaining({
              monday: expect.objectContaining({ available: true }),
              saturday: expect.objectContaining({ available: false }),
            }),
            restrictions: expect.objectContaining({
              minReservationTime: 30,
              allowedUserTypes: expect.arrayContaining(['docente']),
            }),
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Availability rules configured successfully',
          expect.stringContaining(resourceId),
        );
      });
    });

    describe('When validating a reservation against availability rules', () => {
      const reservationRequest = {
        resourceId,
        userId: 'user-docente',
        userType: 'docente',
        startTime: new Date('2024-01-15T10:00:00Z'), // Monday
        endTime: new Date('2024-01-15T11:00:00Z'),
      };

      beforeEach(() => {
        queryBus.execute.mockResolvedValue({
          resourceId,
          defaultSchedule: availabilityRules.defaultSchedule,
          restrictions: availabilityRules.restrictions,
          maintenanceWindows: availabilityRules.maintenanceWindows,
        });
      });

      it('Then should validate the request against configured rules', async () => {
        // When
        const result = await service.validateReservationRules(reservationRequest);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            isValid: true,
            validationDetails: expect.objectContaining({
              timeSlotValid: true,
              userTypeAllowed: true,
              durationValid: true,
              noMaintenanceConflict: true,
            }),
          }),
        );
        expect(queryBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Reservation validation completed',
          expect.stringContaining(resourceId),
        );
      });
    });

    describe('When a reservation violates availability rules', () => {
      const invalidReservationRequest = {
        resourceId,
        userId: 'user-student',
        userType: 'estudiante', // Not in allowedUserTypes
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
      };

      beforeEach(() => {
        queryBus.execute.mockResolvedValue({
          resourceId,
          defaultSchedule: availabilityRules.defaultSchedule,
          restrictions: availabilityRules.restrictions,
          maintenanceWindows: availabilityRules.maintenanceWindows,
        });
      });

      it('Then should reject the request with detailed violation reasons', async () => {
        // When
        const result = await service.validateReservationRules(invalidReservationRequest);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            isValid: false,
            violations: expect.arrayContaining([
              expect.objectContaining({
                rule: 'userType',
                message: expect.stringContaining('not allowed'),
              }),
            ]),
          }),
        );
        expect(loggingService.warn).toHaveBeenCalledWith(
          'Reservation validation failed',
          expect.stringContaining('userType violation'),
        );
      });
    });
  });

  describe('Given an administrator editing an existing resource - RF-01', () => {
    const resourceId = 'resource-123';
    const updateData = {
      name: 'Sala de Conferencias A - Renovada',
      description: 'Sala renovada con nuevo equipamiento',
      capacity: 60,
      location: 'Edificio Principal, Piso 2 - Renovado',
    };

    describe('When updating a resource with valid data', () => {
      beforeEach(() => {
        const existingResource = new ResourceEntity(
          resourceId,
          'Sala A',
          'Sala original',
          'room',
          'category-rooms',
          'program-engineering',
          50,
          'Ubicación original',
          true,
          new Date(),
          new Date(),
        );
        resourceRepository.findById.mockResolvedValue(existingResource);
        
        const updatedResource = { ...existingResource, ...updateData };
        commandBus.execute.mockResolvedValue(updatedResource);
      });

      it('Then should update the resource and preserve active reservations', async () => {
        // When
        const result = await service.updateResource(resourceId, updateData);

        // Then
        expect(result).toEqual(
          expect.objectContaining({
            id: resourceId,
            name: updateData.name,
            capacity: updateData.capacity,
            location: updateData.location,
          }),
        );
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Resource updated successfully',
          expect.stringContaining(resourceId),
        );
      });
    });

    describe('When the resource does not exist', () => {
      beforeEach(() => {
        resourceRepository.findById.mockResolvedValue(null);
      });

      it('Then should throw NotFoundException and log the error', async () => {
        // When & Then
        await expect(service.updateResource(resourceId, updateData))
          .rejects.toThrow(NotFoundException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Resource update failed - resource not found',
          expect.stringContaining(resourceId),
        );
      });
    });
  });

  describe('Given an administrator deleting a resource - RF-01', () => {
    const resourceId = 'resource-123';

    describe('When deleting a resource with no active reservations', () => {
      beforeEach(() => {
        const existingResource = new ResourceEntity(
          resourceId,
          'Sala A',
          'Sala para eliminar',
          'room',
          'category-rooms',
          'program-engineering',
          50,
          'Ubicación',
          true,
          new Date(),
          new Date(),
        );
        resourceRepository.findById.mockResolvedValue(existingResource);
        queryBus.execute.mockResolvedValue([]); // No active reservations
        commandBus.execute.mockResolvedValue({ deleted: true });
      });

      it('Then should delete the resource and log the action', async () => {
        // When
        const result = await service.deleteResource(resourceId);

        // Then
        expect(result).toEqual({ deleted: true });
        expect(commandBus.execute).toHaveBeenCalled();
        expect(loggingService.log).toHaveBeenCalledWith(
          'Resource deleted successfully',
          expect.stringContaining(resourceId),
        );
      });
    });

    describe('When deleting a resource with active reservations', () => {
      beforeEach(() => {
        const existingResource = new ResourceEntity(
          resourceId,
          'Sala A',
          'Sala con reservas',
          'room',
          'category-rooms',
          'program-engineering',
          50,
          'Ubicación',
          true,
          new Date(),
          new Date(),
        );
        resourceRepository.findById.mockResolvedValue(existingResource);
        queryBus.execute.mockResolvedValue([
          { id: 'reservation-1', status: 'confirmed' },
          { id: 'reservation-2', status: 'pending' },
        ]);
      });

      it('Then should throw ConflictException and log the conflict', async () => {
        // When & Then
        await expect(service.deleteResource(resourceId))
          .rejects.toThrow(ConflictException);

        expect(loggingService.warn).toHaveBeenCalledWith(
          'Resource deletion failed - has active reservations',
          expect.stringContaining(resourceId),
        );
      });
    });
  });
});*/
