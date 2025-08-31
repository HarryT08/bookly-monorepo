import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RoutingService } from '../services/routing.service';
import { AuthService } from '../services/auth.service';
import { RateLimitService } from '../services/rate-limit.service';
import { ResponseAggregationService } from '../services/response-aggregation.service';
import { ObservabilityService } from '../services/observability.service';
import { ProtocolTranslationService } from '../services/protocol-translation.service';
import { LoadBalancerService } from '../services/load-balancer.service';

export interface GatewayRequest extends Request {
  requestId: string;
  startTime: number;
  authContext?: any;
  gatewayRoute?: any;
  targetService?: string;
}

@Injectable()
export class GatewayMiddleware implements NestMiddleware {
  private readonly logger = new Logger(GatewayMiddleware.name);

  constructor(
    private readonly routingService: RoutingService,
    private readonly authService: AuthService,
    private readonly rateLimitService: RateLimitService,
    private readonly aggregationService: ResponseAggregationService,
    private readonly observabilityService: ObservabilityService,
    private readonly protocolTranslationService: ProtocolTranslationService,
    private readonly loadBalancerService: LoadBalancerService,
  ) {}

  async use(req: GatewayRequest, res: Response, next: NextFunction): Promise<void> {
    // Initialize request context
    req.requestId = uuidv4();
    req.startTime = Date.now();

    // Get the original path before NestJS prefix stripping
    const originalPath = req.originalUrl.replace(/\?.*$/, ''); // Remove query params
    const globalPrefix = '/api';
    const routePath = originalPath.startsWith(globalPrefix) 
      ? originalPath.substring(globalPrefix.length) 
      : originalPath;

    // Start tracing
    const traceId = this.observabilityService.startTrace('gateway_request', {
      method: req.method,
      path: routePath,
      originalPath: originalPath,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    try {
      this.logger.debug(`Processing request: ${req.method} ${routePath} (original: ${originalPath})`);
      
      // 1. Find route configuration using the corrected path
      const route = this.routingService.findRoute(req.method, routePath);
      this.logger.debug(`Route found: ${route ? `${route.service}:${route.path}` : 'null'}`);
      
      if (!route) {
        this.logger.warn(`No route found for: ${req.method} ${routePath}`);
        return this.handleNotFound(req, res);
      }

      req.gatewayRoute = route;
      req.targetService = route.service;

      // Add trace tags
      this.observabilityService.addTraceTag(traceId, 'service', route.service);
      this.observabilityService.addTraceTag(traceId, 'route_path', route.path);

      // 2. Rate limiting check
      if (route.rateLimit) {
        const rateLimitResult = await this.checkRateLimit(req, route);
        if (!rateLimitResult.allowed) {
          return this.handleRateLimit(req, res, rateLimitResult);
        }
      }

      // 3. Authentication check
      if (route.auth) {
        const authResult = await this.authenticateRequest(req);
        if (!authResult.success) {
          return this.handleAuthFailure(req, res, authResult.error);
        }
        req.authContext = authResult.context;
        this.observabilityService.addTraceTag(traceId, 'user_id', authResult.context.user.id);
      }

      // 4. Check for aggregation endpoint
      const aggregationConfig = this.aggregationService.getAggregationConfig(req.path);
      if (aggregationConfig) {
        return this.handleAggregation(req, res, aggregationConfig, traceId);
      }

      // 5. Protocol translation (if needed)
      const translationResult = await this.handleProtocolTranslation(req);
      if (translationResult.translated) {
        req.body = translationResult.data;
        req.headers = { ...req.headers, ...translationResult.headers };
      }

      // 6. Handle gateway-specific routes or proxy to microservice
      if (route.service === 'gateway') {
        return this.handleGatewayRoute(req, res, route, traceId);
      }
      
      // Proxy to microservice
      await this.proxyRequest(req, res, route, traceId);

    } catch (error) {
      this.handleError(req, res, error, traceId);
    } finally {
      this.observabilityService.finishTrace(traceId);
    }
  }

  private async checkRateLimit(req: GatewayRequest, route: any): Promise<any> {
    const ip = req.ip;
    const userId = req.authContext?.user?.id;
    const endpoint = req.path;

    // Check global rate limit
    const globalResult = await this.rateLimitService.checkGlobalRateLimit(ip);
    if (!globalResult.allowed) {
      return globalResult;
    }

    // Check user rate limit (if authenticated)
    if (userId) {
      const userResult = await this.rateLimitService.checkUserRateLimit(userId);
      if (!userResult.allowed) {
        return userResult;
      }
    }

    // Check endpoint-specific rate limit
    const identifier = userId || ip;
    const endpointResult = await this.rateLimitService.checkEndpointRateLimit(endpoint, identifier);
    
    return endpointResult;
  }

  private async authenticateRequest(req: GatewayRequest): Promise<any> {
    try {
      const authHeader = req.get('Authorization');
      if (!authHeader) {
        return { success: false, error: 'Missing authorization header' };
      }

      const tokenInfo = this.authService.extractTokenFromHeader(authHeader);
      if (!tokenInfo) {
        return { success: false, error: 'Invalid authorization header format' };
      }

      let authContext;
      if (tokenInfo.type === 'Bearer') {
        authContext = await this.authService.validateJwtToken(tokenInfo.token);
      } else if (tokenInfo.type === 'API-Key') {
        authContext = await this.authService.validateApiKey(tokenInfo.token);
      } else {
        return { success: false, error: 'Unsupported token type' };
      }

      return { success: true, context: authContext };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async handleProtocolTranslation(req: GatewayRequest): Promise<any> {
    const contentType = req.get('Content-Type') || '';
    const acceptHeader = req.get('Accept') || '';

    // Check if translation is needed
    if (!req.body || contentType.includes('application/json')) {
      return { translated: false };
    }

    try {
      // Determine target format (default to JSON)
      let targetFormat: 'json' | 'xml' | 'form-data' | 'text' = 'json';
      
      if (acceptHeader.includes('application/xml')) {
        targetFormat = 'xml';
      } else if (acceptHeader.includes('application/x-www-form-urlencoded')) {
        targetFormat = 'form-data';
      } else if (acceptHeader.includes('text/plain')) {
        targetFormat = 'text';
      }

      const translationResult = await this.protocolTranslationService.translateRequest({
        data: req.body,
        headers: req.headers as Record<string, string>,
        contentType,
        targetFormat,
      });

      return {
        translated: true,
        data: translationResult.data,
        headers: translationResult.headers,
      };

    } catch (error) {
      this.logger.warn(`Protocol translation failed: ${error.message}`);
      return { translated: false };
    }
  }

  private async handleAggregation(
    req: GatewayRequest,
    res: Response,
    config: any,
    traceId: string,
  ): Promise<void> {
    try {
      this.observabilityService.addTraceTag(traceId, 'aggregation', 'true');

      const params = req.params || {};
      const query = req.query as Record<string, string> || {};

      const result = await this.aggregationService.aggregateResponse(
        req.path,
        req.authContext,
        params,
        query,
      );

      // Log aggregation metrics
      this.observabilityService.logRequest({
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: result.success ? 200 : 500,
        duration: Date.now() - req.startTime,
        userAgent: req.get('User-Agent') || '',
        ip: req.ip,
        userId: req.authContext?.user?.id,
        service: 'aggregation',
        timestamp: new Date(),
        headers: req.headers as Record<string, string>,
        responseSize: JSON.stringify(result.data).length,
        requestSize: JSON.stringify(req.body).length || 0,
      });

      res.status(result.success ? 200 : 500).json(result);

    } catch (error) {
      this.handleError(req, res, error, traceId);
    }
  }

  private async proxyRequest(
    req: GatewayRequest,
    res: Response,
    route: any,
    traceId: string,
  ): Promise<void> {
    try {
      this.observabilityService.addTraceTag(traceId, 'proxy', 'true');

      // Use the route path from the route config, not req.path which is stripped
      const routePath = route.path;
      
      const proxyRequest = {
        method: req.method,
        url: routePath,
        headers: req.headers as Record<string, string>,
        body: req.body,
        query: req.query as Record<string, string>,
        params: req.params || {},
      };

      const startTime = Date.now();
      const proxyResponse = await this.routingService.proxyRequest(proxyRequest, route);
      const duration = Date.now() - startTime;

      // Log service call metrics
      this.observabilityService.logServiceCall({
        service: route.service,
        endpoint: req.path,
        method: req.method,
        responseTime: duration,
        statusCode: proxyResponse.status,
        timestamp: new Date(),
        success: proxyResponse.status < 400,
      });

      // Log request metrics
      this.observabilityService.logRequest({
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        statusCode: proxyResponse.status,
        duration: Date.now() - req.startTime,
        userAgent: req.get('User-Agent') || '',
        ip: req.ip,
        userId: req.authContext?.user?.id,
        service: route.service,
        timestamp: new Date(),
        headers: req.headers as Record<string, string>,
        responseSize: JSON.stringify(proxyResponse.data).length,
        requestSize: JSON.stringify(req.body).length || 0,
      });

      // Set response headers
      Object.entries(proxyResponse.headers).forEach(([key, value]) => {
        res.set(key, value);
      });

      res.status(proxyResponse.status).json(proxyResponse.data);

    } catch (error) {
      this.logger.error(`Proxy request failed for ${req.method} ${req.path}:`, {
        error: error.message,
        stack: error.stack,
        service: route.service,
        routePath: route.path
      });
      this.handleError(req, res, error, traceId);
    }
  }

  private handleNotFound(req: GatewayRequest, res: Response): void {
    const error = {
      code: 'GATEWAY_ROUTE_NOT_FOUND',
      message: `Route not found: ${req.method} ${req.path}`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    };

    this.observabilityService.logError({
      requestId: req.requestId,
      error: error.message,
      method: req.method,
      path: req.path,
      ip: req.ip,
      timestamp: new Date(),
      statusCode: 404,
    });

    res.status(404).json(error);
  }

  private handleRateLimit(req: GatewayRequest, res: Response, rateLimitResult: any): void {
    const error = {
      code: 'GATEWAY_RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded',
      statusCode: 429,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      retryAfter: Math.ceil(rateLimitResult.msBeforeNext / 1000),
    };

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimitResult.totalHits + rateLimitResult.totalHitsRemaining,
      'X-RateLimit-Remaining': rateLimitResult.totalHitsRemaining,
      'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
      'Retry-After': error.retryAfter,
    });

    this.observabilityService.logError({
      requestId: req.requestId,
      error: error.message,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.authContext?.user?.id,
      timestamp: new Date(),
      statusCode: 429,
    });

    res.status(429).json(error);
  }

  private handleAuthFailure(req: GatewayRequest, res: Response, errorMessage: string): void {
    const error = {
      code: 'GATEWAY_AUTH_FAILED',
      message: 'Authentication failed',
      details: errorMessage,
      statusCode: 401,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    };

    this.observabilityService.logError({
      requestId: req.requestId,
      error: `Authentication failed: ${errorMessage}`,
      method: req.method,
      path: req.path,
      ip: req.ip,
      timestamp: new Date(),
      statusCode: 401,
    });

    res.status(401).json(error);
  }

  private async handleGatewayRoute(
    req: GatewayRequest,
    res: Response,
    route: any,
    traceId: string,
  ): Promise<void> {
    try {
      this.observabilityService.addTraceTag(traceId, 'gateway_route', 'true');
      
      // Handle aggregated health endpoint
      if (route.path === '/v1/health' && req.method === 'GET') {
        const services = ['auth', 'resources', 'availability', 'stockpile', 'reports'];
        const healthResults: any = {};
        let overallStatus = 'healthy';

        for (const service of services) {
          try {
            // Use LoadBalancerService to get dynamic service URL
            const serviceUrl = await this.loadBalancerService.getServiceUrl(service);
            const healthUrl = `${serviceUrl}/api/v1/health`;
            
            // Simple HTTP request
            const response = await fetch(healthUrl, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(3000)
            });
            
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
            let serviceUrl = 'N/A';
            try {
              serviceUrl = await this.loadBalancerService.getServiceUrl(service);
            } catch {}
            
            healthResults[service] = {
              status: 'down',
              error: error.message || 'Connection failed',
              url: serviceUrl !== 'N/A' ? `${serviceUrl}/api/v1/health` : 'N/A'
            };
            overallStatus = 'degraded';
          }
        }

        const result = {
          status: overallStatus,
          timestamp: new Date().toISOString(),
          gateway: {
            status: 'healthy',
            version: '1.0.0'
          },
          services: healthResults
        };

        res.status(200).json(result);
        return;
      }
      
      // Default fallback for unknown gateway routes
      res.status(404).json({
        code: 'GATEWAY_ROUTE_NOT_FOUND',
        message: `Gateway route not implemented: ${req.method} ${route.path}`,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.handleError(req, res, error, traceId);
    }
  }


  private handleError(req: GatewayRequest, res: Response, error: any, traceId: string): void {
    const statusCode = error.status || error.statusCode || 500;
    const errorResponse = {
      code: 'GATEWAY_INTERNAL_ERROR',
      message: 'Internal gateway error',
      details: error.message,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    };

    this.observabilityService.addTraceTag(traceId, 'error', 'true');
    this.observabilityService.addTraceTag(traceId, 'error_message', error.message);

    this.observabilityService.logError({
      requestId: req.requestId,
      error: error.message,
      stack: error.stack,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.authContext?.user?.id,
      service: req.targetService,
      timestamp: new Date(),
      statusCode,
    });

    res.status(statusCode).json(errorResponse);
  }
}
