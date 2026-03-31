import Redis from 'ioredis';


function getRedisUrl() {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  // Upstash REST credentials → derive ioredis TLS URL automatically
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const host = new URL(process.env.UPSTASH_REDIS_REST_URL).hostname;
    return `rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${host}:6380`;
  }
  throw new Error("❌ Lipsesc credențialele Redis din .env! Setează REDIS_URL sau UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.");
}

const redisClientSingleton = () => {
  const client = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    enableAutoPipelining: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 100, 1000);
    }
  });

  client.on('error', () => {});

  return client;
};

const globalForRedis = globalThis;

// Lazy proxy: defers Redis connection until first method call (build-safe)
const redis = new Proxy({}, {
  get(_target, prop) {
    if (!globalForRedis._redisClient) {
      globalForRedis._redisClient = redisClientSingleton();
    }
    const val = globalForRedis._redisClient[prop];
    return typeof val === 'function' ? val.bind(globalForRedis._redisClient) : val;
  }
});

export default redis;
