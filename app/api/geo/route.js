import { NextResponse } from 'next/server';

/**
 * IP-based geolocation. Funcționează fără permisiuni browser.
 * Pe Vercel folosește headers x-vercel-ip-* (instant, fără cost).
 * Local sau fallback: ipapi.co server-side (no CORS, no CSP).
 */
export async function GET(request) {
  try {
    const h = request.headers;

    // 1) Vercel edge headers — gratis, instant, accurate
    const vercelCountry = h.get('x-vercel-ip-country') || '';
    const vercelRegion = h.get('x-vercel-ip-country-region') || '';
    const vercelCity = h.get('x-vercel-ip-city') || '';

    if (vercelRegion || vercelCity) {
      return NextResponse.json({
        success: true,
        source: 'vercel',
        country: vercelCountry,
        region: vercelRegion,
        city: decodeURIComponent(vercelCity || ''),
      });
    }

    // 2) Fallback: detectează IP-ul real al clientului
    const xff = h.get('x-forwarded-for') || '';
    const xri = h.get('x-real-ip') || '';
    const clientIp = xri || xff.split(',')[0].trim() || '';

    // 3) ipapi.co server-side — fără CORS issues
    const url = clientIp && clientIp !== '::1' && clientIp !== '127.0.0.1'
      ? `https://ipapi.co/${clientIp}/json/`
      : 'https://ipapi.co/json/';

    const res = await fetch(url, {
      headers: { 'User-Agent': 'ciocnim.ro/1.0' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('ipapi failed');
    const data = await res.json();

    return NextResponse.json({
      success: true,
      source: 'ipapi',
      country: data.country_code || '',
      region: data.region || '',
      city: data.city || '',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Nu s-a putut detecta locația' },
      { status: 500 }
    );
  }
}
