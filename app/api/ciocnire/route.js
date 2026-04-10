import { NextResponse } from 'next/server';
import { timingSafeEqual, randomBytes } from 'crypto';
import redis from '@/app/lib/redis';
import { esteNumeInterzis, valideazaNume } from '@/app/lib/profanityFilter';
import pusher from './pusher';
import { sanitizeStr, sanitizeId, checkRateLimit, getClientIp, NUME_INTERZISE } from './utils';
import {
  getClasamentRegiuni, getClasamentJucatori,
  getUserStats, updateUserStats, getUserAchievements, checkAndAwardAchievements,
} from './stats';

export async function POST(request) {
  try {
    const origin = request.headers.get('origin');
    const allowedOrigins = ['https://ciocnim.ro', 'https://www.ciocnim.ro', 'https://trosc.fun', 'https://www.trosc.fun', 'http://localhost:3000'];
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

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
    const oldName = sanitizeStr(body.oldName, 30);
    const teamIds = Array.isArray(body.teamIds) ? body.teamIds.slice(0, 20).map(id => sanitizeId(id)).filter(Boolean) : [];

    // Rate limiting
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, actiune);
    if (!allowed) return NextResponse.json({ success: false, error: "Prea multe cereri. Așteaptă puțin." }, { status: 429 });

    switch (actiune) {

      // ── Leaderboard & counters ───────────────────────────────────────────────

      case 'get-counter': {
        const now = Date.now();
        const [totalCount, topRegiuni, topJucatori, , onlineCount] = await Promise.all([
          redis.get('global_ciocniri_total'),
          getClasamentRegiuni(),
          getClasamentJucatori(),
          redis.zremrangebyscore('arena:online', 0, now - 300000),
          redis.zcard('arena:online'),
        ]);
        return NextResponse.json({ success: true, total: parseInt(totalCount) || 0, topRegiuni, topJucatori, online: onlineCount });
      }

      case 'increment-global': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        const rlIdentifier = jucator ? jucator.toUpperCase() : getClientIp(request);
        const rlKey = `ratelimit:inc:${rlIdentifier}`;
        const rlSet = await redis.set(rlKey, '1', 'EX', 2, 'NX');
        if (!rlSet) return NextResponse.json({ success: false, error: "Prea rapid! Așteaptă puțin." }, { status: 429 });

        // Derive esteCastigator server-side from the lovitura stored in Redis
        let serverEsteCastigator = false;
        const safeName = jucator ? jucator.toUpperCase() : null;
        if (safeName) {
          const lovituraRaw = await redis.get(`room:${roomId}:lovitura`);
          if (lovituraRaw) {
            try {
              const lovituraData = JSON.parse(lovituraRaw);
              const esteAtacant = lovituraData.atacant === safeName;
              serverEsteCastigator = esteAtacant ? lovituraData.castigaCelCareDa : !lovituraData.castigaCelCareDa;
            } catch {}
          }
        }

        const pipeline = redis.pipeline();
        pipeline.incr('global_ciocniri_total');
        if (safeName && serverEsteCastigator) {
          pipeline.zincrby('leaderboard_jucatori', 1, safeName);
          if (regiune && regiune !== "Alege regiunea...") pipeline.zincrby('leaderboard_regiuni', 1, regiune);
          if (teamId) pipeline.zincrby(`team:${teamId}:membri`, 1, safeName);
        }
        pipeline.zremrangebyrank('leaderboard_jucatori', 0, -21);
        pipeline.zremrangebyrank('leaderboard_regiuni', 0, -21);

        const [results, topActualizat, topJucatoriActualizat, currentStats] = await Promise.all([
          pipeline.exec(),
          getClasamentRegiuni(),
          getClasamentJucatori(),
          safeName ? getUserStats(safeName) : Promise.resolve(null),
        ]);
        const noulTotal = results[0][1];

        pusher.trigger('global', 'update-complet', { total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat }).catch(() => {});
        if (teamId) pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() }).catch(() => {});

        if (safeName && currentStats) {
          const updates = serverEsteCastigator
            ? { wins: 1, currentStreak: String(parseInt(currentStats.currentStreak) + 1), ...(teamId ? { teamWins: 1 } : {}) }
            : { losses: 1, currentStreak: '0' };
          await updateUserStats(safeName, updates);
          const newStats = serverEsteCastigator
            ? { ...currentStats, wins: currentStats.wins + 1, currentStreak: currentStats.currentStreak + 1, ...(teamId ? { teamWins: (currentStats.teamWins || 0) + 1 } : {}) }
            : { ...currentStats, losses: currentStats.losses + 1, currentStreak: 0 };
          checkAndAwardAchievements(safeName, newStats, teamId).catch(() => {});
        }

        return NextResponse.json({ success: true, total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat });
      }

      // ── Room management ──────────────────────────────────────────────────────

      case 'join': {
        if (!jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const joinIp = getClientIp(request);
        const joinRlKey = `ratelimit:join:${joinIp}`;
        const joinCount = await redis.incr(joinRlKey);
        if (joinCount === 1) await redis.expire(joinRlKey, 60);
        if (joinCount > 10) return NextResponse.json({ success: false, error: "Prea rapid! Așteaptă puțin." }, { status: 429 });

        const cleanName = jucator.toUpperCase();
        let serverIsHost = false;
        const playerSetKey = `room:${roomId}:players`;
        const added = await redis.sadd(playerSetKey, cleanName);
        await redis.expire(playerSetKey, 7200);
        if (added === 1) {
          const count = await redis.scard(playerSetKey);
          if (count > 2) {
            await redis.srem(playerSetKey, cleanName);
            return NextResponse.json({ success: false, error: "Camera este ocupată!" }, { status: 409 });
          }
        }
        await redis.setex(`room:${roomId}:skin:${cleanName}`, 7200, JSON.stringify({ skin, isGolden, hasStar, regiune }));

        if (roomId.startsWith('privat-')) {
          const hostToken = sanitizeStr(body.hostToken, 64);
          if (hostToken) {
            const roomData = await redis.get(`room:${roomId}`);
            if (roomData) {
              try { serverIsHost = JSON.parse(roomData).hostToken === hostToken; } catch {}
            }
          }
          if (!serverIsHost) {
            const members = await redis.smembers(playerSetKey);
            serverIsHost = members.length <= 1 || members[0] === cleanName;
          }
        }
        pusher.trigger(`arena-v22-${roomId}`, 'join', { jucator: cleanName, skin, isGolden, hasStar, regiune, isHost: serverIsHost, t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true, isHost: serverIsHost });
      }

      case 'check-room': {
        const cod = sanitizeId(body.cod);
        if (!cod || cod.length < 4 || cod.length > 6) return NextResponse.json({ success: false, error: "Cod invalid" }, { status: 400 });
        const [roomExists, count] = await Promise.all([
          redis.exists(`room:privat-${cod}`),
          redis.scard(`room:privat-${cod}:players`),
        ]);
        if (!roomExists && count === 0) return NextResponse.json({ success: false, error: "Camera nu există. Verifică codul." }, { status: 404 });
        if (count >= 2) return NextResponse.json({ success: false, error: "Camera este ocupată! Încearcă alt cod." }, { status: 409 });
        return NextResponse.json({ success: true });
      }

      case 'get-room-players': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        const players = await redis.smembers(`room:${roomId}:players`);
        const skinData = {};
        await Promise.all(players.map(async (p) => {
          const raw = await redis.get(`room:${roomId}:skin:${p}`);
          if (raw) { try { skinData[p] = JSON.parse(raw); } catch {} }
        }));
        return NextResponse.json({ success: true, players, skinData });
      }

      case 'get-room-lovitura': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        const raw = await redis.get(`room:${roomId}:lovitura`);
        if (!raw) return NextResponse.json({ success: true, lovitura: null });
        try { return NextResponse.json({ success: true, lovitura: JSON.parse(raw) }); }
        catch { return NextResponse.json({ success: true, lovitura: null }); }
      }

      case 'lovitura': {
        if (!jucator || !atacant || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const castigaCelCareDa = Math.random() < 0.5;
        const lovituraData = { jucator: jucator.toUpperCase(), castigaCelCareDa, atacant: atacant.toUpperCase(), t: Date.now() };
        redis.setex(`room:${roomId}:lovitura`, 120, JSON.stringify(lovituraData)).catch(() => {});
        pusher.trigger(`arena-v22-${roomId}`, 'lovitura', lovituraData).catch(() => {});
        return NextResponse.json({ success: true, castigaCelCareDa });
      }

      case 'arena-chat': {
        if (!text || !jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const chatRlKey = `ratelimit:chat:${jucator.toUpperCase()}`;
        const chatRl = await redis.set(chatRlKey, '1', 'EX', 1, 'NX');
        if (!chatRl) return NextResponse.json({ success: false, error: "Prea rapid!" }, { status: 429 });
        pusher.trigger(`arena-v22-${roomId}`, 'arena-chat', { jucator: jucator.toUpperCase(), text: text.trim().slice(0, 200), t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'revansa': {
        if (!jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const revRlKey = `ratelimit:rev:${jucator.toUpperCase()}`;
        const revRl = await redis.set(revRlKey, '1', 'EX', 2, 'NX');
        if (!revRl) return NextResponse.json({ success: false, error: "Prea rapid!" }, { status: 429 });
        const revClean = jucator.toUpperCase();
        await redis.sadd(`room:${roomId}:revansa`, revClean);
        await redis.expire(`room:${roomId}:revansa`, 300);
        const revCount = await redis.scard(`room:${roomId}:revansa`);
        pusher.trigger(`arena-v22-${roomId}`, 'revansa', { jucator: revClean, t: Date.now() }).catch(() => {});
        if (revCount >= 2) {
          redis.del(`room:${roomId}:revansa`).catch(() => {});
          redis.del(`room:${roomId}:lovitura`).catch(() => {});
          redis.setex(`room:${roomId}:revansa-ok`, 60, '1').catch(() => {});
          pusher.trigger(`arena-v22-${roomId}`, 'revansa-ok', { t: Date.now() }).catch(() => {});
          return NextResponse.json({ success: true, revansaOk: true });
        }
        return NextResponse.json({ success: true, revansaOk: false, count: revCount });
      }

      case 'clear-round': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        redis.del(`room:${roomId}:revansa-ok`, `room:${roomId}:lovitura`, `room:${roomId}:revansa`).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'revansa-ok': {
        if (!roomId || !jucator) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        redis.del(`room:${roomId}:revansa`, `room:${roomId}:lovitura`).catch(() => {});
        redis.setex(`room:${roomId}:revansa-ok`, 60, '1').catch(() => {});
        pusher.trigger(`arena-v22-${roomId}`, 'revansa-ok', { jucator: jucator.toUpperCase(), t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'get-room-revansa': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        const [revPlayers, revOkFlag] = await Promise.all([
          redis.smembers(`room:${roomId}:revansa`),
          redis.get(`room:${roomId}:revansa-ok`),
        ]);
        if (revOkFlag) redis.del(`room:${roomId}:revansa-ok`, `room:${roomId}:lovitura`).catch(() => {});
        return NextResponse.json({ success: true, players: revPlayers, revansaOk: !!revOkFlag });
      }

      case 'creeaza-camera-privata': {
        const createIp = getClientIp(request);
        const createRlKey = `ratelimit:create:${createIp}`;
        const createCount = await redis.incr(createRlKey);
        if (createCount === 1) await redis.expire(createRlKey, 60);
        if (createCount > 10) return NextResponse.json({ success: false, error: "Prea multe camere create. Așteaptă un minut." }, { status: 429 });
        const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let cod, attempts = 0;
        do {
          cod = '';
          for (let i = 0; i < 4; i++) cod += CHARS[Math.floor(Math.random() * CHARS.length)];
          attempts++;
        } while (attempts < 20 && await redis.exists(`room:privat-${cod}`));
        const hostToken = randomBytes(16).toString('hex');
        await redis.setex(`room:privat-${cod}`, 7200, JSON.stringify({ status: 'waiting', t: Date.now(), hostToken }));
        return NextResponse.json({ success: true, cod, hostToken });
      }

      // ── User stats & achievements ────────────────────────────────────────────

      case 'get-achievements': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        const achievements = await getUserAchievements(jucator);
        return NextResponse.json({ success: true, achievements });
      }

      case 'get-user-stats': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        const cleanPlayer = jucator.toUpperCase();
        const [stats, globalScore] = await Promise.all([
          getUserStats(cleanPlayer),
          redis.zscore('leaderboard_jucatori', cleanPlayer),
        ]);
        return NextResponse.json({ success: true, stats: { ...stats, globalScore: parseInt(globalScore) || 0 } });
      }

      case 'update-stats': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        const statUpdates = {};
        if (text === 'message') statUpdates.messagesSent = 1;
        if (text === 'duel') statUpdates.duelsSent = 1;
        if (text === 'golden') statUpdates.goldenUsed = true;
        if (text === 'visit-page') {
          const page = sanitizeStr(body.page, 30);
          if (page) await redis.sadd(`user:${jucator.toUpperCase()}:visited_pages`, page);
        }
        if (Object.keys(statUpdates).length > 0) await updateUserStats(jucator, statUpdates);
        const stats = await getUserStats(jucator);
        await checkAndAwardAchievements(jucator, stats);
        return NextResponse.json({ success: true });
      }

      // ── Profil & nickname ────────────────────────────────────────────────────

      case 'schimba-porecla': {
        const numeValidation = valideazaNume(newName);
        if (!numeValidation.valid) return NextResponse.json({ success: false, error: numeValidation.error }, { status: 400 });
        const nameRlIp = getClientIp(request);
        const nameRlKey = `ratelimit:name:${nameRlIp}`;
        const nameRl = await redis.set(nameRlKey, '1', 'EX', 5, 'NX');
        if (!nameRl) return NextResponse.json({ success: false, error: "Așteaptă puțin înainte de a schimba iar." }, { status: 429 });

        const newClean = newName.toUpperCase();
        const oldClean = oldName ? oldName.toUpperCase() : null;
        if (NUME_INTERZISE.includes(newClean)) return NextResponse.json({ success: false, error: "Acest nume este rezervat de sistem." }, { status: 400 });

        const isTaken = await redis.get(`nume_rezervat:${newClean}`);
        if (isTaken && isTaken !== oldClean) return NextResponse.json({ success: false, error: "Acest nume este deja luat de alt jucător!" }, { status: 409 });

        const hasTeams = oldClean && oldClean !== newClean && teamIds && teamIds.length > 0;
        const [globalScore, ...teamScores] = (oldClean && oldClean !== newClean)
          ? await Promise.all([
              redis.zscore('leaderboard_jucatori', oldClean),
              ...(hasTeams ? teamIds.map(tId => redis.zscore(`team:${tId}:membri`, oldClean)) : []),
            ])
          : [null];

        const pipeline = redis.pipeline();
        pipeline.set(`nume_rezervat:${newClean}`, "1", 'EX', 60 * 60 * 24 * 90);
        if (oldClean && oldClean !== newClean) {
          pipeline.del(`nume_rezervat:${oldClean}`);
          pipeline.zrem('leaderboard_jucatori', oldClean);
          if (globalScore !== null) pipeline.zadd('leaderboard_jucatori', parseFloat(globalScore), newClean);
          if (hasTeams) {
            teamIds.forEach((tId, i) => {
              pipeline.zrem(`team:${tId}:membri`, oldClean);
              pipeline.zadd(`team:${tId}:membri`, teamScores[i] !== null ? parseFloat(teamScores[i]) : 0, newClean);
            });
          }
        }
        await pipeline.exec();
        getClasamentJucatori().then(top => pusher.trigger('global', 'update-complet', { topJucatori: top })).catch(() => {});
        return NextResponse.json({ success: true });
      }

      // ── Teams ────────────────────────────────────────────────────────────────

      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false, error: "Lipsește ID" }, { status: 400 });
        const teamName = await redis.get(`team:${teamId}:nume`);
        if (!teamName) return NextResponse.json({ success: false, error: "Grup inexistent" }, { status: 404 });
        const TTL = 60 * 60 * 24 * 30;
        await Promise.all([
          redis.expire(`team:${teamId}:nume`, TTL),
          redis.expire(`team:${teamId}:stats`, TTL),
          redis.expire(`team:${teamId}:membri`, TTL),
        ]);
        const teamStats = await redis.hgetall(`team:${teamId}:stats`);
        if (jucator && jucator.length >= 3) {
          const cleanPlayer = jucator.toUpperCase();
          const exists = await redis.zscore(`team:${teamId}:membri`, cleanPlayer);
          if (exists === null) {
            await redis.zadd(`team:${teamId}:membri`, 0, cleanPlayer);
            await updateUserStats(cleanPlayer, { teamsJoined: 1 });
            pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() }).catch(() => {});
          }
        }
        const membriRaw = await redis.zrevrange(`team:${teamId}:membri`, 0, 14, 'WITHSCORES');
        const top = [];
        for (let i = 0; i < membriRaw.length; i += 2) {
          top.push({ member: membriRaw[i], score: parseInt(membriRaw[i + 1]) || 0 });
        }
        return NextResponse.json({ success: true, details: { id: teamId, nume: teamName, ...teamStats }, top });
      }

      case 'creeaza-echipa': {
        if (!creator || creator.length < 3) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const teamRlKey = `ratelimit:team:${creator.toUpperCase()}`;
        const teamRl = await redis.set(teamRlKey, '1', 'EX', 10, 'NX');
        if (!teamRl) return NextResponse.json({ success: false, error: "Așteaptă puțin înainte de a crea alt grup." }, { status: 429 });
        const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const cleanCreator = creator.toUpperCase();
        const TEAM_TTL = 60 * 60 * 24 * 30;
        const pipeline = redis.pipeline();
        pipeline.set(`team:${newId}:nume`, `GRUPUL LUI ${cleanCreator}`);
        pipeline.expire(`team:${newId}:nume`, TEAM_TTL);
        pipeline.hset(`team:${newId}:stats`, { creator: cleanCreator, victorii: 0, creat_la: Date.now() });
        pipeline.expire(`team:${newId}:stats`, TEAM_TTL);
        pipeline.zadd(`team:${newId}:membri`, 0, cleanCreator);
        pipeline.expire(`team:${newId}:membri`, TEAM_TTL);
        await pipeline.exec();
        return NextResponse.json({ success: true, teamId: newId });
      }

      case 'redenumeste-echipa': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        if (!teamId || !newName || newName.length < 3) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        if (esteNumeInterzis(newName)) return NextResponse.json({ success: false, error: "Numele conține cuvinte nepotrivite." }, { status: 400 });
        const renameTeamStats = await redis.hgetall(`team:${teamId}:stats`);
        if (renameTeamStats.creator && jucator && renameTeamStats.creator !== jucator.toUpperCase()) {
          return NextResponse.json({ success: false, error: "Doar creatorul poate redenumi grupul." }, { status: 403 });
        }
        await redis.set(`team:${teamId}:nume`, newName.toUpperCase().slice(0, 50));
        return NextResponse.json({ success: true });
      }

      case 'kick-member': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        const memberToKick = sanitizeStr(body.member, 30);
        if (!teamId || !memberToKick) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const kickTeamStats = await redis.hgetall(`team:${teamId}:stats`);
        if (!kickTeamStats.creator || !jucator || kickTeamStats.creator !== jucator.toUpperCase()) {
          return NextResponse.json({ success: false, error: "Doar creatorul poate elimina membri." }, { status: 403 });
        }
        await redis.zrem(`team:${teamId}:membri`, memberToKick.toUpperCase());
        pusher.trigger(`team-${teamId}`, 'team-update', { t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      // ── Provocare duel ───────────────────────────────────────────────────────

      case 'provocare-duel': {
        if (!oponentNume || !jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const duelRlKey = `ratelimit:duel:${jucator.toUpperCase()}`;
        const duelRl = await redis.set(duelRlKey, '1', 'EX', 5, 'NX');
        if (!duelRl) return NextResponse.json({ success: false, error: "Așteaptă puțin între provocări." }, { status: 429 });
        pusher.trigger(`user-notif-${oponentNume.toUpperCase()}`, 'duel-request', {
          deLa: jucator.toUpperCase(), roomId, teamId: teamId || null, t: Date.now()
        }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      // ── Arena matchmaking ────────────────────────────────────────────────────

      case 'arena-matchmaking': {
        const mmIp = getClientIp(request);
        const mmRlKey = `ratelimit:mm:${mmIp}`;
        const mmRl = await redis.set(mmRlKey, '1', 'EX', 3, 'NX');
        if (!mmRl) return NextResponse.json({ success: false, error: "Prea rapid!" }, { status: 429 });
        const now = Date.now();
        const newRoomId = `arena-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const luaScript = `
          redis.call('zremrangebyscore', KEYS[1], 0, ARGV[1])
          local waiting = redis.call('zpopmin', KEYS[1], 1)
          if waiting and #waiting >= 2 then
            local matchedRoom = waiting[1]
            local matchedScore = waiting[2]
            local playerCount = redis.call('scard', 'room:' .. matchedRoom .. ':players')
            if playerCount < 2 then
              return matchedRoom
            end
            redis.call('zadd', KEYS[1], matchedScore, matchedRoom)
          end
          redis.call('zadd', KEYS[1], ARGV[2], ARGV[3])
          return nil
        `;
        const result = await redis.eval(luaScript, 1, 'arena:queue', now - 12000, now, newRoomId);
        if (result) return NextResponse.json({ success: true, roomId: result, isHost: false });
        return NextResponse.json({ success: true, roomId: newRoomId, isHost: true });
      }

      case 'arena-cancel-matchmaking': {
        if (roomId) await redis.zrem('arena:queue', roomId);
        return NextResponse.json({ success: true });
      }

      case 'arena-heartbeat': {
        const visitorId = sanitizeId(body.visitorId);
        if (!visitorId) return NextResponse.json({ success: false, error: "Cerere invalidă" }, { status: 400 });
        const now = Date.now();
        const pipeline = redis.pipeline();
        pipeline.zadd('arena:online', now, visitorId);
        pipeline.zcard('arena:online');
        const results = await pipeline.exec();
        const isNew = results[0][1] === 1;
        const count = results[1][1];
        if (isNew) pusher.trigger('global', 'online-count', { online: count }).catch(() => {});
        return NextResponse.json({ success: true, online: count });
      }

      case 'arena-disconnect': {
        const visitorId = sanitizeId(body.visitorId);
        if (!visitorId) return NextResponse.json({ success: false, error: "Cerere invalidă" }, { status: 400 });
        const pipeline = redis.pipeline();
        pipeline.zrem('arena:online', visitorId);
        pipeline.zcard('arena:online');
        const results = await pipeline.exec();
        const count = results[1][1];
        pusher.trigger('global', 'online-count', { online: count }).catch(() => {});
        return NextResponse.json({ success: true, online: count });
      }

      // ── Admin ────────────────────────────────────────────────────────────────

      case 'reset-all': {
        const resetIp = getClientIp(request);
        const allowedIps = (process.env.ADMIN_IPS || '').split(',').map(s => s.trim()).filter(Boolean);
        if (allowedIps.length > 0 && !allowedIps.includes(resetIp)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        const secret = sanitizeStr(body.secret, 50);
        const secretBuf = Buffer.from(secret || '');
        const expectedBuf = Buffer.from(process.env.ADMIN_SECRET || '');
        if (secretBuf.length !== expectedBuf.length || !timingSafeEqual(secretBuf, expectedBuf)) {
          return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const confirmToken = sanitizeStr(body.confirmToken, 64);
        if (!confirmToken) {
          const token = Math.random().toString(36).substring(2, 18);
          await redis.setex('admin:reset-token', 30, token);
          return NextResponse.json({ success: true, step: 'confirm', confirmToken: token, message: 'Send this token back as confirmToken to proceed.' });
        }
        const storedToken = await redis.get('admin:reset-token');
        if (!storedToken || storedToken !== confirmToken) return NextResponse.json({ success: false, error: "Token invalid or expired. Start over." }, { status: 400 });
        await redis.del('admin:reset-token');
        const patterns = ['global_ciocniri_total', 'leaderboard_*', 'team:*', 'user:*', 'arena:*', 'room:*', 'nume_rezervat:*', 'ratelimit:*'];
        let deleted = 0;
        for (const pattern of patterns) {
          if (!pattern.includes('*')) { deleted += await redis.del(pattern); continue; }
          let cursor = '0';
          do {
            const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) { await redis.del(...keys); deleted += keys.length; }
          } while (cursor !== '0');
        }
        return NextResponse.json({ success: true, deleted });
      }

      default:
        return NextResponse.json({ success: false, error: "Acțiune necunoscută" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Eroare internă" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    api: "ciocnim.ro",
    version: "1.0",
    usage: "POST cu { actiune: '...' }"
  });
}
