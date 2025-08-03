import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { LoggingService } from '@logging/logging.service';
import { DomainEvent } from './event-bus.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    this.client = createClient({
      socket: {
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
      },
      password: this.configService.get('REDIS_PASSWORD'),
      database: this.configService.get('REDIS_DB'),
    });

    this.client.on('error', (err) => {
      this.loggingService.error('Redis Client Error', err, 'RedisService');
    });

    this.client.on('connect', () => {
      this.loggingService.log('✅ Redis connected successfully', 'RedisService');
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      this.loggingService.error('❌ Failed to connect to Redis', error, 'RedisService');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.disconnect();
    this.loggingService.log('📴 Redis disconnected', 'RedisService');
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async cacheEvent(event: DomainEvent): Promise<void> {
    const key = `event:${event.eventId}`;
    await this.set(key, event, 86400); // Cache for 24 hours
  }

  async getEvent(eventId: string): Promise<DomainEvent | null> {
    return await this.get<DomainEvent>(`event:${eventId}`);
  }

  async cacheReservationAvailability(resourceId: string, date: string, availability: any): Promise<void> {
    const key = `availability:${resourceId}:${date}`;
    await this.set(key, availability, 3600); // Cache for 1 hour
  }

  async getReservationAvailability(resourceId: string, date: string): Promise<any> {
    const key = `availability:${resourceId}:${date}`;
    return await this.get(key);
  }
}
