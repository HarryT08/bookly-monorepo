import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { LoggingService } from '@logging/logging.service';
import { DomainEvent } from './event-bus.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  /**
   * Creates a Redis multi/pipeline for batch operations
   * In Redis v4+, use multi() instead of pipeline()
   */
  multi() {
    return this.client.multi();
  }

  /**
   * Legacy pipeline method - redirects to multi() for compatibility
   * @deprecated Use multi() instead
   */
  pipeline() {
    return this.client.multi();
  }

  zRemRangeByRank(key: string, start: number, stop: number) {
    return this.client.zRemRangeByRank(key, start, stop);
  }

  getClient() {
    return this.client;
  }

  zRemRangeByScore(key: string, min: number, max: number) {
    return this.client.zRemRangeByScore(key, min, max);
  }

  zCard(key: string) {
    return this.client.zCard(key);
  }

  zRange(key: string, start: number, stop: number, options?: any) {
    return this.client.zRange(key, start, stop, options);
  }

  keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  ttl(key: string) {
    return this.client.ttl(key);
  }
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

  async lPush(key: string, value: string): Promise<void> {
    await this.client.lPush(key, value);
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lRange(key, start, stop);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async cacheEvent(event: any): Promise<void> {
    try {
      const key = `events:${event.aggregateType}:${event.aggregateId}`;
      await this.client.lPush(key, JSON.stringify(event));
      await this.client.expire(key, 86400); // 24 hours TTL
    } catch (error) {
      console.error('Failed to cache event:', error);
    }
  }

  async getEventHistory(aggregateId: string): Promise<any[]> {
    try {
      const pattern = `events:*:${aggregateId}`;
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return [];
      }

      const events: any[] = [];
      for (const key of keys) {
        const eventStrings = await this.client.lRange(key, 0, -1);
        const keyEvents = eventStrings.map(eventStr => JSON.parse(eventStr));
        events.push(...keyEvents);
      }

      // Sort events by timestamp
      return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get event history:', error);
      return [];
    }
  }

  async cacheReservationAvailability(resourceId: string, date: string, availability: any): Promise<void> {
    const key = `availability:${resourceId}:${date}`;
    await this.set(key, availability, 3600); // Cache for 1 hour
  }

  async getReservationAvailability(resourceId: string, date: string): Promise<any> {
    const key = `availability:${resourceId}:${date}`;
    return await this.get(key);
  }

  async zRangeWithScores(key: string, start: number, stop: number): Promise<Array<{ score: number; value: string }>> {
    return await this.client.zRangeWithScores(key, start, stop);
  }
}
