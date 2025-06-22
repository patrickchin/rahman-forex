// src/lib/redisClient.ts

import type IORedis from 'ioredis';
import type { Redis as UpstashRedis } from '@upstash/redis';

let redisClient: IORedis | UpstashRedis | null = null;

export async function getRedisClient(): Promise<IORedis | UpstashRedis> {
  if (redisClient) return redisClient;

  if (process.env.NODE_ENV === 'development') {
    const { default: IORedis } = await import('ioredis');
    redisClient = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
  } else {
    const { Redis } = await import('@upstash/redis');
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

export async function disconnectRedis() {
  if (process.env.NODE_ENV === 'development' && redisClient) {
    // @ts-expect-error: disconnect exists on IORedis but not Upstash
    await redisClient.disconnect?.();
    redisClient = null;
  }
}
