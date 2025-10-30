import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { LoadBalancerService, ServiceInstance, LoadBalancingStrategy } from '../../infrastructure/services/load-balancer.service';
import { of, throwError } from 'rxjs';

describe('LoadBalancerService', () => {
  let service: LoadBalancerService;
  let configService: jest.Mocked<ConfigService>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockHttpService = {
      axiosRef: {
        get: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadBalancerService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<LoadBalancerService>(LoadBalancerService);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);

    // Setup default configuration
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        'gateway.loadBalancing.strategy': 'round-robin',
        'gateway.loadBalancing.healthCheck.enabled': true,
        'gateway.loadBalancing.healthCheck.timeout': 5000,
        'gateway.microservices': {
          auth: {
            url: 'http://auth-service:3001',
            weight: 1,
          },
          resources: {
            url: 'http://resources-service:3003',
            weight: 2,
          },
        },
      };
      return config[key] || defaultValue;
    });
  });

  describe('Service URL Selection', () => {
    it('should return service URL for existing service', async () => {
      const url = await service.getServiceUrl('auth');
      expect(url).toBe('http://auth-service:3001');
    });

    it('should throw error for non-existent service', async () => {
      await expect(service.getServiceUrl('non-existent'))
        .rejects.toThrow('No instances available for service: non-existent');
    });

    it('should increment active connections when selecting instance', async () => {
      const instances = service.getServiceInstances('auth');
      const initialConnections = instances[0]?.activeConnections || 0;

      await service.getServiceUrl('auth');

      const updatedInstances = service.getServiceInstances('auth');
      expect(updatedInstances[0]?.activeConnections).toBe(initialConnections + 1);
    });
  });

  describe('Round Robin Strategy', () => {
    beforeEach(() => {
      // Add multiple instances for testing
      service.addServiceInstance('test-service', 'http://test-1:3000', 1);
      service.addServiceInstance('test-service', 'http://test-2:3000', 1);
      service.addServiceInstance('test-service', 'http://test-3:3000', 1);
    });

    it('should rotate through instances in round-robin fashion', async () => {
      const urls = [];
      for (let i = 0; i < 6; i++) {
        urls.push(await service.getServiceUrl('test-service'));
      }

      // Should cycle through all instances twice
      expect(urls[0]).toBe('http://test-1:3000');
      expect(urls[1]).toBe('http://test-2:3000');
      expect(urls[2]).toBe('http://test-3:3000');
      expect(urls[3]).toBe('http://test-1:3000'); // Second cycle
      expect(urls[4]).toBe('http://test-2:3000');
      expect(urls[5]).toBe('http://test-3:3000');
    });
  });

  describe('Health Checks', () => {
    beforeEach(() => {
      service.addServiceInstance('health-test', 'http://healthy:3000', 1);
      service.addServiceInstance('health-test', 'http://unhealthy:3000', 1);
    });

    it('should mark instance as healthy on successful health check', async () => {
      httpService.request.mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      } as never);

      // Trigger health check manually (normally done by cron)
      await service['checkInstanceHealth'](
        'health-test',
        service.getServiceInstances('health-test')[0],
        5000
      );

      const instances = service.getServiceInstances('health-test');
      expect(instances[0].healthy).toBe(true);
      expect(instances[0].responseTime).toBeGreaterThan(0);
    });

    it('should mark instance as unhealthy on failed health check', async () => {
      httpService.request.mockRejectedValue(new Error('Connection refused') as never);

      await service['checkInstanceHealth'](
        'health-test',
        service.getServiceInstances('health-test')[0],
        5000
      );

      const instances = service.getServiceInstances('health-test');
      expect(instances[0].healthy).toBe(false);
    });

    it('should use unhealthy instances when no healthy ones available', async () => {
      // Mark all instances as unhealthy
      const instances = service.getServiceInstances('health-test');
      instances.forEach(instance => {
        instance.healthy = false;
      });

      const url = await service.getServiceUrl('health-test');
      expect(url).toBeDefined();
      expect(['http://healthy:3000', 'http://unhealthy:3000']).toContain(url);
    });
  });

  describe('Instance Management', () => {
    it('should add new service instance', () => {
      const initialCount = service.getTotalInstancesCount('new-service');
      
      service.addServiceInstance('new-service', 'http://new-instance:3000', 2);
      
      const newCount = service.getTotalInstancesCount('new-service');
      expect(newCount).toBe(initialCount + 1);

      const instances = service.getServiceInstances('new-service');
      const newInstance = instances.find(i => i.url === 'http://new-instance:3000');
      expect(newInstance).toBeDefined();
      expect(newInstance?.weight).toBe(2);
    });

    it('should remove service instance', () => {
      service.addServiceInstance('remove-test', 'http://to-remove:3000', 1);
      const instances = service.getServiceInstances('remove-test');
      const instanceId = instances[0].id;

      const removed = service.removeServiceInstance('remove-test', instanceId);
      
      expect(removed).toBe(true);
      expect(service.getTotalInstancesCount('remove-test')).toBe(0);
    });

    it('should return false when removing non-existent instance', () => {
      const removed = service.removeServiceInstance('non-existent', 'fake-id');
      expect(removed).toBe(false);
    });

    it('should update instance weight', () => {
      service.addServiceInstance('weight-test', 'http://weight-test:3000', 1);
      const instances = service.getServiceInstances('weight-test');
      const instanceId = instances[0].id;

      const updated = service.updateInstanceWeight('weight-test', instanceId, 5);
      
      expect(updated).toBe(true);
      const updatedInstances = service.getServiceInstances('weight-test');
      expect(updatedInstances[0].weight).toBe(5);
    });
  });

  describe('Connection Management', () => {
    beforeEach(() => {
      service.addServiceInstance('connection-test', 'http://connection-test:3000', 1);
    });

    it('should release connection properly', async () => {
      const url = await service.getServiceUrl('connection-test');
      const instances = service.getServiceInstances('connection-test');
      const initialConnections = instances[0].activeConnections;

      service.releaseConnection('connection-test', url);

      const updatedInstances = service.getServiceInstances('connection-test');
      expect(updatedInstances[0].activeConnections).toBe(initialConnections - 1);
    });

    it('should not go below zero connections', () => {
      const instances = service.getServiceInstances('connection-test');
      instances[0].activeConnections = 0;

      service.releaseConnection('connection-test', 'http://connection-test:3000');

      const updatedInstances = service.getServiceInstances('connection-test');
      expect(updatedInstances[0].activeConnections).toBe(0);
    });
  });

  describe('Health Metrics', () => {
    beforeEach(() => {
      service.addServiceInstance('metrics-test', 'http://healthy-1:3000', 1);
      service.addServiceInstance('metrics-test', 'http://healthy-2:3000', 1);
      service.addServiceInstance('metrics-test', 'http://unhealthy-1:3000', 1);
      
      // Set health status
      const instances = service.getServiceInstances('metrics-test');
      instances[0].healthy = true;
      instances[1].healthy = true;
      instances[2].healthy = false;
    });

    it('should return correct healthy instance count', () => {
      const healthyCount = service.getHealthyInstancesCount('metrics-test');
      expect(healthyCount).toBe(2);
    });

    it('should return correct total instance count', () => {
      const totalCount = service.getTotalInstancesCount('metrics-test');
      expect(totalCount).toBe(3);
    });

    it('should return all service instances', () => {
      const allInstances = service.getAllServiceInstances();
      expect(allInstances).toBeInstanceOf(Map);
      expect(allInstances.has('metrics-test')).toBe(true);
    });
  });

  describe('Load Balancing Strategies', () => {
    beforeEach(() => {
      // Create instances with different connection counts for testing
      service.addServiceInstance('strategy-test', 'http://low-conn:3000', 1);
      service.addServiceInstance('strategy-test', 'http://high-conn:3000', 3);
      
      const instances = service.getServiceInstances('strategy-test');
      instances[0].activeConnections = 1;
      instances[1].activeConnections = 5;
    });

    it('should select instance with least connections', async () => {
      // Mock the strategy to be least-connections
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'gateway.loadBalancing.strategy') return 'least-connections';
        return defaultValue;
      });

      // Create new service instance to test strategy
      const newService = new LoadBalancerService(configService, httpService);
      newService.addServiceInstance('least-conn-test', 'http://low:3000', 1);
      newService.addServiceInstance('least-conn-test', 'http://high:3000', 1);
      
      const instances = newService.getServiceInstances('least-conn-test');
      instances[0].activeConnections = 1;
      instances[1].activeConnections = 5;

      const url = await newService.getServiceUrl('least-conn-test');
      expect(url).toBe('http://low:3000');
    });

    it('should handle weighted selection', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'gateway.loadBalancing.strategy') return 'weighted';
        return defaultValue;
      });

      const newService = new LoadBalancerService(configService, httpService);
      newService.addServiceInstance('weighted-test', 'http://light:3000', 1);
      newService.addServiceInstance('weighted-test', 'http://heavy:3000', 10);

      // Test multiple selections to see weight distribution
      const selections = [];
      for (let i = 0; i < 100; i++) {
        selections.push(await newService.getServiceUrl('weighted-test'));
      }

      const heavyCount = selections.filter(url => url === 'http://heavy:3000').length;
      const lightCount = selections.filter(url => url === 'http://light:3000').length;

      // Heavy instance should be selected more often due to higher weight
      expect(heavyCount).toBeGreaterThan(lightCount);
    });
  });

  describe('Error Handling', () => {
    it('should handle health check timeouts', async () => {
      httpService.request.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        ) as never
      );

      service.addServiceInstance('timeout-test', 'http://timeout:3000', 1);
      
      await service['checkInstanceHealth'](
        'timeout-test',
        service.getServiceInstances('timeout-test')[0],
        50 // Very short timeout
      );

      const instances = service.getServiceInstances('timeout-test');
      expect(instances[0].healthy).toBe(false);
    });

    it('should handle malformed health check responses', async () => {
      httpService.get.mockResolvedValue({
        status: 500,
        data: 'Internal Server Error',
      } as never);

      service.addServiceInstance('malformed-test', 'http://malformed:3000', 1);
      
      await service['checkInstanceHealth'](
        'malformed-test',
        service.getServiceInstances('malformed-test')[0],
        5000
      );

      const instances = service.getServiceInstances('malformed-test');
      expect(instances[0].healthy).toBe(false);
    });
  });
});
