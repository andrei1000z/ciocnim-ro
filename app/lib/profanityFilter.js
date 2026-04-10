/**
 * Shared profanity filter & username validation — used by both client (page.js) and server (route.js)
 */

const PROFANITY_LISTS = {
  ro: [
    'pula','pule','pulica','pulete','pulamea','pularie',
    'pizda','pizdi','pizdica',
    'muie','muist','muista',
    'sugi','sugipula','sugio',
    'fut','fute','futut','fututi','futuma',
    'coaie','coaiele',
    'cur','curu','curul',
    'morti','mortii',
    'cacat','labagiu',
  ],
  bg: [
    'путка','путки','пичка','пички',
    'мамка','майната',
    'педал','педераст',
    'курва','курви',
    'гъз','гъза',
    'копеле',
    'дебил',
    'шибан','шибана',
    'задник',
    'лайно','лайна',
  ],
  el: [
    'μαλάκα','γαμώ','πούτανα','σκατά','αρχίδι',
    'μουνί','γαμημένε','πούστη','κωλο','βλάκα',
  ],
};

// Combined list for backwards compatibility
export const CUVINTE_INTERZISE = PROFANITY_LISTS.ro;

export function normalizeForFilter(s) {
  return s.toLowerCase()
    .replace(/@/g, 'a').replace(/0/g, 'o').replace(/1/g, 'i')
    .replace(/7/g, 't').replace(/9/g, 'g')
    .replace(/[_\-\s\.]/g, '');
}

export function esteNumeInterzis(name, locale = 'ro') {
  const n = normalizeForFilter(name);
  const nv = n.replace(/v/g, 'u');
  const noo = nv.replace(/oo/g, 'u');
  // Check ALL language lists to prevent cross-language profanity bypass
  const allWords = Object.values(PROFANITY_LISTS).flat();
  return allWords.some(w => n.includes(w) || nv.includes(w) || noo.includes(w));
}

/**
 * Validates username: length 2-20, only safe characters, no profanity.
 * Returns { valid: boolean, error?: string }
 */
export function valideazaNume(name) {
  if (!name || typeof name !== 'string') return { valid: false, error: 'Numele este obligatoriu.' };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { valid: false, error: 'Minim 2 caractere.' };
  if (trimmed.length > 20) return { valid: false, error: 'Maxim 20 de caractere.' };
  // Allow letters (including diacritics), numbers, spaces, hyphens, underscores
  if (!/^[a-zA-ZÀ-ÿĂăÂâÎîȘșȚțА-Яа-яЁёЪъЬьΑ-Ωα-ωάέήίόύώϊϋΐΰ0-9 _-]+$/.test(trimmed)) {
    return { valid: false, error: 'Doar litere, cifre, spații și cratime.' };
  }
  if (esteNumeInterzis(trimmed)) return { valid: false, error: 'Ai chef de glume? Alege alt nume.' };
  return { valid: true };
}
