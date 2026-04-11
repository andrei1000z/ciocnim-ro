import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SEO & Metadata', () => {
  const layoutContent = fs.readFileSync(path.join(__dirname, '../app/[locale]/layout.js'), 'utf-8');

  it('has lang attribute on html element', () => {
    expect(layoutContent).toContain('lang={validLocale}');
  });

  it('page title uses i18n dictionary', () => {
    expect(layoutContent).toContain('dict.meta.title');
  });

  it('has meta description', () => {
    expect(layoutContent).toContain('description:');
  });

  it('has Open Graph tags', () => {
    expect(layoutContent).toContain('openGraph:');
    expect(layoutContent).toContain('og-image.jpg');
  });

  it('has Twitter card tags', () => {
    expect(layoutContent).toContain('twitter:');
  });

  it('has manifest link', () => {
    expect(layoutContent).toContain('manifest');
  });

  it('has favicon configuration', () => {
    expect(layoutContent).toContain('icons:');
  });

  it('has schema.org markup', () => {
    expect(layoutContent).toContain('schema.org');
    expect(layoutContent).toContain('WebApplication');
  });
});

describe('robots.js', () => {
  const robotsContent = fs.readFileSync(path.join(__dirname, '../app/robots.js'), 'utf-8');

  it('allows root path', () => {
    expect(robotsContent).toContain("allow: '/'");
  });

  it('disallows API routes', () => {
    expect(robotsContent).toContain('/api/');
  });

  it('disallows game rooms', () => {
    expect(robotsContent).toContain('/joc/');
  });

  it('includes sitemap URL', () => {
    expect(robotsContent).toContain('sitemap.xml');
  });
});

describe('sitemap.js', () => {
  const sitemapContent = fs.readFileSync(path.join(__dirname, '../app/sitemap.js'), 'utf-8');

  it('includes main pages', () => {
    expect(sitemapContent).toContain('traditii');
    expect(sitemapContent).toContain('retete');
    expect(sitemapContent).toContain('urari');
    expect(sitemapContent).toContain('calendar');
    expect(sitemapContent).toContain('vopsit-natural');
  });

  it('is host-aware (dual domain support)', () => {
    expect(sitemapContent).toContain('headers');
    expect(sitemapContent).toContain('trosc.fun');
    expect(sitemapContent).toContain('ciocnim.ro');
  });

  it('includes legal pages', () => {
    expect(sitemapContent).toContain('privacy');
    expect(sitemapContent).toContain('terms');
  });

  it('uses localizeSlug for localized URLs', () => {
    expect(sitemapContent).toContain('localizeSlug');
  });

  it('does not include game room pages', () => {
    expect(sitemapContent).not.toContain('/joc/');
  });
});

describe('manifest.js (dynamic)', () => {
  const manifestContent = fs.readFileSync(path.join(__dirname, '../app/manifest.js'), 'utf-8');

  it('is host-aware (dual domain)', () => {
    expect(manifestContent).toContain('headers');
    expect(manifestContent).toContain('trosc.fun');
  });

  it('has required PWA fields for both domains', () => {
    expect(manifestContent).toContain('start_url');
    expect(manifestContent).toContain('/ro');
    expect(manifestContent).toContain('/bg');
    expect(manifestContent).toContain('display');
    expect(manifestContent).toContain('standalone');
  });

  it('has icons with correct sizes', () => {
    expect(manifestContent).toContain('180x180');
    expect(manifestContent).toContain('192x192');
    expect(manifestContent).toContain('512x512');
  });

  it('has theme and background colors', () => {
    expect(manifestContent).toContain('theme_color');
    expect(manifestContent).toContain('background_color');
  });
});
