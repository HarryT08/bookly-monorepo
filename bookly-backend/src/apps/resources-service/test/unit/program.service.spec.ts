import { Test, TestingModule } from '@nestjs/testing';
import { ProgramService } from '../../application/services/program.service';
import { ProgramEntity } from '../../domain/entities/program.entity';
import { CreateProgramDto, UpdateProgramDto } from '../../application/dtos/program.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProgramService', () => {
  let service: ProgramService;
  let programRepository: any;
  let loggingService: any;

  const mockProgramEntity = new ProgramEntity(
    'program-id-1',
    'Ingeniería de Sistemas',
    'INGSIST',
    'Programa de Ingeniería de Sistemas y Computación',
    'Facultad de Ingeniería',
    true,
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  beforeEach(async () => {
    const mockProgramRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findWithPagination: jest.fn(),
      findAll: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        {
          provide: 'ProgramRepository',
          useValue: mockProgramRepository,
        },
        {
          provide: 'LoggingService',
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
    programRepository = module.get('ProgramRepository');
    loggingService = module.get('LoggingService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProgram', () => {
    const createDto: CreateProgramDto = {
      name: 'Ingeniería de Sistemas',
      code: 'INGSIST',
      description: 'Programa de Ingeniería de Sistemas y Computación',
      facultyName: 'Facultad de Ingeniería',
    };

    it('should create a program successfully', async () => {
      programRepository.findByName.mockResolvedValue(null);
      programRepository.findByCode.mockResolvedValue(null);
      programRepository.create.mockResolvedValue(mockProgramEntity);

      const result = await service.createProgram(createDto, 'user-id-1');

      expect(programRepository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(programRepository.findByCode).toHaveBeenCalledWith(createDto.code);
      expect(programRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockProgramEntity.id,
        name: mockProgramEntity.name,
        code: mockProgramEntity.code,
        description: mockProgramEntity.description,
        facultyName: mockProgramEntity.facultyName,
        isActive: mockProgramEntity.isActive,
        createdAt: mockProgramEntity.createdAt,
        updatedAt: mockProgramEntity.updatedAt,
      });
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw ConflictException if program name already exists', async () => {
      programRepository.findByName.mockResolvedValue(mockProgramEntity);

      await expect(service.createProgram(createDto, 'user-id-1')).rejects.toThrow(
        ConflictException,
      );
      expect(programRepository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(programRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if program code already exists', async () => {
      programRepository.findByName.mockResolvedValue(null);
      programRepository.findByCode.mockResolvedValue(mockProgramEntity);

      await expect(service.createProgram(createDto, 'user-id-1')).rejects.toThrow(
        ConflictException,
      );
      expect(programRepository.findByCode).toHaveBeenCalledWith(createDto.code);
      expect(programRepository.create).not.toHaveBeenCalled();
    });

    it('should create program without code if not provided', async () => {
      const createDtoWithoutCode = { ...createDto };
      delete createDtoWithoutCode.code;

      programRepository.findByName.mockResolvedValue(null);
      programRepository.create.mockResolvedValue(mockProgramEntity);

      await service.createProgram(createDtoWithoutCode, 'user-id-1');

      expect(programRepository.findByCode).not.toHaveBeenCalled();
      expect(programRepository.create).toHaveBeenCalled();
    });
  });

  describe('updateProgram', () => {
    const updateDto: UpdateProgramDto = {
      name: 'Ingeniería de Sistemas Actualizada',
      description: 'Descripción actualizada',
      facultyName: 'Facultad de Ingeniería Actualizada',
    };

    it('should update a program successfully', async () => {
      const updatedEntity = mockProgramEntity.update(
        updateDto.name,
        updateDto.description,
        updateDto.facultyName,
      );

      programRepository.findById.mockResolvedValue(mockProgramEntity);
      programRepository.findByName.mockResolvedValue(null);
      programRepository.update.mockResolvedValue(updatedEntity);

      const result = await service.updateProgram('program-id-1', updateDto, 'user-id-1');

      expect(programRepository.findById).toHaveBeenCalledWith('program-id-1');
      expect(programRepository.findByName).toHaveBeenCalledWith(updateDto.name);
      expect(programRepository.update).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProgram('non-existent-id', updateDto, 'user-id-1'),
      ).rejects.toThrow(NotFoundException);
      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if new name already exists', async () => {
      const anotherProgram = new ProgramEntity(
        'another-id',
        'Otro Programa',
        'OTRO',
        'Descripción',
        'Facultad',
        true,
        new Date(),
        new Date(),
      );

      programRepository.findById.mockResolvedValue(mockProgramEntity);
      programRepository.findByName.mockResolvedValue(anotherProgram);

      await expect(
        service.updateProgram('program-id-1', updateDto, 'user-id-1'),
      ).rejects.toThrow(ConflictException);
      expect(programRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getProgramById', () => {
    it('should return a program by id', async () => {
      programRepository.findById.mockResolvedValue(mockProgramEntity);

      const result = await service.getProgramById('program-id-1');

      expect(programRepository.findById).toHaveBeenCalledWith('program-id-1');
      expect(result).toEqual({
        id: mockProgramEntity.id,
        name: mockProgramEntity.name,
        code: mockProgramEntity.code,
        description: mockProgramEntity.description,
        facultyName: mockProgramEntity.facultyName,
        isActive: mockProgramEntity.isActive,
        createdAt: mockProgramEntity.createdAt,
        updatedAt: mockProgramEntity.updatedAt,
      });
    });

    it('should throw NotFoundException if program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(service.getProgramById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPrograms', () => {
    it('should return paginated programs', async () => {
      const mockPrograms = [mockProgramEntity];
      programRepository.findWithPagination.mockResolvedValue({
        programs: mockPrograms,
        total: 1,
      });

      const result = await service.getPrograms(1, 10, 'sistemas', true);

      expect(programRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        search: 'sistemas',
        isActive: true,
      });
      expect(result.programs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should return programs without filters', async () => {
      const mockPrograms = [mockProgramEntity];
      programRepository.findWithPagination.mockResolvedValue({
        programs: mockPrograms,
        total: 1,
      });

      const result = await service.getPrograms(1, 10);

      expect(programRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {});
      expect(result.programs).toHaveLength(1);
    });
  });

  describe('getActivePrograms', () => {
    it('should return only active programs', async () => {
      const mockPrograms = [mockProgramEntity];
      programRepository.findAll.mockResolvedValue(mockPrograms);

      const result = await service.getActivePrograms();

      expect(programRepository.findAll).toHaveBeenCalledWith({ isActive: true });
      expect(result).toHaveLength(1);
    });
  });

  describe('deactivateProgram', () => {
    it('should deactivate a program successfully', async () => {
      const deactivatedEntity = new ProgramEntity(
        mockProgramEntity.id,
        mockProgramEntity.name,
        mockProgramEntity.code,
        mockProgramEntity.description,
        mockProgramEntity.facultyName,
        false, // isActive = false
        mockProgramEntity.createdAt,
        new Date(),
      );

      programRepository.findById.mockResolvedValue(mockProgramEntity);
      programRepository.update.mockResolvedValue(deactivatedEntity);

      const result = await service.deactivateProgram('program-id-1', 'user-id-1');

      expect(programRepository.findById).toHaveBeenCalledWith('program-id-1');
      expect(programRepository.update).toHaveBeenCalled();
      expect(result.isActive).toBe(false);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(service.deactivateProgram('non-existent-id', 'user-id-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if program is already inactive', async () => {
      const inactiveProgram = new ProgramEntity(
        'program-id-1',
        'Test Program',
        'TEST',
        'Description',
        'Faculty',
        false, // already inactive
        new Date(),
        new Date(),
      );

      programRepository.findById.mockResolvedValue(inactiveProgram);

      await expect(service.deactivateProgram('program-id-1', 'user-id-1')).rejects.toThrow(
        ConflictException,
      );
      expect(programRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('reactivateProgram', () => {
    it('should reactivate a program successfully', async () => {
      const inactiveProgram = new ProgramEntity(
        'program-id-1',
        'Test Program',
        'TEST',
        'Description',
        'Faculty',
        false, // inactive
        new Date(),
        new Date(),
      );

      const reactivatedEntity = new ProgramEntity(
        inactiveProgram.id,
        inactiveProgram.name,
        inactiveProgram.code,
        inactiveProgram.description,
        inactiveProgram.facultyName,
        true, // isActive = true
        inactiveProgram.createdAt,
        new Date(),
      );

      programRepository.findById.mockResolvedValue(inactiveProgram);
      programRepository.update.mockResolvedValue(reactivatedEntity);

      const result = await service.reactivateProgram('program-id-1', 'user-id-1');

      expect(programRepository.findById).toHaveBeenCalledWith('program-id-1');
      expect(programRepository.update).toHaveBeenCalled();
      expect(result.isActive).toBe(true);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw ConflictException if program is already active', async () => {
      programRepository.findById.mockResolvedValue(mockProgramEntity); // already active

      await expect(service.reactivateProgram('program-id-1', 'user-id-1')).rejects.toThrow(
        ConflictException,
      );
      expect(programRepository.update).not.toHaveBeenCalled();
    });
  });
});
