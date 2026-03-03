import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import Pusher from 'pusher';

const redis = new Redis(process.env.REDIS_URL);
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

async function getClasamentRegiuni() {
  const raw = await redis.zrevrange('leaderboard_regiuni', 0, -1, 'WITHSCORES');
  const lista = [];
  for (let i = 0; i < raw.length; i += 2) {
    lista.push({ regiune: raw[i], scor: parseInt(raw[i + 1]) });
  }
  return lista;
}

export async function POST(request) {
  const body = await request.json();
  const { actiune, roomId, jucator, skin, isGolden, hasStar, teamId, winner, regiune, creator, text } = body;

  try {
    switch (actiune) {
      case 'get-counter':
        const total = await redis.get('global_ciocniri_total') || 0;
        const top = await getClasamentRegiuni();
        return NextResponse.json({ success: true, total: parseInt(total), topRegiuni: top });

      case 'increment-global':
// ÎN route.js, case 'increment-global':
const noulTotalNum = await redis.incr('global_ciocniri_total');

if (regiune && regiune !== "Alege regiunea...") {
  await redis.zincrby('leaderboard_regiuni', 1, regiune);
}

const noulTop = await getClasamentRegiuni(); // Luăm clasamentul proaspăt

// NUMELE EVENIMENTULUI: 'update-complet'
await pusher.trigger('global', 'update-complet', { 
  total: noulTotalNum, 
  topRegiuni: noulTop 
});

return NextResponse.json({ success: true, total: noulTotalNum, topRegiuni: noulTop });

      case 'join':
        await pusher.trigger(`arena-v22-${roomId}`, 'join', { jucator, skin, isGolden, hasStar, t: Date.now() });
        return NextResponse.json({ success: true });

      case 'lovitura':
        const castigaCelCareDa = Math.random() < 0.5;
        await pusher.trigger(`arena-v22-${roomId}`, 'lovitura', { jucator, castigaCelCareDa, t: Date.now() });
        return NextResponse.json({ success: true });

      case 'arena-chat':
        await pusher.trigger(`arena-v22-${roomId}`, 'arena-chat', { jucator, text, t: Date.now() });
        return NextResponse.json({ success: true });

      case 'get-team-details':
        const teamName = await redis.get(`team:${teamId}:nume`);
        if (!teamName) return NextResponse.json({ success: false });
        const teamData = await redis.hgetall(`team:${teamId}:stats`);
        const topMembri = await redis.zrevrange(`team:${teamId}:membri`, 0, 9, 'WITHSCORES');
        const formattedTop = [];
        for (let i = 0; i < topMembri.length; i += 2) {
          formattedTop.push({ member: topMembri[i], score: parseInt(topMembri[i+1]) });
        }
        return NextResponse.json({ success: true, details: { id: teamId, nume: teamName, ...teamData }, top: formattedTop });

      case 'creeaza-echipa':
        const newTeamId = `grup_${Math.random().toString(36).substring(2, 9)}`;
        await redis.set(`team:${newTeamId}:nume`, creator ? `${creator.toUpperCase()} ELITE` : 'GRUP NOU');
        await redis.hset(`team:${newTeamId}:stats`, { creator: creator || 'Anonim', victorii: 0, xp_total: 0 });
        await redis.zadd(`team:${newTeamId}:membri`, 0, creator || 'Anonim');
        return NextResponse.json({ success: true, teamId: newTeamId });

      default:
        return NextResponse.json({ success: false }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}