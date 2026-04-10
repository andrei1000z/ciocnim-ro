export const BASE_URL = 'https://ciocnim.ro';

export function getSiteUrl(locale) {
  return locale === 'bg' || locale === 'el' ? 'https://trosc.fun' : 'https://ciocnim.ro';
}
