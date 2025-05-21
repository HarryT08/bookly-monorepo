import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/application/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from '../../src/domain/entities/role.entity';
import { EventBusService } from '@bookly-monorepo/event-bus';
import { Model } from 'mongoose';

describe('RolesController (e2e)', () => {
  let app: INestApplication;
  let roleModel: Model<Role>;
  let eventBus: EventBusService;
  
  const mockRole = {
    _id: '507f1f77bcf86cd799439011',
    name: 'admin',
    description: 'Administrator role',
    permissions: ['read', 'write', 'delete'],
    toJSON: () => ({
      id: '507f1f77bcf86cd799439011',
      name: 'admin',
      description: 'Administrator role',
      permissions: ['read', 'write', 'delete'],
    }),
    save: jest.fn().mockReturnThis(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(Role.name))
      .useValue({
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
        constructor: jest.fn().mockImplementation(() => mockRole),
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
    
    roleModel = moduleFixture.get<Model<Role>>(getModelToken(Role.name));
    eventBus = moduleFixture.get<EventBusService>(EventBusService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/roles', () => {
    it('should return an array of roles', () => {
      return request(app.getHttpServer())
        .get('/api/roles')
        .expect(200)
        .expect(Array.isArray);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('should return a single role', () => {
      return request(app.getHttpServer())
        .get('/api/roles/507f1f77bcf86cd799439011')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'admin');
        });
    });

    it('should return 404 for non-existent role', () => {
      jest.spyOn(roleModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      return request(app.getHttpServer())
        .get('/api/roles/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /api/roles', () => {
    it('should create a new role', () => {
      const createRoleDto = {
        name: 'editor',
        description: 'Editor role',
        permissions: ['read', 'write'],
      };

      return request(app.getHttpServer())
        .post('/api/roles')
        .send(createRoleDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'admin');
          expect(eventBus.publish).toHaveBeenCalledWith('role.created', expect.any(Object));
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        // Missing required name field
        description: 'Invalid role',
      };

      return request(app.getHttpServer())
        .post('/api/roles')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('PUT /api/roles/:id', () => {
    it('should update an existing role', () => {
      const updateRoleDto = {
        description: 'Updated Admin Role',
        permissions: ['read', 'write', 'delete', 'admin'],
      };

      return request(app.getHttpServer())
        .put('/api/roles/507f1f77bcf86cd799439011')
        .send(updateRoleDto)
        .expect(200)
        .expect((res) => {
          expect(eventBus.publish).toHaveBeenCalledWith('role.updated', expect.any(Object));
        });
    });
  });

  describe('DELETE /api/roles/:id', () => {
    it('should delete a role', () => {
      return request(app.getHttpServer())
        .delete('/api/roles/507f1f77bcf86cd799439011')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Role deleted successfully');
          expect(eventBus.publish).toHaveBeenCalledWith('role.deleted', { roleId: '507f1f77bcf86cd799439011' });
        });
    });
  });

  describe('POST /api/roles/assign', () => {
    it('should assign a role to a user', () => {
      const assignRoleDto = {
        userId: 'user-123',
        roleId: '507f1f77bcf86cd799439011',
      };

      return request(app.getHttpServer())
        .post('/api/roles/assign')
        .send(assignRoleDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(eventBus.publish).toHaveBeenCalledWith('role.assigned', expect.any(Object));
        });
    });
  });
});
