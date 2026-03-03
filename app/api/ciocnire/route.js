import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import redis from '@/app/lib/redis';

/**
 * ====================================================================================================
 * CIOCNIM.RO - API ENDPOINT (V24.0 - SERVER-AUTHORITATIVE COMBAT)
 * ====================================================================================================
 */

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

async function getClasamentRegiuni() {
  try {
    const raw = await redis.zrevrange('leaderboard_regiuni', 0, -1, 'WITHSCORES');
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ 
        regiune: raw[i], 
        scor: parseInt(raw[i + 1]) || 0 
      });
    }
    return lista;
  } catch (e) {
    console.error("[Neural Redis] Eroare getClasamentRegiuni:", e);
    return [];
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      actiune, roomId, jucator, skin, isGolden, hasStar, 
      teamId, regiune, creator, text, newName, oponentNume 
    } = body;

    switch (actiune) {
      
      case 'get-counter': {
        const totalCount = await redis.get('global_ciocniri_total') || 0;
        const topRegiuni = await getClasamentRegiuni();
        return NextResponse.json({ success: true, total: parseInt(totalCount), topRegiuni });
      }

      case 'increment-global': {
        const noulTotal = await redis.incr('global_ciocniri_total');
        if (regiune && regiune !== "Alege regiunea..." && regiune.trim() !== "") {
          await redis.zincrby('leaderboard_regiuni', 1, regiune);
        }
        const topActualizat = await getClasamentRegiuni();
        await pusher.trigger('global', 'update-complet', { total: noulTotal, topRegiuni: topActualizat });
        return NextResponse.json({ success: true, total: noulTotal, topRegiuni: topActualizat });
      }

      case 'join': {
        if (!roomId || !jucator) return NextResponse.json({ success: false, error: "Date incomplete" });
        await pusher.trigger(`arena-v22-${roomId}`, 'join', { 
          jucator, skin, isGolden, hasStar, t: Date.now() 
        });
        return NextResponse.json({ success: true });
      }

      case 'lovitura': {
        const castigaCelCareDa = body.castigaCelCareDa !== undefined ? body.castigaCelCareDa : Math.random() < 0.5;
        
        // 1. INCREMENTARE AUTOMATĂ A BILANȚULUI DIRECT DIN LOVITURĂ
        const noulTotal = await redis.incr('global_ciocniri_total');
        if (regiune && regiune !== "Alege regiunea..." && regiune.trim() !== "") {
          await redis.zincrby('leaderboard_regiuni', 1, regiune);
        }
        const topActualizat = await getClasamentRegiuni();

        // 2. Notificăm arena curentă de rezultatul duelului
        await pusher.trigger(`arena-v22-${roomId}`, 'lovitura', { 
          jucator, castigaCelCareDa, t: Date.now() 
        });

        // 3. Notificăm TOATĂ platforma de noul scor
        await pusher.trigger('global', 'update-complet', { 
          total: noulTotal, 
          topRegiuni: topActualizat 
        });

        return NextResponse.json({ success: true });
      }

      case 'arena-chat': {
        if (!text || text.trim() === "") return NextResponse.json({ success: false });
        await pusher.trigger(`arena-v22-${roomId}`, 'arena-chat', { 
          jucator, text: text.trim(), t: Date.now() 
        });
        return NextResponse.json({ success: true });
      }

      case 'provocare-duel': {
        if (!oponentNume || !jucator || !roomId) {
          return NextResponse.json({ success: false, error: "Date incomplete" });
        }
        await pusher.trigger(`user-notif-${oponentNume}`, 'duel-request', {
          deLa: jucator, roomId: roomId, teamId: teamId || null, t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false, error: "Lipsește ID" });
        const teamName = await redis.get(`team:${teamId}:nume`);
        if (!teamName) return NextResponse.json({ success: false, error: "Grup inexistent" });
        const teamStats = await redis.hgetall(`team:${teamId}:stats`);
        if (jucator && jucator.length >= 3) {
          const exists = await redis.zscore(`team:${teamId}:membri`, jucator);
          if (exists === null) await redis.zadd(`team:${teamId}:membri`, 0, jucator);
        }
        const membriRaw = await redis.zrevrange(`team:${teamId}:membri`, 0, 14, 'WITHSCORES');
        const formattedTop = [];
        for (let i = 0; i < membriRaw.length; i += 2) {
          formattedTop.push({ member: membriRaw[i], score: parseInt(membriRaw[i+1]) || 0 });
        }
        return NextResponse.json({ success: true, details: { id: teamId, nume: teamName, ...teamStats }, top: formattedTop });
      }

      case 'creeaza-echipa': {
        if (!creator || creator.trim().length < 3) return NextResponse.json({ success: false });
        const newId = `grup_${Math.random().toString(36).substring(2, 9)}`;
        const finalTeamName = `GRUPUL LUI ${creator.toUpperCase().trim()}`;
        const pipeline = redis.pipeline();
        pipeline.set(`team:${newId}:nume`, finalTeamName);
        pipeline.hset(`team:${newId}:stats`, { creator: creator, victorii: 0, creat_la: Date.now() });
        pipeline.zadd(`team:${newId}:membri`, 0, creator);
        await pipeline.exec();
        return NextResponse.json({ success: true, teamId: newId });
      }

      case 'redenumeste-echipa': {
        if (teamId && newName && newName.trim().length >= 3) {
          await redis.set(`team:${teamId}:nume`, newName.toUpperCase().trim());
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false });
      }

      case 'creeaza-camera-privata': {
        const codPIN = Math.floor(1000 + Math.random() * 9000).toString();
        await redis.setex(`room:${codPIN}`, 3600, JSON.stringify({ creator, t: Date.now() }));
        return NextResponse.json({ success: true, cod: codPIN });
      }

      default:
        return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Error]:", error);
    return NextResponse.json({ success: false, error: "Eroare internă" }, { status: 500 });
  }
}