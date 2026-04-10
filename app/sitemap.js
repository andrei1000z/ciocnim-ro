import { headers } from 'next/headers';

const RO_DOMAIN = 'https://ciocnim.ro';
const INTL_DOMAIN = 'https://trosc.fun';

export default async function sitemap() {
  const h = await headers();
  const host = h.get('host') || '';
  const isIntl = host.includes('trosc.fun');

  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/traditii', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/urari', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/retete', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/clasament', priority: 0.9, changeFrequency: 'daily' },
    { path: '/vopsit-natural', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/ghid', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/despre', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/calendar', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const buildEntry = (locale, page, baseDomain) => ({
    url: `${baseDomain}/${locale}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: {
        'ro': `${RO_DOMAIN}/ro${page.path}`,
        'bg': `${INTL_DOMAIN}/bg${page.path}`,
        'el': `${INTL_DOMAIN}/el${page.path}`,
        'x-default': `${RO_DOMAIN}/ro${page.path}`,
      },
    },
  });

  if (isIntl) {
    // trosc.fun: doar BG + EL
    return ['bg', 'el'].flatMap(locale =>
      pages.map(page => buildEntry(locale, page, INTL_DOMAIN))
    );
  }

  // ciocnim.ro: doar RO
  return pages.map(page => buildEntry('ro', page, RO_DOMAIN));
}
