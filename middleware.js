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

  // Skip if path already has a valid locale
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  if (locales.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Detect language from header
  const acceptLang = request.headers.get('accept-language') || '';
  const detected = detectLocaleFromHeader(acceptLang);

  // Redirect to locale-prefixed version
  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
