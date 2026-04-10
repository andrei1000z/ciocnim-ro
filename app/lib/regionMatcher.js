import { localeConfig, REGION_MAPPINGS } from "../i18n/config";

/**
 * Normalizează un string pentru comparație: lowercase, fără diacritice,
 * fără sufixe administrative (county/judet/nomos/etc), trim.
 */
export function normalizeRegion(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ (county|province|district|judet|judeţ|județ|nomos|nomós|prefecture|region|oblast)/gi, '')
    .replace(/-grad$/, '')
    .trim();
}

/**
 * Caută o regiune din lista locale-ului care se potrivește cu unul din candidați.
 * Folosește mapping-ul județ/oraș → regiune istorică, plus fallback match direct.
 *
 * @param {string} locale - 'ro' | 'bg' | 'el'
 * @param {...string} candidates - county, city, region, etc. de la API geolocation
 * @returns {string|null} numele exact al regiunii din localeConfig.regions sau null
 */
export function findRegionMatch(locale, ...candidates) {
  const regions = localeConfig[locale]?.regions || [];
  const mapping = REGION_MAPPINGS[locale] || {};

  const normalized = candidates
    .filter(Boolean)
    .map(normalizeRegion)
    .filter(Boolean);

  if (normalized.length === 0) return null;

  // 1) Mapping direct: județ/oraș → regiune istorică
  for (const c of normalized) {
    if (mapping[c]) return mapping[c];
  }

  // 2) Mapping cu compact (fără spații/cratime)
  for (const c of normalized) {
    const compact = c.replace(/[\s-]/g, '');
    for (const [k, v] of Object.entries(mapping)) {
      const kCompact = k.replace(/[\s-]/g, '');
      if (kCompact === compact) return v;
    }
  }

  // 3) Mapping cu match parțial pe granițe de cuvânt
  //    (sortat după lungime descrescătoare → match-urile mai lungi câștigă)
  const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);
  for (const c of normalized) {
    for (const k of sortedKeys) {
      // Match pe granițe de cuvânt: cheia trebuie să fie un cuvânt complet în input,
      // sau input-ul să fie un cuvânt complet în cheie
      const wordBoundary = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (wordBoundary.test(c)) return mapping[k];
      const reverseBoundary = new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (reverseBoundary.test(k)) return mapping[k];
    }
  }

  // 4) Match direct în lista regiunilor (pentru cazul în care API-ul întoarce
  //    direct regiunea istorică, ex: "Transilvania")
  for (const c of normalized) {
    const m = regions.find(r => {
      const rN = normalizeRegion(r);
      return c === rN || c.includes(rN) || rN.includes(c);
    });
    if (m) return m;
  }

  return null;
}
