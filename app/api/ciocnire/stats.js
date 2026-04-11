import redis from '@/app/lib/redis';
import pusher from './pusher';
import { ACHIEVEMENTS_META } from '@/app/lib/achievements';

export async function getClasamentRegiuni(ns) {
  try {
    const raw = await redis.zrevrange(`${ns}:leaderboard_regiuni`, 0, 19, 'WITHSCORES');
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ regiune: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch { return []; }
}

export async function getClasamentJucatori(ns) {
  try {
    const raw = await redis.zrevrange(`${ns}:leaderboard_jucatori`, 0, 9, 'WITHSCORES');
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ nume: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch { return []; }
}

export async function getUserStats(ns, jucator) {
  const stats = await redis.hgetall(`${ns}:user:${jucator}:stats`);
  return {
    wins: parseInt(stats.wins) || 0,
    losses: parseInt(stats.losses) || 0,
    teamWins: parseInt(stats.teamWins) || 0,
    messagesSent: parseInt(stats.messagesSent) || 0,
    currentStreak: parseInt(stats.currentStreak) || 0,
    duelsSent: parseInt(stats.duelsSent) || 0,
    goldenUsed: stats.goldenUsed === 'true',
    teamsJoined: parseInt(stats.teamsJoined) || 0,
    regiune: stats.regiune || 'Muntenia',
  };
}

export async function updateUserStats(ns, jucator, updates) {
  const pipeline = redis.pipeline();
  for (const [field, value] of Object.entries(updates)) {
    if (typeof value === 'number') {
      pipeline.hincrby(`${ns}:user:${jucator}:stats`, field, value);
    } else {
      pipeline.hset(`${ns}:user:${jucator}:stats`, field, value);
    }
  }
  await pipeline.exec();
}

export async function getUserAchievements(ns, jucator) {
  const earnedKeys = await redis.smembers(`${ns}:user:${jucator}:achievements`);
  // Returnăm doar metadata invariantă (icon+rarity) + key.
  // Numele/descrierea sunt localizate client-side prin dicționar.
  return earnedKeys.map(key => ({ key, ...ACHIEVEMENTS_META[key], earned: true }));
}

export async function checkAndAwardAchievements(ns, jucator, stats, teamId = null) {
  const achievementsToAward = [];
  const userKey = `${ns}:user:${jucator}:achievements`;
  const existingAchievements = await redis.smembers(userKey);

  if (stats.wins >= 1 && !existingAchievements.includes('first_win')) achievementsToAward.push('first_win');

  for (const milestone of [10, 50, 100, 500, 1000]) {
    const achKey = `wins_${milestone}`;
    if (stats.wins >= milestone && !existingAchievements.includes(achKey)) achievementsToAward.push(achKey);
  }

  if (teamId && !existingAchievements.includes('first_group')) achievementsToAward.push('first_group');

  if (teamId && stats.teamWins >= 25 && !existingAchievements.includes('group_wins_25')) achievementsToAward.push('group_wins_25');

  if (stats.goldenUsed && !existingAchievements.includes('golden_egg')) achievementsToAward.push('golden_egg');

  if (stats.messagesSent >= 100 && !existingAchievements.includes('chat_master')) achievementsToAward.push('chat_master');

  if (stats.currentStreak >= 5 && !existingAchievements.includes('streak_5')) achievementsToAward.push('streak_5');
  if (stats.currentStreak >= 10 && !existingAchievements.includes('streak_10')) achievementsToAward.push('streak_10');

  if (stats.duelsSent >= 50 && !existingAchievements.includes('provocator')) achievementsToAward.push('provocator');

  // TODO: regional_champion needs the regional per-player leaderboard (leaderboard_regiuni_jucatori:${region})
  // to be populated first. Re-enable once that leaderboard is implemented.
  // if (stats.regiune && !existingAchievements.includes('regional_champion')) {
  //   try {
  //     const topInRegion = await redis.zrevrange(`${ns}:leaderboard_regiuni_jucatori:` + stats.regiune, 0, 0, 'WITHSCORES');
  //     if (topInRegion.length >= 2 && topInRegion[0] === jucator) achievementsToAward.push('regional_champion');
  //   } catch {}
  // }

  if (!existingAchievements.includes('tradition_keeper')) {
    const pages = await redis.smembers(`${ns}:user:${jucator}:visited_pages`);
    const required = ['traditii', 'urari', 'retete', 'vopsit-natural', 'calendar'];
    if (required.every(p => pages.includes(p))) achievementsToAward.push('tradition_keeper');
  }

  if (!existingAchievements.includes('social_butterfly') && (parseInt(stats.teamsJoined) || 0) >= 10) {
    achievementsToAward.push('social_butterfly');
  }

  if (achievementsToAward.length > 0) {
    // Pipeline pentru SADD atomic + race-safe.
    // SADD returnează 1 dacă elementul e nou adăugat, 0 dacă exista deja.
    // Două cereri concurente nu pot ambele să adauge același element.
    const pipe = redis.pipeline();
    for (const achKey of achievementsToAward) {
      pipe.sadd(userKey, achKey);
    }
    const results = await pipe.exec();
    // results = [[null, 1], [null, 0], ...] — index 1 e count
    const newlyAwarded = achievementsToAward.filter((_, i) => {
      const r = results?.[i];
      return Array.isArray(r) ? r[1] === 1 : r === 1;
    });

    if (newlyAwarded.length > 0) {
      pusher.trigger(`${ns}-user-notif-${jucator}`, 'achievement-unlocked', {
        // Clientul traduce name/desc din dicționar folosind `key`.
        achievements: newlyAwarded.map(key => ({ key, ...ACHIEVEMENTS_META[key] })),
        t: Date.now()
      }).catch(() => {});
    }
    return newlyAwarded;
  }

  return [];
}
