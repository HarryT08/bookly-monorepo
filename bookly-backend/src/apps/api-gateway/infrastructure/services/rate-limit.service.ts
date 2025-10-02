import { RedisService } from '@/libs/event-bus/services/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RateLimitConfig {
  ttl: number; // Time window in seconds
  limit: number; // Max requests in time window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  totalHits: number;
  totalHitsRemaining: number;
  msBeforeNext: number;
  resetTime: Date;
}

export interface RateLimitInfo {
  key: string;
  totalHits: number;
  resetTime: Date;
  msBeforeNext: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly globalConfig: RateLimitConfig;
  private readonly userConfig: RateLimitConfig;
  private readonly endpointConfigs: Map<string, RateLimitConfig> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.globalConfig = {
      ttl: this.configService.get<number>('gateway.rateLimit.global.ttl', 60),
      limit: this.configService.get<number>('gateway.rateLimit.global.limit', 1000),
    };

    this.userConfig = {
      ttl: this.configService.get<number>('gateway.rateLimit.perUser.ttl', 60),
      limit: this.configService.get<number>('gateway.rateLimit.perUser.limit', 100),
    };

    this.initializeEndpointConfigs();
  }

  private initializeEndpointConfigs(): void {
    const endpointConfigs = this.configService.get('gateway.rateLimit.perEndpoint', {});
    
    Object.entries(endpointConfigs).forEach(([endpoint, config]: [string, any]) => {
      this.endpointConfigs.set(endpoint, {
        ttl: config.ttl,
        limit: config.limit,
        skipSuccessfulRequests: config.skipSuccessfulRequests,
        skipFailedRequests: config.skipFailedRequests,
      });
    });

    this.logger.log(`Initialized rate limiting for ${this.endpointConfigs.size} specific endpoints`);
  }

  public async checkGlobalRateLimit(ip: string): Promise<RateLimitResult> {
    const key = `rate_limit:global:${ip}`;
    return this.checkRateLimit(key, this.globalConfig);
  }

  public async checkUserRateLimit(userId: string): Promise<RateLimitResult> {
    const key = `rate_limit:user:${userId}`;
    return this.checkRateLimit(key, this.userConfig);
  }

  public async checkEndpointRateLimit(endpoint: string, identifier: string): Promise<RateLimitResult> {
    const config = this.endpointConfigs.get(endpoint);
    
    if (!config) {
      // No specific rate limit for this endpoint, allow request
      return {
        allowed: true,
        totalHits: 0,
        totalHitsRemaining: Infinity,
        msBeforeNext: 0,
        resetTime: new Date(Date.now() + 60000),
      };
    }

    const key = `rate_limit:endpoint:${endpoint}:${identifier}`;
    return this.checkRateLimit(key, config);
  }

  public async checkCustomRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    return this.checkRateLimit(key, config);
  }

  private async checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    try {
      const redis = this.redisService.getClient();
      const now = Date.now();
      const windowStart = now - (config.ttl * 1000);

      // Use Redis sorted set to track requests in time window
      const pipeline = this.redisService.pipeline();
      
      // Remove old entries outside the time window
      pipeline.zRemRangeByScore(key, 0, windowStart);
      
      // Count current requests in window
      pipeline.zCard(key);
      
      // Add current request
      pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
      
      // Set expiration
      pipeline.expire(key, config.ttl);

      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis pipeline execution failed');
      }

      // In Redis v4+, results is an array of values, not [error, value] tuples
      const currentCount = results[1] as number;
      const allowed = currentCount < config.limit;
      
      if (!allowed) {
        // Remove the request we just added since it's not allowed
        await this.redisService.zRemRangeByRank(key, -1, -1);
      }

      const totalHitsRemaining = Math.max(0, config.limit - currentCount - (allowed ? 1 : 0));
      const resetTime = new Date(now + (config.ttl * 1000));
      
      // Calculate time until next request is allowed
      let msBeforeNext = 0;
      if (!allowed) {
        // Get the oldest request in the current window
        const oldestRequests = await redis.zRangeWithScores(key, 0, 0);
        if (oldestRequests.length > 0) {
          const oldestTimestamp = oldestRequests[0].score;
          msBeforeNext = Math.max(0, (oldestTimestamp + (config.ttl * 1000)) - now);
        }
      }

      const result: RateLimitResult = {
        allowed,
        totalHits: currentCount + (allowed ? 1 : 0),
        totalHitsRemaining,
        msBeforeNext,
        resetTime,
      };

      if (!allowed) {
        this.logger.warn(`Rate limit exceeded for key: ${key}. Current: ${currentCount}, Limit: ${config.limit}`);
      }

      return result;

    } catch (error) {
      this.logger.error(`Rate limit check failed for key ${key}:`, error);
      
      // Fail open - allow request if Redis is unavailable
      return {
        allowed: true,
        totalHits: 0,
        totalHitsRemaining: config.limit,
        msBeforeNext: 0,
        resetTime: new Date(Date.now() + (config.ttl * 1000)),
      };
    }
  }

  public async getRateLimitInfo(key: string, config: RateLimitConfig): Promise<RateLimitInfo> {
    try {
      const now = Date.now();
      const windowStart = now - (config.ttl * 1000);

      // Clean up old entries and get current count
      await this.redisService.zRemRangeByScore(key, 0, windowStart);
      const totalHits = await this.redisService.zCard(key);
      
      const resetTime = new Date(now + (config.ttl * 1000));
      
      // Calculate time until next request is allowed
      let msBeforeNext = 0;
      if (totalHits >= config.limit) {
        const oldestRequests = await this.redisService.zRangeWithScores(key, 0, 0);
        if (oldestRequests.length > 0) {
          const oldestTimestamp = oldestRequests[0].score;
          msBeforeNext = Math.max(0, (oldestTimestamp + (config.ttl * 1000)) - now);
        }
      }

      return {
        key,
        totalHits,
        resetTime,
        msBeforeNext,
      };

    } catch (error) {
      this.logger.error(`Failed to get rate limit info for key ${key}:`, error);
      
      return {
        key,
        totalHits: 0,
        resetTime: new Date(Date.now() + (config.ttl * 1000)),
        msBeforeNext: 0,
      };
    }
  }

  public async resetRateLimit(key: string): Promise<boolean> {
    try {
      await this.redisService.del(key);
      
      this.logger.log(`Reset rate limit for key: ${key}`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to reset rate limit for key ${key}:`, error);
      return false;
    }
  }

  public async getAllRateLimitKeys(pattern: string = 'rate_limit:*'): Promise<string[]> {
    try {
      return await this.redisService.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get rate limit keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  public async getRateLimitStats(): Promise<Record<string, any>> {
    try {
      const keys = await this.redisService.keys('rate_limit:*');
      const stats: Record<string, any> = {};

      for (const key of keys) {
        const count = await this.redisService.zCard(key);
        const ttl = await this.redisService.ttl(key);
        
        stats[key] = {
          currentRequests: count,
          ttlSeconds: ttl,
          expiresAt: ttl > 0 ? new Date(Date.now() + (ttl * 1000)) : null,
        };
      }

      return stats;

    } catch (error) {
      this.logger.error('Failed to get rate limit stats:', error);
      return {};
    }
  }

  public generateIpKey(ip: string): string {
    return `ip:${ip}`;
  }

  public generateUserKey(userId: string): string {
    return `user:${userId}`;
  }

  public generateEndpointKey(endpoint: string, identifier: string): string {
    return `endpoint:${endpoint}:${identifier}`;
  }

  public addEndpointConfig(endpoint: string, config: RateLimitConfig): void {
    this.endpointConfigs.set(endpoint, config);
    this.logger.log(`Added rate limit config for endpoint: ${endpoint}`);
  }

  public removeEndpointConfig(endpoint: string): boolean {
    const removed = this.endpointConfigs.delete(endpoint);
    if (removed) {
      this.logger.log(`Removed rate limit config for endpoint: ${endpoint}`);
    }
    return removed;
  }

  public getEndpointConfig(endpoint: string): RateLimitConfig | undefined {
    return this.endpointConfigs.get(endpoint);
  }

  public getAllEndpointConfigs(): Map<string, RateLimitConfig> {
    return new Map(this.endpointConfigs);
  }
}
