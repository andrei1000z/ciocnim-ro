// app/lib/redis.js
import Redis from 'ioredis';

/**
 * ====================================================================================================
 * CIOCNIM.RO - REDIS NEURAL LINK (V23.2 - AUTO-PIPELINING ACTIVE)
 * ====================================================================================================
 * Fix: Previne Memory Leaks la HMR (Next.js Dev).
 * Boost: Adăugat Auto-Pipelining pentru performanță extremă în Arena Live (0 lag la click-uri).
 * ====================================================================================================
 */

const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("❌ REDIS_URL lipsește din .env!");
  }

  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // OBLIGATORIU: Previne eroarea de limită de încercări
    lazyConnect: true,          // Nu se conectează până nu e apelat prima dată
    connectTimeout: 15000,      // Îi dăm 15 secunde să respire
    enableAutoPipelining: true, // TANK ENGINE: Grupează comenzile simultane automat (Zero Lag)
    retryStrategy(times) {
      // Dacă pică Upstash o secundă, încearcă din nou progresiv fără să dea crash aplicației
      return Math.min(times * 50, 2000); 
    }
  });

  client.on('error', (err) => {
    // Asta oprește "Unhandled error event" să îți mai spameze consola
    if (err.message.includes('ECONNREFUSED')) return;
    console.error('[Neural Redis] Eroare de conexiune:', err.message);
  });

  client.on('connect', () => {
    // Un mic log ca să știi clar că baza de date e trează când pornești serverul
    console.log('🔗 [Neural Redis] Baza de date conectată cu succes!');
  });

  return client;
};

// Salvăm instanța în "globalThis" ca să nu generăm sute de conexiuni la fiecare refresh în Dev
const globalForRedis = globalThis;
const redis = globalForRedis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;