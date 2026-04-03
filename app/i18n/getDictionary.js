const dictionaries = {
  ro: () => import('./dictionaries/ro.json').then(m => m.default),
  bg: () => import('./dictionaries/bg.json').then(m => m.default),
};

export async function getDictionary(locale) {
  const loader = dictionaries[locale] || dictionaries.ro;
  return loader();
}
