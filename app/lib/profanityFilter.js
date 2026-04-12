/**
 * Shared profanity filter & username validation — used by both client (page.js) and server (route.js)
 */

const PROFANITY_LISTS = {
  ro: [
    // organe genitale + derivate
    'pula','pule','pulica','pulete','pulamea','pularie','pulii','pulan',
    'pizda','pizdi','pizdica','pizdos','pizdoasa','pizdulica',
    'coaie','coaiele','coaiele','coaiemele',
    'cur','curu','curul','curva','curve','curvă','curvar',
    'bulan','bulangiu','bulangii',
    // acte sexuale + derivate
    'fut','fute','futut','fututi','futuma','futalau','futai','futere',
    'muie','muist','muista','muisti',
    'sugi','sugipula','sugio','sugeti',
    'laba','labagiu','labareala',
    'sex','sexi','sexos',
    // injurii
    'morti','mortii','mortiitai','mortilor',
    'cacat','cacatu','cacatosa',
    'rahat','rahatu',
    'pisat','pisatu','pisamas',
    'bou','boule','bovine',
    'prost','prosta','prostie','prostanac',
    'idiot','idiota','idiotule',
    'cretin','cretina','cretinu',
    'handicapat','handicapata',
    'retardat','retardata',
    'tampit','tampita','tampitule',
    'dobitoc','dobitoacă',
    'taran','taranca',
    'fraier','fraiera','fraiere',
    'nenorocit','nenorocita',
    'jigodie',
    'gunoi','gunoaie',
    'javra',
    'jeg','jegos','jegoasa',
    'mancatias','mancamias',
    'dumnezeu','dumnezeule', // nu profanity per se, dar spam-uit ca username
    'scarba','scarbos','scarboasa',
    'poponar','poponari',
    'zdreanta','zdreante',
    'tarfa','tarfe',
    'pitipoanca',
    'gaoaza','gaoz',
    'sugaci',
    'dracu','dracului','dracie',
    'plm','pnm','ptm','fmm','fmn','mmm',
    'kkt','kur','kla','k1ar',
    'penis','vagin','vagina',
    'hitler','nazi','fascist',
    'violat','violator',
    'pedofil','pedofila',
  ],
  bg: [
    'путка','путки','пичка','пички',
    'мамка','майната','мамкаму',
    'педал','педераст','педерас',
    'курва','курви',
    'гъз','гъза',
    'копеле','копелдак',
    'дебил','дебилен',
    'шибан','шибана','шибано',
    'задник',
    'лайно','лайна','лайнар',
    'боклук',
    'глупак','глупачка',
    'идиот','идиотка',
    'простак',
    'кретен','кретенка',
    'гад','гадина',
    'тъпак','тъпанар',
    'свиня',
    'хуй',
    'ебал','ебати','еба',
    'секс',
  ],
  el: [
    'μαλάκα','μαλάκας','μαλακία',
    'γαμώ','γαμήσου','γαμημένε','γαμημένη','γαμώτο',
    'πούτανα','πούτανες',
    'σκατά','σκατό',
    'αρχίδι','αρχίδια',
    'μουνί','μουνιά',
    'πούστη','πούστης',
    'κωλο','κώλος',
    'βλάκα','βλάκας',
    'ηλίθιος','ηλίθια',
    'καριόλα','καριόλης',
    'πορνη',
    'παπάρα','παπάρας',
    'χοντρή','χοντρός',
    'σεξ',
  ],
  en: [
    // core
    'fuck','fucker','fucking','fucked','fuckoff','fuckface','fucku',
    'shit','shitty','shithead','shitstain','bullshit',
    'bitch','bitches','bitchass',
    'cunt','cunts',
    'ass','asshole','arsehole','arse',
    'dick','dicks','dickhead','dickface',
    'cock','cocks','cocksucker',
    'pussy','pussies',
    // slurs
    'nigger','nigga','niggers','negro',
    'faggot','fag','fagg','fags',
    'retard','retarded','retards',
    'tranny','shemale',
    // sexual
    'whore','whores','slut','sluts','skank',
    'bastard','bastards',
    'motherfucker','motherfucking','mfer',
    'wanker','wanking','tosser',
    'twat','knob','bellend',
    'dildo','blowjob','handjob',
    'penis','vagina','anal','anus',
    // hate/violence
    'hitler','nazi','nazis','fascist',
    'rape','rapist',
    'pedo','pedophile',
    'kill','murder',
    'suicide',
    'terrorist',
    // common substitutions already caught by normalizer:
    // f*ck, sh1t, b1tch, etc.
    'stfu','gtfo','lmfao',
    'wtf','omfg',
    // mild but unwanted as username
    'damn','dammit',
    'crap','crappy',
    'suck','sucks','sucker',
    'stupid','dumb','dumbass','idiot',
    'loser',
    'ugly',
    'hoe','hoes',
    'thot',
  ],
};

// Combined list for backwards compatibility
export const CUVINTE_INTERZISE = PROFANITY_LISTS.ro;

export function normalizeForFilter(s) {
  return s.toLowerCase()
    .replace(/@/g, 'a').replace(/0/g, 'o').replace(/1/g, 'i')
    .replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's')
    .replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g')
    .replace(/\$/g, 's').replace(/!/g, 'i').replace(/\+/g, 't')
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
