import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app/app.module';
import { OrchestratorService } from '../../src/app/services/orchestrator.service';
import { ServicesController } from '../../src/app/services.controller';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Auth App Orchestration Integration', () => {
  let app: INestApplication;
  let orchestratorService: OrchestratorService;
  
  // Mock del orquestador para no iniciar procesos reales durante las pruebas
  const mockOrchestratorService = {
    getRunningServices: jest.fn().mockReturnValue([]),
    startAllServices: jest.fn().mockResolvedValue(undefined),
    stopAllServices: jest.fn().mockResolvedValue(undefined),
    startService: jest.fn().mockResolvedValue(undefined),
    stopService: jest.fn().mockResolvedValue(undefined),
    isServiceRunning: jest.fn().mockReturnValue(false),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(OrchestratorService)
    .useValue(mockOrchestratorService)
    .compile();

    app = moduleFixture.createNestApplication();
    // Configurar prefijo global para las rutas como en la aplicación real
    app.setGlobalPrefix('api');
    await app.init();
    
    orchestratorService = moduleFixture.get<OrchestratorService>(OrchestratorService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Services REST API', () => {
    it('GET /api/services - should return list of services', () => {
      // Configurar mock para simular servicios en ejecución
      mockOrchestratorService.getRunningServices.mockReturnValueOnce(['auth-service']);
      
      return request(app.getHttpServer())
        .get('/api/services')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            running: ['auth-service'],
            available: ['auth-service', 'users-service', 'roles-service']
          });
        });
    });

    it('POST /api/services/start/all - should start all services', () => {      
      return request(app.getHttpServer())
        .post('/api/services/start/all')
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({ message: 'Todos los servicios iniciados correctamente' });
          expect(mockOrchestratorService.startAllServices).toHaveBeenCalled();
        });
    });

    it('POST /api/services/stop/all - should stop all services', () => {      
      return request(app.getHttpServer())
        .post('/api/services/stop/all')
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({ message: 'Todos los servicios detenidos correctamente' });
          expect(mockOrchestratorService.stopAllServices).toHaveBeenCalled();
        });
    });

    it('POST /api/services/start/:serviceName - should start a specific service', () => {      
      return request(app.getHttpServer())
        .post('/api/services/start/auth-service')
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({ message: 'Servicio auth-service iniciado correctamente' });
          expect(mockOrchestratorService.startService).toHaveBeenCalledWith('auth-service', 3000);
        });
    });

    it('POST /api/services/stop/:serviceName - should stop a specific service', () => {      
      return request(app.getHttpServer())
        .post('/api/services/stop/users-service')
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({ message: 'Servicio users-service detenido correctamente' });
          expect(mockOrchestratorService.stopService).toHaveBeenCalledWith('users-service');
        });
    });

    it('GET /api/services/status/:serviceName - should return service status', () => {
      // Configurar mock para simular que el servicio está en ejecución
      mockOrchestratorService.isServiceRunning.mockReturnValueOnce(true);
      
      return request(app.getHttpServer())
        .get('/api/services/status/roles-service')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            service: 'roles-service',
            status: 'running'
          });
          expect(mockOrchestratorService.isServiceRunning).toHaveBeenCalledWith('roles-service');
        });
    });

    it('should reject invalid service names', () => {      
      return request(app.getHttpServer())
        .post('/api/services/start/invalid-service')
        .expect(400);
    });
  });
  
  describe('Orchestration workflows', () => {
    it('should orchestrate the sequential start of all microservices', async () => {
      // Simular que los servicios se inician correctamente
      mockOrchestratorService.startService.mockResolvedValue(undefined);
      
      // Iniciar un flujo de orquestación secuencial
      await request(app.getHttpServer()).post('/api/services/start/auth-service').expect(201);
      expect(mockOrchestratorService.startService).toHaveBeenCalledWith('auth-service', 3000);
      
      await request(app.getHttpServer()).post('/api/services/start/users-service').expect(201);
      expect(mockOrchestratorService.startService).toHaveBeenCalledWith('users-service', 3001);
      
      await request(app.getHttpServer()).post('/api/services/start/roles-service').expect(201);
      expect(mockOrchestratorService.startService).toHaveBeenCalledWith('roles-service', 3002);
      
      // Verificar el orden y número de llamadas
      expect(mockOrchestratorService.startService).toHaveBeenCalledTimes(3);
    });

    it('should orchestrate the parallel start of all microservices', async () => {
      // Limpiar mocks
      jest.clearAllMocks();
      
      // Iniciar todos los servicios en paralelo
      await request(app.getHttpServer()).post('/api/services/start/all').expect(201);
      
      // Verificar que se llamó a startAllServices
      expect(mockOrchestratorService.startAllServices).toHaveBeenCalledTimes(1);
    });
  });
});
