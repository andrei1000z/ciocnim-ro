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
    expect(sitemapContent).toContain('baseUrl');
    expect(sitemapContent).toContain('/traditii');
    expect(sitemapContent).toContain('/retete');
    expect(sitemapContent).toContain('/urari');
    expect(sitemapContent).toContain('/calendar');
    expect(sitemapContent).toContain('/vopsit-natural');
  });

  it('includes legal pages', () => {
    expect(sitemapContent).toContain('/privacy');
    expect(sitemapContent).toContain('/terms');
  });

  it('does not include game room pages', () => {
    expect(sitemapContent).not.toContain('/joc/');
  });
});

describe('manifest.json', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/manifest.json'), 'utf-8')
  );

  it('has required PWA fields', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/ro');
    expect(manifest.display).toBe('standalone');
  });

  it('has icons with correct sizes', () => {
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    const sizes = manifest.icons.map(i => i.sizes);
    expect(sizes).toContain('180x180');
    expect(sizes).toContain('512x512');
  });

  it('has theme and background colors', () => {
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
  });
});
