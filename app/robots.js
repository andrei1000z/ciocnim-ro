export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/ro/joc/', '/bg/joc/'],
      },
    ],
    sitemap: 'https://trosc.gg/sitemap.xml',
    host: 'https://trosc.gg',
  };
}
