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
  timeout?: number;
  retries?: number;
  cache?: boolean;
  auth?: boolean;
  rateLimit?: boolean;
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
    // Authentication routes
    this.addRoute('POST', '/auth/login', 'auth', { auth: false, rateLimit: true });
    this.addRoute('POST', '/auth/register', 'auth', { auth: false, rateLimit: true });
    this.addRoute('POST', '/auth/refresh', 'auth', { auth: false, rateLimit: true });
    this.addRoute('POST', '/auth/logout', 'auth', { auth: true });
    this.addRoute('GET', '/auth/profile', 'auth', { auth: true, cache: true });
    this.addRoute('PUT', '/auth/profile', 'auth', { auth: true });
    this.addRoute('POST', '/auth/forgot-password', 'auth', { auth: false, rateLimit: true });
    this.addRoute('POST', '/auth/reset-password', 'auth', { auth: false, rateLimit: true });
    this.addRoute('POST', '/auth/verify-email', 'auth', { auth: false });
    
    // OAuth routes
    this.addRoute('GET', '/auth/oauth/google', 'auth', { auth: false });
    this.addRoute('GET', '/auth/oauth/google/callback', 'auth', { auth: false });

    // User management routes
    this.addRoute('GET', '/auth/users', 'auth', { auth: true, cache: true });
    this.addRoute('GET', '/auth/users/:id', 'auth', { auth: true, cache: true });
    this.addRoute('PUT', '/auth/users/:id', 'auth', { auth: true });
    this.addRoute('DELETE', '/auth/users/:id', 'auth', { auth: true });

    // Role management routes
    this.addRoute('GET', '/auth/roles', 'auth', { auth: true, cache: true });
    this.addRoute('POST', '/auth/roles', 'auth', { auth: true });
    this.addRoute('GET', '/auth/roles/:id', 'auth', { auth: true, cache: true });
    this.addRoute('PUT', '/auth/roles/:id', 'auth', { auth: true });
    this.addRoute('DELETE', '/auth/roles/:id', 'auth', { auth: true });

    // Permission management routes
    this.addRoute('GET', '/auth/permissions', 'auth', { auth: true, cache: true });
    this.addRoute('POST', '/auth/permissions', 'auth', { auth: true });
    this.addRoute('GET', '/auth/permissions/:id', 'auth', { auth: true, cache: true });
    this.addRoute('PUT', '/auth/permissions/:id', 'auth', { auth: true });
    this.addRoute('DELETE', '/auth/permissions/:id', 'auth', { auth: true });

    // Resources routes
    this.addRoute('GET', '/resources', 'resources', { auth: true, cache: true });
    this.addRoute('POST', '/resources', 'resources', { auth: true });
    this.addRoute('GET', '/resources/:id', 'resources', { auth: true, cache: true });
    this.addRoute('PUT', '/resources/:id', 'resources', { auth: true });
    this.addRoute('DELETE', '/resources/:id', 'resources', { auth: true });
    this.addRoute('GET', '/resources/search', 'resources', { auth: true, cache: true });
    this.addRoute('POST', '/resources/bulk', 'resources', { auth: true });
    this.addRoute('GET', '/resources/categories', 'resources', { auth: true, cache: true });
    this.addRoute('POST', '/resources/categories', 'resources', { auth: true });

    // Availability routes
    this.addRoute('GET', '/availability', 'availability', { auth: true, cache: true });
    this.addRoute('POST', '/availability/check', 'availability', { auth: true });
    this.addRoute('GET', '/availability/calendar', 'availability', { auth: true, cache: true });
    this.addRoute('GET', '/availability/schedules', 'availability', { auth: true, cache: true });
    this.addRoute('POST', '/availability/schedules', 'availability', { auth: true });
    this.addRoute('PUT', '/availability/schedules/:id', 'availability', { auth: true });
    this.addRoute('DELETE', '/availability/schedules/:id', 'availability', { auth: true });

    // Reservations routes
    this.addRoute('GET', '/reservations', 'availability', { auth: true, cache: true });
    this.addRoute('POST', '/reservations', 'availability', { auth: true });
    this.addRoute('GET', '/reservations/:id', 'availability', { auth: true, cache: true });
    this.addRoute('PUT', '/reservations/:id', 'availability', { auth: true });
    this.addRoute('DELETE', '/reservations/:id', 'availability', { auth: true });
    this.addRoute('POST', '/reservations/:id/cancel', 'availability', { auth: true });
    this.addRoute('GET', '/reservations/history', 'availability', { auth: true, cache: true });

    // Stockpile (Approval) routes
    this.addRoute('GET', '/approvals', 'stockpile', { auth: true, cache: true });
    this.addRoute('POST', '/approvals', 'stockpile', { auth: true });
    this.addRoute('GET', '/approvals/:id', 'stockpile', { auth: true, cache: true });
    this.addRoute('PUT', '/approvals/:id', 'stockpile', { auth: true });
    this.addRoute('POST', '/approvals/:id/approve', 'stockpile', { auth: true });
    this.addRoute('POST', '/approvals/:id/reject', 'stockpile', { auth: true });
    this.addRoute('GET', '/approvals/flows', 'stockpile', { auth: true, cache: true });
    this.addRoute('POST', '/approvals/flows', 'stockpile', { auth: true });

    // Document templates routes
    this.addRoute('GET', '/documents/templates', 'stockpile', { auth: true, cache: true });
    this.addRoute('POST', '/documents/templates', 'stockpile', { auth: true });
    this.addRoute('GET', '/documents/templates/:id', 'stockpile', { auth: true, cache: true });
    this.addRoute('PUT', '/documents/templates/:id', 'stockpile', { auth: true });
    this.addRoute('DELETE', '/documents/templates/:id', 'stockpile', { auth: true });
    this.addRoute('POST', '/documents/generate', 'stockpile', { auth: true });

    // Notification templates routes
    this.addRoute('GET', '/notifications/templates', 'stockpile', { auth: true, cache: true });
    this.addRoute('POST', '/notifications/templates', 'stockpile', { auth: true });
    this.addRoute('GET', '/notifications/templates/:id', 'stockpile', { auth: true, cache: true });
    this.addRoute('PUT', '/notifications/templates/:id', 'stockpile', { auth: true });
    this.addRoute('DELETE', '/notifications/templates/:id', 'stockpile', { auth: true });
    this.addRoute('POST', '/notifications/send', 'stockpile', { auth: true });

    // Reports routes
    this.addRoute('GET', '/reports', 'reports', { auth: true, cache: true });
    this.addRoute('POST', '/reports/generate', 'reports', { auth: true });
    this.addRoute('GET', '/reports/:id', 'reports', { auth: true, cache: true });
    this.addRoute('GET', '/reports/usage', 'reports', { auth: true, cache: true });
    this.addRoute('GET', '/reports/analytics', 'reports', { auth: true, cache: true });
    this.addRoute('GET', '/reports/dashboard', 'reports', { auth: true, cache: true });
    this.addRoute('POST', '/reports/export', 'reports', { auth: true });

    this.logger.log(`Initialized ${this.routes.size} routes`);
  }

  private addRoute(method: string, path: string, service: string, options: Partial<RouteConfig> = {}): void {
    const key = `${method}:${path}`;
    const config: RouteConfig = {
      service,
      path,
      method,
      timeout: this.configService.get(`gateway.microservices.${service}.timeout`, 5000),
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

    return null;
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
      const fullUrl = `${serviceUrl}${request.url}`;

      // Check circuit breaker
      if (!this.circuitBreaker.canExecute(route.service)) {
        throw new Error(`Circuit breaker is open for service: ${route.service}`);
      }

      // Prepare request config
      const config: AxiosRequestConfig = {
        method: request.method as any,
        url: fullUrl,
        headers: request.headers,
        timeout: route.timeout,
        data: request.body,
        params: request.query,
      };

      // Execute request with retry logic
      const response = await this.httpService.axiosRef.request(config);
      
      // Record success for circuit breaker
      this.circuitBreaker.recordSuccess(route.service);

      const duration = Date.now() - startTime;
      
      this.logger.debug(`Proxied ${request.method} ${request.url} to ${route.service} in ${duration}ms`);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers as Record<string, string>,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failure for circuit breaker
      this.circuitBreaker.recordFailure(route.service);
      
      this.logger.error(`Failed to proxy ${request.method} ${request.url} to ${route.service}:`, error.message);
      
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
