import { headers } from 'next/headers';

export default async function robots() {
  const h = await headers();
  const host = h.get('host') || '';
  const isIntl = host.includes('trosc.fun');
  // Folosim domeniul www ca să NU avem redirect 308 pe sitemap
  // (Google prefera link-uri directe, fără hops)
  const baseUrl = isIntl ? 'https://www.trosc.fun' : 'https://www.ciocnim.ro';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/ro/joc/', '/bg/joc/', '/el/joc/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
