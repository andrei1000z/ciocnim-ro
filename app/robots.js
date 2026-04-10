import { headers } from 'next/headers';

export default async function robots() {
  const h = await headers();
  const host = h.get('host') || '';
  const isIntl = host.includes('trosc.fun');
  const baseUrl = isIntl ? 'https://trosc.fun' : 'https://ciocnim.ro';

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
