import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly healthService: HealthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @HealthCheck()
  check() {
    const heapThresholdMB = this.configService.get<number>('MEMORY_HEAP_THRESHOLD_MB', 3840);
    const rssThresholdMB = this.configService.get<number>('MEMORY_RSS_THRESHOLD_MB', 3840);
    
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', heapThresholdMB * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', rssThresholdMB * 1024 * 1024),
      () => this.disk.checkStorage('storage', { path: '/', threshold: 500 * 1024 * 1024 * 1024 }),
      () => this.healthService.checkDatabase('database'),
      () => this.healthService.checkRedis('redis'),
      () => this.healthService.checkRabbitMQ('rabbitmq'),
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check if application is ready' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  async ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Check if application is alive' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
