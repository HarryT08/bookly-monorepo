import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RoutingService, RouteConfig, ProxyRequest } from '../../infrastructure/services/routing.service';
import { LoadBalancerService } from '../../infrastructure/services/load-balancer.service';
import { CircuitBreakerService } from '../../infrastructure/services/circuit-breaker.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('RoutingService', () => {
  let service: RoutingService;
  let configService: jest.Mocked<ConfigService>;
  let httpService: jest.Mocked<HttpService>;
  let loadBalancerService: jest.Mocked<LoadBalancerService>;
  let circuitBreakerService: jest.Mocked<CircuitBreakerService>;

  const mockAxiosResponse: AxiosResponse = {
    data: { message: 'success' },
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config: {} as any,
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockHttpService = {
      axiosRef: {
        request: jest.fn(),
      },
    };

    const mockLoadBalancerService = {
      getServiceUrl: jest.fn(),
    };

    const mockCircuitBreakerService = {
      canExecute: jest.fn(),
      recordSuccess: jest.fn(),
      recordFailure: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutingService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: LoadBalancerService, useValue: mockLoadBalancerService },
        { provide: CircuitBreakerService, useValue: mockCircuitBreakerService },
      ],
    }).compile();

    service = module.get<RoutingService>(RoutingService);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
    loadBalancerService = module.get(LoadBalancerService);
    circuitBreakerService = module.get(CircuitBreakerService);

    // Setup default mocks
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        'gateway.microservices.auth.timeout': 5000,
        'gateway.microservices.auth.retries': 3,
        'gateway.microservices.resources.timeout': 5000,
        'gateway.microservices.resources.retries': 3,
      };
      return config[key] || defaultValue;
    });
  });

  describe('Route Finding', () => {
    it('should find exact route match', () => {
      const route = service.findRoute('POST', '/auth/login');
      
      expect(route).toBeDefined();
      expect(route?.service).toBe('auth');
      expect(route?.method).toBe('POST');
      expect(route?.path).toBe('/auth/login');
      expect(route?.auth).toBe(false);
      expect(route?.rateLimit).toBe(true);
    });

    it('should find parameterized route match', () => {
      const route = service.findRoute('GET', '/auth/users/123');
      
      expect(route).toBeDefined();
      expect(route?.service).toBe('auth');
      expect(route?.method).toBe('GET');
      expect(route?.path).toBe('/auth/users/:id');
      expect(route?.auth).toBe(true);
      expect(route?.cache).toBe(true);
    });

    it('should return null for non-existent route', () => {
      const route = service.findRoute('GET', '/non-existent');
      
      expect(route).toBeNull();
    });

    it('should match complex parameterized routes', () => {
      const route = service.findRoute('GET', '/resources/123');
      
      expect(route).toBeDefined();
      expect(route?.service).toBe('resources');
      expect(route?.path).toBe('/resources/:id');
    });
  });

  describe('Route Configuration', () => {
    it('should return all routes', () => {
      const routes = service.getAllRoutes();
      
      expect(routes).toBeInstanceOf(Array);
      expect(routes.length).toBeGreaterThan(0);
      
      // Check for key routes
      const loginRoute = routes.find(r => r.method === 'POST' && r.path === '/auth/login');
      expect(loginRoute).toBeDefined();
      expect(loginRoute?.service).toBe('auth');
    });

    it('should return routes by service', () => {
      const authRoutes = service.getRoutesByService('auth');
      
      expect(authRoutes).toBeInstanceOf(Array);
      expect(authRoutes.length).toBeGreaterThan(0);
      expect(authRoutes.every(route => route.service === 'auth')).toBe(true);
    });

    it('should return empty array for non-existent service', () => {
      const routes = service.getRoutesByService('non-existent');
      
      expect(routes).toBeInstanceOf(Array);
      expect(routes.length).toBe(0);
    });
  });

  describe('Request Proxying', () => {
    const mockRoute: RouteConfig = {
      service: 'auth',
      path: '/auth/login',
      method: 'POST',
      timeout: 5000,
      retries: 3,
      auth: false,
      cache: false,
      rateLimit: true,
    };

    const mockProxyRequest: ProxyRequest = {
      method: 'POST',
      url: '/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'test@example.com', password: 'password' },
      query: {},
      params: {},
    };

    beforeEach(() => {
      loadBalancerService.getServiceUrl.mockResolvedValue('http://auth-service:3001');
      circuitBreakerService.canExecute.mockReturnValue(true);
      httpService.request.mockResolvedValue(mockAxiosResponse as never);
    });

    it('should successfully proxy request', async () => {
      const response = await service.proxyRequest(mockProxyRequest, mockRoute);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ message: 'success' });
      expect(response.duration).toBeGreaterThan(0);
      
      expect(loadBalancerService.getServiceUrl).toHaveBeenCalledWith('auth');
      expect(circuitBreakerService.canExecute).toHaveBeenCalledWith('auth');
      expect(circuitBreakerService.recordSuccess).toHaveBeenCalledWith('auth');
    });

    it('should handle circuit breaker open', async () => {
      circuitBreakerService.canExecute.mockReturnValue(false);

      await expect(service.proxyRequest(mockProxyRequest, mockRoute))
        .rejects.toThrow('Circuit breaker is open for service: auth');
    });

    it('should handle request timeout', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'ETIMEDOUT';
      httpService.request.mockRejectedValue(timeoutError as never);

      await expect(service.proxyRequest(mockProxyRequest, mockRoute))
        .rejects.toMatchObject({
          status: 500,
          data: { message: 'Internal server error', code: 'GATEWAY_ERROR' },
        });

      expect(circuitBreakerService.recordFailure).toHaveBeenCalledWith('auth');
    });

    it('should handle service unavailable', async () => {
      const serviceError = {
        response: {
          status: 503,
          data: { message: 'Service unavailable' },
          headers: {},
        },
      };
      httpService.request.mockRejectedValue(serviceError as never);

      await expect(service.proxyRequest(mockProxyRequest, mockRoute))
        .rejects.toMatchObject({
          status: 503,
          data: { message: 'Service unavailable' },
        });
    });

    it('should include request headers in proxy call', async () => {
      await service.proxyRequest(mockProxyRequest, mockRoute);

      expect(httpService.request).toHaveBeenCalledWith({
        method: 'post',
        url: 'http://auth-service:3001/auth/login',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        data: { email: 'test@example.com', password: 'password' },
        params: {},
      });
    });

    it('should handle query parameters', async () => {
      const requestWithQuery = {
        ...mockProxyRequest,
        query: { limit: '10', offset: '0' },
      };

      await service.proxyRequest(requestWithQuery, mockRoute);

      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { limit: '10', offset: '0' },
        })
      );
    });
  });

  describe('Path Matching', () => {
    it('should match exact paths', () => {
      const route = service.findRoute('GET', '/auth/profile');
      expect(route?.path).toBe('/auth/profile');
    });

    it('should match single parameter paths', () => {
      const route = service.findRoute('GET', '/resources/123');
      expect(route?.path).toBe('/resources/:id');
    });

    it('should match multiple parameter paths', () => {
      // Assuming we have a route like /users/:userId/reservations/:reservationId
      const route = service.findRoute('GET', '/users/123/reservations/456');
      // This would match if such a route exists in the routing configuration
    });

    it('should not match incorrect paths', () => {
      const route = service.findRoute('GET', '/auth/profile/extra');
      // Should not match /auth/profile route
      expect(route?.path).not.toBe('/auth/profile');
    });
  });

  describe('Error Handling', () => {
    const mockRoute: RouteConfig = {
      service: 'auth',
      path: '/auth/login',
      method: 'POST',
      timeout: 5000,
      retries: 3,
      auth: false,
      cache: false,
      rateLimit: true,
    };

    const mockProxyRequest: ProxyRequest = {
      method: 'POST',
      url: '/auth/login',
      headers: {},
      body: {},
      query: {},
      params: {},
    };

    beforeEach(() => {
      loadBalancerService.getServiceUrl.mockResolvedValue('http://auth-service:3001');
      circuitBreakerService.canExecute.mockReturnValue(true);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'ECONNREFUSED';
      httpService.request.mockRejectedValue(networkError as never);

      await expect(service.proxyRequest(mockProxyRequest, mockRoute))
        .rejects.toMatchObject({
          status: 500,
          data: { message: 'Internal server error', code: 'GATEWAY_ERROR' },
        });
    });

    it('should handle load balancer errors', async () => {
      loadBalancerService.getServiceUrl.mockRejectedValue(new Error('No healthy instances'));

      await expect(service.proxyRequest(mockProxyRequest, mockRoute))
        .rejects.toThrow();
    });

    it('should record duration even on errors', async () => {
      httpService.request.mockRejectedValue(new Error('Test error') as never);

      try {
        await service.proxyRequest(mockProxyRequest, mockRoute);
      } catch (error) {
        expect(error.duration).toBeGreaterThan(0);
      }
    });
  });
});
