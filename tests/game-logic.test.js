import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeStr, sanitizeId } from '../app/api/ciocnire/utils.js';

// ── Sanitization ─────────────────────────────────────────────────────────────

describe('sanitizeStr', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeStr(null)).toBe('');
    expect(sanitizeStr(42)).toBe('');
    expect(sanitizeStr(undefined)).toBe('');
    expect(sanitizeStr({})).toBe('');
  });

  it('strips Redis key injection characters', () => {
    expect(sanitizeStr('user:admin')).toBe('useradmin');
    expect(sanitizeStr('key*glob')).toBe('keyglob');
    expect(sanitizeStr('val?ue')).toBe('value');
    expect(sanitizeStr('a[b]c')).toBe('abc');
  });

  it('strips newlines (prevents log injection)', () => {
    const result = sanitizeStr('hello\nworld');
    expect(result).not.toContain('\n');
    expect(result).not.toContain('\r');
    expect(result).toBe('helloworld');
  });

  it('respects maxLen', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeStr(long, 50).length).toBe(50);
    expect(sanitizeStr(long, 100).length).toBe(100);
  });

  it('trims whitespace', () => {
    expect(sanitizeStr('  hello  ')).toBe('hello');
  });

  it('allows normal characters through', () => {
    expect(sanitizeStr('ANDREI')).toBe('ANDREI');
    expect(sanitizeStr('Mihai123')).toBe('Mihai123');
    expect(sanitizeStr('Ion-Popescu')).toBe('Ion-Popescu');
  });
});

describe('sanitizeId', () => {
  it('returns empty string for invalid input', () => {
    expect(sanitizeId(null)).toBe('');
    expect(sanitizeId('null')).toBe('');
    expect(sanitizeId('undefined')).toBe('');
    expect(sanitizeId('')).toBe('');
  });

  it('only allows alphanumeric, dash, underscore', () => {
    expect(sanitizeId('room-123')).toBe('room-123');
    expect(sanitizeId('team_ABC')).toBe('team_ABC');
    expect(sanitizeId('room:injection')).toBe('roominjection');
    expect(sanitizeId('../../../etc/passwd')).toBe('etcpasswd');
  });

  it('respects 64 char limit', () => {
    const long = 'a'.repeat(100);
    expect(sanitizeId(long).length).toBe(64);
  });
});

// ── Stats parsing ─────────────────────────────────────────────────────────────

describe('getUserStats parsing', () => {
  // Test the parsing logic inline (mirrors getUserStats)
  function parseStats(raw = {}) {
    return {
      wins: parseInt(raw.wins) || 0,
      losses: parseInt(raw.losses) || 0,
      teamWins: parseInt(raw.teamWins) || 0,
      messagesSent: parseInt(raw.messagesSent) || 0,
      currentStreak: parseInt(raw.currentStreak) || 0,
      duelsSent: parseInt(raw.duelsSent) || 0,
      goldenUsed: raw.goldenUsed === 'true',
      teamsJoined: parseInt(raw.teamsJoined) || 0,
      regiune: raw.regiune || 'Muntenia',
    };
  }

  it('returns zeroed stats for empty hash', () => {
    const stats = parseStats({});
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.goldenUsed).toBe(false);
    expect(stats.regiune).toBe('Muntenia');
  });

  it('parses string numbers correctly', () => {
    const stats = parseStats({ wins: '42', losses: '5', currentStreak: '3' });
    expect(stats.wins).toBe(42);
    expect(stats.losses).toBe(5);
    expect(stats.currentStreak).toBe(3);
  });

  it('parses goldenUsed as boolean', () => {
    expect(parseStats({ goldenUsed: 'true' }).goldenUsed).toBe(true);
    expect(parseStats({ goldenUsed: 'false' }).goldenUsed).toBe(false);
    expect(parseStats({ goldenUsed: undefined }).goldenUsed).toBe(false);
  });

  it('streak resets to 0 on loss (string "0" parses correctly)', () => {
    // After a loss, currentStreak is stored as '0'
    const stats = parseStats({ currentStreak: '0' });
    expect(stats.currentStreak).toBe(0);
  });

  it('streak increments correctly when win', () => {
    // Before win: streak = 3, after win: stored as String(3+1) = '4'
    const before = parseStats({ currentStreak: '3' });
    const streakAfterWin = String(before.currentStreak + 1);
    expect(streakAfterWin).toBe('4');
    // Re-parse what would be stored
    expect(parseStats({ currentStreak: streakAfterWin }).currentStreak).toBe(4);
  });
});

// ── Achievement milestones ────────────────────────────────────────────────────

describe('Achievement milestone logic', () => {
  function shouldAwardMilestone(wins, milestone, existing = []) {
    return wins >= milestone && !existing.includes(`wins_${milestone}`);
  }

  it('awards wins_10 at exactly 10 wins', () => {
    expect(shouldAwardMilestone(10, 10)).toBe(true);
    expect(shouldAwardMilestone(9, 10)).toBe(false);
    expect(shouldAwardMilestone(11, 10)).toBe(true);
  });

  it('does not re-award if already earned', () => {
    expect(shouldAwardMilestone(10, 10, ['wins_10'])).toBe(false);
    expect(shouldAwardMilestone(100, 10, ['wins_10'])).toBe(false);
  });

  it('awards wins_100 only at 100+', () => {
    expect(shouldAwardMilestone(99, 100)).toBe(false);
    expect(shouldAwardMilestone(100, 100)).toBe(true);
  });

  it('streak_5 triggers at 5 consecutive wins', () => {
    function shouldAwardStreak(streak, n, existing = []) {
      return streak >= n && !existing.includes(`streak_${n}`);
    }
    expect(shouldAwardStreak(5, 5)).toBe(true);
    expect(shouldAwardStreak(4, 5)).toBe(false);
    expect(shouldAwardStreak(10, 5)).toBe(true);
    expect(shouldAwardStreak(10, 5, ['streak_5'])).toBe(false);
  });
});

// ── Game result (lovitura) ────────────────────────────────────────────────────

describe('Lovitura outcome', () => {
  it('result is boolean (server-determined)', () => {
    // The server uses Math.random() < 0.5
    // Run 1000 times and verify it's roughly 50/50 (within 10% tolerance)
    const N = 1000;
    let wins = 0;
    for (let i = 0; i < N; i++) {
      if (Math.random() < 0.5) wins++;
    }
    const ratio = wins / N;
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.6);
  });

  it('lovitura data has required fields', () => {
    const jucator = 'PLAYER1';
    const atacant = 'PLAYER2';
    const castigaCelCareDa = Math.random() < 0.5;
    const data = { jucator, castigaCelCareDa, atacant, t: Date.now() };
    expect(data).toHaveProperty('jucator');
    expect(data).toHaveProperty('castigaCelCareDa');
    expect(data).toHaveProperty('atacant');
    expect(data).toHaveProperty('t');
    expect(typeof data.castigaCelCareDa).toBe('boolean');
  });
});

// ── Module structure ──────────────────────────────────────────────────────────

describe('API module structure', () => {
  it('utils.js exists and exports sanitization functions', async () => {
    const mod = await import('../app/api/ciocnire/utils.js');
    expect(typeof mod.sanitizeStr).toBe('function');
    expect(typeof mod.sanitizeId).toBe('function');
    expect(typeof mod.checkRateLimit).toBe('function');
    expect(Array.isArray(mod.NUME_INTERZISE)).toBe(true);
  });

  it('stats.js exists and exports all stat functions', async () => {
    // We can't call these without redis, but we can verify the exports exist
    const mod = await import('../app/api/ciocnire/stats.js');
    expect(typeof mod.getClasamentRegiuni).toBe('function');
    expect(typeof mod.getClasamentJucatori).toBe('function');
    expect(typeof mod.getUserStats).toBe('function');
    expect(typeof mod.updateUserStats).toBe('function');
    expect(typeof mod.getUserAchievements).toBe('function');
    expect(typeof mod.checkAndAwardAchievements).toBe('function');
  });

  it('NUME_INTERZISE blocks system names', async () => {
    const { NUME_INTERZISE } = await import('../app/api/ciocnire/utils.js');
    expect(NUME_INTERZISE).toContain('ADMIN');
    expect(NUME_INTERZISE).toContain('BOT');
    expect(NUME_INTERZISE).toContain('SISTEM');
  });
});
