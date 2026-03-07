import Redis from 'ioredis';

/**
 * ====================================================================================================
 * CIOCNIM.RO - REDIS NEURAL LINK (V28.3 - AUTO-PIPELINING ACTIVE)
 * ====================================================================================================
 */

const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("❌ REDIS_URL lipsește din .env!");
  }

  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, 
    lazyConnect: true,          
    connectTimeout: 15000,      
    enableAutoPipelining: true, 
    retryStrategy(times) {
      return Math.min(times * 50, 2000); 
    }
  });

  client.on('error', (err) => {
    if (err.message.includes('ECONNREFUSED')) return;
    console.error('[Neural Redis] Eroare de conexiune:', err.message);
  });

  client.on('connect', () => {
    console.log('🔗 [Neural Redis] Baza de date conectată cu succes!');
  });

  return client;
};

const globalForRedis = globalThis;
const redis = globalForRedis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;