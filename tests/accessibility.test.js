import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Accessibility', () => {
  const layoutContent = fs.readFileSync(path.join(__dirname, '../app/[locale]/layout.js'), 'utf-8');
  const homeContent = fs.readFileSync(path.join(__dirname, '../app/[locale]/page.js'), 'utf-8');
  const gameContent = fs.readFileSync(path.join(__dirname, '../app/[locale]/joc/[room]/page.js'), 'utf-8');
  const notFoundContent = fs.readFileSync(path.join(__dirname, '../app/[locale]/not-found.js'), 'utf-8');

  it('has lang attribute on html element', () => {
    expect(layoutContent).toContain('lang={validLocale}');
  });

  it('has skip-to-content link', () => {
    expect(layoutContent).toContain('skip-to-content');
    expect(layoutContent).toContain('#main-content');
  });

  it('has main landmark with id', () => {
    expect(layoutContent).toContain('id="main-content"');
  });

  it('has prefers-reduced-motion support', () => {
    const cssContent = fs.readFileSync(path.join(__dirname, '../app/globals.css'), 'utf-8');
    expect(cssContent).toContain('prefers-reduced-motion');
  });

  it('emoji decorative elements are properly marked aria-hidden', () => {
    // Decorative emoji should be aria-hidden, not have role="img" with localized aria-labels
    expect(homeContent).toContain('aria-hidden="true"');
  });

  it('has aria-labels on emoji elements in game page', () => {
    expect(gameContent).toContain('role="img"');
    expect(gameContent).toContain('aria-label');
  });

  it('has aria-label on mute button', () => {
    expect(gameContent).toContain('aria-label={isMuted');
  });

  it('404 page has emojis with aria-labels', () => {
    expect(notFoundContent).toContain('role="img"');
    expect(notFoundContent).toContain('aria-label');
  });

  it('has focus-visible styles', () => {
    const cssContent = fs.readFileSync(path.join(__dirname, '../app/globals.css'), 'utf-8');
    expect(cssContent).toContain('focus-visible');
  });
});
