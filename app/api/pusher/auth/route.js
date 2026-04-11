import { NextResponse } from 'next/server';
import pusher from '../../ciocnire/pusher';
import redis from '@/app/lib/redis';

const VALID_LOCALES = ['ro', 'bg', 'el', 'en'];

/**
 * Pusher private channel auth endpoint.
 *
 * Pusher client face POST aici cu socket_id + channel_name în form body.
 * Validăm că user-ul (identificat via X-Session header) are voie pe canal.
 * Reguli:
 *   - private-{ns}-arena-v23-{roomId} → user trebuie să fie în room:{roomId}:players
 *   - private-{ns}-team-{teamId}      → user trebuie să fie în team:{teamId}:membri
 *   - private-{ns}-user-notif-{name}  → session.name === name
 *
 * Channels publice (global, online-count) NU trec pe aici — rămân unauthenticated.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const socketId = formData.get('socket_id');
    const channelName = formData.get('channel_name');
    if (!socketId || typeof channelName !== 'string') {
      return NextResponse.json({ error: 'bad-request' }, { status: 400 });
    }

    if (!channelName.startsWith('private-')) {
      return NextResponse.json({ error: 'not-private' }, { status: 400 });
    }

    // Parse: private-{ns}-{rest...}
    const stripped = channelName.slice('private-'.length);
    const dashIdx = stripped.indexOf('-');
    if (dashIdx < 0) return NextResponse.json({ error: 'malformed' }, { status: 400 });
    const ns = stripped.slice(0, dashIdx);
    const subChannel = stripped.slice(dashIdx + 1);
    if (!VALID_LOCALES.includes(ns)) {
      return NextResponse.json({ error: 'bad-ns' }, { status: 403 });
    }

    // Resolve session
    const token = request.headers.get('x-session');
    let sessionName = null;
    if (token && token.length >= 32) {
      const stored = await redis.get(`${ns}:session:${token}`);
      if (stored) sessionName = String(stored).toUpperCase();
    }

    // Authorization rules per channel type
    let authorized = false;

    if (subChannel.startsWith('arena-v23-')) {
      const roomId = subChannel.slice('arena-v23-'.length);
      if (sessionName && roomId) {
        const inRoom = await redis.sismember(`${ns}:room:${roomId}:players`, sessionName);
        authorized = inRoom === 1;
      }
    } else if (subChannel.startsWith('team-')) {
      const teamId = subChannel.slice('team-'.length);
      if (sessionName && teamId) {
        const score = await redis.zscore(`${ns}:team:${teamId}:membri`, sessionName);
        authorized = score !== null && score !== undefined;
      }
    } else if (subChannel.startsWith('user-notif-')) {
      const targetName = subChannel.slice('user-notif-'.length);
      authorized = sessionName !== null && sessionName === targetName.toUpperCase();
    }

    if (!authorized) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  } catch (e) {
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}
