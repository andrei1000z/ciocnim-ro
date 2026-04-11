import redis from '@/app/lib/redis';
import { randomBytes } from 'crypto';

export const NUME_INTERZISE = ["BOT", "SISTEM", "ADMIN", "ANONIM"];

const SESSION_TTL = 60 * 60 * 24 * 90; // 90 zile

/**
 * Validează că request-ul vine de la owner-ul real al numelui.
 * Pentru acțiuni sensibile (sterge-cont, update-stats, get-user-stats etc.)
 * Returnează { ok: true, name } sau { ok: false, status, error }.
 *
 * Backwards-compat: dacă numele NU are încă session reservat (legacy user),
 * rezultă 401 cu hint să facă re-claim via schimba-porecla.
 */
export async function requireSession(request, ns, claimedName) {
  if (!claimedName) return { ok: false, status: 400, error: "Nume lipsă" };
  const token = request.headers.get('x-session');
  if (!token || token.length < 32) return { ok: false, status: 401, error: "session-required" };
  const cleanName = claimedName.toUpperCase();
  const sessionName = await redis.get(`${ns}:session:${token}`);
  if (!sessionName) return { ok: false, status: 401, error: "session-invalid" };
  if (sessionName !== cleanName) return { ok: false, status: 403, error: "session-mismatch" };
  // Refresh TTL pe fiecare hit
  redis.expire(`${ns}:session:${token}`, SESSION_TTL).catch(() => {});
  return { ok: true, name: cleanName };
}

/**
 * Creează o sesiune nouă pentru un nume. Folosit doar din schimba-porecla
 * după ce reservation NX a reușit sau e self-noop confirmat.
 */
export async function createSession(ns, name) {
  const token = randomBytes(32).toString('hex');
  const cleanName = name.toUpperCase();
  await Promise.all([
    redis.setex(`${ns}:session:${token}`, SESSION_TTL, cleanName),
    redis.setex(`${ns}:session:byname:${cleanName}`, SESSION_TTL, token),
  ]);
  return token;
}

/**
 * Verifică dacă un nume are deja sesiune (legacy detection).
 */
export async function hasSession(ns, name) {
  const cleanName = name.toUpperCase();
  return (await redis.exists(`${ns}:session:byname:${cleanName}`)) === 1;
}

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
  // Pe Vercel, x-forwarded-for e rescris autoritativ (clientul nu poate seta).
  // x-real-ip era acceptat dar e user-spoofable → bypass total al rate limits.
  // Citim DOAR x-forwarded-for, primul element (clientul real).
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
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
  // 120 writes/min per IP = 2/s average. Suficient pentru:
  // - gameplay rapid (un round = 2 writes, deci max ~60 runde/min)
  // - familii cu multiple devices behind same NAT (5 useri × 12 runde/min = 60 writes/min)
  // 240 reads/min per IP = 4/s average.
  const maxRequests = isWrite ? 120 : 240;
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
