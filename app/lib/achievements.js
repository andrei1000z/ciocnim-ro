/**
 * Metadata care NU se schimbă per locale (icon + rarity).
 * Numele și descrierile sunt stocate în dicționare la cheia
 * `content.achievements.{key}.{name,desc}` și se îmbină la runtime
 * cu `getAchievements(dict)`.
 */
export const ACHIEVEMENTS_META = {
  'first_win':         { icon: '🏆', rarity: 'common' },
  'wins_10':           { icon: '🥉', rarity: 'common' },
  'wins_50':           { icon: '🥈', rarity: 'uncommon' },
  'wins_100':          { icon: '🥇', rarity: 'rare' },
  'wins_500':          { icon: '👑', rarity: 'epic' },
  'wins_1000':         { icon: '⚡', rarity: 'legendary' },
  'first_group':       { icon: '👥', rarity: 'common' },
  'group_wins_25':     { icon: '🛡️', rarity: 'uncommon' },
  'regional_champion': { icon: '🏅', rarity: 'rare' },
  'golden_egg':        { icon: '🥚', rarity: 'rare' },
  'chat_master':       { icon: '💬', rarity: 'uncommon' },
  'streak_5':          { icon: '🔥', rarity: 'uncommon' },
  'streak_10':         { icon: '🌟', rarity: 'rare' },
  'provocator':        { icon: '⚔️', rarity: 'uncommon' },
  'tradition_keeper':  { icon: '📚', rarity: 'rare' },
  'social_butterfly':  { icon: '🦋', rarity: 'uncommon' },
};

/**
 * Îmbină metadata (icon+rarity) cu traducerile per-locale din dict.
 * Returnează un obiect {key: {icon, rarity, name, desc}} identic cu
 * forma veche `ACHIEVEMENTS`, dar cu textele localizate.
 */
export function getAchievements(dict) {
  const t = dict?.content?.achievements || {};
  const out = {};
  for (const [key, meta] of Object.entries(ACHIEVEMENTS_META)) {
    out[key] = {
      ...meta,
      name: t[key]?.name || key,
      desc: t[key]?.desc || '',
    };
  }
  return out;
}

/**
 * Listă de chei (ordinea afișării în profil).
 */
export const ACHIEVEMENT_KEYS = Object.keys(ACHIEVEMENTS_META);
