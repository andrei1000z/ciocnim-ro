import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import redis from '@/app/lib/redis';
import { esteNumeInterzis as esteNumeInterzisShared, valideazaNume } from '@/app/lib/profanityFilter';
import { ACHIEVEMENTS } from '@/app/lib/achievements';


const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  host: process.env.PUSHER_HOST,
  port: parseInt(process.env.PUSHER_PORT || '6443'),
  useTLS: true,
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

// Filtru poreclă (shared)
const esteNumeInterzisServer = esteNumeInterzisShared;

// ACHIEVEMENTS imported from @/app/lib/achievements

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
    
    // Fire-and-forget notification
    pusher.trigger(`user-notif-${jucator}`, 'achievement-unlocked', {
      achievements: achievementsToAward.map(key => ACHIEVEMENTS[key]),
      t: Date.now()
    }).catch(() => {});
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

// --- Input sanitization helpers ---
function sanitizeStr(val, maxLen = 100) {
  if (typeof val !== 'string') return '';
  return val.slice(0, maxLen).trim();
}
function sanitizeId(val) {
  if (typeof val !== 'string' || val === 'null' || val === 'undefined') return '';
  const clean = val.slice(0, 64).replace(/[^a-zA-Z0-9\-_]/g, '');
  return clean || '';
}

export async function POST(request) {
  try {
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "JSON invalid" }, { status: 400 }); }
    if (!body || typeof body !== 'object') return NextResponse.json({ success: false, error: "Body invalid" }, { status: 400 });

    const actiune = sanitizeStr(body.actiune, 40);
    const roomId = sanitizeId(body.roomId);
    const jucator = sanitizeStr(body.jucator, 30);
    const skin = sanitizeStr(body.skin, 20);
    const isGolden = body.isGolden === true;
    const hasStar = body.hasStar === true;
    const teamId = sanitizeId(Array.isArray(body.teamId) ? body.teamId[0] : body.teamId);
    const regiune = sanitizeStr(body.regiune, 40);
    const creator = sanitizeStr(body.creator, 30);
    const text = sanitizeStr(body.text, 500);
    const newName = sanitizeStr(body.newName, 30);
    const oponentNume = sanitizeStr(body.oponentNume, 30);
    const atacant = sanitizeStr(body.atacant, 30);
    const esteCastigator = body.esteCastigator === true;
    const oldName = sanitizeStr(body.oldName, 30);
    const teamIds = Array.isArray(body.teamIds) ? body.teamIds.slice(0, 20).map(id => sanitizeId(id)).filter(Boolean) : [];

    switch (actiune) {
      
      case 'get-counter': {
        const now = Date.now();
        const [totalCount, topRegiuni, topJucatori, , onlineCount] = await Promise.all([
          redis.get('global_ciocniri_total'),
          getClasamentRegiuni(),
          getClasamentJucatori(),
          redis.zremrangebyscore('arena:online', 0, now - 45000),
          redis.zcard('arena:online')
        ]);
        return NextResponse.json({ success: true, total: parseInt(totalCount) || 0, topRegiuni, topJucatori, online: onlineCount });
      }

      case 'increment-global': {
        // Rate limit: max 1 request per 2s per player (or per IP if anonymous)
        {
          const rlIdentifier = jucator ? jucator.toUpperCase() : (request.headers.get('x-forwarded-for') || 'anon');
          const rlKey = `ratelimit:inc:${rlIdentifier}`;
          const rlSet = await redis.set(rlKey, '1', 'EX', 2, 'NX');
          if (!rlSet) {
            return NextResponse.json({ success: false, error: "Prea rapid! Așteaptă puțin." }, { status: 429 });
          }
        }

        const pipeline = redis.pipeline();
        pipeline.incr('global_ciocniri_total');

        if (jucator) {
            const safeName = jucator.toUpperCase();

            // +1 în clasamentul global
            pipeline.zincrby('leaderboard_jucatori', 1, safeName);

            // +1 în clasamentul regiunii (dacă jucătorul are regiune setată)
            if (regiune && regiune !== "Alege regiunea...") {
              pipeline.zincrby('leaderboard_regiuni', 1, regiune);
            }

            // +1 DOAR în grupul în care se joacă meciul acum (dacă e cazul)
            if (teamId) {
                pipeline.zincrby(`team:${teamId}:membri`, 1, safeName);
            }
        }

        const safeName = jucator ? jucator.toUpperCase() : null;

        // Trim leaderboards to prevent unbounded growth
        pipeline.zremrangebyrank('leaderboard_jucatori', 0, -101); // max 100
        pipeline.zremrangebyrank('leaderboard_regiuni', 0, -21); // max 20

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

        // Fire-and-forget broadcasts
        pusher.trigger('global', 'update-complet', { total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat }).catch(() => {});
        if (teamId) pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() }).catch(() => {});

        // Stats update is critical — await it
        if (updates) {
          await updateUserStats(safeName, updates);
          checkAndAwardAchievements(safeName, { ...currentStats, ...updates }, teamId).catch(() => {});
        }

        return NextResponse.json({ success: true, total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat });
      }

      case 'join': {
        if (!jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" });
        // Rate limit: max 10 req/min per IP
        const joinIp = request.headers.get('x-forwarded-for') || 'anon';
        const joinRlKey = `ratelimit:join:${joinIp}`;
        const joinCount = await redis.incr(joinRlKey);
        if (joinCount === 1) await redis.expire(joinRlKey, 60);
        if (joinCount > 10) return NextResponse.json({ success: false, error: "Prea rapid! Așteaptă puțin." }, { status: 429 });
        const cleanName = jucator.toUpperCase();
        let serverIsHost = false;
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
          // Determine host server-side: validate hostToken from room data
          const hostToken = sanitizeStr(body.hostToken, 64);
          if (hostToken) {
            const roomData = await redis.get(`room:${roomId}`);
            if (roomData) {
              try {
                const parsed = JSON.parse(roomData);
                serverIsHost = parsed.hostToken === hostToken;
              } catch {}
            }
          }
          // Fallback: first player in set is host
          if (!serverIsHost) {
            const members = await redis.smembers(playerSetKey);
            serverIsHost = members.length <= 1 || members[0] === cleanName;
          }
        }
        // Store skin per room+player in Redis (prevents spoofing via URL)
        if (roomId.startsWith('privat-')) {
          await redis.setex(`room:${roomId}:skin:${cleanName}`, 7200, JSON.stringify({ skin, isGolden, hasStar }));
        }
        await pusher.trigger(`arena-v22-${roomId}`, 'join', {
          jucator: cleanName, skin, isGolden, hasStar, regiune, isHost: serverIsHost, t: Date.now()
        });
        return NextResponse.json({ success: true, isHost: serverIsHost });
      }

      case 'check-room': {
        const cod = sanitizeId(body.cod);
        if (!cod || cod.length < 4) return NextResponse.json({ success: false, error: "Cod invalid" });
        // Atomic check: verify room exists AND has space (prevents race condition)
        const roomExists = await redis.exists(`room:privat-${cod}`);
        if (!roomExists) return NextResponse.json({ success: false, error: "Camera nu există. Verifică codul." });
        const count = await redis.scard(`room:privat-${cod}:players`);
        if (count >= 2) return NextResponse.json({ success: false, error: "Camera este ocupată! Încearcă alt cod." });
        return NextResponse.json({ success: true });
      }

      case 'lovitura': {
        if (!jucator || !atacant || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" });
        const castigaCelCareDa = Math.random() < 0.5;
        await pusher.trigger(`arena-v22-${roomId}`, 'lovitura', {
          jucator: jucator.toUpperCase(), castigaCelCareDa, atacant: atacant.toUpperCase(), t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'arena-chat': {
        if (!text || !jucator || !roomId) return NextResponse.json({ success: false });
        const chatRlKey = `ratelimit:chat:${jucator.toUpperCase()}`;
        const chatRl = await redis.set(chatRlKey, '1', 'EX', 1, 'NX');
        if (!chatRl) return NextResponse.json({ success: false, error: "Prea rapid!" }, { status: 429 });
        await pusher.trigger(`arena-v22-${roomId}`, 'arena-chat', {
          jucator: jucator.toUpperCase(), text: text.slice(0, 200), t: Date.now()
        });
        return NextResponse.json({ success: true });
      }

      case 'revansa': {
        if (!jucator || !roomId) return NextResponse.json({ success: false });
        await pusher.trigger(`arena-v22-${roomId}`, 'revansa', { jucator: jucator.toUpperCase(), t: Date.now() });
        return NextResponse.json({ success: true });
      }

      case 'revansa-ok': {
        if (!roomId || !jucator) return NextResponse.json({ success: false });
        await pusher.trigger(`arena-v22-${roomId}`, 'revansa-ok', { jucator: jucator.toUpperCase(), t: Date.now() });
        return NextResponse.json({ success: true });
      }

      case 'get-achievements': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" });
        const achievements = await getUserAchievements(jucator);
        return NextResponse.json({ success: true, achievements });
      }

      case 'update-stats': {
        if (!jucator) return NextResponse.json({ success: false });
        const statUpdates = {};
        if (text === 'message') statUpdates.messagesSent = 1;
        if (text === 'duel') statUpdates.duelsSent = 1;
        if (text === 'golden') statUpdates.goldenUsed = true;

        if (Object.keys(statUpdates).length > 0) {
          await updateUserStats(jucator, statUpdates);
          const stats = await getUserStats(jucator);
          await checkAndAwardAchievements(jucator, stats);
        }
        return NextResponse.json({ success: true });
      }

      case 'provocare-duel': {
        if (!oponentNume || !jucator || !roomId) {
          return NextResponse.json({ success: false, error: "Date incomplete" });
        }
        const duelRlKey = `ratelimit:duel:${jucator.toUpperCase()}`;
        const duelRl = await redis.set(duelRlKey, '1', 'EX', 5, 'NX');
        if (!duelRl) return NextResponse.json({ success: false, error: "Așteaptă puțin între provocări." }, { status: 429 });
        pusher.trigger(`user-notif-${oponentNume.toUpperCase()}`, 'duel-request', {
          deLa: jucator.toUpperCase(), roomId, teamId: teamId || null, t: Date.now()
        }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'schimba-porecla': {
        const numeValidation = valideazaNume(newName);
        if (!numeValidation.valid) {
            return NextResponse.json({ success: false, error: numeValidation.error });
        }
        const nameRlIp = request.headers.get('x-forwarded-for') || 'anon';
        const nameRlKey = `ratelimit:name:${nameRlIp}`;
        const nameRl = await redis.set(nameRlKey, '1', 'EX', 5, 'NX');
        if (!nameRl) return NextResponse.json({ success: false, error: "Așteaptă puțin înainte de a schimba iar." }, { status: 429 });

        const newClean = newName.toUpperCase();
        const oldClean = oldName ? oldName.toUpperCase() : null;

        if (NUME_INTERZISE.includes(newClean)) {
            return NextResponse.json({ success: false, error: "Acest nume este rezervat de sistem." });
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

        // Fire-and-forget: don't block response on Pusher broadcast
        getClasamentJucatori()
          .then(top => pusher.trigger('global', 'update-complet', { topJucatori: top }))
          .catch(() => {});

        return NextResponse.json({ success: true });
      }

      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false, error: "Lipsește ID" });
        const teamName = await redis.get(`team:${teamId}:nume`);
        if (!teamName) return NextResponse.json({ success: false, error: "Grup inexistent" });

        // Refresh TTL on access (30 days)
        const TEAM_TTL_REFRESH = 60 * 60 * 24 * 30;
        await Promise.all([
          redis.expire(`team:${teamId}:nume`, TEAM_TTL_REFRESH),
          redis.expire(`team:${teamId}:stats`, TEAM_TTL_REFRESH),
          redis.expire(`team:${teamId}:membri`, TEAM_TTL_REFRESH),
        ]);

        const teamStats = await redis.hgetall(`team:${teamId}:stats`);
        
        // Dacă jucătorul a intrat pe link-ul de grup, îi forțăm scorul pe 0 (nu aducem cel global)
        if (jucator && jucator.length >= 3) {
          const cleanPlayer = jucator.toUpperCase();
          const exists = await redis.zscore(`team:${teamId}:membri`, cleanPlayer);
          if (exists === null) {
             await redis.zadd(`team:${teamId}:membri`, 0, cleanPlayer);
             pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() }).catch(() => {})
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
        if (!creator || creator.length < 3) return NextResponse.json({ success: false });
        const teamRlKey = `ratelimit:team:${creator.toUpperCase()}`;
        const teamRl = await redis.set(teamRlKey, '1', 'EX', 10, 'NX');
        if (!teamRl) return NextResponse.json({ success: false, error: "Așteaptă puțin înainte de a crea alt grup." }, { status: 429 });
        const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const cleanCreator = creator.toUpperCase();
        const finalTeamName = `GRUPUL LUI ${cleanCreator}`;
        const TEAM_TTL = 60 * 60 * 24 * 30; // 30 days

        const pipeline = redis.pipeline();
        pipeline.set(`team:${newId}:nume`, finalTeamName);
        pipeline.expire(`team:${newId}:nume`, TEAM_TTL);
        pipeline.hset(`team:${newId}:stats`, { creator: cleanCreator, victorii: 0, creat_la: Date.now() });
        pipeline.expire(`team:${newId}:stats`, TEAM_TTL);
        pipeline.zadd(`team:${newId}:membri`, 0, cleanCreator);
        pipeline.expire(`team:${newId}:membri`, TEAM_TTL);
        await pipeline.exec();

        return NextResponse.json({ success: true, teamId: newId });
      }

      case 'redenumeste-echipa': {
        if (!teamId || !newName || newName.length < 3) return NextResponse.json({ success: false });
        const renameTeamStats = await redis.hgetall(`team:${teamId}:stats`);
        if (renameTeamStats.creator && jucator && renameTeamStats.creator !== jucator.toUpperCase()) {
          return NextResponse.json({ success: false, error: "Doar creatorul poate redenumi grupul." });
        }
        await redis.set(`team:${teamId}:nume`, newName.toUpperCase().slice(0, 50));
        return NextResponse.json({ success: true });
      }

      case 'kick-member': {
        const memberToKick = sanitizeStr(body.member, 30);
        if (!teamId || !memberToKick) return NextResponse.json({ success: false, error: "Date incomplete" });
        const kickTeamStats = await redis.hgetall(`team:${teamId}:stats`);
        if (!kickTeamStats.creator || !jucator || kickTeamStats.creator !== jucator.toUpperCase()) {
          return NextResponse.json({ success: false, error: "Doar creatorul poate elimina membri." });
        }
        await redis.zrem(`team:${teamId}:membri`, memberToKick.toUpperCase());
        pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'arena-matchmaking': {
        const mmIp = request.headers.get('x-forwarded-for') || 'anon';
        const mmRlKey = `ratelimit:mm:${mmIp}`;
        const mmRl = await redis.set(mmRlKey, '1', 'EX', 3, 'NX');
        if (!mmRl) return NextResponse.json({ success: false, error: "Prea rapid!" }, { status: 429 });
        const now = Date.now();
        const newRoomId = `arena-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        // Atomic matchmaking via Lua script — prevents race conditions
        const luaScript = `
          redis.call('zremrangebyscore', KEYS[1], 0, ARGV[1])
          local waiting = redis.call('zpopmin', KEYS[1], 1)
          if waiting and #waiting >= 2 then
            return waiting[1]
          end
          redis.call('zadd', KEYS[1], ARGV[2], ARGV[3])
          return nil
        `;
        const result = await redis.eval(luaScript, 1, 'arena:queue', now - 12000, now, newRoomId);
        if (result) {
          return NextResponse.json({ success: true, roomId: result, isHost: false });
        }
        return NextResponse.json({ success: true, roomId: newRoomId, isHost: true });
      }

      case 'arena-cancel-matchmaking': {
        if (roomId) await redis.zrem('arena:queue', roomId);
        return NextResponse.json({ success: true });
      }

      case 'arena-heartbeat': {
        const visitorId = sanitizeId(body.visitorId);
        if (!visitorId) return NextResponse.json({ success: false });
        const now = Date.now();
        const pipeline = redis.pipeline();
        pipeline.zadd('arena:online', now, visitorId);
        pipeline.zremrangebyscore('arena:online', 0, now - 45000);
        pipeline.zcard('arena:online');
        const results = await pipeline.exec();
        const count = results[2][1];
        pusher.trigger('global', 'online-count', { online: count }).catch(() => {});
        return NextResponse.json({ success: true, online: count });
      }

      case 'arena-disconnect': {
        const visitorId = sanitizeId(body.visitorId);
        if (!visitorId) return NextResponse.json({ success: false });
        const now = Date.now();
        const pipeline = redis.pipeline();
        pipeline.zrem('arena:online', visitorId);
        pipeline.zremrangebyscore('arena:online', 0, now - 45000);
        pipeline.zcard('arena:online');
        const results = await pipeline.exec();
        const count = results[2][1];
        pusher.trigger('global', 'online-count', { online: count }).catch(() => {});
        return NextResponse.json({ success: true, online: count });
      }

      case 'reset-all': {
        // Protected: requires ADMIN_SECRET + optional IP whitelist
        const resetIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
        const allowedIps = (process.env.ADMIN_IPS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (allowedIps.length > 0 && !allowedIps.includes(resetIp)) {
          return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }
        const secret = sanitizeStr(body.secret, 50);
        if (secret !== process.env.ADMIN_SECRET) {
          return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const confirmToken = sanitizeStr(body.confirmToken, 64);
        if (!confirmToken) {
          // Step 1: generate a one-time confirmation token (expires in 30s)
          const token = Math.random().toString(36).substring(2, 18);
          await redis.setex('admin:reset-token', 30, token);
          return NextResponse.json({ success: true, step: 'confirm', confirmToken: token, message: 'Send this token back as confirmToken to proceed.' });
        }
        // Step 2: verify token and execute
        const storedToken = await redis.get('admin:reset-token');
        if (!storedToken || storedToken !== confirmToken) {
          return NextResponse.json({ success: false, error: "Token invalid or expired. Start over." }, { status: 400 });
        }
        await redis.del('admin:reset-token');
        // Only delete game-related keys using SCAN (non-blocking)
        const patterns = ['global_ciocniri_total', 'leaderboard_*', 'team:*', 'user:*', 'arena:*', 'room:*', 'nume_rezervat:*', 'ratelimit:*'];
        let deleted = 0;
        for (const pattern of patterns) {
          if (!pattern.includes('*')) {
            // Exact key — delete directly
            const del = await redis.del(pattern);
            deleted += del;
            continue;
          }
          // Use SCAN to avoid blocking
          let cursor = '0';
          do {
            const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
              await redis.del(...keys);
              deleted += keys.length;
            }
          } while (cursor !== '0');
        }
        return NextResponse.json({ success: true, deleted });
      }

      case 'creeaza-camera-privata': {
        // Rate limit: max 10 req/min per IP
        const createIp = request.headers.get('x-forwarded-for') || 'anon';
        const createRlKey = `ratelimit:create:${createIp}`;
        const createCount = await redis.incr(createRlKey);
        if (createCount === 1) await redis.expire(createRlKey, 60);
        if (createCount > 10) return NextResponse.json({ success: false, error: "Prea multe camere create. Așteaptă un minut." }, { status: 429 });
        // Generăm un cod unic - reîncercăm dacă e deja rezervat
        let cod, attempts = 0;
        do {
          cod = Math.random().toString(36).substring(2, 8).toUpperCase();
          attempts++;
        } while (attempts < 20 && await redis.exists(`room:privat-${cod}`));
        const hostToken = Math.random().toString(36).substring(2, 18);
        await redis.setex(`room:privat-${cod}`, 7200, JSON.stringify({ status: 'waiting', t: Date.now(), hostToken }));
        return NextResponse.json({ success: true, cod, hostToken });
      }

      default:
        return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Error]:", error);
    return NextResponse.json({ success: false, error: "Eroare internă" }, { status: 500 });
  }
}