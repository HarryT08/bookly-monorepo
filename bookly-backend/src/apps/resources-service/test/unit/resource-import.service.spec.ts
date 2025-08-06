import { Test, TestingModule } from '@nestjs/testing';
import { ResourceImportService } from '../../application/services/resource-import.service';
import { ResourceImportRepository } from '../../domain/repositories/resource-import.repository';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { ResourceImportEntity } from '../../domain/entities/resource-import.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ImportStatus } from '../../application/dtos/resource-import.dto';
import * as Multer from 'multer';

describe('ResourceImportService', () => {
  let service: ResourceImportService;
  let resourceImportRepository: jest.Mocked<ResourceImportRepository>;
  let resourceRepository: jest.Mocked<ResourceRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockResourceImportEntity = new ResourceImportEntity(
    'import-id-1',
    'recursos.csv',
    'recursos_original.csv',
    100,
    95,
    5,
    ImportStatus.COMPLETED,
    [{ row: 1, error: 'Nombre duplicado' }] as any,
    { totalProcessed: 100, successful: 95, failed: 5 } as any,
    'user-id-1',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
  );

  const mockCsvBuffer = Buffer.from(`name,type,capacity,location,description
Aula 101,SALON,40,Edificio A,Aula magistral
Lab Sistemas,LABORATORIO,30,Edificio B,Laboratorio de cómputo
Auditorio Principal,AUDITORIO,200,Edificio Central,Auditorio con sonido`);

  beforeEach(async () => {
    const mockResourceImportRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByUser: jest.fn(),
      findWithPagination: jest.fn(),
      getStatistics: jest.fn(),
      deleteOldImports: jest.fn(),
    };

    const mockResourceRepository = {
      findByCode: jest.fn(),
      create: jest.fn(),
    };

    const mockLoggingService = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceImportService,
        {
          provide: 'ResourceImportRepository',
          useValue: mockResourceImportRepository,
        },
        {
          provide: 'ResourceRepository',
          useValue: mockResourceRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<ResourceImportService>(ResourceImportService);
    resourceImportRepository = module.get('ResourceImportRepository');
    resourceRepository = module.get('ResourceRepository');
    loggingService = module.get(LoggingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('previewImport', () => {
    const mockFile = {
      originalname: 'recursos.csv',
      buffer: mockCsvBuffer,
      mimetype: 'text/csv',
    } as Multer.File;

    it('should preview import successfully with valid CSV', async () => {
      resourceRepository.findByCode.mockResolvedValue(null);

      const result = await service.previewImport(mockFile, 'user-id-1');

      expect(result.filename).toBe('recursos.csv');
      expect(result.totalRows).toBe(3);
      expect(result.validRows).toBe(3);
      expect(result.invalidRows).toBe(0);
      expect(result.rows).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect validation errors in preview', async () => {
      const invalidCsvBuffer = Buffer.from(`name,type,capacity,location,description
,SALON,40,Edificio A,Aula sin nombre
Aula 102,TIPO_INVALIDO,abc,Edificio B,Capacidad inválida`);

      const invalidFile = {
        originalname: 'recursos_invalidos.csv',
        buffer: invalidCsvBuffer,
        mimetype: 'text/csv',
      } as Multer.File;

      const result = await service.previewImport(invalidFile, 'user-id-1');

      expect(result.totalRows).toBe(2);
      expect(result.validRows).toBe(0);
      expect(result.invalidRows).toBe(2);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestException for non-CSV file', async () => {
      const nonCsvFile = {
        originalname: 'documento.txt',
        buffer: Buffer.from('contenido de texto'),
        mimetype: 'text/plain',
      } as Multer.File;

      await expect(service.previewImport(nonCsvFile, 'user-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for empty file', async () => {
      const emptyFile = {
        originalname: 'vacio.csv',
        buffer: Buffer.from(''),
        mimetype: 'text/csv',
      } as Multer.File;

      await expect(service.previewImport(emptyFile, 'user-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should detect duplicate names in existing resources', async () => {
      resourceRepository.findByCode.mockImplementation((code) => {
        if (code === 'Aula 101') {
          return Promise.resolve({ id: 'existing-resource-id' } as any);
        }
        return Promise.resolve(null);
      });

      const result = await service.previewImport(mockFile, 'user-id-1');

      expect(result.validRows).toBe(2); // One duplicate detected
      expect(result.invalidRows).toBe(1);
      expect(result.errors.some(error => error.includes('ya existe'))).toBe(true);
    });
  });

  describe('startImport', () => {
    const mockFile = {
      originalname: 'recursos.csv',
      buffer: mockCsvBuffer,
      mimetype: 'text/csv',
    } as Multer.File;

    it('should start import successfully', async () => {
      resourceImportRepository.create.mockResolvedValue(mockResourceImportEntity);

      const result = await service.startImport(mockFile, 'user-id-1');

      expect(resourceImportRepository.create).toHaveBeenCalled();
      expect(result.id).toBe(mockResourceImportEntity.id);
      expect(result.status).toBe(ImportStatus.COMPLETED);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid file', async () => {
      const invalidFile = {
        originalname: 'documento.txt',
        buffer: Buffer.from('contenido'),
        mimetype: 'text/plain',
      } as Multer.File;

      await expect(service.startImport(invalidFile, 'user-id-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getImportById', () => {
    it('should return import by id', async () => {
      resourceImportRepository.findById.mockResolvedValue(mockResourceImportEntity);

      const result = await service.getImportById('import-id-1');

      expect(resourceImportRepository.findById).toHaveBeenCalledWith('import-id-1');
      expect(result).toEqual({
        id: mockResourceImportEntity.id,
        filename: mockResourceImportEntity.filename,
        originalFilename: mockResourceImportEntity.originalFilename,
        totalRows: mockResourceImportEntity.totalRows,
        successfulRows: mockResourceImportEntity.successfulRows,
        failedRows: mockResourceImportEntity.failedRows,
        status: mockResourceImportEntity.status,
        errors: mockResourceImportEntity.errors,
        summary: mockResourceImportEntity.summary,
        importedBy: mockResourceImportEntity.importedBy,
        importedAt: mockResourceImportEntity.importedAt,
        completedAt: mockResourceImportEntity.completedAt,
      });
    });

    it('should throw NotFoundException if import does not exist', async () => {
      resourceImportRepository.findById.mockResolvedValue(null);

      await expect(service.getImportById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserImports', () => {
    it('should return user imports with pagination', async () => {
      const mockImports = [mockResourceImportEntity];
      resourceImportRepository.findByUser.mockResolvedValue(mockImports);

      const result = await service.getImportsByUser('user-id-1');

      expect(resourceImportRepository.findByUser).toHaveBeenCalledWith('user-id-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllImports', () => {
    it('should return all imports with pagination and filters', async () => {
      const mockImports = [mockResourceImportEntity];
      resourceImportRepository.findWithPagination.mockResolvedValue({
        imports: mockImports,
        total: 1,
      });

      const result = await service.getImports(1, 10, {
        status: ImportStatus.COMPLETED,
        userId: 'user-id-1',
      });

      expect(resourceImportRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        status: ImportStatus.COMPLETED,
        userId: 'user-id-1',
      });
      expect(result.imports).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should return imports without filters', async () => {
      const mockImports = [mockResourceImportEntity];
      resourceImportRepository.findWithPagination.mockResolvedValue({
        imports: mockImports,
        total: 1,
      });

      const result = await service.getImports(1, 10);

      expect(resourceImportRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {});
      expect(result.imports).toHaveLength(1);
    });
  });

  describe('getImportStatistics', () => {
    it('should return general statistics', async () => {
      const mockStats = {
        totalImports: 10,
        completedImports: 8,
        failedImports: 1,
        pendingImports: 1,
        totalResourcesImported: 500,
        averageSuccessRate: 95.5,
      };

      resourceImportRepository.getStatistics.mockResolvedValue(mockStats as any);

      const result = await service.getImportStatistics();

      expect(resourceImportRepository.getStatistics).toHaveBeenCalledWith();
      expect(result).toEqual(mockStats);
    });

    it('should return user-specific statistics', async () => {
      const mockUserStats = {
        totalImports: 3,
        completedImports: 2,
        failedImports: 0,
        pendingImports: 1,
        totalResourcesImported: 150,
        averageSuccessRate: 98.0,
      };

      resourceImportRepository.getStatistics.mockResolvedValue(mockUserStats as any);

      const result = await service.getImportStatistics('user-id-1');

      expect(resourceImportRepository.getStatistics).toHaveBeenCalledWith('user-id-1');
      expect(result).toEqual(mockUserStats);
    });
  });

  describe('processImportAsync', () => {
    it('should process import successfully', async () => {
      const pendingImport = new ResourceImportEntity(
        'import-id-1',
        'recursos.csv',
        'recursos_original.csv',
        3,
        0,
        0,
        ImportStatus.PENDING,
        null,
        null,
        'user-id-1',
        new Date(),
        null,
      );

      resourceImportRepository.findById.mockResolvedValue(pendingImport);
      resourceImportRepository.update.mockResolvedValue(mockResourceImportEntity);
      resourceRepository.findByCode.mockResolvedValue(null);
      resourceRepository.create.mockResolvedValue({} as any);

      // Mock the CSV parsing
      jest.spyOn(service as any, 'parseCsvData').mockResolvedValue([
        { name: 'Aula 101', type: 'SALON', capacity: 40, location: 'Edificio A', description: 'Aula magistral' },
        { name: 'Lab Sistemas', type: 'LABORATORIO', capacity: 30, location: 'Edificio B', description: 'Laboratorio de cómputo' },
        { name: 'Auditorio Principal', type: 'AUDITORIO', capacity: 200, location: 'Edificio Central', description: 'Auditorio con sonido' },
      ]);

      await service.processImportAsync('import-id-1', mockCsvBuffer, 'user-id-1');

      expect(resourceImportRepository.findById).toHaveBeenCalledWith('import-id-1');
      expect(resourceImportRepository.update).toHaveBeenCalled();
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should handle processing errors gracefully', async () => {
      const pendingImport = new ResourceImportEntity(
        'import-id-1',
        'recursos.csv',
        'recursos_original.csv',
        3,
        0,
        0,
        ImportStatus.PENDING,
        null,
        null,
        'user-id-1',
        new Date(),
        null,
      );

      resourceImportRepository.findById.mockResolvedValue(pendingImport);
      resourceImportRepository.update.mockResolvedValue(mockResourceImportEntity);

      // Mock parsing to throw error
      jest.spyOn(service as any, 'parseCsvData').mockRejectedValue(new Error('CSV parsing failed'));

      await service.processImportAsync('import-id-1', mockCsvBuffer, 'user-id-1');

      expect(resourceImportRepository.update).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: ImportStatus.FAILED,
        }),
      );
      expect(loggingService.error).toHaveBeenCalled();
    });

    it('should throw NotFoundException if import does not exist', async () => {
      resourceImportRepository.findById.mockResolvedValue(null);

      await expect(
        service.processImportAsync('non-existent-id', mockCsvBuffer, 'user-id-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateCsvRow', () => {
    it('should validate correct CSV row', () => {
      const validRow = {
        name: 'Aula 101',
        type: 'SALON',
        capacity: '40',
        location: 'Edificio A',
        description: 'Aula magistral',
      };

      const result = (service as any).validateCsvRow(validRow, 1);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidRow = {
        name: '',
        type: 'SALON',
        capacity: '40',
        location: 'Edificio A',
        description: 'Aula magistral',
      };

      const result = (service as any).validateCsvRow(invalidRow, 1);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((error: string) => error.includes('nombre'))).toBe(true);
    });

    it('should detect invalid capacity', () => {
      const invalidRow = {
        name: 'Aula 101',
        type: 'SALON',
        capacity: 'abc',
        location: 'Edificio A',
        description: 'Aula magistral',
      };

      const result = (service as any).validateCsvRow(invalidRow, 1);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((error: string) => error.includes('capacidad'))).toBe(true);
    });

    it('should detect invalid resource type', () => {
      const invalidRow = {
        name: 'Aula 101',
        type: 'TIPO_INVALIDO',
        capacity: '40',
        location: 'Edificio A',
        description: 'Aula magistral',
      };

      const result = (service as any).validateCsvRow(invalidRow, 1);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((error: string) => error.includes('tipo'))).toBe(true);
    });
  });

  describe('cleanupOldImports', () => {
    it('should cleanup old imports successfully', async () => {
      resourceImportRepository.deleteOldImports.mockResolvedValue(5);

      const result = await service.cleanupOldImports(30);

      expect(resourceImportRepository.deleteOldImports).toHaveBeenCalledWith(30);
      expect(result).toBe(5);
      expect(loggingService.log).toHaveBeenCalled();
    });
  });
});
