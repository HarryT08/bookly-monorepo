import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerState } from '../../utils/circuit-breaker-state.enum';

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  timeout: number;
  monitoringPeriod: number;
  expectedExceptionTypes: string[];
}

export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  nextAttemptTime: Date | null;
  totalRequests: number;
  failureRate: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly circuitBreakers: Map<string, CircuitBreakerStats> = new Map();
  private readonly configs: Map<string, CircuitBreakerConfig> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    const microservices = this.configService.get('gateway.microservices', {});
    
    Object.entries(microservices).forEach(([serviceName, config]: [string, any]) => {
      const circuitBreakerConfig: CircuitBreakerConfig = {
        enabled: config.circuitBreaker?.enabled ?? true,
        failureThreshold: config.circuitBreaker?.threshold ?? 5,
        timeout: config.circuitBreaker?.timeout ?? 60000, // 1 minute
        monitoringPeriod: config.circuitBreaker?.monitoringPeriod ?? 300000, // 5 minutes
        expectedExceptionTypes: config.circuitBreaker?.expectedExceptionTypes ?? ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'],
      };

      this.configs.set(serviceName, circuitBreakerConfig);
      
      const stats: CircuitBreakerStats = {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: null,
        lastSuccessTime: null,
        nextAttemptTime: null,
        totalRequests: 0,
        failureRate: 0,
      };

      this.circuitBreakers.set(serviceName, stats);
    });

    this.logger.log(`Initialized circuit breakers for ${this.circuitBreakers.size} services`);
  }

  public canExecute(serviceName: string): boolean {
    const config = this.configs.get(serviceName);
    const stats = this.circuitBreakers.get(serviceName);

    if (!config || !stats || !config.enabled) {
      return true;
    }

    const now = new Date();

    switch (stats.state) {
      case CircuitBreakerState.CLOSED:
        return true;

      case CircuitBreakerState.OPEN:
        if (stats.nextAttemptTime && now >= stats.nextAttemptTime) {
          this.transitionToHalfOpen(serviceName);
          return true;
        }
        return false;

      case CircuitBreakerState.HALF_OPEN:
        return true;

      default:
        return true;
    }
  }

  public recordSuccess(serviceName: string): void {
    const config = this.configs.get(serviceName);
    const stats = this.circuitBreakers.get(serviceName);

    if (!config || !stats || !config.enabled) {
      return;
    }

    stats.successCount++;
    stats.totalRequests++;
    stats.lastSuccessTime = new Date();
    this.updateFailureRate(serviceName);

    if (stats.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionToClosed(serviceName);
    }

    this.logger.debug(`Recorded success for service ${serviceName}. Success count: ${stats.successCount}`);
  }

  public recordFailure(serviceName: string, error?: any): void {
    const config = this.configs.get(serviceName);
    const stats = this.circuitBreakers.get(serviceName);

    if (!config || !stats || !config.enabled) {
      return;
    }

    // Check if this is an expected exception type
    if (error && !this.isExpectedException(error, config.expectedExceptionTypes)) {
      this.logger.debug(`Ignoring unexpected exception for service ${serviceName}: ${error.code || error.message}`);
      return;
    }

    stats.failureCount++;
    stats.totalRequests++;
    stats.lastFailureTime = new Date();
    this.updateFailureRate(serviceName);

    this.logger.debug(`Recorded failure for service ${serviceName}. Failure count: ${stats.failureCount}`);

    if (stats.state === CircuitBreakerState.CLOSED && stats.failureCount >= config.failureThreshold) {
      this.transitionToOpen(serviceName);
    } else if (stats.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionToOpen(serviceName);
    }
  }

  private isExpectedException(error: any, expectedTypes: string[]): boolean {
    if (!error) return true;
    
    const errorCode = error.code || error.errno || '';
    const errorMessage = error.message || '';
    
    return expectedTypes.some(type => 
      errorCode.includes(type) || errorMessage.includes(type)
    );
  }

  private transitionToOpen(serviceName: string): void {
    const config = this.configs.get(serviceName);
    const stats = this.circuitBreakers.get(serviceName);

    if (!config || !stats) return;

    stats.state = CircuitBreakerState.OPEN;
    stats.nextAttemptTime = new Date(Date.now() + config.timeout);

    this.logger.warn(`Circuit breaker OPENED for service ${serviceName}. Next attempt at: ${stats.nextAttemptTime}`);
  }

  private transitionToHalfOpen(serviceName: string): void {
    const stats = this.circuitBreakers.get(serviceName);

    if (!stats) return;

    stats.state = CircuitBreakerState.HALF_OPEN;
    stats.nextAttemptTime = null;

    this.logger.log(`Circuit breaker transitioned to HALF_OPEN for service ${serviceName}`);
  }

  private transitionToClosed(serviceName: string): void {
    const stats = this.circuitBreakers.get(serviceName);

    if (!stats) return;

    stats.state = CircuitBreakerState.CLOSED;
    stats.failureCount = 0;
    stats.nextAttemptTime = null;

    this.logger.log(`Circuit breaker CLOSED for service ${serviceName}`);
  }

  private updateFailureRate(serviceName: string): void {
    const config = this.configs.get(serviceName);
    const stats = this.circuitBreakers.get(serviceName);

    if (!config || !stats) return;

    // Clean up old records outside monitoring period
    const monitoringCutoff = new Date(Date.now() - config.monitoringPeriod);
    
    if (stats.totalRequests > 0) {
      stats.failureRate = (stats.failureCount / stats.totalRequests) * 100;
    }

    // Reset counters if monitoring period has passed
    if (stats.lastFailureTime && stats.lastFailureTime < monitoringCutoff && 
        stats.lastSuccessTime && stats.lastSuccessTime < monitoringCutoff) {
      stats.failureCount = 0;
      stats.successCount = 0;
      stats.totalRequests = 0;
      stats.failureRate = 0;
    }
  }

  public getCircuitBreakerStats(serviceName: string): CircuitBreakerStats | null {
    return this.circuitBreakers.get(serviceName) || null;
  }

  public getAllCircuitBreakerStats(): Map<string, CircuitBreakerStats> {
    return new Map(this.circuitBreakers);
  }

  public resetCircuitBreaker(serviceName: string): boolean {
    const stats = this.circuitBreakers.get(serviceName);

    if (!stats) {
      return false;
    }

    stats.state = CircuitBreakerState.CLOSED;
    stats.failureCount = 0;
    stats.successCount = 0;
    stats.totalRequests = 0;
    stats.failureRate = 0;
    stats.lastFailureTime = null;
    stats.lastSuccessTime = null;
    stats.nextAttemptTime = null;

    this.logger.log(`Circuit breaker reset for service ${serviceName}`);
    return true;
  }

  public forceOpen(serviceName: string): boolean {
    const config = this.configs.get(serviceName);
    const stats = this.circuitBreakers.get(serviceName);

    if (!config || !stats) {
      return false;
    }

    this.transitionToOpen(serviceName);
    this.logger.log(`Circuit breaker forced OPEN for service ${serviceName}`);
    return true;
  }

  public forceClosed(serviceName: string): boolean {
    const stats = this.circuitBreakers.get(serviceName);

    if (!stats) {
      return false;
    }

    this.transitionToClosed(serviceName);
    this.logger.log(`Circuit breaker forced CLOSED for service ${serviceName}`);
    return true;
  }

  public isServiceHealthy(serviceName: string): boolean {
    const stats = this.circuitBreakers.get(serviceName);
    
    if (!stats) {
      return true; // Assume healthy if no circuit breaker configured
    }

    return stats.state === CircuitBreakerState.CLOSED || stats.state === CircuitBreakerState.HALF_OPEN;
  }

  public getServiceAvailability(serviceName: string): number {
    const stats = this.circuitBreakers.get(serviceName);
    
    if (!stats || stats.totalRequests === 0) {
      return 100; // 100% availability if no requests recorded
    }

    return Math.max(0, 100 - stats.failureRate);
  }
}
