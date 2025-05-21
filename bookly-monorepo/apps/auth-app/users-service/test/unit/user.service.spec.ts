import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../src/infrastructure/services/user.service';
import { User } from '../../src/domain/entities/user.entity';
import { Model, Query } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { UserEventsPublisher } from '../../src/infrastructure/event-publishers/user-events.publisher';

// Definir tipos para los mocks
type MockUserDocument = User & {
  _id: string;
  save: jest.Mock;
  toJSON: jest.Mock;
}

interface MockQuery<T> extends Partial<Query<T, T>> {
  exec: jest.Mock;
}

// Tipo para el constructor del modelo
type ModelConstructor = (doc?: Record<string, unknown>) => MockUserDocument;

const mockUser = {
  _id: 'some-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'hashedPassword',
  isActive: true,
  toJSON: jest.fn().mockReturnValue({
    id: 'some-id',
    email: 'test@example.com'
  }),
  save: jest.fn().mockReturnThis(),
};

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let userEventsPublisher: UserEventsPublisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockUser]),
            }),
            findById: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockUser),
            }),
            findOne: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockUser),
            }),
            findByIdAndDelete: jest.fn().mockResolvedValue(true),
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: UserEventsPublisher,
          useValue: {
            publishUserCreated: jest.fn(),
            publishUserUpdated: jest.fn(),
            publishUserDeleted: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    userEventsPublisher = module.get<UserEventsPublisher>(UserEventsPublisher);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(userModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a single user when user exists', async () => {
      const result = await service.findById('some-id');
      expect(result).toEqual(mockUser);
      expect(userModel.findById).toHaveBeenCalledWith('some-id');
    });

    it('should throw a NotFoundException when user does not exist', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as MockQuery<User>);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user and publish an event', async () => {
      const createUserDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };

      jest.spyOn(userModel as unknown as { constructor: ModelConstructor }, 'constructor')
        .mockImplementationOnce(() => mockUser);
      
      const result = await service.create(createUserDto);
      
      expect(result).toEqual(mockUser);
      expect(mockUser.save).toHaveBeenCalled();
      expect(userEventsPublisher.publishUserCreated).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user and publish an event', async () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
      };

      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockUser as any);

      const result = await service.update('some-id', updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUser.save).toHaveBeenCalled();
      expect(userEventsPublisher.publishUserUpdated).toHaveBeenCalledWith(mockUser, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user and publish an event', async () => {
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockUser as any);

      const result = await service.remove('some-id');

      expect(result).toEqual({ id: 'some-id', message: 'User deleted successfully' });
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('some-id');
      expect(userEventsPublisher.publishUserDeleted).toHaveBeenCalledWith('some-id');
    });
  });
});
