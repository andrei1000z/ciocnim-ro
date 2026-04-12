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
    // core + derivate
    'fuck','fucker','fucking','fucked','fuckoff','fuckface','fucku','fucks','fuckin',
    'shit','shitty','shithead','shitstain','bullshit','shits','shitter','dipshit',
    'bitch','bitches','bitchass','bitchy','sonofabitch',
    'cunt','cunts','cuntface',
    'ass','asshole','arsehole','arse','asshat','asswipe','fatass','dumbass','jackass','smartass',
    'dick','dicks','dickhead','dickface','dickwad','dickless',
    'cock','cocks','cocksucker','cockhead',
    'pussy','pussies','pussycat',
    // slurs
    'nigger','nigga','niggers','negro','nig',
    'faggot','fag','fagg','fags','faggy',
    'retard','retarded','retards','retardation',
    'tranny','shemale','ladyboy',
    'spic','spick','wetback','kike','chink','gook','jap','beaner',
    // sexual
    'whore','whores','slut','sluts','skank','skanky',
    'bastard','bastards',
    'motherfucker','motherfucking','mfer','mofo',
    'wanker','wanking','tosser','tossed',
    'twat','knob','bellend','knobhead',
    'dildo','blowjob','handjob','rimjob','cumshot','orgasm',
    'penis','vagina','anal','anus','ballsack','testicle','scrotum',
    'cum','cumming','jizz','sperm','spunk','semen',
    'boob','boobs','tits','titty','titties','nipple',
    'erection','boner','horny','porn','porno','pornstar',
    'hooker','prostitute','pimp','escort',
    // hate/violence
    'hitler','nazi','nazis','fascist','genocide','holocaust',
    'rape','rapist','raping',
    'pedo','pedophile','pedophilia','molest','molester',
    'kill','murder','murderer','homicide',
    'suicide','suicidal',
    'terrorist','terrorism','jihad',
    'racist','racism','sexist','sexism','bigot',
    'kkk','skinhead','neonazi',
    // abbreviations
    'stfu','gtfo','lmfao','lmao',
    'wtf','omfg','fml','smfh',
    // mild but unwanted as username
    'damn','dammit','goddamn',
    'crap','crappy',
    'suck','sucks','sucker','sucking',
    'stupid','dumb','dumbass','idiot','moron','imbecile',
    'loser','pathetic','worthless',
    'ugly','fugly',
    'hoe','hoes',
    'thot','incel','simp',
    'creep','creepy','pervert','perv',
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
