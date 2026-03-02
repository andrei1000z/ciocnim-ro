import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import Pusher from 'pusher';

/**
 * ========================================================================================================================
 * CIOCNIM.RO - SERVER CORE "NUCLEUL NEURAL" (VERSION 22.5 - REGIONAL WARFARE OVERLORD)
 * ------------------------------------------------------------------------------------------------------------------------
 * Infrastructură: Upstash Redis (Global Atomic Persistence) + Pusher (Real-time Kinetic Relay)
 * Rol: Gestionarea tranzacțiilor kinetice, sincronizarea clanurilor și ierarhia pe Regiuni.
 * * 📜 PROTOCOALE DE SERVER V22.5:
 * 1. REGIONAL LEADERBOARD: Adăugat ZSET pentru ierarhia regiunilor (Moldova, Ardeal, Muntenia etc.).
 * 2. ENDPOINT-URI LIPSĂ REPARATE: Au fost integrate acțiunile 'get-counter' și 'increment-global' apelate de frontend.
 * 3. ATOMIC SCORING ENGINE: Utilizarea 'redis.pipeline()' previne race conditions la mii de lovituri pe secundă.
 * 4. PUSHER RELAY V22: Canalele au fost actualizate la 'arena-v22' pentru a se sincroniza perfect cu frontend-ul.
 * ========================================================================================================================
 */

// Configurare Singleton pentru conexiunile la Sanctuarul de Date
const redis = new Redis(process.env.REDIS_URL);
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

export async function POST(request) {
  const body = await request.json();
  // Am extras toți parametrii posibili trimiși de frontend, inclusiv 'regiune' și 'creator'
  const { actiune, roomId, jucator, skin, isGolden, hasStar, intensity, teamId, winner, newName, text, regiune, creator } = body;

  try {
    switch (actiune) {

      /**
       * PROTOCOL NOU: GET COUNTER
       * Returnează bilanțul național și topul regiunilor la încărcarea site-ului.
       */
      case 'get-counter':
        const totalCiocniri = await redis.get('global_ciocniri_total') || 9;
        
        // Extragem topul regiunilor
        const topRegiuniBrut = await redis.zrevrange('leaderboard_regiuni', 0, -1, 'WITHSCORES');
        const topRegiuni = [];
        for (let i = 0; i < topRegiuniBrut.length; i += 2) {
          topRegiuni.push({ regiune: topRegiuniBrut[i], scor: parseInt(topRegiuniBrut[i+1]) });
        }
        
        return NextResponse.json({ success: true, total: parseInt(totalCiocniri), topRegiuni });

      /**
       * PROTOCOL NOU: INCREMENT GLOBAL & REGIONAL
       * Crește atomic numărul de ouă sparte și adaugă puncte taberei alese (Moldova, Ardeal etc.)
       */
      case 'increment-global':
        const pl = redis.pipeline();
        pl.incr('global_ciocniri_total');
        
        // Dacă jucătorul și-a ales o regiune, o urcăm în clasament
        if (regiune) {
          pl.zincrby('leaderboard_regiuni', 1, regiune);
        }
        
        const results = await pl.exec();
        const noulTotal = results[0][1];

        // Trimitem broadcast către toți jucătorii de pe site să le crească numărul live pe ecran
        await pusher.trigger('global', 'ou-spart', { total: noulTotal });
        return NextResponse.json({ success: true, total: noulTotal });

      /**
       * PROTOCOL: JOIN ARENA
       */
      case 'join':
        await pusher.trigger(`arena-v22-${roomId}`, 'join', {
          jucator, skin, isGolden, hasStar, t: Date.now()
        });
        return NextResponse.json({ success: true, status: "Neural Handshake Complete" });

      /**
       * PROTOCOL: LOVITURĂ (KINETIC STRIKE)
       */
      case 'lovitura':
        const castigaCelCareDa = intensity > 25 ? Math.random() < 0.7 : Math.random() < 0.45;
        
        await pusher.trigger(`arena-v22-${roomId}`, 'lovitura', {
          jucator,
          intensity,
          castigaCelCareDa,
          t: Date.now()
        });
        return NextResponse.json({ success: true, impact: intensity });

      /**
       * PROTOCOL: RESOLVE MATCH (CLAN XP)
       */
      case 'resolve-match':
        const pipeline = redis.pipeline();
        if (teamId && winner) {
          const xpGained = Math.floor((intensity || 10) * 1.5);
          pipeline.zincrby('leaderboard_global_echipe', xpGained, teamId);
          pipeline.hincrby(`team:${teamId}:stats`, 'victorii', 1);
          pipeline.hincrby(`team:${teamId}:stats`, 'xp_total', xpGained);
        }
        await pipeline.exec();
        return NextResponse.json({ success: true, persistence: "Atomic Update Executed" });

      /**
       * PROTOCOL: NEURAL CHAT
       */
      case 'arena-chat':
        await pusher.trigger(`arena-v22-${roomId}`, 'arena-chat', {
          jucator, text, t: Date.now()
        });
        return NextResponse.json({ success: true });

      /**
       * PROTOCOL: GET TEAM DETAILS
       */
      case 'get-team-details':
        const teamData = await redis.hgetall(`team:${teamId}:stats`);
        const teamName = await redis.get(`team:${teamId}:nume`) || "Clan Necunoscut";
        
        const topMembri = await redis.zrevrange(`team:${teamId}:membri`, 0, 9, 'WITHSCORES');
        const formattedTop = [];
        for (let i = 0; i < topMembri.length; i += 2) {
          formattedTop.push({ member: topMembri[i], score: parseInt(topMembri[i+1]) });
        }

        return NextResponse.json({ 
          success: true, 
          details: { id: teamId, nume: teamName, ...teamData },
          top: formattedTop 
        });

      /**
       * PROTOCOL: CREEAZĂ ECHIPĂ
       */
      case 'creeaza-echipa':
        const newTeamId = `clan_${Math.random().toString(36).substring(2, 9)}`;
        await redis.set(`team:${newTeamId}:nume`, `${creator?.toUpperCase() || 'JUCĂTOR'} ELITE`);
        await redis.hset(`team:${newTeamId}:stats`, {
          creator: creator || 'Anonim',
          data_creare: Date.now(),
          victorii: 0,
          xp_total: 0
        });
        await redis.zadd(`team:${newTeamId}:membri`, 0, creator || 'Anonim');
        
        return NextResponse.json({ success: true, teamId: newTeamId });

      /**
       * PROTOCOL: REDENUMESTE ECHIPĂ
       */
      case 'redenumeste-echipa':
        if (newName && newName.length >= 3) {
          await redis.set(`team:${teamId}:nume`, newName);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false, message: "Invalid Name Identity" });

      default:
        return NextResponse.json({ success: false, error: "Action Not Found in Neural Core" }, { status: 400 });
    }
  } catch (error) {
    console.error("CRITICAL SERVER ERROR (SANCTUARY DOWN):", error);
    return NextResponse.json({ success: false, error: "Internal Infrastructure Failure" }, { status: 500 });
  }
}