import { describe, it, expect } from 'vitest';
import { getOrthodoxEaster, getNextEaster } from '../app/lib/easterUtils';

describe('getOrthodoxEaster', () => {
  it('returns known Easter dates correctly', () => {
    // Known Orthodox Easter dates
    const known = [
      [2024, new Date(2024, 4, 5)],   // 5 May 2024
      [2025, new Date(2025, 3, 20)],   // 20 April 2025
      [2026, new Date(2026, 3, 12)],   // 12 April 2026
      [2027, new Date(2027, 4, 2)],    // 2 May 2027
    ];
    for (const [year, expected] of known) {
      const result = getOrthodoxEaster(year);
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    }
  });
});

describe('getNextEaster', () => {
  it('returns a Date object', () => {
    const result = getNextEaster();
    expect(result).toBeInstanceOf(Date);
  });

  it('returns a date that is today or in the future', () => {
    const result = getNextEaster();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(result.getTime()).toBeGreaterThanOrEqual(today.getTime());
  });

  it('returns a date in March, April, or May (typical Easter range)', () => {
    const result = getNextEaster();
    const month = result.getMonth(); // 0-indexed
    // Orthodox Easter can be March (2), April (3), or May (4)
    expect(month).toBeGreaterThanOrEqual(2);
    expect(month).toBeLessThanOrEqual(4);
  });

  it('returns a Sunday', () => {
    const result = getNextEaster();
    expect(result.getDay()).toBe(0); // Sunday = 0
  });
});
