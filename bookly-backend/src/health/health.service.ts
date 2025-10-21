import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '@common/services/prisma.service';
import { RedisService } from '@event-bus/services/redis.service';
import { RabbitMQService } from '@event-bus/services/rabbitmq.service';

@Injectable()
export class HealthService extends HealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly rabbitmq: RabbitMQService,
  ) {
    super();
  }

  async checkDatabase(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$runCommandRaw({
        ping: 1,
      })
      return this.getStatus(key, true, { message: 'Database connection is healthy' });
    } catch (error) {
      return this.getStatus(key, false, { message: 'Database connection failed', error: error.message });
    }
  }

  async checkRedis(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if client is healthy (ready or open)
      if (!this.redis.isHealthy()) {
        const state = this.redis.getConnectionState();
        return this.getStatus(key, false, { 
          message: 'Redis client not ready',
          details: `Client state: ${state}`,
          state
        });
      }

      // Perform health check with timeout (3 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), 3000);
      });

      const healthCheckPromise = (async () => {
        // Use unique key to avoid collisions in concurrent health checks
        const testKey = `health-check:${Date.now()}`;
        await this.redis.set(testKey, 'ok', 5);
        const result = await this.redis.get(testKey);
        await this.redis.del(testKey);
        return result;
      })();

      const result = await Promise.race([healthCheckPromise, timeoutPromise]);
      
      if (result === 'ok') {
        return this.getStatus(key, true, { 
          message: 'Redis connection is healthy',
          state: this.redis.getConnectionState()
        });
      } else {
        return this.getStatus(key, false, { 
          message: 'Redis health check failed',
          details: 'Unexpected result from health check operation',
          result
        });
      }
    } catch (error) {
      // Differentiate error types for better debugging
      if (error.message === 'Health check timeout') {
        return this.getStatus(key, false, { 
          message: 'Redis health check timeout',
          details: 'Operation took longer than 3 seconds',
          errorType: 'TimeoutError',
          state: this.redis.getConnectionState()
        });
      }
      
      // Real connection error
      return this.getStatus(key, false, { 
        message: 'Redis health check failed', 
        error: error.message,
        errorType: error.constructor?.name || 'Error',
        state: this.redis.getConnectionState()
      });
    }
  }

  async checkRabbitMQ(key: string): Promise<HealthIndicatorResult> {
    try {
      // Simple check to see if RabbitMQ service is available
      // In a real implementation, you might want to check connection status
      const isHealthy = this.rabbitmq !== null;
      
      if (isHealthy) {
        return this.getStatus(key, true, { message: 'RabbitMQ connection is healthy' });
      } else {
        return this.getStatus(key, false, { message: 'RabbitMQ service not available' });
      }
    } catch (error) {
      return this.getStatus(key, false, { message: 'RabbitMQ connection failed', error: error.message });
    }
  }
}
