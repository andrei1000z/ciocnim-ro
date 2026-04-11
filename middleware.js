import { NextResponse } from 'next/server';
import { locales, defaultLocale, detectLocaleFromHeader, canonicalizeSlug, SLUG_MAP } from './app/i18n/config';

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
    // Pentru BG/EL: dacă slug-ul e localizat, rewrite intern la slug canonic
    // ca folder structure app/[locale]/traditii/ să se potrivească.
    // Ex: /bg/tradicii → rewrite intern → /bg/traditii
    //     /el/paradoseis → rewrite intern → /el/traditii
    if ((firstSegment === 'bg' || firstSegment === 'el') && segments[2]) {
      const localizedSlug = segments[2];
      const canonicalSlug = canonicalizeSlug(localizedSlug, firstSegment);
      // Dacă slug-ul era deja cel canonic (ex: /bg/traditii), lasă cum e
      if (canonicalSlug !== localizedSlug) {
        // Rewrite intern → serverul randerizează /bg/traditii dar URL-ul rămâne /bg/tradicii
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = `/${firstSegment}/${canonicalSlug}${segments.slice(3).map(s => '/' + s).join('')}`;
        return NextResponse.rewrite(rewriteUrl);
      }
      // Dacă userul tastează slug-ul canonic RO (ex: /bg/traditii), redirect 301 la slug-ul localizat
      // ca să avem un singur URL canonic per limbă (SEO)
      if (SLUG_MAP[firstSegment] && SLUG_MAP[firstSegment][localizedSlug] && SLUG_MAP[firstSegment][localizedSlug] !== localizedSlug) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/${firstSegment}/${SLUG_MAP[firstSegment][localizedSlug]}${segments.slice(3).map(s => '/' + s).join('')}`;
        return NextResponse.redirect(redirectUrl, 301);
      }
    }
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
