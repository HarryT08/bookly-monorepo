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
        
        // Be more lenient during reconnection
        if (state === 'disconnected') {
          return this.getStatus(key, false, { 
            message: 'Redis client disconnected',
            details: 'Client is reconnecting',
            state
          });
        }
      }

      // Retry logic for health check (up to 2 retries)
      let lastError: any;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          // Perform health check with longer timeout (5 seconds)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), 5000);
          });

          const healthCheckPromise = (async () => {
            // Use unique key to avoid collisions in concurrent health checks
            const testKey = `health-check:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Use direct Redis client for health check (no JSON serialization)
            const client = (this.redis as any).client;
            
            // Verify client is ready before operation
            if (!client.isReady && !client.isOpen) {
              throw new Error('Client not ready for operations');
            }
            
            await client.set(testKey, 'ok', 'EX', 10);
            const result = await client.get(testKey);
            // Clean up (don't fail if this fails)
            try {
              await client.del(testKey);
            } catch (cleanupError) {
              // Ignore cleanup errors
            }
            return result;
          })();

          const result = await Promise.race([healthCheckPromise, timeoutPromise]);
          
          if (result === 'ok') {
            return this.getStatus(key, true, { 
              message: 'Redis connection is healthy',
              state: this.redis.getConnectionState(),
              attempt: attempt > 1 ? attempt : undefined
            });
          } else {
            lastError = new Error(`Unexpected result: ${result}`);
            if (attempt < 2) {
              // Wait 500ms before retry
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
          }
        } catch (error) {
          lastError = error;
          if (attempt < 2) {
            // Wait 500ms before retry
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
      }
      
      // All retries failed
      return this.getStatus(key, false, { 
        message: 'Redis health check failed after retries',
        details: 'Unable to complete health check operation',
        error: lastError?.message,
        state: this.redis.getConnectionState()
      });
    } catch (error) {
      // Unexpected error outside retry logic
      return this.getStatus(key, false, { 
        message: 'Redis health check error', 
        error: error.message,
        errorType: error.constructor?.name || 'Error',
        state: this.redis.getConnectionState()
      });
    }
  }

  async checkRabbitMQ(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if RabbitMQ service exists
      if (!this.rabbitmq) {
        return this.getStatus(key, false, { 
          message: 'RabbitMQ service not initialized',
          details: 'Service not injected or not available'
        });
      }

      // Check if connection is healthy
      if (!this.rabbitmq.isHealthy()) {
        const state = this.rabbitmq.getConnectionState();
        
        // Be more lenient during connection phase
        if (state === 'connecting') {
          return this.getStatus(key, false, { 
            message: 'RabbitMQ is connecting',
            details: 'Connection in progress',
            state
          });
        }
        
        return this.getStatus(key, false, { 
          message: 'RabbitMQ connection not healthy',
          state
        });
      }

      // Retry logic for health check (up to 2 retries)
      let lastError: any;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          // Perform health check with timeout (5 seconds)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), 5000);
          });

          const healthCheckPromise = (async () => {
            const channel = this.rabbitmq.getChannel();
            
            if (!channel) {
              throw new Error('Channel not available');
            }
            
            // Try to check queue (lightweight operation)
            const testQueue = `health-check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await channel.assertQueue(testQueue, { 
              durable: false, 
              autoDelete: true,
              expires: 10000  // Auto-delete after 10 seconds
            });
            
            // Clean up (don't fail if this fails)
            try {
              await channel.deleteQueue(testQueue);
            } catch (cleanupError) {
              // Ignore cleanup errors
            }
            
            return true;
          })();

          const result = await Promise.race([healthCheckPromise, timeoutPromise]);
          
          if (result) {
            return this.getStatus(key, true, { 
              message: 'RabbitMQ connection is healthy',
              state: this.rabbitmq.getConnectionState(),
              attempt: attempt > 1 ? attempt : undefined
            });
          } else {
            lastError = new Error('Unexpected result from health check');
            if (attempt < 2) {
              // Wait 500ms before retry
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
          }
        } catch (error) {
          lastError = error;
          if (attempt < 2) {
            // Wait 500ms before retry
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
      }
      
      // All retries failed
      return this.getStatus(key, false, { 
        message: 'RabbitMQ health check failed after retries',
        details: 'Unable to complete health check operation',
        error: lastError?.message,
        state: this.rabbitmq.getConnectionState()
      });
    } catch (error) {
      // Unexpected error outside retry logic
      return this.getStatus(key, false, { 
        message: 'RabbitMQ health check error', 
        error: error.message,
        errorType: error.constructor?.name || 'Error',
        state: this.rabbitmq?.getConnectionState() || 'unknown'
      });
    }
  }
}
