import { NextResponse } from 'next/server';
import { locales, defaultLocale, detectLocaleFromHeader } from './app/i18n/config';

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

  // ═══ HARD SPLIT: redirect 301 cross-domain ═══
  // Force RO content on ciocnim.ro
  if (host.includes('trosc.fun') && firstSegment === 'ro') {
    const url = new URL(`https://www.ciocnim.ro${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url, 301);
  }
  // Force BG/EL content on trosc.fun
  if (host.includes('ciocnim.ro') && (firstSegment === 'bg' || firstSegment === 'el')) {
    const url = new URL(`https://www.trosc.fun${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url, 301);
  }

  // Skip if path already has a valid locale
  if (locales.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Domain-based locale: trosc.fun → bg/el, ciocnim.ro → ro
  let detected;

  if (host.includes('trosc.fun')) {
    // Pe trosc.fun: detectează BG sau EL din browser, default BG
    const acceptLang = request.headers.get('accept-language') || '';
    const browserLang = detectLocaleFromHeader(acceptLang);
    detected = (browserLang === 'el') ? 'el' : 'bg';
  } else {
    // Pe ciocnim.ro: detectează din browser, default RO
    const acceptLang = request.headers.get('accept-language') || '';
    detected = detectLocaleFromHeader(acceptLang);
  }

  // Redirect to locale-prefixed version
  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
