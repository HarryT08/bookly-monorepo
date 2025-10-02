import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RateLimitService, RateLimitConfig } from '../../infrastructure/services/rate-limit.service';
// Mock RedisService for testing
class MockRedisService {
  getClient() {
    return {
      pipeline: jest.fn(),
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      zremrangebyrank: jest.fn(),
      zrange: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      ttl: jest.fn(),
    };
  }
}

describe('RateLimitService', () => {
  let service: RateLimitService;
  let configService: jest.Mocked<ConfigService>;
  let redisService: jest.Mocked<MockRedisService>;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      pipeline: jest.fn(),
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      zremrangebyrank: jest.fn(),
      zrange: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      ttl: jest.fn(),
    };

    const mockPipeline = {
      zremrangebyscore: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockRedisClient.pipeline.mockReturnValue(mockPipeline);

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MockRedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
    configService = module.get(ConfigService);
    redisService = module.get(MockRedisService);

    // Setup default configuration
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        'gateway.rateLimit.global.ttl': 60,
        'gateway.rateLimit.global.limit': 1000,
        'gateway.rateLimit.perUser.ttl': 60,
        'gateway.rateLimit.perUser.limit': 100,
        'gateway.rateLimit.perEndpoint': {
          '/auth/login': {
            ttl: 900,
            limit: 5,
          },
          '/auth/register': {
            ttl: 3600,
            limit: 3,
          },
        },
      };
      return config[key] || defaultValue;
    });
  });

  describe('Global Rate Limiting', () => {
    it('should allow request within global limit', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zremrangebyscore
        [null, 5], // zcard (current count)
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      const result = await service.checkGlobalRateLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.totalHits).toBe(6); // 5 + 1
      expect(result.totalHitsRemaining).toBe(994); // 1000 - 6
    });

    it('should deny request when global limit exceeded', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zremrangebyscore
        [null, 1000], // zcard (at limit)
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      mockRedisClient.zremrangebyrank.mockResolvedValue(1);
      mockRedisClient.zrange.mockResolvedValue(['1234567890', '1234567890']);

      const result = await service.checkGlobalRateLimit('192.168.1.1');

      expect(result.allowed).toBe(false);
      expect(result.totalHits).toBe(1000);
      expect(result.totalHitsRemaining).toBe(0);
      expect(result.msBeforeNext).toBeGreaterThan(0);
    });

    it('should handle Redis pipeline errors gracefully', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [new Error('Redis error'), null],
      ]);

      const result = await service.checkGlobalRateLimit('192.168.1.1');

      // Should fail open (allow request) when Redis is unavailable
      expect(result.allowed).toBe(true);
    });
  });

  describe('User Rate Limiting', () => {
    it('should allow request within user limit', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zremrangebyscore
        [null, 10], // zcard
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      const result = await service.checkUserRateLimit('user123');

      expect(result.allowed).toBe(true);
      expect(result.totalHits).toBe(11);
      expect(result.totalHitsRemaining).toBe(89); // 100 - 11
    });

    it('should deny request when user limit exceeded', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zremrangebyscore
        [null, 100], // zcard (at limit)
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      mockRedisClient.zremrangebyrank.mockResolvedValue(1);

      const result = await service.checkUserRateLimit('user123');

      expect(result.allowed).toBe(false);
      expect(result.totalHits).toBe(100);
    });
  });

  describe('Endpoint Rate Limiting', () => {
    it('should allow request for endpoint within limit', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zremrangebyscore
        [null, 2], // zcard
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      const result = await service.checkEndpointRateLimit('/auth/login', 'user123');

      expect(result.allowed).toBe(true);
      expect(result.totalHits).toBe(3);
      expect(result.totalHitsRemaining).toBe(2); // 5 - 3
    });

    it('should deny request when endpoint limit exceeded', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zremrangebyscore
        [null, 5], // zcard (at limit)
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      mockRedisClient.zremrangebyrank.mockResolvedValue(1);

      const result = await service.checkEndpointRateLimit('/auth/login', 'user123');

      expect(result.allowed).toBe(false);
      expect(result.totalHits).toBe(5);
    });

    it('should allow request for endpoint without specific limit', async () => {
      const result = await service.checkEndpointRateLimit('/unknown/endpoint', 'user123');

      expect(result.allowed).toBe(true);
      expect(result.totalHitsRemaining).toBe(Infinity);
    });
  });

  describe('Custom Rate Limiting', () => {
    it('should apply custom rate limit configuration', async () => {
      const customConfig: RateLimitConfig = {
        ttl: 300,
        limit: 50,
      };

      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zremrangebyscore
        [null, 10], // zcard
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      const result = await service.checkCustomRateLimit('custom:key', customConfig);

      expect(result.allowed).toBe(true);
      expect(result.totalHits).toBe(11);
      expect(result.totalHitsRemaining).toBe(39); // 50 - 11
    });
  });

  describe('Rate Limit Information', () => {
    it('should get rate limit info for key', async () => {
      mockRedisClient.zremrangebyscore.mockResolvedValue(0);
      mockRedisClient.zcard.mockResolvedValue(25);
      mockRedisClient.zrange.mockResolvedValue([]);

      const config: RateLimitConfig = { ttl: 60, limit: 100 };
      const info = await service.getRateLimitInfo('test:key', config);

      expect(info.key).toBe('test:key');
      expect(info.totalHits).toBe(25);
      expect(info.resetTime).toBeInstanceOf(Date);
      expect(info.msBeforeNext).toBe(0);
    });

    it('should calculate time before next request when at limit', async () => {
      mockRedisClient.zremrangebyscore.mockResolvedValue(0);
      mockRedisClient.zcard.mockResolvedValue(100);
      mockRedisClient.zrange.mockResolvedValue(['oldest-request', '1234567890']);

      const config: RateLimitConfig = { ttl: 60, limit: 100 };
      const info = await service.getRateLimitInfo('test:key', config);

      expect(info.totalHits).toBe(100);
      expect(info.msBeforeNext).toBeGreaterThan(0);
    });
  });

  describe('Rate Limit Management', () => {
    it('should reset rate limit for key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.resetRateLimit('test:key');

      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('test:key');
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.del.mockResolvedValue(0);

      const result = await service.resetRateLimit('non-existent:key');

      expect(result).toBe(false);
    });

    it('should get all rate limit keys', async () => {
      mockRedisClient.keys.mockResolvedValue([
        'rate_limit:global:192.168.1.1',
        'rate_limit:user:user123',
        'rate_limit:endpoint:/auth/login:user123',
      ]);

      const keys = await service.getAllRateLimitKeys();

      expect(keys).toHaveLength(3);
      expect(keys).toContain('rate_limit:global:192.168.1.1');
    });

    it('should get rate limit statistics', async () => {
      mockRedisClient.keys.mockResolvedValue(['rate_limit:test:key']);
      mockRedisClient.zcard.mockResolvedValue(10);
      mockRedisClient.ttl.mockResolvedValue(45);

      const stats = await service.getRateLimitStats();

      expect(stats['rate_limit:test:key']).toBeDefined();
      expect(stats['rate_limit:test:key'].currentRequests).toBe(10);
      expect(stats['rate_limit:test:key'].ttlSeconds).toBe(45);
    });
  });

  describe('Key Generation', () => {
    it('should generate IP key', () => {
      const key = service.generateIpKey('192.168.1.1');
      expect(key).toBe('ip:192.168.1.1');
    });

    it('should generate user key', () => {
      const key = service.generateUserKey('user123');
      expect(key).toBe('user:user123');
    });

    it('should generate endpoint key', () => {
      const key = service.generateEndpointKey('/auth/login', 'user123');
      expect(key).toBe('endpoint:/auth/login:user123');
    });
  });

  describe('Endpoint Configuration Management', () => {
    it('should add endpoint configuration', () => {
      const config: RateLimitConfig = { ttl: 120, limit: 10 };
      
      service.addEndpointConfig('/test/endpoint', config);
      
      const retrievedConfig = service.getEndpointConfig('/test/endpoint');
      expect(retrievedConfig).toEqual(config);
    });

    it('should remove endpoint configuration', () => {
      const config: RateLimitConfig = { ttl: 120, limit: 10 };
      service.addEndpointConfig('/test/endpoint', config);

      const removed = service.removeEndpointConfig('/test/endpoint');
      
      expect(removed).toBe(true);
      expect(service.getEndpointConfig('/test/endpoint')).toBeUndefined();
    });

    it('should return false when removing non-existent config', () => {
      const removed = service.removeEndpointConfig('/non-existent');
      expect(removed).toBe(false);
    });

    it('should get all endpoint configurations', () => {
      const config1: RateLimitConfig = { ttl: 60, limit: 5 };
      const config2: RateLimitConfig = { ttl: 120, limit: 10 };
      
      service.addEndpointConfig('/endpoint1', config1);
      service.addEndpointConfig('/endpoint2', config2);

      const allConfigs = service.getAllEndpointConfigs();
      
      expect(allConfigs.size).toBeGreaterThanOrEqual(2);
      expect(allConfigs.get('/endpoint1')).toEqual(config1);
      expect(allConfigs.get('/endpoint2')).toEqual(config2);
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis connection errors', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockRejectedValue(new Error('Redis connection failed'));

      const result = await service.checkGlobalRateLimit('192.168.1.1');

      // Should fail open (allow request)
      expect(result.allowed).toBe(true);
    });

    it('should handle Redis timeout errors', async () => {
      mockRedisClient.keys.mockRejectedValue(new Error('Redis timeout'));

      const keys = await service.getAllRateLimitKeys();

      expect(keys).toEqual([]);
    });

    it('should handle malformed Redis responses', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue(null); // Malformed response

      const result = await service.checkGlobalRateLimit('192.168.1.1');

      expect(result.allowed).toBe(true); // Fail open
    });
  });

  describe('Time Window Behavior', () => {
    it('should clean up old entries outside time window', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 5], // zremrangebyscore (removed 5 old entries)
        [null, 10], // zcard (current count after cleanup)
        [null, 1], // zadd
        [null, 1], // expire
      ]);

      await service.checkGlobalRateLimit('192.168.1.1');

      expect(mockPipeline.zremrangebyscore).toHaveBeenCalled();
    });

    it('should set appropriate expiration time', async () => {
      const mockPipeline = mockRedisClient.pipeline();
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, 1],
        [null, 1],
        [null, 1],
      ]);

      await service.checkGlobalRateLimit('192.168.1.1');

      expect(mockPipeline.expire).toHaveBeenCalledWith(
        'rate_limit:global:192.168.1.1',
        60 // TTL from config
      );
    });
  });
});
