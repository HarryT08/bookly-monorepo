import { Controller, Get, Post, Param, HttpStatus, HttpException } from '@nestjs/common';
import { OrchestratorService } from './services/orchestrator.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Get()
  getServices() {
    const runningServices = this.orchestratorService.getRunningServices();
    return {
      running: runningServices,
      available: ['auth-service', 'users-service', 'roles-service']
    };
  }

  @Post('start/all')
  async startAllServices() {
    try {
      await this.orchestratorService.startAllServices();
      return { message: 'Todos los servicios iniciados correctamente' };
    } catch (error) {
      throw new HttpException(
        `Error al iniciar todos los servicios: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('stop/all')
  async stopAllServices() {
    try {
      await this.orchestratorService.stopAllServices();
      return { message: 'Todos los servicios detenidos correctamente' };
    } catch (error) {
      throw new HttpException(
        `Error al detener todos los servicios: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('start/:serviceName')
  async startService(@Param('serviceName') serviceName: string) {
    // Verificar que el servicio es válido
    if (!['auth-service', 'users-service', 'roles-service'].includes(serviceName)) {
      throw new HttpException(
        `Servicio no válido: ${serviceName}`,
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      // Determinar el puerto según el servicio
      let port = 3000; // Puerto por defecto para auth-service
      if (serviceName === 'users-service') port = 3001;
      if (serviceName === 'roles-service') port = 3002;

      await this.orchestratorService.startService(serviceName, port);
      return { message: `Servicio ${serviceName} iniciado correctamente` };
    } catch (error) {
      throw new HttpException(
        `Error al iniciar ${serviceName}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('stop/:serviceName')
  async stopService(@Param('serviceName') serviceName: string) {
    // Verificar que el servicio es válido
    if (!['auth-service', 'users-service', 'roles-service'].includes(serviceName)) {
      throw new HttpException(
        `Servicio no válido: ${serviceName}`,
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      await this.orchestratorService.stopService(serviceName);
      return { message: `Servicio ${serviceName} detenido correctamente` };
    } catch (error) {
      throw new HttpException(
        `Error al detener ${serviceName}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:serviceName')
  getServiceStatus(@Param('serviceName') serviceName: string) {
    // Verificar que el servicio es válido
    if (!['auth-service', 'users-service', 'roles-service'].includes(serviceName)) {
      throw new HttpException(
        `Servicio no válido: ${serviceName}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const isRunning = this.orchestratorService.isServiceRunning(serviceName);
    return {
      service: serviceName,
      status: isRunning ? 'running' : 'stopped'
    };
  }
}
