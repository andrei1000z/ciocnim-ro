import { getDictionary } from '../i18n/getDictionary';
import { getBaseUrl, DOMAINS } from './constants';
import { locales, localizeSlug } from '../i18n/config';

/**
 * Substituție simplă {var} → params[var] pentru string-uri din dict.
 */
function interp(value, params) {
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  }
  if (Array.isArray(value)) return value.map(v => interp(v, params));
  return value;
}

/**
 * Construiește obiectul `metadata` complet pentru o pagină de conținut,
 * folosind dicționarul activ + slug-urile localizate.
 *
 * @param {Object} opts
 * @param {string} opts.locale - locale curent (ro/bg/el)
 * @param {string} opts.slugKey - cheia canonică (ex: 'traditii', 'retete')
 * @param {string} opts.metaKey - cheia în `content.pageMeta` (default = slugKey)
 * @param {boolean} opts.noindex - dacă true, setează robots: noindex,nofollow
 * @param {string} opts.ogType - tipul OG (default 'article')
 * @param {Object} opts.vars - variabile de substituit în template-uri ({year} etc.)
 */
export async function buildPageMetadata({ locale, slugKey, metaKey, noindex = false, ogType = 'article', vars = {} }) {
  const dict = await getDictionary(locale);
  const baseUrl = await getBaseUrl();
  const key = metaKey || slugKey;
  const raw = dict?.content?.pageMeta?.[key] || {};
  const year = new Date().getFullYear();
  const params = {
    year,
    year1: year + 1,
    year2: year + 2,
    year3: year + 3,
    year4: year + 4,
    ...vars,
  };

  const title = interp(raw.title, params) || '';
  const description = interp(raw.description, params) || '';
  const keywords = interp(raw.keywords || [], params);
  const ogTitle = interp(raw.ogTitle, params) || title;
  const ogDescription = interp(raw.ogDescription, params) || description;
  const ogAlt = interp(raw.ogAlt, params) || title;
  const twitterTitle = interp(raw.twitterTitle, params) || title;
  const twitterDescription = interp(raw.twitterDescription, params) || description;

  const currentSlug = localizeSlug(slugKey, locale);
  // ro e mono-locale pe ciocnim.ro (URL fără /ro). bg/el/en au prefix /{locale}.
  const currentUrl = locale === 'ro' ? `${baseUrl}/${currentSlug}` : `${baseUrl}/${locale}/${currentSlug}`;

  const languages = {};
  for (const l of locales) {
    const domain = l === 'ro' ? DOMAINS.ro : DOMAINS.intl;
    const slugL = localizeSlug(slugKey, l);
    languages[l] = l === 'ro' ? `${domain}/${slugL}` : `${domain}/${l}/${slugL}`;
  }
  languages['x-default'] = `${DOMAINS.intl}/en/${localizeSlug(slugKey, 'en')}`;

  const metadata = {
    title: noindex ? { absolute: title } : title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: currentUrl,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: ogAlt }],
      type: ogType,
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: ['/og-image.jpg'],
    },
    alternates: {
      canonical: currentUrl,
      languages,
    },
  };

  if (noindex) metadata.robots = { index: false, follow: false };

  return metadata;
}

/**
 * Construiește breadcrumb JSON-LD pentru o pagină de conținut.
 */
export async function buildBreadcrumb({ locale, slugKey, metaKey }) {
  const dict = await getDictionary(locale);
  const baseUrl = await getBaseUrl();
  const key = metaKey || slugKey;
  const raw = dict?.content?.pageMeta?.[key] || {};
  const homeLabel = dict?.content?.pageMeta?.home || 'Home';
  const pageLabel = raw.breadcrumb || key;
  const currentSlug = localizeSlug(slugKey, locale);

  const homeUrl = locale === 'ro' ? baseUrl : `${baseUrl}/${locale}`;
  const pageUrl = locale === 'ro' ? `${baseUrl}/${currentSlug}` : `${baseUrl}/${locale}/${currentSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeLabel, item: homeUrl },
      { '@type': 'ListItem', position: 2, name: pageLabel, item: pageUrl },
    ],
  };
}
