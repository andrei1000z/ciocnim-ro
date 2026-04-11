import { headers } from 'next/headers';
import { localizeSlug } from './i18n/config';

// Folosim www ca să NU avem redirect 308 (Google preferă URL-uri canonice directe)
const RO_DOMAIN = 'https://www.ciocnim.ro';
const INTL_DOMAIN = 'https://www.trosc.fun';

// Ultima actualizare majoră — bump când faci modificări importante de conținut
const LAST_MODIFIED = new Date('2026-04-11');

export default async function sitemap() {
  const h = await headers();
  const host = h.get('host') || '';
  const isIntl = host.includes('trosc.fun');

  // canonicalSlug = numele folder-ului în app/[locale]/
  const pages = [
    { canonicalSlug: '', priority: 1.0, changeFrequency: 'daily' },
    { canonicalSlug: 'traditii', priority: 0.9, changeFrequency: 'monthly' },
    { canonicalSlug: 'urari', priority: 0.9, changeFrequency: 'monthly' },
    { canonicalSlug: 'retete', priority: 0.9, changeFrequency: 'monthly' },
    { canonicalSlug: 'clasament', priority: 0.9, changeFrequency: 'daily' },
    { canonicalSlug: 'vopsit-natural', priority: 0.8, changeFrequency: 'monthly' },
    { canonicalSlug: 'ghid', priority: 0.8, changeFrequency: 'monthly' },
    { canonicalSlug: 'despre', priority: 0.7, changeFrequency: 'monthly' },
    { canonicalSlug: 'calendar', priority: 0.7, changeFrequency: 'yearly' },
    { canonicalSlug: 'privacy', priority: 0.3, changeFrequency: 'yearly' },
    { canonicalSlug: 'terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const pathFor = (locale, canonicalSlug) => {
    if (!canonicalSlug) return '';
    return '/' + localizeSlug(canonicalSlug, locale);
  };

  const buildEntry = (locale, page, baseDomain) => ({
    url: `${baseDomain}/${locale}${pathFor(locale, page.canonicalSlug)}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: {
        'ro': `${RO_DOMAIN}/ro${pathFor('ro', page.canonicalSlug)}`,
        'bg': `${INTL_DOMAIN}/bg${pathFor('bg', page.canonicalSlug)}`,
        'el': `${INTL_DOMAIN}/el${pathFor('el', page.canonicalSlug)}`,
        'x-default': `${RO_DOMAIN}/ro${pathFor('ro', page.canonicalSlug)}`,
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
