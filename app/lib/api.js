import { safeLS } from './utils';

/**
 * POST către /api/ciocnire cu X-Session header automat (din c_session).
 * Server gate-uiește acțiunile sensibile (sterge-cont, update-stats, get-user-stats etc.)
 * pe header-ul ăsta. Pentru acțiuni publice e harmless.
 */
export async function apiPost(body) {
  const headers = { 'Content-Type': 'application/json' };
  const session = safeLS.get('c_session');
  if (session) headers['X-Session'] = session;
  const res = await fetch('/api/ciocnire', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({ success: false, error: 'parse-error' }));
}
