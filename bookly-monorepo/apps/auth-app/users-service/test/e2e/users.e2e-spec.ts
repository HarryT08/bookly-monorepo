import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/application/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/domain/entities/user.entity';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { Model } from 'mongoose';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let eventBus: EventBusService;
  
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    toJSON: () => ({
      id: '507f1f77bcf86cd799439011',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      isActive: true
    }),
    save: jest.fn().mockReturnThis(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue({
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
        constructor: jest.fn().mockImplementation(() => mockUser),
      })
      .overrideProvider(EventBusService)
      .useValue({
        publish: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api');
    
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    eventBus = moduleFixture.get<EventBusService>(EventBusService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users', () => {
    it('should return an array of users', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(200)
        .expect(Array.isArray);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a single user', () => {
      return request(app.getHttpServer())
        .get('/api/users/507f1f77bcf86cd799439011')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', 'test@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      jest.spyOn(userModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      return request(app.getHttpServer())
        .get('/api/users/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', () => {
      const createUserDto = {
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(eventBus.publish).toHaveBeenCalledWith('user.created', expect.any(Object));
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        firstName: 'New',
        // Missing required fields
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update an existing user', () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      return request(app.getHttpServer())
        .put('/api/users/507f1f77bcf86cd799439011')
        .send(updateUserDto)
        .expect(200)
        .expect((res) => {
          expect(eventBus.publish).toHaveBeenCalledWith('user.updated', expect.any(Object));
        });
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', () => {
      return request(app.getHttpServer())
        .delete('/api/users/507f1f77bcf86cd799439011')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'User deleted successfully');
          expect(eventBus.publish).toHaveBeenCalledWith('user.deleted', { userId: '507f1f77bcf86cd799439011' });
        });
    });
  });
});
