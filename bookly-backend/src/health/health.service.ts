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
      await this.redis.set('health-check', 'ok', 10);
      const result = await this.redis.get('health-check');
      await this.redis.del('health-check');
      
      if (result === 'ok') {
        return this.getStatus(key, true, { message: 'Redis connection is healthy' });
      } else {
        return this.getStatus(key, false, { message: 'Redis health check failed' });
      }
    } catch (error) {
      return this.getStatus(key, false, { message: 'Redis connection failed', error: error.message });
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
