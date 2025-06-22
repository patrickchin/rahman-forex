// src/lib/redisClient.ts

let redisClient: any = null;

export function getRedisClient() {
  if (redisClient) return redisClient;

  if (process.env.NODE_ENV === 'development') {
    // Use ioredis for local development
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require('ioredis');
    redisClient = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
  } else {
    // Use Upstash for production
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Redis } = require('@upstash/redis');
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

export async function disconnectRedis() {
  if (process.env.NODE_ENV === 'development' && redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
}
