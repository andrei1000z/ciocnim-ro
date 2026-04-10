import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Configuration', () => {
  it('service worker exists', () => {
    expect(fs.existsSync(path.join(__dirname, '../public/sw.js'))).toBe(true);
  });

  it('service worker has cache versioning', () => {
    const sw = fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf-8');
    expect(sw).toContain('CACHE_VERSION');
    expect(sw).toContain('CACHE_NAME');
  });

  it('service worker has install handler', () => {
    const sw = fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf-8');
    expect(sw).toContain("self.addEventListener('install'");
  });

  it('service worker has activate handler for cache cleanup', () => {
    const sw = fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf-8');
    expect(sw).toContain("self.addEventListener('activate'");
  });

  it('service worker skips API requests', () => {
    const sw = fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf-8');
    expect(sw).toContain("/api/");
  });

  it('manifest has all required icons', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../public/manifest.json'), 'utf-8')
    );
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it('manifest has shortcuts', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../public/manifest.json'), 'utf-8')
    );
    expect(manifest.shortcuts).toBeInstanceOf(Array);
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Loading Screen', () => {
  const clientWrapper = fs.readFileSync(
    path.join(__dirname, '../app/components/ClientWrapper.js'), 'utf-8'
  );

  it('has timeout fallback', () => {
    expect(clientWrapper).toContain('setTimeout');
    expect(clientWrapper).toContain('timedOut');
  });

  it('has retry button', () => {
    expect(clientWrapper).toContain('window.location.reload()');
  });

  it('has error message', () => {
    expect(clientWrapper).toContain('aria-label="Error"');
  });
});

describe('Cookie Consent (GDPR)', () => {
  const clientWrapper = fs.readFileSync(
    path.join(__dirname, '../app/components/ClientWrapper.js'), 'utf-8'
  );

  it('has cookie banner component', () => {
    expect(clientWrapper).toContain('CookieBanner');
  });

  it('checks consent in localStorage', () => {
    expect(clientWrapper).toContain('c_cookie_consent');
  });

  it('links to privacy policy', () => {
    expect(clientWrapper).toContain('/privacy');
  });
});
