import { NextResponse } from 'next/server';
import { locales, canonicalizeSlug, SLUG_MAP } from './app/i18n/config';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip: static files, API, _next
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-touch') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/og-') ||
    pathname.startsWith('/whatsapp') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|mp3|json|xml|txt|js|css)$/)
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get('host') || '';
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  const isTrosc = host.includes('trosc.fun');
  const isCiocnim = host.includes('ciocnim.ro');

  // ═══ HARD SPLIT: redirect 301 cross-domain ═══
  // Force RO content on ciocnim.ro
  if (isTrosc && firstSegment === 'ro') {
    const url = new URL(`https://www.ciocnim.ro${pathname.replace(/^\/ro/, '') || '/'}${request.nextUrl.search}`);
    return NextResponse.redirect(url, 301);
  }
  // Force international (bg/el/en) content on trosc.fun
  if (isCiocnim && (firstSegment === 'bg' || firstSegment === 'el' || firstSegment === 'en')) {
    const url = new URL(`https://www.trosc.fun${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url, 301);
  }

  // ═══ CIOCNIM.RO: strip /ro prefix from URLs (mono-locale) ═══
  // Canonical URL has no locale prefix. User-typed /ro/traditii → 301 to /traditii.
  if (isCiocnim && firstSegment === 'ro') {
    const strippedPath = pathname.replace(/^\/ro/, '') || '/';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = strippedPath;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Skip if path already has a valid locale (bg/el/en on trosc.fun)
  if (locales.includes(firstSegment)) {
    // Pentru BG/EL/EN: dacă slug-ul e localizat, rewrite intern la slug canonic
    // ca folder structure app/[locale]/traditii/ să se potrivească.
    if ((firstSegment === 'bg' || firstSegment === 'el' || firstSegment === 'en') && segments[2]) {
      const localizedSlug = segments[2];
      const canonicalSlug = canonicalizeSlug(localizedSlug, firstSegment);
      if (canonicalSlug !== localizedSlug) {
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = `/${firstSegment}/${canonicalSlug}${segments.slice(3).map(s => '/' + s).join('')}`;
        return NextResponse.rewrite(rewriteUrl);
      }
      if (SLUG_MAP[firstSegment] && SLUG_MAP[firstSegment][localizedSlug] && SLUG_MAP[firstSegment][localizedSlug] !== localizedSlug) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${firstSegment}/${SLUG_MAP[firstSegment][localizedSlug]}${segments.slice(3).map(s => '/' + s).join('')}`;
        return NextResponse.redirect(redirectUrl, 301);
      }
    }
    return NextResponse.next();
  }

  // ═══ CIOCNIM.RO: rewrite /foo → /ro/foo se face acum la EDGE level prin
  // next.config.mjs rewrites (beforeFiles). Middleware nu mai adaugă header-ul
  // X-Nextjs-Rewritten-Path care pe iOS Safari declanșa CORS access-control.
  // Pentru ciocnim.ro fără locale, lăsăm Next.js să gestioneze via config rewrite.
  if (isCiocnim) {
    return NextResponse.next();
  }

  // ═══ TROSC.FUN: default /en dacă user ajunge la root fără locale ═══
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
