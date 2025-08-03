import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check Endpoints', () => {
    it('/health (GET) - should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });

    it('/health/ready (GET) - should return ready status', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ready');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });

    it('/health/live (GET) - should return alive status', () => {
      return request(app.getHttpServer())
        .get('/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'alive');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Auth Endpoints', () => {
    it('/auth/register (POST) - should exist and be accessible', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect((res) => {
          // We expect either success or validation error, but endpoint should exist
          expect([200, 201, 400, 409]).toContain(res.status);
        });
    });

    it('/auth/login (POST) - should exist and be accessible', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect((res) => {
          // We expect either success or authentication error, but endpoint should exist
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('API Documentation', () => {
    it('/api/docs - should serve Swagger documentation', () => {
      return request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);
    });
  });
});
