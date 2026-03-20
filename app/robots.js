export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/joc/', '/profil'],
      },
    ],
    sitemap: 'https://ciocnim.ro/sitemap.xml',
    host: 'https://ciocnim.ro',
  };
}
