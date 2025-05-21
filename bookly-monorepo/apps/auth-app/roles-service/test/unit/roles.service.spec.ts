import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from '../../src/infrastructure/services/roles.service';
import { Role } from '../../src/domain/entities/role.entity';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { RoleEventsPublisher } from '../../src/infrastructure/event-publishers/role-events.publisher';

// Tipos para facilitar el testing
type MockRoleDocument = Partial<Role> & {
  _id: string;
  id: string;
  name: string;
  description: string;
  permissions: string[];
  save: jest.Mock;
  toJSON: jest.Mock;
}

// Mock partial para consultas de mongoose
type MockQuery = {
  exec: jest.Mock;
  // Propiedades mínimas necesarias para el tipo Query<...>
  _mongooseOptions: any;
}

// Tipo para el constructor del modelo
type ModelConstructor = (doc?: Record<string, unknown>) => MockRoleDocument;

/**
 * Datos mock para pruebas
 */
const mockRole: MockRoleDocument = {
  _id: 'role-id-123',
  id: 'role-id-123',
  name: 'admin',
  description: 'Administrator role',
  permissions: ['read', 'write', 'delete'],
  toJSON: jest.fn().mockReturnValue({
    id: 'role-id-123',
    name: 'admin',
    description: 'Administrator role',
    permissions: ['read', 'write', 'delete'],
  }),
  save: jest.fn(),
};

// Configurar el mock para retornarse a sí mismo después de definirlo
mockRole.save.mockResolvedValue(mockRole);

// DTOs de ejemplo para las pruebas
const createRoleDto = {
  name: 'admin',
  description: 'Administrator role',
  permissions: ['read', 'write', 'delete'],
};

const updateRoleDto = {
  description: 'Updated Administrator role',
  permissions: ['read', 'write', 'delete', 'admin'],
};

describe('RolesService', () => {
  // Dependencias del servicio
  let service: RolesService;
  let roleModel: Model<Role>;
  let roleEventsPublisher: RoleEventsPublisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockRole]),
            }),
            findById: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRole),
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRole),
            }),
            findByIdAndDelete: jest.fn().mockResolvedValue(true),
            new: jest.fn().mockResolvedValue(mockRole),
            constructor: jest.fn().mockResolvedValue(mockRole),
          },
        },
        {
          provide: RoleEventsPublisher,
          useValue: {
            publishRoleCreated: jest.fn(),
            publishRoleUpdated: jest.fn(),
            publishRoleDeleted: jest.fn(),
            publishRoleAssigned: jest.fn(),
          },
        },
      ],
    }).compile();

    // Obtener las instancias necesarias del módulo de prueba
    service = module.get<RolesService>(RolesService);
    roleModel = module.get<Model<Role>>(getModelToken(Role.name));
    roleEventsPublisher = module.get<RoleEventsPublisher>(RoleEventsPublisher);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Pruebas para el método findAll
   */
  describe('findAll', () => {
    it('should return an array of roles', async () => {
      // Ejecutar método bajo prueba
      const result = await service.findAll();
      
      // Verificaciones
      expect(result).toEqual([mockRole]);
      expect(roleModel.find).toHaveBeenCalled();
    });
  });

  /**
   * Pruebas para el método findById
   */
  describe('findById', () => {
    it('should return a single role when role exists', async () => {
      // Ejecutar método bajo prueba
      const result = await service.findById('role-id-123');
      
      // Verificaciones
      expect(result).toEqual(mockRole);
      expect(roleModel.findById).toHaveBeenCalledWith('role-id-123');
    });

    it('should throw a NotFoundException when role does not exist', async () => {
      // Configurar mock para simular rol no encontrado
      jest.spyOn(roleModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
        _mongooseOptions: {}
      } as any);

      // Verificar que se lanza la excepción apropiada
      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pruebas para el método findByName
   */
  describe('findByName', () => {
    it('should return a single role when role exists', async () => {
      // Ejecutar método bajo prueba
      const result = await service.findByName('admin');
      
      // Verificaciones
      expect(result).toEqual(mockRole);
      expect(roleModel.findOne).toHaveBeenCalledWith({ name: 'admin' });
    });

    it('should throw a NotFoundException when role does not exist', async () => {
      // Configurar mock para simular rol no encontrado
      jest.spyOn(roleModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
        _mongooseOptions: {}
      } as any);

      // Verificar que se lanza la excepción apropiada
      await expect(service.findByName('nonexistent-name')).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pruebas para el método create
   */
  describe('create', () => {
    it('should create a new role and publish an event', async () => {
      // Configurar mock para constructor del modelo
      jest.spyOn(roleModel as unknown as { constructor: ModelConstructor }, 'constructor')
        .mockImplementationOnce(() => mockRole);
      
      // Ejecutar método bajo prueba
      const result = await service.create(createRoleDto);
      
      // Verificaciones
      expect(result).toEqual(mockRole);
      expect(mockRole.save).toHaveBeenCalled();
      expect(roleEventsPublisher.publishRoleCreated).toHaveBeenCalledWith(mockRole);
    });
  });

  /**
   * Pruebas para el método update
   */
  describe('update', () => {
    it('should update a role and publish an event', async () => {
      // Configurar mock para findById
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockRole as any);

      // Ejecutar método bajo prueba
      const result = await service.update('role-id-123', updateRoleDto);

      // Verificaciones
      expect(result).toEqual(mockRole);
      expect(mockRole.save).toHaveBeenCalled();
      expect(roleEventsPublisher.publishRoleUpdated).toHaveBeenCalledWith(mockRole, updateRoleDto);
    });
  });

  /**
   * Pruebas para el método remove
   */
  describe('remove', () => {
    it('should remove a role and publish an event', async () => {
      // Configurar mock para findById
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockRole as any);

      // Ejecutar método bajo prueba
      const result = await service.remove('role-id-123');

      // Verificaciones
      expect(result).toEqual({ id: 'role-id-123', message: 'Role deleted successfully' });
      expect(roleModel.findByIdAndDelete).toHaveBeenCalledWith('role-id-123');
      expect(roleEventsPublisher.publishRoleDeleted).toHaveBeenCalledWith('role-id-123');
    });
  });

  /**
   * Pruebas para el método assignRoleToUser
   */
  describe('assignRoleToUser', () => {
    it('should assign a role to a user and publish an event', async () => {
      // Configurar mock para findById
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockRole as any);

      // Ejecutar método bajo prueba
      const result = await service.assignRoleToUser('user-id-123', 'role-id-123');

      // Verificaciones
      expect(result).toEqual({ message: `Role admin assigned to user user-id-123 successfully` });
      expect(roleEventsPublisher.publishRoleAssigned).toHaveBeenCalledWith({
        userId: 'user-id-123',
        roleId: 'role-id-123',
        roleName: 'admin'
      });
    });
  });
});
