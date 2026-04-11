import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security Headers (next.config.mjs)', () => {
  const configContent = fs.readFileSync(path.join(__dirname, '../next.config.mjs'), 'utf-8');

  it('has X-Frame-Options: DENY', () => {
    expect(configContent).toContain('X-Frame-Options');
    expect(configContent).toContain('DENY');
  });

  it('has X-Content-Type-Options: nosniff', () => {
    expect(configContent).toContain('X-Content-Type-Options');
    expect(configContent).toContain('nosniff');
  });

  it('has Strict-Transport-Security', () => {
    expect(configContent).toContain('Strict-Transport-Security');
    expect(configContent).toContain('max-age=');
  });

  it('has Content-Security-Policy', () => {
    expect(configContent).toContain('Content-Security-Policy');
    expect(configContent).toContain("default-src 'self'");
    expect(configContent).toContain("frame-ancestors 'none'");
  });

  it('has Referrer-Policy', () => {
    expect(configContent).toContain('Referrer-Policy');
  });

  it('has Permissions-Policy', () => {
    expect(configContent).toContain('Permissions-Policy');
  });
});

describe('API Security (route.js)', () => {
  const routeContent = fs.readFileSync(path.join(__dirname, '../app/api/ciocnire/route.js'), 'utf-8');

  it('has input sanitization functions', () => {
    expect(routeContent).toContain('sanitizeStr');
    expect(routeContent).toContain('sanitizeId');
  });

  it('validates required fields before processing', () => {
    // Check various endpoints validate inputs
    expect(routeContent).toContain("if (!jucator || !roomId)");
    expect(routeContent).toContain("if (!text || !jucator || !roomId)");
  });

  it('has rate limiting on key endpoints', () => {
    // Count rate limiting keys
    const rateLimitMatches = routeContent.match(/ratelimit:/g);
    expect(rateLimitMatches.length).toBeGreaterThanOrEqual(5);
  });

  it('has rate limiting on join endpoint', () => {
    expect(routeContent).toContain('ratelimit:join:');
  });

  it('has rate limiting on room creation', () => {
    expect(routeContent).toContain('ratelimit:create:');
  });

  it('has rate limiting on chat', () => {
    expect(routeContent).toContain('ratelimit:chat:');
  });

  it('has rate limiting on name changes', () => {
    expect(routeContent).toContain('ratelimit:name:');
  });

  it('has rate limiting on matchmaking', () => {
    expect(routeContent).toContain('ratelimit:mm:');
  });

  it('has profanity filter', () => {
    expect(routeContent).toContain('profanityFilter');
    expect(routeContent).toContain('valideazaNume');
  });

  it('uses two-step confirmation for reset-all', () => {
    expect(routeContent).toContain('confirmToken');
    expect(routeContent).toContain('ADMIN_SECRET');
  });

  it('has server-side game result determination (50/50)', () => {
    expect(routeContent).toContain('Math.random() < 0.5');
  });
});

describe('Game room noindex', () => {
  const layoutContent = fs.readFileSync(
    path.join(__dirname, '../app/[locale]/joc/[room]/layout.js'), 'utf-8'
  );

  it('has robots noindex meta', () => {
    expect(layoutContent).toContain('index: false');
    expect(layoutContent).toContain('follow: false');
  });
});

describe('Privacy & Legal Pages', () => {
  it('privacy page exists', () => {
    const exists = fs.existsSync(path.join(__dirname, '../app/[locale]/privacy/page.js'));
    expect(exists).toBe(true);
  });

  it('terms page exists', () => {
    const exists = fs.existsSync(path.join(__dirname, '../app/[locale]/terms/page.js'));
    expect(exists).toBe(true);
  });

  it('privacy page mentions GDPR', () => {
    // Privacy content moved to i18n dictionaries
    const roDict = fs.readFileSync(path.join(__dirname, '../app/i18n/dictionaries/ro.json'), 'utf-8');
    expect(roDict).toContain('GDPR');
  });

  it('privacy page has contact email', () => {
    // Privacy content moved to i18n dictionaries
    const roDict = fs.readFileSync(path.join(__dirname, '../app/i18n/dictionaries/ro.json'), 'utf-8');
    expect(roDict).toContain('ciocnim@mail.com');
  });
});
