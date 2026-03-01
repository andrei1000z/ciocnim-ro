import Pusher from "pusher";
import { NextResponse } from "next/server";
import { Redis } from '@upstash/redis';

// Configurare Pusher - Motorul de timp real
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

// Configurare Redis - Memoria persistentă a echipelor
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * API Centralizat pentru Ciocnim.ro
 * Gestionează: Joc, Echipe, Chat, Status Online, Clasamente
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { roomId, actiune, jucator, teamId, mesaj, data } = body;

    switch (actiune) {
      // --- LOGICĂ ECHIPE ---
      case 'creeaza-echipa':
        const idNou = Math.random().toString(36).substring(2, 10);
        const numeEchipa = data?.nume || `Echipa lui ${jucator}`;
        const infoEchipa = {
          id: idNou,
          nume: numeEchipa,
          admin: jucator,
          creataLa: Date.now(),
        };
        // Salvăm info echipa și adăugăm primul membru
        await redis.set(`team:${idNou}`, infoEchipa);
        await redis.sadd(`team:${idNou}:membri`, jucator);
        await redis.zadd(`team:${idNou}:leaderboard`, { score: 0, member: jucator });
        return NextResponse.json({ success: true, team: infoEchipa });

      case 'get-team-details':
        const details = await redis.get(`team:${teamId}`);
        const membri = await redis.smembers(`team:${teamId}:membri`);
        const top = await redis.zrange(`team:${teamId}:leaderboard`, 0, -1, { rev: true, withScores: true });
        const chatHistory = await redis.lrange(`team:${teamId}:chat`, 0, 20);
        return NextResponse.json({ success: true, details, membri, top, chatHistory });

      case 'trimite-mesaj':
        const payloadMesaj = { autor: jucator, text: mesaj, t: Date.now() };
        await redis.lpush(`team:${teamId}:chat`, JSON.stringify(payloadMesaj));
        await redis.ltrim(`team:${teamId}:chat`, 0, 50); // Păstrăm ultimele 50 mesaje
        await pusher.trigger(`team-channel-${teamId}`, 'mesaj-nou', payloadMesaj);
        return NextResponse.json({ success: true });

      // --- LOGICĂ JOC ȘI NOTIFICĂRI ---
      case 'invite-duel':
        // Trimitem o notificare "Push" prin Pusher către canalul privat al jucătorului
        await pusher.trigger(`user-notif-${data.tinta}`, 'duel-request', {
          deLa: jucator,
          roomId: roomId,
          teamName: data.teamName
        });
        return NextResponse.json({ success: true });

      case 'lovitura':
        const castigaCelCareDa = Math.random() < 0.5;
        await pusher.trigger(`camera-${roomId}`, 'lovitura', { ...body, castigaCelCareDa });
        
        // Dacă e meci de echipă, actualizăm clasamentul intern
        if (teamId) {
          const castigator = castigaCelCareDa ? jucator : data.adversar;
          await redis.zincrby(`team:${teamId}:leaderboard`, 1, castigator);
        }
        
        // Incrementăm counterul global
        const globalTotal = await redis.incr('total_oua_sparte');
        await pusher.trigger('global', 'ou-spart', { total: globalTotal });
        return NextResponse.json({ success: true });

      case 'update-online':
        // Heartbeat pentru status online (expiră în 10 secunde)
        await redis.set(`online:${teamId}:${jucator}`, '1', { ex: 15 });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Acțiune necunoscută" }, { status: 400 });
    }
  } catch (err) {
    console.error("Eroare API Ciocnim:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}