/**
 * Shared profanity filter — used by both client (page.js) and server (route.js)
 */

export const CUVINTE_INTERZISE = [
  'pula','pule','pulica','pulete','pulamea','pularie',
  'pizda','pizdi','pizdica',
  'muie','muist','muista',
  'sugi','sugipula','sugio',
  'fut','fute','futut','fututi','futuma',
  'coaie','coaiele',
  'cur','curu','curul',
  'morti','mortii',
  'cacat','labagiu',
];

export function normalizeForFilter(s) {
  return s.toLowerCase()
    .replace(/@/g, 'a').replace(/0/g, 'o').replace(/1/g, 'i')
    .replace(/7/g, 't').replace(/9/g, 'g')
    .replace(/[_\-\s\.]/g, '');
}

export function esteNumeInterzis(name) {
  const n = normalizeForFilter(name);
  const nv = n.replace(/v/g, 'u');
  const noo = nv.replace(/oo/g, 'u');
  return CUVINTE_INTERZISE.some(w => n.includes(w) || nv.includes(w) || noo.includes(w));
}
