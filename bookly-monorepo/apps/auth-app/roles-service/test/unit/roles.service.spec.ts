import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from '../../src/infrastructure/services/roles.service';
import { Role } from '../../src/domain/entities/role.entity';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

const mockRole = {
  _id: 'role-id-123',
  name: 'admin',
  description: 'Administrator role',
  permissions: ['read', 'write', 'delete'],
  toJSON: jest.fn().mockReturnValue({
    id: 'role-id-123',
    name: 'admin',
    description: 'Administrator role',
    permissions: ['read', 'write', 'delete'],
  }),
  save: jest.fn().mockReturnThis(),
};

describe('RolesService', () => {
  let service: RolesService;
  let roleModel: Model<Role>;
  let eventBus: EventBusService;

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
          provide: EventBusService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleModel = module.get<Model<Role>>(getModelToken(Role.name));
    eventBus = module.get<EventBusService>(EventBusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockRole]);
      expect(roleModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a single role when role exists', async () => {
      const result = await service.findById('role-id-123');
      expect(result).toEqual(mockRole);
      expect(roleModel.findById).toHaveBeenCalledWith('role-id-123');
    });

    it('should throw a NotFoundException when role does not exist', async () => {
      jest.spyOn(roleModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('should return a single role when role exists', async () => {
      const result = await service.findByName('admin');
      expect(result).toEqual(mockRole);
      expect(roleModel.findOne).toHaveBeenCalledWith({ name: 'admin' });
    });

    it('should throw a NotFoundException when role does not exist', async () => {
      jest.spyOn(roleModel, 'findOne').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findByName('nonexistent-name')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new role and publish an event', async () => {
      const createRoleDto = {
        name: 'admin',
        description: 'Administrator role',
        permissions: ['read', 'write', 'delete'],
      };

      jest.spyOn(roleModel as any, 'constructor').mockImplementationOnce(() => mockRole);
      
      const result = await service.create(createRoleDto);
      
      expect(result).toEqual(mockRole);
      expect(mockRole.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith('role.created', { role: expect.any(Object) });
    });
  });

  describe('update', () => {
    it('should update a role and publish an event', async () => {
      const updateRoleDto = {
        description: 'Updated Administrator role',
        permissions: ['read', 'write', 'delete', 'admin'],
      };

      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockRole as any);

      const result = await service.update('role-id-123', updateRoleDto);

      expect(result).toEqual(mockRole);
      expect(mockRole.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith('role.updated', { role: expect.any(Object) });
    });
  });

  describe('remove', () => {
    it('should remove a role and publish an event', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockRole as any);

      const result = await service.remove('role-id-123');

      expect(result).toEqual({ id: 'role-id-123', message: 'Role deleted successfully' });
      expect(roleModel.findByIdAndDelete).toHaveBeenCalledWith('role-id-123');
      expect(eventBus.publish).toHaveBeenCalledWith('role.deleted', { roleId: 'role-id-123' });
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign a role to a user and publish an event', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockRole as any);

      const result = await service.assignRoleToUser('user-id-123', 'role-id-123');

      expect(result).toEqual({ message: `Role admin assigned to user user-id-123 successfully` });
      expect(eventBus.publish).toHaveBeenCalledWith('role.assigned', { 
        userId: 'user-id-123', 
        roleId: 'role-id-123', 
        roleName: 'admin'
      });
    });
  });
});
