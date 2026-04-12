import IORedis from 'ioredis';

const redis = new IORedis({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: () => null,
  enableOfflineQueue: false,
});

export default redis;
