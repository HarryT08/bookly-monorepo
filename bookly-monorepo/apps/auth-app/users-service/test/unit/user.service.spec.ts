import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../src/infrastructure/services/user.service';
import { User } from '../../src/domain/entities/user.entity';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { UserEventsPublisher } from '../../src/infrastructure/event-publishers/user-events.publisher';

// Tipos para facilitar el testing
type MockUserDocument = Partial<User> & {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
type ModelConstructor = (doc?: Record<string, unknown>) => MockUserDocument;

/**
 * Datos mock para pruebas
 */
const mockUser: MockUserDocument = {
  _id: 'some-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'hashed_password',
  role: 'user',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  id: 'some-id',
  save: jest.fn(),
  toJSON: jest.fn().mockReturnThis(),
};

// Configurar el mock para retornarse a sí mismo después de definirlo
mockUser.save.mockResolvedValue(mockUser);

// DTOs de ejemplo para las pruebas
const createUserDto = {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'password123',
};

const updateUserDto = {
  firstName: 'Updated',
  lastName: 'Name'
};

describe('UserService', () => {
  // Dependencias del servicio
  let service: UserService;
  let userModel: Model<User>;
  let userEventsPublisher: UserEventsPublisher;

  /**
   * Configuración común para las pruebas
   */
  beforeEach(async () => {
    // Crear un módulo de prueba con mocks para las dependencias
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            constructor: jest.fn(),
            create: jest.fn(),
            findById: jest.fn().mockReturnThis(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            findByIdAndDelete: jest.fn(),
            findOne: jest.fn().mockReturnThis(),
            exec: jest.fn(),
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

    // Obtener las instancias necesarias del módulo de prueba
    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    userEventsPublisher = module.get<UserEventsPublisher>(UserEventsPublisher);
  });

  // Prueba de verificación básica
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

  /**
   * Pruebas para el método findById
   */
  describe('findById', () => {
    it('should return a user when the id is valid', async () => {
      // Configurar el mock para devolver un usuario
      const mockResult = { 
        exec: jest.fn().mockResolvedValueOnce(mockUser),
        _mongooseOptions: {} 
      };
      jest.spyOn(userModel, 'findById').mockReturnValueOnce(mockResult as any);
      
      // Ejecutar el método bajo prueba
      const result = await service.findById('some-id');
      
      // Verificar resultado y comportamiento
      expect(result).toEqual(mockUser);
      expect(userModel.findById).toHaveBeenCalledWith('some-id');
    });

    it('should throw a NotFoundException when user does not exist', async () => {
      // Configurar el mock para devolver null (usuario no encontrado)
      jest.spyOn(userModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as MockQuery);

      // Verificar que se lanza la excepción apropiada
      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Pruebas para el método create
   */
  describe('create', () => {
    it('should create and return a new user', async () => {
      // Configurar el mock para simular la creación de usuario
      jest.spyOn(userModel as unknown as { constructor: ModelConstructor }, 'constructor')
        .mockImplementationOnce(() => mockUser);
      
      // Ejecutar el método bajo prueba
      const result = await service.create(createUserDto);
      
      // Verificar el resultado
      expect(result).toEqual(mockUser);
      // Verificar que se guardó el usuario
      expect(mockUser.save).toHaveBeenCalled();
      // Verificar que se publicó el evento correcto
      expect(userEventsPublisher.publishUserCreated).toHaveBeenCalledWith(mockUser);
    });
  });

  /**
   * Pruebas para el método update
   */
  describe('update', () => {
    it('should update and return the user', async () => {
      // Configurar los mocks
      jest.spyOn(service, 'findById').mockResolvedValueOnce(mockUser as MockUserDocument);
      jest.spyOn(mockUser, 'save').mockResolvedValueOnce(mockUser);

      // Ejecutar el método bajo prueba
      const result = await service.update('some-id', updateUserDto);

      // Verificaciones
      expect(result).toEqual(mockUser);
      expect(mockUser.save).toHaveBeenCalled();
      expect(userEventsPublisher.publishUserUpdated).toHaveBeenCalledWith(mockUser, updateUserDto);
    });
  });

  /**
   * Pruebas para el método remove
   */
  describe('remove', () => {
    it('should remove the user and return success message', async () => {
      // Configurar mock para simular eliminación exitosa
      jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValueOnce(true);
      
      // Ejecutar el método bajo prueba
      const result = await service.remove('some-id');

      // Verificaciones
      expect(result).toEqual({ id: 'some-id', message: 'User deleted successfully' });
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('some-id');
      expect(userEventsPublisher.publishUserDeleted).toHaveBeenCalledWith('some-id');
    });
  });
});
