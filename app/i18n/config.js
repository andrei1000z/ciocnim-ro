export const locales = ['ro', 'bg'];
export const defaultLocale = 'ro';

export const localeConfig = {
  ro: {
    name: 'Romana',
    flag: '\u{1F1F7}\u{1F1F4}',
    easterType: 'orthodox',
    defaultEggSkin: 'red',
    greetingWin: 'Hristos a Inviat!',
    greetingLose: 'Adevarat a Inviat!',
    defaultRegion: 'Muntenia',
    regions: [
      'Muntenia', 'Moldova', 'Transilvania', 'Oltenia', 'Banat',
      'Crisana', 'Maramures', 'Dobrogea', 'Bucuresti'
    ],
    leaderboardKey: 'RO',
    domain: 'trosc.gg/ro',
    ogLocale: 'ro_RO',
    currency: 'RON',
    gameName: 'Ciocnim',
    shareText: 'Hai la ciocnit oua de Paste! \u{1F95A}\u2694\uFE0F',
  },
  bg: {
    name: '\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438',
    flag: '\u{1F1E7}\u{1F1EC}',
    easterType: 'orthodox',
    defaultEggSkin: 'red',
    greetingWin: '\u0425\u0440\u0438\u0441\u0442\u043E\u0441 \u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435!',
    greetingLose: '\u0412\u043E\u0438\u0441\u0442\u0438\u043D\u0443 \u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435!',
    defaultRegion: '\u0421\u043E\u0444\u0438\u044F-\u0433\u0440\u0430\u0434',
    regions: [
      '\u0421\u043E\u0444\u0438\u044F-\u0433\u0440\u0430\u0434', '\u041F\u043B\u043E\u0432\u0434\u0438\u0432', '\u0412\u0430\u0440\u043D\u0430', '\u0411\u0443\u0440\u0433\u0430\u0441', '\u0421\u0442\u0430\u0440\u0430 \u0417\u0430\u0433\u043E\u0440\u0430',
      '\u0420\u0443\u0441\u0435', '\u041F\u043B\u0435\u0432\u0435\u043D', '\u0412\u0435\u043B\u0438\u043A\u043E \u0422\u044A\u0440\u043D\u043E\u0432\u043E', '\u0411\u043B\u0430\u0433\u043E\u0435\u0432\u0433\u0440\u0430\u0434', '\u0414\u043E\u0431\u0440\u0438\u0447',
      '\u0428\u0443\u043C\u0435\u043D', '\u0425\u0430\u0441\u043A\u043E\u0432\u043E', '\u0421\u043B\u0438\u0432\u0435\u043D', '\u042F\u043C\u0431\u043E\u043B', '\u041F\u0430\u0437\u0430\u0440\u0434\u0436\u0438\u043A',
      '\u041F\u0435\u0440\u043D\u0438\u043A', '\u0412\u0440\u0430\u0446\u0430', '\u0413\u0430\u0431\u0440\u043E\u0432\u043E', '\u041B\u043E\u0432\u0435\u0447', '\u041C\u043E\u043D\u0442\u0430\u043D\u0430',
      '\u0412\u0438\u0434\u0438\u043D', '\u041A\u044E\u0441\u0442\u0435\u043D\u0434\u0438\u043B', '\u041A\u044A\u0440\u0434\u0436\u0430\u043B\u0438', '\u0420\u0430\u0437\u0433\u0440\u0430\u0434', '\u0421\u0438\u043B\u0438\u0441\u0442\u0440\u0430',
      '\u0421\u043C\u043E\u043B\u044F\u043D', '\u0422\u044A\u0440\u0433\u043E\u0432\u0438\u0449\u0435'
    ],
    leaderboardKey: 'BG',
    domain: 'trosc.gg/bg',
    ogLocale: 'bg_BG',
    currency: 'BGN',
    gameName: '\u0422\u0440\u043E\u0441\u043D\u0438',
    shareText: '\u0425\u0430\u0439\u0434\u0435 \u043D\u0430 \u0431\u043E\u0440\u0431\u0430 \u0441 \u044F\u0439\u0446\u0430 \u0437\u0430 \u0412\u0435\u043B\u0438\u043A\u0434\u0435\u043D! \u{1F95A}\u2694\uFE0F',
  },
};

export function detectLocaleFromHeader(acceptLanguage) {
  if (!acceptLanguage) return defaultLocale;
  const langs = acceptLanguage.split(',').map(l => {
    const [lang, q] = l.trim().split(';q=');
    return { lang: lang.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
  }).sort((a, b) => b.q - a.q);

  for (const { lang } of langs) {
    if (locales.includes(lang)) return lang;
  }
  return defaultLocale;
}
