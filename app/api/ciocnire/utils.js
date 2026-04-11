import redis from '@/app/lib/redis';

export const NUME_INTERZISE = ["BOT", "SISTEM", "ADMIN", "ANONIM"];

export function sanitizeStr(val, maxLen = 100) {
  if (typeof val !== 'string') return '';
  // Strip characters dangerous in Redis key names (colons, newlines, glob chars)
  return val.slice(0, maxLen).replace(/[:\n\r\*\?\[\]\{\}]/g, '').trim();
}

export function sanitizeId(val) {
  if (typeof val !== 'string' || val === 'null' || val === 'undefined') return '';
  const clean = val.slice(0, 64).replace(/[^a-zA-Z0-9\-_]/g, '');
  return clean || '';
}

export function getClientIp(request) {
  return request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

const VALID_LOCALES = ['ro', 'bg', 'el', 'en'];

/**
 * Returns the Redis namespace based on body.locale.
 * Each locale has its own isolated namespace:
 *   - ciocnim.ro serves only 'ro'
 *   - trosc.fun serves 'bg', 'el', 'en'
 * Fallback: if body.locale is missing/invalid, derive from host.
 */
export function getNamespace(request, bodyLocale) {
  if (VALID_LOCALES.includes(bodyLocale)) return bodyLocale;
  // Fallback for requests without locale in body
  const host = request.headers.get('host') || '';
  return host.includes('trosc.fun') ? 'en' : 'ro';
}

export async function checkRateLimit(ip, actiune, ns = 'ro') {
  const isWrite = ['increment-global', 'lovitura', 'provocare-duel', 'creeaza-echipa'].includes(actiune);
  const maxRequests = isWrite ? 10 : 60;
  const windowSec = 60;
  const key = `${ns}:ratelimit:${ip}:${isWrite ? 'write' : 'read'}`;
  const luaScript = `
    local current = redis.call('incr', KEYS[1])
    if current == 1 then redis.call('expire', KEYS[1], ARGV[1]) end
    return current
  `;
  const current = await redis.eval(luaScript, 1, key, windowSec);
  return current <= maxRequests;
}

export { VALID_LOCALES };
