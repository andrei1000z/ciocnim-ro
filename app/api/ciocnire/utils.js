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

export async function checkRateLimit(ip, actiune) {
  const isWrite = ['increment-global', 'lovitura', 'provocare-duel', 'creeaza-echipa'].includes(actiune);
  const maxRequests = isWrite ? 10 : 60;
  const windowSec = 60;
  const key = `ratelimit:${ip}:${isWrite ? 'write' : 'read'}`;
  const luaScript = `
    local current = redis.call('incr', KEYS[1])
    if current == 1 then redis.call('expire', KEYS[1], ARGV[1]) end
    return current
  `;
  const current = await redis.eval(luaScript, 1, key, windowSec);
  return current <= maxRequests;
}
