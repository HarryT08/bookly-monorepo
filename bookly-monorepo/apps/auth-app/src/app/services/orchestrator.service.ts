import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

@Injectable()
export class OrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(OrchestratorService.name);
  private readonly services: Map<string, ChildProcess> = new Map();
  private readonly baseDir: string;

  constructor(private readonly configService: ConfigService) {
    // Obtener el directorio base para los servicios
    this.baseDir = path.resolve(__dirname, '../../../');
  }

  async onModuleInit() {
    // Iniciar servicios si el modo autocarga está habilitado
    if (this.configService.get<boolean>('app.autoloadServices', true)) {
      await this.startAllServices();
    }
  }

  async startAllServices() {
    this.logger.log('Iniciando todos los servicios de auth-app...');
    
    await Promise.all([
      this.startService('auth-service', this.configService.get<number>('services.authService.port', 3000)),
      this.startService('users-service', this.configService.get<number>('services.usersService.port', 3001)),
      this.startService('roles-service', this.configService.get<number>('services.rolesService.port', 3002))
    ]);

    this.logger.log('Todos los servicios iniciados correctamente.');
  }

  async startService(serviceName: string, port: number): Promise<void> {
    if (this.services.has(serviceName)) {
      this.logger.warn(`El servicio ${serviceName} ya está en ejecución.`);
      return;
    }

    this.logger.log(`Iniciando ${serviceName} en el puerto ${port}...`);

    return new Promise((resolve, reject) => {
      try {
        // Construir el comando para ejecutar el servicio
        const serviceProcess = spawn('npx', ['nx', 'serve', serviceName], {
          stdio: 'pipe',
          cwd: this.baseDir,
          env: { ...process.env, PORT: port.toString() }
        });

        // Manejar stdout
        serviceProcess.stdout.on('data', (data) => {
          this.logger.log(`[${serviceName}] ${data.toString().trim()}`);
        });

        // Manejar stderr
        serviceProcess.stderr.on('data', (data) => {
          this.logger.error(`[${serviceName}] ${data.toString().trim()}`);
        });

        // Manejar cierre del proceso
        serviceProcess.on('close', (code) => {
          if (code !== 0) {
            this.logger.error(`${serviceName} se cerró con código ${code}`);
          } else {
            this.logger.log(`${serviceName} se cerró correctamente.`);
          }
          this.services.delete(serviceName);
        });

        // Guardar referencia al proceso
        this.services.set(serviceName, serviceProcess);

        // Esperar un tiempo para asegurarse de que el servicio ha iniciado correctamente
        setTimeout(() => {
          if (serviceProcess.killed) {
            reject(new Error(`Error al iniciar ${serviceName}`));
          } else {
            this.logger.log(`${serviceName} iniciado correctamente.`);
            resolve();
          }
        }, 5000);
      } catch (error) {
        this.logger.error(`Error al iniciar ${serviceName}: ${error.message}`);
        reject(error instanceof Error ? error : new Error(`Error al iniciar ${serviceName}: ${error.message}`));
      }
    });
  }

  async stopService(serviceName: string): Promise<void> {
    if (!this.services.has(serviceName)) {
      this.logger.warn(`El servicio ${serviceName} no está en ejecución.`);
      return;
    }

    const serviceProcess = this.services.get(serviceName);
    return new Promise((resolve) => {
      this.logger.log(`Deteniendo ${serviceName}...`);
      
      if (serviceProcess) {
        serviceProcess.on('close', () => {
          this.logger.log(`${serviceName} detenido correctamente.`);
          this.services.delete(serviceName);
          resolve();
        });

        // Intentar cerrar el proceso de manera limpia
        serviceProcess.kill('SIGTERM');

        // Asegurar que el proceso termine después de un tiempo
        setTimeout(() => {
          if (this.services.has(serviceName)) {
            this.logger.warn(`Forzando terminación de ${serviceName}...`);
            serviceProcess.kill('SIGKILL');
            this.services.delete(serviceName);
            resolve();
          }
        }, 5000);
      } else {
        resolve();
      }
    });
  }

  async stopAllServices(): Promise<void> {
    this.logger.log('Deteniendo todos los servicios...');
    
    const serviceNames = Array.from(this.services.keys());
    await Promise.all(serviceNames.map(serviceName => this.stopService(serviceName)));
    
    this.logger.log('Todos los servicios detenidos correctamente.');
  }

  getRunningServices(): string[] {
    return Array.from(this.services.keys());
  }

  isServiceRunning(serviceName: string): boolean {
    return this.services.has(serviceName);
  }
}
