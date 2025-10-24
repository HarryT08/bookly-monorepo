import { Controller, Delete, Get, Logger, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CircuitBreakerService } from "../services/circuit-breaker.service";
import { LoadBalancerService } from "../services/load-balancer.service";
import { ObservabilityService } from "../services/observability.service";
import { ProtocolTranslationService } from "../services/protocol-translation.service";
import { RateLimitService } from "../services/rate-limit.service";
import { ResponseAggregationService } from "../services/response-aggregation.service";
import { RoutingService } from "../services/routing.service";

@ApiTags("Gateway")
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
    private readonly protocolTranslationService: ProtocolTranslationService
  ) {}

  // All request handling should be done by GatewayMiddleware
  // No routes defined here to avoid interference with specific controllers
}

@ApiTags("Gateway Management")
@Controller("_gateway")
export class GatewayManagementController {
  private readonly logger = new Logger(GatewayManagementController.name);

  constructor(
    private readonly routingService: RoutingService,
    private readonly loadBalancerService: LoadBalancerService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly rateLimitService: RateLimitService,
    private readonly observabilityService: ObservabilityService,
    private readonly aggregationService: ResponseAggregationService,
    private readonly protocolTranslationService: ProtocolTranslationService
  ) {}

  @Get("health")
  @ApiOperation({ summary: "Gateway internal services health check" })
  @ApiResponse({ status: 200, description: "Gateway services status" })
  async getHealth(): Promise<any> {
    const timestamp = new Date().toISOString();

    try {
      // Health checks para servicios internos del gateway
      const healthChecks = await Promise.allSettled([
        this.checkRoutingServiceHealth(),
        this.checkLoadBalancerHealth(),
        this.checkCircuitBreakerHealth(),
        this.checkRateLimitHealth(),
        this.checkObservabilityHealth(),
        this.checkAggregationHealth(),
        this.checkProtocolTranslationHealth(),
      ]);

      const services: any = {};
      let overallStatus = "healthy";

      // Mapear resultados a nombres de servicios
      const serviceNames = [
        "routing",
        "loadBalancer",
        "circuitBreaker",
        "rateLimit",
        "observability",
        "aggregation",
        "protocolTranslation",
      ];

      healthChecks.forEach((result, index) => {
        const serviceName = serviceNames[index];
        if (result.status === "fulfilled") {
          services[serviceName] = result.value;
        } else {
          services[serviceName] = "unhealthy";
          overallStatus = "degraded";
        }
      });

      return {
        status: overallStatus,
        timestamp,
        version: "1.0.0",
        services,
      };
    } catch (error) {
      this.logger.error("Gateway health check failed", error);
      return {
        status: "unhealthy",
        timestamp,
        version: "1.0.0",
        error: "Health check failed",
      };
    }
  }

  // Health check methods para servicios internos del gateway
  private async checkRoutingServiceHealth(): Promise<string> {
    try {
      // Verificar que el routing service puede obtener rutas
      const routes = await this.routingService.getAllRoutes();
      return Array.isArray(routes) && routes.length > 0
        ? "operational"
        : "degraded";
    } catch {
      return "unhealthy";
    }
  }

  private async checkLoadBalancerHealth(): Promise<string> {
    try {
      // Verificar que el load balancer tiene servicios disponibles
      const services = ["auth", "resources", "availability"];
      for (const service of services) {
        await this.loadBalancerService.getServiceUrl(service);
      }
      return "operational";
    } catch {
      return "degraded";
    }
  }

  private async checkCircuitBreakerHealth(): Promise<string> {
    try {
      // Verificar estado de circuit breakers - todos deben estar healthy
      const services = [
        "auth",
        "resources",
        "availability",
        "stockpile",
        "reports",
      ];
      const allHealthy = services.every((service) =>
        this.circuitBreakerService.isServiceHealthy(service)
      );
      return allHealthy ? "operational" : "degraded";
    } catch {
      return "unhealthy";
    }
  }

  private async checkRateLimitHealth(): Promise<string> {
    try {
      // Verificar configuración de rate limiting
      const configs = this.rateLimitService.getAllEndpointConfigs();
      return configs && Object.keys(configs).length > 0
        ? "operational"
        : "degraded";
    } catch {
      return "unhealthy";
    }
  }

  private async checkObservabilityHealth(): Promise<string> {
    try {
      // Verificar que observability puede generar métricas
      const metrics = this.observabilityService.getMetricsSummary();
      return metrics ? "operational" : "degraded";
    } catch {
      return "unhealthy";
    }
  }

  private async checkAggregationHealth(): Promise<string> {
    try {
      // Verificar configuraciones de agregación inicializadas
      const configs = this.aggregationService.getAllAggregationConfigs();

      // Debe tener al menos las configuraciones básicas (dashboard, admin-analytics)
      const hasConfigs = configs && configs.size >= 2;

      // Verificar que las configuraciones clave existan
      const hasDashboard = configs.has("/dashboard");
      const hasAdminAnalytics = configs.has("/admin/analytics");

      return hasConfigs && hasDashboard && hasAdminAnalytics
        ? "operational"
        : "degraded";
    } catch {
      return "unhealthy";
    }
  }

  private async checkProtocolTranslationHealth(): Promise<string> {
    try {
      // Verificar formatos soportados
      const supportedFormats =
        this.protocolTranslationService.getSupportedFormats();
      const expectedFormats = ["json", "xml", "form-data", "text"];

      // Verificar que todos los formatos esperados estén disponibles
      const hasAllFormats = expectedFormats.every((format) =>
        supportedFormats.includes(format)
      );

      // Verificar que cada formato es reconocido como soportado
      const formatChecks = expectedFormats.every((format) =>
        this.protocolTranslationService.isFormatSupported(format)
      );

      // Realizar una traducción simple para verificar funcionalidad
      const testData = {
        test: "health-check",
        timestamp: new Date().toISOString(),
      };
      const testTranslation =
        await this.protocolTranslationService.translateResponse(
          testData,
          "json",
          "xml"
        );

      const translationWorks =
        testTranslation &&
        testTranslation.data &&
        testTranslation.contentType.includes("xml");

      return hasAllFormats && formatChecks && translationWorks
        ? "operational"
        : "degraded";
    } catch {
      return "unhealthy";
    }
  }

  @Get("health/aggregated")
  @ApiOperation({ summary: "Aggregated health check of all microservices" })
  @ApiResponse({ status: 200, description: "Health status of all services" })
  async getAggregatedHealth(): Promise<any> {
    const services = [
      "auth",
      "resources",
      "availability",
      "stockpile",
      "reports",
    ];
    const healthResults: any = {};
    let overallStatus = "healthy";

    for (const service of services) {
      try {
        const serviceUrl =
          await this.loadBalancerService.getServiceUrl(service);
        const healthUrl = `${serviceUrl}/api/v1/health`;

        // Simple health check using fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(healthUrl, {
          signal: controller.signal,
          method: "GET",
          headers: { Accept: "application/json" },
        });

        clearTimeout(timeout);

        if (response.ok) {
          const healthData = await response.json();
          healthResults[service] = {
            status: "up",
            response: healthData,
            url: healthUrl,
          };
        } else {
          healthResults[service] = {
            status: "down",
            error: `HTTP ${response.status}`,
            url: healthUrl,
          };
          overallStatus = "degraded";
        }
      } catch (error: any) {
        healthResults[service] = {
          status: "down",
          error: error.message || "Connection failed",
          url: "N/A",
        };
        overallStatus = "degraded";
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      gateway: {
        status: "healthy",
        version: "1.0.0",
      },
      services: healthResults,
    };
  }

  @Get("routes")
  @ApiOperation({ summary: "Get all configured routes" })
  @ApiResponse({ status: 200, description: "List of all routes" })
  getRoutes(): any {
    const routes = this.routingService.getAllRoutes();
    return {
      total: routes.length,
      routes: routes.map((route) => ({
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

  @Get("services")
  @ApiOperation({ summary: "Get all service instances and their health" })
  @ApiResponse({ status: 200, description: "Service instances status" })
  getServices(): any {
    const allInstances = this.loadBalancerService.getAllServiceInstances();
    const services: any = {};

    for (const [serviceName, instances] of allInstances.entries()) {
      const circuitBreakerStats =
        this.circuitBreakerService.getCircuitBreakerStats(serviceName);

      services[serviceName] = {
        instances: instances.map((instance) => ({
          id: instance.id,
          url: instance.url,
          healthy: instance.healthy,
          weight: instance.weight,
          activeConnections: instance.activeConnections,
          responseTime: instance.responseTime,
          lastHealthCheck: instance.lastHealthCheck,
        })),
        circuitBreaker: circuitBreakerStats
          ? {
              state: circuitBreakerStats.state,
              failureCount: circuitBreakerStats.failureCount,
              successCount: circuitBreakerStats.successCount,
              failureRate: circuitBreakerStats.failureRate,
              nextAttemptTime: circuitBreakerStats.nextAttemptTime,
            }
          : null,
        healthyInstances:
          this.loadBalancerService.getHealthyInstancesCount(serviceName),
        totalInstances:
          this.loadBalancerService.getTotalInstancesCount(serviceName),
        availability:
          this.circuitBreakerService.getServiceAvailability(serviceName),
      };
    }

    return services;
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get gateway metrics and statistics" })
  @ApiResponse({ status: 200, description: "Gateway metrics" })
  getMetrics(): any {
    return this.observabilityService.getMetricsSummary();
  }

  @Get("metrics/health")
  @ApiOperation({ summary: "Get health-specific metrics" })
  @ApiResponse({ status: 200, description: "Health metrics" })
  getHealthMetrics(): any {
    return this.observabilityService.getHealthMetrics();
  }

  @Get("rate-limits")
  @ApiOperation({ summary: "Get rate limiting statistics" })
  @ApiResponse({ status: 200, description: "Rate limiting stats" })
  async getRateLimits(): Promise<any> {
    const stats = await this.rateLimitService.getRateLimitStats();
    const configs = this.rateLimitService.getAllEndpointConfigs();

    return {
      stats,
      configs: Object.fromEntries(configs),
      activeKeys: Object.keys(stats).length,
    };
  }

  @Get("aggregations")
  @ApiOperation({ summary: "Get configured response aggregations" })
  @ApiResponse({ status: 200, description: "Aggregation configurations" })
  getAggregations(): any {
    const configs = this.aggregationService.getAllAggregationConfigs();

    return {
      total: configs.size,
      configurations: Object.fromEntries(
        Array.from(configs.entries()).map(([endpoint, config]) => [
          endpoint,
          {
            endpoint: config.endpoint,
            services: config.services.map((s) => ({
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

  @Get("protocol-formats")
  @ApiOperation({ summary: "Get supported protocol formats" })
  @ApiResponse({ status: 200, description: "Supported formats" })
  getProtocolFormats(): any {
    return {
      supported: this.protocolTranslationService.getSupportedFormats(),
      translations: [
        "json ↔ xml",
        "json ↔ form-data",
        "json ↔ text",
        "xml ↔ form-data",
        "xml ↔ text",
        "form-data ↔ text",
      ],
    };
  }

  @Post("circuit-breaker/:service/reset")
  @ApiOperation({ summary: "Reset circuit breaker for a service" })
  @ApiResponse({
    status: 200,
    description: "Circuit breaker reset successfully",
  })
  @ApiResponse({ status: 404, description: "Service not found" })
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

  @Post("circuit-breaker/:service/force-open")
  @ApiOperation({ summary: "Force circuit breaker open for a service" })
  @ApiResponse({ status: 200, description: "Circuit breaker forced open" })
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

  @Post("circuit-breaker/:service/force-closed")
  @ApiOperation({ summary: "Force circuit breaker closed for a service" })
  @ApiResponse({ status: 200, description: "Circuit breaker forced closed" })
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

  @Delete("rate-limits/:key")
  @ApiOperation({ summary: "Reset rate limit for a specific key" })
  @ApiResponse({ status: 200, description: "Rate limit reset successfully" })
  async resetRateLimit(@Req() req: Request): Promise<any> {
    const key = req.params.key;
    const success = await this.rateLimitService.resetRateLimit(key);

    this.logger.log(`Rate limit reset for key: ${key}`);

    return {
      success,
      message: success
        ? `Rate limit reset for key: ${key}`
        : `Key not found: ${key}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete("metrics")
  @ApiOperation({ summary: "Clear all metrics history" })
  @ApiResponse({ status: 200, description: "Metrics cleared successfully" })
  clearMetrics(): any {
    this.observabilityService.clearMetrics();

    this.logger.log("All metrics history cleared");

    return {
      success: true,
      message: "All metrics history cleared",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("services/:service/instances")
  @ApiOperation({ summary: "Add a new service instance" })
  @ApiResponse({
    status: 201,
    description: "Service instance added successfully",
  })
  addServiceInstance(@Req() req: Request): any {
    const service = req.params.service;
    const { url, weight = 1 } = req.body;

    if (!url) {
      return {
        success: false,
        message: "URL is required",
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

  @Delete("services/:service/instances/:instanceId")
  @ApiOperation({ summary: "Remove a service instance" })
  @ApiResponse({
    status: 200,
    description: "Service instance removed successfully",
  })
  removeServiceInstance(@Req() req: Request): any {
    const service = req.params.service;
    const instanceId = req.params.instanceId;

    const success = this.loadBalancerService.removeServiceInstance(
      service,
      instanceId
    );

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
