import { locales } from './i18n/config';

export default function sitemap() {
  const baseUrl = 'https://trosc.gg';
  const pages = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/traditii', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/urari', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/retete', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/clasament', changeFrequency: 'daily', priority: 0.9 },
    { path: '/vopsit-natural', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/ghid', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/despre', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/calendar', changeFrequency: 'yearly', priority: 0.7 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return locales.flatMap(locale =>
    pages.map(page => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}${page.path}`])
        ),
      },
    }))
  );
}
