import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import redis from '@/app/lib/redis';

/**
 * ====================================================================================================
 * CIOCNIM.RO - API ENDPOINT (V30.5 - SEPARARE GRUPURI & INCREMENTARE SINGULARĂ)
 * ====================================================================================================
 */

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  host: process.env.PUSHER_HOST || '161.35.201.178',
  port: parseInt(process.env.PUSHER_PORT || '6001'),
  useTLS: false,
});

async function getClasamentRegiuni() {
  try {
    const raw = await redis.zrevrange('leaderboard_regiuni', 0, -1, 'WITHSCORES');
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ regiune: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch (e) { return []; }
}

async function getClasamentJucatori() {
  try {
    const raw = await redis.zrevrange('leaderboard_jucatori', 0, 9, 'WITHSCORES'); // Top 10
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ nume: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch (e) { return []; }
}

// Protejăm numele sistemului
const NUME_INTERZISE = ["BOT", "SISTEM", "ADMIN", "ANONIM"];

// Filtru poreclă
const CUVINTE_INTERZISE_SERVER = ['pula','pule','pulica','pulete','pulamea','pularie','pizda','pizdi','pizdica','muie','muist','muista','sugi','sugipula','sugio','fut','fute','futut','fututi','futuma','coaie','coaiele','cur','curu','curul','morti','mortii','cacat','labagiu'];
function _norm(s) { return s.toLowerCase().replace(/@/g,'a').replace(/0/g,'o').replace(/1/g,'i').replace(/7/g,'t').replace(/9/g,'g').replace(/[_\-\s\.]/g,''); }
function esteNumeInterzisServer(name) { const n=_norm(name); const nv=n.replace(/v/g,'u'); const noo=nv.replace(/oo/g,'u'); return CUVINTE_INTERZISE_SERVER.some(w=>n.includes(w)||nv.includes(w)||noo.includes(w)); }

// SISTEM DE ACHIEVEMENT-URI
const ACHIEVEMENTS = {
  'first_win': { name: 'Prima Victorie', desc: 'Câștigă primul meci', icon: '🏆', rarity: 'common' },
  'wins_10': { name: 'Ciocnitor Amator', desc: 'Câștigă 10 meciuri', icon: '🥇', rarity: 'common' },
  'wins_50': { name: 'Ciocnitor Experimentat', desc: 'Câștigă 50 meciuri', icon: '🥈', rarity: 'uncommon' },
  'wins_100': { name: 'Maestru al Ouălor', desc: 'Câștigă 100 meciuri', icon: '🥉', rarity: 'rare' },
  'wins_500': { name: 'Legendă Vie', desc: 'Câștigă 500 meciuri', icon: '👑', rarity: 'epic' },
  'wins_1000': { name: 'Zeul Ciocnitului', desc: 'Câștigă 1000 meciuri', icon: '⚡', rarity: 'legendary' },
  'first_group': { name: 'Prieten Bun', desc: 'Joacă primul meci în grup', icon: '👥', rarity: 'common' },
  'group_wins_25': { name: 'Eroul Grupului', desc: 'Câștigă 25 meciuri în grup', icon: '🛡️', rarity: 'uncommon' },
  'regional_champion': { name: 'Campion Regional', desc: 'Ajunge pe primul loc în regiunea ta', icon: '🏅', rarity: 'rare' },
  'golden_egg': { name: 'Ou de Aur', desc: 'Folosește un ou auriu în meci', icon: '🥚', rarity: 'rare' },
  'chat_master': { name: 'Maestru al Vorbei', desc: 'Trimite 100 de mesaje în chat', icon: '💬', rarity: 'uncommon' },
  'streak_5': { name: 'Fără Pauză', desc: 'Câștigă 5 meciuri consecutive', icon: '🔥', rarity: 'uncommon' },
  'streak_10': { name: 'Flamă Vie', desc: 'Câștigă 10 meciuri consecutive', icon: '🌟', rarity: 'rare' },
  'provocator': { name: 'Provocatorul', desc: 'Provoacă 50 de jucători la duel', icon: '⚔️', rarity: 'uncommon' },
  'tradition_keeper': { name: 'Păstrător al Tradiției', desc: 'Vizitează toate paginile educaționale', icon: '📚', rarity: 'rare' },
  'social_butterfly': { name: 'Fluture Social', desc: 'Adaugă 10 prieteni', icon: '🦋', rarity: 'uncommon' }
};

async function checkAndAwardAchievements(jucator, stats, teamId = null) {
  const achievementsToAward = [];
  const userKey = `user:${jucator}:achievements`;
  const existingAchievements = await redis.smembers(userKey);
  
  // Prima victorie
  if (stats.wins >= 1 && !existingAchievements.includes('first_win')) {
    achievementsToAward.push('first_win');
  }
  
  // Victoriile cumulative
  const winMilestones = [10, 50, 100, 500, 1000];
  for (const milestone of winMilestones) {
    const achKey = `wins_${milestone}`;
    if (stats.wins >= milestone && !existingAchievements.includes(achKey)) {
      achievementsToAward.push(achKey);
    }
  }
  
  // Primul meci în grup
  if (teamId && !existingAchievements.includes('first_group')) {
    achievementsToAward.push('first_group');
  }
  
  // Victoriile în grup
  if (teamId && stats.teamWins >= 25 && !existingAchievements.includes('group_wins_25')) {
    achievementsToAward.push('group_wins_25');
  }
  
  // Ou auriu
  if (stats.goldenUsed && !existingAchievements.includes('golden_egg')) {
    achievementsToAward.push('golden_egg');
  }
  
  // Chat master
  if (stats.messagesSent >= 100 && !existingAchievements.includes('chat_master')) {
    achievementsToAward.push('chat_master');
  }
  
  // Streak
  if (stats.currentStreak >= 5 && !existingAchievements.includes('streak_5')) {
    achievementsToAward.push('streak_5');
  }
  if (stats.currentStreak >= 10 && !existingAchievements.includes('streak_10')) {
    achievementsToAward.push('streak_10');
  }
  
  // Provocator
  if (stats.duelsSent >= 50 && !existingAchievements.includes('provocator')) {
    achievementsToAward.push('provocator');
  }
  
  // Adaugă achievement-urile noi
  if (achievementsToAward.length > 0) {
    await redis.sadd(userKey, ...achievementsToAward);
    
    // Trimite notificare în timp real
    await pusher.trigger(`user-notif-${jucator}`, 'achievement-unlocked', {
      achievements: achievementsToAward.map(key => ACHIEVEMENTS[key]),
      t: Date.now()
    });
  }
  
  return achievementsToAward;
}

async function updateUserStats(jucator, updates) {
  const userStatsKey = `user:${jucator}:stats`;
  const pipeline = redis.pipeline();
  
  for (const [field, value] of Object.entries(updates)) {
    if (typeof value === 'number') {
      pipeline.hincrby(userStatsKey, field, value);
    } else {
      pipeline.hset(userStatsKey, field, value);
    }
  }
  
  await pipeline.exec();
}

async function getUserStats(jucator) {
  const userStatsKey = `user:${jucator}:stats`;
  const stats = await redis.hgetall(userStatsKey);
  return {
    wins: parseInt(stats.wins) || 0,
    losses: parseInt(stats.losses) || 0,
    teamWins: parseInt(stats.teamWins) || 0,
    messagesSent: parseInt(stats.messagesSent) || 0,
    currentStreak: parseInt(stats.currentStreak) || 0,
    duelsSent: parseInt(stats.duelsSent) || 0,
    goldenUsed: stats.goldenUsed === 'true',
    regiune: stats.regiune || 'Muntenia'
  };
}

async function getUserAchievements(jucator) {
  const userKey = `user:${jucator}:achievements`;
  const earnedKeys = await redis.smembers(userKey);
  return earnedKeys.map(key => ({
    key,
    ...ACHIEVEMENTS[key],
    earned: true
  }));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      actiune, roomId, jucator, skin, isGolden, hasStar, 
      teamId, regiune, creator, text, newName, oponentNume,
      atacant, esteCastigator, oldName, teamIds
    } = body;

    switch (actiune) {
      
      case 'get-counter': {
        const [totalCount, topRegiuni, topJucatori] = await Promise.all([
          redis.get('global_ciocniri_total'),
          getClasamentRegiuni(),
          getClasamentJucatori()
        ]);
        return NextResponse.json({ success: true, total: parseInt(totalCount) || 0, topRegiuni, topJucatori });
      }

      case 'increment-global': {
        const pipeline = redis.pipeline();
        // Aici se contorizează DOAR faptul că a avut loc o lovitură globală pe site
        pipeline.incr('global_ciocniri_total');
        
        // Când frontend-ul trimite "jucator", înseamnă că ACEL jucător a CÂȘTIGAT meciul. Punct.
        // Serverul face doar +1, nu mai acceptă un număr precalculat din front-end care să o ia razna.
        if (jucator && jucator.trim() !== "") {
            const safeName = jucator.trim().toUpperCase();
            
            // +1 în clasamentul global
            pipeline.zincrby('leaderboard_jucatori', 1, safeName);

            // +1 în clasamentul regiunii (dacă jucătorul are regiune setată)
            if (regiune && regiune !== "Alege regiunea..." && regiune.trim() !== "") {
              pipeline.zincrby('leaderboard_regiuni', 1, regiune.trim());
            }

            // +1 DOAR în grupul în care se joacă meciul acum (dacă e cazul)
            if (teamId && teamId !== "null" && teamId !== "") {
                pipeline.zincrby(`team:${teamId}:membri`, 1, safeName);
            }
        }
        
        const safeName = jucator && jucator.trim() !== "" ? jucator.trim().toUpperCase() : null;

        // Runda 1: pipeline (scrieri) + leaderboard reads + user stats — toate în paralel
        const [results, topActualizat, topJucatoriActualizat, currentStats] = await Promise.all([
          pipeline.exec(),
          getClasamentRegiuni(),
          getClasamentJucatori(),
          safeName ? getUserStats(safeName) : Promise.resolve(null)
        ]);
        const noulTotal = results[0][1];

        // Runda 2: scrieri stats + pusher — în paralel între ele
        const updates = safeName && currentStats ? {
          wins: 1,
          currentStreak: esteCastigator ? currentStats.currentStreak + 1 : 0,
          ...(teamId ? { teamWins: 1 } : {})
        } : null;

        await Promise.all([
          pusher.trigger('global', 'update-complet', { total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat }),
          updates ? updateUserStats(safeName, updates).then(() => checkAndAwardAchievements(safeName, { ...currentStats, ...updates }, teamId)) : Promise.resolve()
        ]);

        const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
        if (teamIdStr && teamIdStr !== "null" && teamIdStr !== "") {
          await pusher.trigger(`team-${teamIdStr}`, 'team-update', { t: Date.now() });
        }

        return NextResponse.json({ success: true, total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat });
      }

      case 'join': {
        const cleanName = jucator.trim().toUpperCase();
        // Tracking jucători per cameră (max 2)
        if (roomId.startsWith('privat-')) {
          const playerSetKey = `room:${roomId}:players`;
          const added = await redis.sadd(playerSetKey, cleanName);
          await redis.expire(playerSetKey, 7200);
          if (added === 1) {
            const count = await redis.scard(playerSetKey);
            if (count > 2) {
              await redis.srem(playerSetKey, cleanName);
              return NextResponse.json({ success: false, error: "Camera este ocupată!" });
            }
          }
        }
        await pusher.trigger(`arena-v22-${roomId}`, 'join', {
          jucator: cleanName, skin, isGolden, hasStar, regiune, isHost: body.isHost, t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'check-room': {
        const cod = body.cod;
        if (!cod) return NextResponse.json({ success: false, error: "Cod lipsă" });
        const count = await redis.scard(`room:privat-${cod}:players`);
        if (count >= 2) return NextResponse.json({ success: false, error: "Camera este ocupată! Încearcă alt cod." });
        return NextResponse.json({ success: true });
      }

      case 'lovitura': {
        const castigaCelCareDa = body.castigaCelCareDa !== undefined ? body.castigaCelCareDa : Math.random() < 0.5;
        // Lovitura = sincronizare pură în arenă. Contorul crește EXCLUSIV prin increment-global (o singură dată, de la câștigător sau de la cel care pierde cu bot).
        await pusher.trigger(`arena-v22-${roomId}`, 'lovitura', {
          jucator: jucator.trim().toUpperCase(), castigaCelCareDa, atacant: atacant.trim().toUpperCase(), t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'arena-chat': {
        if (!text || text.trim() === "") return NextResponse.json({ success: false });
        await pusher.trigger(`arena-v22-${roomId}`, 'arena-chat', {
          jucator: jucator.trim().toUpperCase(), text: text.trim(), t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'revansa': {
        await pusher.trigger(`arena-v22-${roomId}`, 'revansa', { jucator: jucator.trim().toUpperCase(), t: Date.now() });
        return NextResponse.json({ success: true });
      }

      case 'revansa-ok': {
        await pusher.trigger(`arena-v22-${roomId}`, 'revansa-ok', { t: Date.now() });
        return NextResponse.json({ success: true });
      }

      case 'get-achievements': {
        const achievements = await getUserAchievements(jucator);
        return NextResponse.json({ success: true, achievements });
      }

      case 'update-stats': {
        const updates = {};
        if (text === 'message') updates.messagesSent = 1;
        if (text === 'duel') updates.duelsSent = 1;
        if (text === 'golden') updates.goldenUsed = true;
        
        if (Object.keys(updates).length > 0) {
          await updateUserStats(jucator, updates);
          const stats = await getUserStats(jucator);
          await checkAndAwardAchievements(jucator, stats);
        }
        return NextResponse.json({ success: true });
      }

      case 'provocare-duel': {
        if (!oponentNume || !jucator || !roomId) {
          return NextResponse.json({ success: false, error: "Date incomplete" });
        }
        await pusher.trigger(`user-notif-${oponentNume.trim().toUpperCase()}`, 'duel-request', {
          deLa: jucator.trim().toUpperCase(), roomId: roomId, teamId: teamId || null, t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'schimba-porecla': {
        if (!newName || newName.trim().length < 3) {
            return NextResponse.json({ success: false, error: "Nume prea scurt" });
        }

        const newClean = newName.trim().toUpperCase();
        const oldClean = oldName ? oldName.trim().toUpperCase() : null;

        if (NUME_INTERZISE.includes(newClean)) {
            return NextResponse.json({ success: false, error: "Acest nume este rezervat de sistem." });
        }

        if (esteNumeInterzisServer(newClean) || newClean.length > 21) {
            return NextResponse.json({ success: false, error: "Ai chef de glume? Alege alt nume 😅" });
        }

        const isTaken = await redis.get(`nume_rezervat:${newClean}`);
        if (isTaken && isTaken !== oldClean) {
            return NextResponse.json({ success: false, error: "Acest nume este deja luat de alt jucător!" });
        }

        // Citim toate scorurile în paralel înainte de a construi pipeline-ul
        const hasTeams = oldClean && oldClean !== newClean && teamIds && Array.isArray(teamIds) && teamIds.length > 0;
        const [globalScore, ...teamScores] = (oldClean && oldClean !== newClean)
          ? await Promise.all([
              redis.zscore('leaderboard_jucatori', oldClean),
              ...(hasTeams ? teamIds.map(tId => redis.zscore(`team:${tId}:membri`, oldClean)) : [])
            ])
          : [null];

        const pipeline = redis.pipeline();
        pipeline.set(`nume_rezervat:${newClean}`, "1");

        // CLEAN-UP PERFECT (Fără duplicate în grupuri și topuri)
        if (oldClean && oldClean !== newClean) {
            pipeline.del(`nume_rezervat:${oldClean}`);
            pipeline.zrem('leaderboard_jucatori', oldClean);
            if (globalScore !== null) {
               pipeline.zadd('leaderboard_jucatori', parseFloat(globalScore), newClean);
            }

            if (hasTeams) {
                teamIds.forEach((tId, i) => {
                    pipeline.zrem(`team:${tId}:membri`, oldClean);
                    pipeline.zadd(`team:${tId}:membri`, teamScores[i] !== null ? parseFloat(teamScores[i]) : 0, newClean);
                });
            }
        }

        await pipeline.exec();

        const topJucatoriActualizat = await getClasamentJucatori();
        await pusher.trigger('global', 'update-complet', { topJucatori: topJucatoriActualizat });

        return NextResponse.json({ success: true });
      }

      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false, error: "Lipsește ID" });
        const teamName = await redis.get(`team:${teamId}:nume`);
        if (!teamName) return NextResponse.json({ success: false, error: "Grup inexistent" });
        
        const teamStats = await redis.hgetall(`team:${teamId}:stats`);
        
        // Dacă jucătorul a intrat pe link-ul de grup, îi forțăm scorul pe 0 (nu aducem cel global)
        if (jucator && jucator.trim().length >= 3) {
          const cleanPlayer = jucator.trim().toUpperCase();
          const exists = await redis.zscore(`team:${teamId}:membri`, cleanPlayer);
          if (exists === null) {
             await redis.zadd(`team:${teamId}:membri`, 0, cleanPlayer);
             await pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() });
          }
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
        const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const cleanCreator = creator.trim().toUpperCase();
        const finalTeamName = `GRUPUL LUI ${cleanCreator}`;
        
        const pipeline = redis.pipeline();
        pipeline.set(`team:${newId}:nume`, finalTeamName);
        pipeline.hset(`team:${newId}:stats`, { creator: cleanCreator, victorii: 0, creat_la: Date.now() });
        // Scorul pornește de la ZERO curat
        pipeline.zadd(`team:${newId}:membri`, 0, cleanCreator); 
        await pipeline.exec();
        
        return NextResponse.json({ success: true, teamId: newId });
      }

      case 'redenumeste-echipa': {
        if (teamId && newName && newName.trim().length >= 3) {
          const teamStats = await redis.hgetall(`team:${teamId}:stats`);
          if (teamStats.creator && jucator && teamStats.creator !== jucator.trim().toUpperCase()) {
            return NextResponse.json({ success: false, error: "Doar creatorul poate redenumi grupul." });
          }
          await redis.set(`team:${teamId}:nume`, newName.toUpperCase().trim());
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: false });
      }

      case 'kick-member': {
        const memberToKick = body.member;
        if (!teamId || !memberToKick) return NextResponse.json({ success: false, error: "Date incomplete" });
        const teamStats = await redis.hgetall(`team:${teamId}:stats`);
        if (!teamStats.creator || !jucator || teamStats.creator !== jucator.trim().toUpperCase()) {
          return NextResponse.json({ success: false, error: "Doar creatorul poate elimina membri." });
        }
        await redis.zrem(`team:${teamId}:membri`, memberToKick.trim().toUpperCase());
        await pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() });
        return NextResponse.json({ success: true });
      }

      case 'arena-matchmaking': {
        const now = Date.now();
        // Curăță intrările vechi (>12s) din coadă
        await redis.zremrangebyscore('arena:queue', 0, now - 12000);
        // Încearcă să găsească o cameră care așteaptă
        const waiting = await redis.zpopmin('arena:queue', 1);
        if (waiting && waiting.length >= 1) {
          const foundRoom = waiting[0];
          return NextResponse.json({ success: true, roomId: foundRoom, isHost: false });
        }
        // Nu e nimeni — creăm camera și așteptăm
        const newRoomId = `arena-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await redis.zadd('arena:queue', now, newRoomId);
        return NextResponse.json({ success: true, roomId: newRoomId, isHost: true });
      }

      case 'arena-cancel-matchmaking': {
        if (roomId) await redis.zrem('arena:queue', roomId);
        return NextResponse.json({ success: true });
      }

      case 'arena-heartbeat': {
        const visitorId = body.visitorId;
        if (!visitorId) return NextResponse.json({ success: false });
        const now = Date.now();
        const pipeline = redis.pipeline();
        pipeline.zadd('arena:online', now, visitorId);
        pipeline.zremrangebyscore('arena:online', 0, now - 30000);
        pipeline.zcard('arena:online');
        const results = await pipeline.exec();
        const count = results[2][1];
        // Broadcast online count to all clients in real-time
        await pusher.trigger('global', 'online-count', { online: count });
        return NextResponse.json({ success: true, online: count });
      }

      case 'creeaza-camera-privata': {
        // Generăm un cod unic - reîncercăm dacă e deja rezervat
        let cod, attempts = 0;
        do {
          cod = Math.random().toString(36).substring(2, 6).toUpperCase();
          attempts++;
        } while (attempts < 20 && await redis.exists(`room:privat-${cod}`));
        await redis.setex(`room:privat-${cod}`, 7200, JSON.stringify({ status: 'waiting', t: Date.now() }));
        return NextResponse.json({ success: true, cod });
      }

      default:
        return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Error]:", error);
    return NextResponse.json({ success: false, error: "Eroare internă" }, { status: 500 });
  }
}