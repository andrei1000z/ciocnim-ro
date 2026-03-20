import { describe, it, expect } from 'vitest';

// Test the sanitization helper functions directly
// These are defined inside route.js so we replicate them here for unit testing

function sanitizeStr(val, maxLen = 100) {
  if (typeof val !== 'string') return '';
  return val.slice(0, maxLen).trim();
}

function sanitizeId(val) {
  if (typeof val !== 'string' || val === 'null' || val === 'undefined') return '';
  const clean = val.slice(0, 64).replace(/[^a-zA-Z0-9\-_]/g, '');
  return clean || '';
}

describe('sanitizeStr', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeStr(null)).toBe('');
    expect(sanitizeStr(undefined)).toBe('');
    expect(sanitizeStr(123)).toBe('');
    expect(sanitizeStr({})).toBe('');
    expect(sanitizeStr([])).toBe('');
  });

  it('trims whitespace', () => {
    expect(sanitizeStr('  hello  ')).toBe('hello');
  });

  it('truncates to max length', () => {
    expect(sanitizeStr('abcdefghij', 5)).toBe('abcde');
  });

  it('truncates XSS attempts to max length', () => {
    const result = sanitizeStr('<script>alert("xss")</script>');
    // sanitizeStr only truncates/trims — actual XSS protection is at the template layer (React auto-escapes)
    expect(result.length).toBeLessThanOrEqual(100);
    expect(typeof result).toBe('string');
  });

  it('handles SQL injection attempts', () => {
    const result = sanitizeStr("'; DROP TABLE users; --");
    expect(result).toBe("'; DROP TABLE users; --");
    // sanitizeStr only truncates, actual protection is via parameterized queries
  });

  it('preserves normal Romanian text', () => {
    expect(sanitizeStr('Ștefan Băluță')).toBe('Ștefan Băluță');
  });
});

describe('sanitizeId', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeId(null)).toBe('');
    expect(sanitizeId(undefined)).toBe('');
    expect(sanitizeId(123)).toBe('');
  });

  it('returns empty for "null" and "undefined" strings', () => {
    expect(sanitizeId('null')).toBe('');
    expect(sanitizeId('undefined')).toBe('');
  });

  it('strips non-alphanumeric characters (except hyphens and underscores)', () => {
    expect(sanitizeId('abc-123_def')).toBe('abc-123_def');
    expect(sanitizeId('abc@123')).toBe('abc123');
    expect(sanitizeId('room<script>')).toBe('roomscript');
  });

  it('truncates to 64 characters', () => {
    const longId = 'a'.repeat(100);
    expect(sanitizeId(longId)).toBe('a'.repeat(64));
  });

  it('handles path traversal attempts', () => {
    expect(sanitizeId('../../../etc/passwd')).toBe('etcpasswd');
  });

  it('preserves valid room IDs', () => {
    expect(sanitizeId('privat-ABCD')).toBe('privat-ABCD');
    expect(sanitizeId('arena-X7K2M')).toBe('arena-X7K2M');
  });
});
