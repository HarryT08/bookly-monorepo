import { Test, TestingModule } from '@nestjs/testing';
import { ResourceResponsibleService } from '../../application/services/resource-responsible.service';
import { ResourceResponsibleRepository } from '../../domain/repositories/resource-responsible.repository';
import { ResourceRepository } from '../../domain/repositories/resource.repository';
import { UserRepository } from '../../../auth-service/domain/repositories/user.repository';
import { LoggingService } from '@libs/logging/logging.service';
import { ResourceResponsibleEntity } from '../../domain/entities/resource-responsible.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  AssignResponsibleDto, 
  AssignMultipleResponsiblesDto, 
  ReplaceResourceResponsiblesDto,
  DeactivateResponsibleDto,
  GetResourceResponsiblesDto,
  GetUserResponsibilitiesDto,
  GetResourcesByUserDto,
  IsUserResponsibleDto,
  GetResponsibilitiesDto,
  BulkAssignResponsibleDto,
  TransferResponsibilitiesDto
} from '@libs/dto/resources/resource-responsible.dto';

describe('ResourceResponsibleService', () => {
  let service: ResourceResponsibleService;
  let resourceResponsibleRepository: jest.Mocked<ResourceResponsibleRepository>;
  let resourceRepository: jest.Mocked<ResourceRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockResourceResponsibleEntity = new ResourceResponsibleEntity(
    'responsible-id-1',
    'resource-id-1',
    'user-id-1',
    'admin-id-1',
    new Date('2024-01-01'),
    true,
  );

  const mockResource = {
    id: 'resource-id-1',
    name: 'Aula 101',
    type: 'SALON',
    capacity: 40,
  };

  const mockUser = {
    id: 'user-id-1',
    email: 'usuario@ufps.edu.co',
    name: 'Usuario Test',
    isActive: true,
  };

  const mockAdmin = {
    id: 'admin-id-1',
    email: 'admin@ufps.edu.co',
    name: 'Admin Test',
    isActive: true,
  };

  beforeEach(async () => {
    const mockResourceResponsibleRepository = {
      findByResourceAndUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByResource: jest.fn(),
      findByUser: jest.fn(),
      findWithPagination: jest.fn(),
      deactivateByResourceAndUser: jest.fn(),
      deactivateByResource: jest.fn(),
    };

    const mockResourceRepository = {
      findById: jest.fn(),
    };

    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockLoggingService = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceResponsibleService,
        {
          provide: 'ResourceResponsibleRepository',
          useValue: mockResourceResponsibleRepository,
        },
        {
          provide: 'ResourceRepository',
          useValue: mockResourceRepository,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<ResourceResponsibleService>(ResourceResponsibleService);
    resourceResponsibleRepository = module.get('ResourceResponsibleRepository');
    resourceRepository = module.get('ResourceRepository');
    userRepository = module.get('UserRepository');
    loggingService = module.get(LoggingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignResponsible', () => {
    it('should assign responsible to resource successfully', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);
      resourceResponsibleRepository.create.mockResolvedValue(mockResourceResponsibleEntity);

      const result = await service.assignResponsible({
        resourceId: 'resource-id-1',
        userId: 'user-id-1',
        assignedBy: 'admin-id-1',
      });

      expect(resourceRepository.findById).toHaveBeenCalledWith('resource-id-1');
      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(resourceResponsibleRepository.findByResourceAndUser).toHaveBeenCalledWith(
        'resource-id-1',
        'user-id-1',
      );
      expect(resourceResponsibleRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockResourceResponsibleEntity.id,
        resourceId: mockResourceResponsibleEntity.resourceId,
        userId: mockResourceResponsibleEntity.userId,
        assignedBy: mockResourceResponsibleEntity.assignedBy,
        assignedAt: mockResourceResponsibleEntity.assignedAt,
        isActive: mockResourceResponsibleEntity.isActive,
      });
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if resource does not exist', async () => {
      resourceRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignResponsible({ resourceId: 'non-existent-resource', userId: 'user-id-1', assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(resourceResponsibleRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.assignResponsible({ resourceId: 'resource-id-1', userId: 'non-existent-user', assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(NotFoundException);
      expect(resourceResponsibleRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already responsible', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(
        mockResourceResponsibleEntity,
      );

      await expect(
        service.assignResponsible({ resourceId: 'resource-id-1', userId: 'user-id-1', assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(ConflictException);
      expect(resourceResponsibleRepository.create).not.toHaveBeenCalled();
    });

    it('should reactivate if user was previously responsible but inactive', async () => {
      const inactiveResponsible = new ResourceResponsibleEntity(
        'responsible-id-1',
        'resource-id-1',
        'user-id-1',
        'admin-id-1',
        new Date('2024-01-01'),
        false, // inactive
      );

      const reactivatedResponsible = new ResourceResponsibleEntity(
        'responsible-id-1',
        'resource-id-1',
        'user-id-1',
        'admin-id-1',
        new Date('2024-01-01'),
        true, // reactivated
      );

      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(inactiveResponsible);
      resourceResponsibleRepository.reactivate.mockResolvedValue();

      const result = await service.assignResponsible({
        resourceId: 'resource-id-1',
        userId: 'user-id-1',
        assignedBy: 'admin-id-1',
      });

      expect(resourceResponsibleRepository.reactivate).toHaveBeenCalled();
      expect(result.isActive).toBe(true);
      expect(loggingService.log).toHaveBeenCalled();
    });
  });

  describe('assignMultipleResponsibles', () => {
    it('should assign multiple responsibles successfully', async () => {
      const userIds = ['user-id-1', 'user-id-2'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);
      resourceResponsibleRepository.create.mockResolvedValue(mockResourceResponsibleEntity);

      const result = await service.assignMultipleResponsibles({
        resourceId: 'resource-id-1',
        userIds,
        assignedBy: 'admin-id-1',
      });

      expect(resourceRepository.findById).toHaveBeenCalledWith('resource-id-1');
      expect(userRepository.findById).toHaveBeenCalledTimes(2);
      expect(resourceResponsibleRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no users provided', async () => {
      await expect(
        service.assignMultipleResponsibles({ resourceId: 'resource-id-1', userIds: [], assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should skip non-existent users', async () => {
      const userIds = ['user-id-1', 'non-existent-user'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById
        .mockResolvedValueOnce(mockUser as any) // First user exists
        .mockResolvedValueOnce(null); // Second user doesn't exist
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);
      resourceResponsibleRepository.create.mockResolvedValue(mockResourceResponsibleEntity);

      const result = await service.assignMultipleResponsibles({
        resourceId: 'resource-id-1',
        userIds,
        assignedBy: 'admin-id-1',
      });

      expect(resourceResponsibleRepository.create).toHaveBeenCalledTimes(1); // Only one assignment
      expect(result).toHaveLength(1);
    });
  });

  describe('replaceResourceResponsibles', () => {
    it('should replace all resource responsibles successfully', async () => {
      const newUserIds = ['user-id-2', 'user-id-3'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.deactivate.mockResolvedValue(undefined);
      resourceResponsibleRepository.create.mockResolvedValue(mockResourceResponsibleEntity);

      const result = await service.replaceResourceResponsibles({
        resourceId: 'resource-id-1',
        userIds: newUserIds,
        assignedBy: 'admin-id-1',
      });

      expect(resourceRepository.findById).toHaveBeenCalledWith('resource-id-1');
      expect(resourceResponsibleRepository.deactivateAllByResource).toHaveBeenCalledWith('resource-id-1');
      expect(userRepository.findById).toHaveBeenCalledTimes(2);
      expect(resourceResponsibleRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no users provided', async () => {
      await expect(
        service.replaceResourceResponsibles({ resourceId: 'resource-id-1', userIds: [], assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deactivateResponsible', () => {
    it('should deactivate responsible successfully', async () => {
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(
        mockResourceResponsibleEntity,
      );
      resourceResponsibleRepository.deactivate.mockResolvedValue(undefined);

      await service.deactivateResponsible({ resourceId: 'resource-id-1', userId: 'user-id-1' });

      expect(resourceResponsibleRepository.findByResourceAndUser).toHaveBeenCalledWith(
        'resource-id-1',
        'user-id-1',
      );
      expect(resourceResponsibleRepository.deactivate).toHaveBeenCalledWith(
        'resource-id-1',
        'user-id-1',
      );
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if assignment does not exist', async () => {
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);

      await expect(
        service.deactivateResponsible({ resourceId: 'resource-id-1', userId: 'user-id-1' }),
      ).rejects.toThrow(NotFoundException);
      expect(resourceResponsibleRepository.deactivate).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if assignment is already inactive', async () => {
      const inactiveResponsible = new ResourceResponsibleEntity(
        'responsible-id-1',
        'resource-id-1',
        'user-id-1',
        'admin-id-1',
        new Date('2024-01-01'),
        false, // already inactive
      );

      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(inactiveResponsible);

      await expect(
        service.deactivateResponsible({ resourceId: 'resource-id-1', userId: 'user-id-1' }),
      ).rejects.toThrow(ConflictException);
      expect(resourceResponsibleRepository.deactivate).not.toHaveBeenCalled();
    });
  });

  describe('getResourceResponsibles', () => {
    it('should return active resource responsibles by default', async () => {
      const mockResponsibles = [mockResourceResponsibleEntity];
      resourceResponsibleRepository.findByResourceId.mockResolvedValue(mockResponsibles);

      const result = await service.getResourceResponsibles({ resourceId: 'resource-id-1' });

      expect(resourceResponsibleRepository.findByResourceId).toHaveBeenCalledWith(
        'resource-id-1',
        true, // activeOnly = true by default
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockResourceResponsibleEntity.id,
        resourceId: mockResourceResponsibleEntity.resourceId,
        userId: mockResourceResponsibleEntity.userId,
        assignedBy: mockResourceResponsibleEntity.assignedBy,
        assignedAt: mockResourceResponsibleEntity.assignedAt,
        isActive: mockResourceResponsibleEntity.isActive,
      });
    });

    it('should return all responsibles when activeOnly is false', async () => {
      const mockResponsibles = [mockResourceResponsibleEntity];
      resourceResponsibleRepository.findByResourceId.mockResolvedValue(mockResponsibles);

      const result = await service.getResourceResponsibles({ resourceId: 'resource-id-1', activeOnly: false });

      expect(resourceResponsibleRepository.findByResourceId).toHaveBeenCalledWith(
        'resource-id-1',
        false,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getUserResponsibilities', () => {
    it('should return user responsibilities', async () => {
      const mockResponsibilities = [mockResourceResponsibleEntity];
      resourceResponsibleRepository.findByUserId.mockResolvedValue(mockResponsibilities);

      const result = await service.getUserResponsibilities({ userId: 'user-id-1' });

      expect(resourceResponsibleRepository.findByUserId).toHaveBeenCalledWith('user-id-1', true);
      expect(result).toHaveLength(1);
    });
  });

  describe('getResourcesByUser', () => {
    it('should return resources by user with pagination', async () => {
      const mockAssignments = [mockResourceResponsibleEntity];
      resourceResponsibleRepository.findWithPagination.mockResolvedValue({
        responsibles: mockAssignments,
        total: 1,
      });

      const result = await service.getResourcesByUser({ userId: 'user-id-1', page: 1, limit: 10 });

      expect(resourceResponsibleRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        userId: 'user-id-1',
        isActive: true,
      });
      expect(result.assignments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('isUserResponsibleForResource', () => {
    it('should return true if user is responsible for resource', async () => {
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(
        mockResourceResponsibleEntity,
      );

      const result = await service.isUserResponsibleForResource({ resourceId: 'resource-id-1', userId: 'user-id-1' });

      expect(resourceResponsibleRepository.findByResourceAndUser).toHaveBeenCalledWith(
        'resource-id-1',
        'user-id-1',
      );
      expect(result).toBe(true);
    });

    it('should return false if user is not responsible for resource', async () => {
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);

      const result = await service.isUserResponsibleForResource({ resourceId: 'resource-id-1', userId: 'user-id-1' });

      expect(result).toBe(false);
    });

    it('should return false if responsibility is inactive', async () => {
      const inactiveResponsible = new ResourceResponsibleEntity(
        'responsible-id-1',
        'resource-id-1',
        'user-id-1',
        'admin-id-1',
        new Date('2024-01-01'),
        false, // inactive
      );

      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(inactiveResponsible);

      const result = await service.isUserResponsibleForResource({ resourceId: 'resource-id-1', userId: 'user-id-1' });

      expect(result).toBe(false);
    });
  });

  describe('bulkAssignResponsibleToResources', () => {
    it('should bulk assign responsible to multiple resources successfully', async () => {
      const resourceIds = ['resource-id-1', 'resource-id-2'];
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);
      resourceResponsibleRepository.create.mockResolvedValue(mockResourceResponsibleEntity);

      const result = await service.bulkAssignResponsibleToResources({
        resourceIds,
        userId: 'user-id-1',
        assignedBy: 'admin-id-1',
      });

      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(resourceRepository.findById).toHaveBeenCalledTimes(2);
      expect(resourceResponsibleRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no resources provided', async () => {
      await expect(
        service.bulkAssignResponsibleToResources({ resourceIds: [], userId: 'user-id-1', assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('transferResponsibilities', () => {
    it('should transfer all responsibilities from one user to another', async () => {
      const mockCurrentResponsibilities = [mockResourceResponsibleEntity];
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByUserId.mockResolvedValue(mockCurrentResponsibilities);
      resourceResponsibleRepository.deactivate.mockResolvedValue(undefined);
      resourceResponsibleRepository.create.mockResolvedValue(mockResourceResponsibleEntity);

      const result = await service.transferResponsibilities({
        fromUserId: 'user-id-1',
        toUserId: 'user-id-2',
        assignedBy: 'admin-id-1',
      });

      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(userRepository.findById).toHaveBeenCalledWith('user-id-2');
      expect(resourceResponsibleRepository.findByUserId).toHaveBeenCalledWith('user-id-1', true);
      expect(resourceResponsibleRepository.deactivate).toHaveBeenCalled();
      expect(resourceResponsibleRepository.create).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should transfer specific resources when resourceIds provided', async () => {
      const specificResourceIds = ['resource-id-1'];
      const mockCurrentResponsibilities = [mockResourceResponsibleEntity];
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByUserId.mockResolvedValue(mockCurrentResponsibilities);
      resourceResponsibleRepository.deactivate.mockResolvedValue(undefined);
      resourceResponsibleRepository.create.mockResolvedValue(mockResourceResponsibleEntity);

      const result = await service.transferResponsibilities({
        fromUserId: 'user-id-1',
        toUserId: 'user-id-2',
        assignedBy: 'admin-id-1',
        resourceIds: specificResourceIds,
      });

      expect(result).toHaveLength(1);
      expect(loggingService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if fromUser does not exist', async () => {
      userRepository.findById.mockResolvedValueOnce(null); // fromUser doesn't exist

      await expect(
        service.transferResponsibilities({ fromUserId: 'non-existent-user', toUserId: 'user-id-2', assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if toUser does not exist', async () => {
      userRepository.findById
        .mockResolvedValueOnce(mockUser as any) // fromUser exists
        .mockResolvedValueOnce(null); // toUser doesn't exist

      await expect(
        service.transferResponsibilities({ fromUserId: 'user-id-1', toUserId: 'non-existent-user', assignedBy: 'admin-id-1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateResponsibilityAssignment', () => {
    it('should return valid for correct assignment data', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(null);

      const result = await service.validateResponsibilityAssignment(
        'resource-id-1',
        ['user-id-1'],
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for non-existent resource', async () => {
      resourceRepository.findById.mockResolvedValue(null);

      const result = await service.validateResponsibilityAssignment(
        'non-existent-resource',
        ['user-id-1'],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('recurso no existe'))).toBe(true);
    });

    it('should return invalid for non-existent users', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(null);

      const result = await service.validateResponsibilityAssignment(
        'resource-id-1',
        ['non-existent-user'],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('usuario no existe'))).toBe(true);
    });

    it('should return invalid for already assigned users', async () => {
      resourceRepository.findById.mockResolvedValue(mockResource as any);
      userRepository.findById.mockResolvedValue(mockUser as any);
      resourceResponsibleRepository.findByResourceAndUser.mockResolvedValue(
        mockResourceResponsibleEntity,
      );

      const result = await service.validateResponsibilityAssignment(
        'resource-id-1',
        ['user-id-1'],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('ya es responsable'))).toBe(true);
    });

    it('should throw BadRequestException if no users provided', async () => {
      await expect(
        service.validateResponsibilityAssignment('resource-id-1', []),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getResponsibilities', () => {
    it('should return responsibilities with pagination and filters', async () => {
      const mockAssignments = [mockResourceResponsibleEntity];
      resourceResponsibleRepository.findWithPagination.mockResolvedValue({
        responsibles: mockAssignments,
        total: 1,
      });

      const result = await service.getResponsibilities({
        page: 1,
        limit: 10,
        resourceId: 'resource-id-1',
        userId: 'user-id-1',
        isActive: true,
      });

      expect(resourceResponsibleRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        resourceId: 'resource-id-1',
        userId: 'user-id-1',
        isActive: true,
      });
      expect(result.responsibles).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('deactivateAllResourceResponsibles', () => {
    it('should deactivate all resource responsibles successfully', async () => {
      resourceResponsibleRepository.deactivateAllByResource.mockResolvedValue(undefined);

      await service.deactivateAllResourceResponsibles('resource-id-1');

      expect(resourceResponsibleRepository.deactivateAllByResource).toHaveBeenCalledWith('resource-id-1');
      expect(loggingService.log).toHaveBeenCalled();
    });
  });
});
