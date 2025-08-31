import { Controller, Get, Post, Put, Delete, Patch, All, Req, Res, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { RoutingService } from '../services/routing.service';
import { LoadBalancerService } from '../services/load-balancer.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { RateLimitService } from '../services/rate-limit.service';
import { ObservabilityService } from '../services/observability.service';
import { ResponseAggregationService } from '../services/response-aggregation.service';
import { ProtocolTranslationService } from '../services/protocol-translation.service';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(
    private readonly routingService: RoutingService,
    private readonly loadBalancerService: LoadBalancerService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly rateLimitService: RateLimitService,
    private readonly observabilityService: ObservabilityService,
    private readonly aggregationService: ResponseAggregationService,
    private readonly protocolTranslationService: ProtocolTranslationService,
  ) {}

  @All('*')
  @ApiOperation({ summary: 'Universal proxy endpoint for all microservice requests' })
  @ApiResponse({ status: 200, description: 'Request successfully proxied' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  @ApiResponse({ status: 403, description: 'Authorization failed' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 502, description: 'Bad gateway - service unavailable' })
  @ApiResponse({ status: 503, description: 'Service unavailable - circuit breaker open' })
  async handleRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    // The actual request handling is done by the GatewayMiddleware
    // This controller method serves as documentation and fallback
    this.logger.warn(`Request reached controller fallback: ${req.method} ${req.path}`);
    
    res.status(500).json({
      code: 'GATEWAY_FALLBACK_ERROR',
      message: 'Request reached controller fallback - middleware may not be configured correctly',
      timestamp: new Date().toISOString(),
    });
  }
}

@ApiTags('Gateway Management')
@Controller('_gateway')
export class GatewayManagementController {
  private readonly logger = new Logger(GatewayManagementController.name);

  constructor(
    private readonly routingService: RoutingService,
    private readonly loadBalancerService: LoadBalancerService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly rateLimitService: RateLimitService,
    private readonly observabilityService: ObservabilityService,
    private readonly aggregationService: ResponseAggregationService,
    private readonly protocolTranslationService: ProtocolTranslationService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Gateway health check' })
  @ApiResponse({ status: 200, description: 'Gateway is healthy' })
  getHealth(): any {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        routing: 'operational',
        loadBalancer: 'operational',
        circuitBreaker: 'operational',
        rateLimit: 'operational',
        observability: 'operational',
        aggregation: 'operational',
        protocolTranslation: 'operational',
      },
    };
  }

  @Get('health/aggregated')
  @ApiOperation({ summary: 'Aggregated health check of all microservices' })
  @ApiResponse({ status: 200, description: 'Health status of all services' })
  async getAggregatedHealth(): Promise<any> {
    const services = ['auth', 'resources', 'availability', 'stockpile', 'reports'];
    const healthResults: any = {};
    let overallStatus = 'healthy';

    for (const service of services) {
      try {
        const serviceUrl = await this.loadBalancerService.getServiceUrl(service);
        const healthUrl = `${serviceUrl}/api/v1/health`;
        
        // Simple health check using fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(healthUrl, {
          signal: controller.signal,
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          const healthData = await response.json();
          healthResults[service] = {
            status: 'up',
            response: healthData,
            url: healthUrl
          };
        } else {
          healthResults[service] = {
            status: 'down',
            error: `HTTP ${response.status}`,
            url: healthUrl
          };
          overallStatus = 'degraded';
        }
      } catch (error: any) {
        healthResults[service] = {
          status: 'down',
          error: error.message || 'Connection failed',
          url: 'N/A'
        };
        overallStatus = 'degraded';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      gateway: {
        status: 'healthy',
        version: '1.0.0'
      },
      services: healthResults
    };
  }

  @Get('routes')
  @ApiOperation({ summary: 'Get all configured routes' })
  @ApiResponse({ status: 200, description: 'List of all routes' })
  getRoutes(): any {
    const routes = this.routingService.getAllRoutes();
    return {
      total: routes.length,
      routes: routes.map(route => ({
        method: route.method,
        path: route.path,
        service: route.service,
        auth: route.auth,
        cache: route.cache,
        rateLimit: route.rateLimit,
        timeout: route.timeout,
        retries: route.retries,
      })),
    };
  }

  @Get('services')
  @ApiOperation({ summary: 'Get all service instances and their health' })
  @ApiResponse({ status: 200, description: 'Service instances status' })
  getServices(): any {
    const allInstances = this.loadBalancerService.getAllServiceInstances();
    const services: any = {};

    for (const [serviceName, instances] of allInstances.entries()) {
      const circuitBreakerStats = this.circuitBreakerService.getCircuitBreakerStats(serviceName);
      
      services[serviceName] = {
        instances: instances.map(instance => ({
          id: instance.id,
          url: instance.url,
          healthy: instance.healthy,
          weight: instance.weight,
          activeConnections: instance.activeConnections,
          responseTime: instance.responseTime,
          lastHealthCheck: instance.lastHealthCheck,
        })),
        circuitBreaker: circuitBreakerStats ? {
          state: circuitBreakerStats.state,
          failureCount: circuitBreakerStats.failureCount,
          successCount: circuitBreakerStats.successCount,
          failureRate: circuitBreakerStats.failureRate,
          nextAttemptTime: circuitBreakerStats.nextAttemptTime,
        } : null,
        healthyInstances: this.loadBalancerService.getHealthyInstancesCount(serviceName),
        totalInstances: this.loadBalancerService.getTotalInstancesCount(serviceName),
        availability: this.circuitBreakerService.getServiceAvailability(serviceName),
      };
    }

    return services;
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get gateway metrics and statistics' })
  @ApiResponse({ status: 200, description: 'Gateway metrics' })
  getMetrics(): any {
    return this.observabilityService.getMetricsSummary();
  }

  @Get('metrics/health')
  @ApiOperation({ summary: 'Get health-specific metrics' })
  @ApiResponse({ status: 200, description: 'Health metrics' })
  getHealthMetrics(): any {
    return this.observabilityService.getHealthMetrics();
  }

  @Get('rate-limits')
  @ApiOperation({ summary: 'Get rate limiting statistics' })
  @ApiResponse({ status: 200, description: 'Rate limiting stats' })
  async getRateLimits(): Promise<any> {
    const stats = await this.rateLimitService.getRateLimitStats();
    const configs = this.rateLimitService.getAllEndpointConfigs();
    
    return {
      stats,
      configs: Object.fromEntries(configs),
      activeKeys: Object.keys(stats).length,
    };
  }

  @Get('aggregations')
  @ApiOperation({ summary: 'Get configured response aggregations' })
  @ApiResponse({ status: 200, description: 'Aggregation configurations' })
  getAggregations(): any {
    const configs = this.aggregationService.getAllAggregationConfigs();
    
    return {
      total: configs.size,
      configurations: Object.fromEntries(
        Array.from(configs.entries()).map(([endpoint, config]) => [
          endpoint,
          {
            endpoint: config.endpoint,
            services: config.services.map(s => ({
              service: s.service,
              path: s.path,
              method: s.method,
              responseKey: s.responseKey,
              required: s.required,
            })),
            mergeStrategy: config.mergeStrategy,
            timeout: config.timeout,
            failureStrategy: config.failureStrategy,
            cacheKey: config.cacheKey,
            cacheTtl: config.cacheTtl,
          },
        ])
      ),
    };
  }

  @Get('protocol-formats')
  @ApiOperation({ summary: 'Get supported protocol formats' })
  @ApiResponse({ status: 200, description: 'Supported formats' })
  getProtocolFormats(): any {
    return {
      supported: this.protocolTranslationService.getSupportedFormats(),
      translations: [
        'json ↔ xml',
        'json ↔ form-data',
        'json ↔ text',
        'xml ↔ form-data',
        'xml ↔ text',
        'form-data ↔ text',
      ],
    };
  }

  @Post('circuit-breaker/:service/reset')
  @ApiOperation({ summary: 'Reset circuit breaker for a service' })
  @ApiResponse({ status: 200, description: 'Circuit breaker reset successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  resetCircuitBreaker(@Req() req: Request): any {
    const service = req.params.service;
    const success = this.circuitBreakerService.resetCircuitBreaker(service);
    
    if (!success) {
      return {
        success: false,
        message: `Service '${service}' not found`,
      };
    }

    this.logger.log(`Circuit breaker reset for service: ${service}`);
    
    return {
      success: true,
      message: `Circuit breaker reset for service: ${service}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('circuit-breaker/:service/force-open')
  @ApiOperation({ summary: 'Force circuit breaker open for a service' })
  @ApiResponse({ status: 200, description: 'Circuit breaker forced open' })
  forceCircuitBreakerOpen(@Req() req: Request): any {
    const service = req.params.service;
    const success = this.circuitBreakerService.forceOpen(service);
    
    if (!success) {
      return {
        success: false,
        message: `Service '${service}' not found`,
      };
    }

    this.logger.log(`Circuit breaker forced open for service: ${service}`);
    
    return {
      success: true,
      message: `Circuit breaker forced open for service: ${service}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('circuit-breaker/:service/force-closed')
  @ApiOperation({ summary: 'Force circuit breaker closed for a service' })
  @ApiResponse({ status: 200, description: 'Circuit breaker forced closed' })
  forceCircuitBreakerClosed(@Req() req: Request): any {
    const service = req.params.service;
    const success = this.circuitBreakerService.forceClosed(service);
    
    if (!success) {
      return {
        success: false,
        message: `Service '${service}' not found`,
      };
    }

    this.logger.log(`Circuit breaker forced closed for service: ${service}`);
    
    return {
      success: true,
      message: `Circuit breaker forced closed for service: ${service}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('rate-limits/:key')
  @ApiOperation({ summary: 'Reset rate limit for a specific key' })
  @ApiResponse({ status: 200, description: 'Rate limit reset successfully' })
  async resetRateLimit(@Req() req: Request): Promise<any> {
    const key = req.params.key;
    const success = await this.rateLimitService.resetRateLimit(key);
    
    this.logger.log(`Rate limit reset for key: ${key}`);
    
    return {
      success,
      message: success ? `Rate limit reset for key: ${key}` : `Key not found: ${key}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('metrics')
  @ApiOperation({ summary: 'Clear all metrics history' })
  @ApiResponse({ status: 200, description: 'Metrics cleared successfully' })
  clearMetrics(): any {
    this.observabilityService.clearMetrics();
    
    this.logger.log('All metrics history cleared');
    
    return {
      success: true,
      message: 'All metrics history cleared',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('services/:service/instances')
  @ApiOperation({ summary: 'Add a new service instance' })
  @ApiResponse({ status: 201, description: 'Service instance added successfully' })
  addServiceInstance(@Req() req: Request): any {
    const service = req.params.service;
    const { url, weight = 1 } = req.body;
    
    if (!url) {
      return {
        success: false,
        message: 'URL is required',
      };
    }

    this.loadBalancerService.addServiceInstance(service, url, weight);
    
    this.logger.log(`Added service instance for ${service}: ${url}`);
    
    return {
      success: true,
      message: `Service instance added for ${service}`,
      instance: { url, weight },
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('services/:service/instances/:instanceId')
  @ApiOperation({ summary: 'Remove a service instance' })
  @ApiResponse({ status: 200, description: 'Service instance removed successfully' })
  removeServiceInstance(@Req() req: Request): any {
    const service = req.params.service;
    const instanceId = req.params.instanceId;
    
    const success = this.loadBalancerService.removeServiceInstance(service, instanceId);
    
    if (!success) {
      return {
        success: false,
        message: `Instance '${instanceId}' not found in service '${service}'`,
      };
    }

    this.logger.log(`Removed service instance ${instanceId} from ${service}`);
    
    return {
      success: true,
      message: `Service instance removed: ${instanceId}`,
      timestamp: new Date().toISOString(),
    };
  }
}
