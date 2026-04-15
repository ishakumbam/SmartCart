import IORedis from 'ioredis';

const url = process.env.REDIS_URL?.trim();

const common = {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: () => null,
  enableOfflineQueue: false,
} as const;

/** Upstash / Render Redis use `REDIS_URL` (often `rediss://...`). Local dev uses REDIS_HOST + REDIS_PORT. */
const redis = url
  ? new IORedis(url, { ...common })
  : new IORedis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      ...common,
    });

export default redis;
