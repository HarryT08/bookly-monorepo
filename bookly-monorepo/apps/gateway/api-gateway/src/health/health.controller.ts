import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { Public } from '../security/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  /**
   * Comprueba el estado de salud de todos los microservicios
   */
  @Public()
  @Get()
  @HealthCheck()
  check() {
    // Obtener las URLs de los microservicios de la configuraciu00f3n
    const authUrl = this.configService.get<string>('services.auth');
    const resourcesUrl = this.configService.get<string>('services.resources');
    const availabilityUrl = this.configService.get<string>('services.availability');
    const stockpileUrl = this.configService.get<string>('services.stockpile');
    const reportsUrl = this.configService.get<string>('services.reports');
    const notificationsUrl = this.configService.get<string>('services.notifications');

    // Comprobar la salud de cada microservicio
    return this.health.check([
      // Comprobaciu00f3n del propio gateway
      () => this.http.pingCheck('gateway', 'http://localhost:3000/api/health/ping'),
      
      // Comprobaciu00f3n de los microservicios
      () => this.http.pingCheck('auth-service', `${authUrl}/health/ping`),
      () => this.http.pingCheck('resources-service', `${resourcesUrl}/health/ping`),
      () => this.http.pingCheck('availability-service', `${availabilityUrl}/health/ping`),
      () => this.http.pingCheck('stockpile-service', `${stockpileUrl}/health/ping`),
      () => this.http.pingCheck('reports-service', `${reportsUrl}/health/ping`),
      () => this.http.pingCheck('notifications-service', `${notificationsUrl}/health/ping`),
    ]);
  }

  /**
   * Endpoint simple para ping del gateway
   */
  @Public()
  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
