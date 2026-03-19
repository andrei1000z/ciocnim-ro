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

export function getNextEaster() {
  const now = new Date();
  let easter = getOrthodoxEaster(now.getFullYear());
  // If Easter already passed this year, calculate for next year
  const easterEnd = new Date(easter);
  easterEnd.setDate(easterEnd.getDate() + 1); // show "Hristos a Înviat" for the full day
  if (now > easterEnd) {
    easter = getOrthodoxEaster(now.getFullYear() + 1);
  }
  return easter;
}
