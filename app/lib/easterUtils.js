/**
 * Orthodox Easter date using the Meeus Julian algorithm
 */
export function getOrthodoxEaster(year) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3=March, 4=April (Julian)
  const day = ((d + e + 114) % 31) + 1;
  // Convert from Julian to Gregorian: add 13 days for 2000-2099
  const julian = new Date(year, month - 1, day);
  julian.setDate(julian.getDate() + 13);
  return julian;
}

/**
 * Catholic Easter date using the Computus (Gauss) algorithm
 */
export function getCatholicEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function getNextEaster() {
  return getNextEasterByType('orthodox');
}

export function getNextEasterByType(type = 'orthodox') {
  const now = new Date();
  const fn = type === 'orthodox' ? getOrthodoxEaster : getCatholicEaster;
  let easter = fn(now.getFullYear());
  const easterEnd = new Date(easter);
  easterEnd.setDate(easterEnd.getDate() + 1);
  if (now > easterEnd) {
    easter = fn(now.getFullYear() + 1);
  }
  return easter;
}
