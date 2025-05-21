import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from '../../src/app/services.controller';
import { OrchestratorService } from '../../src/app/services/orchestrator.service';
import { HttpException } from '@nestjs/common';

describe('ServicesController', () => {
  let controller: ServicesController;
  let orchestratorService: OrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: OrchestratorService,
          useValue: {
            getRunningServices: jest.fn(),
            startAllServices: jest.fn(),
            stopAllServices: jest.fn(),
            startService: jest.fn(),
            stopService: jest.fn(),
            isServiceRunning: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    orchestratorService = module.get<OrchestratorService>(OrchestratorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getServices', () => {
    it('should return running and available services', () => {
      // Mock para getRunningServices
      jest.spyOn(orchestratorService, 'getRunningServices').mockReturnValue(['auth-service']);

      const result = controller.getServices();

      expect(result).toEqual({
        running: ['auth-service'],
        available: ['auth-service', 'users-service', 'roles-service']
      });
      expect(orchestratorService.getRunningServices).toHaveBeenCalled();
    });
  });

  describe('startAllServices', () => {
    it('should start all services successfully', async () => {
      // Mock para startAllServices
      jest.spyOn(orchestratorService, 'startAllServices').mockResolvedValue();

      const result = await controller.startAllServices();

      expect(result).toEqual({ message: 'Todos los servicios iniciados correctamente' });
      expect(orchestratorService.startAllServices).toHaveBeenCalled();
    });

    it('should handle errors when starting all services', async () => {
      // Mock para startAllServices que lanza un error
      jest.spyOn(orchestratorService, 'startAllServices').mockRejectedValue(new Error('Error de prueba'));

      await expect(controller.startAllServices()).rejects.toThrow(HttpException);
    });
  });

  describe('stopAllServices', () => {
    it('should stop all services successfully', async () => {
      // Mock para stopAllServices
      jest.spyOn(orchestratorService, 'stopAllServices').mockResolvedValue();

      const result = await controller.stopAllServices();

      expect(result).toEqual({ message: 'Todos los servicios detenidos correctamente' });
      expect(orchestratorService.stopAllServices).toHaveBeenCalled();
    });

    it('should handle errors when stopping all services', async () => {
      // Mock para stopAllServices que lanza un error
      jest.spyOn(orchestratorService, 'stopAllServices').mockRejectedValue(new Error('Error de prueba'));

      await expect(controller.stopAllServices()).rejects.toThrow(HttpException);
    });
  });

  describe('startService', () => {
    it('should start a specific service successfully', async () => {
      // Mock para startService
      jest.spyOn(orchestratorService, 'startService').mockResolvedValue();

      const result = await controller.startService('auth-service');

      expect(result).toEqual({ message: 'Servicio auth-service iniciado correctamente' });
      expect(orchestratorService.startService).toHaveBeenCalledWith('auth-service', 3000);
    });

    it('should handle invalid service names', async () => {
      await expect(controller.startService('invalid-service')).rejects.toThrow(HttpException);
      expect(orchestratorService.startService).not.toHaveBeenCalled();
    });

    it('should assign correct port for each service', async () => {
      // Mock para startService
      jest.spyOn(orchestratorService, 'startService').mockResolvedValue();

      await controller.startService('users-service');
      expect(orchestratorService.startService).toHaveBeenCalledWith('users-service', 3001);

      await controller.startService('roles-service');
      expect(orchestratorService.startService).toHaveBeenCalledWith('roles-service', 3002);
    });

    it('should handle errors when starting a service', async () => {
      // Mock para startService que lanza un error
      jest.spyOn(orchestratorService, 'startService').mockRejectedValue(new Error('Error de prueba'));

      await expect(controller.startService('auth-service')).rejects.toThrow(HttpException);
    });
  });

  describe('stopService', () => {
    it('should stop a specific service successfully', async () => {
      // Mock para stopService
      jest.spyOn(orchestratorService, 'stopService').mockResolvedValue();

      const result = await controller.stopService('auth-service');

      expect(result).toEqual({ message: 'Servicio auth-service detenido correctamente' });
      expect(orchestratorService.stopService).toHaveBeenCalledWith('auth-service');
    });

    it('should handle invalid service names', async () => {
      await expect(controller.stopService('invalid-service')).rejects.toThrow(HttpException);
      expect(orchestratorService.stopService).not.toHaveBeenCalled();
    });

    it('should handle errors when stopping a service', async () => {
      // Mock para stopService que lanza un error
      jest.spyOn(orchestratorService, 'stopService').mockRejectedValue(new Error('Error de prueba'));

      await expect(controller.stopService('auth-service')).rejects.toThrow(HttpException);
    });
  });

  describe('getServiceStatus', () => {
    it('should return running status for a running service', () => {
      // Mock para isServiceRunning
      jest.spyOn(orchestratorService, 'isServiceRunning').mockReturnValue(true);

      const result = controller.getServiceStatus('auth-service');

      expect(result).toEqual({
        service: 'auth-service',
        status: 'running'
      });
      expect(orchestratorService.isServiceRunning).toHaveBeenCalledWith('auth-service');
    });

    it('should return stopped status for a stopped service', () => {
      // Mock para isServiceRunning
      jest.spyOn(orchestratorService, 'isServiceRunning').mockReturnValue(false);

      const result = controller.getServiceStatus('auth-service');

      expect(result).toEqual({
        service: 'auth-service',
        status: 'stopped'
      });
    });

    it('should handle invalid service names', () => {
      expect(() => controller.getServiceStatus('invalid-service')).toThrow(HttpException);
    });
  });
});
