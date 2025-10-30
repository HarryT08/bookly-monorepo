import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from '../../infrastructure/services/circuit-breaker.service';
import { CircuitBreakerState } from '../../utils/circuit-breaker-state.enum';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Setup configuration mock before creating the service
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        const config = {
          'gateway.microservices': {
            'auth-service': {
              url: 'http://auth-service:3001',
              circuitBreaker: {
                enabled: true,
                threshold: 5,
                timeout: 60000,
                resetTimeout: 30000,
              },
            },
            'resources-service': {
              url: 'http://resources-service:3002',
              circuitBreaker: {
                enabled: true,
                threshold: 3,
                timeout: 30000,
                resetTimeout: 15000,
              },
            },
          },
        };
        return config[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitBreakerService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
    configService = module.get(ConfigService);
  });

  describe('Circuit Breaker States', () => {
    it('should start in CLOSED state', () => {
      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.state).toBe(CircuitBreakerState.CLOSED);
      expect(stats?.failureCount).toBe(0);
      expect(stats?.successCount).toBe(0);
    });

    it('should allow execution in CLOSED state', () => {
      const canExecute = service.canExecute('auth-service');
      expect(canExecute).toBe(true);
    });

    it('should transition to OPEN after threshold failures', () => {
      // Record failures up to threshold
      for (let i = 0; i < 5; i++) {
        service.recordFailure('auth-service', { code: 'ECONNREFUSED' });
      }

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.state).toBe(CircuitBreakerState.OPEN);
      expect(stats?.failureCount).toBe(5);
    });

    it('should not allow execution in OPEN state', () => {
      // Force circuit breaker to OPEN state
      for (let i = 0; i < 5; i++) {
        service.recordFailure('auth-service', { code: 'ECONNREFUSED' });
      }

      const canExecute = service.canExecute('auth-service');
      expect(canExecute).toBe(false);
    });

    it('should transition to HALF_OPEN after timeout', () => {
      // Force to OPEN state
      for (let i = 0; i < 5; i++) {
        service.recordFailure('auth-service', { code: 'ECONNREFUSED' });
      }

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.state).toBe(CircuitBreakerState.OPEN);

      // Manually set next attempt time to past
      if (stats) {
        stats.nextAttemptTime = new Date(Date.now() - 1000);
      }

      const canExecute = service.canExecute('auth-service');
      expect(canExecute).toBe(true);

      const updatedStats = service.getCircuitBreakerStats('auth-service');
      expect(updatedStats?.state).toBe(CircuitBreakerState.HALF_OPEN);
    });

    it('should transition from HALF_OPEN to CLOSED on success', () => {
      // Force to HALF_OPEN state
      service.forceOpen('auth-service');
      const stats = service.getCircuitBreakerStats('auth-service');
      if (stats) {
        stats.state = CircuitBreakerState.HALF_OPEN;
        stats.nextAttemptTime = null;
      }

      service.recordSuccess('auth-service');

      const updatedStats = service.getCircuitBreakerStats('auth-service');
      expect(updatedStats?.state).toBe(CircuitBreakerState.CLOSED);
      expect(updatedStats?.failureCount).toBe(0);
    });

    it('should transition from HALF_OPEN to OPEN on failure', () => {
      // Force to HALF_OPEN state
      service.forceOpen('auth-service');
      const stats = service.getCircuitBreakerStats('auth-service');
      if (stats) {
        stats.state = CircuitBreakerState.HALF_OPEN;
        stats.nextAttemptTime = null;
      }

      service.recordFailure('auth-service', { code: 'ECONNREFUSED' });

      const updatedStats = service.getCircuitBreakerStats('auth-service');
      expect(updatedStats?.state).toBe(CircuitBreakerState.OPEN);
    });
  });

  describe('Failure Recording', () => {
    it('should record expected exception types', () => {
      const initialStats = service.getCircuitBreakerStats('auth-service');
      const initialFailures = initialStats?.failureCount || 0;

      service.recordFailure('auth-service', { code: 'ECONNREFUSED' });

      const updatedStats = service.getCircuitBreakerStats('auth-service');
      expect(updatedStats?.failureCount).toBe(initialFailures + 1);
    });

    it('should ignore unexpected exception types', () => {
      const initialStats = service.getCircuitBreakerStats('auth-service');
      const initialFailures = initialStats?.failureCount || 0;

      service.recordFailure('auth-service', { code: 'UNEXPECTED_ERROR' });

      const updatedStats = service.getCircuitBreakerStats('auth-service');
      expect(updatedStats?.failureCount).toBe(initialFailures);
    });

    it('should record failures with error messages', () => {
      service.recordFailure('auth-service', { message: 'Connection timeout' });

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.failureCount).toBe(1);
    });

    it('should update failure rate', () => {
      service.recordSuccess('auth-service');
      service.recordSuccess('auth-service');
      service.recordFailure('auth-service', { code: 'ECONNREFUSED' });

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.failureRate).toBeCloseTo(33.33, 1); // 1 failure out of 3 total
    });
  });

  describe('Success Recording', () => {
    it('should record successful requests', () => {
      service.recordSuccess('auth-service');

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.successCount).toBe(1);
      expect(stats?.totalRequests).toBe(1);
    });

    it('should update last success time', () => {
      const beforeTime = new Date();
      service.recordSuccess('auth-service');
      const afterTime = new Date();

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.lastSuccessTime).toBeDefined();
      expect(stats?.lastSuccessTime!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(stats?.lastSuccessTime!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('Manual Control', () => {
    it('should reset circuit breaker', () => {
      // Create some failures
      for (let i = 0; i < 3; i++) {
        service.recordFailure('auth-service', { code: 'ECONNREFUSED' });
      }

      const success = service.resetCircuitBreaker('auth-service');
      expect(success).toBe(true);

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.state).toBe(CircuitBreakerState.CLOSED);
      expect(stats?.failureCount).toBe(0);
      expect(stats?.successCount).toBe(0);
      expect(stats?.totalRequests).toBe(0);
    });

    it('should force circuit breaker open', () => {
      const success = service.forceOpen('auth-service');
      expect(success).toBe(true);

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.state).toBe(CircuitBreakerState.OPEN);
    });

    it('should force circuit breaker closed', () => {
      // First force it open
      service.forceOpen('auth-service');

      const success = service.forceClosed('auth-service');
      expect(success).toBe(true);

      const stats = service.getCircuitBreakerStats('auth-service');
      expect(stats?.state).toBe(CircuitBreakerState.CLOSED);
    });

    it('should return false for non-existent service operations', () => {
      expect(service.resetCircuitBreaker('non-existent')).toBe(false);
      expect(service.forceOpen('non-existent')).toBe(false);
      expect(service.forceClosed('non-existent')).toBe(false);
    });
  });

  describe('Service Health', () => {
    it('should report healthy service in CLOSED state', () => {
      const isHealthy = service.isServiceHealthy('auth-service');
      expect(isHealthy).toBe(true);
    });

    it('should report unhealthy service in OPEN state', () => {
      service.forceOpen('auth-service');

      const isHealthy = service.isServiceHealthy('auth-service');
      expect(isHealthy).toBe(false);
    });

    it('should report healthy service in HALF_OPEN state', () => {
      service.forceOpen('auth-service');
      const stats = service.getCircuitBreakerStats('auth-service');
      if (stats) {
        stats.state = CircuitBreakerState.HALF_OPEN;
      }

      const isHealthy = service.isServiceHealthy('auth-service');
      expect(isHealthy).toBe(true);
    });

    it('should calculate service availability', () => {
      // Record mixed results
      service.recordSuccess('auth-service');
      service.recordSuccess('auth-service');
      service.recordSuccess('auth-service');
      service.recordFailure('auth-service', { code: 'ECONNREFUSED' });

      const availability = service.getServiceAvailability('auth-service');
      expect(availability).toBe(75); // 3 successes out of 4 total = 75%
    });

    it('should return 100% availability for service with no requests', () => {
      const availability = service.getServiceAvailability('auth-service');
      expect(availability).toBe(100);
    });
  });

  describe('Configuration', () => {
    it('should allow execution for disabled circuit breaker', () => {
      const canExecute = service.canExecute('disabled-service');
      expect(canExecute).toBe(true);
    });

    it('should not record failures for disabled circuit breaker', () => {
      service.recordFailure('disabled-service', { code: 'ECONNREFUSED' });

      const stats = service.getCircuitBreakerStats('disabled-service');
      expect(stats?.failureCount).toBe(0);
    });

    it('should return null stats for non-existent service', () => {
      const stats = service.getCircuitBreakerStats('non-existent');
      expect(stats).toBeNull();
    });
  });

  describe('All Circuit Breakers', () => {
    it('should return all circuit breaker stats', () => {
      service.recordSuccess('auth-service');
      service.recordFailure('auth-service', { code: 'ECONNREFUSED' });

      const allStats = service.getAllCircuitBreakerStats();
      expect(allStats).toBeInstanceOf(Map);
      expect(allStats.has('auth-service')).toBe(true);
      expect(allStats.has('disabled-service')).toBe(true);
    });

    it('should maintain separate stats for different services', () => {
      service.recordSuccess('auth-service');
      service.recordFailure('auth-service', { code: 'ECONNREFUSED' });

      const testStats = service.getCircuitBreakerStats('auth-service');
      const disabledStats = service.getCircuitBreakerStats('disabled-service');

      expect(testStats?.successCount).toBe(1);
      expect(testStats?.failureCount).toBe(0);
      expect(disabledStats?.successCount).toBe(0);
      expect(disabledStats?.failureCount).toBe(0); // Disabled, so no recording
    });
  });

  describe('Time-based Behavior', () => {
    it('should respect timeout period in OPEN state', () => {
      // Force to OPEN state
      service.forceOpen('auth-service');

      // Should not allow execution immediately
      expect(service.canExecute('auth-service')).toBe(false);

      // Manually set next attempt time to future
      const stats = service.getCircuitBreakerStats('auth-service');
      if (stats) {
        stats.nextAttemptTime = new Date(Date.now() + 10000); // 10 seconds in future
      }

      expect(service.canExecute('auth-service')).toBe(false);
    });

    it('should allow execution after timeout period', () => {
      service.forceOpen('auth-service');

      // Set next attempt time to past
      const stats = service.getCircuitBreakerStats('auth-service');
      if (stats) {
        stats.nextAttemptTime = new Date(Date.now() - 1000);
      }

      expect(service.canExecute('auth-service')).toBe(true);
    });
  });
});
