import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, timeout, map } from 'rxjs/operators';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { LoadBalancerService } from './load-balancer.service';
import { CircuitBreakerService } from './circuit-breaker.service';

export interface RouteConfig {
  service: string;
  path: string;
  method: string;
  version?: string; // API version (v1, v2, etc.)
  targetVersion?: string; // Target microservice version
  timeout?: number;
  retries?: number;
  cache?: boolean;
  auth?: boolean;
  rateLimit?: boolean;
  deprecated?: boolean;
  deprecationDate?: string;
}

export interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ProxyResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  duration: number;
}

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly routes: Map<string, RouteConfig> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly loadBalancer: LoadBalancerService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Initialize versioned routes
    this.initializeV1Routes();
    this.initializeV2Routes(); // For future versions
    
    this.logger.log(`Initialized ${this.routes.size} versioned routes`);
  }

  private initializeV1Routes(): void {
    // V1 Aggregated health route (handled by gateway)
    this.addVersionedRoute('GET', '/v1/health', 'gateway', 'v1', { auth: false });
    
    // V1 Health routes - individual microservice health checks
    this.addVersionedRoute('GET', '/v1/auth/health', 'auth', 'v1', { auth: false });
    this.addVersionedRoute('GET', '/v1/resources/health', 'resources', 'v1', { auth: false });
    this.addVersionedRoute('GET', '/v1/availability/health', 'availability', 'v1', { auth: false });
    this.addVersionedRoute('GET', '/v1/stockpile/health', 'stockpile', 'v1', { auth: false });
    this.addVersionedRoute('GET', '/v1/reports/health', 'reports', 'v1', { auth: false });
    
    // V1 Authentication routes
    this.addVersionedRoute('POST', '/v1/auth/login', 'auth', 'v1', { auth: false, rateLimit: true });
    this.addVersionedRoute('POST', '/v1/auth/register', 'auth', 'v1', { auth: false, rateLimit: true });
    this.addVersionedRoute('POST', '/v1/auth/refresh', 'auth', 'v1', { auth: false, rateLimit: true });
    this.addVersionedRoute('POST', '/v1/auth/logout', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('POST', '/v1/auth/profile', 'auth', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/auth/profile', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('POST', '/v1/auth/forgot-password', 'auth', 'v1', { auth: false, rateLimit: true });
    this.addVersionedRoute('POST', '/v1/auth/reset-password', 'auth', 'v1', { auth: false, rateLimit: true });
    this.addVersionedRoute('POST', '/v1/auth/verify-email', 'auth', 'v1', { auth: false });
    this.addVersionedRoute('GET', '/v1/auth/categories', 'auth', 'v1', { auth: false });
    this.addVersionedRoute('GET', '/v1/auth/categories/defaults', 'auth', 'v1', { auth: false });
    
    // V1 OAuth routes
    this.addVersionedRoute('GET', '/v1/auth/oauth/google', 'auth', 'v1', { auth: false });
    this.addVersionedRoute('GET', '/v1/auth/oauth/google/callback', 'auth', 'v1', { auth: false });

    // V1 User management routes
    this.addVersionedRoute('GET', '/v1/users', 'auth', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('GET', '/v1/users/:id', 'auth', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/users/:id', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/users/:id', 'auth', 'v1', { auth: true });

    // V1 Role management routes
    this.addVersionedRoute('GET', '/v1/roles', 'auth', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/roles', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/roles/:id', 'auth', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/roles/:id', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/roles/:id', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/roles/active', 'auth', 'v1', { auth: true, cache: true });

    // V1 Permission management routes
    this.addVersionedRoute('GET', '/v1/permissions', 'auth', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/permissions', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/permissions/:id', 'auth', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/permissions/:id', 'auth', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/permissions/:id', 'auth', 'v1', { auth: true });

    // V1 Resources routes
    this.addVersionedRoute('GET', '/v1/resources', 'resources', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/resources', 'resources', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/resources/:id', 'resources', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/resources/:id', 'resources', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/resources/:id', 'resources', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/resources/search', 'resources', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/resources/bulk', 'resources', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/resources/categories', 'resources', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/resources/categories', 'resources', 'v1', { auth: true });

    // V1 Availability routes
    this.addVersionedRoute('GET', '/v1/availability', 'availability', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/availability/check', 'availability', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/availability/calendar', 'availability', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('GET', '/v1/availability/schedules', 'availability', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/availability/schedules', 'availability', 'v1', { auth: true });
    this.addVersionedRoute('PUT', '/v1/availability/schedules/:id', 'availability', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/availability/schedules/:id', 'availability', 'v1', { auth: true });

    // V1 Reservations routes
    this.addVersionedRoute('GET', '/v1/reservations', 'availability', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/reservations', 'availability', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/reservations/:id', 'availability', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/reservations/:id', 'availability', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/reservations/:id', 'availability', 'v1', { auth: true });
    this.addVersionedRoute('POST', '/v1/reservations/:id/cancel', 'availability', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/reservations/history', 'availability', 'v1', { auth: true, cache: true });

    // V1 Stockpile (Approval) routes
    this.addVersionedRoute('GET', '/v1/approvals', 'stockpile', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/approvals', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/approvals/:id', 'stockpile', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/approvals/:id', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('POST', '/v1/approvals/:id/approve', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('POST', '/v1/approvals/:id/reject', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/approvals/flows', 'stockpile', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/approvals/flows', 'stockpile', 'v1', { auth: true });

    // V1 Document templates routes
    this.addVersionedRoute('GET', '/v1/documents/templates', 'stockpile', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/documents/templates', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/documents/templates/:id', 'stockpile', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/documents/templates/:id', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/documents/templates/:id', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('POST', '/v1/documents/generate', 'stockpile', 'v1', { auth: true });

    // V1 Notification templates routes
    this.addVersionedRoute('GET', '/v1/notifications/templates', 'stockpile', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/notifications/templates', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/notifications/templates/:id', 'stockpile', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('PUT', '/v1/notifications/templates/:id', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('DELETE', '/v1/notifications/templates/:id', 'stockpile', 'v1', { auth: true });
    this.addVersionedRoute('POST', '/v1/notifications/send', 'stockpile', 'v1', { auth: true });

    // V1 Reports routes
    this.addVersionedRoute('GET', '/v1/reports', 'reports', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/reports/generate', 'reports', 'v1', { auth: true });
    this.addVersionedRoute('GET', '/v1/reports/:id', 'reports', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('GET', '/v1/reports/usage', 'reports', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('GET', '/v1/reports/analytics', 'reports', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('GET', '/v1/reports/dashboard', 'reports', 'v1', { auth: true, cache: true });
    this.addVersionedRoute('POST', '/v1/reports/export', 'reports', 'v1', { auth: true });
  }

  private initializeV2Routes(): void {
    // V2 routes can be added here for future versions
    // Example: Enhanced authentication with additional security
    // this.addVersionedRoute('POST', '/v2/auth/login', 'auth', 'v2', { auth: false, rateLimit: true, enhanced: true });
  }

  private addVersionedRoute(method: string, path: string, service: string, version: string, options: Partial<RouteConfig> = {}): void {
    const key = `${method}:${path}`;
    const config: RouteConfig = {
      service,
      path,
      method,
      version,
      targetVersion: version, // Target microservice version
      timeout: this.configService.get(`gateway.microservices.${service}.timeout`, 30000),
      retries: this.configService.get(`gateway.microservices.${service}.retries`, 3),
      cache: false,
      auth: true,
      rateLimit: false,
      ...options,
    };
    
    this.routes.set(key, config);
  }

  public findRoute(method: string, path: string): RouteConfig | null {
    // Exact match first
    const exactKey = `${method}:${path}`;
    if (this.routes.has(exactKey)) {
      return this.routes.get(exactKey);
    }

    // Pattern matching for parameterized routes
    for (const [key, config] of this.routes.entries()) {
      const [routeMethod, routePath] = key.split(':');
      if (routeMethod === method && this.matchPath(routePath, path)) {
        return config;
      }
    }

    // If no versioned route found, try to find a fallback without version
    const pathWithoutVersion = this.extractPathWithoutVersion(path);
    if (pathWithoutVersion !== path) {
      return this.findRoute(method, pathWithoutVersion);
    }

    return null;
  }

  private extractPathWithoutVersion(path: string): string {
    // Remove version prefix like /v1, /v2, etc. and ensure leading slash
    const pathWithoutVersion = path.replace(/^\/v\d+/, '');
    return pathWithoutVersion.startsWith('/') ? pathWithoutVersion : '/' + pathWithoutVersion;
  }

  private extractVersionFromPath(path: string): string | null {
    const versionMatch = path.match(/^\/v(\d+)/);
    return versionMatch ? `v${versionMatch[1]}` : null;
  }

  private matchPath(pattern: string, path: string): boolean {
    // Convert pattern like /users/:id to regex
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  public async proxyRequest(request: ProxyRequest, route: RouteConfig): Promise<ProxyResponse> {
    const startTime = Date.now();
    
    try {
      // Get service URL with load balancing
      const serviceUrl = await this.loadBalancer.getServiceUrl(route.service);
      
      // Build target URL with version handling
      let targetPath = request.url;
      
      // Debug logging
      this.logger.debug(`Original request.url: ${request.url}`);
      
      // If route has a version, ensure the microservice receives the correct path
      if (route.version && route.targetVersion) {
        // Remove gateway version from path and add target version if different
        const pathWithoutVersion = this.extractPathWithoutVersion(request.url);
        this.logger.debug(`Path without version: ${pathWithoutVersion}`);
        
        // Handle special routing for health endpoints
        if (pathWithoutVersion.endsWith('/health')) {
          // For health endpoints, only send /health to the service
          // /auth/health → /health, /resources/health → /health, etc.
          targetPath = `/api/v1/health`;
        } else {
          // For other endpoints, send the full path
          targetPath = `/api/v1${pathWithoutVersion}`;
        }
        
        // Add version info to headers for microservice version detection
        request.headers = {
          ...request.headers,
          'X-API-Version': route.version,
          'X-Target-Version': route.targetVersion,
        };
      }
      
      const fullUrl = `${serviceUrl}${targetPath}`;
      this.logger.debug(`Final proxy URL: ${fullUrl}`);

      // Check circuit breaker
      if (!this.circuitBreaker.canExecute(route.service)) {
        throw new Error(`Circuit breaker is open for service: ${route.service}`);
      }

      // Clean headers for proxy request
      const proxyHeaders = { ...request.headers };
      
      // Remove problematic headers that should be set by axios
      delete proxyHeaders['host'];
      delete proxyHeaders['content-length'];
      
      // Prepare request config
      const config: AxiosRequestConfig = {
        method: request.method as any,
        url: fullUrl,
        headers: proxyHeaders,
        timeout: route.timeout,
        data: request.body,
        params: request.query,
        validateStatus: (status) => status < 500, // Same as health check
      };


      // Execute request with retry logic
      const response = await this.httpService.axiosRef.request(config);
      
      // Record success for circuit breaker
      this.circuitBreaker.recordSuccess(route.service);

      const duration = Date.now() - startTime;
      
      this.logger.debug(`Proxied ${request.method} ${request.url} to ${route.service}${route.version ? ` (${route.version})` : ''} in ${duration}ms`);

      // Add version information to response headers
      const responseHeaders = {
        ...response.headers as Record<string, string>,
        'X-Gateway-Version': route.version || 'v1',
        'X-Service-Version': route.targetVersion || 'v1',
      };

      return {
        status: response.status,
        data: response.data,
        headers: responseHeaders,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failure for circuit breaker
      this.circuitBreaker.recordFailure(route.service);
      
      this.logger.error(`Failed to proxy ${request.method} ${request.url} to ${route.service}${route.version ? ` (${route.version})` : ''}:`, error.message);
      
      throw {
        status: error.response?.status || 500,
        data: error.response?.data || { message: 'Internal server error', code: 'GATEWAY_ERROR' },
        headers: error.response?.headers || {},
        duration,
      };
    }
  }

  public getAllRoutes(): RouteConfig[] {
    return Array.from(this.routes.values());
  }

  public getRoutesByService(service: string): RouteConfig[] {
    return Array.from(this.routes.values()).filter(route => route.service === service);
  }
}
