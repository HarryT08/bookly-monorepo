import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registro exitoso.');
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Inicio de sesión exitoso.');
      expect(res.body.token).toBeDefined();
    });

    it('should fail login with wrong credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Correo o contraseña incorrectos.');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout a user', async () => {
      // Simula usuario autenticado
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ user: { id: 1, email: 'test@example.com' } });
      expect([200, 201]).toContain(res.status);
      expect(res.body.message).toBe('Sesión cerrada correctamente.');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Correo de recuperación enviado.');
    });

    it('should fail for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'noexiste@example.com' });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Correo o contraseña incorrectos.');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'valid-token', password: 'newpassword123' });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Contraseña restablecida exitosamente.');
    });

    it('should fail with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'invalid-token', password: 'newpassword123' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Correo o contraseña incorrectos.');
    });
  });
});

