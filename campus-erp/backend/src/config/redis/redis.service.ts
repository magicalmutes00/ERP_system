import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        retryStrategy: (times) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 1,
        lazyConnect: false,
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis');
      });

      this.client.on('error', (error) => {
        this.logger.warn(`Redis unavailable: ${error.message}`);
      });
    } catch (err) {
      this.logger.warn(`Redis init failed: ${(err as Error).message}`);
      this.client = null;
    }
  }

  private ensureClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client is not initialized');
    }
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK' | null> {
    if (!this.client) return null;
    try {
      if (ttl) {
        return await this.client.set(key, value, 'EX', ttl);
      }
      return await this.client.set(key, value);
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.del(key);
    } catch {
      return 0;
    }
  }

  async exists(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.exists(key);
    } catch {
      return 0;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.client) return [];
    try {
      return await this.client.keys(pattern);
    } catch {
      return [];
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.hset(key, field, value);
    } catch {
      return 0;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.hget(key, field);
    } catch {
      return null;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.client) return {};
    try {
      return await this.client.hgetall(key);
    } catch {
      return {};
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.incr(key);
    } catch {
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.expire(key, seconds);
    } catch {
      return 0;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isAvailable(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }
}
