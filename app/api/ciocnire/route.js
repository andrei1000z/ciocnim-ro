import { NextResponse } from 'next/server';
import { timingSafeEqual, randomBytes } from 'crypto';
import redis from '@/app/lib/redis';
import { esteNumeInterzis, valideazaNume } from '@/app/lib/profanityFilter';
import pusher from './pusher';
import { sanitizeStr, sanitizeId, checkRateLimit, getClientIp, getNamespace, NUME_INTERZISE } from './utils';
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

    // Per-locale namespace (ro/bg/el/en — each fully isolated in Redis)
    const ns = getNamespace(request, body.locale);
    const k = (key) => `${ns}:${key}`;
    const ch = (channel) => `${ns}-${channel}`;

    // Rate limiting
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(ip, actiune, ns);
    if (!allowed) return NextResponse.json({ success: false, error: "Prea multe cereri. Așteaptă puțin." }, { status: 429 });

    switch (actiune) {

      // ── Leaderboard & counters ───────────────────────────────────────────────

      case 'get-counter': {
        const now = Date.now();
        const [totalCount, topRegiuni, topJucatori, , onlineCount] = await Promise.all([
          redis.get(k('global_ciocniri_total')),
          getClasamentRegiuni(ns),
          getClasamentJucatori(ns),
          redis.zremrangebyscore(k('arena:online'), 0, now - 300000),
          redis.zcard(k('arena:online')),
        ]);
        return NextResponse.json({ success: true, total: parseInt(totalCount) || 0, topRegiuni, topJucatori, online: onlineCount });
      }

      case 'increment-global': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        // Dedupe pentru counter-ul global se face mai jos prin counted:{roomId}:{battleTs}.
        // Per-user rate limit agresiv (2s) bloca rounduri rapide consecutive → eliminat.

        // Derive esteCastigator server-side from the lovitura stored in Redis
        let serverEsteCastigator = false;
        let battleTimestamp = null;
        const safeName = jucator ? jucator.toUpperCase() : null;
        if (safeName) {
          const lovituraRaw = await redis.get(k(`room:${roomId}:lovitura`));
          if (lovituraRaw) {
            try {
              const lovituraData = JSON.parse(lovituraRaw);
              const esteAtacant = lovituraData.atacant === safeName;
              serverEsteCastigator = esteAtacant ? lovituraData.castigaCelCareDa : !lovituraData.castigaCelCareDa;
              battleTimestamp = lovituraData.t;
            } catch {}
          }
        }

        // Dedupe global counter: doar primul client dintre cei 2 din camera
        // bump-uie `global_ciocniri_total`. Stats per-user (wins/losses) sunt
        // oricum per-user, deci nu au nevoie de dedupe.
        // IMPORTANT: dacă battleTimestamp lipsește (lovitura TTL expirat sau clear-round
        // deja șters), folosim fallback roomId-based ca să evităm double count.
        let shouldCountGlobal;
        if (battleTimestamp && roomId) {
          const dedupeKey = k(`counted:${roomId}:${battleTimestamp}`);
          const setResult = await redis.set(dedupeKey, '1', 'EX', 60, 'NX');
          shouldCountGlobal = setResult !== null;
        } else if (roomId) {
          // Fallback: folosim un counted marker per roomId care expiră rapid (5s).
          // Astfel dacă Alice + Bob trimit increment-global very close în timp
          // fără lovitura disponibilă, doar unul contează.
          const fallbackKey = k(`counted-fallback:${roomId}`);
          const setResult = await redis.set(fallbackKey, '1', 'EX', 5, 'NX');
          shouldCountGlobal = setResult !== null;
        } else {
          shouldCountGlobal = true;
        }

        const pipeline = redis.pipeline();
        if (shouldCountGlobal) pipeline.incr(k('global_ciocniri_total'));
        if (safeName && serverEsteCastigator) {
          pipeline.zincrby(k('leaderboard_jucatori'), 1, safeName);
          if (regiune && regiune !== "Alege regiunea...") pipeline.zincrby(k('leaderboard_regiuni'), 1, regiune);
          if (teamId) pipeline.zincrby(k(`team:${teamId}:membri`), 1, safeName);
        }
        // Cap leaderboard-uri: 100 jucători, 20 regiuni
        pipeline.zremrangebyrank(k('leaderboard_jucatori'), 0, -101);
        pipeline.zremrangebyrank(k('leaderboard_regiuni'), 0, -21);

        const [results, topActualizat, topJucatoriActualizat, currentStats] = await Promise.all([
          pipeline.exec(),
          getClasamentRegiuni(ns),
          getClasamentJucatori(ns),
          safeName ? getUserStats(ns, safeName) : Promise.resolve(null),
        ]);
        // Dacă am contorizat global (primul client), primul rezultat e incr-ul.
        // Altfel citim direct counter-ul (nu l-am incrementat, dar trebuie returnat).
        let noulTotal;
        if (shouldCountGlobal) {
          noulTotal = results[0][1];
        } else {
          noulTotal = parseInt(await redis.get(k('global_ciocniri_total'))) || 0;
        }

        // Throttle update-complet broadcast: max 1 fire per 3s globally.
        // La mii de battles concurrente asta previne Pusher fanout blow-up
        // (1000 subscribers × 1000 battles/min = 1M msgs/min fără throttle).
        // Clienții primesc update-uri cel puțin la 3s, suficient pentru UI.
        const throttleKey = k('pusher:update-complet:throttle');
        const canFireGlobal = await redis.set(throttleKey, '1', 'EX', 3, 'NX');
        if (canFireGlobal) {
          await pusher.trigger(ch('global'), 'update-complet', { total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat }).catch(() => {});
        }
        if (teamId) {
          // Team updates — throttle per team la max 1/2s
          const teamThrottleKey = k(`pusher:team-update:${teamId}:throttle`);
          const canFireTeam = await redis.set(teamThrottleKey, '1', 'EX', 2, 'NX');
          if (canFireTeam) {
            await pusher.trigger(ch(`team-${teamId}`), 'team-update', { t: Date.now() }).catch(() => {});
          }
        }

        if (safeName && currentStats) {
          const updates = serverEsteCastigator
            ? { wins: 1, currentStreak: String(parseInt(currentStats.currentStreak) + 1), ...(teamId ? { teamWins: 1 } : {}) }
            : { losses: 1, currentStreak: '0' };
          await updateUserStats(ns, safeName, updates);
          const newStats = serverEsteCastigator
            ? { ...currentStats, wins: currentStats.wins + 1, currentStreak: currentStats.currentStreak + 1, ...(teamId ? { teamWins: (currentStats.teamWins || 0) + 1 } : {}) }
            : { ...currentStats, losses: currentStats.losses + 1, currentStreak: 0 };
          checkAndAwardAchievements(ns, safeName, newStats, teamId).catch(() => {});
        }

        return NextResponse.json({ success: true, total: noulTotal, topRegiuni: topActualizat, topJucatori: topJucatoriActualizat });
      }

      // ── Room management ──────────────────────────────────────────────────────

      case 'join': {
        if (!jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const joinIp = getClientIp(request);
        const joinRlKey = k(`ratelimit:join:${joinIp}`);
        const joinCount = await redis.incr(joinRlKey);
        if (joinCount === 1) await redis.expire(joinRlKey, 60);
        // 60 joins/min per IP = o familie cu 10 devices care toate reîncarcă pagina
        // poate reintra în rooms fără să primească 429.
        if (joinCount > 60) return NextResponse.json({ success: false, error: "Prea rapid! Așteaptă puțin." }, { status: 429 });

        const cleanName = jucator.toUpperCase();
        let serverIsHost = false;
        const playerSetKey = k(`room:${roomId}:players`);
        const joinLua = `
local count = redis.call('SCARD', KEYS[1])
local exists = redis.call('SISMEMBER', KEYS[1], ARGV[1])
if count >= 2 and exists == 0 then
  return -1
end
redis.call('SADD', KEYS[1], ARGV[1])
redis.call('EXPIRE', KEYS[1], 7200)
return redis.call('SCARD', KEYS[1])
`;
        const joinResult = await redis.eval(joinLua, 1, playerSetKey, cleanName);
        if (joinResult === -1) {
          return NextResponse.json({ success: false, error: "Camera este ocupată!" }, { status: 409 });
        }
        await redis.setex(k(`room:${roomId}:skin:${cleanName}`), 7200, JSON.stringify({ skin, isGolden, hasStar, regiune }));

        if (roomId.startsWith('privat-')) {
          const hostToken = sanitizeStr(body.hostToken, 64);
          if (hostToken) {
            const roomData = await redis.get(k(`room:${roomId}`));
            if (roomData) {
              try { serverIsHost = JSON.parse(roomData).hostToken === hostToken; } catch {}
            }
          }
          if (!serverIsHost) {
            const members = await redis.smembers(playerSetKey);
            serverIsHost = members.length <= 1 || members[0] === cleanName;
          }
        }
        // AWAIT: fire-and-forget pe Vercel serverless = trigger pierdut. Așteptăm
        // finalizarea pentru a garanta livrarea instant către celălalt client.
        await pusher.trigger(ch(`arena-v22-${roomId}`), 'join', { jucator: cleanName, skin, isGolden, hasStar, regiune, isHost: serverIsHost, t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true, isHost: serverIsHost });
      }

      case 'check-room': {
        const cod = sanitizeId(body.cod);
        if (!cod || cod.length < 4 || cod.length > 6) return NextResponse.json({ success: false, error: "Cod invalid" }, { status: 400 });
        const [roomExists, count] = await Promise.all([
          redis.exists(k(`room:privat-${cod}`)),
          redis.scard(k(`room:privat-${cod}:players`)),
        ]);
        if (!roomExists && count === 0) return NextResponse.json({ success: false, error: "Camera nu există. Verifică codul." }, { status: 404 });
        if (count >= 2) return NextResponse.json({ success: false, error: "Camera este ocupată! Încearcă alt cod." }, { status: 409 });
        return NextResponse.json({ success: true });
      }

      case 'get-room-players': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        const players = await redis.smembers(k(`room:${roomId}:players`));
        const skinData = {};
        await Promise.all(players.map(async (p) => {
          const raw = await redis.get(k(`room:${roomId}:skin:${p}`));
          if (raw) { try { skinData[p] = JSON.parse(raw); } catch {} }
        }));
        return NextResponse.json({ success: true, players, skinData });
      }

      case 'get-room-lovitura': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        const raw = await redis.get(k(`room:${roomId}:lovitura`));
        if (!raw) return NextResponse.json({ success: true, lovitura: null });
        try { return NextResponse.json({ success: true, lovitura: JSON.parse(raw) }); }
        catch { return NextResponse.json({ success: true, lovitura: null }); }
      }

      case 'lovitura': {
        if (!jucator || !atacant || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const castigaCelCareDa = Math.random() < 0.5;
        const lovituraData = { jucator: jucator.toUpperCase(), castigaCelCareDa, atacant: atacant.toUpperCase(), t: Date.now() };
        redis.setex(k(`room:${roomId}:lovitura`), 120, JSON.stringify(lovituraData)).catch(() => {});
        await pusher.trigger(ch(`arena-v22-${roomId}`), 'lovitura', lovituraData).catch(() => {});
        return NextResponse.json({ success: true, castigaCelCareDa });
      }

      case 'arena-chat': {
        if (!text || !jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const chatRlKey = k(`ratelimit:chat:${jucator.toUpperCase()}`);
        const chatRl = await redis.set(chatRlKey, '1', 'EX', 1, 'NX');
        if (!chatRl) return NextResponse.json({ success: false, error: "Prea rapid!" }, { status: 429 });
        await pusher.trigger(ch(`arena-v22-${roomId}`), 'arena-chat', { jucator: jucator.toUpperCase(), text: text.trim().slice(0, 200), t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'revansa': {
        if (!jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        // SADD e idempotent, deci nu avem nevoie de rate limit agresiv.
        // Lăsăm global checkRateLimit (60 req/min per IP) să gestioneze spam-ul.
        const revClean = jucator.toUpperCase();
        await redis.sadd(k(`room:${roomId}:revansa`), revClean);
        await redis.expire(k(`room:${roomId}:revansa`), 300);
        const revCount = await redis.scard(k(`room:${roomId}:revansa`));
        const revTs = Date.now();
        // AWAIT pentru a garanta livrarea pe Vercel serverless.
        await pusher.trigger(ch(`arena-v22-${roomId}`), 'revansa', { jucator: revClean, t: revTs }).catch(() => {});
        if (revCount >= 2) {
          redis.del(k(`room:${roomId}:revansa`)).catch(() => {});
          redis.del(k(`room:${roomId}:lovitura`)).catch(() => {});
          // Server-side seed aleator — ambii clienti îl folosesc ca să decidă
          // cine atacă în noua rundă (altfel ar fi mereu același jucător).
          // seed: 0 = primul alfabetic atacă, 1 = al doilea atacă
          const attackerSeed = Math.random() < 0.5 ? 0 : 1;
          // Stocăm { t, seed } ca valoare JSON.
          const revokPayload = JSON.stringify({ t: revTs, seed: attackerSeed });
          redis.setex(k(`room:${roomId}:revansa-ok`), 120, revokPayload).catch(() => {});
          await pusher.trigger(ch(`arena-v22-${roomId}`), 'revansa-ok', { t: revTs, seed: attackerSeed }).catch(() => {});
          return NextResponse.json({ success: true, revansaOk: true, revansaOkAt: revTs, seed: attackerSeed });
        }
        return NextResponse.json({ success: true, revansaOk: false, count: revCount });
      }

      case 'clear-round': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        // NU ștergem revansa-ok aici — lăsăm TTL-ul de 120s. Clienții folosesc
        // timestamp comparison ca să nu reseteze multiplu.
        redis.del(k(`room:${roomId}:lovitura`), k(`room:${roomId}:revansa`)).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'revansa-ok': {
        if (!roomId || !jucator) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        redis.del(k(`room:${roomId}:revansa`), k(`room:${roomId}:lovitura`)).catch(() => {});
        const revOkTs = Date.now();
        redis.setex(k(`room:${roomId}:revansa-ok`), 120, String(revOkTs)).catch(() => {});
        await pusher.trigger(ch(`arena-v22-${roomId}`), 'revansa-ok', { jucator: jucator.toUpperCase(), t: revOkTs }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      case 'get-room-revansa': {
        if (!roomId) return NextResponse.json({ success: false, error: "Room lipsă" }, { status: 400 });
        const [revPlayers, revOkFlag] = await Promise.all([
          redis.smembers(k(`room:${roomId}:revansa`)),
          redis.get(k(`room:${roomId}:revansa-ok`)),
        ]);
        // NU mai ștergem flag-ul la read — lăsăm TTL 120s. Clienții filtrează
        // prin timestamp comparison ca să nu reseteze multiplu pentru același flag.
        // Valoarea poate fi JSON {t, seed} (nou) sau număr simplu (compat vechi).
        let revansaOkAt = 0, revansaOkSeed = 0;
        if (revOkFlag) {
          try {
            const parsed = JSON.parse(revOkFlag);
            revansaOkAt = parsed.t || 0;
            revansaOkSeed = parsed.seed || 0;
          } catch {
            // Fallback pentru valori legacy (doar timestamp string)
            revansaOkAt = parseInt(revOkFlag) || 0;
          }
        }
        return NextResponse.json({ success: true, players: revPlayers, revansaOk: !!revOkFlag, revansaOkAt, seed: revansaOkSeed });
      }

      case 'creeaza-camera-privata': {
        const createIp = getClientIp(request);
        const createRlKey = k(`ratelimit:create:${createIp}`);
        const createCount = await redis.incr(createRlKey);
        if (createCount === 1) await redis.expire(createRlKey, 60);
        if (createCount > 10) return NextResponse.json({ success: false, error: "Prea multe camere create. Așteaptă un minut." }, { status: 429 });
        const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let cod, attempts = 0;
        do {
          cod = '';
          for (let i = 0; i < 4; i++) cod += CHARS[Math.floor(Math.random() * CHARS.length)];
          attempts++;
        } while (attempts < 20 && await redis.exists(k(`room:privat-${cod}`)));
        const hostToken = randomBytes(16).toString('hex');
        await redis.setex(k(`room:privat-${cod}`), 7200, JSON.stringify({ status: 'waiting', t: Date.now(), hostToken }));
        return NextResponse.json({ success: true, cod, hostToken });
      }

      // ── User stats & achievements ────────────────────────────────────────────

      case 'get-achievements': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        const achievements = await getUserAchievements(ns, jucator);
        return NextResponse.json({ success: true, achievements });
      }

      case 'get-user-stats': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        const cleanPlayer = jucator.toUpperCase();
        const [stats, globalScore] = await Promise.all([
          getUserStats(ns, cleanPlayer),
          redis.zscore(k('leaderboard_jucatori'), cleanPlayer),
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
          if (page) await redis.sadd(k(`user:${jucator.toUpperCase()}:visited_pages`), page);
        }
        if (Object.keys(statUpdates).length > 0) await updateUserStats(ns, jucator, statUpdates);
        const stats = await getUserStats(ns, jucator);
        await checkAndAwardAchievements(ns, jucator, stats);
        return NextResponse.json({ success: true });
      }

      // ── Profil & nickname ────────────────────────────────────────────────────

      case 'schimba-porecla': {
        const numeValidation = valideazaNume(newName);
        if (!numeValidation.valid) return NextResponse.json({ success: false, error: numeValidation.error }, { status: 400 });
        const nameRlIp = getClientIp(request);
        const nameRlKey = k(`ratelimit:name:${nameRlIp}`);
        const nameRl = await redis.set(nameRlKey, '1', 'EX', 5, 'NX');
        if (!nameRl) return NextResponse.json({ success: false, error: "Așteaptă puțin înainte de a schimba iar." }, { status: 429 });

        const newClean = newName.toUpperCase();
        const oldClean = oldName ? oldName.toUpperCase() : null;
        if (NUME_INTERZISE.includes(newClean)) return NextResponse.json({ success: false, error: "Acest nume este rezervat de sistem." }, { status: 400 });

        // Atomic reserve: SET NX previne race între doi useri care încearcă același nume
        const nameKey = k(`nume_rezervat:${newClean}`);
        const NAME_TTL = 60 * 60 * 24 * 90;
        const reserved = await redis.set(nameKey, newClean, 'EX', NAME_TTL, 'NX');
        if (!reserved) {
          const owner = await redis.get(nameKey);
          const isOurs = owner === newClean || (owner && oldClean && owner === oldClean);
          if (!isOurs) {
            return NextResponse.json({ success: false, error: "Acest nume este deja luat de alt jucător!" }, { status: 409 });
          }
          // Self-rename sau legacy — refresh TTL + normalizează valoarea
          await redis.set(nameKey, newClean, 'EX', NAME_TTL);
        }

        const hasTeams = oldClean && oldClean !== newClean && teamIds && teamIds.length > 0;
        const [globalScore, ...teamScores] = (oldClean && oldClean !== newClean)
          ? await Promise.all([
              redis.zscore(k('leaderboard_jucatori'), oldClean),
              ...(hasTeams ? teamIds.map(tId => redis.zscore(k(`team:${tId}:membri`), oldClean)) : []),
            ])
          : [null];

        const pipeline = redis.pipeline();
        if (oldClean && oldClean !== newClean) {
          pipeline.del(k(`nume_rezervat:${oldClean}`));
          pipeline.zrem(k('leaderboard_jucatori'), oldClean);
          if (globalScore !== null) pipeline.zadd(k('leaderboard_jucatori'), parseFloat(globalScore), newClean);
          if (hasTeams) {
            teamIds.forEach((tId, i) => {
              pipeline.zrem(k(`team:${tId}:membri`), oldClean);
              pipeline.zadd(k(`team:${tId}:membri`), teamScores[i] !== null ? parseFloat(teamScores[i]) : 0, newClean);
            });
          }
        }
        await pipeline.exec();
        getClasamentJucatori(ns).then(top => pusher.trigger(ch('global'), 'update-complet', { topJucatori: top })).catch(() => {});
        return NextResponse.json({ success: true });
      }

      // ── Teams ────────────────────────────────────────────────────────────────

      case 'get-team-details': {
        if (!teamId) return NextResponse.json({ success: false, error: "Lipsește ID" }, { status: 400 });
        const teamName = await redis.get(k(`team:${teamId}:nume`));
        if (!teamName) return NextResponse.json({ success: false, error: "Grup inexistent" }, { status: 404 });
        const TTL = 60 * 60 * 24 * 30;
        await Promise.all([
          redis.expire(k(`team:${teamId}:nume`), TTL),
          redis.expire(k(`team:${teamId}:stats`), TTL),
          redis.expire(k(`team:${teamId}:membri`), TTL),
        ]);
        const teamStats = await redis.hgetall(k(`team:${teamId}:stats`));
        if (jucator && jucator.length >= 3) {
          const cleanPlayer = jucator.toUpperCase();
          const exists = await redis.zscore(k(`team:${teamId}:membri`), cleanPlayer);
          if (exists === null) {
            await redis.zadd(k(`team:${teamId}:membri`), 0, cleanPlayer);
            await updateUserStats(ns, cleanPlayer, { teamsJoined: 1 });
            pusher.trigger(ch(`team-${teamId}`), 'team-update', { t: Date.now() }).catch(() => {});
          }
        }
        const membriRaw = await redis.zrevrange(k(`team:${teamId}:membri`), 0, 14, 'WITHSCORES');
        const top = [];
        for (let i = 0; i < membriRaw.length; i += 2) {
          top.push({ member: membriRaw[i], score: parseInt(membriRaw[i + 1]) || 0 });
        }
        return NextResponse.json({ success: true, details: { id: teamId, nume: teamName, ...teamStats }, top });
      }

      case 'creeaza-echipa': {
        if (!creator || creator.length < 3) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const teamRlKey = k(`ratelimit:team:${creator.toUpperCase()}`);
        const teamRl = await redis.set(teamRlKey, '1', 'EX', 10, 'NX');
        if (!teamRl) return NextResponse.json({ success: false, error: "Așteaptă puțin înainte de a crea alt grup." }, { status: 429 });
        const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const cleanCreator = creator.toUpperCase();
        const TEAM_TTL = 60 * 60 * 24 * 30;
        const pipeline = redis.pipeline();
        pipeline.set(k(`team:${newId}:nume`), `GRUPUL LUI ${cleanCreator}`);
        pipeline.expire(k(`team:${newId}:nume`), TEAM_TTL);
        pipeline.hset(k(`team:${newId}:stats`), { creator: cleanCreator, victorii: 0, creat_la: Date.now() });
        pipeline.expire(k(`team:${newId}:stats`), TEAM_TTL);
        pipeline.zadd(k(`team:${newId}:membri`), 0, cleanCreator);
        pipeline.expire(k(`team:${newId}:membri`), TEAM_TTL);
        await pipeline.exec();
        return NextResponse.json({ success: true, teamId: newId });
      }

      case 'redenumeste-echipa': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        if (!teamId || !newName || newName.length < 3) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        if (esteNumeInterzis(newName)) return NextResponse.json({ success: false, error: "Numele conține cuvinte nepotrivite." }, { status: 400 });
        const renameTeamStats = await redis.hgetall(k(`team:${teamId}:stats`));
        if (renameTeamStats.creator && jucator && renameTeamStats.creator !== jucator.toUpperCase()) {
          return NextResponse.json({ success: false, error: "Doar creatorul poate redenumi grupul." }, { status: 403 });
        }
        await redis.set(k(`team:${teamId}:nume`), newName.toUpperCase().slice(0, 50));
        return NextResponse.json({ success: true });
      }

      case 'kick-member': {
        if (!jucator) return NextResponse.json({ success: false, error: "Jucător lipsă" }, { status: 400 });
        const memberToKick = sanitizeStr(body.member, 30);
        if (!teamId || !memberToKick) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const kickTeamStats = await redis.hgetall(k(`team:${teamId}:stats`));
        if (!kickTeamStats.creator || !jucator || kickTeamStats.creator !== jucator.toUpperCase()) {
          return NextResponse.json({ success: false, error: "Doar creatorul poate elimina membri." }, { status: 403 });
        }
        await redis.zrem(k(`team:${teamId}:membri`), memberToKick.toUpperCase());
        pusher.trigger(ch(`team-${teamId}`), 'team-update', { t: Date.now() }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      // ── Provocare duel ───────────────────────────────────────────────────────

      case 'provocare-duel': {
        if (!oponentNume || !jucator || !roomId) return NextResponse.json({ success: false, error: "Date incomplete" }, { status: 400 });
        const duelRlKey = k(`ratelimit:duel:${jucator.toUpperCase()}`);
        const duelRl = await redis.set(duelRlKey, '1', 'EX', 5, 'NX');
        if (!duelRl) return NextResponse.json({ success: false, error: "Așteaptă puțin între provocări." }, { status: 429 });
        pusher.trigger(ch(`user-notif-${oponentNume.toUpperCase()}`), 'duel-request', {
          deLa: jucator.toUpperCase(), roomId, teamId: teamId || null, t: Date.now()
        }).catch(() => {});
        return NextResponse.json({ success: true });
      }

      // ── Arena matchmaking ────────────────────────────────────────────────────

      case 'arena-matchmaking': {
        const mmIp = getClientIp(request);
        const mmRlKey = k(`ratelimit:mm:${mmIp}`);
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
            local playerCount = redis.call('scard', ARGV[4] .. ':room:' .. matchedRoom .. ':players')
            if playerCount < 2 then
              return matchedRoom
            end
            redis.call('zadd', KEYS[1], matchedScore, matchedRoom)
          end
          redis.call('zadd', KEYS[1], ARGV[2], ARGV[3])
          return nil
        `;
        const result = await redis.eval(luaScript, 1, k('arena:queue'), now - 12000, now, newRoomId, ns);
        if (result) return NextResponse.json({ success: true, roomId: result, isHost: false });
        return NextResponse.json({ success: true, roomId: newRoomId, isHost: true });
      }

      case 'arena-cancel-matchmaking': {
        if (roomId) await redis.zrem(k('arena:queue'), roomId);
        return NextResponse.json({ success: true });
      }

      case 'arena-heartbeat': {
        const visitorId = sanitizeId(body.visitorId);
        if (!visitorId) return NextResponse.json({ success: false, error: "Cerere invalidă" }, { status: 400 });
        const now = Date.now();
        const pipeline = redis.pipeline();
        pipeline.zadd(k('arena:online'), now, visitorId);
        pipeline.zcard(k('arena:online'));
        const results = await pipeline.exec();
        const isNew = results[0][1] === 1;
        const count = results[1][1];
        if (isNew) pusher.trigger(ch('global'), 'online-count', { online: count }).catch(() => {});
        return NextResponse.json({ success: true, online: count });
      }

      case 'arena-disconnect': {
        const visitorId = sanitizeId(body.visitorId);
        if (!visitorId) return NextResponse.json({ success: false, error: "Cerere invalidă" }, { status: 400 });
        const pipeline = redis.pipeline();
        pipeline.zrem(k('arena:online'), visitorId);
        pipeline.zcard(k('arena:online'));
        const results = await pipeline.exec();
        const count = results[1][1];
        pusher.trigger(ch('global'), 'online-count', { online: count }).catch(() => {});
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
          await redis.setex(k('admin:reset-token'), 30, token);
          return NextResponse.json({ success: true, step: 'confirm', confirmToken: token, message: 'Send this token back as confirmToken to proceed.' });
        }
        const storedToken = await redis.get(k('admin:reset-token'));
        if (!storedToken || storedToken !== confirmToken) return NextResponse.json({ success: false, error: "Token invalid or expired. Start over." }, { status: 400 });
        await redis.del(k('admin:reset-token'));
        const patterns = [k('global_ciocniri_total'), k('leaderboard_*'), k('team:*'), k('user:*'), k('arena:*'), k('room:*'), k('nume_rezervat:*'), k('ratelimit:*')];
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
