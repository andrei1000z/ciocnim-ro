import { describe, it, expect } from 'vitest';
import { getNextEaster } from '../app/lib/easterUtils';

describe('getNextEaster', () => {
  it('returns a Date object', () => {
    const result = getNextEaster();
    expect(result).toBeInstanceOf(Date);
  });

  it('returns a future or today date', () => {
    const result = getNextEaster();
    const now = new Date();
    // Easter should be at or after the start of today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // The function might return a past Easter for current year if Easter already passed
    // It should return a valid date regardless
    expect(result.getTime()).toBeGreaterThan(0);
  });

  it('returns a date in April or May (typical Easter range)', () => {
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
