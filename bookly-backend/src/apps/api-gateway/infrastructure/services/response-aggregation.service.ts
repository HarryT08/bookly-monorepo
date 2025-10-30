import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { AuthContext } from './auth.service';

export interface AggregationRequest {
  endpoint: string;
  services: ServiceRequest[];
  mergeStrategy: 'merge' | 'array' | 'nested' | 'custom';
  timeout?: number;
  failureStrategy: 'fail-fast' | 'partial' | 'ignore-errors';
  cacheKey?: string;
  cacheTtl?: number;
}

export interface ServiceRequest {
  service: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  responseKey?: string;
  required?: boolean;
  transform?: (data: any) => any;
}

export interface AggregationResponse {
  success: boolean;
  data: any;
  errors: Record<string, any>;
  metadata: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalDuration: number;
    cached: boolean;
  };
}

@Injectable()
export class ResponseAggregationService {
  private readonly logger = new Logger(ResponseAggregationService.name);
  private readonly aggregationConfigs: Map<string, AggregationRequest> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.initializeAggregationConfigs();
  }

  private initializeAggregationConfigs(): void {
    // Dashboard endpoint - aggregates data from multiple services
    this.addAggregationConfig('/dashboard', {
      endpoint: '/dashboard',
      services: [
        {
          service: 'auth',
          path: '/auth/profile',
          method: 'GET',
          responseKey: 'user',
          required: true,
        },
        {
          service: 'resources',
          path: '/resources',
          method: 'GET',
          query: { limit: '5', sort: 'recent' },
          responseKey: 'recentResources',
          required: false,
        },
        {
          service: 'availability',
          path: '/reservations',
          method: 'GET',
          query: { status: 'active', limit: '10' },
          responseKey: 'activeReservations',
          required: false,
        },
        {
          service: 'reports',
          path: '/reports/analytics',
          method: 'GET',
          query: { period: 'week' },
          responseKey: 'analytics',
          required: false,
        },
      ],
      mergeStrategy: 'nested',
      timeout: 10000,
      failureStrategy: 'partial',
      cacheKey: 'dashboard',
      cacheTtl: 300, // 5 minutes
    });

    // User overview endpoint
    this.addAggregationConfig('/users/:id/overview', {
      endpoint: '/users/:id/overview',
      services: [
        {
          service: 'auth',
          path: '/auth/users/:id',
          method: 'GET',
          responseKey: 'profile',
          required: true,
        },
        {
          service: 'availability',
          path: '/reservations',
          method: 'GET',
          query: { userId: ':id', limit: '20' },
          responseKey: 'reservations',
          required: false,
        },
        {
          service: 'reports',
          path: '/reports/usage',
          method: 'GET',
          query: { userId: ':id', period: 'month' },
          responseKey: 'usage',
          required: false,
        },
      ],
      mergeStrategy: 'nested',
      timeout: 8000,
      failureStrategy: 'partial',
    });

    // Resource details with availability
    this.addAggregationConfig('/resources/:id/details', {
      endpoint: '/resources/:id/details',
      services: [
        {
          service: 'resources',
          path: '/resources/:id',
          method: 'GET',
          responseKey: 'resource',
          required: true,
        },
        {
          service: 'availability',
          path: '/availability',
          method: 'GET',
          query: { resourceId: ':id', days: '7' },
          responseKey: 'availability',
          required: false,
        },
        {
          service: 'availability',
          path: '/reservations',
          method: 'GET',
          query: { resourceId: ':id', status: 'active' },
          responseKey: 'activeReservations',
          required: false,
        },
      ],
      mergeStrategy: 'nested',
      timeout: 6000,
      failureStrategy: 'partial',
    });

    // Admin analytics endpoint
    this.addAggregationConfig('/admin/analytics', {
      endpoint: '/admin/analytics',
      services: [
        {
          service: 'resources',
          path: '/resources/stats',
          method: 'GET',
          responseKey: 'resourceStats',
          required: false,
        },
        {
          service: 'availability',
          path: '/reservations/stats',
          method: 'GET',
          responseKey: 'reservationStats',
          required: false,
        },
        {
          service: 'auth',
          path: '/auth/users/stats',
          method: 'GET',
          responseKey: 'userStats',
          required: false,
        },
        {
          service: 'reports',
          path: '/reports/dashboard',
          method: 'GET',
          responseKey: 'reports',
          required: false,
        },
      ],
      mergeStrategy: 'nested',
      timeout: 15000,
      failureStrategy: 'partial',
      cacheKey: 'admin-analytics',
      cacheTtl: 600, // 10 minutes
    });

    this.logger.log(`Initialized ${this.aggregationConfigs.size} aggregation configurations`);
  }

  public addAggregationConfig(endpoint: string, config: AggregationRequest): void {
    this.aggregationConfigs.set(endpoint, config);
  }

  public getAggregationConfig(endpoint: string): AggregationRequest | null {
    // Exact match first
    if (this.aggregationConfigs.has(endpoint)) {
      return this.aggregationConfigs.get(endpoint);
    }

    // Pattern matching for parameterized endpoints
    for (const [pattern, config] of this.aggregationConfigs.entries()) {
      if (this.matchEndpoint(pattern, endpoint)) {
        return config;
      }
    }

    return null;
  }

  private matchEndpoint(pattern: string, endpoint: string): boolean {
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(endpoint);
  }

  public async aggregateResponse(
    endpoint: string,
    authContext: AuthContext,
    params: Record<string, string> = {},
    query: Record<string, string> = {},
  ): Promise<AggregationResponse> {
    const config = this.getAggregationConfig(endpoint);
    
    if (!config) {
      throw new Error(`No aggregation configuration found for endpoint: ${endpoint}`);
    }

    const startTime = Date.now();
    const errors: Record<string, any> = {};
    let successfulRequests = 0;
    let failedRequests = 0;

    try {
      // Prepare service requests
      const serviceRequests = config.services.map(serviceConfig => {
        const serviceRequest = this.prepareServiceRequest(serviceConfig, authContext, params, query);
        return this.executeServiceRequest(serviceRequest, serviceConfig)
          .pipe(
            timeout(config.timeout || 10000),
            map(response => ({
              key: serviceConfig.responseKey || serviceConfig.service,
              data: serviceConfig.transform ? serviceConfig.transform(response['data']) : response['data'],
              success: true,
              required: serviceConfig.required,
            })),
            catchError(error => {
              const errorInfo = {
                key: serviceConfig.responseKey || serviceConfig.service,
                error: error.message || 'Unknown error',
                success: false,
                required: serviceConfig.required,
              };

              if (config.failureStrategy === 'fail-fast' && serviceConfig.required) {
                throw error;
              }

              return of(errorInfo);
            })
          );
      });

      // Execute all requests
      const results = await firstValueFrom(forkJoin(serviceRequests));

      // Process results
      const data: any = {};
      
      for (const result of results) {
        if (result.success) {
          successfulRequests++;
          data[result.key] = result.data;
        } else {
          failedRequests++;
          errors[result.key] = result.error;
          
          if (result.required && config.failureStrategy === 'fail-fast') {
            throw new Error(`Required service ${result.key} failed: ${result.error}`);
          }
        }
      }

      // Apply merge strategy
      const mergedData = this.applyMergeStrategy(data, config.mergeStrategy);
      
      const totalDuration = Date.now() - startTime;

      this.logger.debug(`Aggregated response for ${endpoint} in ${totalDuration}ms. Success: ${successfulRequests}, Failed: ${failedRequests}`);

      return {
        success: failedRequests === 0 || config.failureStrategy !== 'fail-fast',
        data: mergedData,
        errors,
        metadata: {
          totalRequests: config.services.length,
          successfulRequests,
          failedRequests,
          totalDuration,
          cached: false,
        },
      };

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      
      this.logger.error(`Aggregation failed for ${endpoint}: ${error.message}`);

      return {
        success: false,
        data: null,
        errors: { aggregation: error.message },
        metadata: {
          totalRequests: config.services.length,
          successfulRequests,
          failedRequests: config.services.length - successfulRequests,
          totalDuration,
          cached: false,
        },
      };
    }
  }

  private prepareServiceRequest(
    serviceConfig: ServiceRequest,
    authContext: AuthContext,
    params: Record<string, string>,
    query: Record<string, string>,
  ): any {
    // Replace path parameters
    let path = serviceConfig.path;
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });

    // Merge query parameters
    const mergedQuery = { ...serviceConfig.query, ...query };
    
    // Replace query parameter values with actual params
    Object.entries(mergedQuery).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith(':')) {
        const paramKey = value.substring(1);
        if (params[paramKey]) {
          mergedQuery[key] = params[paramKey];
        }
      }
    });

    // Prepare headers
    const headers = {
      'Authorization': `Bearer ${authContext.token}`,
      'Content-Type': 'application/json',
      ...serviceConfig.headers,
    };

    return {
      service: serviceConfig.service,
      method: serviceConfig.method,
      path,
      headers,
      body: serviceConfig.body,
      query: mergedQuery,
    };
  }

  private executeServiceRequest(request: any, config: ServiceRequest): any {
    const serviceUrl = this.configService.get(`gateway.microservices.${request.service}.url`);
    const fullUrl = `${serviceUrl}${request.path}`;

    const axiosConfig: any = {
      method: request.method.toLowerCase(),
      url: fullUrl,
      headers: request.headers,
      params: request.query,
    };

    if (request.body) {
      axiosConfig.data = request.body;
    }

    return this.httpService.request(axiosConfig);
  }

  private applyMergeStrategy(data: any, strategy: string): any {
    switch (strategy) {
      case 'merge':
        return Object.assign({}, ...Object.values(data));
      
      case 'array':
        return Object.values(data);
      
      case 'nested':
        return data;
      
      case 'custom':
        // Implement custom merge logic here
        return data;
      
      default:
        return data;
    }
  }

  public getAllAggregationConfigs(): Map<string, AggregationRequest> {
    return new Map(this.aggregationConfigs);
  }

  public removeAggregationConfig(endpoint: string): boolean {
    return this.aggregationConfigs.delete(endpoint);
  }

  public updateAggregationConfig(endpoint: string, config: Partial<AggregationRequest>): boolean {
    const existingConfig = this.aggregationConfigs.get(endpoint);
    
    if (!existingConfig) {
      return false;
    }

    const updatedConfig = { ...existingConfig, ...config };
    this.aggregationConfigs.set(endpoint, updatedConfig);
    
    return true;
  }
}
