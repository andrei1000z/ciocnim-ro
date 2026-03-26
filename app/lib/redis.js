import Redis from 'ioredis';


const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("❌ REDIS_URL lipsește din .env!");
  }

  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    enableAutoPipelining: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 100, 1000);
    }
  });

  client.on('error', (err) => {
    if (err.message.includes('ECONNREFUSED')) return;
    console.error('[Neural Redis] Eroare de conexiune:', err.message);
  });

  client.on('connect', () => {});

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
