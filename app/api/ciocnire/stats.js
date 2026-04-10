import redis from '@/app/lib/redis';
import pusher from './pusher';
import { ACHIEVEMENTS } from '@/app/lib/achievements';

export async function getClasamentRegiuni() {
  try {
    const raw = await redis.zrevrange('leaderboard_regiuni', 0, 19, 'WITHSCORES');
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ regiune: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch { return []; }
}

export async function getClasamentJucatori() {
  try {
    const raw = await redis.zrevrange('leaderboard_jucatori', 0, 9, 'WITHSCORES');
    const lista = [];
    for (let i = 0; i < raw.length; i += 2) {
      lista.push({ nume: raw[i], scor: parseInt(raw[i + 1]) || 0 });
    }
    return lista;
  } catch { return []; }
}

export async function getUserStats(jucator) {
  const stats = await redis.hgetall(`user:${jucator}:stats`);
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

export async function updateUserStats(jucator, updates) {
  const pipeline = redis.pipeline();
  for (const [field, value] of Object.entries(updates)) {
    if (typeof value === 'number') {
      pipeline.hincrby(`user:${jucator}:stats`, field, value);
    } else {
      pipeline.hset(`user:${jucator}:stats`, field, value);
    }
  }
  await pipeline.exec();
}

export async function getUserAchievements(jucator) {
  const earnedKeys = await redis.smembers(`user:${jucator}:achievements`);
  return earnedKeys.map(key => ({ key, ...ACHIEVEMENTS[key], earned: true }));
}

export async function checkAndAwardAchievements(jucator, stats, teamId = null) {
  const achievementsToAward = [];
  const userKey = `user:${jucator}:achievements`;
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
  //     const topInRegion = await redis.zrevrange('leaderboard_regiuni_jucatori:' + stats.regiune, 0, 0, 'WITHSCORES');
  //     if (topInRegion.length >= 2 && topInRegion[0] === jucator) achievementsToAward.push('regional_champion');
  //   } catch {}
  // }

  if (!existingAchievements.includes('tradition_keeper')) {
    const pages = await redis.smembers(`user:${jucator}:visited_pages`);
    const required = ['traditii', 'urari', 'retete', 'vopsit-natural', 'calendar'];
    if (required.every(p => pages.includes(p))) achievementsToAward.push('tradition_keeper');
  }

  if (!existingAchievements.includes('social_butterfly') && (parseInt(stats.teamsJoined) || 0) >= 10) {
    achievementsToAward.push('social_butterfly');
  }

  if (achievementsToAward.length > 0) {
    // SADD returns the number of newly added members (1 = new, 0 = already existed)
    // Only notify for truly new achievements to avoid race condition duplicates
    const newlyAwarded = [];
    for (const achKey of achievementsToAward) {
      const added = await redis.sadd(userKey, achKey);
      if (added === 1) newlyAwarded.push(achKey);
    }
    if (newlyAwarded.length > 0) {
      pusher.trigger(`user-notif-${jucator}`, 'achievement-unlocked', {
        achievements: newlyAwarded.map(key => ACHIEVEMENTS[key]),
        t: Date.now()
      }).catch(() => {});
    }
  }

  return achievementsToAward;
}
