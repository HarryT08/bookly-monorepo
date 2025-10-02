import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceTypeService } from '../../application/services/maintenance-type.service';
import { MaintenanceTypeRepository } from '../../domain/repositories/maintenance-type.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { MaintenanceTypeEntity } from '../../domain/entities/maintenance-type.entity';
import { CreateMaintenanceTypeDto, UpdateMaintenanceTypeDto } from '../../application/dtos/maintenance-type.dto';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('MaintenanceTypeService', () => {
  let service: MaintenanceTypeService;
  let maintenanceTypeRepository: jest.Mocked<MaintenanceTypeRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockDefaultMaintenanceType = new MaintenanceTypeEntity(
    'maintenance-type-id-1',
    'PREVENTIVO',
    'Mantenimiento preventivo programado',
    '#10B981',
    1,
    true, // isDefault
    true,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  const mockCustomMaintenanceType = new MaintenanceTypeEntity(
    'maintenance-type-id-2',
    'LIMPIEZA_PROFUNDA',
    'Limpieza profunda mensual',
    '#3B82F6',
    2,
    false, // isDefault
    true,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  beforeEach(async () => {
    const mockMaintenanceTypeRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findDefaults: jest.fn(),
      findCustom: jest.fn(),
    };

    const mockLoggingService = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceTypeService,
        {
          provide: 'MaintenanceTypeRepository',
          useValue: mockMaintenanceTypeRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<MaintenanceTypeService>(MaintenanceTypeService);
    maintenanceTypeRepository = module.get('MaintenanceTypeRepository');
    loggingService = module.get(LoggingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  describe('createMaintenanceType', () => {
    const createDto: CreateMaintenanceTypeDto = {
      name: 'LIMPIEZA_PROFUNDA',
      description: 'Limpieza profunda mensual',
      color: '#3B82F6',
      priority: 2,
    };

    it('should create a custom maintenance type successfully', async () => {
      maintenanceTypeRepository.findByName.mockResolvedValue(null);
      maintenanceTypeRepository.create.mockResolvedValue(mockCustomMaintenanceType);

      const result = await service.createMaintenanceType(createDto);

      expect(maintenanceTypeRepository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(maintenanceTypeRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockCustomMaintenanceType.id,
        name: mockCustomMaintenanceType.name,
        description: mockCustomMaintenanceType.description,
        color: mockCustomMaintenanceType.color,
        priority: mockCustomMaintenanceType.priority,
        isDefault: mockCustomMaintenanceType.isDefault,
        isActive: mockCustomMaintenanceType.isActive,
        createdAt: mockCustomMaintenanceType.createdAt,
        updatedAt: mockCustomMaintenanceType.updatedAt,
      });
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw ConflictException if name already exists', async () => {
      maintenanceTypeRepository.findByName.mockResolvedValue(mockCustomMaintenanceType);

      await expect(service.createMaintenanceType(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(maintenanceTypeRepository.create).not.toHaveBeenCalled();
    });

    it('should use default values for optional fields', async () => {
      const minimalDto = { name: 'TEST_TYPE' };
      maintenanceTypeRepository.findByName.mockResolvedValue(null);
      maintenanceTypeRepository.create.mockResolvedValue(mockCustomMaintenanceType);

      await service.createMaintenanceType(minimalDto);

      expect(maintenanceTypeRepository.create).toHaveBeenCalled();
      const createCall = maintenanceTypeRepository.create.mock.calls[0][0];
      expect(createCall.color).toBe('#6B7280'); // default color
      expect(createCall.priority).toBe(1); // default priority
    });
  });

  describe('updateMaintenanceType', () => {
    const updateDto: UpdateMaintenanceTypeDto = {
      name: 'LIMPIEZA_PROFUNDA',
      description: 'Descripción actualizada',
      color: '#EF4444',
      priority: 3,
    };

    it('should update a custom maintenance type successfully', async () => {
      const updatedEntity = mockCustomMaintenanceType.update(
        updateDto.name,
        updateDto.description,
        updateDto.color,
        updateDto.priority,
      );

      maintenanceTypeRepository.findById.mockResolvedValue(mockCustomMaintenanceType);
      maintenanceTypeRepository.update.mockResolvedValue(updatedEntity);

      const result = await service.updateMaintenanceType('maintenance-type-id-2', updateDto);

      expect(maintenanceTypeRepository.findById).toHaveBeenCalledWith('maintenance-type-id-2');
      expect(maintenanceTypeRepository.update).toHaveBeenCalled();
      expect(result.description).toBe(updateDto.description);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if maintenance type does not exist', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateMaintenanceType('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(maintenanceTypeRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to update default type', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(mockDefaultMaintenanceType);

      await expect(
        service.updateMaintenanceType('maintenance-type-id-1', updateDto),
      ).rejects.toThrow(BadRequestException);
      expect(maintenanceTypeRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if maintenance type is inactive', async () => {
      const inactiveType = new MaintenanceTypeEntity(
        'inactive-id',
        'INACTIVE_TYPE',
        'Description',
        '#000000',
        1,
        false,
        false, // isActive = false
        new Date(),
        new Date(),
      );

      maintenanceTypeRepository.findById.mockResolvedValue(inactiveType);

      await expect(
        service.updateMaintenanceType('inactive-id', updateDto),
      ).rejects.toThrow(ConflictException);
      expect(maintenanceTypeRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getMaintenanceTypeById', () => {
    it('should return a maintenance type by id', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(mockCustomMaintenanceType);

      const result = await service.getMaintenanceTypeById('maintenance-type-id-2');

      expect(maintenanceTypeRepository.findById).toHaveBeenCalledWith('maintenance-type-id-2');
      expect(result).toEqual({
        id: mockCustomMaintenanceType.id,
        name: mockCustomMaintenanceType.name,
        description: mockCustomMaintenanceType.description,
        color: mockCustomMaintenanceType.color,
        priority: mockCustomMaintenanceType.priority,
        isDefault: mockCustomMaintenanceType.isDefault,
        isActive: mockCustomMaintenanceType.isActive,
        createdAt: mockCustomMaintenanceType.createdAt,
        updatedAt: mockCustomMaintenanceType.updatedAt,
      });
    });

    it('should throw NotFoundException if maintenance type does not exist', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(null);

      await expect(service.getMaintenanceTypeById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getActiveMaintenanceTypes', () => {
    it('should return active maintenance types ordered by priority', async () => {
      const mockTypes = [mockDefaultMaintenanceType, mockCustomMaintenanceType];
      maintenanceTypeRepository.findAll.mockResolvedValue(mockTypes);

      const result = await service.getActiveMaintenanceTypes();

      expect(maintenanceTypeRepository.findAll).toHaveBeenCalledWith({
        isActive: true,
        orderBy: { priority: 'asc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getAllMaintenanceTypes', () => {
    it('should return all maintenance types', async () => {
      const mockTypes = [mockDefaultMaintenanceType, mockCustomMaintenanceType];
      maintenanceTypeRepository.findAll.mockResolvedValue(mockTypes);

      const result = await service.getAllMaintenanceTypes();

      expect(maintenanceTypeRepository.findAll).toHaveBeenCalledWith({
        orderBy: { priority: 'asc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getDefaultMaintenanceTypes', () => {
    it('should return default maintenance types', async () => {
      maintenanceTypeRepository.findDefaults.mockResolvedValue([mockDefaultMaintenanceType]);

      const result = await service.getDefaultMaintenanceTypes();

      expect(maintenanceTypeRepository.findDefaults).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].isDefault).toBe(true);
    });
  });

  describe('getCustomMaintenanceTypes', () => {
    it('should return custom maintenance types', async () => {
      maintenanceTypeRepository.findCustom.mockResolvedValue([mockCustomMaintenanceType]);

      const result = await service.getCustomMaintenanceTypes();

      expect(maintenanceTypeRepository.findCustom).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].isDefault).toBe(false);
    });
  });

  describe('deactivateMaintenanceType', () => {
    it('should deactivate a custom maintenance type successfully', async () => {
      const deactivatedEntity = new MaintenanceTypeEntity(
        mockCustomMaintenanceType.id,
        mockCustomMaintenanceType.name,
        mockCustomMaintenanceType.description,
        mockCustomMaintenanceType.color,
        mockCustomMaintenanceType.priority,
        mockCustomMaintenanceType.isDefault,
        false, // isActive = false
        mockCustomMaintenanceType.createdAt,
        new Date(),
      );

      maintenanceTypeRepository.findById.mockResolvedValue(mockCustomMaintenanceType);
      maintenanceTypeRepository.update.mockResolvedValue(deactivatedEntity);

      const result = await service.deactivateMaintenanceType('maintenance-type-id-2');

      expect(maintenanceTypeRepository.findById).toHaveBeenCalledWith('maintenance-type-id-2');
      expect(maintenanceTypeRepository.update).toHaveBeenCalled();
      expect(result.isActive).toBe(false);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to deactivate default type', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(mockDefaultMaintenanceType);

      await expect(
        service.deactivateMaintenanceType('maintenance-type-id-1'),
      ).rejects.toThrow(BadRequestException);
      expect(maintenanceTypeRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if maintenance type is already inactive', async () => {
      const inactiveType = new MaintenanceTypeEntity(
        'inactive-id',
        'INACTIVE_TYPE',
        'Description',
        '#000000',
        1,
        false,
        false, // already inactive
        new Date(),
        new Date(),
      );

      maintenanceTypeRepository.findById.mockResolvedValue(inactiveType);

      await expect(service.deactivateMaintenanceType('inactive-id')).rejects.toThrow(
        ConflictException,
      );
      expect(maintenanceTypeRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('reactivateMaintenanceType', () => {
    it('should reactivate a maintenance type successfully', async () => {
      const inactiveType = new MaintenanceTypeEntity(
        'inactive-id',
        'INACTIVE_TYPE',
        'Description',
        '#000000',
        1,
        false,
        false, // inactive
        new Date(),
        new Date(),
      );

      const reactivatedEntity = new MaintenanceTypeEntity(
        inactiveType.id,
        inactiveType.name,
        inactiveType.description,
        inactiveType.color,
        inactiveType.priority,
        inactiveType.isDefault,
        true, // isActive = true
        inactiveType.createdAt,
        new Date(),
      );

      maintenanceTypeRepository.findById.mockResolvedValue(inactiveType);
      maintenanceTypeRepository.update.mockResolvedValue(reactivatedEntity);

      const result = await service.reactivateMaintenanceType('inactive-id');

      expect(maintenanceTypeRepository.findById).toHaveBeenCalledWith('inactive-id');
      expect(maintenanceTypeRepository.update).toHaveBeenCalled();
      expect(result.isActive).toBe(true);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw ConflictException if maintenance type is already active', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(mockCustomMaintenanceType); // already active

      await expect(
        service.reactivateMaintenanceType('maintenance-type-id-2'),
      ).rejects.toThrow(ConflictException);
      expect(maintenanceTypeRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('validateMaintenanceType', () => {
    it('should return true for valid and active maintenance type', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(mockCustomMaintenanceType);

      const result = await service.validateMaintenanceType('maintenance-type-id-2');

      expect(result).toBe(true);
      expect(maintenanceTypeRepository.findById).toHaveBeenCalledWith('maintenance-type-id-2');
    });

    it('should return false for non-existent maintenance type', async () => {
      maintenanceTypeRepository.findById.mockResolvedValue(null);

      const result = await service.validateMaintenanceType('non-existent-id');

      expect(result).toBe(false);
    });

    it('should return false for inactive maintenance type', async () => {
      const inactiveType = new MaintenanceTypeEntity(
        'inactive-id',
        'INACTIVE_TYPE',
        'Description',
        '#000000',
        1,
        false,
        false, // inactive
        new Date(),
        new Date(),
      );

      maintenanceTypeRepository.findById.mockResolvedValue(inactiveType);

      const result = await service.validateMaintenanceType('inactive-id');

      expect(result).toBe(false);
    });
  });
});
