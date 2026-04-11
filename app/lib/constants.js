// Folosim www ca să evităm redirect-ul 308 pe toate link-urile canonical/og/sitemap
const PRIMARY_DOMAIN_RO = 'https://www.ciocnim.ro';
const PRIMARY_DOMAIN_INTL = 'https://www.trosc.fun';

/**
 * Returnează URL-ul corect pe baza host-ului request-ului curent.
 * Apelabil DOAR din Server Components / generateMetadata.
 * Folosește dynamic import ca să nu rupă client components care
 * importă alte exports din acest fișier.
 */
export async function getBaseUrl() {
  const { headers } = await import('next/headers');
  const h = await headers();
  const host = h.get('host') || '';
  if (host.includes('trosc.fun')) return PRIMARY_DOMAIN_INTL;
  return PRIMARY_DOMAIN_RO;
}

/**
 * Returnează true dacă request-ul curent vine de pe domeniul intl (trosc.fun).
 */
export async function isIntlDomain() {
  const { headers } = await import('next/headers');
  const h = await headers();
  const host = h.get('host') || '';
  return host.includes('trosc.fun');
}

export const DOMAINS = {
  ro: PRIMARY_DOMAIN_RO,
  intl: PRIMARY_DOMAIN_INTL,
};

// Backwards compat — folosește getBaseUrl() unde e posibil
export const BASE_URL = PRIMARY_DOMAIN_RO;

/**
 * Helper client-side: returnează URL-ul corect pe baza locale-ului.
 * RO trăiește pe ciocnim.ro, BG/EL pe trosc.fun.
 */
export function getSiteUrl(locale) {
  return locale === 'bg' || locale === 'el' ? PRIMARY_DOMAIN_INTL : PRIMARY_DOMAIN_RO;
}
