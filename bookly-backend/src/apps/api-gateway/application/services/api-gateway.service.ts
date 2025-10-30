import { Injectable } from '@nestjs/common';
import { LoggingService } from '@logging/logging.service';

@Injectable()
export class ApiGatewayService {
  constructor(private readonly loggingService: LoggingService) {}

  async getApiInfo(): Promise<any> {
    this.loggingService.log('Getting API information', 'ApiGatewayService');
    return {
      name: 'Bookly API Gateway',
      version: '1.0.0',
      description: 'Sistema de Reservas Institucionales API Gateway',
      endpoints: {
        auth: '/auth',
        resources: '/resources',
        availability: '/availability',
        stockpile: '/stockpile',
        reports: '/reports',
        health: '/health',
      },
      documentation: '/api/docs',
    };
  }

  async getHealthStatus(): Promise<any> {
    this.loggingService.log('Getting health status', 'ApiGatewayService');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        auth: 'healthy',
        resources: 'healthy',
        availability: 'healthy',
        stockpile: 'healthy',
        reports: 'healthy',
      },
    };
  }

  async getRateLimitInfo(): Promise<any> {
    this.loggingService.log('Getting rate limit information', 'ApiGatewayService');
    return {
      ttl: 60,
      limit: 100,
      remaining: 100,
      resetTime: new Date(Date.now() + 60000).toISOString(),
    };
  }
}
