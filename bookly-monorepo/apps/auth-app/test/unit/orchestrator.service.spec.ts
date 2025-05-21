import { Test, TestingModule } from '@nestjs/testing';
import { OrchestratorService } from '../../src/app/services/orchestrator.service';
import { ConfigService } from '@nestjs/config';
import { ChildProcess } from 'child_process';
import * as childProcess from 'child_process';

// Mock para la función spawn
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

describe('OrchestratorService', () => {
  let service: OrchestratorService;
  let configService: ConfigService;
  
  // Mock del proceso hijo
  const mockProcess = {
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn(),
    kill: jest.fn(),
    killed: false
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Configurar el mock de spawn
    (childProcess.spawn as jest.Mock).mockReturnValue(mockProcess as unknown as ChildProcess);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrchestratorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key, defaultValue) => {
              const config = {
                'app.autoloadServices': false,
                'services.authService.port': 3000,
                'services.usersService.port': 3001,
                'services.rolesService.port': 3002
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OrchestratorService>(OrchestratorService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startService', () => {
    it('should start a service successfully', async () => {
      // Simular evento 'close' después de un tiempo
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          // No llamamos el callback para simular que el servicio sigue ejecutándose
        }
      });

      // Mock setTimeout para que resuelva inmediatamente
      jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        callback();
        return {} as NodeJS.Timeout;
      });

      await service.startService('auth-service', 3000);
      
      // Verificar que spawn fue llamado con los parámetros correctos
      expect(childProcess.spawn).toHaveBeenCalledWith(
        'npx',
        ['nx', 'serve', 'auth-service'],
        expect.objectContaining({
          env: expect.objectContaining({ PORT: '3000' })
        })
      );
    });

    it('should not start a service that is already running', async () => {
      // Iniciar un servicio primero
      await service.startService('auth-service', 3000);
      
      // Limpiar mocks
      jest.clearAllMocks();
      
      // Intentar iniciar el mismo servicio de nuevo
      await service.startService('auth-service', 3000);
      
      // Verificar que spawn no fue llamado la segunda vez
      expect(childProcess.spawn).not.toHaveBeenCalled();
    });
  });

  describe('stopService', () => {
    it('should stop a running service', async () => {
      // Iniciar un servicio primero
      await service.startService('auth-service', 3000);
      
      // Simular que el servicio se detiene correctamente
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          // Llamar al callback para simular que el proceso se cerró
          callback(0);
        }
      });
      
      // Limpiar mocks
      jest.clearAllMocks();
      
      await service.stopService('auth-service');
      
      // Verificar que kill fue llamado con SIGTERM
      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should handle stopping a non-running service', async () => {
      // Intentar detener un servicio que no está corriendo
      await service.stopService('non-existent-service');
      
      // Verificar que kill no fue llamado
      expect(mockProcess.kill).not.toHaveBeenCalled();
    });
  });

  describe('startAllServices', () => {
    it('should start all services', async () => {
      // Mock startService
      jest.spyOn(service, 'startService').mockResolvedValue();
      
      await service.startAllServices();
      
      // Verificar que startService fue llamado para cada servicio
      expect(service.startService).toHaveBeenCalledWith('auth-service', 3000);
      expect(service.startService).toHaveBeenCalledWith('users-service', 3001);
      expect(service.startService).toHaveBeenCalledWith('roles-service', 3002);
      expect(service.startService).toHaveBeenCalledTimes(3);
    });
  });

  describe('stopAllServices', () => {
    it('should stop all running services', async () => {
      // Iniciar servicios primero
      await service.startService('auth-service', 3000);
      await service.startService('users-service', 3001);
      
      // Mock stopService
      jest.spyOn(service, 'stopService').mockResolvedValue();
      
      await service.stopAllServices();
      
      // Verificar que stopService fue llamado para cada servicio en ejecución
      expect(service.stopService).toHaveBeenCalledWith('auth-service');
      expect(service.stopService).toHaveBeenCalledWith('users-service');
      expect(service.stopService).toHaveBeenCalledTimes(2);
    });
  });

  describe('isServiceRunning and getRunningServices', () => {
    it('should correctly report running services', async () => {
      // Iniciar un servicio
      await service.startService('auth-service', 3000);
      
      // Verificar que isServiceRunning reporta correctamente
      expect(service.isServiceRunning('auth-service')).toBe(true);
      expect(service.isServiceRunning('non-existent-service')).toBe(false);
      
      // Verificar que getRunningServices devuelve la lista correcta
      expect(service.getRunningServices()).toEqual(['auth-service']);
    });
  });
});
