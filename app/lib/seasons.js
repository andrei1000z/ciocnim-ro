import { getOrthodoxEaster } from "./easterUtils";

// Determinist date formatter — hardcoded month names per locale.
// Evită inconsistențe ICU între Node (SSR) și browser (hydration).
const SHORT_MONTHS = {
  'ro-RO': ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  'bg-BG': ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'],
  'el-GR': ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
  'en-US': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

function formatShortDate(d, localeId) {
  const months = SHORT_MONTHS[localeId] || SHORT_MONTHS['en-US'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const I18N = {
  ro: {
    name: (year) => `Paște ${year}`,
    active: "Sezon Activ",
    startsOn: (date) => `Începe pe ${date}`,
    dateLocale: "ro-RO",
  },
  bg: {
    name: (year) => `Великден ${year}`,
    active: "Активен Сезон",
    startsOn: (date) => `Започва на ${date}`,
    dateLocale: "bg-BG",
  },
  el: {
    name: (year) => `Πάσχα ${year}`,
    active: "Ενεργή Σαιζόν",
    startsOn: (date) => `Ξεκινά στις ${date}`,
    dateLocale: "el-GR",
  },
  en: {
    name: (year) => `Easter ${year}`,
    active: "Active Season",
    startsOn: (date) => `Starts on ${date}`,
    dateLocale: "en-US",
  },
};

export function getCurrentSeason(locale = "ro") {
  const t = I18N[locale] || I18N.ro;
  const now = new Date();
  const year = now.getFullYear();
  const easter = getOrthodoxEaster(year);
  const easterEnd = new Date(easter);
  easterEnd.setDate(easterEnd.getDate() + 7);

  const seasonStart = new Date(easter);
  seasonStart.setDate(seasonStart.getDate() - 14);

  const isActive = now >= seasonStart && now <= easterEnd;

  // If season ended, show next year's season
  if (now > easterEnd) {
    const nextYear = year + 1;
    const nextEaster = getOrthodoxEaster(nextYear);
    const nextStart = new Date(nextEaster);
    nextStart.setDate(nextStart.getDate() - 14);

    const formatDate = (d) => formatShortDate(d, t.dateLocale);

    return {
      name: t.name(nextYear),
      year: nextYear,
      start: nextStart,
      end: new Date(nextEaster.getTime() + 7 * 86400000),
      easterDate: nextEaster,
      isActive: false,
      label: t.startsOn(formatDate(nextStart)),
    };
  }

  const formatDate = (d) =>
    d.toLocaleDateString(t.dateLocale, { day: "numeric", month: "short" });

  return {
    name: t.name(year),
    year,
    start: seasonStart,
    end: easterEnd,
    easterDate: easter,
    isActive,
    label: isActive ? t.active : t.startsOn(formatDate(seasonStart)),
  };
}
